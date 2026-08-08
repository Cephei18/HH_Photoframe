"use client";

import { useCallback, useRef, useState } from "react";
import { processUpload } from "@/lib/image/pipeline";
import { UploadError, type ProcessedImage } from "@/lib/image/types";

export type UploadStatus = "idle" | "processing" | "ready" | "error";

export type UploadState = {
  status: UploadStatus;
  image: ProcessedImage | null;
  error: string | null;
  fileName: string | null;
};

const idleState: UploadState = { status: "idle", image: null, error: null, fileName: null };

export function useImageUpload() {
  const [state, setState] = useState<UploadState>(idleState);
  // Guards against a stale, slower upload overwriting a newer one if the
  // person swaps photos mid-processing.
  const requestId = useRef(0);

  const upload = useCallback((file: File) => {
    const id = ++requestId.current;
    setState({ status: "processing", image: null, error: null, fileName: file.name });

    processUpload(file).then(
      (image) => {
        if (requestId.current !== id) return;
        setState({ status: "ready", image, error: null, fileName: file.name });
      },
      (err: unknown) => {
        if (requestId.current !== id) return;
        const message =
          err instanceof UploadError ? err.message : "Something went wrong reading that photo.";
        setState({ status: "error", image: null, error: message, fileName: file.name });
      },
    );
  }, []);

  const reset = useCallback(() => {
    requestId.current++;
    setState(idleState);
  }, []);

  return { ...state, upload, reset };
}
