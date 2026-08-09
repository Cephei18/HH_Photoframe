import { ACCESS_ZONES, EVENT, MAX_CHAIN_STAMPS, TERMINALS, TIERS } from "@/lib/constants";
import { ARCHETYPE_BANKS, categoryFromStack } from "./banks";
import { computeChecksum } from "./checksum";
import { fnv1a, mulberry32, pickIndex, pickWeightedIndex } from "./hash";
import type { BuilderIdentity, GenerateIdentityInput } from "./types";

/**
 * Generates a complete, deterministic builder identity from one seed.
 *
 * Every field is drawn from a single `mulberry32` stream seeded by
 * `fnv1a(name + stack + photo)`, in the FIXED order below. Do not reorder or
 * conditionally skip a draw — doing so would shift every later field for
 * every future input, silently changing everyone's identity retroactively.
 * Add new draws at the end of the sequence, never in the middle.
 */
export function generateIdentity(input: GenerateIdentityInput): BuilderIdentity {
  const name = input.name.trim() || "Builder";
  const stack = input.stack.trim();

  // chainStamps is deliberately NOT folded into the seed string below —
  // it's a direct personalization choice, not something that should
  // reshuffle someone's tier/archetype/serial if they change their mind
  // about which stamp flavors they want. Capped defensively even though
  // the form already enforces the limit, and deduped so picking the same
  // stamp twice can't produce two overlapping visa stamps on the pass.
  const chainStamps = [...new Set(input.chainStamps)].slice(0, MAX_CHAIN_STAMPS);
  const seed = fnv1a(`${name}::${stack}::${input.photoDataUrl}`);
  const next = mulberry32(seed);

  // 1. Tier — weighted by TIERS' real distribution (Noise 55 / Signal 35 / Alpha 10).
  const tierIndex = pickWeightedIndex(
    next,
    TIERS.map((t) => t.weight),
  );
  const tier = TIERS[tierIndex].id;

  // 2. Signal Rank — the single confident number, 0-999.
  const signalRank = Math.floor(next() * 1000);

  // 3-4. Archetype — category from the stack (deterministic keyword match,
  // not a draw), then trait + role drawn from that category's bank.
  const archetypeCategory = categoryFromStack(stack);
  const bank = ARCHETYPE_BANKS[archetypeCategory];
  const trait = bank.traits[pickIndex(next, bank.traits.length)];
  const role = bank.roles[pickIndex(next, bank.roles.length)];
  const archetype = `${trait} ${role}`;

  // 5. Serial — a 4-digit number under the fixed HHG<year> prefix.
  const serialNumber = Math.floor(next() * 10000);
  const serialDigits = String(serialNumber).padStart(4, "0");
  const serial = `HHG${EVENT.yearShort}-${serialDigits}`;

  // Checksum is DERIVED from the serial's digits, not drawn — a real,
  // recomputable mod-10 check digit rather than another random field.
  const checksum = computeChecksum(serialDigits);

  // 6. Access Zone — one of HH Goa's own four residency days.
  const zoneIndex = pickIndex(next, ACCESS_ZONES.length);
  const zone = ACCESS_ZONES[zoneIndex];

  // 7-8. Arrival time within that day.
  const hour = 9 + Math.floor(next() * 15); // 09:00–23:59
  const minute = Math.floor(next() * 60);
  const arrivalTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} IST`;

  // 9. Terminal — a protocol-culture nod (Greek letter), not a chain logo.
  const terminal = TERMINALS[pickIndex(next, TERMINALS.length)];

  // 10. Stamp rotation — a believable customs-stamp tilt, never wild.
  const stampRotationDeg = -16 + next() * 10; // -16..-6

  // 11-12. Renderer-facing variation seeds for Phase 4 (guilloché rosette,
  // accent micro-tint) — kept as raw 0..1 values, not yet interpreted here.
  const sealVariation = next();
  const accentVariation = next();

  // Verification ID is DERIVED from the seed itself, not drawn — every
  // pass's seal ID is the seed's own fingerprint, recoverable from nothing
  // but the seed.
  const verificationId = seed.toString(16).toUpperCase().padStart(8, "0");

  return {
    seed,
    name,
    stack,
    chainStamps,
    archetype,
    archetypeCategory,
    signalRank,
    tier,
    serial,
    checksum,
    accessZoneCode: zone.code,
    accessZoneName: zone.name,
    arrivalDate: zone.date,
    arrivalTime,
    terminal,
    verificationId,
    stampRotationDeg,
    sealVariation,
    accentVariation,
  };
}
