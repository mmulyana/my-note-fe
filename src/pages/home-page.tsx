import { GroupWithNotes } from "@/components/editor/group-with-notes";
import { NotesBoard, type ReorderMove } from "@/components/editor/notes-board";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { IconFileText, IconSearch } from "@tabler/icons-react";
import type { DocItem, IApi, Notes } from "@/lib/types";
import { searchQueryAtom } from "@/store/search";
import { buildQuery, toDocItem } from "@/lib/utils";
import { useApi } from "@/hooks/use-api";
import { useInfiniteApi } from "@/hooks/use-infinite-api";
import { InfiniteSentinel } from "@/components/common/infinite-sentinel";
import { useAtomValue } from "jotai";
import { useQueryClient } from "@tanstack/react-query";
import { request } from "@/lib/api-client";
import { homeArrangeAtom, homeViewAtom } from "@/store/home-view";
import { urls } from "@/lib/urls";

export default function DocumentEditorPage() {
  const search = useAtomValue(searchQueryAtom);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const { data: pinnedData } = useApi<IApi<Notes[]>>({
    url: buildQuery(urls.Notes, { q: debouncedSearch, pinned: true }),
    queryKey: debouncedSearch
      ? ["notes", "pinned", { search: debouncedSearch }]
      : ["notes", "pinned"],
    keepPreviousData: true,
    gcTime: 0,
  });

  const {
    items: notes,
    hasNextPage,
    isFetching,
    fetchNextPage,
  } = useInfiniteApi<Notes>({
    url: urls.Notes,
    params: { q: debouncedSearch, pinned: false },
    queryKey: debouncedSearch
      ? ["notes", { search: debouncedSearch }]
      : ["notes"],
    keepPreviousData: true,
    gcTime: 0,
  });

  const view = useAtomValue(homeViewAtom);
  const arrangeMode = useAtomValue(homeArrangeAtom);
  const queryClient = useQueryClient();
  const docs: DocItem[] = [
    ...(pinnedData?.data ?? []).map((n) => ({ ...toDocItem(n), pinned: true })),
    ...notes.map(toDocItem),
  ];
  const searching = debouncedSearch.length > 0;
  const arranging = arrangeMode && !searching;

  const handleReorder = async ({ id, prevId, nextId }: ReorderMove) => {
    try {
      await request(urls.NotePosition(id), {
        method: "PATCH",
        body: { prevId, nextId },
      });
    } finally {
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
    }
  };

  return (
    <div className="w-full max-md:pt-2">
      {!searching && <GroupWithNotes />}
      {docs.length > 0 ? (
        <>
          <NotesBoard
            docs={docs}
            view={view}
            arranging={arranging}
            onReorder={handleReorder}
          />
          <InfiniteSentinel
            hasNextPage={hasNextPage}
            isFetching={isFetching}
            onLoadMore={fetchNextPage}
          />
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 py-22.5 text-center text-ink-3">
          <div className="grid place-items-center w-19.5 h-19.5 rounded-full bg-surface-2 border border-line mb-1.5">
            {searching ? <IconSearch size={30} /> : <IconFileText size={30} />}
          </div>
          <div className="text-[17px] font-semibold text-ink-2">
            {searching ? "No results" : "No notes yet"}
          </div>
          <div className="text-sm max-w-75">
            {searching
              ? `No notes match "${debouncedSearch}".`
              : "Tap the + button to create your first note."}
          </div>
        </div>
      )}
    </div>
  );
}
