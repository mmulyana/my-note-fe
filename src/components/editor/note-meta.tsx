import { IconClock, IconCornerLeftUp, IconPinFilled, IconStack2 } from "@tabler/icons-react";
import { cn, relative, relativeShort } from "@/lib/utils";

interface NoteMetaProps {
  updatedAt: number;
  pinned?: boolean;
  archived?: boolean;
  isChild?: boolean;
  childCount?: number;
  // note: true when the card has a thumbnail: the chip floats top-right over the image instead of sitting in the header row
  floating?: boolean;
}

// note: one compact pill for a card's status: yellow pin, archived tag, and a short "updated" time
export function NoteMeta({ updatedAt, pinned, archived, isChild, childCount = 0, floating }: NoteMetaProps) {
  return (
    <div
      title={`Updated ${relative(updatedAt)}`}
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1 rounded-full px-1 pl-0.5 text-[11px] font-medium tabular-nums",
        floating
          ? "absolute top-2 right-2 z-5 border border-line bg-surface text-ink-2 shadow-sm"
          : "w-fit self-start md:self-auto border border-line text-ink-3",
      )}
    >
      {pinned && (
        <IconPinFilled size={14} className={cn("shrink-0", floating ? "text-amber-300" : "text-amber-400")} aria-label="Pinned" />
      )}
      {isChild && (
        <>
          <span title="Sub-note" className="inline-flex items-center">
            <IconCornerLeftUp size={14} className="shrink-0" />
          </span>
          <span aria-hidden className="h-3 w-px shrink-0 bg-line-2" />
        </>
      )}
      {childCount > 0 && (
        <>
          <span
            title={`${childCount} sub-note${childCount > 1 ? "s" : ""}`}
            className="inline-flex items-center gap-0.5 tabular-nums"
          >
            <IconStack2 size={14} className="shrink-0" />
            {childCount}
          </span>
          <span aria-hidden className="h-3 w-px shrink-0 bg-line-2" />
        </>
      )}
      {archived && (
        <span className="text-[10px] uppercase tracking-[0.06em]">Archived</span>
      )}
      <span className="inline-flex items-center gap-0.5 text-ink-2">
        <IconClock size={14} className="shrink-0 opacity-80" />
        {relativeShort(updatedAt)}
      </span>
    </div>
  );
}
