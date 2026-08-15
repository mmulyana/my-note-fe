import { useCallback, useEffect, useRef, useState } from "react";

// note: sentinel sits at the top of the scroll content; its height is the threshold
export function useScrolledPast<T extends HTMLElement>() {
  const [scrolled, setScrolled] = useState(false);
  const rootRef = useRef<T | null>(null);
  const sentinelRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const observe = useCallback(() => {
    observerRef.current?.disconnect();
    const root = rootRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { root, threshold: 0 },
    );
    observer.observe(sentinel);
    observerRef.current = observer;
  }, []);

  // note: callback refs, so it rewires whichever node React attaches last
  const setRoot = useCallback(
    (node: T | null) => {
      rootRef.current = node;
      observe();
    },
    [observe],
  );

  const setSentinel = useCallback(
    (node: HTMLElement | null) => {
      sentinelRef.current = node;
      observe();
    },
    [observe],
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return { setRoot, setSentinel, scrolled };
}
