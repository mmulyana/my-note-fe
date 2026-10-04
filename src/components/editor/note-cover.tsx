import type { CoverStyle } from "@/lib/types";
import { cn } from "@/lib/utils";

export const COVER_STYLES: { id: CoverStyle; label: string; hint: string }[] = [
  { id: "banner", label: "Banner", hint: "Cropped strip, then the note text" },
  { id: "full", label: "Full image", hint: "Whole image, title only" },
  { id: "overlay", label: "Overlay", hint: "Title on the image" },
];

interface NoteCoverProps {
  src: string;
  title?: string;
  style?: CoverStyle;
  className?: string;
}

// note: the one place a note thumbnail is drawn, so the card and the style picker preview never drift apart
export function NoteCover({
  src,
  title,
  style = "banner",
  className,
}: NoteCoverProps) {
  const heading = title?.trim();

  if (style === "overlay") {
    return (
      <div className={cn("relative bg-surface-2", className ?? "h-44")}>
        <img
          src={src}
          alt=""
          loading="lazy"
          draggable={false}
          className="block w-full h-full object-cover"
        />
        {heading && (
          <div className="absolute inset-x-0 bottom-0 px-3 pt-10 pb-4 bg-linear-to-t from-black/70 to-transparent">
            <p className="text-[14px] font-semibold leading-snug text-white line-clamp-2">
              {heading}
            </p>
          </div>
        )}
      </div>
    );
  }

  const isFull = style === "full";

  return (
    <div
      className={cn(
        // note: in full the image is the flexible part. A fixed-height card (grid view) shrinks the picture, never the title
        isFull && "flex min-h-0 flex-auto flex-col",
        className,
      )}
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        draggable={false}
        className={cn(
          "block w-full bg-surface-2",
          isFull
            ? "h-auto min-h-16 min-w-0 flex-auto object-cover"
            : "h-28 shrink-0 object-cover",
        )}
      />
      {heading && (
        <p
          className={cn(
            "shrink-0 px-3 pt-2.5 text-[14px] font-semibold leading-snug text-ink line-clamp-2",
            // note: full is image + title only, so the title is the last thing in the card and needs its own bottom room
            style === "full" && "pb-2",
          )}
        >
          {heading}
        </p>
      )}
    </div>
  );
}
