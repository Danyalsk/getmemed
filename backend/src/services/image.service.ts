import { IMAGE_CONTENT_TYPES } from "../contracts/image";
import { AppError } from "../lib/errors";
import { ImageModel } from "../models/image.model";

type ImageContentType = (typeof IMAGE_CONTENT_TYPES)[number];

/** File signatures, so a mislabelled upload can't be served as an image. */
function sniffContentType(data: Buffer): ImageContentType | null {
  if (data.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return "image/jpeg";
  if (data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}

export async function saveImage(uploadedBy: string, body: unknown) {
  if (!Buffer.isBuffer(body) || body.length === 0) {
    throw AppError.badRequest(`Send the image as the raw request body (${IMAGE_CONTENT_TYPES.join(", ")})`);
  }
  const contentType = sniffContentType(body);
  if (!contentType) {
    throw AppError.badRequest("Only JPEG, PNG or WebP images are supported");
  }
  const image = await ImageModel.create({ data: body, contentType, uploadedBy });
  return { _id: image.id };
}

export async function findImage(imageId: string) {
  const image = await ImageModel.findById(imageId).select("data contentType");
  if (!image) {
    throw AppError.notFound("Image");
  }
  return image;
}

/** A campaign may only use a cover the same brand uploaded. */
export async function assertImageOwner(imageId: string, brandId: string): Promise<void> {
  const owned = await ImageModel.exists({ _id: imageId, uploadedBy: brandId });
  if (!owned) {
    throw AppError.badRequest("Upload a cover image before creating the campaign");
  }
}
