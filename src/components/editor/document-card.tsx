import {
  IconFolderFilled,
  IconTagFilled,
  IconLock,
  IconPlus,
} from "@tabler/icons-react";
import { useSetAtom } from "jotai";
import {
  editingIdAtom,
  editingDocAtom,
  hasChangedAtom,
  editingLabelIdsAtom,
  editingFolderIdAtom,
} from "@/store/document";
import type { DocItem, IApi, NoteDetail } from "@/lib/types";
import { request } from "@/lib/api-client";
import { cn, relative } from "@/lib/utils";
import { urls } from "@/lib/urls";

interface DocumentCardProps {
  doc: DocItem;
}

export function DocumentCard({ doc }: DocumentCardProps) {
  const setEditingId = useSetAtom(editingIdAtom);
  const setEditingDoc = useSetAtom(editingDocAtom);
  const setHasChanged = useSetAtom(hasChangedAtom);
  const setEditingLabelIds = useSetAtom(editingLabelIdsAtom);
  const setEditingFolderId = useSetAtom(editingFolderIdAtom);

  const { total, done } = doc.todoSummary;
  const isSecret = doc.folder?.secret || doc.secret;

  const handleOpen = async () => {
    try {
      const detail = await request<IApi<NoteDetail>>(urls.Note(doc.id));
      setHasChanged(false);
      setEditingLabelIds((detail.data.labels ?? []).map((c) => c.id));
      setEditingFolderId(detail.data.folderId ?? null);
      setEditingDoc({
        id: detail.data.id,
        content: detail.data.content,
        preview: "",
        todoSummary: { total: 0, done: 0 },
        labels: (detail.data.labels ?? []).map(({ id, name }) => ({
          id,
          name,
        })),
        folderId: detail.data.folderId ?? null,
        updatedAt: new Date(detail.data.updatedAt).getTime(),
        folder: detail.data.folder,
        secret: detail.data.secret,
        archived: detail.data.archived,
        pinned: detail.data.pinned,
      });
      setEditingId(doc.id);
    } catch (err) {
      console.error("Failed to fetch note detail:", err);
    }
  };

  return (
    <article
      className={cn(
        "group relative cursor-pointer rounded-[14px] border border-line bg-surface text-ink overflow-hidden outline-none transition-[box-shadow,border-color,transform] duration-150 hover:border-line-2 focus-visible:shadow-[0_0_0_2px_var(--accent)]",
        !isSecret && "hover:shadow-(--shadow)"
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

      <div className="pt-3 px-4 text-xs text-ink-2/50">
        <p>{relative(doc.updatedAt)}</p>
      </div>

      {doc.preview ? (
        <div
          // the lock overlay is pointer-events-none, so links stay clickable
          // through it — block them here instead; inert also drops them from
          // the tab order so they can't be reached by keyboard either
          inert={Boolean(isSecret)}
          className={cn(
            "rich-content rich-readonly px-4 pt-1.5 pb-1 max-h-80 overflow-hidden mask-[linear-gradient(to_bottom,black_78%,transparent)] hover:select-none",
            isSecret && "pointer-events-none",
          )}
          dangerouslySetInnerHTML={{ __html: doc.preview }}
        />
      ) : (
        <div className="px-4 pb-2 text-[13px] italic text-ink-4">
          Catatan kosong
        </div>
      )}

      <div className="gap-2 px-4 pb-2.5 pt-1.5 text-xs text-ink-3">
        <div className="flex gap-1 items-center flex-wrap">
          {total > 0 && (
            <div className="border border-line rounded-full flex items-center h-5 pl-0.5 pr-1.5">
              <span className="inline-flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 14 14">
                  <circle
                    cx="7"
                    cy="7"
                    r="5"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity={0.25}
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="7"
                    cy="7"
                    r="5"
                    fill="none"
                    stroke="#1AAE75"
                    strokeWidth="2.5"
                    strokeDasharray={31.4}
                    strokeDashoffset={31.4 * (1 - done / total)}
                    strokeLinecap="round"
                    transform="rotate(-90 7 7)"
                  />
                </svg>
                <p className="font-semibold text-xs">
                  {done}
                  <span className="opacity-60">/{total}</span>
                </p>
              </span>
            </div>
          )}
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
          {doc.folder && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-nowrap inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[10px] text-xs text-ink-2 border border-line">
                <IconFolderFilled size={12} />
                {doc.folder.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
