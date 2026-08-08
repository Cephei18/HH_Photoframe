import { decodeDataUrlToBitmap } from "@/lib/image/decode";
import { applyDuotone } from "./duotone";
import { PALETTE } from "./palette";

export type DuotonePhoto = { canvas: HTMLCanvasElement; width: number; height: number };

/**
 * The Pass and PFP canvases render independently but come from the same
 * photo — without this, decoding the data URL and running the duotone
 * pixel loop (a full getImageData/putImageData pass) happened twice per
 * generation, once per variant. Caching by data URL means the second
 * variant reuses the first's work outright.
 *
 * Caches the in-flight *promise*, not just the resolved value — Pass and
 * PFP mount at effectively the same moment, so without this a naive
 * "check cache, else compute" would still race and duplicate the work
 * before either finished.
 */
const cache = new Map<string, Promise<DuotonePhoto>>();
const MAX_ENTRIES = 3;

export function getDuotonePhoto(dataUrl: string): Promise<DuotonePhoto> {
  const cached = cache.get(dataUrl);
  if (cached) return cached;

  const promise = (async (): Promise<DuotonePhoto> => {
    const bitmap = await decodeDataUrlToBitmap(dataUrl);
    try {
      const canvas = applyDuotone(
        bitmap,
        bitmap.width,
        bitmap.height,
        PALETTE.ink,
        PALETTE.paperRaised,
      );
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
