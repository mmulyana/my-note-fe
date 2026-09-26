import { createPortal } from "react-dom";
import { useAtomValue } from "jotai";
import { IconEye, IconEyeOff, IconListCheck } from "@tabler/icons-react";
import { useApi } from "@/hooks/use-api";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { IApi, Notes } from "@/lib/types";
import { buildQuery, toDocItem } from "@/lib/utils";
import { urls } from "@/lib/urls";
import { topbarActionsSlotAtom } from "@/store/topbar";
import { TodoNoteCard } from "@/components/editor/todo-note-card";

export default function TodosPage() {
  const actionsSlot = useAtomValue(topbarActionsSlotAtom);
  const [hideCompleted, setHideCompleted] = useLocalStorage(
    "todos-hide-completed",
    false,
  );

  const { data } = useApi<IApi<Notes[]>>({
    url: buildQuery(urls.Notes, { hasTodo: true }),
    queryKey: ["notes", { hasTodo: true }],
  });

  const docs = (data?.data ?? []).map(toDocItem);

  return (
    <>
      {actionsSlot &&
        createPortal(
          <button
            type="button"
            onClick={() => setHideCompleted(!hideCompleted)}
            title={hideCompleted ? "Show completed" : "Hide completed"}
            aria-label={hideCompleted ? "Show completed" : "Hide completed"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-ink-2 transition-[color,transform] duration-150 hover:text-ink active:scale-[0.94] cursor-pointer"
          >
            {hideCompleted ? <IconEyeOff size={18} /> : <IconEye size={18} />}
          </button>,
          actionsSlot,
        )}
      {docs.length > 0 ? (
        <div className="masonry grid-view todo-grid pb-4">
          {docs.map((d) => (
            <TodoNoteCard key={d.id} doc={d} hideCompleted={hideCompleted} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-22.5 px-5 text-center text-ink-3">
          <div className="grid place-items-center w-19.5 h-19.5 rounded-full bg-surface-2 border border-line mb-1.5">
            <IconListCheck size={30} />
          </div>
          <div className="text-[17px] font-semibold text-ink-2">
            No todos yet
          </div>
          <div className="text-sm max-w-75">
            Notes with a checklist show up here.
          </div>
        </div>
      )}
    </>
  );
}
