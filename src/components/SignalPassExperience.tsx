"use client";

import { useState } from "react";
import { GenerationStage } from "@/components/pass/GenerationStage";
import { IdentityForm } from "@/components/pass/IdentityForm";
import { UploadStage } from "@/components/upload/UploadStage";
import { useImageUpload } from "@/hooks/use-image-upload";
import type { ChainStampId } from "@/lib/constants";
import type { ArchetypeCategory } from "@/lib/identity/banks";

/**
 * The whole product, end to end. Stage is derived from upload state +
 * whether the person has submitted their details — one fewer place for
 * the UI to disagree with reality. `useImageUpload` is owned here, once,
 * and threaded down as props (see UploadStage) rather than called again
 * lower in the tree.
 */
export function SignalPassExperience() {
  const { status, image, error, fileName, upload, reset } = useImageUpload();
  const [pendingValues, setPendingValues] = useState<{
    name: string;
    stack: string;
    chainStamps: ChainStampId[];
    domain: ArchetypeCategory;
  } | null>(null);

  const stage = !image ? "upload" : !pendingValues ? "details" : "generating";

  function handleStartOver() {
    setPendingValues(null);
    reset();
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {stage === "upload" ? (
        <div className="w-full sm:max-w-sm">
          <UploadStage
            status={status}
            image={image}
            error={error}
            fileName={fileName}
            onFile={upload}
            onReset={reset}
          />
        </div>
      ) : null}

      {stage === "details" ? (
        <div className="w-full sm:max-w-sm">
          <IdentityForm onSubmit={setPendingValues} />
        </div>
      ) : null}

      {stage === "generating" && image && pendingValues ? (
        <GenerationStage image={image} values={pendingValues} onStartOver={handleStartOver} />
      ) : null}
    </div>
  );
}
