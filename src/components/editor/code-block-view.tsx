import {
  NodeViewContent,
  NodeViewWrapper,
  type ReactNodeViewProps,
} from "@tiptap/react";
import { CodeBlockToolbar } from "./code-block-toolbar";

// Node-view shell for a code block: the toolbar (language + copy) on top, the
// editable Prism-highlighted code below. The actual highlighting is applied by a
// decoration plugin (see extensions/CodeBlock.ts); the UI lives in
// CodeBlockToolbar so it's easy to extend.
export function CodeBlockView({
  node,
  updateAttributes,
  editor,
  getPos,
}: ReactNodeViewProps) {
  const language: string = node.attrs.language ?? "";

  const getCode = (): string => {
    if (typeof getPos === "function") {
      const pos = getPos();
      if (typeof pos === "number") {
        const current = editor.state.doc.nodeAt(pos);
        if (current) return current.textContent;
      }
    }
    return node.textContent;
  };

  return (
    <NodeViewWrapper as="div" className="code-block">
      <CodeBlockToolbar
        language={language}
        onLanguageChange={(lang) => updateAttributes({ language: lang })}
        getCode={getCode}
      />
      <pre className="code-hl">
        <NodeViewContent as="div" spellCheck={false} />
      </pre>
    </NodeViewWrapper>
  );
}
