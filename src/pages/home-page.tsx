import { DocumentCard } from "@/components/editor/document-card";
import { PinnedNotes } from "@/components/editor/pinned-notes";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { IconFileText, IconSearch } from "@tabler/icons-react";
import type { DocItem, IApi, Notes } from "@/lib/types";
import { searchQueryAtom } from "@/store/search";
import { buildQuery, toDocItem } from "@/lib/utils";
import { useApi } from "@/hooks/use-api";
import { useAtomValue } from "jotai";
import { urls } from "@/lib/urls";

export default function DocumentEditorPage() {
  const search = useAtomValue(searchQueryAtom);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const { data: notesData } = useApi<IApi<Notes[]>>({
    url: buildQuery(urls.Notes, { q: debouncedSearch, pinned: false }),
    queryKey: debouncedSearch ? ["notes", { search: debouncedSearch }] : ["notes"],
    keepPreviousData: true,
  });

  const docs: DocItem[] = (notesData?.data ?? []).map(toDocItem);
  const searching = debouncedSearch.length > 0;

  return (
    <>
      <PinnedNotes />

      {docs.length > 0 ? (
        <div className="masonry grid-view">
          {docs.map((d) => (
            <DocumentCard key={d.id} doc={d} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-22.5 text-center text-(--ink-3)">
          <div className="grid place-items-center w-19.5 h-19.5 rounded-full bg-(--surface-2) border border-(--line) mb-1.5">
            {searching ? <IconSearch size={30} /> : <IconFileText size={30} />}
          </div>
          <div className="text-[17px] font-semibold text-(--ink-2)">
            {searching ? "Tidak ada hasil" : "No documents"}
          </div>
          <div className="text-sm max-w-75">
            {searching
              ? `Tidak ada catatan yang cocok dengan "${debouncedSearch}".`
              : 'Klik "Take a note…" untuk bikin dokumen pertama.'}
          </div>
        </div>
      )}
    </>
  );
}
