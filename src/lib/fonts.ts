import localFont from "next/font/local";

/**
 * Brand type system for The Signal Pass.
 * Big Shoulders Display carries structure (wordmark, tier, numerals).
 * JetBrains Mono carries every literal/credential field.
 * Newsreader is body/reading copy. Instrument Serif is the "officialese" accent.
 * All four are self-hosted (no runtime font CDN calls).
 */

/**
 * Variable names are deliberately distinct from the Tailwind theme tokens
 * they feed (mapped in globals.css's `@theme` block) — aliasing a CSS custom
 * property to itself (`--font-mono: var(--font-mono)`) is a circular
 * reference and resolves to invalid, so `-family` suffixes keep the two
 * namespaces apart.
 */

export const fontDisplay = localFont({
  src: "../fonts/big-shoulders-display.woff2",
  variable: "--font-display-family",
  weight: "100 900",
  display: "swap",
});

export const fontMono = localFont({
  src: "../fonts/jetbrains-mono.woff2",
  variable: "--font-mono-family",
  weight: "400 700",
  display: "swap",
});

export const fontBody = localFont({
  src: [
    { path: "../fonts/newsreader.woff2", weight: "400 600", style: "normal" },
    { path: "../fonts/newsreader-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-body-family",
  display: "swap",
});

export const fontOfficial = localFont({
  src: [
    { path: "../fonts/instrument-serif.woff2", weight: "400", style: "normal" },
    { path: "../fonts/instrument-serif-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-official-family",
  display: "swap",
});

export const fontVariables = [
  fontDisplay.variable,
  fontMono.variable,
  fontBody.variable,
  fontOfficial.variable,
].join(" ");
