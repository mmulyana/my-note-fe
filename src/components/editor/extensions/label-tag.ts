import { InputRule, Mark, mergeAttributes } from "@tiptap/core";
import { PluginKey, Plugin } from "@tiptap/pm/state";
import { Suggestion } from "@tiptap/suggestion";
import type { SlashBridge, SlashState } from "./slash-command";

export const LABEL_TAG_NAME = "labelTag";

export const LabelSuggestPluginKey = new PluginKey("labelSuggest");

const LABEL_NAME = /^[\p{L}\p{N}_-]{1,32}$/u;
const LABEL_RUN = /^#[\p{L}\p{N}_-]{1,32}$/u;

export function toLabelName(raw: string): string | null {
  const name = raw.trim().toLowerCase();
  return LABEL_NAME.test(name) ? name : null;
}

export interface LabelTagOptions {
  bridge: SlashBridge | null;
}

export const LabelTag = Mark.create<LabelTagOptions>({
  name: LABEL_TAG_NAME,

  inclusive: false,
  keepOnSplit: false,

  addOptions() {
    return { bridge: null };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="label-tag"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-type": "label-tag",
        class: "rich-label-tag",
      }),
      0,
    ];
  },

  addInputRules() {
    const type = this.type;

    return [
      new InputRule({
        undoable: false,
        find: /(^|\s)#([\p{L}\p{N}_-]{1,32})\s$/u,
        handler: ({ state, range, match }) => {
          const from = range.from + match[1].length;
          const to = range.to;
          state.tr
            .addMark(from, to, type.create())
            .insert(to, state.schema.text(" "));
        },
      }),
    ];
  },

  addProseMirrorPlugins() {
    const { bridge } = this.options;
    const type = this.type;

    return [
      new Plugin({
        key: new PluginKey("labelTagValidate"),
        appendTransaction: (transactions, _oldState, newState) => {
          if (!transactions.some((tr) => tr.docChanged)) return null;

          const tr = newState.tr;

          newState.doc.descendants((node, pos) => {
            if (!node.isTextblock) return;

            let start = -1;
            let text = "";
            const flush = (end: number) => {
              if (start >= 0 && !LABEL_RUN.test(text)) {
                tr.removeMark(start, end, type);
              }
              start = -1;
              text = "";
            };

            node.forEach((child, offset) => {
              const from = pos + 1 + offset;
              if (child.isText && type.isInSet(child.marks)) {
                if (start < 0) start = from;
                text += child.text;
              } else {
                flush(from);
              }
            });
            flush(pos + 1 + node.content.size);

            return false;
          });

          return tr.steps.length ? tr : null;
        },
      }),
      Suggestion({
        editor: this.editor,
        pluginKey: LabelSuggestPluginKey,
        char: "#",
        allow: ({ state, range }) =>
          !state.doc.resolve(range.from).parent.type.spec.code &&
          !state.doc.rangeHasMark(range.from, range.to, type),
        command: () => {},
        render: () => {
          const sync = ({ query, range, clientRect }: SlashState) =>
            bridge?.open({ query, range, clientRect });
          return {
            onStart: sync,
            onUpdate: sync,
            onExit: () => bridge?.close(),
            onKeyDown: ({ event }) => bridge?.keyDown(event) ?? false,
          };
        },
      }),
    ];
  },
});
