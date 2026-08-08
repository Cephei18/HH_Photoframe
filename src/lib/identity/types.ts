import type { TierId } from "@/lib/constants";
import type { ArchetypeCategory } from "./banks";

export type GenerateIdentityInput = {
  name: string;
  stack: string;
  /** The processed photo's data URL — folded into the seed so identity is
   * tied to the specific upload, not just the name/stack pair. */
  photoDataUrl: string;
};

export type BuilderIdentity = {
  /** The exact seed every field below was derived from — same inputs, same seed, same identity. */
  seed: number;

  name: string;
  stack: string;

  archetype: string;
  archetypeCategory: ArchetypeCategory;

  signalRank: number; // 0-999
  tier: TierId;

  serial: string; // "HHG26-0483"
  checksum: number; // 0-9, verifiable from the serial's digits

  accessZoneCode: string; // "A" | "B" | "C" | "D"
  accessZoneName: string; // "Genesis Deck"
  arrivalDate: string; // "28 Oct 2026"
  arrivalTime: string; // "14:07 IST"

  terminal: string; // "Σ" | "Δ" | "Ω" | "Φ"
  verificationId: string; // 8-char hex-style seal ID

  /** Renderer-facing variation inputs (Phase 4) — not human-readable fields. */
  stampRotationDeg: number; // believable stamp tilt, e.g. -16..-6
  sealVariation: number; // 0..1, seeds the guilloché rosette's rotation/density
  accentVariation: number; // 0..1, subtle per-pass tint variation within the tier color
};
