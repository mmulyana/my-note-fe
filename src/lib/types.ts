export type NoteTodoItem = {
  id: string;
  text: string;
  checked: boolean;
  deadline: string | null;
  today: string | null;
  priority: TodoPriority;
};

export type Notes = {
  id: string;
  title: string;
  preview: string;
  todoSummary: { total: number; done: number };
  todos?: NoteTodoItem[];
  labels: { id: string; name: string }[];
  updatedAt: string;
  folder?: { id: string; name: string; color: string; secret: boolean } | null;
  secret?: boolean;
};

export type Folder = {
  id: string;
  name: string;
  color?: string;
  secret?: boolean;
  pinned?: boolean;
  isolated?: boolean;
};

export type FolderNotePreview = {
  title: string | null;
  text?: string;
};

export type FolderWithNotes = Folder & {
  createdAt?: string;
  updatedAt?: string;
  notes: FolderNotePreview[];
  totalNotes?: number;
};

export type GridView = "grid-view" | "rows-view";
export type Theme = "dark" | "light";

export type Counts = {
  notes: number;
  todos: number;
  labels: number;
  archive: number;
  folders: Record<string, number>;
};

export interface IApi<T = void> {
  data: T;
  message: string;
}

export interface AuthData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  email: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  email: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface ProfileResponse {
  id: string;
  email: string;
  username: string | null;
  photo: string | null;
}

export interface Todo {
  id: string;
  noteId: string;
  text: string;
  checked: boolean;
  deadline: string | null; // "2026-06-26";
  today: string | null;
  priority: TodoPriority;
  createdAt: string;
  updatedAt: string;
}

export interface TodoDateGroup {
  date: string; // "2026-09-14"
  todos: Todo[];
}

export type NoteListFields = {
  preview: string;
  todoSummary: { total: number; done: number };
};

export type TodoPriority = "" | "low" | "medium" | "high";

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

// link cards carry the OG metadata inline so a saved note renders without a
// round trip; the server keeps its own copy so links stay queryable per user.
export interface LinkPayload {
  id: string;
  url: string;
  title: string;
  description: string;
  image: string;
  favicon: string;
  siteName: string;
}

// the fields the server knows how to update; `id` is the key, never a field
export type LinkField = Exclude<keyof LinkPayload, "id">;

export interface UpdatedLink {
  id: string;
  before: LinkPayload;
  after: LinkPayload;
  changedFields: LinkField[];
}

export interface LinkDiff {
  added: LinkPayload[];
  updated: UpdatedLink[];
  removed: LinkPayload[];
  unchanged: number;
}

// the shape GET /links/preview answers with
export type LinkPreview = Omit<LinkPayload, "id">;

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
  links: LinkPayload[];
  linkDiff?: LinkDiff;
}

export interface DocItem {
  id: string;
  title?: string;
  content: string;
  preview: string;
  todoSummary: { total: number; done: number };
  todos?: NoteTodoItem[];
  labels: { id: string; name: string }[];
  folderId?: string | null;
  folder?: { id: string; name: string; color: string; secret: boolean } | null;
  updatedAt: number;
  secret?: boolean;
  pinned?: boolean;
  archived?: boolean;
}

export type FeedbackType = "report" | "feature_request" | "feedback";

export interface FeedbackPayload {
  type: FeedbackType;
  title: string;
  description: string;
  customFields?: { rating?: number };
}

export interface FeedbackResponse {
  id: string;
  type: FeedbackType;
  title: string;
  status: string;
  createdAt: string;
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
  folder?: { id: string; name: string; color: string; secret: boolean } | null;
  secret?: boolean;
  pinned?: boolean;
  archived?: boolean;
}
