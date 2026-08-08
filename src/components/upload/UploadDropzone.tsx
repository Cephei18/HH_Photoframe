"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif";

type UploadDropzoneProps = {
  onFile: (file: File) => void;
  disabled?: boolean;
};

export function UploadDropzone({ onFile, disabled }: UploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onFile(file);
  }

  function handleDragOver(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    if (!disabled) setIsDragActive(true);
  }

  function handleDragLeave() {
    setIsDragActive(false);
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDragActive(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
    // Allow choosing the same file again after a reset.
    e.target.value = "";
  }

  return (
    <motion.label
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      animate={{ borderColor: isDragActive ? "var(--stamp)" : "var(--line-strong)" }}
      transition={{ duration: reduceMotion ? 0 : 0.15 }}
      className={cn(
        "bg-paper-raised flex aspect-4/5 w-full cursor-pointer flex-col items-center justify-center gap-3 border border-dashed text-center",
        isDragActive && "bg-stamp-soft/40",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
        aria-label="Upload a photo"
      />
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-ink-faint"
        aria-hidden="true"
      >
        <path d="M12 16V4m0 0 4 4m-4-4-4 4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" strokeLinecap="round" />
      </svg>
      <p className="text-ink-faint px-6 font-mono text-xs tracking-wide uppercase">
        Drop a photo, or tap to upload
      </p>
      {/* No opacity modifier here — text-ink-faint alone already sits right at
          WCAG AA's 4.5:1 floor; stacking opacity on top of an already-faint
          color is exactly how this failed contrast auditing the first time. */}
      <p className="text-ink-faint px-6 font-mono text-[10px] tracking-wide uppercase">
        JPG · PNG · WebP · HEIC
      </p>
    </motion.label>
  );
}
