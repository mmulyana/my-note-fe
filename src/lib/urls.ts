export const urls = {
  Notes: "/notes",
  Note: (id: string) => `/notes/${id}`,
  Todos: "/todos",
  TodosGrouped: "/todos/group/notes",
  Todo: (id: string) => `/todos/${id}`,
  Labels: "/labels",
  Login: "/auth/login",
  Register: "/auth/register",
  Me: "/auth/me",
  Folder: "/folders"
};
