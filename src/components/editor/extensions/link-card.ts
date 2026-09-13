import { Node, type Editor } from "@tiptap/core";
import {
  Fragment,
  Slice,
  type DOMOutputSpec,
  type Node as PMNode,
} from "@tiptap/pm/model";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { LinkCardView } from "@/components/editor/link-card-view";
import { request } from "@/lib/api-client";
import type { IApi, LinkPreview } from "@/lib/types";
import { urls } from "@/lib/urls";
import { newId } from "@/lib/utils";

export type LinkCardState = "loading" | "ready";

export const LINK_CARD_NAME = "linkCard";

// note: hanya paste yang isinya persis satu URL http(s) yang jadi card
const URL_ONLY = /^https?:\/\/\S+$/i;

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// note: label yang dipakai card selama belum punya title sendiri
export function labelOf(url: string): string {
  return hostOf(url) || url;
}

export interface LinkCardAttrs {
  id: string | null;
  url: string;
  title: string;
  description: string;
  image: string;
  favicon: string;
  siteName: string;
  state: LinkCardState;
}

// note: tiap field metadata disimpan lewat satu atribut data-* huruf kecil
const dataAttr = (name: string) => {
  const key = `data-${name.toLowerCase()}`;
  return {
    default: "",
    parseHTML: (el: HTMLElement) => el.getAttribute(key) ?? "",
    renderHTML: (attrs: Record<string, unknown>) => {
      const value = attrs[name];
      return typeof value === "string" && value ? { [key]: value } : {};
    },
  };
};

export const LinkCard = Node.create({
  name: LINK_CARD_NAME,

  // note: jangan naikkan priority extension ini, biar paragraph tetap block type pertama

  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-id") || null,
        renderHTML: (attrs) => (attrs.id ? { "data-id": attrs.id } : {}),
      },
      url: dataAttr("url"),
      title: dataAttr("title"),
      description: dataAttr("description"),
      image: dataAttr("image"),
      favicon: dataAttr("favicon"),
      siteName: dataAttr("siteName"),
      state: {
        default: "ready" as LinkCardState,
        parseHTML: (el) =>
          el.getAttribute("data-state") === "loading" ? "loading" : "ready",
        renderHTML: (attrs) =>
          attrs.state === "loading" ? { "data-state": "loading" } : {},
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[data-type="link-card"]',
        // note: priority di atas Link mark supaya anchor card diklaim duluan saat parse
        priority: 100,
        // note: tolak card tanpa url supaya tidak pernah masuk kembali ke dokumen
        getAttrs: (el) => ((el as HTMLElement).getAttribute("data-url") ? null : false),
      },
    ];
  },

  // note: render anchor mandiri supaya tampilan read-only cukup pakai HTML tersimpan
  renderHTML({ node }) {
    const a = node.attrs as LinkCardAttrs;

    const body: DOMOutputSpec[] = [
      ["span", { class: "rich-link-card-title" }, a.title || labelOf(a.url)],
    ];
    if (a.description) {
      body.push(["span", { class: "rich-link-card-desc" }, a.description]);
    }

    const foot: DOMOutputSpec[] = [];
    if (a.favicon) {
      foot.push(["img", { class: "rich-link-card-favicon", src: a.favicon, alt: "" }]);
    }
    foot.push([
      "span",
      { class: "rich-link-card-site" },
      a.siteName || hostOf(a.url),
    ]);
    body.push(["span", { class: "rich-link-card-foot" }, ...foot]);

    const children: DOMOutputSpec[] = [
      ["span", { class: "rich-link-card-body" }, ...body],
    ];
    if (a.image) {
      children.push([
        "span",
        { class: "rich-link-card-thumb" },
        ["img", { src: a.image, alt: "", loading: "lazy" }],
      ]);
    }

    return [
      "a",
      {
        class: "rich-link-card",
        "data-type": "link-card",
        href: a.url,
        target: "_blank",
        rel: "noopener noreferrer nofollow",
        "data-url": a.url,
        ...(a.id ? { "data-id": a.id } : {}),
        ...(a.title ? { "data-title": a.title } : {}),
        ...(a.description ? { "data-description": a.description } : {}),
        ...(a.image ? { "data-image": a.image } : {}),
        ...(a.favicon ? { "data-favicon": a.favicon } : {}),
        ...(a.siteName ? { "data-sitename": a.siteName } : {}),
        ...(a.state === "loading" ? { "data-state": "loading" } : {}),
      },
      ...children,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LinkCardView);
  },

  addProseMirrorPlugins() {
    const editor = this.editor;
    const type = this.type;

    return [
      new Plugin({
        key: new PluginKey("linkCardPaste"),
        props: {
          // note: bikin ulang id card hasil copy supaya tidak ada dua card ber-id sama
          transformPasted: (slice) =>
            new Slice(remintIds(slice.content), slice.openStart, slice.openEnd),

          handlePaste: (view, event) => {
            const text = event.clipboardData?.getData("text/plain").trim() ?? "";
            if (!URL_ONLY.test(text)) return false;

            const id = newId();
            const { $from } = view.state.selection;
            const tr = view.state.tr;
            const card = type.create({
              id,
              url: text,
              state: "loading" as LinkCardState,
            });

            // note: ganti paragraph kosong tempat caret supaya tidak tersisa di atas card
            const inEmptyBlock =
              view.state.selection.empty &&
              $from.parent.isTextblock &&
              $from.parent.content.size === 0;

            if (inEmptyBlock) {
              const paragraph = view.state.schema.nodes.paragraph.create();
              tr.replaceWith($from.before(), $from.after(), [card, paragraph]);
            } else {
              tr.replaceSelectionWith(card);
              // note: sisipkan paragraph kalau card jatuh di paling akhir dokumen
              if (tr.selection.to >= tr.doc.content.size) {
                tr.insert(
                  tr.selection.to,
                  view.state.schema.nodes.paragraph.create(),
                );
              }
            }

            // note: taruh caret di text block setelah card supaya langsung bisa mengetik
            const end = tr.selection.to;
            const $end = tr.doc.resolve(Math.min(end, tr.doc.content.size));
            tr.setSelection(TextSelection.near($end, 1));

            view.dispatch(tr);
            void hydrate(editor, id, text);
            return true;
          },
        },
      }),
    ];
  },
});

