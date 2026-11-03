import { useEffect } from "react";
import { useAtom } from "jotai";
import { IconX } from "@tabler/icons-react";
import { selectedNoteIdsAtom } from "@/store/home-view";

export function SelectionBar() {
  const [selectedIds, setSelectedIds] = useAtom(selectedNoteIdsAtom);
  const count = selectedIds.length;

  useEffect(() => {
    if (count === 0) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setSelectedIds([]);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [count, setSelectedIds]);

  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-surface py-1.5 pl-4 pr-1.5 text-[13px] text-ink shadow-[0_4px_24px_rgb(0_0_0/0.15)]">
      <span>
        {count} selected · drag onto a folder
      </span>
      <button
        type="button"
        onClick={() => setSelectedIds([])}
        aria-label="Cancel selection"
        className="grid size-7 cursor-pointer place-items-center rounded-full text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <IconX size={15} />
      </button>
    </div>
  );
}
