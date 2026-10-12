import mongoose from "mongoose";

import type {
  CreatorSubmissions,
  Submission,
  UpdateViewsInput,
  UpdateViewsResponse,
} from "../contracts/submission";
import { postSubmissionSchema } from "../contracts/submission";
import { env } from "../config/env";
import { AppError } from "../lib/errors";
import { CampaignModel } from "../models/campaign.model";
import { SubmissionModel, type SubmissionWithRefs } from "../models/submission.model";
import { getOwnedCampaign } from "./campaign.service";
import { entitledPayout, payoutDue } from "./payout";
import { detectSpike } from "./spike";

type SubmissionRefs = Pick<SubmissionWithRefs, "campaign" | "creator">;

const SUBMISSION_REFS = [
  { path: "campaign", select: "name platform" },
  { path: "creator", select: "name" },
];

export function toSubmission(submission: SubmissionWithRefs): Submission {
  return {
    id: submission._id.toString(),
    campaign: {
      id: submission.campaign._id.toString(),
      name: submission.campaign.name,
      platform: submission.campaign.platform,
    },
    creator: { id: submission.creator._id.toString(), name: submission.creator.name },
    postUrl: submission.postUrl,
    views: submission.views,
    entitledAmount: submission.entitledAmount,
    paidAmount: submission.paidAmount,
    flagged: submission.flagged,
    flagReason: submission.flagReason ?? null,
    viewsUpdatedAt: submission.viewsUpdatedAt?.toISOString() ?? null,
    createdAt: submission.createdAt.toISOString(),
  };
}

function findSubmissions(filter: { creator: string } | { campaign: string }) {
  return SubmissionModel.find(filter)
    .sort({ createdAt: -1 })
    .populate<SubmissionRefs>(SUBMISSION_REFS)
    .lean();
}

export async function findSubmissionWithRefs(id: string): Promise<SubmissionWithRefs> {
  const submission = await SubmissionModel.findById(id)
    .populate<SubmissionRefs>(SUBMISSION_REFS)
    .lean();
  if (!submission) {
    throw AppError.notFound("Submission");
  }
  return submission;
}

export async function createSubmission(
  creatorId: string,
  campaignId: string,
  body: unknown,
): Promise<Submission> {
  const campaign = await CampaignModel.findById(campaignId).lean();
  if (!campaign) {
    throw AppError.notFound("Campaign");
  }
  if (campaign.status !== "active" || campaign.spent >= campaign.budget) {
    throw AppError.conflict("This campaign is no longer accepting submissions");
  }

  const { postUrl } = postSubmissionSchema(campaign.platform).parse(body);
  if (await SubmissionModel.exists({ postUrl })) {
    throw AppError.conflict("This post has already been submitted");
  }

  const submission = await SubmissionModel.create({
    campaign: campaign._id,
    creator: creatorId,
    postUrl,
  });
  return toSubmission(await findSubmissionWithRefs(submission.id));
}

export async function listCreatorSubmissions(creatorId: string): Promise<CreatorSubmissions> {
  const submissions = (await findSubmissions({ creator: creatorId })).map(toSubmission);
  const totalEarnings = submissions.reduce((sum, submission) => sum + submission.paidAmount, 0);
  return { submissions, totalEarnings };
}

export async function listCampaignSubmissions(
  brandId: string,
  campaignId: string,
): Promise<Submission[]> {
  await getOwnedCampaign(brandId, campaignId);
  return (await findSubmissions({ campaign: campaignId })).map(toSubmission);
}

/**
 * Applies a new view count and pays out whatever the post is now owed.
 *
 * Runs in a snapshot transaction: two updates touching the same campaign or
 * submission hit a write conflict, and Mongoose retries the loser from a fresh
 * read. Combined with paying only `entitled - alreadyPaid`, concurrent or
 * repeated updates can neither overspend the budget nor pay twice.
 */
export async function updateViews(
  submissionId: string,
  input: UpdateViewsInput,
): Promise<UpdateViewsResponse> {
  const paidNow = await mongoose.connection.transaction(
    async (session) => {
      const submission = await SubmissionModel.findById(submissionId).session(session);
      if (!submission) {
        throw AppError.notFound("Submission");
      }
      const campaign = await CampaignModel.findById(submission.campaign).session(session);
      if (!campaign) {
        throw AppError.notFound("Campaign");
      }

      // Platform counts only grow; a lower number is a stale or out-of-order update.
      const views = Math.max(submission.views, input.views);
      const entitled = entitledPayout(campaign.milestones, views);
      const pay = payoutDue({
        entitled,
        alreadyPaid: submission.paidAmount,
        remainingBudget: campaign.status === "active" ? campaign.budget - campaign.spent : 0,
      });

      if (pay > 0) {
        const { modifiedCount } = await CampaignModel.updateOne(
          { _id: campaign._id, $expr: { $lte: [{ $add: ["$spent", pay] }, "$budget"] } },
          { $inc: { spent: pay } },
          { session },
        );
        if (modifiedCount !== 1) {
          throw new Error(`Budget invariant violated for campaign ${campaign.id}`);
        }
      }

      const now = new Date();
      // A flag stays until reviewed, so later organic updates don't clear it.
      const spike = submission.flagged
        ? null
        : detectSpike(
            {
              previousViews: submission.views,
              views,
              since: submission.viewsUpdatedAt ?? submission.createdAt,
              now,
            },
            { minDelta: env.SPIKE_MIN_DELTA, viewsPerHour: env.SPIKE_VIEWS_PER_HOUR },
          );

      submission.set({
        views,
        entitledAmount: entitled,
        paidAmount: submission.paidAmount + pay,
        viewsUpdatedAt: now,
        ...(spike && { flagged: true, flagReason: spike }),
      });
      await submission.save({ session });
      return pay;
    },
    { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } },
  );

  return { submission: toSubmission(await findSubmissionWithRefs(submissionId)), paidNow };
}
