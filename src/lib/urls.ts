export const urls = {
  Notes: "/notes",
  Note: (id: string) => `/notes/${id}`,
  Todos: "/todos",
  TodosGrouped: "/todos/group/notes",
  TodosGroupedToday: (date: string) => `/todos/group/today?date=${date}`,
  Todo: (id: string) => `/todos/${id}`,
  Labels: "/labels",
  Login: "/auth/login",
  Register: "/auth/register",
  Me: "/auth/me",
  Folder: "/folders",
  Uploads: "/uploads",
  Profile: "/me",
};

const API_ORIGIN = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/api\/?$/, "");

export function assetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}
