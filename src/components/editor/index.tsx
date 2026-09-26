import { EditorContent } from "@tiptap/react";
import { useNoteEditor } from "./session";

export { EditorSession } from "./session";

export function EditorBody() {
  const note = useNoteEditor();
  if (!note) return null;

  return (
    <>
      <EditorContent editor={note.editor} />
      {note.menus}
    </>
  );
}
