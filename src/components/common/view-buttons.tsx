import { Fragment } from "react";
import {
  IconArrowsMove,
  IconLayoutDashboard,
  IconLayoutGrid,
} from "@tabler/icons-react";
import { ButtonGroupSeparator } from "@/components/ui/button-group";
import type { HomeView } from "@/store/home-view";
import { cn } from "@/lib/utils";
import { triggerActiveClass, triggerClass } from "./todo-filter-menu";

const VIEWS: { value: HomeView; label: string; Icon: typeof IconLayoutGrid }[] =
  [
    { value: "grid", label: "Grid view", Icon: IconLayoutGrid },
    { value: "masonry", label: "Masonry view", Icon: IconLayoutDashboard },
  ];

const separatorClass = "bg-line-2 data-vertical:h-4 data-vertical:self-center";

interface ViewButtonsProps {
  view: HomeView;
  onViewChange: (view: HomeView) => void;
  // note: reorder button is only shown when the page supports drag reorder
  arranging?: boolean;
  onArrangingChange?: (arranging: boolean) => void;
  // note: true when nothing follows these buttons in the group, so the last one closes the pill
  last?: boolean;
}

export function ViewButtons({
  view,
  onViewChange,
  arranging,
  onArrangingChange,
  last,
}: ViewButtonsProps) {
  const hasReorder = Boolean(onArrangingChange);

  return (
    <>
      {VIEWS.map(({ value, label, Icon }, i) => (
        <Fragment key={value}>
          {i > 0 && <ButtonGroupSeparator className={separatorClass} />}
          <button
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={view === value}
            onClick={() => onViewChange(value)}
            className={cn(
              triggerClass,
              i === 0 && "rounded-l-full",
              i === VIEWS.length - 1 && !hasReorder && last && "rounded-r-full",
              view === value && cn(triggerActiveClass, "bg-surface-2"),
            )}
          >
            <Icon size={18} className="max-md:size-5" />
          </button>
        </Fragment>
      ))}
      {hasReorder && (
        <>
          <ButtonGroupSeparator className={separatorClass} />
          <button
            type="button"
            title="Reorder"
            aria-label="Reorder"
            aria-pressed={arranging}
            onClick={() => onArrangingChange?.(!arranging)}
            className={cn(
              triggerClass,
              last && "rounded-r-full",
              arranging && "bg-surface-2 text-brand",
            )}
          >
            <IconArrowsMove size={18} className="max-md:size-5" />
          </button>
        </>
      )}
    </>
  );
}
