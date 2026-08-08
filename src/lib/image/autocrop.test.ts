import { describe, expect, it } from "vitest";
import { computeAutoCrop, defaultFocal } from "./autocrop";

describe("computeAutoCrop", () => {
  it("produces a rect matching the requested aspect ratio", () => {
    const crop = computeAutoCrop(4000, 3000, 0.75);
    expect(crop.width / crop.height).toBeCloseTo(0.75, 5);
  });

  it("never exceeds the source bounds", () => {
    const crop = computeAutoCrop(1200, 1600, 0.714, { x: 50, y: 50 });
    expect(crop.x).toBeGreaterThanOrEqual(0);
    expect(crop.y).toBeGreaterThanOrEqual(0);
    expect(crop.x + crop.width).toBeLessThanOrEqual(1200 + 1e-6);
    expect(crop.y + crop.height).toBeLessThanOrEqual(1600 + 1e-6);
  });

  it("centers on the focal point when there's room on every side", () => {
    const crop = computeAutoCrop(2000, 2000, 1, { x: 1000, y: 1000 });
    expect(crop.x + crop.width / 2).toBeCloseTo(1000, 5);
    expect(crop.y + crop.height / 2).toBeCloseTo(1000, 5);
  });

  it("clamps toward the edge instead of overflowing when the focal point is near a border", () => {
    const crop = computeAutoCrop(2000, 2000, 1, { x: 10, y: 10 });
    expect(crop.x).toBe(0);
    expect(crop.y).toBe(0);
  });

  it("falls back to defaultFocal (upper-third, horizontally centered) with no focal point given", () => {
    const crop = computeAutoCrop(1000, 1000, 1);
    const focal = defaultFocal(1000, 1000);
    expect(crop.x + crop.width / 2).toBeCloseTo(focal.x, 5);
  });

  it("is a pure function — identical inputs always produce an identical rect", () => {
    const a = computeAutoCrop(1080, 1512, 0.714, { x: 400, y: 300 });
    const b = computeAutoCrop(1080, 1512, 0.714, { x: 400, y: 300 });
    expect(a).toEqual(b);
  });
});
