/**
 * Resolves after `count` real paint frames. This is not an artificial
 * delay — it's the minimum a browser needs to actually paint a state
 * change before the next one lands, which is different from an arbitrary
 * `setTimeout` chosen to look busy. Resolves immediately under
 * `prefers-reduced-motion`, where holding a label for multiple frames has
 * no accessibility benefit.
 */
export function waitFrames(count: number): Promise<void> {
  if (count <= 0) return Promise.resolve();
  if (typeof window === "undefined" || typeof requestAnimationFrame === "undefined") {
    return Promise.resolve();
  }
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let remaining = count;
    function tick() {
      remaining -= 1;
      if (remaining <= 0) resolve();
      else requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}
