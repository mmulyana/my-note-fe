import { IconCheck } from "@tabler/icons-react";

interface TodoProgressProps {
  done: number;
  total: number;
}

export function TodoProgress({ done, total }: TodoProgressProps) {
  if (total === 0) return null;

  return (
    <div className="border rounded-full flex items-center h-5 border-line pl-0.5 pr-1.5">
      <span className="inline-flex items-center gap-1">
        {done === total ? (
          <div className="bg-[#1AAE75] rounded-full flex justify-center items-center h-3.5 w-3.5">
            <IconCheck size={10} className="shrink-0 stroke-3 text-white" />
          </div>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14">
            <circle
              cx="7"
              cy="7"
              r="5"
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.20}
              strokeWidth="2.5"
            />
            <circle
              cx="7"
              cy="7"
              r="5"
              fill="none"
              stroke="#1AAE75"
              strokeWidth="2.5"
              strokeDasharray={31}
              strokeDashoffset={31 * (1 - done / total)}
              strokeLinecap="round"
              transform="rotate(-90 7 7)"
            />
          </svg>
        )}
        <p className="font-semibold text-xs text-ink-2">
          {done}
          <span className="opacity-60">/{total}</span>
        </p>
      </span>
    </div>
  );
}
