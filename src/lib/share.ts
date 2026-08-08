import { EVENT, SHARE_CAPTIONS } from "@/lib/constants";
import type { BuilderIdentity } from "@/lib/identity/types";

/** Fills in the tier-specific caption template with the real hashtag —
 * the one place share copy differs by tier, done because a "Noise" pull is
 * still worth posting, not despite being common. */
export function buildShareText(identity: BuilderIdentity): string {
  return SHARE_CAPTIONS[identity.tier].replace("{hashtag}", EVENT.hashtag);
}

export function buildTweetIntentUrl(identity: BuilderIdentity): string {
  const params = new URLSearchParams({ text: buildShareText(identity) });
  return `https://x.com/intent/tweet?${params.toString()}`;
}

export type WebShareCapability = "files" | "text-only" | "unsupported";

/** Feature-detects what the current browser's native share sheet can
 * actually do with an image file, without ever throwing. */
export function detectShareCapability(file: File): WebShareCapability {
  if (typeof navigator === "undefined" || !navigator.share) return "unsupported";
  const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] })) return "files";
  return "text-only";
}
