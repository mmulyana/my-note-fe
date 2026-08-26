import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "jotai";
import { editingIdAtom, isNewNoteAtom } from "@/store/document";
import { useDocumentActions } from "@/hooks/use-document-actions";

// note: renders nothing — pushing this route is what gives mobile back a history entry to consume.
export default function NotePage() {
  const { id } = useParams<{ id: string }>();
  const { openNoteData } = useDocumentActions();
  const store = useStore();
  const handledIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!id || handledIdRef.current === id) return;
    handledIdRef.current = id;
    const alreadyOpen =
      store.get(editingIdAtom) === id && store.get(isNewNoteAtom);
    if (!alreadyOpen) openNoteData(id);
  }, [id, openNoteData, store]);

  return null;
}
