import { useEffect, useRef } from "react";
import { useBlocker, useLocation } from "react-router-dom";
import { useAtomValue, useSetAtom } from "jotai";
import { closeRequestAtom, isFullScreenAtom } from "@/store/document";

// note: mobile note-close is driven by leaving the /note/:id route (see NotePage), not a blocker here.
export function useBackGuard() {
  const isFullScreen = useAtomValue(isFullScreenAtom);
  const setFullScreen = useSetAtom(isFullScreenAtom);
  const requestClose = useSetAtom(closeRequestAtom);
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    const prevPath = prevPathRef.current;
    prevPathRef.current = location.pathname;
    const leftNoteRoute =
      prevPath.startsWith("/note/") && !location.pathname.startsWith("/note/");
    if (leftNoteRoute) requestClose((n) => n + 1);
  }, [location.pathname, requestClose]);

  const blocker = useBlocker(
    ({ historyAction }) => historyAction === "POP" && isFullScreen,
  );

  useEffect(() => {
    if (blocker.state !== "blocked") return;
    setFullScreen(false);
    blocker.reset();
  }, [blocker, setFullScreen]);
}
