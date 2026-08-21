import { useEffect } from "react";
import { useBlocker } from "react-router-dom";
import { useAtomValue, useSetAtom } from "jotai";
import {
  closeRequestAtom,
  editingIdAtom,
  isFullScreenAtom,
} from "@/store/document";
import { useIsMobile } from "@/hooks/use-is-mobile";

type Layer = "detail" | "full" | null;

/**
 * - Mobile: back menutup note.
 * - Desktop: back dari full-screen kembali ke modal windowed.
 */
export function useBackGuard() {
  const isMobile = useIsMobile();
  const isDetailOpen = useAtomValue(editingIdAtom) !== null;
  const isFullScreen = useAtomValue(isFullScreenAtom);
  const setFullScreen = useSetAtom(isFullScreenAtom);
  const requestClose = useSetAtom(closeRequestAtom);

  const layer: Layer = isMobile
    ? isDetailOpen
      ? "detail"
      : null
    : isFullScreen
      ? "full"
      : null;

  const blocker = useBlocker(
    ({ historyAction }) => historyAction === "POP" && layer !== null,
  );

  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (layer === "detail") requestClose((n) => n + 1);
    else if (layer === "full") setFullScreen(false);
    blocker.reset();
  }, [blocker, layer, requestClose, setFullScreen]);
}
