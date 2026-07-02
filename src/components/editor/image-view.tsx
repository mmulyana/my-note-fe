import { useState } from "react";
import {
  NodeViewWrapper,
  type ReactNodeViewProps,
} from "@tiptap/react";
import { IconAdjustmentsHorizontal } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImageSettingsPopup } from "@/components/editor/image-settings-popup";
import { guardMaxWidth, type ImageAlign, type ImageObjectFit } from "./extensions/image";

export function ImageView({ node, updateAttributes }: ReactNodeViewProps) {
  const [open, setOpen] = useState(false);

  const src: string = node.attrs.src;
  const alt: string | null = node.attrs.alt ?? null;
  const width: string | null = node.attrs.width ?? null;
  const maxWidth: string | null = node.attrs.maxWidth ?? null;
  const height: string | null = node.attrs.height ?? null;
  const objectFit: ImageObjectFit | null = node.attrs.objectFit ?? null;
  const align: ImageAlign = node.attrs.align ?? "center";

  // Only give the wrapper an explicit (shrink-wrapped) box when width or
  // maxWidth is actually set. If we tried to shrink-wrap unconditionally
  // (e.g. via `width: fit-content` in CSS) while the <img> inside also has
  // a percentage-based width/max-width, the two become circular: the
  // wrapper's size depends on the image's rendered size, which depends on
  // a percentage OF the wrapper. Browsers resolve that loop by falling
  // back to the full available width — silently defeating "Asli" (natural
  // size). Leaving both unset here instead falls back to plain block flow,
  // the same behavior the original (pre-controls) <img> had.
  const isSized = Boolean(width || maxWidth);

  return (
    <NodeViewWrapper
      as="div"
      className="rich-image-wrapper"
      data-align={align}
      data-sized={isSized}
      style={
        isSized
          ? {
              width: width ?? undefined,
              maxWidth: maxWidth ? guardMaxWidth(maxWidth) : undefined,
              height: height ?? undefined,
            }
          : { height: height ?? undefined }
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
          className="w-56 bg-(--surface) border-(--line-2) rounded-xl shadow-(--shadow-lg) p-3"
          onCloseAutoFocus={(e) => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
        >
          <ImageSettingsPopup
            attrs={{ width, maxWidth, height, objectFit, align }}
            onChange={(attrs) => updateAttributes(attrs)}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </NodeViewWrapper>
  );
}
