import { useEffect, useState } from "react";
import { IconCornerLeftUp, IconSubtask } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApi } from "@/hooks/use-api";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { buildQuery, toDocItem } from "@/lib/utils";
import { urls } from "@/lib/urls";
import type { IApi, Notes } from "@/lib/types";
import type { MoveTarget } from "./session";
import { noteLabel } from "./sub-notes";

interface MoveToDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteId: string;
  currentParentId?: string | null;
  onMove: (target: MoveTarget | null) => Promise<void>;
}

export function MoveToDialog({
  open,
  onOpenChange,
  noteId,
  currentParentId,
  onMove,
}: MoveToDialogProps) {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const search = useDebouncedValue(query.trim(), 250);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setError(null);
    }
  }, [open]);

  const { data, isFetching } = useApi<IApi<Notes[]>>({
    url: buildQuery(urls.Notes, { q: search, limit: 30 }),
    queryKey: ["notes", "move-targets", search],
    enabled: open,
    staleTime: 0,
    keepPreviousData: true,
  });

  const candidates = (data?.data ?? [])
    .map(toDocItem)
    .filter((n) => n.id !== noteId && n.id !== currentParentId);

  const move = async (target: MoveTarget | null) => {
    setBusy(true);
    setError(null);
    try {
      await onMove(target);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not move the note");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onClick={(e) => e.stopPropagation()}
        onEscapeKeyDown={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Move to…</DialogTitle>
          <DialogDescription>
            Pick the note that becomes this note's parent.
          </DialogDescription>
        </DialogHeader>

        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes"
          className="h-9 w-full rounded-lg border border-line bg-transparent px-3 text-sm text-ink outline-none placeholder:text-ink-4 focus-visible:border-brand"
        />

        <div className="flex max-h-72 flex-col overflow-y-auto">
          {currentParentId && (
            <button
              type="button"
              disabled={busy}
              onClick={() => move(null)}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-left text-[13px] text-ink-2 hover:bg-surface-hi outline-none focus-visible:bg-surface-hi disabled:opacity-50 cursor-pointer"
            >
              <IconCornerLeftUp size={14} className="shrink-0 text-ink-3" />
              No parent (make top-level)
            </button>
          )}
          {candidates.map((n) => (
            <button
              key={n.id}
              type="button"
              disabled={busy}
              onClick={() => move(n)}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-left text-[13px] text-ink-2 hover:bg-surface-hi outline-none focus-visible:bg-surface-hi disabled:opacity-50 cursor-pointer"
            >
              <IconSubtask size={14} className="shrink-0 text-ink-3" />
              <span className="min-w-0 flex-1 truncate">{noteLabel(n)}</span>
              {n.folder && (
                <span className="shrink-0 text-[11px] text-ink-3">{n.folder.name}</span>
              )}
            </button>
          ))}
          {!isFetching && candidates.length === 0 && (
            <p className="px-2 py-3 text-[12px] text-ink-3">No notes found</p>
          )}
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
