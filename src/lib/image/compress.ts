/**
 * Longest-side cap for the processed image. The tall pass crop only ever
 * needs ~1512px of height (see CARD.height) and the render pipeline exports
 * at 2x for retina, so 2200px leaves headroom for that upscale without
 * shipping a full 12MP phone-camera original through the render request.
 */
const MAX_DIMENSION = 2200;
const JPEG_QUALITY = 0.86;

export type CompressedImage = {
  dataUrl: string;
  width: number;
  height: number;
  bytes: number;
};

/** Resizes (never upscales) and re-encodes a bitmap as a JPEG data URL. */
export async function compressBitmap(bitmap: ImageBitmap): Promise<CompressedImage> {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("Encoding failed."))),
      "image/jpeg",
      JPEG_QUALITY,
    );
  });

  const dataUrl = await blobToDataUrl(blob);
  return { dataUrl, width, height, bytes: blob.size };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Couldn't read the compressed image."));
    reader.readAsDataURL(blob);
  });
}
