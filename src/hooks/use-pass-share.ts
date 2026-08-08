"use client";

import { useCallback, useState } from "react";
import { CARD } from "@/lib/constants";
import { downloadBlob, filenameForSerial } from "@/lib/render/download";
import { renderToBlob } from "@/lib/render/export";
import type { RenderInput } from "@/lib/render/types";
import { buildShareText, buildTweetIntentUrl, detectShareCapability } from "@/lib/share";

export type ShareStatus =
  | "idle"
  | "preparing"
  | "shared"
  /** The share sheet doesn't take files here — the image was downloaded
   * instead, and X's own compose window opened for the caption. The UI
   * needs this state specifically so it can tell the person to attach it. */
  | "downloaded-for-manual-attach"
  | "cancelled"
  | "error";

/**
 * X's intent-link compose window can't take an attached image — only the
 * Web Share API can hand a browser's native share sheet a file directly,
 * and only some browsers support that for files at all. This hook tries
 * the rich path first and always has a working fallback, rather than
 * assuming either capability.
 */
export function usePassShare() {
  const [status, setStatus] = useState<ShareStatus>("idle");

  const share = useCallback(async (input: RenderInput) => {
    setStatus("preparing");
    try {
      const blob = await renderToBlob(input, "pass", {
        pixelWidth: CARD.width * CARD.exportScale,
        pixelHeight: CARD.height * CARD.exportScale,
      });
      const filename = filenameForSerial(input.identity.serial, "pass");
      const file = new File([blob], filename, { type: "image/png" });
      const text = buildShareText(input.identity);

      const capability = detectShareCapability(file);
      if (capability === "files") {
        await navigator.share({ files: [file], text });
        setStatus("shared");
        return;
      }

      downloadBlob(blob, filename);
      window.open(buildTweetIntentUrl(input.identity), "_blank", "noopener,noreferrer");
      setStatus("downloaded-for-manual-attach");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setStatus("cancelled");
        return;
      }
      setStatus("error");
    }
  }, []);

  return { status, share };
}
