import mongoose, { Types } from "mongoose";
import type { z } from "zod";

import {
  postSubmissionSchema,
  type submissionsQuerySchema,
  type UpdateViewsInput,
} from "../contracts/submission";
import { env } from "../config/env";
import { AppError } from "../lib/errors";
import { pageWindow, searchPattern, toPage } from "../lib/list";
import { CampaignModel } from "../models/campaign.model";
import { SubmissionModel } from "../models/submission.model";
import { UserModel } from "../models/user.model";
import { findOwnedCampaign, invalidateLiveCampaigns } from "./campaign.service";
import { entitledPayout, payoutDue } from "./payout";
import { detectSpike } from "./spike";

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

  const { postUrl } = postSubmissionSchema(campaign.platform).parse(body);
  const alreadySubmitted = await SubmissionModel.exists({ postUrl });
  if (alreadySubmitted) {
    throw AppError.conflict("This post has already been submitted");
  }

  const submission = await SubmissionModel.create({ campaign: campaign._id, creator: creatorId, postUrl });
  return submission.populate(SUBMISSION_REFS);
}

type SubmissionsQuery = z.output<typeof submissionsQuerySchema>;

/** Matches the post link, the creator's name or the campaign's name. */
async function searchFilter(search: string | undefined) {
  if (!search) return {};
  const pattern = searchPattern(search);
  const [creatorIds, campaignIds] = await Promise.all([
    UserModel.find({ name: pattern }).distinct("_id"),
    CampaignModel.find({ name: pattern }).distinct("_id"),
  ]);
  return {
    $or: [{ postUrl: pattern }, { creator: { $in: creatorIds } }, { campaign: { $in: campaignIds } }],
  };
}

async function listSubmissions(scope: { creator: string } | { campaign: string }, query: SubmissionsQuery) {
  const filter = { ...scope, ...(await searchFilter(query.search)) };
  const { skip, limit } = pageWindow(query);
  const [submissions, total] = await Promise.all([
    SubmissionModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate(SUBMISSION_REFS),
    SubmissionModel.countDocuments(filter),
  ]);
  return toPage(submissions, total, query);
}

async function totalEarnings(creatorId: string): Promise<number> {
  const [result] = await SubmissionModel.aggregate<{ total: number }>([
    { $match: { creator: new Types.ObjectId(creatorId) } },
    { $group: { _id: null, total: { $sum: "$paidAmount" } } },
  ]);
  return result?.total ?? 0;
}

export async function listCreatorSubmissions(creatorId: string, query: SubmissionsQuery) {
  const [page, earnings] = await Promise.all([
    listSubmissions({ creator: creatorId }, query),
    totalEarnings(creatorId),
  ]);
  return { ...page, totalEarnings: earnings };
}

export async function listCampaignSubmissions(brandId: string, campaignId: string, query: SubmissionsQuery) {
  await findOwnedCampaign(brandId, campaignId);
  return listSubmissions({ campaign: campaignId }, query);
}

/**
 * Applies a new view count and pays out whatever the post is now owed.
 *
 * Runs in a snapshot transaction: two updates touching the same campaign or
 * submission hit a write conflict, and Mongoose retries the loser from a fresh
 * read. Combined with paying only `entitled - alreadyPaid`, concurrent or
 * repeated updates can neither overspend the budget nor pay twice.
 */
export async function updateViews(submissionId: string, input: UpdateViewsInput) {
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

      // Platform counts only grow; a lower number is a stale or out-of-order update.
      const views = Math.max(submission.views, input.views);
      const entitled = entitledPayout(campaign.milestones, views);
      const pay = payoutDue({
        entitled,
        alreadyPaid: submission.paidAmount,
        // Paused or closed campaigns pay nothing. Views are still recorded, and
        // since payouts are entitlement minus paid, a resumed campaign catches up.
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
