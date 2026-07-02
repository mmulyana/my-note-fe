import { useState, type FormEvent } from "react";
import { IconPhoto } from "@tabler/icons-react";
import type { Editor } from "@tiptap/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface InsertImageMenuProps {
  editor: Editor | null;
}

export function InsertImageMenu({ editor }: InsertImageMenuProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const src = url.trim();
    if (!src || !editor) return;
    editor.chain().focus().setImage({ src }).run();
    setUrl("");
    setOpen(false);
  };

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setUrl("");
      }}
    >
      <DropdownMenuTrigger
        className="grid place-items-center w-7 h-7 rounded-lg border border-(--line) bg-(--surface) text-(--ink-3) transition-[background,color,border-color] duration-150 hover:bg-(--surface-hi) hover:text-(--ink) hover:border-(--line-2) outline-none disabled:opacity-40 disabled:pointer-events-none"
        title="Insert image from URL"
        aria-label="Insert image from URL"
        disabled={!editor}
        onClick={(e) => e.stopPropagation()}
      >
        <IconPhoto size={15} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 bg-(--surface) border-(--line-2) rounded-xl shadow-(--shadow-lg) p-3"
        onCloseAutoFocus={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 text-left">
          <span className="text-[10px] uppercase tracking-[0.08em] text-(--ink-3)">
            Image URL
          </span>
          <input
            autoFocus
            type="url"
            placeholder="https://example.com/image.png"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="text-[12px] font-[inherit] text-(--ink) bg-(--surface-2) border border-(--line) rounded-[7px] px-2 py-1.5 outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={!url.trim()}
            className="h-7 rounded-md text-[12px] font-medium bg-(--surface-hi) text-(--ink) border border-(--line-2) transition-colors hover:bg-(--surface-2) disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Insert
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
