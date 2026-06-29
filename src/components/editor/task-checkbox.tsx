import { cn } from "@/lib/utils";

interface TaskCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function TaskCheckbox({ checked, onChange }: TaskCheckboxProps) {
  return (
    <label className="flex-none cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
      />
      <span
        className={cn(
          "flex items-center justify-center w-3.75 h-3.75 rounded border-[1.5px] transition-[background-color,border-color] duration-200",
          checked ? "bg-blue-500 border-blue-500" : "bg-gray-200 border-gray-200",
        )}
      >
        <svg
          viewBox="0 0 10 8"
          fill="none"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: 9, height: 7 }}
        >
          <path
            d="M 1 3.5 L 3.8 6.3 L 9 1"
            stroke="white"
            style={{
              strokeDasharray: 14,
              strokeDashoffset: checked ? 0 : 14,
              transition: "stroke-dashoffset 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </svg>
      </span>
    </label>
  );
}
