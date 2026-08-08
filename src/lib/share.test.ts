import { describe, expect, it } from "vitest";
import { generateIdentity } from "@/lib/identity/generate";
import { buildShareText, buildTweetIntentUrl } from "./share";

const samplePhoto = "data:image/jpeg;base64,AAAABBBBCCCC";

describe("buildShareText", () => {
  it("substitutes the real hashtag into the tier's caption template", () => {
    const identity = generateIdentity({ name: "Kay", stack: "React", photoDataUrl: samplePhoto });
    const text = buildShareText(identity);
    expect(text).toContain("#FrameInGoa");
    expect(text).not.toContain("{hashtag}");
  });

  it("produces a distinct caption per tier", () => {
    const noise = buildShareText({ tier: "noise" } as never);
    const signal = buildShareText({ tier: "signal" } as never);
    const alpha = buildShareText({ tier: "alpha" } as never);
    expect(new Set([noise, signal, alpha]).size).toBe(3);
  });
});

describe("buildTweetIntentUrl", () => {
  it("builds a valid x.com intent URL containing the encoded caption", () => {
    const identity = generateIdentity({ name: "Kay", stack: "React", photoDataUrl: samplePhoto });
    const url = buildTweetIntentUrl(identity);
    expect(url.startsWith("https://x.com/intent/tweet?")).toBe(true);
    // Parsed back with URLSearchParams, the same encoding convention the
    // URL was built with — not decodeURIComponent, which doesn't treat
    // "+" as a space the way x-www-form-urlencoded query strings do.
    const params = new URLSearchParams(url.split("?")[1]);
    expect(params.get("text")).toBe(buildShareText(identity));
  });
});
