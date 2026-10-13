import { Types, type PipelineStage } from "mongoose";

import type { Platform } from "../contracts/common";
import { CampaignModel } from "../models/campaign.model";
import { SubmissionModel } from "../models/submission.model";
import { PARTICIPATION_TOTALS } from "./submission.service";

interface Participation {
  posts: number;
  views: number;
  earned: number;
}

const EMPTY_PARTICIPATION: Participation = { posts: 0, views: 0, earned: 0 };
const TOP_LIMIT = 5;

const CAMPAIGN_BREAKDOWN: PipelineStage.FacetPipelineStage[] = [
  { $group: { _id: "$campaign", ...PARTICIPATION_TOTALS } },
  { $sort: { earned: -1, views: -1 } },
  {
    $lookup: {
      from: "campaigns",
      localField: "_id",

      foreignField: "_id",
      as: "campaign",
      pipeline: [{ $project: { name: 1, platform: 1 } }],
    },
  },
  { $unwind: "$campaign" },
  { $project: { _id: 0, campaign: 1, posts: 1, views: 1, earned: 1 } },
];

const PLATFORM_BREAKDOWN: PipelineStage.FacetPipelineStage[] = [
  {
    $lookup: {
      from: "campaigns",
      localField: "campaign",
      foreignField: "_id",
      as: "campaignDoc",
      pipeline: [{ $project: { platform: 1 } }],
    },
  },
  { $unwind: "$campaignDoc" },
  { $group: { _id: "$campaignDoc.platform", ...PARTICIPATION_TOTALS } },
  { $sort: { earned: -1 } },
  { $project: { _id: 0, platform: "$_id", posts: 1, views: 1, earned: 1 } },
];

const EMPTY_PERFORMANCE = { ...EMPTY_PARTICIPATION, flagged: 0, creators: 0 };

const PERFORMANCE_TOTALS: PipelineStage.FacetPipelineStage[] = [
  {
    $group: {
      _id: null,
      ...PARTICIPATION_TOTALS,
      flagged: { $sum: { $cond: ["$flagged", 1, 0] } },
      creatorIds: { $addToSet: "$creator" },
    },
  },
  { $project: { _id: 0, posts: 1, views: 1, earned: 1, flagged: 1, creators: { $size: "$creatorIds" } } },
];

type Performance = Participation & { flagged: number; creators: number };

type CampaignBreakdown = Participation & {
  campaign: { _id: Types.ObjectId; name: string; platform: Platform };
};
type PlatformBreakdown = Participation & { platform: Platform };
type CreatorBreakdown = Participation & {
  creator: { _id: Types.ObjectId; name: string };
};

export async function getCreatorAnalytics(creatorId: string) {
  const creator = new Types.ObjectId(creatorId);
  const [summary] = await SubmissionModel.aggregate<{
    totals: (Participation & {
      entitled: number;
      flagged: number;
      campaigns: number;
    })[];
    byCampaign: CampaignBreakdown[];
    byPlatform: PlatformBreakdown[];
  }>([
    { $match: { creator } },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              ...PARTICIPATION_TOTALS,
              entitled: { $sum: "$entitledAmount" },
              flagged: { $sum: { $cond: ["$flagged", 1, 0] } },
              campaignIds: { $addToSet: "$campaign" },
            },
          },
          {
            $project: {
              _id: 0,
              posts: 1,
              views: 1,
              earned: 1,
              entitled: 1,
              flagged: 1,
              campaigns: { $size: "$campaignIds" },
            },
          },
        ],
        byCampaign: CAMPAIGN_BREAKDOWN,
        byPlatform: PLATFORM_BREAKDOWN,
      },
    },
  ]);

  const topPosts = await SubmissionModel.find({ creator })
    .sort({ views: -1 })
    .limit(TOP_LIMIT)
    .populate([
      { path: "campaign", select: "name platform" },
      { path: "creator", select: "name" },
    ]);

  return {
    totals: summary?.totals[0] ?? {
      ...EMPTY_PARTICIPATION,
      entitled: 0,
      flagged: 0,
      campaigns: 0,
    },
    byCampaign: summary?.byCampaign ?? [],
    byPlatform: summary?.byPlatform ?? [],
    topPosts,
  };
}

export async function getBrandAnalytics(brandId: string) {
  const brand = new Types.ObjectId(brandId);
  const [campaignTotals, campaignIds] = await Promise.all([
    CampaignModel.aggregate<{
      campaigns: number;
      activeCampaigns: number;
      budget: number;
    }>([
      { $match: { brand } },
      {
        $group: {
          _id: null,
          campaigns: { $sum: 1 },
          activeCampaigns: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          budget: { $sum: "$budget" },
        },
      },
      { $project: { _id: 0 } },
    ]),
    CampaignModel.find({ brand }).distinct("_id"),
  ]);

  const [summary] = await SubmissionModel.aggregate<{
    totals: Performance[];
    byCampaign: CampaignBreakdown[];
    byPlatform: PlatformBreakdown[];
    topCreators: CreatorBreakdown[];
  }>([
    { $match: { campaign: { $in: campaignIds } } },
    {
      $facet: {
        totals: PERFORMANCE_TOTALS,
        byCampaign: CAMPAIGN_BREAKDOWN,
        byPlatform: PLATFORM_BREAKDOWN,
        topCreators: [
          { $group: { _id: "$creator", ...PARTICIPATION_TOTALS } },
          { $sort: { earned: -1, views: -1 } },
          { $limit: TOP_LIMIT },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "creator",
              pipeline: [{ $project: { name: 1 } }],
            },
          },
          { $unwind: "$creator" },
          { $project: { _id: 0, creator: 1, posts: 1, views: 1, earned: 1 } },
        ],
      },
    },
  ]);

  return {
    totals: {
      ...(campaignTotals[0] ?? { campaigns: 0, activeCampaigns: 0, budget: 0 }),
      ...(summary?.totals[0] ?? EMPTY_PERFORMANCE),
    },
    byCampaign: summary?.byCampaign ?? [],
    byPlatform: summary?.byPlatform ?? [],
    topCreators: summary?.topCreators ?? [],
  };
}

export async function getCampaignPerformance(campaignId: string): Promise<Performance> {
  const [totals] = await SubmissionModel.aggregate<Performance>([
    { $match: { campaign: new Types.ObjectId(campaignId) } },
    ...PERFORMANCE_TOTALS,
  ]);
  return totals ?? EMPTY_PERFORMANCE;
}
