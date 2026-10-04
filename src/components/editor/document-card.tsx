import { IconLock } from "@tabler/icons-react";
import { FolderIcon } from "@/components/icons";
import { TodoProgress } from "@/components/editor/todo-progress";
import { useDocumentActions } from "@/hooks/use-document-actions";
import type { DocItem } from "@/lib/types";
import { NoteCover } from "@/components/editor/note-cover";
import { NoteMeta } from "@/components/editor/note-meta";
import { assetUrl } from "@/lib/urls";
import { cn } from "@/lib/utils";

interface DocumentCardProps {
  doc: DocItem;
}

export function DocumentCard({ doc }: DocumentCardProps) {
  const { openNote } = useDocumentActions();

  const { total, done } = doc.todoSummary;
  const isSecret = doc.folder?.secret || doc.secret;
  const hasFooter = total > 0 || doc.labels.length > 0;

  const hasCover = Boolean(doc.cover);
  // note: overlay is image-only: the picture fills the whole card and carries the title, so folder, text preview and footer step aside
  const isOverlay = hasCover && doc.coverStyle === "overlay";
  const isFull = hasCover && doc.coverStyle === "full";
  // note: banner keeps the real HTML heading from the preview (same look and spacing as the editor); only full and overlay use the plain-text title
  const textTitle = isOverlay || isFull;
  // note: full image shows the plain-text title only, so the HTML preview is dropped
  const hidePreview = isOverlay || isFull;

  const meta = (
    <NoteMeta
      updatedAt={doc.updatedAt}
      pinned={doc.pinned}
      archived={doc.archived}
      floating={hasCover}
    />
  );

  const handleOpen = () => openNote(doc.id);

  return (
    <article
      className={cn(
        "group relative flex flex-col cursor-pointer rounded-[12px] border border-line bg-surface text-ink overflow-hidden outline-none transition-[border-color] duration-150 hover:border-line-2 focus-visible:ring-2 focus-visible:ring-brand",
        isOverlay && "min-h-48",
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

      {doc.cover && (
        <NoteCover
          src={assetUrl(doc.cover) ?? ""}
          title={textTitle ? doc.title : undefined}
          style={doc.coverStyle}
          className={isOverlay ? "absolute inset-0" : undefined}
        />
      )}

      {!isOverlay && (!hasCover || doc.folder) && (
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
          {!hasCover && meta}
        </div>
      )}
      {hasCover && meta}

      {hidePreview ? null : doc.preview ? (
        <div
          inert={Boolean(isSecret)}
          className={cn(
            // note: uploaded images already show as the cover, so hide them in the text preview
            "[&_img[data-attachment-id]]:hidden",
            "rich-content rich-readonly rich-card-preview flex-1 min-h-0 px-3 pt-1.5 pb-1 overflow-hidden mask-[linear-gradient(to_bottom,black_78%,transparent)] select-none",
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

      {hasFooter && !isOverlay && (
        <div
          className={cn(
            "relative shrink-0 gap-2 px-3 pb-2.5 pt-1.5 text-xs text-ink-3 bg-linear-to-b from-transparent via-surface via-60% to-surface",
            // note: full has no preview text, so the title already leaves the gap
            isFull && "pt-0",
          )}
        >
          <div className="flex gap-1 items-center flex-wrap">
            <TodoProgress done={done} total={total} />
          </div>
        </div>
      )}

      {/* note: overlay drops the footer, so the todo progress rides on the image, opposite the meta chip */}
      {isOverlay && total > 0 && (
        <div className="absolute top-2 left-2 z-5 rounded-full bg-surface/95 shadow-sm backdrop-blur-sm">
          <TodoProgress done={done} total={total} />
        </div>
      )}
    </article>
  );
}
