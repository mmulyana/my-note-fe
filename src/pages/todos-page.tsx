import { IconListCheck } from "@tabler/icons-react";
import { useApi } from "@/hooks/use-api";
import type { IApi, Notes } from "@/lib/types";
import { buildQuery, toDocItem } from "@/lib/utils";
import { urls } from "@/lib/urls";
import { TodoNoteCard } from "@/components/editor/todo-note-card";

export default function TodosPage() {
  const { data } = useApi<IApi<Notes[]>>({
    url: buildQuery(urls.Notes, { hasTodo: true }),
    queryKey: ["notes", { hasTodo: true }],
  });

  const docs = (data?.data ?? []).map(toDocItem);

  return (
    <>
      {docs.length > 0 ? (
        <div className="masonry grid-view todo-grid pb-4">
          {docs.map((d) => (
            <TodoNoteCard key={d.id} doc={d} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-22.5 px-5 text-center text-ink-3">
          <div className="grid place-items-center w-19.5 h-19.5 rounded-full bg-surface-2 border border-line mb-1.5">
            <IconListCheck size={30} />
          </div>
          <div className="text-[17px] font-semibold text-ink-2">
            No todos yet
          </div>
          <div className="text-sm max-w-75">
            Notes with a checklist show up here.
          </div>
        </div>
      )}
    </>
  );
}
