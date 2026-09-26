export const urls = {
  Notes: "/notes",
  NotesCounts: "/notes/counts",
  Note: (id: string) => `/notes/${id}`,
  Todos: "/todos",
  TodosGroupedByDate: (from: string, to: string, tz: string) =>
    `/todos/group/created?from=${from}&to=${to}&tz=${encodeURIComponent(tz)}`,
  Todo: (id: string) => `/todos/${id}`,
  Labels: "/labels",
  Links: "/links",
  LinkPreview: (url: string) => `/links/preview?url=${encodeURIComponent(url)}`,
  Login: "/auth/login",
  Register: "/auth/register",
  RefreshToken: "/auth/refresh",
  Logout: "/auth/logout",
  Me: "/auth/me",
  Folder: "/folders",
  FolderWithNotes: "/folders/with-notes",
  FolderById: (id: string) => `/folders/${id}`,
  Uploads: "/uploads",
  Profile: "/me",
  Feedback: "/feedback",
  AiStream: "/ai/stream",
  AiUsage: "/ai/usage",
};

const API_ORIGIN = (import.meta.env.VITE_API_URL ?? "/api").replace(
  /\/api\/?$/,
  "",
);

export function assetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}
