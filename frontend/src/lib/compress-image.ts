const MAX_WIDTH = 1600;
const MAX_HEIGHT = 1000;
const QUALITY = 0.82;

/**
 * Downscales and re-encodes a picked photo as WebP before upload, so covers stay
 * a few hundred KB regardless of what the camera produced.
 */
export async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width, MAX_HEIGHT / bitmap.height);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser can't process images");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.convertToBlob({ type: "image/webp", quality: QUALITY });
}
