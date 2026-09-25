import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  IconArrowBackUp,
  IconCheck,
  IconLoader2,
  IconPlayerStopFilled,
  IconSparkles,
  IconX,
} from "@tabler/icons-react";
import type { Editor } from "@tiptap/react";
import type { AiEditStatus } from "@/hooks/use-ai-edit";

interface AiLoaderProps {
  editor: Editor;
  origin: number | null;
  status: AiEditStatus;
  error: string | null;
  onStop: () => void;
  onKeep: () => void;
  onUndo: () => void;
}

interface Spot {
  top: number;
  left: number;
}

const WIDTH = 260;
const HEIGHT = 36;
const GAP = 8;

const btn =
  "flex items-center gap-1 h-6 px-2 rounded-md text-[12px] text-(--ink-2) transition-colors hover:bg-(--surface-hi) hover:text-(--ink) outline-none cursor-pointer";

export function AiLoader({
  editor,
  origin,
  status,
  error,
  onStop,
  onKeep,
  onUndo,
}: AiLoaderProps) {
  const [spot, setSpot] = useState<Spot | null>(null);
  const active = status !== "idle" && origin !== null;

  useEffect(() => {
    if (!active || origin === null) {
      setSpot(null);
      return;
    }

    const anchor: number = origin;

    const update = () => {
      if (editor.isDestroyed) return;
      const pos = Math.min(anchor, editor.state.doc.content.size);
      const rect = editor.view.coordsAtPos(pos);
      const above = rect.top - HEIGHT - GAP;
      const top = above >= GAP ? above : rect.bottom + GAP;
      const next = {
        top: Math.min(Math.max(top, GAP), window.innerHeight - HEIGHT - GAP),
        left: Math.min(
          Math.max(rect.left, GAP),
          window.innerWidth - WIDTH - GAP,
        ),
      };
      setSpot((prev) =>
        prev && prev.top === next.top && prev.left === next.left ? prev : next,
      );
    };

    update();
    editor.on("transaction", update);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      editor.off("transaction", update);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [editor, origin, active]);

  if (!active || !spot) return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="fixed z-60 flex items-center gap-1 rounded-xl border border-(--line-2) bg-(--surface) p-1 pl-2.5 text-[12px] text-(--ink-2) shadow-(--shadow-lg)"
      style={{
        top: spot.top,
        left: spot.left,
        height: HEIGHT,
        maxWidth: `min(${WIDTH}px, calc(100vw - ${GAP * 2}px))`,
      }}
    >
      {status === "streaming" && (
        <>
          <IconLoader2 size={14} className="animate-spin text-(--ink-3)" />
          <span className="ml-1 mr-4">Writing…</span>
          <button
            type="button"
            aria-label="Stop"
            title="Stop (Esc)"
            className={btn}
            onClick={onStop}
          >
            <IconPlayerStopFilled size={12} />
          </button>
        </>
      )}
      {status === "review" && (
        <>
          <IconSparkles size={14} className="text-(--ink-3)" />
          {error && (
            <span className="ml-1 mr-1 truncate">Stopped: {error}</span>
          )}
          <button type="button" className={`${btn} ml-1`} onClick={onUndo}>
            <IconArrowBackUp size={13} />
            Undo
          </button>
          <button
            type="button"
            className={`${btn} bg-(--surface-hi) font-medium text-(--ink)`}
            onClick={onKeep}
          >
            <IconCheck size={13} />
            Keep
          </button>
        </>
      )}
      {status === "failed" && (
        <>
          <span className="mr-1 truncate">{error}</span>
          <button
            type="button"
            aria-label="Dismiss"
            className={btn}
            onClick={onKeep}
          >
            <IconX size={13} />
          </button>
        </>
      )}
    </div>,
    document.body,
  );
}
