"use client";

import { useEffect } from "react";
import { useElementWidth } from "@/hooks/use-element-width";
import { usePassCanvas } from "@/hooks/use-pass-canvas";
import type { PassVariant, RenderInput } from "@/lib/render/types";
import { cn } from "@/lib/utils";

type PassCanvasProps = {
  input: RenderInput;
  variant: PassVariant;
  className?: string;
  label: string;
  /** Fires the instant this variant's real render completes — the signal
   * GenerationStage's ceremony waits on, not a timer. Callers that need
   * this to fire exactly once per status change should pass a
   * `useCallback`-stable function (GenerationStage does). */
  onReady?: () => void;
  onError?: () => void;
};

/** Self-measuring — sizes its canvas to whatever width its own responsive
 * container gives it, then renders at true device pixel density. */
export function PassCanvas({
  input,
  variant,
  className,
  label,
  onReady,
  onError,
}: PassCanvasProps) {
  const [wrapperRef, width] = useElementWidth<HTMLDivElement>();
  const { canvasRef, status } = usePassCanvas(input, variant, width || 1);

  useEffect(() => {
    if (status === "ready") onReady?.();
    if (status === "error") onError?.();
    // Deliberately keyed on `status` alone — re-firing when a caller
    // passes a fresh inline closure each render would call it repeatedly
    // for a status that hasn't actually changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div ref={wrapperRef} className={cn("relative w-full", className)}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        className={cn(
          variant === "pfp" ? "rounded-full" : "",
          "bg-paper-raised block w-full shadow-[0_18px_34px_-12px_rgba(28,26,21,0.25)]",
        )}
      />
      {status === "rendering" ? (
        <div className="bg-paper-raised/60 absolute inset-0 flex items-center justify-center">
          <span className="text-ink-faint animate-pulse font-mono text-[10px] tracking-wide uppercase">
            Rendering…
          </span>
        </div>
      ) : null}
      {status === "error" ? (
        <div className="bg-paper-raised absolute inset-0 flex items-center justify-center">
          <span className="text-stamp font-mono text-[10px] tracking-wide uppercase">
            Couldn&apos;t render this pass
          </span>
        </div>
      ) : null}
    </div>
  );
}
