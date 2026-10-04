import { IconCheck } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CoverStyle } from "@/lib/types";
import { cn } from "@/lib/utils";
import { COVER_STYLES, NoteCover } from "./note-cover";

interface ThumbnailStyleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  title: string;
  value: CoverStyle;
  onChange: (style: CoverStyle) => void;
}

export function ThumbnailStyleDialog({
  open,
  onOpenChange,
  src,
  title,
  value,
  onChange,
}: ThumbnailStyleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[960px]" onClick={(e) => e.stopPropagation()}
        // note: Esc should only close this dialog, not the note modal behind it
        onEscapeKeyDown={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Thumbnail style</DialogTitle>
          <DialogDescription>
            How this note's thumbnail looks on its card.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start justify-items-center">
          {COVER_STYLES.map((s) => {
            const active = s.id === value;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={active}
                onClick={() => onChange(s.id)}
                className="flex flex-col gap-2 text-left outline-none cursor-pointer group w-[287px] max-w-full"
              >
                {/* note: same width and sizing rules as the real card (DocumentCard), so what you see is what the list shows */}
                <div
                  className={cn(
                    "relative flex flex-col overflow-hidden rounded-[12px] border bg-surface pb-3 transition-[border-color,box-shadow,opacity]",
                    s.id === "overlay" && "h-[220px] pb-0",
                    active
                      ? "border-brand ring-2 ring-brand/60"
                      : "border-line opacity-70 group-hover:opacity-100 group-hover:border-line-2 group-focus-visible:ring-2 group-focus-visible:ring-brand",
                  )}
                >
                  <NoteCover
                    src={src}
                    title={s.id === "banner" ? undefined : title}
                    style={s.id}
                    className={s.id === "overlay" ? "absolute inset-0" : undefined}
                  />
                  {s.id === "banner" && <BannerText title={title} />}
                  {active && (
                    <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-full bg-brand px-2 h-5 text-[10px] font-semibold text-white shadow-card">
                      <IconCheck size={11} stroke={3} />
                      Active
                    </span>
                  )}
                </div>
                <div className="px-0.5">
                  <p
                    className={cn(
                      "text-[13px]",
                      active ? "font-semibold text-ink" : "font-medium text-ink-2",
                    )}
                  >
                    {s.label}
                  </p>
                  <p className="text-[11px] text-ink-3">{s.hint}</p>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// note: banner shows the note own heading, drawn with the same rich-content styles as the card preview
function BannerText({ title }: { title: string }) {
  return (
    <>
      {title && (
        <div className="rich-content rich-readonly rich-card-preview px-3 pt-1.5">
          <h1 className="line-clamp-2">{title}</h1>
        </div>
      )}
      <SkeletonLines />
    </>
  );
}

// note: stand-in for the text preview so each variant reads like a real card
function SkeletonLines() {
  return (
    <div className="flex flex-col gap-1.5 px-3 pt-2.5">
      <div className="h-1.5 w-full rounded-full bg-surface-hi" />
      <div className="h-1.5 w-4/5 rounded-full bg-surface-hi" />
    </div>
  );
}
