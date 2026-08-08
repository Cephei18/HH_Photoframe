"use client";

import { useCallback, useEffect, useState } from "react";
import { generateIdentity } from "@/lib/identity/generate";
import type { BuilderIdentity } from "@/lib/identity/types";
import { STEP_META, type CeremonyStep } from "@/lib/ceremony/steps";
import { waitFrames } from "@/lib/ceremony/wait-frames";
import type { ProcessedImage } from "@/lib/image/types";
import { AuthorizationOverlay } from "./AuthorizationOverlay";
import { DownloadShareBar } from "./DownloadShareBar";
import { PassCanvas } from "./PassCanvas";

type GenerationStageProps = {
  image: ProcessedImage;
  values: { name: string; stack: string };
  onStartOver: () => void;
};

/**
 * Runs the authorization ceremony AND hosts the result canvases in the
 * same tree — the overlay sits on top of them, not in front of a separate
 * "loading" placeholder, so the moment they're revealed is the exact same
 * DOM the ceremony was quietly rendering underneath. Nothing re-renders
 * when the overlay lifts.
 */
export function GenerationStage({ image, values, onStartOver }: GenerationStageProps) {
  const [step, setStep] = useState<CeremonyStep>("scanning");
  const [identity, setIdentity] = useState<BuilderIdentity | null>(null);
  const [passReady, setPassReady] = useState(false);
  const [pfpReady, setPfpReady] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // The narrative sequence. Deliberately has NO "already started" guard:
  // React's Strict Mode intentionally mounts effects, cleans them up, and
  // mounts them again in dev, to catch exactly this class of bug. A guard
  // ref that persists across that cleanup — combined with `cancelled`
  // aborting the in-flight run — meant the first (aborted) run "used up"
  // the only attempt, and the second mount refused to start a new one:
  // the sequence would cancel itself after the very first step and never
  // resume. Letting each mount run its own independent, self-contained
  // sequence is what actually makes this correct under Strict Mode: the
  // first run aborts cleanly at its next checkpoint, and the second runs
  // to completion. In production (no double-invoke) this is just one run.
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setStep("scanning");
      await waitFrames(STEP_META.scanning.minFrames);
      if (cancelled) return;

      setStep("calibrating");
      await waitFrames(STEP_META.calibrating.minFrames);
      if (cancelled) return;

      const nextIdentity = generateIdentity({ ...values, photoDataUrl: image.dataUrl });
      if (cancelled) return;
      setIdentity(nextIdentity);

      setStep("generating");
      await waitFrames(STEP_META.generating.minFrames);
      if (cancelled) return;

      setStep("serial");
      await waitFrames(STEP_META.serial.minFrames);
      if (cancelled) return;

      // If both canvases already finished rendering during the steps
      // above, the watcher effect below fires the instant this commits —
      // "stamping" may be on screen for a single frame, or not at all.
      setStep("stamping");
    }

    run().catch((err: unknown) => {
      // generateIdentity is pure/deterministic and shouldn't throw for any
      // valid input, but if something unexpected does go wrong here, the
      // alternative is a ceremony frozen forever with no way out — bail
      // back to the start rather than leave the person stuck.
      if (cancelled) return;
      console.error("Authorization sequence failed:", err);
      onStartOver();
    });
    return () => {
      cancelled = true;
    };
    // `image`/`values` are this mount's inputs, captured once — the parent
    // never changes them on a live GenerationStage (a new generation always
    // mounts a fresh instance; see SignalPassExperience).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "authorized" is derived, not stored — it's fully determined by
  // (step, passReady, pfpReady), so deriving it during render is correct
  // React and, as a bonus, it flips true the instant rendering completes
  // whether that happens before or after the narrative reaches "stamping",
  // with no separate effect needed to keep two pieces of state in sync.
  const effectiveStep: CeremonyStep =
    step === "stamping" && passReady && pfpReady ? "authorized" : step;

  // "Settled" deliberately covers both onReady and onError: a render
  // failure shouldn't leave someone staring at "Stamping…" forever. If a
  // canvas errors, PassCanvas already shows its own inline error state
  // underneath — the ceremony should still lift to reveal it.
  const handlePassSettled = useCallback(() => setPassReady(true), []);
  const handlePfpSettled = useCallback(() => setPfpReady(true), []);

  // This one *is* a genuine effect — waiting on real time (a couple of
  // paint frames) before lifting the overlay, not deriving a value.
  useEffect(() => {
    if (effectiveStep !== "authorized") return;
    let cancelled = false;
    waitFrames(2).then(() => {
      if (!cancelled) setRevealed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [effectiveStep]);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="relative aspect-1080/1512 w-full overflow-hidden sm:aspect-auto sm:overflow-visible">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_auto]">
          {identity ? (
            <>
              <PassCanvas
                input={{ identity, image }}
                variant="pass"
                label="Your Signal Pass"
                onReady={handlePassSettled}
                onError={handlePassSettled}
              />
              <div className="w-full max-w-[180px] sm:w-40">
                <PassCanvas
                  input={{ identity, image }}
                  variant="pfp"
                  label="Your PFP frame"
                  onReady={handlePfpSettled}
                  onError={handlePfpSettled}
                />
              </div>
            </>
          ) : null}
        </div>

        {!revealed ? (
          <AuthorizationOverlay step={effectiveStep} photoDataUrl={image.dataUrl} />
        ) : null}
      </div>

      {revealed && identity ? (
        <div className="flex flex-col gap-4">
          <DownloadShareBar input={{ identity, image }} />
          <button
            type="button"
            onClick={onStartOver}
            className="text-ink-soft hover:text-stamp -my-3 self-start px-1 py-3 font-mono text-xs tracking-wide uppercase underline-offset-4 hover:underline"
          >
            Start over
          </button>
        </div>
      ) : null}
    </div>
  );
}
