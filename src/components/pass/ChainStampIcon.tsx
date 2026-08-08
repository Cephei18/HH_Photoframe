import type { ChainStampId } from "@/lib/constants";

type ChainStampIconProps = {
  id: ChainStampId;
  size?: number;
  className?: string;
};

/**
 * Small abstracted glyphs for each stamp flavor — a diamond, stacked bars,
 * a struck coin, a spark. Deliberately geometric nods rather than literal
 * trademarked logos, same restraint as the guilloché's Ethereum-facet
 * motif in the renderer. `drawChainGlyph` (lib/render) draws the canvas
 * version of these same four shapes; keep them in sync if either changes.
 */
export function ChainStampIcon({ id, size = 20, className }: ChainStampIconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (id) {
    case "ethereum":
      return (
        <svg {...common}>
          <path d="M12 2 20 12 12 22 4 12Z" />
          <path d="M4 12 12 16 20 12" />
        </svg>
      );
    case "solana":
      return (
        <svg {...common}>
          <path d="M5 7h12l2 -2H7Z" />
          <path d="M5 12h14" />
          <path d="M7 17h12l-2 2H5Z" />
        </svg>
      );
    case "bitcoin":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M10 8h4.5a2 2 0 1 1 0 4H10m0-4v8m0-4h5a2 2 0 1 1 0 4H10m0-8V6m0 12v2" />
        </svg>
      );
    case "ai":
      return (
        <svg {...common}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
          <path d="M12 8 14 12 12 16 10 12Z" />
        </svg>
      );
  }
}
