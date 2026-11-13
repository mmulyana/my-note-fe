import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { IconLoader2, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { profileAtom } from "@/store/profile";
import { ReleaseForm } from "@/components/common/release-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApi } from "@/hooks/use-api";
import { request } from "@/lib/api-client";
import { assetUrl, urls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { highlightPreviewHtml } from "@/lib/prism";
import type { IApi, Release, ReleaseTag, ReleasesUnread } from "@/lib/types";

const UNREAD_KEY = ["releases", "unread"] as const;

const TAG_LABEL: Record<ReleaseTag, string> = {
  new: "New",
  improved: "Improved",
  fixed: "Fixed",
};

const TAG_STYLE: Record<ReleaseTag, string> = {
  new: "text-emerald-500",
  improved: "text-sky-500",
  fixed: "text-amber-500",
};

// note: shared by the account menu badge and the panel so both read one cached count
export function useUnreleasedCount() {
  const { data } = useApi<IApi<ReleasesUnread>>({
    url: urls.ReleasesUnread,
    queryKey: UNREAD_KEY,
    autoRefetchOnWindowFocus: true,
    staleTime: 1000 * 60,
  });
  return data?.data?.count ?? 0;
}

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

interface UpdatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdatesModal({ open, onOpenChange }: UpdatesModalProps) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Release | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // note: isAdmin only decides whether the button shows; the API rejects release writes from non-admins either way
  const canAdd = Boolean(useAtomValue(profileAtom)?.isAdmin);
  // note: last-seen time as it was when the panel opened, so "new" stays on the entries until it closes
  const baseline = useRef<{ at: number | null } | null>(null);

  const { data: unread } = useApi<IApi<ReleasesUnread>>({
    url: urls.ReleasesUnread,
    queryKey: UNREAD_KEY,
  });
  const { data, isLoading, error } = useApi<IApi<Release[]>>({
    url: urls.Releases,
    queryKey: ["releases"],
    enabled: open,
  });

  useEffect(() => {
    if (!open) {
      baseline.current = null;
      setExpanded(null);
      setAdding(false);
      setEditing(null);
      setConfirmId(null);
      return;
    }
    if (!unread?.data) return;
    if (!baseline.current) {
      const seen = unread.data.lastSeenAt;
      baseline.current = { at: seen ? new Date(seen).getTime() : null };
    }
    if (unread.data.count > 0) {
      request(urls.ReleasesSeen, { method: "POST" })
        .then(() => queryClient.invalidateQueries({ queryKey: UNREAD_KEY }))
        .catch(() => {});
    }
  }, [open, unread, queryClient]);

  const releases = data?.data ?? [];

  const remove = async (id: string) => {
    setDeletingId(id);
    try {
      await request(`/releases/${id}`, { method: "DELETE" });
      await queryClient.invalidateQueries({ queryKey: ["releases"] });
      queryClient.invalidateQueries({ queryKey: UNREAD_KEY });
    } catch {
      //
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };
  const formOpen = adding || editing !== null;
  const isNew = (r: Release) => {
    if (!baseline.current || !r.publishedAt) return false;
    const seen = baseline.current.at;
    return seen === null || new Date(r.publishedAt).getTime() > seen;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] gap-0 overflow-hidden p-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle>
            {editing ? "Edit update" : adding ? "New update" : "What's new"}
          </DialogTitle>
          <DialogDescription>
            {formOpen ? "Write a release note" : "Latest updates to My Note"}
          </DialogDescription>
          {canAdd && !formOpen && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="absolute right-11 top-3.5 inline-flex h-6 cursor-pointer items-center gap-1 rounded-md px-1.5 text-[12px] font-medium text-ink-3 transition-colors hover:bg-surface-hi hover:text-ink"
            >
              <IconPlus size={13} />
              Add
            </button>
          )}
        </DialogHeader>

        <div className="thin-scroll min-h-0 flex-1 overflow-y-auto border-t border-line px-5 py-4">
          {formOpen ? (
            <ReleaseForm
              key={editing?.id ?? "new"}
              release={editing ?? undefined}
              onDone={() => {
                setAdding(false);
                setEditing(null);
              }}
            />
          ) : isLoading ? (
            <div className="grid place-items-center py-10 text-ink-3">
              <IconLoader2 size={18} className="animate-spin" />
            </div>
          ) : error ? (
            <p className="py-6 text-center text-[13px] text-red-500">
              Couldn't load updates. Please try again.
            </p>
          ) : releases.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-ink-3">
              No updates yet.
            </p>
          ) : (
            <ol className="relative flex flex-col gap-6">
              {releases.map((r, i) => {
                const open = expanded === r.id;
                const fresh = isNew(r);
                return (
                  <li key={r.id} className="relative pl-6">
                    <span
                      aria-hidden
                      className={cn(
                        "absolute left-0 top-1.5 size-2.5 rounded-full border-2 border-surface",
                        fresh ? "bg-brand" : "bg-line-2",
                      )}
                    />
                    {i < releases.length - 1 && (
                      <span
                        aria-hidden
                        className="absolute left-[4.5px] top-5 -bottom-6 w-px bg-line"
                      />
                    )}

                    <div className="flex flex-wrap items-center gap-x-2 text-[11px] font-medium uppercase tracking-wide text-ink-3">
                      <span>{r.publishedAt ? formatDate(r.publishedAt) : "Draft"}</span>
                      {r.version && <span>v{r.version}</span>}
                      <span className={TAG_STYLE[r.tag]}>
                        {TAG_LABEL[r.tag]}
                      </span>
                      {fresh && <span className="text-brand">• New</span>}
                      {canAdd && (
                        <span className="ml-auto flex items-center gap-0.5 normal-case tracking-normal">
                          {confirmId === r.id ? (
                            <>
                              <button
                                type="button"
                                disabled={deletingId === r.id}
                                onClick={() => remove(r.id)}
                                className="h-6 cursor-pointer rounded-md px-1.5 text-[12px] font-medium text-red-500 transition-colors hover:bg-surface-hi disabled:opacity-50"
                              >
                                {deletingId === r.id ? "Deleting…" : "Delete?"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmId(null)}
                                className="h-6 cursor-pointer rounded-md px-1.5 text-[12px] font-medium text-ink-3 transition-colors hover:bg-surface-hi hover:text-ink"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                title="Edit"
                                aria-label="Edit update"
                                onClick={() => setEditing(r)}
                                className="grid size-6 cursor-pointer place-items-center rounded-md text-ink-3 transition-colors hover:bg-surface-hi hover:text-ink"
                              >
                                <IconPencil size={13} />
                              </button>
                              <button
                                type="button"
                                title="Delete"
                                aria-label="Delete update"
                                onClick={() => setConfirmId(r.id)}
                                className="grid size-6 cursor-pointer place-items-center rounded-md text-ink-3 transition-colors hover:bg-surface-hi hover:text-red-500"
                              >
                                <IconTrash size={13} />
                              </button>
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpanded(open ? null : r.id)}
                      aria-expanded={open}
                      className="mt-1 block w-full cursor-pointer text-left"
                    >
                      <h3 className="text-[15px] font-semibold leading-snug text-ink">
                        {r.title}
                      </h3>
                      {!open && r.summary && (
                        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-2">
                          {r.summary}
                        </p>
                      )}
                    </button>

                    {open && r.content && (
                      <div
                        className="rich-content rich-readonly mt-2 text-[13px]"
                        dangerouslySetInnerHTML={{
                          __html: highlightPreviewHtml(r.content),
                        }}
                      />
                    )}

                    {r.image && (
                      <img
                        src={assetUrl(r.image)}
                        alt=""
                        loading="lazy"
                        className="mt-3 w-full rounded-xl border border-line object-cover"
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
