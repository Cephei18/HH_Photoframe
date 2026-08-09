import type { ChainStampId } from "@/lib/constants";

/**
 * Canvas versions of the same glyphs as ChainStampIcon.tsx (the form
 * picker) — a diamond, stacked bars, a struck coin, a spark, a faceted
 * hex, a cog ring, interlocking curves, angle brackets. Drawn in a local
 * -10..10 coordinate space, scaled/positioned by the caller, so the same
 * shape works at picker-icon size or stamped large on the pass.
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
    case "solidity": {
      // Two nested, offset hexagon facets — a nod to Solidity's stacked-
      // diamond mark without reproducing it.
      const hex = (r: number, dy: number) => {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 2;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r + dy;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      };
      hex(6.5, -2.5);
      hex(4.2, 3.2);
      break;
    }
    case "rust": {
      // A cog ring — a small circle with blunt rectangular teeth, the
      // same restraint as a literal gear-mascot glyph without redrawing
      // the mascot. Chunky rectangles (not radial lines) so this reads as
      // machinery rather than another sunburst next to the pass's actual
      // sunburst motif.
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 8; i++) {
        ctx.save();
        ctx.rotate((Math.PI / 4) * i);
        ctx.fillRect(-1.3, -9.5, 2.6, 3.4);
        ctx.restore();
      }
      break;
    }
    case "python": {
      // Two interlocking teardrops, rotated 180° from each other — an
      // abstracted nod to the two-snake mark, not a redraw of it.
      const teardrop = (rotationDeg: number) => {
        ctx.save();
        ctx.rotate((rotationDeg * Math.PI) / 180);
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.quadraticCurveTo(7, -8, 7, -1);
        ctx.quadraticCurveTo(7, 3, 1, 3);
        ctx.quadraticCurveTo(-2, 3, -2, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-3.2, -6, 1.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
      teardrop(0);
      teardrop(180);
      break;
    }
    case "typescript": {
      // Angle brackets around a short baseline tick — a generic "code"
      // mark rather than the literal "TS" wordmark tile.
      ctx.beginPath();
      ctx.moveTo(-2, -7);
      ctx.lineTo(-8, 0);
      ctx.lineTo(-2, 7);
      ctx.moveTo(2, -7);
      ctx.lineTo(8, 0);
      ctx.lineTo(2, 7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-1.5, 3.2);
      ctx.lineTo(1.5, 3.2);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}
