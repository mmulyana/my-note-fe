import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  IconColumnInsertLeft,
  IconColumnInsertRight,
  IconColumnRemove,
  IconRowInsertBottom,
  IconRowInsertTop,
  IconRowRemove,
  IconTableOff,
} from "@tabler/icons-react";
import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";

interface TableAction {
  title: string;
  icon: ReactNode;
  run: (editor: Editor) => void;
  danger?: boolean;
}

const GROUPS: TableAction[][] = [
  [
    {
      title: "Add row above",
      icon: <IconRowInsertTop size={15} />,
      run: (e) => e.chain().focus().addRowBefore().run(),
    },
    {
      title: "Add row below",
      icon: <IconRowInsertBottom size={15} />,
      run: (e) => e.chain().focus().addRowAfter().run(),
    },
    {
      title: "Delete row",
      icon: <IconRowRemove size={15} />,
      run: (e) => e.chain().focus().deleteRow().run(),
    },
  ],
  [
    {
      title: "Add column left",
      icon: <IconColumnInsertLeft size={15} />,
      run: (e) => e.chain().focus().addColumnBefore().run(),
    },
    {
      title: "Add column right",
      icon: <IconColumnInsertRight size={15} />,
      run: (e) => e.chain().focus().addColumnAfter().run(),
    },
    {
      title: "Delete column",
      icon: <IconColumnRemove size={15} />,
      run: (e) => e.chain().focus().deleteColumn().run(),
    },
  ],
  [
    {
      title: "Delete table",
      icon: <IconTableOff size={15} />,
      run: (e) => e.chain().focus().deleteTable().run(),
      danger: true,
    },
  ],
];

const MENU_W = 192;
const MENU_H = 292;
const LONG_PRESS_MS = 500;
const LONG_PRESS_SLOP = 10;
const GHOST_CLICK_MS = 400;

export function TableMenu({ editor }: { editor: Editor }) {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const openedAtRef = useRef(0);

  useEffect(() => {
    const dom = editor.view.dom;
    const openAt = (x: number, y: number) => {
      const hit = editor.view.posAtCoords({ left: x, top: y });
      if (hit) editor.commands.setTextSelection(hit.pos);
      openedAtRef.current = Date.now();
      setPoint({ x, y });
    };

    const onContextMenu = (event: MouseEvent) => {
      if (!editor.isEditable) return;
      const target = event.target as HTMLElement | null;
      if (!target?.closest("td, th")) return;
      event.preventDefault();
      openAt(event.clientX, event.clientY);
    };

    let timer: number | undefined;
    let origin: { x: number; y: number } | null = null;
    let fired = false;
    const cancel = () => {
      window.clearTimeout(timer);
      origin = null;
    };

    const onTouchStart = (event: TouchEvent) => {
      cancel();
      fired = false;
      if (!editor.isEditable || event.touches.length !== 1) return;
      const target = event.target as HTMLElement | null;
      if (!target?.closest("td, th")) return;
      const touch = event.touches[0];
      origin = { x: touch.clientX, y: touch.clientY };
      timer = window.setTimeout(() => {
        if (!origin) return;
        fired = true;
        openAt(origin.x, origin.y);
        origin = null;
      }, LONG_PRESS_MS);
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!origin) return;
      const touch = event.touches[0];
      if (
        Math.hypot(touch.clientX - origin.x, touch.clientY - origin.y) >
        LONG_PRESS_SLOP
      ) {
        cancel();
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      cancel();
      if (fired && event.cancelable) event.preventDefault();
      fired = false;
    };

    dom.addEventListener("contextmenu", onContextMenu);
    dom.addEventListener("touchstart", onTouchStart, { passive: true });
    dom.addEventListener("touchmove", onTouchMove, { passive: true });
    dom.addEventListener("touchend", onTouchEnd);
    dom.addEventListener("touchcancel", cancel);
    return () => {
      cancel();
      dom.removeEventListener("contextmenu", onContextMenu);
      dom.removeEventListener("touchstart", onTouchStart);
      dom.removeEventListener("touchmove", onTouchMove);
      dom.removeEventListener("touchend", onTouchEnd);
      dom.removeEventListener("touchcancel", cancel);
    };
  }, [editor]);

  useEffect(() => {
    if (!point) return;
    const close = () => setPoint(null);
    const onMouseDown = (event: MouseEvent) => {
      if (Date.now() - openedAtRef.current < GHOST_CLICK_MS) return;
      if (!menuRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [point]);

  if (!point) return null;

  const left = Math.max(8, Math.min(point.x, window.innerWidth - MENU_W - 8));
  const top = Math.max(8, Math.min(point.y, window.innerHeight - MENU_H - 8));

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-label="Table"
      className="fixed z-60 rounded-xl border border-line-2 bg-surface p-1 shadow-card-lg"
      style={{ left, top, width: MENU_W }}
      onMouseDown={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {GROUPS.map((group, i) => (
        <div key={i} role="presentation">
          {i > 0 && <div className="my-1 h-px bg-line" />}
          {group.map((action) => (
            <button
              key={action.title}
              type="button"
              role="menuitem"
              onClick={() => {
                action.run(editor);
                setPoint(null);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] outline-none cursor-pointer hover:bg-surface-hi",
                action.danger
                  ? "text-red-500"
                  : "text-ink-2 hover:text-ink",
              )}
            >
              <span className={action.danger ? "" : "text-ink-3"}>
                {action.icon}
              </span>
              {action.title}
            </button>
          ))}
        </div>
      ))}
    </div>,
    document.body,
  );
}
