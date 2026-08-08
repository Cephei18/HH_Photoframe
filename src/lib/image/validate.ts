import { UploadError } from "./types";

/** MIME types we'll attempt to decode. Some Android/desktop browsers report
 * an empty or generic type for HEIC files, so extension is checked too. */
const ACCEPTED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const ACCEPTED_EXTENSIONS = /\.(jpe?g|png|webp|heic|heif)$/i;

export const MAX_FILE_BYTES = 30 * 1024 * 1024; // 30MB — generous for a phone camera original
export const MIN_DIMENSION = 300; // px, either side — anything smaller looks smeared once upscaled to card size

export function validateFile(file: File): void {
  if (file.size === 0) {
    throw new UploadError("empty-file", "That file is empty.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new UploadError("too-large", "That photo is too large (max 30MB).");
  }
  const typeOk = ACCEPTED_MIME.has(file.type.toLowerCase());
  const extOk = ACCEPTED_EXTENSIONS.test(file.name);
  if (!typeOk && !extOk) {
    throw new UploadError("unsupported-type", "Use a JPG, PNG, WebP, or HEIC photo.");
  }
}

export function validateDimensions(width: number, height: number): void {
  if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
    throw new UploadError(
      "too-small",
      `That photo is a bit small — use one at least ${MIN_DIMENSION}×${MIN_DIMENSION}.`,
    );
  }
}
