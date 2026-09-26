import { NavLink, useMatch } from "react-router-dom";
import { IconHash } from "@tabler/icons-react";
import { useApi } from "@/hooks/use-api";
import type { IApi } from "@/lib/types";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";

type Label = { id: string; name: string; noteCount: number };

type Props = {
  sidebar: boolean;
  onNavigate?: () => void;
};

export default function LabelsWrapper({ sidebar, onNavigate }: Props) {
  const { data } = useApi<IApi<Label[]>>({
    url: urls.Labels,
    queryKey: ["labels"],
  });
  const match = useMatch("/label/:name");
  const activeName = match?.params.name
    ? decodeURIComponent(match.params.name)
    : undefined;

  const labels = data?.data ?? [];

  if (!sidebar || labels.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 mt-4 pb-4">
      <div className="text-sm text-ink-3 px-2 font-medium">Labels</div>
      <div className="flex flex-row flex-wrap gap-1.5 px-1">
        {labels.map((label) => (
          <NavLink
            key={label.id}
            to={`/label/${encodeURIComponent(label.name)}`}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-0.5 h-6 max-w-full pl-1.5 pr-2 rounded-full text-xs font-medium transition-[background,color] duration-150",
              "bg-line/60",
              activeName === label.name
                ? "text-ink"
                : "text-ink-3 hover:text-ink hover:bg-line/90",
            )}
          >
            <IconHash size={12} className="flex-none" />
            <span className="min-w-0 truncate">{label.name}</span>
            <span className="flex-none pl-1 tabular-nums opacity-60">
              {label.noteCount}
            </span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
