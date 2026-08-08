/**
 * Manual letter-spacing. `CanvasRenderingContext2D.letterSpacing` exists in
 * modern browsers but isn't universal yet — advancing per character by its
 * measured width + a fixed gap works everywhere and is what the brand's
 * uppercase/mono labels need throughout the card.
 */
export function fillTextTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
): void {
  const originalAlign = ctx.textAlign;
  ctx.textAlign = "left";
  let cursor = x;
  for (const char of text) {
    ctx.fillText(char, cursor, y);
    cursor += ctx.measureText(char).width + spacing;
  }
  ctx.textAlign = originalAlign;
}

export function measureTrackedWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  spacing: number,
): number {
  let width = 0;
  for (const char of text) {
    width += ctx.measureText(char).width + spacing;
  }
  return Math.max(0, width - spacing);
}

/** Tiles a short repeating label across a width — the perimeter
 * micro-print's "reads as noise until you zoom in" texture. */
export function repeatToWidth(
  ctx: CanvasRenderingContext2D,
  label: string,
  targetWidth: number,
): string {
  const unit = `${label} · `;
  const unitWidth = ctx.measureText(unit).width;
  if (unitWidth === 0) return label;
  const repeats = Math.ceil(targetWidth / unitWidth) + 1;
  return unit.repeat(repeats);
}
