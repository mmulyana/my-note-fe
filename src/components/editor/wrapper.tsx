import { useAtomValue } from "jotai";
import { useDocumentActions } from "@/hooks/use-document-actions";
import { editingDocAtom } from "@/store/document";
import { Editor } from ".";

export default function EditorWrapper() {
  const { autoSave, closeEditor, deleteDoc, categoryIds, setCategoryIds } = useDocumentActions();
  const editingDoc = useAtomValue(editingDocAtom);

  if (editingDoc) {
    return (
      <Editor
        key={editingDoc.id}
        doc={editingDoc}
        onAutoSave={autoSave}
        onClose={closeEditor}
        onDelete={deleteDoc}
        categoryIds={categoryIds}
        onCategoryChange={setCategoryIds}
      />
    );
  }

  return null;
}
