import type { CropRect, FaceBox } from "./types";

/**
 * Computes the largest crop rectangle of a given aspect ratio that fits
 * inside a source image, centered on a focal point and clamped to bounds.
 *
 * Pure and deterministic — the same source size, aspect, and focal point
 * always produce the same rect. Reused for both card crops the pass needs
 * (the tall Builder Pass and the square PFP frame) by passing a different
 * `aspect`, rather than duplicating this logic per output.
 */
/** Heuristic focal point for photos with no detected face — horizontally
 * centered, biased to the upper third where a face usually sits. */
export function defaultFocal(sourceWidth: number, sourceHeight: number): { x: number; y: number } {
  return { x: sourceWidth / 2, y: sourceHeight * 0.38 };
}

export function computeAutoCrop(
  sourceWidth: number,
  sourceHeight: number,
  aspect: number,
  focal?: { x: number; y: number },
): CropRect {
  const sourceAspect = sourceWidth / sourceHeight;

  let width: number;
  let height: number;
  if (sourceAspect > aspect) {
    // Source is relatively wider than the target — height is the limiting dimension.
    height = sourceHeight;
    width = height * aspect;
  } else {
    width = sourceWidth;
    height = width / aspect;
  }

  const { x: fx, y: fy } = focal ?? defaultFocal(sourceWidth, sourceHeight);

  let x = fx - width / 2;
  let y = fy - height / 2;

  x = Math.min(Math.max(x, 0), sourceWidth - width);
  y = Math.min(Math.max(y, 0), sourceHeight - height);

  return { x, y, width, height };
}

/** Reduces a detected face box to the single focal point autocrop expects. */
export function focalFromFace(face: FaceBox): { x: number; y: number } {
  return {
    x: face.x + face.width / 2,
    // Bias slightly above the face's vertical center so the crop leaves
    // headroom rather than centering on the chin.
    y: face.y + face.height * 0.4,
  };
}
