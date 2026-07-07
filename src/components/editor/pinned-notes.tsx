import { DocumentCard } from "@/components/editor/document-card";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { DocItem, IApi, Notes } from "@/lib/types";
import { searchQueryAtom } from "@/store/search";
import { buildQuery, toDocItem } from "@/lib/utils";
import { IconPinFilled } from "@tabler/icons-react";
import { useApi } from "@/hooks/use-api";
import { useAtomValue } from "jotai";
import { urls } from "@/lib/urls";

export function PinnedNotes() {
  const search = useAtomValue(searchQueryAtom);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const { data: notesData } = useApi<IApi<Notes[]>>({
    url: buildQuery(urls.Notes, { q: debouncedSearch, pinned: true }),
    queryKey: debouncedSearch
      ? ["notes", "pinned", { search: debouncedSearch }]
      : ["notes", "pinned"],
    keepPreviousData: true,
  });

  const docs: DocItem[] = (notesData?.data ?? []).map(toDocItem);

  if (docs.length === 0) return null;

  return (
    <section className="mb-4">
      <div className="flex items-center gap-1.5 mb-2 text-[10px] uppercase tracking-[0.08em] text-(--ink-3)">
        <IconPinFilled size={12} />
        Pinned
      </div>
      <div className="masonry grid-view">
        {docs.map((d) => (
          <DocumentCard key={d.id} doc={d} />
        ))}
      </div>
    </section>
  );
}
