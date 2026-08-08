import type { BuilderIdentity } from "@/lib/identity/types";
import type { ProcessedImage } from "@/lib/image/types";

export type PassVariant = "pass" | "pfp";

export type RenderInput = {
  identity: BuilderIdentity;
  image: ProcessedImage;
};

/** Target output size, in real pixels — the only thing that differs
 * between a crisp on-screen preview and a 2x/3x retina export. Every draw
 * function works in the fixed logical coordinate space (`CARD.width` ×
 * `CARD.height`, or `CARD.pfpSize` square); the renderer converts once via
 * `ctx.scale`, so nothing downstream has to think about resolution. */
export type RenderTarget = {
  pixelWidth: number;
  pixelHeight: number;
};
