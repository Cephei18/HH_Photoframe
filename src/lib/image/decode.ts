import { UploadError } from "./types";

/**
 * Decodes a blob to a bitmap with EXIF orientation applied. Phone cameras
 * routinely write a rotated JPEG plus an orientation tag rather than
 * physically rotating pixels — `imageOrientation: "from-image"` asks the
 * browser to bake that rotation in during decode, so nothing downstream
 * (crop math, canvas draw) has to think about EXIF at all.
 */
export async function decodeToBitmap(blob: Blob): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(blob, { imageOrientation: "from-image" });
  } catch {
    throw new UploadError("decode-failed", "Couldn't read that photo — try a different file.");
  }
}

/**
 * Decodes an already-compressed data URL back to a bitmap for the render
 * pipeline. No orientation correction here — `ProcessedImage.dataUrl` was
 * already baked straight (see `decodeToBitmap`'s use in the upload
 * pipeline), so re-applying it would be a no-op at best.
 */
export async function decodeDataUrlToBitmap(dataUrl: string): Promise<ImageBitmap> {
  const blob = await (await fetch(dataUrl)).blob();
  return createImageBitmap(blob);
}
