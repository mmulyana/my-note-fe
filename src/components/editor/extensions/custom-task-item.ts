import { TaskItem } from "@tiptap/extension-list";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { TaskItemView } from "@/components/editor/task-item-view";
import { newId } from "@/lib/utils";

export const CustomTaskItem = TaskItem.extend({
  addAttributes() {
    return {
      // keep the built-in attributes (checked, …)
      ...this.parent?.(),

      id: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-id") || null,
        renderHTML: (attrs) => (attrs.id ? { "data-id": attrs.id } : {}),
      },

      deadline: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-deadline") || null,
        renderHTML: (attrs) =>
          attrs.deadline ? { "data-deadline": attrs.deadline } : {},
      },

      priority: {
        default: "medium",
        parseHTML: (el) => el.getAttribute("data-priority") || "medium",
        renderHTML: (attrs) =>
          attrs.priority && attrs.priority !== "medium"
            ? { "data-priority": attrs.priority }
            : {},
      },

    };
  },

  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      // prevent Tab from creating nested task items
      Tab: () => true,
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(TaskItemView);
  },

  addProseMirrorPlugins() {
    const parentPlugins = this.parent?.() ?? [];
    const typeName = this.name;

    return [
      ...parentPlugins,
      new Plugin({
        key: new PluginKey("customTaskItemId"),
        appendTransaction: (transactions, _oldState, newState) => {
          if (!transactions.some((tr) => tr.docChanged)) return null;

          const tr = newState.tr;
          const seen = new Set<string>();
          let modified = false;

          newState.doc.descendants((node, pos) => {
            if (node.type.name !== typeName) return;
            const id: string | null = node.attrs.id;
            // missing OR duplicate (e.g. copy/paste) → give it a fresh id
            if (!id || seen.has(id)) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                id: newId(),
              });
              modified = true;
            } else {
              seen.add(id);
            }
          });

          return modified ? tr : null;
        },
      }),
    ];
  },
});
