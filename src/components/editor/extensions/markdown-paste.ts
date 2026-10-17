import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

const STRONG_SIGNALS = [
  /^ {0,3}#{1,6}\s+\S/m,
  /^ {0,3}(```|~~~)/m,
  /^\s*[-*+]\s+\[[ xX]\]\s+\S/m,
  /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/m,
  /\*\*[^*\n]+\*\*/,
  /\[[^\]\n]+\]\([^)\s]+\)/,
];

const PROSE_MODES = new Set(["markdown", "md", "mdx", "plaintext", "text"]);

const LIST_LINE = /^\s*([-*+]|\d+\.)\s+\S/;
const QUOTE_LINE = /^ {0,3}>\s?\S/;

function countLines(lines: string[], pattern: RegExp) {
  return lines.filter((line) => pattern.test(line)).length;
}

export function looksLikeMarkdown(text: string, strongOnly = false) {
  if (STRONG_SIGNALS.some((pattern) => pattern.test(text))) return true;
  if (strongOnly) return false;
  const lines = text.split("\n");
  return countLines(lines, LIST_LINE) >= 2 || countLines(lines, QUOTE_LINE) >= 2;
}

function vscodeMode(raw: string | undefined) {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw).mode as string | undefined;
  } catch {
    return undefined;
  }
}

export const MarkdownPaste = Extension.create({
  name: "markdownPaste",
  priority: 1000,

  addProseMirrorPlugins() {
    const editor = this.editor;
    return [
      new Plugin({
        key: new PluginKey("markdownPaste"),
        props: {
          handlePaste: (_view, event) => {
            const data = event.clipboardData;
            if (!data || editor.isActive("codeBlock")) return false;

            const text = data.getData("text/plain").replace(/\r\n?/g, "\n");
            if (!text.trim()) return false;

            const mode = vscodeMode(data.getData("vscode-editor-data"));
            const prose = !mode || PROSE_MODES.has(mode);
            if (!prose) return false;

            const hasHtml = !!data.getData("text/html");
            if (mode !== "markdown" && !looksLikeMarkdown(text, hasHtml)) {
              return false;
            }

            return editor.commands.insertContent(text, {
              contentType: "markdown",
            });
          },
        },
      }),
    ];
  },
});
