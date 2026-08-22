import type { FolderNotePreview, FolderWithNotes, IApi } from "@/lib/types";
import { buildQuery, cn, folderNoteCount } from "@/lib/utils";
import { IconLock } from "@tabler/icons-react";
import { useApi } from "@/hooks/use-api";
import { Link } from "react-router-dom";
import { urls } from "@/lib/urls";

export function GroupWithNotes() {
  const { data } = useApi<IApi<FolderWithNotes[]>>({
    url: buildQuery(urls.FolderWithNotes, { pinned: true }),
    queryKey: ["folders", "with-notes", { pinned: true }],
  });

  const folders = data?.data ?? [];

  if (folders.length === 0) return null;

  return (
    <section className="mb-4">
      <div className="grid gap-2 sm:gap-3 grid-cols-[repeat(auto-fill,minmax(132px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(168px,1fr))]">
        {folders.map((folder) => (
          <FolderTile key={folder.id} folder={folder} />
        ))}
      </div>
    </section>
  );
}

const STACK_BY_DEPTH = [
  "rotate-[1.5deg] group-hover:rotate-0",
  "-rotate-[4deg] scale-[0.96] group-hover:-rotate-[7deg]",
  "rotate-[5deg] scale-[0.92] group-hover:rotate-[9deg]",
];

function FolderTile({ folder }: { folder: FolderWithNotes }) {
  const notes = folder.notes ?? [];
  const previews = notes.slice(0, 3);
  const total = folderNoteCount(folder);
  const isSecret = Boolean(folder.secret);

  const stack = [...previews].reverse();

  return (
    <Link
      to={`/folder/${folder.id}`}
      className="group flex flex-col rounded-[14px] border border-line bg-surface p-2 outline-none transition-[box-shadow,border-color] duration-150 hover:border-line-2 hover:shadow-(--shadow) focus-visible:shadow-[0_0_0_2px_var(--accent)]"
    >
      <div className="relative aspect-4/3 w-full">
        <div
          className={cn(
            "absolute inset-2 sm:inset-3",
            isSecret && "blur-[6px]",
          )}
        >
          {stack.length > 0 ? (
            stack.map((note, i) => {
              const depth = stack.length - 1 - i;
              return (
                <NoteChip
                  key={i}
                  note={note}
                  className={STACK_BY_DEPTH[depth]}
                  dimmed={depth > 0}
                />
              );
            })
          ) : (
            <div className="absolute inset-0 grid place-items-center rounded-lg border border-dashed border-line text-[10px] text-ink-3 italic">
              Kosong
            </div>
          )}
        </div>

        {isSecret && (
          <div className="absolute inset-0 grid place-items-center text-ink-3">
            <IconLock size={16} />
          </div>
        )}
      </div>

      <div className="mt-2 min-w-0">
        <div className="text-sm font-semibold text-ink truncate">
          {folder.name}
        </div>
        <div className="text-[10px] text-ink-3">
          {total} {total === 1 ? "note" : "notes"}
        </div>
      </div>
    </Link>
  );
}

function NoteChip({
  note,
  className,
  dimmed,
}: {
  note: FolderNotePreview;
  className?: string;
  dimmed?: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 origin-bottom overflow-hidden rounded-lg border border-line bg-surface-2 p-1.5 sm:p-2 shadow-xs transition-transform duration-200 ease-out",
        dimmed && "bg-surface-hi",
        className,
      )}
    >
      <div
        className={cn(
          "text-[11px] sm:text-xs lg:text-sm font-medium leading-snug line-clamp-3 text-ink-2",
          dimmed && "text-ink-3",
        )}
      >
        {note.title?.trim() || "Untitled"}
      </div>
    </div>
  );
}
