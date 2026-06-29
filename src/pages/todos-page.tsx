import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import { request } from "@/lib/api-client";
import type { IApi, Todo, TodoGroup } from "@/lib/types";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { TaskCheckbox } from "@/components/editor/task-checkbox";

type Tab = "all" | "grouped";

type UpdatePayload = { id: string } & Partial<Pick<Todo, "text" | "checked" | "deadline" | "priority">>;

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "grouped", label: "Grouped" },
];

export default function TodosPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const queryClient = useQueryClient();

  const { data: allData, isLoading: allLoading } = useApi<IApi<Todo[]>>({
    url: urls.Todos,
    queryKey: ["todos"],
  });

  const { data: groupedData, isLoading: groupedLoading } = useApi<IApi<TodoGroup[]>>({
    url: urls.TodosGrouped,
    queryKey: ["todos-grouped"],
    enabled: activeTab === "grouped",
  });

  const { mutate: updateTodo } = useMutation({
    mutationFn: ({ id, ...body }: UpdatePayload) =>
      request(urls.Todo(id), { method: "PATCH", body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["todos-grouped"] });
    },
  });

  const todos = allData?.data ?? [];
  const groups = groupedData?.data ?? [];
  const isLoading = activeTab === "all" ? allLoading : groupedLoading;

  return (
    <div className="max-w-165 mx-auto py-4">
      <div className="flex gap-1 mb-4 border-b border-line">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors duration-120 border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-ink text-ink"
                : "border-transparent text-ink-3 hover:text-ink-2",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center gap-2 py-22.5 px-5 text-center text-ink-3">
          <div className="text-sm">Loading...</div>
        </div>
      ) : activeTab === "all" ? (
        todos.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-0.5">
            {todos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onUpdate={updateTodo} />
            ))}
          </div>
        )
      ) : groups.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map((group) => (
            <div key={group.noteId} className="flex flex-col gap-0.5">
              <p className="text-xs font-semibold text-ink-3 uppercase tracking-wider px-1 mb-1.5">
                {group.title ?? "Untitled"}
              </p>
              {group.todos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} onUpdate={updateTodo} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TodoItem({
  todo,
  onUpdate,
}: {
  todo: Todo;
  onUpdate: (payload: UpdatePayload) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(todo.text);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== todo.text) {
      onUpdate({ id: todo.id, text: trimmed });
    } else {
      setDraft(todo.text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") {
      setDraft(todo.text);
      setEditing(false);
    }
  };

  return (
    <div className="flex items-center gap-2.5 px-1 py-1.5 rounded-lg hover:bg-(--surface-2) transition-colors duration-120">
      <TaskCheckbox
        checked={todo.checked}
        onChange={(checked) => onUpdate({ id: todo.id, checked })}
      />
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          className="text-sm flex-1 leading-snug bg-transparent outline-none border-b border-line focus:border-ink transition-colors duration-120"
        />
      ) : (
        <span
          onClick={startEdit}
          className={cn(
            "text-sm flex-1 leading-snug cursor-text",
            todo.checked && "line-through text-ink-3",
          )}
        >
          {todo.text}
        </span>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-22.5 px-5 text-center text-ink-3">
      <div className="text-[17px] font-semibold text-ink-2">No todos yet</div>
      <div className="text-sm max-w-75">Your todos will appear here.</div>
    </div>
  );
}
