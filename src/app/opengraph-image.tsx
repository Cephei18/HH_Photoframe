import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { EVENT } from "@/lib/constants";

export const alt = "The Signal Pass — Hacker House Goa 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Fonts don't depend on request data — read once at module scope. This is
// the one place in the product that actually calls for Satori: a single,
// fixed, non-personalized image, exactly what it's good at. The
// per-user pass (lib/render) is Canvas — see that module's notes on why.
// Satori (the renderer behind ImageResponse) only accepts ttf/otf/woff —
// NOT woff2, unlike every other font reference in this codebase. These two
// ttf files exist solely for this route; the product's own typography
// (lib/fonts.ts) stays woff2 throughout.
const fontsDir = join(process.cwd(), "src", "fonts");
const [displayFont, monoFont] = await Promise.all([
  readFile(join(fontsDir, "big-shoulders-display-og.ttf")),
  readFile(join(fontsDir, "jetbrains-mono-og.ttf")),
]);

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        backgroundColor: "#ece7d9",
        color: "#1c1a15",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "JetBrains Mono",
          fontSize: 22,
          letterSpacing: 2,
          color: "#a23b26",
          textTransform: "uppercase",
        }}
      >
        <span>
          {EVENT.name} · {EVENT.year}
        </span>
        <span>{EVENT.hashtag}</span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontFamily: "Big Shoulders Display",
          fontWeight: 700,
          fontSize: 132,
          lineHeight: 0.95,
          textTransform: "uppercase",
        }}
      >
        <span>The Signal</span>
        <span style={{ color: "#a23b26" }}>Pass</span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "JetBrains Mono",
          fontSize: 20,
          letterSpacing: 1,
          color: "#5b5544",
        }}
      >
        <span>{EVENT.coordinatesLabel}</span>
        <span>{EVENT.motto}</span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Big Shoulders Display", data: displayFont, weight: 700, style: "normal" },
        { name: "JetBrains Mono", data: monoFont, weight: 500, style: "normal" },
      ],
    },
  );
}
