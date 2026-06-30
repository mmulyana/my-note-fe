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
  const { autoSave, closeEditor, deleteDoc, categoryIds, setCategoryIds } = useDocumentActions();
  const editingDoc = useAtomValue(editingDocAtom);
  const isNewNote = useAtomValue(isNewNoteAtom);

  // Read category name from route param /category/:name
  const { name: categoryName } = useParams<{ name: string }>();

  const { data: categoriesData } = useApi<IApi<{ id: string; name: string }[]>>({
    url: urls.Categories,
    queryKey: ["categories"],
  });

  const categoryIdFromParam = useMemo(() => {
    if (!categoryName) return undefined;
    const match = (categoriesData?.data ?? []).find((c) => c.name === categoryName);
    return match?.id;
  }, [categoryName, categoriesData]);

  // Pre-fill categoryIds when opening a new note on a category page
  useEffect(() => {
    if (isNewNote && categoryIdFromParam && categoryIds.length === 0) {
      setCategoryIds([categoryIdFromParam]);
    }
  }, [isNewNote, categoryIdFromParam, categoryIds.length, setCategoryIds]);

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
