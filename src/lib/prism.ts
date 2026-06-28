import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-python";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-java";

const ALIASES: Record<string, string> = {
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  py: "python",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  html: "markup",
  xml: "markup",
  svg: "markup",
  golang: "go",
  rs: "rust",
  md: "markdown",
};

const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function highlightCode(code: string, language: string): string {
  const key = (language || "").trim().toLowerCase();
  const name = ALIASES[key] ?? key;
  const grammar = Prism.languages[name];
  return grammar ? Prism.highlight(code, grammar, name) : escapeHtml(code);
}

export interface CodeToken {
  length: number;
  className: string | null;
}

export function tokenizeCode(code: string, language: string): CodeToken[] {
  const key = (language || "").trim().toLowerCase();
  const name = ALIASES[key] ?? key;
  const grammar = Prism.languages[name];
  if (!grammar) return [{ length: code.length, className: null }];

  const out: CodeToken[] = [];
  const walk = (
    stream: string | Prism.Token | Array<string | Prism.Token>,
    inherited: string,
  ): void => {
    if (typeof stream === "string") {
      out.push({ length: stream.length, className: inherited || null });
    } else if (Array.isArray(stream)) {
      for (const s of stream) walk(s, inherited);
    } else {
      const aliases = Array.isArray(stream.alias)
        ? stream.alias
        : stream.alias
          ? [stream.alias]
          : [];
      const cls = [inherited, "token", stream.type, ...aliases]
        .filter(Boolean)
        .join(" ");
      walk(stream.content, cls);
    }
  };
  walk(Prism.tokenize(code, grammar), "");
  return out;
}

export const CODE_LANGUAGES = [
  "javascript",
  "typescript",
  "jsx",
  "tsx",
  "python",
  "go",
  "rust",
  "java",
  "json",
  "bash",
  "shell",
  "sql",
  "yaml",
  "markdown",
  "css",
  "html",
] as const;
