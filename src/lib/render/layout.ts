import { CARD } from "@/lib/constants";

/**
 * Logical layout for the tall Builder Pass, in the fixed 1080×1512
 * coordinate space (`CARD.width` × `CARD.height`). Every draw function
 * works in these units; the renderer scales once via `ctx.scale` for
 * preview vs. retina export, so resolution never leaks into layout math.
 *
 * Band stack, top to bottom: full-bleed photo → identity strip → MRZ →
 * perimeter micro-print. The tier stamp is the one element allowed to
 * cross band boundaries (drawn last, on top) — see draw-pass.ts.
 */

const W = CARD.width;
const H = CARD.height;

const MICRO_H = 28;
const MRZ_H = 88;
const STRIP_H = 60;
const PHOTO_H = H - MICRO_H - MRZ_H - STRIP_H;

export const PASS_LAYOUT = {
  width: W,
  height: H,

  margin: 48,

  photo: { x: 0, y: 0, width: W, height: PHOTO_H },
  strip: { x: 0, y: PHOTO_H, width: W, height: STRIP_H },
  mrz: { x: 0, y: PHOTO_H + STRIP_H, width: W, height: MRZ_H },
  micro: { x: 0, y: PHOTO_H + STRIP_H + MRZ_H, width: W, height: MICRO_H },

  registrationTick: { inset: 20, arm: 22 },

  masthead: { insetTop: 44, insetX: 48, nameSize: 20, markSize: 30 },
  tierWord: { insetTop: 108, insetX: 44, size: 168 },

  // Co-centered with `stamp`, and deliberately larger than its diameter
  // (344px) so a ring of the ghost photo peeks out from behind it once the
  // stamp is drawn on top — the "photo can't have been swapped" effect,
  // not a coincidence of two unrelated placements.
  ghost: { size: 390, cx: 890, cy: 1300, opacity: 0.2 },
  seal: { cx: 200, cy: 1166, radius: 128 },
  // Radius sized for four content lines (tier, chosen chain glyph + label,
  // coordinates, terminal) — see drawTierStamp's fixed offsets, which
  // assume this exact radius.
  stamp: { cx: 890, cy: 1300, radius: 172, rotationRangeDeg: [-16, -6] as const },

  edgeMicroprint: { inset: 9, fontSize: 8 },

  perforation: { y: PHOTO_H },
} as const;

export const PFP_LAYOUT = {
  size: CARD.pfpSize,
  ringWidth: 34,
  /** Nothing outside this fraction of the diameter survives a circular
   * avatar crop — content stays inside it by construction. */
  safeZoneFraction: 0.92,
  coordinateLabelSize: 22,
} as const;
