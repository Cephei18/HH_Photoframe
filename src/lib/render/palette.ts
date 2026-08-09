import type { TierId } from "@/lib/constants";

/**
 * Fixed brand colors for the pass itself — sampled directly from HH Goa's
 * actual logo files and site screenshots (reference/), not invented. The
 * real brand is a loud retro-travel-poster system: deep jungle green,
 * golden sun yellow, hot flamingo pink, warm cream — not the muted
 * beige/brick "customs office" palette this file used to hold.
 *
 * Deliberately NOT wired to the app shell's light/dark CSS tokens — like
 * a real travel document, the pass always renders the same way regardless
 * of the viewer's OS theme. See globals.css for the app shell's (separate)
 * light/dark tokens, which now share this same brand palette.
 */
export const PALETTE = {
  ink: "#0A5C38", // deep jungle green — doubles as the pass's "ink"
  inkSoft: "#2E7350",
  inkFaint: "#5C9478",
  inkDeep: "#063D26", // darkest green, for shadow/depth only
  paper: "#F5EEDC", // warm cream passport page
  paperRaised: "#FAF4E4",
  line: "#D9CFA9",
  lineStrong: "#C7B98A",
  stamp: "#FF0080", // flamingo pink — primary stamp ink
  stampSoft: "#FFD6EC",
  gold: "#FCD900", // sun yellow — secondary stamp ink
  goldSoft: "#FFF0A3",
  teal: "#1F6E52",
  tealSoft: "#CFE7DB",
  noise: "#6E8B7A",
  signal: "#FF0080",
  alpha: "#FCD900",
  monoSurface: "#ECE1BE",

  /** The visa redesign's own base tones — a very light olive-sage security
   * paper (not the warmer cream `paper`/`paperRaised` above, which stayed
   * in place for anything that still leans on the older poster look).
   * `visaLine` is a step darker, for hairlines against `visaBg`. */
  visaBg: "#EAEFDD",
  visaBgDeep: "#DEE6C9",
  visaLine: "#C7D0AE",
} as const;

export const TIER_COLOR: Record<TierId, string> = {
  noise: PALETTE.noise,
  signal: PALETTE.signal,
  alpha: PALETTE.alpha,
};

/** Parses a `#rrggbb` string to an [r, g, b] byte tuple — the only color
 * format the duotone pixel-mapper needs to work with. */
export function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}
