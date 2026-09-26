import { useAtom, useAtomValue } from "jotai";
import { useDocumentActions } from "@/hooks/use-document-actions";
import { editingDocAtom, editingFolderIdAtom } from "@/store/document";
import { Editor } from ".";

export default function EditorWrapper({
  mode = "modal",
}: {
  mode?: "modal" | "page";
}) {
  const {
    autoSave,
    closeEditor,
    deleteDoc,
    archiveDoc,
    pinnedDoc,
    secretDoc
  } = useDocumentActions();
  const editingDoc = useAtomValue(editingDocAtom);
  const [folderId, setFolderId] = useAtom(editingFolderIdAtom);

  if (editingDoc) {
    return (
      <Editor
        key={editingDoc.id}
        doc={editingDoc}
        onAutoSave={autoSave}
        onClose={closeEditor}
        onDelete={deleteDoc}
        onArchive={archiveDoc}
        onPinned={pinnedDoc}
        onSecret={secretDoc}
        mode={mode}
        folderId={folderId}
        onFolderChange={setFolderId}
      />
    );
  }

  return null;
}
