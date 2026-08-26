import {
  IconFolderFilled,
  IconTagFilled,
  IconPinFilled,
  IconLock,
  IconPlus,
} from "@tabler/icons-react";
import { TodoProgress } from "@/components/editor/todo-progress";
import { useDocumentActions } from "@/hooks/use-document-actions";
import type { DocItem } from "@/lib/types";
import { cn, relative } from "@/lib/utils";

interface DocumentCardProps {
  doc: DocItem;
}

export function DocumentCard({ doc }: DocumentCardProps) {
  const { openNote } = useDocumentActions();

  const { total, done } = doc.todoSummary;
  const isSecret = doc.folder?.secret || doc.secret;
  const hasFooter = total > 0 || doc.labels.length > 0;

  const handleOpen = () => openNote(doc.id);

  return (
    <article
      className={cn(
        "group relative flex flex-col cursor-pointer rounded-[14px] border border-line bg-surface text-ink overflow-hidden outline-none transition-[box-shadow,border-color,transform] duration-150 hover:border-line-2 focus-visible:shadow-[0_0_0_2px_var(--accent)]",
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

      {doc.preview ? (
        <div
          inert={Boolean(isSecret)}
          className={cn(
            "rich-content rich-readonly flex-1 min-h-0 px-3 pt-1.5 pb-1 overflow-hidden mask-[linear-gradient(to_bottom,black_78%,transparent)] hover:select-none",
            hasFooter && "-mb-3.5",
            isSecret && "pointer-events-none",
          )}
          dangerouslySetInnerHTML={{ __html: doc.preview }}
        />
      ) : (
        <div
          className={cn(
            "flex-1 min-h-0 px-3 pt-1.5 pb-2 text-[13px] italic text-ink-4",
            hasFooter && "-mb-3.5",
          )}
        >
          Empty
        </div>
      )}

      {hasFooter && (
        <div className="relative shrink-0 gap-2 px-3 pb-2.5 pt-1.5 text-xs text-ink-3 bg-linear-to-b from-transparent via-surface via-60% to-surface">
          <div className="flex gap-1 items-center flex-wrap">
            <TodoProgress done={done} total={total} />
            {doc.labels.length > 0 && (
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
            )}
          </div>
        </div>
      )}
    </article>
  );
}
