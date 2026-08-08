import {
  Fingerprint,
  Gauge,
  Hash,
  ScanLine,
  Stamp,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";

/**
 * The six authorization beats. Every transition between these is gated on
 * real work finishing — see `useAuthorizationSequence` — never on a timer.
 * `minFrames` is not a padded delay: it's the minimum number of paint
 * frames (~16ms each) a step holds so a human can register the label
 * changed at all before the (already-complete) next real step is shown.
 * It is never used to wait for work that hasn't finished.
 */
export type CeremonyStep =
  "scanning" | "calibrating" | "generating" | "serial" | "stamping" | "authorized";

export const CEREMONY_STEPS: CeremonyStep[] = [
  "scanning",
  "calibrating",
  "generating",
  "serial",
  "stamping",
  "authorized",
];

export const STEP_META: Record<
  CeremonyStep,
  { label: string; icon: LucideIcon; minFrames: number }
> = {
  scanning: { label: "Scanning portrait", icon: ScanLine, minFrames: 3 },
  calibrating: { label: "Calibrating signal", icon: Gauge, minFrames: 3 },
  generating: { label: "Generating identity", icon: Fingerprint, minFrames: 3 },
  serial: { label: "Issuing serial", icon: Hash, minFrames: 3 },
  // No minFrames floor — this step's real duration (photo decode + duotone
  // + full canvas draw) already dwarfs a few paint frames, so imposing one
  // would just be padding on top of already-real work.
  stamping: { label: "Stamping", icon: Stamp, minFrames: 0 },
  authorized: { label: "Authorized — welcome to Goa", icon: BadgeCheck, minFrames: 0 },
};
