import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAtomValue, useStore } from "jotai";
import { editingDocAtom, editingIdAtom } from "@/store/document";
import { useDocumentActions } from "@/hooks/use-document-actions";
import EditorWrapper from "@/components/editor/wrapper";

export default function NotePage() {
  const { id } = useParams<{ id: string }>();
  const { openNoteData } = useDocumentActions();
  const store = useStore();
  const editingDoc = useAtomValue(editingDocAtom);
  const handledIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!id || handledIdRef.current === id) return;
    handledIdRef.current = id;
    if (store.get(editingIdAtom) !== id) openNoteData(id);
  }, [id, openNoteData, store]);

  if (!id || editingDoc?.id !== id) return null;

  return <EditorWrapper mode="page" />;
}