function remintIds(fragment: Fragment): Fragment {
  const out: PMNode[] = [];
  fragment.forEach((node) => {
    if (node.isText) {
      out.push(node);
      return;
    }
    const content = remintIds(node.content);
    out.push(
      node.type.name === LINK_CARD_NAME
        ? node.type.create({ ...node.attrs, id: newId() }, content, node.marks)
        : node.copy(content),
    );
  });
  return Fragment.fromArray(out);
}

// note: posisi card dengan id ini, -1 kalau sudah tidak ada
function findById(editor: Editor, id: string): number {
  let pos = -1;
  editor.state.doc.descendants((node, at) => {
    if (pos !== -1) return false;
    if (node.type.name === LINK_CARD_NAME && node.attrs.id === id) pos = at;
    return true;
  });
  return pos;
}

// note: fetch ditaruh di sini supaya node view tetap murni renderer
async function hydrate(editor: Editor, id: string, url: string) {
  let preview: LinkPreview | null = null;
  try {
    preview = (await request<IApi<LinkPreview>>(urls.LinkPreview(url))).data;
  } catch {
    preview = null;
  }

  if (!editor || editor.isDestroyed) return;

  const pos = findById(editor, id);
  if (pos === -1) return; // note: card dihapus saat fetch berjalan

  const node = editor.state.doc.nodeAt(pos);
  if (!node) return;

  const { state } = editor;
  const tr = state.tr;

  if (preview) {
    tr.setNodeMarkup(pos, undefined, {
      ...node.attrs,
      url: preview.url || url,
      title: preview.title ?? "",
      description: preview.description ?? "",
      image: preview.image ?? "",
      favicon: preview.favicon ?? "",
      siteName: preview.siteName ?? "",
      state: "ready" as LinkCardState,
    });
  } else {
    // note: preview gagal, turunkan jadi link biasa
    const link = state.schema.marks.link;
    const text = state.schema.text(url, link ? [link.create({ href: url })] : undefined);
    tr.replaceWith(pos, pos + node.nodeSize, state.schema.nodes.paragraph.create(null, text));
  }

  // note: perubahan hasil hydrate tidak masuk undo history
  tr.setMeta("addToHistory", false);
  editor.view.dispatch(tr);
}
