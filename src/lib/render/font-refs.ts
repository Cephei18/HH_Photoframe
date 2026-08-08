import { fontBody, fontDisplay, fontMono, fontOfficial } from "@/lib/fonts";

/**
 * Canvas's `ctx.font` shorthand needs a literal font-family name — it
 * doesn't resolve CSS custom properties the way DOM text does. next/font's
 * `.style.fontFamily` carries the actual generated name (e.g.
 * `"__bigShoulders_abc123"`), so the renderer reads it once here rather
 * than duplicating font names as string literals.
 */
export const CANVAS_FONTS = {
  display: fontDisplay.style.fontFamily,
  mono: fontMono.style.fontFamily,
  body: fontBody.style.fontFamily,
  official: fontOfficial.style.fontFamily,
};

/** Waits for every brand font to finish loading before the first canvas
 * draw — canvas text silently falls back to a default face for any draw
 * call issued before its font is ready, and unlike DOM text it never
 * reflows once the real face arrives. */
export async function ensureFontsReady(): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  await document.fonts.ready;
}
