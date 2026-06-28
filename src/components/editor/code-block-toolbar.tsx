import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useState } from "react";
import { CODE_LANGUAGES } from "@/lib/prism";

interface CodeBlockToolbarProps {
  language: string;
  onLanguageChange: (language: string) => void;
  getCode: () => string;
}

export function CodeBlockToolbar({
  language,
  onLanguageChange,
  getCode,
}: CodeBlockToolbarProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(getCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // clipboard unavailable (insecure context / permission denied) — ignore
    }
  };

  return (
    <div className="code-block-bar" contentEditable={false}>
      <select
        className="code-block-lang"
        value={language}
        title="Language"
        onChange={(e) => onLanguageChange(e.target.value)}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <option value="">plain</option>
        {CODE_LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="code-block-copy"
        title="Copy code"
        onClick={copy}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
