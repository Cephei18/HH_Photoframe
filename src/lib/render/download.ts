/** Triggers a browser download for an in-memory blob — no server round trip,
 * no temporary storage, consistent with the product staying fully stateless. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Revoked after a tick rather than immediately — some browsers
  // (historically Firefox) drop the download if the URL disappears before
  // the click has actually been dispatched to the OS.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** A filesystem-safe filename stem from the pass's own serial — meaningful
 * and unique per person, not "download (1).png". */
export function filenameForSerial(serial: string, suffix: string): string {
  const safe = serial.replace(/[^A-Za-z0-9-]/g, "");
  return `signal-pass-${safe}${suffix ? `-${suffix}` : ""}.png`;
}
