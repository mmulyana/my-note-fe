import { CircularProgress } from "./circular-progress";

interface TodoProgressProps {
  done: number;
  total: number;
}

export function TodoProgress({ done, total }: TodoProgressProps) {
  if (total === 0) return null;

  return (
    <div className="border rounded-full flex items-center gap-1 h-5 border-line px-1 pl-0.5">
      <CircularProgress value={done} total={total} size={14} />
      <p className="font-semibold text-xs text-ink-2">
        {done}
        <span className="opacity-60">/{total}</span>
      </p>
    </div>
  );
}
