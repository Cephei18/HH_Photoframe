/**
 * Loads a static brand asset (the official logos in public/brand/) into a
 * reusable, drawable image. Uses the plain `Image()` element loading path
 * rather than `createImageBitmap` — verified by actually rendering this:
 * `createImageBitmap` threw "InvalidStateError: the source image could not
 * be decoded" on goa-mark.svg (it uses an SVG `<mask>`, which browsers'
 * createImageBitmap SVG support handles far less reliably than their
 * normal `<img>` rendering path, even though the two formats otherwise
 * work identically with `ctx.drawImage`).
 *
 * Unlike duotone-cache's per-photo cache, these never change and never
 * need eviction — there are only ever a couple of them, loaded once and
 * reused for every pass rendered in the session.
 */
const cache = new Map<string, Promise<HTMLImageElement>>();

export function loadLogo(url: string): Promise<HTMLImageElement> {
  const cached = cache.get(url);
  if (cached) return cached;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load logo: ${url}`));
    img.src = url;
  });

  cache.set(url, promise);
  promise.catch(() => cache.delete(url)); // don't cache a failure
  return promise;
}

export const BRAND_LOGOS = {
  hackerHouse: "/brand/hacker-house.png",
  goaMark: "/brand/goa-mark.svg",
  studio: "/brand/247pm-studio.svg",
  /** A watercolor Goa beach scene — the visa's background watermark motif,
   * the same role the Capitol dome plays on a real US visa. */
  goaScene: "/brand/goa-scene.jpg",
} as const;
