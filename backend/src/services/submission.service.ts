import type { CreatorSubmissions, Submission } from "../contracts/submission";
import { postSubmissionSchema } from "../contracts/submission";
import { AppError } from "../lib/errors";
import { CampaignModel } from "../models/campaign.model";
import { SubmissionModel, type SubmissionWithRefs } from "../models/submission.model";
import { getOwnedCampaign } from "./campaign.service";

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
