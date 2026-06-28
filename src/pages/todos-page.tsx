import { useApi } from "@/hooks/use-api";
import type { IApi, TodoGroup } from "@/lib/types";
import { urls } from "@/lib/urls";

export default function TodosPage() {
  const { data, isLoading } = useApi<IApi<TodoGroup[]>>({
    url: urls.TodosGrouped,
    queryKey: ["todos-grouped"],
  });

  const groups = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-2 py-22.5 px-5 text-center text-ink-3">
        <div className="text-sm">Loading...</div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-22.5 px-5 text-center text-ink-3">
        <div className="text-[17px] font-semibold text-ink-2">No todos yet</div>
        <div className="text-sm max-w-75">Your todos will appear here.</div>
      </div>
    );
  }

  return <div className="flex flex-col gap-6 max-w-165 mx-auto py-4"></div>;
}
