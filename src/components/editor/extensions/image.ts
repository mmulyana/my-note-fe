import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImageView } from "@/components/editor/image-view";

export type ImageAlign = "left" | "center" | "right";
export type ImageObjectFit = "fill" | "contain" | "cover" | "none" | "scale-down";

// a user-set max-width (e.g. "800px") shouldn't be able to overflow a
// narrower container — cap it against 100% either way
export const guardMaxWidth = (value: string) => `min(${value}, 100%)`;

// each attribute below contributes its own `style` fragment; TipTap's
// mergeAttributes concatenates them (rather than overwriting) into one
// style="" string, so the node stays a plain <img> in the saved HTML —
// read-only previews render it correctly with zero extra JS.
export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),

      width: {
        default: null,
        parseHTML: (el) => el.style.width || null,
        renderHTML: (attrs) =>
          attrs.width ? { style: `width: ${attrs.width}` } : {},
      },

      maxWidth: {
        default: null,
        // unwrap our own min(x, 100%) guard back to the raw value, so
        // re-parsing saved content doesn't nest min() calls indefinitely
        parseHTML: (el) => {
          const value = el.style.maxWidth || null;
          if (!value) return null;
          const unwrapped = value.match(/^min\((.+),\s*100%\)$/);
          return unwrapped ? unwrapped[1] : value;
        },
        renderHTML: (attrs) =>
          attrs.maxWidth
            ? { style: `max-width: ${guardMaxWidth(attrs.maxWidth)}` }
            : {},
      },

      height: {
        default: null,
        parseHTML: (el) => el.style.height || null,
        renderHTML: (attrs) =>
          attrs.height ? { style: `height: ${attrs.height}` } : {},
      },

      objectFit: {
        default: null,
        parseHTML: (el) => el.style.objectFit || null,
        renderHTML: (attrs) =>
          attrs.objectFit ? { style: `object-fit: ${attrs.objectFit}` } : {},
      },

      align: {
        default: "center",
        parseHTML: (el) => el.getAttribute("data-align") || "center",
        renderHTML: (attrs) =>
          attrs.align && attrs.align !== "center"
            ? { "data-align": attrs.align }
            : {},
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
});
