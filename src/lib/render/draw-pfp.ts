import { EVENT } from "@/lib/constants";
import { computeAutoCrop } from "@/lib/image/autocrop";
import { getDuotonePhoto } from "./duotone-cache";
import { CANVAS_FONTS } from "./font-refs";
import { PFP_LAYOUT } from "./layout";
import { PALETTE, TIER_COLOR } from "./palette";
import { createGrainPattern } from "./texture";
import type { RenderInput } from "./types";

const L = PFP_LAYOUT;

/**
 * The square PFP frame — the same photo and identity as the pass, cropped
 * to 1:1 instead of the tall aspect. Deliberately sparse: X applies a
 * circular mask to avatars, so everything here stays inside
 * `safeZoneFraction` of the diameter by construction — nothing important
 * is ever in a corner waiting to be clipped.
 */
export async function drawPfp(ctx: CanvasRenderingContext2D, input: RenderInput): Promise<void> {
  const { identity, image } = input;
  const tierColor = TIER_COLOR[identity.tier];
  const size = L.size;
  const center = size / 2;

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = PALETTE.paperRaised;
  ctx.fillRect(0, 0, size, size);

  const photo = await getDuotonePhoto(image.dataUrl);
  const crop = computeAutoCrop(photo.width, photo.height, 1, image.focal);

  ctx.drawImage(photo.canvas, crop.x, crop.y, crop.width, crop.height, 0, 0, size, size);

  // Tier ring — drawn straddling the circular-crop edge so a colored rim
  // survives even after X clips the avatar to a circle.
  ctx.save();
  ctx.strokeStyle = tierColor;
  ctx.lineWidth = L.ringWidth;
  ctx.beginPath();
  ctx.arc(center, center, size / 2 - L.ringWidth / 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  const safeRadius = (size * L.safeZoneFraction) / 2;

  // Hidden monogram, top of the safe zone, low opacity — the PFP gets one
  // small echo of the pass's hidden-detail language, not the full catalog.
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = PALETTE.paperRaised;
  ctx.font = `700 ${Math.round(size * 0.05)}px ${CANVAS_FONTS.display}`;
  ctx.textAlign = "center";
  ctx.fillText("HH", center, center - safeRadius * 0.62);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = PALETTE.paperRaised;
  ctx.font = `500 ${L.coordinateLabelSize}px ${CANVAS_FONTS.mono}`;
  ctx.textAlign = "center";
  ctx.fillText(EVENT.coordinatesLabel, center, center + safeRadius * 0.86);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = createGrainPattern(ctx, identity.seed);
  ctx.beginPath();
  ctx.arc(center, center, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
