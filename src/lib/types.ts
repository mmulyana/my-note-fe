export type Notes = {
  id: string;
  title: string;
  preview: string;
  todoSummary: { total: number; done: number };
  categories: { id: string; name: string }[];
  updatedAt: string;
};

export type GridView = "grid-view" | "rows-view";
export type Theme = "dark" | "light";

export interface IApi<T = void> {
  data: T;
  message: string;
}

export interface AuthData {
  accessToken: string;
  expiresAt: number;
}

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  todoBlockId?: string;
}

export interface TodoGroup {
  title: string | null;
  todos: Todo[];
}

export type NoteListFields = {
  preview: string;
  todoSummary: { total: number; done: number };
};

export type TodoPriority = "low" | "medium" | "high";

export interface TodoPayload {
  id: string;
  checked: boolean;
  text: string;
  deadline: string | null; // ISO "YYYY-MM-DD"
  priority: TodoPriority;
}

export type TodoField =
  | "checked"
  | "text"
  | "deadline"
  | "priority"

export interface UpdatedTodo {
  id: string;
  before: TodoPayload;
  after: TodoPayload;
  changedFields: TodoField[];
}

export interface TodoDiff {
  added: TodoPayload[];
  updated: UpdatedTodo[];
  removed: TodoPayload[];
  unchanged: number;
}

export interface DocumentPayload {
  content: string;
  preview: string;
  todos: TodoPayload[];
  todoDiff?: TodoDiff;
}

export interface DocItem {
  id: string;
  content: string;
  preview: string;
  todoSummary: { total: number; done: number };
  categories: { id: string; name: string }[];
  updatedAt: number;
}

export interface NoteDetail {
  id: string;
  title: string;
  content: string;
  todos: unknown[];
  categories: { id: string; userId: string; name: string }[];
  createdAt: string;
  updatedAt: string;
}
