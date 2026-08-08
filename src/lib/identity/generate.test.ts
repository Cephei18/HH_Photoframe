import { describe, expect, it } from "vitest";
import { TIERS } from "@/lib/constants";
import { computeChecksum } from "./checksum";
import { generateIdentity } from "./generate";

const samplePhoto = "data:image/jpeg;base64,AAAABBBBCCCC";

describe("generateIdentity", () => {
  it("is deterministic — same inputs always produce the same identity", () => {
    const a = generateIdentity({
      name: "Kay",
      stack: "React, Solidity",
      photoDataUrl: samplePhoto,
    });
    const b = generateIdentity({
      name: "Kay",
      stack: "React, Solidity",
      photoDataUrl: samplePhoto,
    });
    expect(a).toEqual(b);
  });

  it("changes identity when any input changes", () => {
    const base = generateIdentity({ name: "Kay", stack: "React", photoDataUrl: samplePhoto });
    const differentName = generateIdentity({
      name: "Jay",
      stack: "React",
      photoDataUrl: samplePhoto,
    });
    const differentStack = generateIdentity({
      name: "Kay",
      stack: "Solidity",
      photoDataUrl: samplePhoto,
    });
    const differentPhoto = generateIdentity({
      name: "Kay",
      stack: "React",
      photoDataUrl: samplePhoto + "X",
    });
    expect(base.seed).not.toBe(differentName.seed);
    expect(base.seed).not.toBe(differentStack.seed);
    expect(base.seed).not.toBe(differentPhoto.seed);
  });

  it("produces a serial matching HHG<year>-#### and a recomputable checksum", () => {
    const identity = generateIdentity({ name: "Kay", stack: "Rust", photoDataUrl: samplePhoto });
    expect(identity.serial).toMatch(/^HHG26-\d{4}$/);
    const digits = identity.serial.split("-")[1];
    expect(identity.checksum).toBe(computeChecksum(digits));
  });

  it("always assigns a valid tier", () => {
    const identity = generateIdentity({ name: "Kay", stack: "", photoDataUrl: samplePhoto });
    expect(TIERS.map((t) => t.id)).toContain(identity.tier);
  });

  it("keeps signal rank, seal variation, and accent variation in range", () => {
    const identity = generateIdentity({ name: "Kay", stack: "Go", photoDataUrl: samplePhoto });
    expect(identity.signalRank).toBeGreaterThanOrEqual(0);
    expect(identity.signalRank).toBeLessThan(1000);
    expect(identity.sealVariation).toBeGreaterThanOrEqual(0);
    expect(identity.sealVariation).toBeLessThan(1);
    expect(identity.accentVariation).toBeGreaterThanOrEqual(0);
    expect(identity.accentVariation).toBeLessThan(1);
    expect(identity.stampRotationDeg).toBeGreaterThanOrEqual(-16);
    expect(identity.stampRotationDeg).toBeLessThanOrEqual(-6);
  });

  it("falls back to the generic archetype bank for an unrecognized stack", () => {
    const identity = generateIdentity({
      name: "Kay",
      stack: "underwater basket weaving",
      photoDataUrl: samplePhoto,
    });
    expect(identity.archetypeCategory).toBe("generic");
  });

  it("matches a recognizable stack to its flavor category", () => {
    const identity = generateIdentity({
      name: "Kay",
      stack: "Solidity + Foundry",
      photoDataUrl: samplePhoto,
    });
    expect(identity.archetypeCategory).toBe("crypto");
  });

  it("distributes tiers close to the declared 55/35/10 odds over many draws", () => {
    const counts: Record<string, number> = { noise: 0, signal: 0, alpha: 0 };
    const N = 5000;
    for (let i = 0; i < N; i++) {
      const identity = generateIdentity({
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
