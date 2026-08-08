import { hexToRgb } from "./palette";

/**
 * Maps every pixel's luminance onto a two-color gradient between `shadow`
 * and `highlight` — a real duotone, not a CSS `filter` approximation. This
 * is the one piece of "artwork" the pass has: the uploaded photo itself,
 * treated like a print, never an illustration layered on top of it.
 */
export function applyDuotone(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  shadowHex: string,
  highlightHex: string,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = sourceWidth;
  canvas.height = sourceHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");

  ctx.drawImage(source, 0, 0, sourceWidth, sourceHeight);

  const [sr, sg, sb] = hexToRgb(shadowHex);
  const [hr, hg, hb] = hexToRgb(highlightHex);

  const imageData = ctx.getImageData(0, 0, sourceWidth, sourceHeight);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    // Slightly contrast-boosted luminance so the duotone reads with real
    // punch rather than a flat gray wash.
    const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const t = Math.min(1, Math.max(0, (luminance / 255 - 0.5) * 1.15 + 0.5));

    data[i] = sr + (hr - sr) * t;
    data[i + 1] = sg + (hg - sg) * t;
    data[i + 2] = sb + (hb - sb) * t;
    // alpha (data[i + 3]) untouched
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
