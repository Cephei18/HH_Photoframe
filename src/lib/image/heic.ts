import { UploadError } from "./types";

/** Some browsers (notably Chrome on Android) report an empty or generic
 * MIME type for HEIC/HEIF files picked from the camera roll, so extension
 * is checked as a fallback signal. */
export function isHeic(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type === "image/heic" || type === "image/heif") return true;
  return /\.hei[cf]$/i.test(file.name);
}

/**
 * Converts a HEIC/HEIF file to a JPEG blob. `heic2any` bundles a WASM HEIF
 * decoder (~1.5MB) — it's dynamically imported so non-HEIC uploads (the
 * common case on Android, HH Goa's primary audience) never pay for it.
 */
export async function convertHeicToJpeg(file: File): Promise<Blob> {
  try {
    const heic2any = (await import("heic2any")).default;
    const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
    // HEIC "live photo" bursts decode to an array — the first frame is the still.
    const blob = Array.isArray(result) ? result[0] : result;
    return blob;
  } catch {
    throw new UploadError(
      "heic-failed",
      "Couldn't read that HEIC photo. Try taking a screenshot of it and uploading that instead.",
    );
  }
}
