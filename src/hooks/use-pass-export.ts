"use client";

import { useCallback, useState } from "react";
import { CARD } from "@/lib/constants";
import { downloadBlob, filenameForSerial } from "@/lib/render/download";
import { renderToBlob } from "@/lib/render/export";
import type { RenderInput } from "@/lib/render/types";

export type ExportStatus = "idle" | "exporting" | "done" | "error";

/**
 * Re-renders at full retina export resolution and triggers a download.
 * Deliberately a fresh render rather than upscaling the on-screen preview
 * canvas — the preview is sized to whatever the device's viewport gave it
 * (often well under retina resolution on a small phone), so the only way
 * to get a true high-res PNG is to run `renderToCanvas` again at the
 * target size. It's the same draw code either way, so the result still
 * matches the preview pixel-for-pixel, just larger.
 */
export function usePassExport() {
  const [passStatus, setPassStatus] = useState<ExportStatus>("idle");
  const [pfpStatus, setPfpStatus] = useState<ExportStatus>("idle");

  const downloadPass = useCallback(async (input: RenderInput) => {
    setPassStatus("exporting");
    try {
      const blob = await renderToBlob(input, "pass", {
        pixelWidth: CARD.width * CARD.exportScale,
        pixelHeight: CARD.height * CARD.exportScale,
      });
      downloadBlob(blob, filenameForSerial(input.identity.serial, "pass"));
      setPassStatus("done");
    } catch {
      setPassStatus("error");
    }
  }, []);

  const downloadPfp = useCallback(async (input: RenderInput) => {
    setPfpStatus("exporting");
    try {
      const blob = await renderToBlob(input, "pfp", {
        pixelWidth: CARD.pfpSize * CARD.exportScale,
        pixelHeight: CARD.pfpSize * CARD.exportScale,
      });
      downloadBlob(blob, filenameForSerial(input.identity.serial, "pfp"));
      setPfpStatus("done");
    } catch {
      setPfpStatus("error");
    }
  }, []);

  return { passStatus, pfpStatus, downloadPass, downloadPfp };
}
