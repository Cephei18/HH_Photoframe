"use client";

import { useEffect, useRef, useState } from "react";

/** Tracks an element's rendered CSS width via ResizeObserver — lets a
 * canvas size its backing store to whatever width its container's own
 * responsive layout actually gives it, instead of a hardcoded breakpoint
 * guess. */
export function useElementWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    setWidth(el.getBoundingClientRect().width);

    return () => observer.disconnect();
  }, []);

  return [ref, width];
}
