/**
 * Brand constants for The Signal Pass.
 * Single source of truth — identity generation, card rendering, and share
 * copy all read from here rather than re-declaring these values.
 */

export const EVENT = {
  name: "Hacker House Goa",
  year: 2026,
  yearShort: "26",
  dateRange: "28–31 Oct 2026",
  hashtag: "#FrameInGoa",
  motto: "Less Noise. More Signal.",
  coordinates: { lat: 15.2993, lng: 74.124 },
  coordinatesLabel: "15.2993°N 74.1240°E",
  devanagariMark: "गोवा",
} as const;

export const TIERS = [
  { id: "noise", label: "Noise", weight: 55, colorVar: "--noise" },
  { id: "signal", label: "Signal", weight: 35, colorVar: "--signal" },
  { id: "alpha", label: "Alpha", weight: 10, colorVar: "--alpha" },
] as const;

export type TierId = (typeof TIERS)[number]["id"];

/** HH Goa's own four residency days — reused as Access Zones, never invented. */
export const ACCESS_ZONES = [
  { code: "A", name: "Genesis Deck", date: "28 Oct 2026" },
  { code: "B", name: "Triangle Room", date: "29 Oct 2026" },
  { code: "C", name: "Build Deck", date: "30 Oct 2026" },
  { code: "D", name: "Launch Bay", date: "31 Oct 2026" },
] as const;

export const TERMINALS = ["Σ", "Δ", "Ω", "Φ"] as const;

export const SHARE_CAPTIONS: Record<TierId, string> = {
  noise: "Certified NOISE. No signal detected (yet). {hashtag}",
  signal: "SIGNAL confirmed — cleared for Goa. {hashtag}",
  alpha: "ALPHA clearance. Top 10%. See you on the sand. {hashtag}",
};

export const CARD = {
  /** Base render resolution — export is upscaled from this for retina/Twitter. */
  width: 1080,
  height: 1512,
  pfpSize: 1080,
  /**
   * 2x is the standard "retina" multiplier — sharp on any modern display
   * without ballooning file size past what X/Twitter comfortably accepts
   * for an attached image. Export stays lossless PNG throughout (the MRZ
   * and guilloché lines are exactly the fine detail JPEG artifacts would
   * chew up), so resolution is the one lever actually worth tuning here.
   */
  exportScale: 2,
} as const;
