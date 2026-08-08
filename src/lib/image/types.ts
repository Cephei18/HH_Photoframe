/** A crop rectangle in source-image pixel coordinates. */
export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** A detected or assumed focal box in source-image pixel coordinates. */
export type FaceBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type UploadErrorCode =
  "unsupported-type" | "too-large" | "too-small" | "decode-failed" | "heic-failed" | "empty-file";

export class UploadError extends Error {
  code: UploadErrorCode;
  constructor(code: UploadErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "UploadError";
  }
}

/** The end result of the upload pipeline — everything later phases need. */
export type ProcessedImage = {
  /** Compressed, orientation-corrected image as a data URL — ready to embed
   * directly in the render request or a Satori/ImageResponse <img src>. */
  dataUrl: string;
  /** Natural dimensions of the compressed image (post-resize). */
  width: number;
  height: number;
  /** Approximate size of the encoded image, in bytes. */
  bytes: number;
  /** Suggested focal point, in the compressed image's own pixel coordinates —
   * a detected face center when available, a heuristic guess otherwise. */
  focal: { x: number; y: number };
  /** Whether `focal` came from real face detection or the heuristic fallback. */
  focalSource: "face-detection" | "heuristic";
};
