import {
  IconFolderFilled,
  IconTagFilled,
  IconPinFilled,
  IconLock,
  IconPlus,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskCheckbox, TaskMeta } from "@/components/editor/task-checkbox";
import { useDocumentActions } from "@/hooks/use-document-actions";
import { request } from "@/lib/api-client";
import { urls } from "@/lib/urls";
import type { DocItem } from "@/lib/types";
import { cn, relative } from "@/lib/utils";

interface TodoNoteCardProps {
  doc: DocItem;
}

export function TodoNoteCard({ doc }: TodoNoteCardProps) {
  const { openNote } = useDocumentActions();
  const queryClient = useQueryClient();

  const { mutate: toggle } = useMutation({
    mutationFn: ({ id, checked }: { id: string; checked: boolean }) =>
      request(urls.Todo(id), { method: "PATCH", body: { checked } }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notes", { hasTodo: true }] }),
  });

  const items = doc.todos ?? [];
  const isSecret = doc.folder?.secret || doc.secret;
  const handleOpen = () => openNote(doc.id);

  return (
    <article
      className={cn(
        "group relative flex flex-col cursor-pointer rounded-[14px] border border-line bg-surface text-ink overflow-hidden outline-none transition-[box-shadow,border-color] duration-150 hover:border-line-2 focus-visible:shadow-[0_0_0_2px_var(--accent)]",
        !isSecret && "hover:shadow-(--shadow)",
      )}
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(e) => e.key === "Enter" && handleOpen()}
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
              <span className="text-nowrap inline-flex items-center gap-1 rounded-[10px] text-xs text-ink-2">
                <IconFolderFilled size={12} />
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
        </div>
      </div>

      <div
        inert={Boolean(isSecret)}
        className={cn(
          "flex-1 min-h-0 px-3 pt-1.5 pb-1 flex flex-col max-h-45 overflow-hidden mask-[linear-gradient(to_bottom,black_85%,transparent)]",
          isSecret && "pointer-events-none",
        )}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 py-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <TaskCheckbox
              checked={item.checked}
              onChange={(checked) => toggle({ id: item.id, checked })}
            />
            <span
              className={cn(
                "text-sm flex-1 min-w-0 leading-snug break-words",
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
        ))}
      </div>

      {doc.labels.length > 0 && (
        <div className="relative shrink-0 gap-2 px-3 pb-2.5 pt-1.5 text-xs text-ink-3 bg-linear-to-b from-transparent via-surface via-60% to-surface">
          <div className="flex gap-1 items-center flex-wrap">
            <div className="flex gap-1 items-center text-sm">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[10px] text-xs text-ink-2 border border-line">
                  <IconTagFilled size={12} />
                  {doc.labels?.[0].name}
                </span>
              </div>
              {doc.labels.length > 1 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[10px] text-xs text-ink-2 border border-line">
                    <IconTagFilled size={12} />
                    <span className="flex items-center">
                      <IconPlus size={9} />
                      {doc.labels?.length - 1}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
