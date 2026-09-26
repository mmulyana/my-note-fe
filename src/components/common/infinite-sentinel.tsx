import { useEffect, useRef } from "react";

type InfiniteSentinelProps = {
  hasNextPage: boolean;
  isFetching: boolean;
  onLoadMore: () => void;
};

export function InfiniteSentinel({
  hasNextPage,
  isFetching,
  onLoadMore,
}: InfiniteSentinelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasNextPage || isFetching) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetching, onLoadMore]);

  if (!hasNextPage) return null;
  return <div ref={ref} className="h-8" aria-hidden />;
}
