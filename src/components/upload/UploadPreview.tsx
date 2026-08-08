"use client";

import { computeAutoCrop } from "@/lib/image/autocrop";
import { PASS_LAYOUT } from "@/lib/render/layout";
import type { ProcessedImage } from "@/lib/image/types";

type UploadPreviewProps = {
  image: ProcessedImage;
  fileName: string | null;
  onChangePhoto: () => void;
};

// The pass's full-bleed photo band is narrower than the whole card (the
// identity/MRZ bands below it eat into the height) — matching this exactly
// is what makes this preview's framing match the final render.
const CARD_ASPECT = PASS_LAYOUT.photo.width / PASS_LAYOUT.photo.height;

export function UploadPreview({ image, fileName, onChangePhoto }: UploadPreviewProps) {
  const crop = computeAutoCrop(image.width, image.height, CARD_ASPECT, image.focal);

  const toPct = (n: number, of: number) => `${(n / of) * 100}%`;

  return (
    <div className="flex w-full flex-col gap-3">
      <div
        className="bg-paper-raised relative w-full overflow-hidden"
        style={{ aspectRatio: `${image.width} / ${image.height}` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- a data URL, not an optimizable static asset */}
        <img
          src={image.dataUrl}
          alt={fileName ?? "Uploaded photo"}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Dimmed everywhere outside the suggested crop, via four overlay bars —
            communicates exactly what will make it into the pass. */}
        <div
          className="bg-ink/55 absolute inset-x-0 top-0"
          style={{ height: toPct(crop.y, image.height) }}
        />
        <div
          className="bg-ink/55 absolute inset-x-0 bottom-0"
          style={{ height: toPct(image.height - crop.y - crop.height, image.height) }}
        />
        <div
          className="bg-ink/55 absolute top-0 bottom-0 left-0"
          style={{
            width: toPct(crop.x, image.width),
            top: toPct(crop.y, image.height),
            bottom: toPct(image.height - crop.y - crop.height, image.height),
          }}
        />
        <div
          className="bg-ink/55 absolute top-0 right-0 bottom-0"
          style={{
            width: toPct(image.width - crop.x - crop.width, image.width),
            top: toPct(crop.y, image.height),
            bottom: toPct(image.height - crop.y - crop.height, image.height),
          }}
        />
        <div
          className="border-paper absolute border"
          style={{
            left: toPct(crop.x, image.width),
            top: toPct(crop.y, image.height),
            width: toPct(crop.width, image.width),
            height: toPct(crop.height, image.height),
          }}
        />

        <span className="border-line-strong bg-paper-raised/90 text-ink-soft absolute top-2 left-2 border px-2 py-1 font-mono text-[10px] tracking-wide uppercase">
          {image.focalSource === "face-detection" ? "Face detected" : "Auto-centered"}
        </span>
      </div>

      <button
        type="button"
        onClick={onChangePhoto}
        className="text-ink-soft hover:text-stamp -my-3 self-start px-1 py-3 font-mono text-xs tracking-wide uppercase underline-offset-4 hover:underline"
      >
        Change photo
      </button>
    </div>
  );
}
