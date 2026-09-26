import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  IconCheckbox,
  IconFolderFilled,
  IconH1,
  IconH2,
  IconList,
  IconListNumbers,
  IconPhoto,
  IconPin,
  IconPinFilled,
  IconSparkles,
  IconTagFilled,
  IconTypography,
} from "@tabler/icons-react";
import type { ChainedCommands, Editor } from "@tiptap/react";
import { exitSuggestion } from "@tiptap/suggestion";
import { SlashPluginKey, type SlashState } from "./extensions/slash-command";
import { cn } from "@/lib/utils";

export type SlashActionId = "ai" | "pin" | "folder" | "image";

export interface SlashAnchor {
  left: number;
  top: number;
  bottom: number;
}

interface SlashItem {
  id: string;
  title: string;
  group: "AI" | "Blocks" | "Note";
  icon: ReactNode;
  keywords: string[];
  run?: (chain: ChainedCommands) => ChainedCommands;
  action?: SlashActionId;
}

interface SlashMenuProps {
  editor: Editor;
  state: SlashState | null;
  pinned: boolean;
  onPick: (id: SlashActionId, anchor: SlashAnchor) => void;
  keyHandlerRef: { current: (event: KeyboardEvent) => boolean };
}

const MENU_W = 224;
const FLIP_BELOW = 280;

