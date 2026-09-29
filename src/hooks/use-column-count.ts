import { useEffect, useState } from "react";

// note: mirrors the .masonry.grid-view breakpoints in index.css
const BREAKPOINTS: [number, number][] = [
  [1840, 6],
  [1576, 5],
  [1312, 4],
  [1048, 3],
];

function getColumnCount() {
  const width = window.innerWidth;
  return BREAKPOINTS.find(([min]) => width >= min)?.[1] ?? 2;
}

export function useColumnCount() {
  const [columns, setColumns] = useState(getColumnCount);
  useEffect(() => {
    const onResize = () => setColumns(getColumnCount());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return columns;
}
