import type { TierId } from "@/lib/constants";

/**
 * Fixed brand colors for the pass itself — deliberately NOT wired to the
 * app shell's light/dark CSS tokens. A printed credential doesn't change
 * color when the viewer's OS switches theme; the pass always renders as
 * warm paper + ink, the same object regardless of who's looking at it or
 * how. (The app shell around it still respects light/dark — see
 * globals.css.) Kept numerically identical to :root's light values there
 * so the product has one consistent brand palette, just not a live binding.
 */
export const PALETTE = {
  ink: "#1c1a15",
  inkSoft: "#5b5544",
  inkFaint: "#8b8371",
  paper: "#ece7d9",
  paperRaised: "#f5f0e2",
  line: "#c9c0a8",
  lineStrong: "#a89d80",
  stamp: "#a23b26",
  stampSoft: "#e4cfc0",
  gold: "#8c6a2f",
  goldSoft: "#e4d6ae",
  teal: "#2a5753",
  tealSoft: "#cfddd9",
  noise: "#7c7568",
  signal: "#a23b26",
  alpha: "#8c6a2f",
  monoSurface: "#e1d9c4",
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
