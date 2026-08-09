import type { ChainStampId } from "@/lib/constants";

type ChainStampIconProps = {
  id: ChainStampId;
  size?: number;
  className?: string;
};

/**
 * Small abstracted glyphs for each stamp flavor — a diamond, stacked bars,
 * a struck coin, a spark, a faceted hex, a cog ring, interlocking curves,
 * angle brackets. Deliberately geometric nods rather than literal
 * trademarked logos, same restraint as the guilloché's Ethereum-facet
 * motif in the renderer. `drawChainGlyph` (lib/render) draws the canvas
 * version of these same shapes; keep them in sync if either changes.
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
    case "solidity":
      return (
        <svg {...common}>
          <path d="M12 3 18 6.5 18 13 12 16.5 6 13 6 6.5Z" />
          <path d="M12 9 16 11 16 15.5 12 17.5 8 15.5 8 11Z" />
        </svg>
      );
    case "rust":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v3M12 18v3M21 12h-3M6 12H3M18.4 5.6 16.2 7.8M7.8 16.2 5.6 18.4M18.4 18.4 16.2 16.2M7.8 7.8 5.6 5.6" />
        </svg>
      );
    case "python":
      return (
        <svg {...common}>
          <path d="M12 3q7 0 7 6.5T12 12" />
          <path d="M12 21q-7 0-7-6.5T12 12" />
          <circle cx="9" cy="6" r="0.6" fill="currentColor" />
          <circle cx="15" cy="18" r="0.6" fill="currentColor" />
        </svg>
      );
    case "typescript":
      return (
        <svg {...common}>
          <path d="M9 5 3 12l6 7M15 5l6 7-6 7" />
          <path d="M10.5 15.5h3" />
        </svg>
      );
  }
}
