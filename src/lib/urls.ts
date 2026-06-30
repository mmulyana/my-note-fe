export const urls = {
  Notes: "/notes",
  Note: (id: string) => `/notes/${id}`,
  Todos: "/todos",
  TodosGrouped: "/todos/group/notes",
  Todo: (id: string) => `/todos/${id}`,
  Categories: "/categories",
  Login: "/auth/login",
  Register: "/auth/register",
  Me: "/auth/me",
};
