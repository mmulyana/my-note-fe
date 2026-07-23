export type Notes = {
  id: string;
  title: string;
  preview: string;
  todoSummary: { total: number; done: number };
  labels: { id: string; name: string }[];
  updatedAt: string;
  folder?: { id: string, name: string, color: string } | null
  secret?: boolean;
};

export type Folder = {
  id: string;
  name: string;
  color?: string;
  secret?: boolean;
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
  email: string;
}

export interface ProfileResponse {
  id: string;
  email: string;
  username: string | null;
  photo: string | null;
}

export interface Todo {
  id: string
  noteId: string
  text: string
  checked: boolean
  deadline: string | null // "2026-06-26";
  today: string | null
  priority: TodoPriority
  createdAt: string
  updatedAt: string
}

export interface TodoGroup {
  noteId: string;
  title: string | null;
  todos: Todo[];
}

export interface TodoTodayGroups {
  today: Todo[];
  overdue: Todo[];
  completed: Todo[];
}

export type TodoView = "all" | "today";

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
  today: string | null; // ISO "YYYY-MM-DD"
  priority: TodoPriority;
}

export type TodoField = "checked" | "text" | "deadline" | "priority" | "today";

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

export interface NoteFlags {
  archived?: boolean;
  pinned?: boolean;
  secret?: boolean;
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
  labels: { id: string; name: string }[];
  folderId?: string | null;
  folder?: { id: string, name: string, color: string } | null
  updatedAt: number;
  secret?: boolean;
  pinned?: boolean
  archived?: boolean
}

export interface NoteDetail {
  id: string;
  title: string;
  content: string;
  todos: unknown[];
  labels: { id: string; userId: string; name: string }[];
  folderId?: string | null;
  createdAt: string;
  updatedAt: string;
  folder?: { id: string, name: string, color: string } | null
  secret?: boolean
  pinned?: boolean
  archived?: boolean
}
