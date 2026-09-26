import { Extension, type Range } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { Suggestion } from "@tiptap/suggestion";

export const SlashPluginKey = new PluginKey("slashCommand");

export interface SlashState {
  query: string;
  range: Range;
  clientRect?: (() => DOMRect | null) | null;
}

// note: the extension only reports state, React menu decides what to render and do
export interface SlashBridge {
  open: (state: SlashState) => void;
  close: () => void;
  keyDown: (event: KeyboardEvent) => boolean;
}

export const SlashCommand = Extension.create<{ bridge: SlashBridge | null }>({
  name: "slashCommand",

  addOptions() {
    return { bridge: null };
  },

  addProseMirrorPlugins() {
    const { bridge } = this.options;
    return [
      Suggestion({
        editor: this.editor,
        pluginKey: SlashPluginKey,
        char: "/",
        allow: ({ state, range }) =>
          !state.doc.resolve(range.from).parent.type.spec.code,
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