// note: entry point for the "/" menu; AI, blocks, image, label, pin and folder
export function SlashMenu({
  editor,
  state,
  pinned,
  onPick,
  keyHandlerRef,
}: SlashMenuProps) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const items = useMemo<SlashItem[]>(
    () => [
      {
        id: "ai",
        title: "Ask AI",
        group: "AI",
        icon: <IconSparkles size={15} />,
        keywords: ["ai", "write", "generate", "assistant"],
        action: "ai",
      },
      {
        id: "text",
        title: "Text",
        group: "Blocks",
        icon: <IconTypography size={15} />,
        keywords: ["text", "paragraph", "plain"],
        run: (c) => c.setParagraph(),
      },
      {
        id: "h1",
        title: "Heading 1",
        group: "Blocks",
        icon: <IconH1 size={15} />,
        keywords: ["heading", "h1", "title", "big"],
        run: (c) => c.setHeading({ level: 1 }),
      },
      {
        id: "h2",
        title: "Heading 2",
        group: "Blocks",
        icon: <IconH2 size={15} />,
        keywords: ["heading", "h2", "subtitle"],
        run: (c) => c.setHeading({ level: 2 }),
      },
      {
        id: "bullet",
        title: "Bulleted list",
        group: "Blocks",
        icon: <IconList size={15} />,
        keywords: ["list", "bullet", "ul", "unordered"],
        run: (c) => c.toggleBulletList(),
      },
      {
        id: "numbered",
        title: "Numbered list",
        group: "Blocks",
        icon: <IconListNumbers size={15} />,
        keywords: ["list", "numbered", "ordered", "ol"],
        run: (c) => c.toggleOrderedList(),
      },
      {
        id: "checkbox",
        title: "Checkbox",
        group: "Blocks",
        icon: <IconCheckbox size={15} />,
        keywords: ["checkbox", "task", "todo", "check"],
        run: (c) => c.toggleTaskList(),
      },
      {
        id: "image",
        title: "Add image",
        group: "Blocks",
        icon: <IconPhoto size={15} />,
        keywords: ["image", "photo", "picture", "img"],
        action: "image",
      },
      {
        id: "label",
        title: "Label",
        group: "Blocks",
        icon: <IconTagFilled size={15} />,
        keywords: ["label", "tag", "hashtag"],
        run: (c) => c.insertContent("#"),
      },
      {
        id: "pin",
        title: pinned ? "Unpin note" : "Pin note",
        group: "Note",
        icon: pinned ? <IconPinFilled size={15} /> : <IconPin size={15} />,
        keywords: ["pin", "unpin", "favorite"],
        action: "pin",
      },
      {
        id: "folder",
        title: "Move to folder",
        group: "Note",
        icon: <IconFolderFilled size={15} />,
        keywords: ["folder", "move"],
        action: "folder",
      },
    ],
    [pinned],
  );

  const query = state?.query.toLowerCase() ?? "";
  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          !query ||
          i.title.toLowerCase().includes(query) ||
          i.keywords.some((k) => k.startsWith(query)),
      ),
    [items, query],
  );

  useEffect(() => setActive(0), [query]);

  const open = !!state && filtered.length > 0;
  const activeId = `slash-option-${filtered[Math.min(active, filtered.length - 1)]?.id}`;

  // note: editor keeps DOM focus, so expose the menu as a combobox popup
  useEffect(() => {
    const dom = editor.view.dom;
    if (!open) return;
    dom.setAttribute("aria-haspopup", "listbox");
    dom.setAttribute("aria-expanded", "true");
    dom.setAttribute("aria-controls", "slash-menu");
    dom.setAttribute("aria-activedescendant", activeId);
    return () => {
      dom.removeAttribute("aria-haspopup");
      dom.removeAttribute("aria-expanded");
      dom.removeAttribute("aria-controls");
      dom.removeAttribute("aria-activedescendant");
    };
  }, [editor, open, activeId]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const pick = (item: SlashItem) => {
    if (!state) return;
    const rect = state.clientRect?.();
    const anchor: SlashAnchor = rect
      ? { left: rect.left, top: rect.top, bottom: rect.bottom }
      : { left: 16, top: 16, bottom: 16 };
    // note: no .focus() here; its deferred refocus would steal focus from the popup
    const chain = editor.chain().deleteRange(state.range);
    if (item.run) {
      item.run(chain).run();
      return;
    }
    chain.run();
    if (item.action) onPick(item.action, anchor);
  };

  keyHandlerRef.current = (event) => {
    if (!state) return false;
    if (event.key === "Escape") {
      // note: don't let the editor's Escape-to-close fire
      event.stopPropagation();
      exitSuggestion(editor.view, SlashPluginKey);
      return true;
    }
    if (filtered.length === 0) return false;
    if (event.key === "ArrowDown") {
      setActive((i) => (i + 1) % filtered.length);
      return true;
    }
    if (event.key === "ArrowUp") {
      setActive((i) => (i - 1 + filtered.length) % filtered.length);
      return true;
    }
    if (event.key === "Enter" || event.key === "Tab") {
      pick(filtered[Math.min(active, filtered.length - 1)]);
      return true;
    }
    return false;
  };

  const rect = state?.clientRect?.();
  if (!state || !rect || filtered.length === 0) return null;

  const left = Math.max(8, Math.min(rect.left, window.innerWidth - MENU_W - 8));
  const flip = window.innerHeight - rect.bottom < FLIP_BELOW;

  return createPortal(
    <div
      ref={listRef}
      id="slash-menu"
      role="listbox"
      aria-label="Commands"
      className="fixed z-60 max-h-64 overflow-y-auto rounded-xl border border-(--line-2) bg-(--surface) p-1 shadow-(--shadow-lg)"
      style={{
        left,
        width: MENU_W,
        ...(flip
          ? { bottom: window.innerHeight - rect.top + 6 }
          : { top: rect.bottom + 6 }),
      }}
      // keep the editor focused while clicking items
      onMouseDown={(e) => e.preventDefault()}
    >
      {filtered.map((item, index) => (
        <div key={item.id} role="presentation">
          {(index === 0 || filtered[index - 1].group !== item.group) && (
            <div
              aria-hidden
              className="px-2 pt-1.5 pb-1 text-[10px] uppercase tracking-[0.08em] text-(--ink-3)"
            >
              {item.group}
            </div>
          )}
          <button
            type="button"
            id={`slash-option-${item.id}`}
            role="option"
            aria-selected={index === active}
            tabIndex={-1}
            data-index={index}
            onClick={() => pick(item)}
            onMouseEnter={() => setActive(index)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] text-(--ink-2) outline-none cursor-pointer",
              index === active && "bg-(--surface-hi) text-(--ink)",
            )}
          >
            <span className="text-(--ink-3)">{item.icon}</span>
            {item.title}
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}
