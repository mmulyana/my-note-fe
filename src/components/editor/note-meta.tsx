import { IconClock, IconPinFilled } from "@tabler/icons-react";
import { cn, relative, relativeShort } from "@/lib/utils";

interface NoteMetaProps {
  updatedAt: number;
  pinned?: boolean;
  archived?: boolean;
  // note: true when the card has a thumbnail: the chip floats top-right over the image instead of sitting in the header row
  floating?: boolean;
}

// note: one compact pill for a card's status: yellow pin, archived tag, and a short "updated" time
export function NoteMeta({ updatedAt, pinned, archived, floating }: NoteMetaProps) {
  return (
    <div
      title={`Updated ${relative(updatedAt)}`}
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium tabular-nums",
        floating
          ? "absolute top-2 right-2 z-5 border border-white/15 bg-black/65 text-white shadow-sm backdrop-blur-sm"
          : "bg-surface-2 text-ink-3",
      )}
    >
      {pinned && (
        <IconPinFilled size={11} className={cn("shrink-0", floating ? "text-amber-300" : "text-amber-400")} aria-label="Pinned" />
      )}
      {archived && (
        <span className="text-[10px] uppercase tracking-[0.06em]">Archived</span>
      )}
      <span className="inline-flex items-center gap-1">
        <IconClock size={11} className="shrink-0 opacity-80" />
        {relativeShort(updatedAt)}
      </span>
    </div>
  );
}
