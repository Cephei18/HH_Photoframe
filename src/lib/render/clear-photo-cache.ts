import { decodeDataUrlToBitmap } from "@/lib/image/decode";

export type ClearPhoto = { canvas: HTMLCanvasElement; width: number; height: number };

/**
 * The visa's photo box shows the upload plainly — clear and recognizable,
 * the way an actual ID photo has to be — rather than the two-color duotone
 * treatment `duotone-cache.ts` applies elsewhere. That treatment was built
 * for a full-bleed poster photo; on a small mounted ID photo it just
 * muddies the face. Mirrors duotone-cache's promise-caching shape (same
 * race-prevention reasoning — Pass and PFP mount at the same moment) but
 * skips the pixel-processing step entirely.
 */
const cache = new Map<string, Promise<ClearPhoto>>();
const MAX_ENTRIES = 3;

export function getClearPhoto(dataUrl: string): Promise<ClearPhoto> {
  const cached = cache.get(dataUrl);
  if (cached) return cached;

  const promise = (async (): Promise<ClearPhoto> => {
    const bitmap = await decodeDataUrlToBitmap(dataUrl);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context unavailable.");
      ctx.drawImage(bitmap, 0, 0);
      return { canvas, width: bitmap.width, height: bitmap.height };
    } finally {
      bitmap.close();
    }
  })();

  cache.set(dataUrl, promise);
  promise.catch(() => cache.delete(dataUrl)); // don't cache a failure

  if (cache.size > MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }

  return promise;
}
