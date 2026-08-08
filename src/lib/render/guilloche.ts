import { mulberry32 } from "@/lib/identity/hash";

/**
 * A procedural anti-counterfeit rosette — the "verification seal." Two
 * overlapping spoke patterns at different counts/phases create the
 * moiré-like density real guilloché engraving gets from overlapping
 * curves. `variation` (the identity's `sealVariation`, 0..1) seeds spoke
 * count and phase, so no two passes share the exact same pattern, and a
 * faint "HH" monogram sits dead center — visible only once you know to
 * look for it.
 */
export function drawGuilloche(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  variation: number,
  colorHex: string,
  displayFont: string,
): void {
  const next = mulberry32(Math.floor(variation * 4294967295));

  ctx.save();
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 1;

  // Concentric rings.
  const ringCount = 4;
  for (let r = 0; r < ringCount; r++) {
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * ((r + 1) / ringCount), 0, Math.PI * 2);
    ctx.stroke();
  }

  // Two overlapping spoke layers.
  drawSpokes(ctx, cx, cy, radius, 48 + Math.floor(next() * 24), next() * Math.PI * 2, 0.35);
  drawSpokes(ctx, cx, cy, radius, 30 + Math.floor(next() * 18), next() * Math.PI * 2, 0.25);

  // Hidden monogram, dead center, low opacity, tilted.
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = colorHex;
  ctx.font = `700 ${Math.round(radius * 0.22)}px ${displayFont}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.translate(cx, cy);
  ctx.rotate((-14 * Math.PI) / 180);
  ctx.fillText("HH", 0, 0);

  ctx.restore();
}

function drawSpokes(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  count: number,
  phase: number,
  alpha: number,
): void {
  ctx.globalAlpha = alpha;
  const innerR = radius * 0.18;
  for (let i = 0; i < count; i++) {
    const angle = phase + (i / count) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    ctx.stroke();
  }
}
