import { describe, expect, it } from "vitest";
import { generateIdentity } from "@/lib/identity/generate";
import { buildMrzLines } from "./mrz";

const samplePhoto = "data:image/jpeg;base64,AAAABBBBCCCC";
const chainStamps = ["ethereum" as const];
const domain = "generic" as const;

describe("buildMrzLines", () => {
  it("produces two fixed-length, MRZ-alphabet-only lines", () => {
    const identity = generateIdentity({
      name: "Kay",
      stack: "React",
      photoDataUrl: samplePhoto,
      chainStamps,
      domain,
    });
    const [line1, line2] = buildMrzLines(identity);
    expect(line1).toHaveLength(36);
    expect(line2).toHaveLength(36);
    expect(line1).toMatch(/^[A-Z0-9<]{36}$/);
    expect(line2).toMatch(/^[A-Z0-9<]{36}$/);
  });

  it("actually encodes the name and stack, not filler", () => {
    const identity = generateIdentity({
      name: "Kay Verma",
      stack: "React",
      photoDataUrl: samplePhoto,
      chainStamps,
      domain,
    });
    const [line1] = buildMrzLines(identity);
    expect(line1).toContain("KAY<VERMA");
    expect(line1).toContain("REACT");
  });

  it("encodes the serial digits and checksum verbatim in line 2", () => {
    const identity = generateIdentity({
      name: "Kay",
      stack: "Go",
      photoDataUrl: samplePhoto,
      chainStamps,
      domain,
    });
    const [, line2] = buildMrzLines(identity);
    const serialDigits = identity.serial.split("-")[1];
    expect(line2.startsWith(`${serialDigits}${identity.checksum}`)).toBe(true);
  });

  it("sanitizes punctuation and unicode to the MRZ filler character", () => {
    const identity = generateIdentity({
      name: "Kay-Élise",
      stack: "C++",
      photoDataUrl: samplePhoto,
      chainStamps,
      domain,
    });
    const [line1] = buildMrzLines(identity);
    expect(line1).toMatch(/^[A-Z0-9<]{36}$/);
  });

  it("is deterministic for the same identity", () => {
    const identity = generateIdentity({
      name: "Kay",
      stack: "Rust",
      photoDataUrl: samplePhoto,
      chainStamps,
      domain,
    });
    expect(buildMrzLines(identity)).toEqual(buildMrzLines(identity));
  });
});
