import type { ChainStampId } from "@/lib/constants";

/**
 * Canvas versions of the same four glyphs as ChainStampIcon.tsx (the form
 * picker) — a diamond, stacked bars, a struck coin, a spark. Drawn in a
 * local -10..10 coordinate space, scaled/positioned by the caller, so the
 * same shape works at picker-icon size or stamped large on the pass.
 */
export function drawChainGlyph(
  ctx: CanvasRenderingContext2D,
  id: ChainStampId,
  cx: number,
  cy: number,
  scale: number,
  color: string,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale / 10, scale / 10);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  switch (id) {
    case "ethereum": {
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(8, 0);
      ctx.lineTo(0, 10);
      ctx.lineTo(-8, 0);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(0, 3.3);
      ctx.lineTo(8, 0);
      ctx.stroke();
      break;
    }
    case "solana": {
      const bar = (y: number, skew: number) => {
        ctx.beginPath();
        ctx.moveTo(-9 + skew, y);
        ctx.lineTo(9, y);
        ctx.lineTo(9 - skew, y + 3.2);
        ctx.lineTo(-9, y + 3.2);
        ctx.closePath();
        ctx.fill();
      };
      bar(-9, 2.4);
      bar(-1.6, -2.4);
      bar(5.8, 2.4);
      break;
    }
    case "bitcoin": {
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-1.5, -5);
      ctx.lineTo(-1.5, 5);
      ctx.moveTo(-4, -5);
      ctx.lineTo(2.5, -5);
      ctx.quadraticCurveTo(5.5, -5, 5.5, -2.2);
      ctx.quadraticCurveTo(5.5, 0, 2.5, 0);
      ctx.lineTo(-4, 0);
      ctx.moveTo(-4, 0);
      ctx.lineTo(3, 0);
      ctx.quadraticCurveTo(6, 0, 6, 2.8);
      ctx.quadraticCurveTo(6, 5, 3, 5);
      ctx.lineTo(-4, 5);
      ctx.stroke();
      break;
    }
    case "ai": {
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(0, -3);
      ctx.moveTo(0, 3);
      ctx.lineTo(0, 9);
      ctx.moveTo(-9, 0);
      ctx.lineTo(-3, 0);
      ctx.moveTo(3, 0);
      ctx.lineTo(9, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(3.5, 0);
      ctx.lineTo(0, 4);
      ctx.lineTo(-3.5, 0);
      ctx.closePath();
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}
