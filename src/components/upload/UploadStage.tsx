"use client";

import { AnimatePresence, motion } from "motion/react";
import type { UploadState } from "@/hooks/use-image-upload";
import { UploadDropzone } from "./UploadDropzone";
import { UploadPreview } from "./UploadPreview";

type UploadStageProps = UploadState & {
  onFile: (file: File) => void;
  onReset: () => void;
};

/**
 * Takes upload state as props rather than calling `useImageUpload` itself
 * — the parent owns the one hook instance for the whole experience, since
 * it needs the same state to decide what comes after upload.
 */
export function UploadStage({ status, image, error, fileName, onFile, onReset }: UploadStageProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      <AnimatePresence mode="wait" initial={false}>
        {status === "ready" && image ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            <UploadPreview image={image} fileName={fileName} onChangePhoto={onReset} />
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-2"
          >
            {error ? (
              <p className="text-stamp font-mono text-xs tracking-wide uppercase">{error}</p>
            ) : null}
            <UploadDropzone onFile={onFile} disabled={status === "processing"} />
            {status === "processing" ? (
              <p className="text-ink-faint animate-pulse font-mono text-xs tracking-wide uppercase">
                Reading {fileName} …
              </p>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
