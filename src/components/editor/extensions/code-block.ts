import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { CodeBlock } from "@tiptap/extension-code-block";
import type { Node as PMNode } from "@tiptap/pm/model";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { CodeBlockView } from "@/components/editor/code-block-view";
import { tokenizeCode } from "@/lib/prism";

function buildDecorations(doc: PMNode, typeName: string): DecorationSet {
  const decorations: Decoration[] = [];

  doc.descendants((node, pos) => {
    if (node.type.name !== typeName) return undefined;

    const language: string = node.attrs.language ?? "";
    const segments = tokenizeCode(node.textContent, language);

    let from = pos + 1; // first position inside the code block
    for (const seg of segments) {
      if (seg.className && seg.length > 0) {
        decorations.push(
          Decoration.inline(from, from + seg.length, { class: seg.className }),
        );
      }
      from += seg.length;
    }
    return false; // code blocks only contain text — no need to descend
  });

  return DecorationSet.create(doc, decorations);
}

export const CustomCodeBlock = CodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },

  addProseMirrorPlugins() {
    const parentPlugins = this.parent?.() ?? [];
    const typeName = this.name;
    const key = new PluginKey("codeBlockPrism");

    return [
      ...parentPlugins,
      new Plugin({
        key,
        state: {
          init: (_, { doc }) => buildDecorations(doc, typeName),
          apply: (tr, value, _oldState, newState) =>
            tr.docChanged ? buildDecorations(newState.doc, typeName) : value,
        },
        props: {
          decorations(state) {
            return key.getState(state);
          },
        },
      }),
    ];
  },
});
