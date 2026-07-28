import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useState } from "react";
import { CODE_LANGUAGES } from "@/lib/prism";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PLAIN = "plain";

const itemClass =
  "mono min-h-6 rounded-md py-1 text-[11px] text-ink-2 focus:bg-surface-2 focus:text-ink";

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
      {/* Radix Select has no empty-string value, so "plain" stands in for it */}
      <Select
        value={language || PLAIN}
        onValueChange={(v) => onLanguageChange(v === PLAIN ? "" : v)}
      >
        <SelectTrigger
          size="sm"
          className="code-block-lang"
          title="Language"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          position="popper"
          align="start"
          className="max-h-64 min-w-32 rounded-lg border border-line-2 p-1 shadow-(--shadow-lg) ring-0"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <SelectItem value={PLAIN} className={itemClass}>
            {PLAIN}
          </SelectItem>
          {CODE_LANGUAGES.map((lang) => (
            <SelectItem key={lang} value={lang} className={itemClass}>
              {lang}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        type="button"
        className="code-block-copy"
        title={copied ? "Copied" : "Copy code"}
        aria-label={copied ? "Copied" : "Copy code"}
        onClick={copy}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
      </button>
    </div>
  );
}
