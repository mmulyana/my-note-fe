import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "@tiptap/markdown";
import { TaskList } from "@tiptap/extension-list";
import { CustomTaskItem } from "../components/editor/extensions/custom-task-item";
import { CustomCodeBlock } from "../components/editor/extensions/code-block";
import { CustomImage } from "../components/editor/extensions/image";
import { LinkCard } from "../components/editor/extensions/link-card";
import {
  SlashCommand,
  type SlashBridge,
} from "../components/editor/extensions/slash-command";

export function useDocumentEditor(
  initialContent: string,
  slashBridge: SlashBridge,
) {
  return useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        // visible drop indicator while dragging blocks in both themes
        dropcursor: { color: "var(--accent)", width: 2 },
      }),
      CustomCodeBlock,
      TaskList,
      CustomTaskItem.configure({ nested: false }),
      CustomImage.configure({
        HTMLAttributes: { class: "rich-image" },
      }),
      LinkCard,
      Markdown,
      SlashCommand.configure({ bridge: slashBridge }),
      Placeholder.configure({
        placeholder: "Write something, or type / for commands",
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      // horizontal padding comes from the modal (.modal-pad); keep a min height
      attributes: {
        class: "rich-content min-h-[240px]",
        // no red squiggles from the browser's spell/grammar checker,
        // nor from Grammarly-style extensions that ignore spellcheck
        spellcheck: "false",
        "data-gramm": "false",
        "data-gramm_editor": "false",
        "data-enable-grammarly": "false",
      },
    },
  });
}
