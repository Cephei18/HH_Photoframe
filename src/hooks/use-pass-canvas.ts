"use client";

import { useEffect, useRef, useState } from "react";
import { CARD } from "@/lib/constants";
import { renderToCanvas } from "@/lib/render/canvas";
import type { PassVariant, RenderInput } from "@/lib/render/types";

const LOGICAL_ASPECT: Record<PassVariant, number> = {
  pass: CARD.width / CARD.height,
  pfp: 1,
};

export type PassCanvasStatus = "idle" | "rendering" | "ready" | "error";

/** Drives a `<canvas>` at a given CSS display width, rendering at true
 * device pixel density so the preview is always crisp — never the source
 * of any preview/export mismatch, since both paths render through the
 * same `renderToCanvas`. */
export function usePassCanvas(
  input: RenderInput | null,
  variant: PassVariant,
  displayWidth: number,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<PassCanvasStatus>("idle");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!input || !canvas) return;

    let cancelled = false;
    setStatus("rendering");

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const displayHeight = displayWidth / LOGICAL_ASPECT[variant];
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    renderToCanvas(
      canvas,
      input,
      {
        pixelWidth: Math.round(displayWidth * dpr),
        pixelHeight: Math.round(displayHeight * dpr),
      },
      variant,
    ).then(
      () => {
        if (!cancelled) setStatus("ready");
      },
      () => {
        if (!cancelled) setStatus("error");
      },
    );

    return () => {
      cancelled = true;
    };
  }, [input, variant, displayWidth]);

  return { canvasRef, status };
}
