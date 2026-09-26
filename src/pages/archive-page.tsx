import { DocumentCard } from "@/components/editor/document-card";
import { InfiniteSentinel } from "@/components/common/infinite-sentinel";
import { IconFileText } from "@tabler/icons-react";
import { useInfiniteApi } from "@/hooks/use-infinite-api";
import type { DocItem, Notes } from "@/lib/types";
import { toDocItem } from "@/lib/utils";
import { urls } from "@/lib/urls";

export default function ArchivePage() {
  const {
    items: notes,
    hasNextPage,
    isFetching,
    fetchNextPage,
  } = useInfiniteApi<Notes>({
    url: urls.Notes,
    params: { archived: true },
    queryKey: ["notes", { archived: true }],
  });

  const docs: DocItem[] = notes.map(toDocItem);

  return (
    <>
      {docs.length > 0 ? (
        <>
          <div className="masonry grid-view">
            {docs.map((d) => (
              <DocumentCard key={d.id} doc={d} />
            ))}
          </div>
          <InfiniteSentinel
            hasNextPage={hasNextPage}
            isFetching={isFetching}
            onLoadMore={fetchNextPage}
          />
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 py-22.5 text-center text-ink-2">
          <div className="grid place-items-center w-19.5 h-19.5 rounded-full bg-surface-2 border border-line mb-1.5">
            <IconFileText size={30} />
          </div>
          <div className="text-[17px] font-semibold text-ink-2">
            No documents
          </div>

        </div>
      )}
    </>
  );
}
