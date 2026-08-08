import { describe, expect, it } from "vitest";
import { hexToRgb } from "./palette";

describe("hexToRgb", () => {
  it("parses a lowercase hex string", () => {
    expect(hexToRgb("#a23b26")).toEqual([162, 59, 38]);
  });

  it("parses pure black and white", () => {
    expect(hexToRgb("#000000")).toEqual([0, 0, 0]);
    expect(hexToRgb("#ffffff")).toEqual([255, 255, 255]);
  });
});
