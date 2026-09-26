import {
  IconArrowUpRight,
  IconEye,
  IconEyeOff,
  IconPinFilled,
  IconLock,
} from "@tabler/icons-react";
import { FolderIcon } from "@/components/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TaskCheckbox,
  TaskMeta,
  TaskPriority,
} from "@/components/editor/task-checkbox";
import { useDocumentActions } from "@/hooks/use-document-actions";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { request } from "@/lib/api-client";
import { urls } from "@/lib/urls";
import type { DocItem } from "@/lib/types";
import { cn, relative } from "@/lib/utils";

interface TodoNoteCardProps {
  doc: DocItem;
}

export function TodoNoteCard({ doc }: TodoNoteCardProps) {
  const { openNote } = useDocumentActions();
  const [hideCompleted, setHideCompleted] = useLocalStorage(
    `todos-hide-completed:${doc.id}`,
    false,
  );
  const queryClient = useQueryClient();

  const { mutate: toggle } = useMutation({
    mutationFn: ({ id, checked }: { id: string; checked: boolean }) =>
      request(urls.Todo(id), { method: "PATCH", body: { checked } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", { hasTodo: true }] });
      queryClient.invalidateQueries({ queryKey: ["notes", "counts"] });
    },
  });

  const items = doc.todos ?? [];
  const hasCompleted = items.some((item) => item.checked);
  const isSecret = doc.folder?.secret || doc.secret;
  const handleOpen = () => openNote(doc.id);

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-[12px] border border-line bg-surface text-ink overflow-hidden transition-[box-shadow,border-color] duration-150 hover:border-line-2",
        !isSecret && "hover:shadow-card",
      )}
    >
      {isSecret && (
        <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-md bg-black/5 pointer-events-none">
          <IconLock size={22} className="text-gray-500" />
        </div>
      )}

      <div className="pt-3 px-3 text-xs text-ink-2/50 flex flex-col-reverse md:flex-row justify-between md:items-center">
        <div>
          {doc.folder && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-nowrap inline-flex items-center gap-1 rounded-[8px] text-xs text-ink-2">
                <FolderIcon className="size-3" />
                {doc.folder.name}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {doc.pinned && (
            <IconPinFilled size={12} className="shrink-0 text-ink-2/70" />
          )}
          <p>{relative(doc.updatedAt)}</p>
          {(hasCompleted || hideCompleted) && (
            <>
              <span aria-hidden className="mx-1 h-3.5 w-px flex-none bg-line-2" />
              <button
                type="button"
                onClick={() => setHideCompleted(!hideCompleted)}
                title={hideCompleted ? "Show completed" : "Hide completed"}
                aria-label={hideCompleted ? "Show completed" : "Hide completed"}
                className="grid h-6 w-6 place-items-center rounded-[4px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink cursor-pointer"
              >
                {hideCompleted ? <IconEyeOff size={15} /> : <IconEye size={15} />}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleOpen}
            className="grid h-6 w-6 place-items-center rounded-[4px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink cursor-pointer"
            aria-label={`Open ${doc.title?.trim() || "note"}`}
          >
            <IconArrowUpRight size={15} />
          </button>
        </div>
      </div>

      <div
        inert={Boolean(isSecret)}
        className={cn(
          "flex h-fit flex-col px-3 pt-1.5 pb-2 md:min-h-0 md:flex-1 md:overflow-y-auto",
          isSecret && "pointer-events-none",
        )}
      >
        {doc.title?.trim() && (
          <h2 className="mb-1.5 text-sm font-semibold leading-snug text-ink">
            {doc.title}
          </h2>
        )}
        {items.map((item) =>
          hideCompleted && item.checked ? null : (
          <div
            key={item.id}
            className="flex items-start gap-2 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-[22px] flex-none items-center gap-2">
              <TaskCheckbox
                checked={item.checked}
                onChange={(checked) => toggle({ id: item.id, checked })}
              />
              <TaskPriority priority={item.priority} />
            </div>
            <span
              className={cn(
                "text-[15px] flex-1 min-w-0 leading-snug break-words",
                item.checked && "line-through text-ink-3",
              )}
            >
              {item.text}
            </span>
            <TaskMeta
              checked={item.checked}
              priority={item.priority}
              deadline={item.deadline}
              onChange={() => {}}
              showActions={false}
            />
          </div>
          ),
        )}
      </div>
    </article>
  );
}
