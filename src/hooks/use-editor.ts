import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { TaskList } from "@tiptap/extension-list";
import { CustomTaskItem } from "../components/editor/extensions/custom-task-item";
import { CustomCodeBlock } from "../components/editor/extensions/code-block";

export function useDocumentEditor(initialContent: string) {
  return useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CustomCodeBlock,
      TaskList,
      CustomTaskItem.configure({ nested: false }),
      Image.configure({
        HTMLAttributes: { class: "rich-image" },
      }),
      Placeholder.configure({
        placeholder: "Write something",
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      // horizontal padding comes from the modal (.modal-pad); keep a min height
      attributes: { class: "rich-content min-h-[240px]" },
    },
  });
}
