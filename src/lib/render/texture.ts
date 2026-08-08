import { mulberry32 } from "@/lib/identity/hash";

/**
 * Procedural print textures — generated from the pass's own seed (via the
 * same `mulberry32` stream the identity engine uses, so rendering stays
 * fully deterministic end to end) rather than a stock noise/halftone image
 * file. Each is built once as a small tile and returned as a
 * `CanvasPattern`, tiled cheaply instead of computing per-pixel noise over
 * the full card.
 */

export function createGrainPattern(ctx: CanvasRenderingContext2D, seed: number): CanvasPattern {
  const size = 64;
  const tile = document.createElement("canvas");
  tile.width = size;
  tile.height = size;
  const tileCtx = tile.getContext("2d");
  if (!tileCtx) throw new Error("Canvas 2D context unavailable.");

  const next = mulberry32(seed ^ 0x6772616e); // "gran" salt — an independent stream from identity fields
  const dotCount = 340;
  for (let i = 0; i < dotCount; i++) {
    const x = next() * size;
    const y = next() * size;
    const shade = next() > 0.5 ? 255 : 0;
    tileCtx.fillStyle = `rgba(${shade},${shade},${shade},${0.05 + next() * 0.05})`;
    tileCtx.fillRect(x, y, 1, 1);
  }

  const pattern = ctx.createPattern(tile, "repeat");
  if (!pattern) throw new Error("Failed to create grain pattern.");
  return pattern;
}

export function createHalftonePattern(
  ctx: CanvasRenderingContext2D,
  colorHex: string,
  seed: number,
): CanvasPattern {
  const size = 10;
  const tile = document.createElement("canvas");
  tile.width = size;
  tile.height = size;
  const tileCtx = tile.getContext("2d");
  if (!tileCtx) throw new Error("Canvas 2D context unavailable.");

  const next = mulberry32(seed ^ 0x68616c66); // "half" salt
  const jitter = (next() - 0.5) * 1.2;
  tileCtx.fillStyle = colorHex;
  tileCtx.beginPath();
  tileCtx.arc(size / 2 + jitter, size / 2, 1.1, 0, Math.PI * 2);
  tileCtx.fill();

  const pattern = ctx.createPattern(tile, "repeat");
  if (!pattern) throw new Error("Failed to create halftone pattern.");
  return pattern;
}
