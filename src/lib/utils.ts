import { type JSONContent } from "@tiptap/react";
import { formatDistanceToNow } from "date-fns";
import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import type {
  DocItem,
  FolderWithNotes,
  NoteListFields,
  Notes,
  LinkDiff,
  LinkField,
  LinkPayload,
  TodoDiff,
  TodoField,
  TodoPayload,
  TodoPriority,
  UpdatedLink,
  UpdatedTodo,
} from "@/lib/types";
import { ALPHABET, MAX_BLOCKS, MAX_CHARS } from "./constants";

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      shadow: ["card", "card-lg"],
      radius: ["check"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toDocItem(n: Notes): DocItem {
  return {
    id: n.id,
    title: n.title,
    content: "",
    preview: n.preview,
    todoSummary: n.todoSummary,
    todos: n.todos,
    labels: n.labels ?? [],
    updatedAt: new Date(n.updatedAt).getTime(),
    folder: n.folder,
    secret: n.secret,
    archived: n.archived,
  };
}

export function extractTodos(doc: JSONContent): TodoPayload[] {
  const todos: TodoPayload[] = [];

  const walk = (node?: JSONContent) => {
    if (!node) return;
    if (node.type === "taskItem") {
      const attrs = node.attrs ?? {};
      todos.push({
        id: typeof attrs.id === "string" ? attrs.id : "",
        checked: Boolean(attrs.checked),
        text: ownText(node),
        deadline: attrs.deadline ?? null,
        today: attrs.today ?? null,
        priority: normalizePriority(attrs.priority),
      });
    }
    node.content?.forEach(walk);
  };

  walk(doc);
  return todos;
}

function normalizePriority(value: unknown): TodoPriority {
  return value === "low" || value === "medium" || value === "high" ? value : "";
}

function ownText(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  if (!node.content) return "";
  return node.content
    .filter((child) => child.type !== "taskList")
    .map(ownText)
    .join("");
}

const FIELDS: TodoField[] = [
  "checked",
  "text",
  "deadline",
  "priority",
  "today",
];

function sameValue(field: TodoField, a: TodoPayload, b: TodoPayload): boolean {
  return a[field] === b[field];
}

export function diffTodos(prev: TodoPayload[], next: TodoPayload[]): TodoDiff {
  const prevById = new Map(prev.map((t) => [t.id, t]));
  const nextById = new Map(next.map((t) => [t.id, t]));

  const added: TodoPayload[] = [];
  const updated: UpdatedTodo[] = [];
  let unchanged = 0;

  for (const todo of next) {
    const before = prevById.get(todo.id);
    if (!before) {
      added.push(todo);
      continue;
    }
    const changedFields = FIELDS.filter((f) => !sameValue(f, before, todo));
    if (changedFields.length > 0) {
      updated.push({ id: todo.id, before, after: todo, changedFields });
    } else {
      unchanged++;
    }
  }

  const removed = prev.filter((t) => !nextById.has(t.id));

  return { added, updated, removed, unchanged };
}

const str = (value: unknown): string =>
  typeof value === "string" ? value : "";

export function extractLinks(doc: JSONContent): LinkPayload[] {
  const links: LinkPayload[] = [];
  // note: a copied card carries its source id. First occurrence wins so the
  // diff never sends two rows for one id; the paste handler re-mints the
  // duplicate, so this only covers the gap before that transaction lands.
  const seen = new Set<string>();

  const walk = (node?: JSONContent) => {
    if (!node) return;
    if (node.type === "linkCard") {
      const attrs = node.attrs ?? {};
      const id = str(attrs.id);
      const url = str(attrs.url);
      // a card still resolving has no metadata worth persisting yet
      if (id && url && !seen.has(id)) {
        seen.add(id);
        links.push({
          id,
          url,
          title: str(attrs.title),
          description: str(attrs.description),
          image: str(attrs.image),
          favicon: str(attrs.favicon),
          siteName: str(attrs.siteName),
        });
      }
    }
    node.content?.forEach(walk);
  };

  walk(doc);
  return links;
}

const LINK_FIELDS: LinkField[] = [
  "url",
  "title",
  "description",
  "image",
  "favicon",
  "siteName",
];

export function diffLinks(prev: LinkPayload[], next: LinkPayload[]): LinkDiff {
  const prevById = new Map(prev.map((l) => [l.id, l]));
  const nextById = new Map(next.map((l) => [l.id, l]));

  const added: LinkPayload[] = [];
  const updated: UpdatedLink[] = [];
  let unchanged = 0;

  for (const link of next) {
    const before = prevById.get(link.id);
    if (!before) {
      added.push(link);
      continue;
    }
    const changedFields = LINK_FIELDS.filter((f) => before[f] !== link[f]);
    if (changedFields.length > 0) {
      updated.push({ id: link.id, before, after: link, changedFields });
    } else {
      unchanged++;
    }
  }

  const removed = prev.filter((l) => !nextById.has(l.id));

  return { added, updated, removed, unchanged };
}

export function extractLabels(doc: JSONContent): string[] {
  const names: string[] = [];
  const seen = new Set<string>();

  const add = (run: string) => {
    const match = /^#([\p{L}\p{N}_-]{1,32})$/u.exec(run);
    if (!match) return;
    const name = match[1];
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    names.push(name);
  };

  const walk = (node?: JSONContent) => {
    if (!node?.content) return;
    let run = "";
    for (const child of node.content) {
      if (
        child.type === "text" &&
        child.marks?.some((m) => m.type === "labelTag")
      ) {
        run += str(child.text);
        continue;
      }
      if (run) add(run);
      run = "";
      walk(child);
    }
    if (run) add(run);
  };

  walk(doc);
  return names;
}

export function deriveListFields(
  html: string,
  {
    maxChars = MAX_CHARS,
    maxBlocks = MAX_BLOCKS,
  }: { maxChars?: number; maxBlocks?: number } = {},
): NoteListFields {
  const el = new DOMParser().parseFromString(html, "text/html");

  const blocks: string[] = [];
  let chars = 0;
  for (const block of Array.from(el.body.children)) {
    blocks.push(block.outerHTML);
    chars += (block.textContent ?? "").length;
    if (blocks.length >= maxBlocks || chars >= maxChars) break;
  }

  // todo counts
  const items = el.querySelectorAll('[data-type="taskItem"]');
  let done = 0;
  items.forEach((li) => {
    if (li.getAttribute("data-checked") === "true") done++;
  });

  return {
    preview: blocks.join(""),
    todoSummary: { total: items.length, done },
  };
}

export function newId(size = 8): string {
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  let id = "";
  for (let i = 0; i < size; i++) id += ALPHABET[bytes[i] & 63];
  return id;
}

export function relative(ms: number): string {
  try {
    return formatDistanceToNow(new Date(ms), { addSuffix: true });
  } catch {
    return "";
  }
}

export function buildQuery(
  baseUrl: string,
  params: Record<string, string | number | boolean | undefined | null | any>,
) {
  const query = Object.entries(params)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .filter((val) => val !== undefined && val !== null && val !== "")
          .map((val) => `${key}[]=${encodeURIComponent(String(val))}`);
      }
      return `${key}=${encodeURIComponent(String(value))}`;
    })
    .join("&");

  return query ? `${baseUrl}?${query}` : baseUrl;
}

export function folderNoteCount(folder: FolderWithNotes): number {
  return folder.totalNotes ?? folder.notes?.length ?? 0;
}
