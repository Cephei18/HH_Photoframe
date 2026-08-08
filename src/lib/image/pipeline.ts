import { defaultFocal, focalFromFace } from "./autocrop";
import { compressBitmap } from "./compress";
import { decodeToBitmap } from "./decode";
import { detectFaceBox } from "./face-detect";
import { convertHeicToJpeg, isHeic } from "./heic";
import type { ProcessedImage } from "./types";
import { validateDimensions, validateFile } from "./validate";

/**
 * The single entry point for turning a raw file input into everything the
 * rest of the app needs. Kept as one pure(ish) async pipeline — independent
 * of React — so it's testable on its own and the upload hook stays a thin
 * state wrapper around it.
 */
export async function processUpload(file: File): Promise<ProcessedImage> {
  validateFile(file);

  const blob = isHeic(file) ? await convertHeicToJpeg(file) : file;
  const bitmap = await decodeToBitmap(blob);

  let compressed;
  let focal: { x: number; y: number };
  let focalSource: ProcessedImage["focalSource"];
  try {
    // Detection runs on the full-resolution bitmap (more accurate) in
    // parallel with compression, then its box is scaled into the
    // compressed image's coordinate space — cheaper than decoding twice.
    const [compressedResult, face] = await Promise.all([
      compressBitmap(bitmap),
      detectFaceBox(bitmap),
    ]);
    compressed = compressedResult;

    if (face) {
      const scale = compressed.width / bitmap.width;
      focal = focalFromFace({
        x: face.x * scale,
        y: face.y * scale,
        width: face.width * scale,
        height: face.height * scale,
      });
      focalSource = "face-detection";
    } else {
      focal = defaultFocal(compressed.width, compressed.height);
      focalSource = "heuristic";
    }
  } finally {
    bitmap.close();
  }

  validateDimensions(compressed.width, compressed.height);

  return {
    dataUrl: compressed.dataUrl,
    width: compressed.width,
    height: compressed.height,
    bytes: compressed.bytes,
    focal,
    focalSource,
  };
}
