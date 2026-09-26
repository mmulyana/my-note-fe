import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { IconCheck } from "@tabler/icons-react";
import type { Editor } from "@tiptap/react";
import { useApi } from "@/hooks/use-api";
import { urls } from "@/lib/urls";
import type { IApi } from "@/lib/types";
import { AiPromptInput } from "./ai-prompt-input";
import type { SlashAnchor } from "./slash-menu";

export type SlashPopupView = "ai" | "folder" | "labels" | "image";

interface Named {
  id: string;
  name: string;
}

interface SlashPopupProps {
  editor: Editor;
  anchor: SlashAnchor;
  view: SlashPopupView;
  onClose: () => void;
  onAiSubmit: (prompt: string) => void;
  folderId: string | null;
  onFolderChange: (id: string | null) => void;
  labelIds: string[];
  onLabelChange: (ids: string[]) => void;
}

const POPUP_W = 240;
const FLIP_BELOW = 280;

// note: panel opened from the "/" menu; stays until dismissed (Esc or click outside)
export function SlashPopup({
  editor,
  anchor,
  view,
  onClose,
  onAiSubmit,
  folderId,
  onFolderChange,
  labelIds,
  onLabelChange,
}: SlashPopupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const dismiss = () => {
    closeRef.current();
    editor.commands.focus();
  };
  const dismissRef = useRef(dismiss);
  dismissRef.current = dismiss;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // note: capture phase, so the editor's Escape-to-close never sees it
      e.stopPropagation();
      dismissRef.current();
    };
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) closeRef.current();
    };
    // note: capture phase; the editor modal stops mousedown from bubbling to document
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("mousedown", onDown, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("mousedown", onDown, true);
    };
  }, [editor]);

  const left = Math.max(
    8,
    Math.min(anchor.left, window.innerWidth - POPUP_W - 8),
  );
  const flip = window.innerHeight - anchor.bottom < FLIP_BELOW;

  let body: ReactNode;
  if (view === "ai") {
    body = (
      <AiPromptInput
        placeholder="Ask AI to write…"
        onSubmit={(prompt) => {
          onAiSubmit(prompt);
          onClose();
        }}
        onCancel={dismiss}
      />
    );
  } else if (view === "image") {
    body = (
      <ImageUrlInput
        onSubmit={(src) => {
          editor.chain().focus().setImage({ src }).run();
          onClose();
        }}
      />
    );
  } else if (view === "folder") {
    body = (
      <PickList
        title="Folder"
        role="menuitemradio"
        onDismiss={dismiss}
        url={urls.Folder}
        queryKey="folders"
        empty="No folders yet"
        isSelected={(id) => id === folderId}
        onToggle={(id) => onFolderChange(folderId === id ? null : id)}
      />
    );
  } else {
    body = (
      <PickList
        title="Labels"
        role="menuitemcheckbox"
        onDismiss={dismiss}
        url={urls.Labels}
        queryKey="labels"
        empty="No labels yet"
        isSelected={(id) => labelIds.includes(id)}
        onToggle={(id) =>
          onLabelChange(
            labelIds.includes(id)
              ? labelIds.filter((x) => x !== id)
              : [...labelIds, id],
          )
        }
      />
    );
  }

  return createPortal(
    <div
      ref={ref}
      className="fixed z-60 rounded-xl border border-(--line-2) bg-(--surface) p-1 shadow-(--shadow-lg)"
      style={{
        left,
        width: POPUP_W,
        ...(flip
          ? { bottom: window.innerHeight - anchor.top + 6 }
          : { top: anchor.bottom + 6 }),
      }}
      // keep the editor selection; the prompt input still gets focus itself
      onMouseDown={(e) => {
        if (!(e.target instanceof HTMLInputElement)) e.preventDefault();
      }}
    >
      {body}
    </div>,
    document.body,
  );
}

function ImageUrlInput({ onSubmit }: { onSubmit: (src: string) => void }) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const src = url.trim();
    if (src) onSubmit(src);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 p-1.5 text-left"
    >
      <label
        htmlFor="slash-image-url"
        className="text-[10px] uppercase tracking-[0.08em] text-(--ink-3)"
      >
        Image URL
      </label>
      <input
        id="slash-image-url"
        autoFocus
        type="url"
        placeholder="https://example.com/image.png"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="text-[12px] font-[inherit] text-(--ink) bg-(--surface-2) border border-(--line) rounded-[6px] px-2 py-1.5 outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={!url.trim()}
        className="h-7 rounded-md text-[12px] font-medium bg-(--surface-hi) text-(--ink) border border-(--line-2) transition-colors hover:bg-(--surface-2) disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Insert
      </button>
    </form>
  );
}

interface PickListProps {
  title: string;
  role: "menuitemradio" | "menuitemcheckbox";
  onDismiss: () => void;
  url: string;
  queryKey: string;
  empty: string;
  isSelected: (id: string) => boolean;
  onToggle: (id: string) => void;
}

function PickList({
  title,
  role,
  onDismiss,
  url,
  queryKey,
  empty,
  isSelected,
  onToggle,
}: PickListProps) {
  const { data } = useApi<IApi<Named[]>>({ url, queryKey: [queryKey] });
  const rows = data?.data ?? [];
  const listRef = useRef<HTMLDivElement>(null);
  const focusedRef = useRef(false);

  const items = () =>
    Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>(
        "[role^=menuitem]",
      ) ?? [],
    );

  // note: move focus into the list once rows exist (first selected, else first)
  useEffect(() => {
    if (focusedRef.current || rows.length === 0) return;
    const all = items();
    const target = all.find((b) => b.getAttribute("aria-checked") === "true");
    (target ?? all[0])?.focus();
    focusedRef.current = true;
  }, [rows.length]);

  const handleKeyDown = (e: ReactKeyboardEvent) => {
    const all = items();
    const at = all.indexOf(document.activeElement as HTMLButtonElement);
    let next = -1;
    if (e.key === "ArrowDown") next = (at + 1) % all.length;
    else if (e.key === "ArrowUp") next = (at - 1 + all.length) % all.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = all.length - 1;
    else if (e.key === "Tab") {
      e.preventDefault();
      onDismiss();
      return;
    } else return;
    e.preventDefault();
    all[next]?.focus();
  };

  return (
    <div
      ref={listRef}
      role="menu"
      aria-label={title}
      onKeyDown={handleKeyDown}
      className="flex max-h-64 flex-col overflow-y-auto"
    >
      <div
        aria-hidden
        className="px-2 pt-1.5 pb-1 text-[10px] uppercase tracking-[0.08em] text-(--ink-3)"
      >
        {title}
      </div>
      {rows.length === 0 ? (
        <p role="none" className="px-2 py-1.5 text-[12px] text-(--ink-3)">
          {empty}
        </p>
      ) : (
        rows.map((row) => (
          <button
            key={row.id}
            type="button"
            role={role}
            aria-checked={isSelected(row.id)}
            onClick={() => onToggle(row.id)}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] text-(--ink-2) outline-none cursor-pointer hover:bg-(--surface-hi) hover:text-(--ink) focus-visible:bg-(--surface-hi) focus-visible:text-(--ink) focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-(--line-2)"
          >
            <span
              aria-hidden
              className="grid w-4 place-items-center text-(--ink)"
            >
              {isSelected(row.id) && <IconCheck size={14} />}
            </span>
            {row.name}
          </button>
        ))
      )}
    </div>
  );
}
