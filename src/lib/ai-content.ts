import {
  DOMParser as ProseMirrorDOMParser,
  DOMSerializer,
  Slice,
} from "@tiptap/pm/model";
import type { Editor } from "@tiptap/react";

const HTML_TAG =
  /<\/?(?:p|h[1-6]|ul|ol|li|blockquote|strong|em|s|code|a|br)\b[^>]*>/i;

export function selectionToHtml(
  editor: Editor,
  from: number,
  to: number,
): string {
  const fragment = editor.state.doc.slice(from, to).content;
  const holder = document.createElement("div");
  holder.appendChild(
    DOMSerializer.fromSchema(editor.schema).serializeFragment(fragment),
  );
  return holder.innerHTML;
}

function stripFence(text: string): string {
  return text.replace(/^\s*```[a-z]*\n?/i, "").replace(/\n?```\s*$/, "");
}

export function aiOutputToSlice(
  editor: Editor,
  raw: string,
  from: number,
): Slice | null {
  const text = stripFence(raw);

  if (HTML_TAG.test(text)) {
    const template = document.createElement("template");
    template.innerHTML = text.replace(/<[^>]*$/, "");
    const slice = ProseMirrorDOMParser.fromSchema(editor.schema).parseSlice(
      template.content,
      { context: editor.state.doc.resolve(from) },
    );
    return slice.size > 0 ? slice : null;
  }

  if (!text.trim() || !editor.markdown) return null;
  const doc = editor.schema.nodeFromJSON(editor.markdown.parse(text));
  return doc.content.size > 0 ? Slice.maxOpen(doc.content) : null;
}
