import { CARD } from "@/lib/constants";

/**
 * Logical layout for the Builder Visa, in the fixed 1600×1040 coordinate
 * space (`CARD.width` × `CARD.height`, a real US-visa-sticker-ish ~1.54:1
 * landscape ratio). Every draw function works in these units; the
 * renderer scales once via `ctx.scale` for preview vs. retina export, so
 * resolution never leaks into layout math.
 *
 * Modeled directly on a real US visa's own composition: a two-tone header
 * band with a seal straddling the seam, a mounted ID photo on the left, a
 * labeled field grid on the right (with a low-opacity watermark drawing
 * behind it), a highlighted document-number callout, and an MRZ/OCR strip
 * along the bottom.
 */

const W = CARD.width;
const H = CARD.height;

const HEADER_H = 150;
const FOOTER_H = 156;
const BODY_Y = HEADER_H;

export const PASS_LAYOUT = {
  width: W,
  height: H,
  margin: 48,

  /** Rounded-corner clip applied to the whole card up front — a laminated
   * ID card's corners, not this brand's usual hard-edged UI chrome (that
   * rule is a website convention; see globals.css — the canvas pass has
   * always been its own deliberately-decoupled visual system). */
  cornerRadius: 28,

  header: { height: HEADER_H, accentWidth: 480 },
  /** The seal straddles the seam between the header's two color blocks,
   * same composition as the eagle on a real US visa. */
  emblem: { cx: 480, cy: 75, radius: 56 },
  accentLabel: { x: 32, y: 108, fontSize: 42 },
  masthead: {
    hackerHouseHeight: 64,
    hackerHouseX: 576,
    hackerHouseY: 43,
    goaMarkHeight: 48,
    inset: 32,
  },

  photo: { x: 48, y: 174, width: 440, height: 560 },

  /**
   * A circular 2:47PM Studio stamp, sized to fill the one dead stretch
   * this layout otherwise leaves behind: the gap between the photo's
   * bottom edge (174 + 560 = 734) and the footer (900). Same ring/tick
   * visual language as the visa stamps above, but always present — the
   * studio's own credit, not a personalization choice.
   */
  studioStamp: { cx: 268, cy: 817, radius: 60 },

  /** Two label/value columns to the right of the photo, five rows each —
   * see FIELD_ROWS in draw-pass.ts for what actually fills them. */
  fieldGrid: {
    colAX: 528,
    colBX: 1048,
    colWidth: 480,
    y0: 174,
    rowHeight: 96,
    labelSize: 16,
    valueSize: 28,
  },
  annotation: { x: 528, y: 654, width: 1024, height: 70 },
  /** The one highlighted callout — a real visa's own red-boxed visa
   * number, done here in the brand's stamp pink instead of red. */
  visaNumberBox: { x: 1252, y: 734, width: 300, height: 66 },

  /** The field grid's own low-opacity background drawing (a real visa's
   * Capitol-dome watermark, played here by the actual Goa artwork) — kept
   * deliberately faint (see drawWatermark) so it reads as security-paper
   * texture, not clutter. */
  watermark: { x: 0, y: BODY_Y, width: W, height: H - BODY_Y - FOOTER_H },

  /**
   * Fixed slots for the chosen visa stamps, hand-placed across the lower
   * two-thirds of the photo — clear of the face, allowed to overlap each
   * other slightly (real passport stamps do too), but kept inside (or
   * only barely past) the photo's own frame — verified by actually
   * rendering this: an earlier version let a stamp spill halfway past the
   * frame border, and the border's stroke sliced visibly through it.
   * Chosen stamps fill these in pick order, so 1 pick reads as a single
   * confident stamp and 4 reads as a well-traveled visa page.
   */
  visaStampSlots: [
    { cx: 150, cy: 650, radius: 68, rotationDeg: -10 },
    { cx: 300, cy: 690, radius: 60, rotationDeg: 14 },
    { cx: 410, cy: 600, radius: 55, rotationDeg: -18 },
    { cx: 190, cy: 540, radius: 48, rotationDeg: 10 },
  ] as const,

  footer: {
    y: H - FOOTER_H,
    height: FOOTER_H,
    chevronY: H - FOOTER_H + 28,
    mrzLine1Y: H - FOOTER_H + 76,
    mrzLine2Y: H - FOOTER_H + 118,
  },
} as const;

export const PFP_LAYOUT = {
  size: CARD.pfpSize,
  ringWidth: 34,
  /** Nothing outside this fraction of the diameter survives a circular
   * avatar crop — content stays inside it by construction. */
  safeZoneFraction: 0.92,
  coordinateLabelSize: 22,
} as const;
