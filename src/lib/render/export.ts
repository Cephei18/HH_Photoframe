import { renderToCanvas } from "./canvas";
import type { PassVariant, RenderInput, RenderTarget } from "./types";

/**
 * Renders a variant on a detached (never-mounted) canvas and resolves to a
 * PNG blob. Calls the exact same `renderToCanvas` the live preview uses —
 * the only difference is `target`'s pixel size, which Phase 6 sets to a
 * retina-scaled export resolution rather than the preview's on-screen size.
 */
export async function renderToBlob(
  input: RenderInput,
  variant: PassVariant,
  target: RenderTarget,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  await renderToCanvas(canvas, input, target, variant);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("PNG export failed."))),
      "image/png",
    );
  });
}
