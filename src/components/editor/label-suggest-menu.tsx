import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconHash, IconPlus } from "@tabler/icons-react";
import type { Editor } from "@tiptap/react";
import { exitSuggestion } from "@tiptap/suggestion";
import { useApi } from "@/hooks/use-api";
import { urls } from "@/lib/urls";
import type { IApi } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { SlashState } from "./extensions/slash-command";
import {
  LABEL_TAG_NAME,
  LabelSuggestPluginKey,
  toLabelName,
} from "./extensions/label-tag";

interface Label {
  id: string;
  name: string;
}

interface SuggestItem {
  name: string;
  create: boolean;
}

interface LabelSuggestMenuProps {
  editor: Editor;
  state: SlashState | null;
  keyHandlerRef: { current: (event: KeyboardEvent) => boolean };
}

const MENU_W = 224;
const FLIP_BELOW = 280;
const MAX_ITEMS = 8;

export function LabelSuggestMenu({
  editor,
  state,
  keyHandlerRef,
}: LabelSuggestMenuProps) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const { data } = useApi<IApi<Label[]>>({
    url: urls.Labels,
    queryKey: ["labels"],
  });

  const query = state?.query.trim().toLowerCase() ?? "";

  const items = useMemo<SuggestItem[]>(() => {
    if (!query) return [];
    const all = (data?.data ?? []).filter((l) => toLabelName(l.name) !== null);
    const starts = all.filter((l) => l.name.toLowerCase().startsWith(query));
    const contains = all.filter((l) => {
      const name = l.name.toLowerCase();
      return !name.startsWith(query) && name.includes(query);
    });

    const rows: SuggestItem[] = [...starts, ...contains]
      .slice(0, MAX_ITEMS)
      .map((l) => ({ name: l.name, create: false }));

    const newName = toLabelName(query);
    if (newName && !all.some((l) => l.name.toLowerCase() === newName)) {
      rows.push({ name: newName, create: true });
    }
    return rows;
  }, [data, query]);

  useEffect(() => setActive(0), [query]);

  const open = !!state && items.length > 0;
  const activeItem = items[Math.min(active, items.length - 1)];
  const activeId = `label-option-${activeItem?.create ? "new-" : ""}${activeItem?.name}`;

  useEffect(() => {
    const dom = editor.view.dom;
    if (!open) return;
    dom.setAttribute("aria-haspopup", "listbox");
    dom.setAttribute("aria-expanded", "true");
    dom.setAttribute("aria-controls", "label-menu");
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

  const pick = (item: SuggestItem) => {
    if (!state) return;
    editor
      .chain()
      .insertContentAt(state.range, [
        {
          type: "text",
          text: `#${item.name}`,
          marks: [{ type: LABEL_TAG_NAME }],
        },
        { type: "text", text: " " },
      ])
      .run();
  };

  keyHandlerRef.current = (event) => {
    if (!state || items.length === 0) return false;
    if (event.key === "Escape") {
      event.stopPropagation();
      exitSuggestion(editor.view, LabelSuggestPluginKey);
      return true;
    }
    if (event.key === "ArrowDown") {
      setActive((i) => (i + 1) % items.length);
      return true;
    }
    if (event.key === "ArrowUp") {
      setActive((i) => (i - 1 + items.length) % items.length);
      return true;
    }
    if (event.key === "Enter" || event.key === "Tab") {
      pick(items[Math.min(active, items.length - 1)]);
      return true;
    }
    return false;
  };

  const rect = state?.clientRect?.();
  if (!state || !rect || items.length === 0) return null;

  const left = Math.max(8, Math.min(rect.left, window.innerWidth - MENU_W - 8));
  const flip = window.innerHeight - rect.bottom < FLIP_BELOW;

  return createPortal(
    <div
      ref={listRef}
      id="label-menu"
      role="listbox"
      aria-label="Labels"
      className="fixed z-60 max-h-64 overflow-y-auto rounded-xl border border-line-2 bg-surface p-1 shadow-card-lg"
      style={{
        left,
        width: MENU_W,
        ...(flip
          ? { bottom: window.innerHeight - rect.top + 6 }
          : { top: rect.bottom + 6 }),
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {items.map((item, index) => (
        <button
          key={`${item.create ? "new" : "old"}-${item.name}`}
          type="button"
          id={`label-option-${item.create ? "new-" : ""}${item.name}`}
          role="option"
          aria-selected={index === active}
          tabIndex={-1}
          data-index={index}
          onClick={() => pick(item)}
          onMouseEnter={() => setActive(index)}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] text-ink-2 outline-none cursor-pointer",
            index === active && "bg-surface-hi text-ink",
          )}
        >
          <span className="text-ink-3">
            {item.create ? <IconPlus size={15} /> : <IconHash size={15} />}
          </span>
          <span className="truncate">
            {item.create ? `Create "${item.name}"` : item.name}
          </span>
          {index === active && (
            <kbd className="ml-auto flex-none rounded-[5px] border border-line px-1.5 py-px font-sans text-[10px] font-medium text-ink-3 bg-surface">
              Tab
            </kbd>
          )}
        </button>
      ))}
    </div>,
    document.body,
  );
}
