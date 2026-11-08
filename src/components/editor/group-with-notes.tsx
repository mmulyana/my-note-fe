import type { FolderNotePreview, FolderWithNotes, IApi } from "@/lib/types";
import { buildQuery, cn, folderNoteCount } from "@/lib/utils";
import { IconLock } from "@tabler/icons-react";
import { useApi } from "@/hooks/use-api";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useSetAtom } from "jotai";
import { useNoteActions } from "@/hooks/use-note-actions";
import { NOTE_DRAG_TYPE, selectedNoteIdsAtom } from "@/store/home-view";
import { urls } from "@/lib/urls";

export function GroupWithNotes() {
  const { data } = useApi<IApi<FolderWithNotes[]>>({
    url: buildQuery(urls.FolderWithNotes, { pinned: true }),
    queryKey: ["folders", "with-notes", { pinned: true }],
  });

  const folders = data?.data ?? [];

  if (folders.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="grid gap-2 sm:gap-3 grid-cols-[repeat(auto-fill,minmax(132px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(168px,1fr))]">
        {folders.map((folder) => (
          <FolderTile key={folder.id} folder={folder} />
        ))}
      </div>
    </section>
  );
}

const SHEET_STYLES = [
  "left-[10%] right-[18%] -rotate-[5deg] group-hover:-rotate-[8deg] group-hover:-translate-y-1.5",
  "left-[18%] right-[8%] rotate-[4deg] group-hover:rotate-[7deg] group-hover:-translate-y-2.5",
];

const BAR_WIDTHS = ["w-full", "w-4/5", "w-3/5"];

const TINT_PALETTE = [
  "#7c5cff",
  "#3b82f6",
  "#f5b800",
  "#ef4444",
  "#10b981",
  "#ec4899",
  "#f97316",
  "#14b8a6",
];

function folderTint(folder: FolderWithNotes): string {
  if (folder.color && /^(#|rgb|hsl|oklch)/i.test(folder.color)) {
    return folder.color;
  }
  let hash = 0;
  for (const ch of folder.id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return TINT_PALETTE[hash % TINT_PALETTE.length];
}

function shortAgo(iso?: string): string | null {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return null;
  const min = Math.max(0, Math.floor(diff / 60000));
  if (min < 1) return "now";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d`;
  return `${Math.floor(day / 30)}mo`;
}

function FolderTile({ folder }: { folder: FolderWithNotes }) {
  const notes = folder.notes ?? [];
  const sheets = notes.slice(0, 2);
  const total = folderNoteCount(folder);
  const isSecret = Boolean(folder.secret);
  const ago = shortAgo(folder.updatedAt);
  const tint = folderTint(folder);

  const { moveToFolder } = useNoteActions();
  const setSelected = useSetAtom(selectedNoteIdsAtom);
  const [dropping, setDropping] = useState(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDropping(false);
    const raw = e.dataTransfer.getData(NOTE_DRAG_TYPE);
    if (!raw) return;
    const ids: string[] = JSON.parse(raw);
    setSelected([]);
    await moveToFolder(ids, folder.id);
  };

  return (
    <Link
      to={`/folder/${folder.id}`}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes(NOTE_DRAG_TYPE)) return;
        e.preventDefault();
        setDropping(true);
      }}
      onDragLeave={() => setDropping(false)}
      onDrop={handleDrop}
      style={{ "--folder-tint": tint } as React.CSSProperties}
      className={cn(
        "group flex flex-col rounded-[16px] bg-surface-2 p-2.5 pb-3 outline-none transition-[background,box-shadow,transform] duration-200 hover:bg-surface-hi focus-visible:ring-2 focus-visible:ring-brand",
        dropping && "ring-2 ring-brand scale-[1.02]",
      )}
    >
      <div className="relative aspect-[5/4] w-full">
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 top-[14%] rounded-xl bg-(--folder-tint) brightness-[0.55] shadow-[0_6px_16px_-6px_rgb(0_0_0/0.45)]"
        />
        <div
          aria-hidden
          className="absolute left-0 top-[8%] h-[10%] w-[38%] rounded-t-lg bg-(--folder-tint) brightness-[0.55]"
        />

        <div
          className={cn(
            "absolute inset-x-0 top-[6%] bottom-[30%]",
            isSecret && "blur-[5px]",
          )}
        >
          {sheets.map((note, i) => (
            <Sheet key={i} note={note} className={SHEET_STYLES[i]} />
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-0 top-[42%] overflow-hidden rounded-xl bg-linear-to-b from-white/30 to-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_8px_20px_-8px_rgb(0_0_0/0.5)] backdrop-blur-md">
          <div
            aria-hidden
            className="absolute inset-0 bg-(--folder-tint) opacity-55 mix-blend-multiply"
          />
          {isSecret && (
            <IconLock
              size={16}
              className="absolute left-2.5 bottom-2.5 text-white/90"
            />
          )}
          {ago && (
            <span className="absolute bottom-2 right-2 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
              Updated {ago}
            </span>
          )}
        </div>
      </div>

      <div className="mt-2.5 min-w-0 text-center">
        <div className="text-sm font-semibold text-ink truncate">
          {folder.name}
        </div>
        <div className="mt-0.5 text-[11px] text-ink-3">
          {total} {total === 1 ? "note" : "notes"}
        </div>
      </div>
    </Link>
  );
}

function Sheet({
  note,
  className,
}: {
  note: FolderNotePreview;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute top-0 bottom-0 origin-bottom overflow-hidden rounded-md bg-surface p-2 shadow-sm ring-1 ring-line transition-transform duration-200 ease-out",
        className,
      )}
    >
      {note.preview ? (
        <div
          className="rich-content rich-readonly rich-card-preview w-[200%] origin-top-left scale-50 select-none pointer-events-none"
          dangerouslySetInnerHTML={{ __html: note.preview }}
        />
      ) : (
        <>
          <div className="text-[11px] font-medium leading-snug line-clamp-2 text-ink-2">
            {note.title?.trim() || "Untitled"}
          </div>
          <div aria-hidden className="mt-1.5 flex flex-col gap-1">
            {BAR_WIDTHS.map((w) => (
              <div
                key={w}
                className={cn("h-1 rounded-full bg-line-2", w)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
