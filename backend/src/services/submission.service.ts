import mongoose, { Types } from "mongoose";

import type { ListQuery } from "../contracts/common";
import { postSubmissionSchemaFor, type UpdateViewsInput } from "../contracts/submission";
import { env } from "../config/env";
import { AppError } from "../lib/errors";
import { toSkipLimit, toSearchRegex, toPageResult } from "../lib/list";
import { CampaignModel } from "../models/campaign.model";
import { SubmissionModel } from "../models/submission.model";
import { UserModel } from "../models/user.model";
import { findBrandCampaign, invalidateLiveCampaigns } from "./campaign.service";
import { calculateEntitledPayout, calculatePayoutDue } from "./payout";
import { detectViewSpike } from "./spike";

const SUBMISSION_REFS = [
  { path: "campaign", select: "name platform" },
  { path: "creator", select: "name" },
];

export async function createSubmission(creatorId: string, campaignId: string, body: unknown) {
  const campaign = await CampaignModel.findById(campaignId);
  if (!campaign) {
    throw AppError.notFound("Campaign");
  }
  if (campaign.status !== "active" || campaign.spent >= campaign.budget) {
    throw AppError.conflict("This campaign is no longer accepting submissions");
  }

  const { postUrl } = postSubmissionSchemaFor(campaign.platform).parse(body);
  const alreadySubmitted = await SubmissionModel.exists({ postUrl });
  if (alreadySubmitted) {
    throw AppError.conflict("This post has already been submitted");
  }

  const submission = await mongoose.connection.transaction(async (session) => {
    const [created] = await SubmissionModel.create([{ campaign: campaign._id, creator: creatorId, postUrl }], {
      session,
    });
    await CampaignModel.updateOne({ _id: campaign._id }, { $inc: { submissionCount: 1 } }, { session });
    return created;
  });
  if (!submission) {
    throw new Error("Submission insert returned no document");
  }
  await invalidateLiveCampaigns();
  return submission.populate(SUBMISSION_REFS);
}

async function buildSubmissionSearchFilter(search: string | undefined) {
  if (!search) return {};
  const pattern = toSearchRegex(search);
  const [creatorIds, campaignIds] = await Promise.all([
    UserModel.find({ name: pattern }).distinct("_id"),
    CampaignModel.find({ name: pattern }).distinct("_id"),
  ]);
  return {
    $or: [{ postUrl: pattern }, { creator: { $in: creatorIds } }, { campaign: { $in: campaignIds } }],
  };
}

async function findSubmissionPage(scope: { creator: string } | { campaign: string }, query: ListQuery) {
  const filter = { ...scope, ...(await buildSubmissionSearchFilter(query.search)) };
  const { skip, limit } = toSkipLimit(query);
  const [submissions, total] = await Promise.all([
    SubmissionModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate(SUBMISSION_REFS),
    SubmissionModel.countDocuments(filter),
  ]);
  return toPageResult(submissions, total, query);
}

async function sumCreatorEarnings(creatorId: string): Promise<number> {
  const [result] = await SubmissionModel.aggregate<{ total: number }>([
    { $match: { creator: new Types.ObjectId(creatorId) } },
    { $group: { _id: null, total: { $sum: "$paidAmount" } } },
  ]);
  return result?.total ?? 0;
}

export async function listCreatorSubmissions(creatorId: string, query: ListQuery) {
  const [page, earnings] = await Promise.all([
    findSubmissionPage({ creator: creatorId }, query),
    sumCreatorEarnings(creatorId),
  ]);
  return { ...page, totalEarnings: earnings };
}

export async function listCampaignSubmissions(brandId: string, campaignId: string, query: ListQuery) {
  await findBrandCampaign(brandId, campaignId);
  return findSubmissionPage({ campaign: campaignId }, query);
}

export async function recordViewsAndPayout(submissionId: string, input: UpdateViewsInput) {
  const { submission, paidNow } = await mongoose.connection.transaction(
    async (session) => {
      const submission = await SubmissionModel.findById(submissionId).session(session);
      if (!submission) {
        throw AppError.notFound("Submission");
      }
      const campaign = await CampaignModel.findById(submission.campaign).session(session);
      if (!campaign) {
        throw AppError.notFound("Campaign");
      }

      const views = Math.max(submission.views, input.views);
      const entitled = calculateEntitledPayout(campaign.milestones, views);
      const pay = calculatePayoutDue({
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
          throw new Error(`Budget invariant violated for campaign ${campaign._id.toString()}`);
        }
      }

      const now = new Date();
      const spike = submission.flagged
        ? null
        : detectViewSpike(
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
      return { submission, paidNow: pay };
    },
    { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } },
  );

  if (paidNow > 0) {
    await invalidateLiveCampaigns();
  }
  await submission.populate(SUBMISSION_REFS);
  return { submission, paidNow };
}
