import { describe, expect, it } from "vitest";
import { TIERS } from "@/lib/constants";
import { computeChecksum } from "./checksum";
import { generateIdentity } from "./generate";

const samplePhoto = "data:image/jpeg;base64,AAAABBBBCCCC";
const base = { chainStamps: ["ethereum" as const], domain: "generic" as const };

describe("generateIdentity", () => {
  it("is deterministic — same inputs always produce the same identity", () => {
    const a = generateIdentity({
      ...base,
      name: "Kay",
      stack: "React, Solidity",
      photoDataUrl: samplePhoto,
    });
    const b = generateIdentity({
      ...base,
      name: "Kay",
      stack: "React, Solidity",
      photoDataUrl: samplePhoto,
    });
    expect(a).toEqual(b);
  });

  it("changes identity when any input changes", () => {
    const baseArgs = { ...base, name: "Kay", stack: "React", photoDataUrl: samplePhoto };
    const differentName = generateIdentity({ ...baseArgs, name: "Jay" });
    const differentStack = generateIdentity({ ...baseArgs, stack: "Solidity" });
    const differentPhoto = generateIdentity({ ...baseArgs, photoDataUrl: samplePhoto + "X" });
    const base_ = generateIdentity(baseArgs);
    expect(base_.seed).not.toBe(differentName.seed);
    expect(base_.seed).not.toBe(differentStack.seed);
    expect(base_.seed).not.toBe(differentPhoto.seed);
  });

  it("carries the chosen chain stamps through untouched, without affecting the seed", () => {
    const baseArgs = { name: "Kay", stack: "React", domain: "generic" as const, photoDataUrl: samplePhoto };
    const ethereum = generateIdentity({ ...baseArgs, chainStamps: ["ethereum"] });
    const solana = generateIdentity({ ...baseArgs, chainStamps: ["solana", "rust"] });
    expect(ethereum.chainStamps).toEqual(["ethereum"]);
    expect(solana.chainStamps).toEqual(["solana", "rust"]);
    // Picking different stamp flavors must not reshuffle the rest of the
    // identity — it's a personalization choice, not a seed input.
    expect(ethereum.seed).toBe(solana.seed);
    expect(ethereum.tier).toBe(solana.tier);
    expect(ethereum.serial).toBe(solana.serial);
  });

  it("dedupes and caps chain stamps at MAX_CHAIN_STAMPS", () => {
    const identity = generateIdentity({
      name: "Kay",
      stack: "React",
      domain: "generic",
      photoDataUrl: samplePhoto,
      chainStamps: ["ethereum", "ethereum", "solana", "bitcoin", "ai", "rust"],
    });
    expect(identity.chainStamps).toEqual(["ethereum", "solana", "bitcoin", "ai"]);
  });

  it("produces a serial matching HHG<year>-#### and a recomputable checksum", () => {
    const identity = generateIdentity({
      ...base,
      name: "Kay",
      stack: "Rust",
      photoDataUrl: samplePhoto,
    });
    expect(identity.serial).toMatch(/^HHG26-\d{4}$/);
    const digits = identity.serial.split("-")[1];
    expect(identity.checksum).toBe(computeChecksum(digits));
  });

  it("always assigns a valid tier", () => {
    const identity = generateIdentity({
      ...base,
      name: "Kay",
      stack: "",
      photoDataUrl: samplePhoto,
    });
    expect(TIERS.map((t) => t.id)).toContain(identity.tier);
  });

  it("keeps signal rank, seal variation, and accent variation in range", () => {
    const identity = generateIdentity({
      ...base,
      name: "Kay",
      stack: "Go",
      photoDataUrl: samplePhoto,
    });
    expect(identity.signalRank).toBeGreaterThanOrEqual(0);
    expect(identity.signalRank).toBeLessThan(1000);
    expect(identity.sealVariation).toBeGreaterThanOrEqual(0);
    expect(identity.sealVariation).toBeLessThan(1);
    expect(identity.accentVariation).toBeGreaterThanOrEqual(0);
    expect(identity.accentVariation).toBeLessThan(1);
    expect(identity.stampRotationDeg).toBeGreaterThanOrEqual(-16);
    expect(identity.stampRotationDeg).toBeLessThanOrEqual(-6);
  });

  it("uses the explicitly chosen domain as the archetype category, regardless of stack text", () => {
    // Domain is a picked field (see DOMAIN_OPTIONS), not guessed from
    // `stack` — a stack string that would once have matched a different
    // category by keyword must not override the person's own choice.
    const identity = generateIdentity({
      name: "Kay",
      stack: "React, Solidity",
      domain: "crypto",
      chainStamps: ["ethereum"],
      photoDataUrl: samplePhoto,
    });
    expect(identity.archetypeCategory).toBe("crypto");
  });

  it("distributes tiers close to the declared 55/35/10 odds over many draws", () => {
    const counts: Record<string, number> = { noise: 0, signal: 0, alpha: 0 };
    const N = 5000;
    for (let i = 0; i < N; i++) {
      const identity = generateIdentity({
        ...base,
        name: `Builder ${i}`,
        stack: "React",
        photoDataUrl: samplePhoto,
      });
      counts[identity.tier]++;
    }
    expect(counts.noise / N).toBeGreaterThan(0.5);
    expect(counts.noise / N).toBeLessThan(0.6);
    expect(counts.signal / N).toBeGreaterThan(0.3);
    expect(counts.signal / N).toBeLessThan(0.4);
    expect(counts.alpha / N).toBeGreaterThan(0.06);
    expect(counts.alpha / N).toBeLessThan(0.14);
  });
});
