import { useEffect, useState } from "react";
import { IconSparkles } from "@tabler/icons-react";
import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { AiAction } from "@/lib/ai-stream";
import { AiPromptInput } from "./ai-prompt-input";

const QUICK_ACTIONS: { label: string; action: AiAction }[] = [
  { label: "Rewrite", action: "rewrite" },
  { label: "Shorten", action: "shorten" },
  { label: "Fix grammar", action: "fix_grammar" },
];

interface AiBubbleMenuProps {
  editor: Editor;
  onRun: (action: AiAction, prompt?: string) => void;
  busy: boolean;
}

// note: entry point for selected text
export function AiBubbleMenu({ editor, onRun, busy }: AiBubbleMenuProps) {
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    const onSelection = () => {
      if (editor.state.selection.empty) setAsking(false);
    };
    editor.on("selectionUpdate", onSelection);
    return () => {
      editor.off("selectionUpdate", onSelection);
    };
  }, [editor]);

  const btn =
    "h-7 px-2 rounded-md text-[12px] text-(--ink-2) transition-colors hover:bg-(--surface-hi) hover:text-(--ink) outline-none cursor-pointer";

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top", offset: 8 }}
      shouldShow={({ editor: e, state }) =>
        e.isEditable && !state.selection.empty && !e.isActive("codeBlock")
      }
    >
      {busy ? null : (
        <div
          className="flex flex-col gap-1.5 rounded-xl border border-(--line-2) bg-(--surface) p-1 shadow-(--shadow-lg)"
          // keep the editor selection while clicking inside the menu
          onMouseDown={(e) => {
            if (!(e.target instanceof HTMLInputElement)) e.preventDefault();
          }}
        >
          {asking ? (
            <AiPromptInput
              onSubmit={(prompt) => {
                setAsking(false);
                onRun("ask", prompt);
              }}
              onCancel={() => {
                setAsking(false);
                editor.commands.focus();
              }}
            />
          ) : (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                className={`${btn} flex items-center gap-1 font-medium text-(--ink)`}
                onClick={() => setAsking(true)}
              >
                <IconSparkles size={14} />
                Ask AI
              </button>
              <span className="w-px h-4 bg-(--line) mx-0.5" />
              {QUICK_ACTIONS.map(({ label, action }) => (
                <button
                  key={action}
                  type="button"
                  className={btn}
                  onClick={() => onRun(action)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </BubbleMenu>
  );
}
