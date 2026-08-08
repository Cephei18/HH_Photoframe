/**
 * Procedural retro-travel-poster motifs — the actual illustration
 * vocabulary from HH Goa's own site (reference/): a radiating sun behind
 * the stamp, palm trees flanking the frame, a scalloped wave dividing
 * photo from data. Flat shapes, no photographic texture — matching the
 * site's own flat vector illustration style.
 */

export function drawSunburst(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  rayCount: number,
  color: string,
): void {
  ctx.save();
  ctx.fillStyle = color;
  const rayWidth = (Math.PI * 2) / rayCount / 2.2;
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(
      cx + Math.cos(angle - rayWidth) * innerRadius,
      cy + Math.sin(angle - rayWidth) * innerRadius,
    );
    ctx.lineTo(
      cx + Math.cos(angle - rayWidth / 2) * outerRadius,
      cy + Math.sin(angle - rayWidth / 2) * outerRadius,
    );
    ctx.lineTo(
      cx + Math.cos(angle + rayWidth / 2) * outerRadius,
      cy + Math.sin(angle + rayWidth / 2) * outerRadius,
    );
    ctx.lineTo(
      cx + Math.cos(angle + rayWidth) * innerRadius,
      cy + Math.sin(angle + rayWidth) * innerRadius,
    );
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** A flat palm silhouette, trunk base at (x, y), growing upward `height`
 * px tall. `mirror` flips it left/right so a pair can flank a frame. */
export function drawPalmSilhouette(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
  color: string,
  mirror: boolean,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(mirror ? -1 : 1, 1);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  // Trunk — a gently curved tapering stroke.
  const trunkLean = height * 0.22;
  ctx.beginPath();
  ctx.moveTo(-height * 0.045, 0);
  ctx.quadraticCurveTo(trunkLean * 0.5, -height * 0.55, trunkLean, -height);
  ctx.lineTo(trunkLean + height * 0.05, -height);
  ctx.quadraticCurveTo(trunkLean * 0.5 + height * 0.05, -height * 0.55, height * 0.045, 0);
  ctx.closePath();
  ctx.fill();

  // Crown — five fronds radiating from the top of the trunk.
  const crownX = trunkLean;
  const crownY = -height;
  const frondAngles = [-1.35, -0.75, -0.15, 0.45, 1.05];
  for (const baseAngle of frondAngles) {
    const angle = baseAngle - 0.35;
    const length = height * 0.5;
    const spread = 0.5;
    ctx.beginPath();
    ctx.moveTo(crownX, crownY);
    ctx.quadraticCurveTo(
      crownX + Math.cos(angle - spread) * length * 0.6,
      crownY + Math.sin(angle - spread) * length * 0.6,
      crownX + Math.cos(angle) * length,
      crownY + Math.sin(angle) * length,
    );
    ctx.quadraticCurveTo(
      crownX + Math.cos(angle + spread) * length * 0.6,
      crownY + Math.sin(angle + spread) * length * 0.6,
      crownX,
      crownY,
    );
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** A row of semicircle scallops along a horizontal line — the wave motif
 * used as a divider instead of a plain hairline. */
export function drawScallopWave(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  radius: number,
  color: string,
): void {
  ctx.save();
  ctx.fillStyle = color;
  const count = Math.round(width / (radius * 2));
  const step = width / count;
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    ctx.arc(x + step * i + step / 2, y, radius, 0, Math.PI, false);
    ctx.fill();
  }
  ctx.restore();
}
