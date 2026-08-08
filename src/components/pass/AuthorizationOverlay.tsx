"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CEREMONY_STEPS, STEP_META, type CeremonyStep } from "@/lib/ceremony/steps";
import { PALETTE } from "@/lib/render/palette";
import { cn } from "@/lib/utils";

type AuthorizationOverlayProps = {
  step: CeremonyStep;
  photoDataUrl: string;
};

/**
 * A deliberately fixed dark "security screen," independent of the app's
 * own light/dark theme — like the pass itself (see lib/render/palette.ts),
 * this isn't UI chrome that should invert with the viewer's OS setting.
 * Colors are read from the same PALETTE the canvas renderer uses rather
 * than Tailwind's theme-relative tokens, which would otherwise flip
 * `--ink` to a light color under dark mode and turn this screen pale.
 */
export function AuthorizationOverlay({ step, photoDataUrl }: AuthorizationOverlayProps) {
  const meta = STEP_META[step];
  const Icon = meta.icon;
  const stepIndex = CEREMONY_STEPS.indexOf(step);
  const isScanning = step === "scanning";
  const isStamping = step === "stamping";
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.35 }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6"
      style={{ backgroundColor: PALETTE.ink }}
    >
      <div
        className="relative h-28 w-28 overflow-hidden border"
        style={{ borderColor: `${PALETTE.lineStrong}66` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- a data URL preview inside the ceremony, not the final render */}
        <img
          src={photoDataUrl}
          alt=""
          className="h-full w-full object-cover"
          style={{ filter: "grayscale(1) contrast(1.05)" }}
        />
        {isScanning && !reduceMotion ? (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: "100%" }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            className="absolute inset-x-0 h-0.5"
            style={{ backgroundColor: PALETTE.stamp, boxShadow: `0 0 12px ${PALETTE.stamp}` }}
          />
        ) : null}
        {isStamping ? (
          <motion.div
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              className="h-16 w-16 rounded-full border-2 border-dashed"
              style={{ borderColor: `${PALETTE.stamp}b3` }}
            />
          </motion.div>
        ) : null}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
          transition={{ duration: reduceMotion ? 0 : 0.18 }}
          className="flex items-center gap-2 font-mono text-xs tracking-[0.14em] uppercase"
          style={{ color: PALETTE.paperRaised }}
        >
          <Icon size={14} style={{ color: PALETTE.stamp }} aria-hidden="true" />
          {meta.label}
        </motion.div>
      </AnimatePresence>

      <div
        className="flex gap-1.5"
        role="progressbar"
        aria-valuenow={stepIndex + 1}
        aria-valuemin={1}
        aria-valuemax={CEREMONY_STEPS.length}
        aria-label="Authorization progress"
      >
        {CEREMONY_STEPS.map((s, i) => (
          <span
            key={s}
            className={cn("h-1 w-5 transition-colors")}
            style={{ backgroundColor: i <= stepIndex ? PALETTE.stamp : `${PALETTE.lineStrong}66` }}
          />
        ))}
      </div>
    </motion.div>
  );
}
