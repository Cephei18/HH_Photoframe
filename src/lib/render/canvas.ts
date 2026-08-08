import { CARD } from "@/lib/constants";
import { drawPfp } from "./draw-pfp";
import { drawPass } from "./draw-pass";
import { ensureFontsReady } from "./font-refs";
import { PFP_LAYOUT } from "./layout";
import type { PassVariant, RenderInput, RenderTarget } from "./types";

const LOGICAL_SIZE: Record<PassVariant, { width: number; height: number }> = {
  pass: { width: CARD.width, height: CARD.height },
  pfp: { width: PFP_LAYOUT.size, height: PFP_LAYOUT.size },
};

/**
 * Draws a variant into `canvas` at exactly `target`'s pixel dimensions.
 * This is the single function both the live preview and the PNG export
 * call — same draw code, same logical coordinate space, just scaled by a
 * different factor — which is what makes "export identical to preview" a
 * guarantee rather than a hope.
 */
export async function renderToCanvas(
  canvas: HTMLCanvasElement,
  input: RenderInput,
  target: RenderTarget,
  variant: PassVariant,
): Promise<void> {
  await ensureFontsReady();

  const logical = LOGICAL_SIZE[variant];
  canvas.width = target.pixelWidth;
  canvas.height = target.pixelHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");

  ctx.save();
  ctx.scale(target.pixelWidth / logical.width, target.pixelHeight / logical.height);

  if (variant === "pass") {
    await drawPass(ctx, input);
  } else {
    await drawPfp(ctx, input);
  }

  ctx.restore();
}
