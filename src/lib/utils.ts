import { type JSONContent } from "@tiptap/react";
import { formatDistanceToNow } from "date-fns";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  DocItem,
  NoteListFields,
  Notes,
  TodoDiff,
  TodoField,
  TodoPayload,
  TodoPriority,
  UpdatedTodo,
} from "@/lib/types";
import { ALPHABET, MAX_BLOCKS, MAX_CHARS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toDocItem(n: Notes): DocItem {
  return {
    id: n.id,
    content: "",
    preview: n.preview,
    todoSummary: n.todoSummary,
    labels: n.labels ?? [],
    updatedAt: new Date(n.updatedAt).getTime(),
    folder: n.folder,
    secret: n.secret,
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
  return value === "low" || value === "high" ? value : "medium";
}

function ownText(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  if (!node.content) return "";
  return node.content
    .filter((child) => child.type !== "taskList")
    .map(ownText)
    .join("");
}

const FIELDS: TodoField[] = ["checked", "text", "deadline", "priority", "today"];

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
  params: Record<string, string | number | boolean | undefined | null | any>
) {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .filter(val => val !== undefined && val !== null && val !== '')
          .map(val => `${key}[]=${encodeURIComponent(String(val))}`)
      }
      return `${key}=${encodeURIComponent(String(value))}`
    })
    .join('&')

  return query ? `${baseUrl}?${query}` : baseUrl
}
