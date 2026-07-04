import { useEffect, useMemo } from "react";
import { useAtomValue } from "jotai";
import { useParams } from "react-router-dom";
import { useDocumentActions } from "@/hooks/use-document-actions";
import { editingDocAtom, isNewNoteAtom } from "@/store/document";
import { useApi } from "@/hooks/use-api";
import type { IApi } from "@/lib/types";
import { urls } from "@/lib/urls";
import { Editor } from ".";

export default function EditorWrapper() {
  const { autoSave, closeEditor, deleteDoc, labelIds, setLabelIds, folderId, setFolderId } =
    useDocumentActions();
  const editingDoc = useAtomValue(editingDocAtom);
  const isNewNote = useAtomValue(isNewNoteAtom);

  // Read label name from route param /label/:name
  const { name: labelName } = useParams<{ name: string }>();

  const { data: labelsData } = useApi<IApi<{ id: string; name: string }[]>>({
    url: urls.Labels,
    queryKey: ["labels"],
  });

  const labelIdFromParam = useMemo(() => {
    if (!labelName) return undefined;
    const match = (labelsData?.data ?? []).find((c) => c.name === labelName);
    return match?.id;
  }, [labelName, labelsData]);

  // Pre-fill labelIds when opening a new note on a label page
  useEffect(() => {
    if (isNewNote && labelIdFromParam && labelIds.length === 0) {
      setLabelIds([labelIdFromParam]);
    }
  }, [isNewNote, labelIdFromParam, labelIds.length, setLabelIds]);

  if (editingDoc) {
    return (
      <Editor
        key={editingDoc.id}
        doc={editingDoc}
        onAutoSave={autoSave}
        onClose={closeEditor}
        onDelete={deleteDoc}
        labelIds={labelIds}
        onLabelChange={setLabelIds}
        folderId={folderId}
        onFolderChange={setFolderId}
      />
    );
  }

  return null;
}
