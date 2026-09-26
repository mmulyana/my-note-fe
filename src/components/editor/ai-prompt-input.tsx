import { useState, type FormEvent } from "react";
import { IconSparkles, IconArrowUp } from "@tabler/icons-react";

interface AiPromptInputProps {
  placeholder?: string;
  onSubmit: (prompt: string) => void;
  onCancel: () => void;
}

// note: shared by the bubble and floating menus
export function AiPromptInput({
  placeholder = "Tell AI what to do…",
  onSubmit,
  onCancel,
}: AiPromptInputProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = prompt.trim();
    if (!value) return;
    onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1">
      <IconSparkles size={14} className="ml-1.5 text-ink-3" />
      <input
        autoFocus
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Escape") return;
          // note: don't let the editor's Escape-to-close fire
          e.stopPropagation();
          onCancel();
        }}
        placeholder={placeholder}
        className="w-56 text-[12px] font-[inherit] text-ink bg-transparent px-1 py-1 outline-none"
      />
      <button
        type="submit"
        disabled={!prompt.trim()}
        aria-label="Send"
        className="grid place-items-center w-6 h-6 rounded-md bg-surface-hi text-ink transition-colors hover:bg-surface-2 disabled:opacity-40 disabled:pointer-events-none"
      >
        <IconArrowUp size={14} />
      </button>
    </form>
  );
}
