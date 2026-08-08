import type { FaceBox } from "./types";

/**
 * The Shape Detection API's `FaceDetector` isn't in TypeScript's DOM lib
 * (still experimental) and isn't universally available — it currently ships
 * on Chromium/Android, not Safari or Firefox. Declared locally rather than
 * pulling in a full ML model just to get a nice-to-have crop assist.
 */
interface DetectedFace {
  boundingBox: { x: number; y: number; width: number; height: number };
}
interface FaceDetectorLike {
  detect(image: ImageBitmap): Promise<DetectedFace[]>;
}
type FaceDetectorConstructor = new (options?: { maxDetectedFaces?: number }) => FaceDetectorLike;

function getFaceDetectorCtor(): FaceDetectorConstructor | null {
  if (typeof window === "undefined") return null;
  const ctor = (window as unknown as { FaceDetector?: FaceDetectorConstructor }).FaceDetector;
  return ctor ?? null;
}

/**
 * Best-effort face detection using the browser's native Shape Detection API.
 * Returns `null` — never throws — when the API is unsupported or detection
 * fails, so callers can fall back to the heuristic crop unconditionally.
 */
export async function detectFaceBox(bitmap: ImageBitmap): Promise<FaceBox | null> {
  const FaceDetectorCtor = getFaceDetectorCtor();
  if (!FaceDetectorCtor) return null;

  try {
    const detector = new FaceDetectorCtor({ maxDetectedFaces: 1 });
    const faces = await detector.detect(bitmap);
    if (faces.length === 0) return null;
    const { x, y, width, height } = faces[0].boundingBox;
    return { x, y, width, height };
  } catch {
    return null;
  }
}
