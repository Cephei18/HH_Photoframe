"use client";

import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePassExport } from "@/hooks/use-pass-export";
import { usePassShare } from "@/hooks/use-pass-share";
import type { RenderInput } from "@/lib/render/types";

type DownloadShareBarProps = {
  input: RenderInput;
};

const DOWNLOAD_LABEL: Record<"idle" | "exporting" | "done" | "error", string> = {
  idle: "Download",
  exporting: "Preparing…",
  done: "Saved",
  error: "Try again",
};

const SHARE_LABEL: Record<
  "idle" | "preparing" | "shared" | "downloaded-for-manual-attach" | "cancelled" | "error",
  string
> = {
  idle: "Share to X",
  preparing: "Preparing…",
  shared: "Shared",
  "downloaded-for-manual-attach": "Saved — attach it",
  cancelled: "Share to X",
  error: "Try again",
};

export function DownloadShareBar({ input }: DownloadShareBarProps) {
  const { passStatus, pfpStatus, downloadPass, downloadPfp } = usePassExport();
  const { status: shareStatus, share } = usePassShare();

  return (
    <div className="flex w-full flex-col gap-3">
      <Button
        type="button"
        size="lg"
        onClick={() => share(input)}
        disabled={shareStatus === "preparing"}
        className="h-12 w-full gap-2 font-mono text-sm tracking-wide uppercase"
      >
        <Share2 size={16} aria-hidden="true" />
        {SHARE_LABEL[shareStatus]}
      </Button>
      {shareStatus === "downloaded-for-manual-attach" ? (
        <p className="text-ink-faint font-mono text-[11px] tracking-wide uppercase">
          Photo saved to your device — attach it to the post that just opened.
        </p>
      ) : null}
      {shareStatus === "error" ? (
        <p className="text-stamp font-mono text-[11px] tracking-wide uppercase">
          Couldn&apos;t open the share sheet — download below and post manually.
        </p>
      ) : null}

      <div className="flex w-full flex-wrap gap-3">
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={() => downloadPass(input)}
          disabled={passStatus === "exporting"}
          className="h-11 flex-1 gap-2 font-mono text-xs tracking-wide uppercase"
        >
          <Download size={14} aria-hidden="true" />
          {DOWNLOAD_LABEL[passStatus]} pass
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={() => downloadPfp(input)}
          disabled={pfpStatus === "exporting"}
          className="h-11 flex-1 gap-2 font-mono text-xs tracking-wide uppercase"
        >
          <Download size={14} aria-hidden="true" />
          {DOWNLOAD_LABEL[pfpStatus]} PFP
        </Button>
      </div>
    </div>
  );
}
