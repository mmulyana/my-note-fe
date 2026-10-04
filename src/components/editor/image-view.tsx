import { useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  NodeViewWrapper,
  type ReactNodeViewProps,
} from "@tiptap/react";
import { IconAdjustmentsHorizontal, IconPhotoStar } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImageSettingsPopup } from "@/components/editor/image-settings-popup";
import { guardMaxWidth, type ImageAlign, type ImageObjectFit } from "./extensions/image";

export function ImageView({
  node,
  editor,
  getPos,
  updateAttributes,
}: ReactNodeViewProps) {
  const [open, setOpen] = useState(false);
  // note: live size while a resize handle is dragged; committed to the node once on release
  const [drag, setDrag] = useState<{ pct: number; height: string | null } | null>(null);

  const src: string = node.attrs.src;
  const alt: string | null = node.attrs.alt ?? null;
  const width: string | null = node.attrs.width ?? null;
  const maxWidth: string | null = node.attrs.maxWidth ?? null;
  const height: string | null = node.attrs.height ?? null;
  const objectFit: ImageObjectFit | null = node.attrs.objectFit ?? null;
  const align: ImageAlign = node.attrs.align ?? "center";
  const isCover = Boolean(node.attrs.isCover);
  // note: only an uploaded image (it has an attachment and a thumbnail file) can be the note thumbnail
  const canBeCover = Boolean(node.attrs.attachmentId && node.attrs.thumbPath);

  // note: one thumbnail per note, so turning it on here turns it off on every other image
  const toggleCover = () => {
    const here = getPos();
    if (here === undefined) return;
    editor
      .chain()
      .command(({ tr, state }) => {
        state.doc.descendants((n, pos) => {
          if (n.type.name !== "image") return;
          const next = pos === here ? !isCover : false;
          if (Boolean(n.attrs.isCover) !== next) {
            tr.setNodeMarkup(pos, undefined, { ...n.attrs, isCover: next });
          }
        });
        return true;
      })
      .run();
  };

  // Only give the wrapper an explicit (shrink-wrapped) box when width or
  // maxWidth is actually set. If we tried to shrink-wrap unconditionally
  // (e.g. via `width: fit-content` in CSS) while the <img> inside also has
  // a percentage-based width/max-width, the two become circular: the
  // wrapper's size depends on the image's rendered size, which depends on
  // a percentage OF the wrapper. Browsers resolve that loop by falling
  // back to the full available width — silently defeating "Asli" (natural
  // size). Leaving both unset here instead falls back to plain block flow,
  // the same behavior the original (pre-controls) <img> had.
  const isSized = Boolean(drag || width || maxWidth);
  const shownWidth = drag ? `${drag.pct}%` : width;
  const shownHeight = drag ? drag.height : height;

  // note: drag a side handle to resize in % of the editor width; a centered image grows on both sides, so the pointer moves it twice as fast
  const startResize =
    (side: "left" | "right") => (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const handle = e.currentTarget;
      const wrapper = handle.parentElement;
      const container = wrapper?.parentElement;
      if (!wrapper || !container) return;

      const box = wrapper.getBoundingClientRect();
      const containerW = container.clientWidth;
      const factor = (side === "right" ? 1 : -1) * (align === "center" ? 2 : 1);
      const startX = e.clientX;
      let pct = Math.round((box.width / containerW) * 100);
      let nextHeight: string | null = null;
      handle.setPointerCapture(e.pointerId);

      const move = (ev: PointerEvent) => {
        const w = box.width + (ev.clientX - startX) * factor;
        pct = Math.min(100, Math.max(10, Math.round((w / containerW) * 100)));
        // a fixed height scales with the width so the picture keeps its proportions
        nextHeight = height
          ? `${Math.round(box.height * ((pct / 100) * containerW) / box.width)}px`
          : null;
        setDrag({ pct, height: nextHeight });
      };
      const end = () => {
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", end);
        handle.removeEventListener("pointercancel", end);
        setDrag(null);
        updateAttributes(
          nextHeight ? { width: `${pct}%`, height: nextHeight } : { width: `${pct}%` },
        );
      };
      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", end);
      handle.addEventListener("pointercancel", end);
    };

  return (
    <NodeViewWrapper
      as="div"
      className="rich-image-wrapper"
      data-align={align}
      data-sized={isSized}
      style={
        isSized
          ? {
              width: shownWidth ?? undefined,
              maxWidth: maxWidth ? guardMaxWidth(maxWidth) : undefined,
              height: shownHeight ?? undefined,
            }
          : { height: shownHeight ?? undefined }
      }
    >
      <img
        className="rich-image"
        src={src}
        alt={alt ?? undefined}
        style={{
          width: isSized ? "100%" : undefined,
          objectFit: objectFit ?? undefined,
        }}
      />

      {(["left", "right"] as const).map((side) => (
        <div
          key={side}
          className="rich-image-resize"
          data-side={side}
          data-active={Boolean(drag)}
          contentEditable={false}
          role="separator"
          aria-label={`Resize image from the ${side}`}
          onPointerDown={startResize(side)}
        />
      ))}
      {drag && (
        <span
          contentEditable={false}
          className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-[5px] px-1.5 h-5 inline-flex items-center text-[10px] font-medium bg-surface/90 text-ink-2 pointer-events-none"
        >
          {drag.pct}%
        </span>
      )}

      {isCover && (
        <span
          contentEditable={false}
          className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-[5px] px-1.5 h-6 text-[10px] font-medium bg-surface/80 text-ink-2 pointer-events-none"
        >
          <IconPhotoStar size={12} />
          Thumbnail
        </span>
      )}

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          className="rich-image-settings-btn"
          contentEditable={false}
          title="Image settings"
          aria-label="Image settings"
          onClick={(e) => e.stopPropagation()}
        >
          <IconAdjustmentsHorizontal size={14} />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-64 bg-surface border-line-2 rounded-xl shadow-card-lg p-3"
          onCloseAutoFocus={(e) => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
        >
          <ImageSettingsPopup
            attrs={{ width, maxWidth, height, objectFit, align }}
            onChange={(attrs) => updateAttributes(attrs)}
            thumbnail={
              canBeCover ? { active: isCover, onToggle: toggleCover } : undefined
            }
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </NodeViewWrapper>
  );
}
