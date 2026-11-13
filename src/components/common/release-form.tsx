import { useState } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { useApi } from "@/hooks/use-api";
import { cn } from "@/lib/utils";
import type { IApi, Release, ReleaseTag } from "@/lib/types";

const TAGS: { value: ReleaseTag; label: string }[] = [
  { value: "new", label: "New" },
  { value: "improved", label: "Improved" },
  { value: "fixed", label: "Fixed" },
];

// note: same field as the editor popups (image settings), so the form reads as part of the app
const FIELD =
  "w-full min-w-0 text-[13px] font-[inherit] text-ink bg-surface border border-line rounded-[7.5px] px-2.5 h-8 outline-none transition-[border-color,box-shadow] placeholder:text-ink-4 focus:border-line-2 focus:ring-2 focus:ring-line";
const AREA = "h-auto py-1.5 leading-relaxed resize-none";

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("flex flex-col gap-1", className)}>
      <span className="text-[11px] font-medium text-ink-3">{label}</span>
      {children}
    </label>
  );
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function toHtml(text: string): string {
  return text
    .trim()
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n");
      if (lines.every((l) => l.trim().startsWith("- "))) {
        const items = lines
          .map((l) => `<li><p>${escapeHtml(l.trim().slice(2))}</p></li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }
      return `<p>${escapeHtml(lines.join(" "))}</p>`;
    })
    .join("");
}

type ReleaseBody = Pick<
  Release,
  "title" | "version" | "tag" | "summary" | "content" | "image" | "publishedAt"
>;

interface ReleaseFormProps {
  release?: Release;
  onDone: () => void;
}

export function ReleaseForm({ release, onDone }: ReleaseFormProps) {
  const [form, setForm] = useState(() => ({
    title: release?.title ?? "",
    version: release?.version ?? "",
    tag: release?.tag ?? ("new" as ReleaseTag),
    summary: release?.summary ?? "",
    content: release?.content ?? "",
    image: release?.image ?? "",
    publish: release ? Boolean(release.publishedAt) : true,
  }));
  const set = (patch: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const {
    mutate: save,
    isPending,
    error,
  } = useApi<IApi<Release>, ReleaseBody>({
    url: release ? `/releases/${release.id}` : "/releases",
    method: release ? "PATCH" : "POST",
    queryKey: ["releases"],
    onSuccess: onDone,
  });

  const submit = () => {
    if (!form.title.trim()) return;
    save({
      title: form.title.trim(),
      version: form.version.trim().replace(/^v/i, ""),
      tag: form.tag,
      summary: form.summary.trim(),
      content: release ? form.content : toHtml(form.content),
      image: form.image.trim(),
      // note: the API replaces the entry wholesale, so a published one must send its date back or it turns into a draft
      publishedAt: form.publish
        ? (release?.publishedAt ?? new Date().toISOString())
        : null,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1.5">
        {TAGS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => set({ tag: t.value })}
            aria-pressed={form.tag === t.value}
            className={cn(
              "h-6 px-2.5 rounded-full text-xs font-medium transition-[background,color] duration-150 cursor-pointer",
              form.tag === t.value
                ? "bg-ink text-bg"
                : "bg-line/60 text-ink-3 hover:text-ink hover:bg-line/90",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Field label="Title" className="min-w-0 flex-1">
          <input
            className={FIELD}
            value={form.title}
            onChange={(e) => set({ title: e.target.value })}
          />
        </Field>
        <Field label="Version" className="w-20">
          <input
            className={FIELD}
            placeholder="1.5.0"
            value={form.version}
            onChange={(e) => set({ version: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Summary">
        <textarea
          className={cn(FIELD, AREA)}
          rows={2}
          value={form.summary}
          onChange={(e) => set({ summary: e.target.value })}
        />
      </Field>
      <Field label="Details">
        <textarea
          className={cn(FIELD, AREA)}
          rows={5}
          placeholder={
            release
              ? "HTML"
              : "Blank line starts a new paragraph. Start lines with - for bullets."
          }
          value={form.content}
          onChange={(e) => set({ content: e.target.value })}
        />
      </Field>
      <Field label="Image URL">
        <input
          className={FIELD}
          value={form.image}
          onChange={(e) => set({ image: e.target.value })}
        />
      </Field>

      <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-2">
        <input
          type="checkbox"
          className="size-3.5 cursor-pointer accent-(--ink)"
          checked={form.publish}
          onChange={(e) => set({ publish: e.target.checked })}
        />
        Publish now
        <span className="text-ink-3">(off = draft)</span>
      </label>

      {error && (
        <p className="text-[12px] text-red-500">
          {error.message || "Failed to save. Please try again."}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="h-8 px-3 rounded-[7.5px] text-[13px] font-medium text-ink-3 transition-colors hover:text-ink cursor-pointer"
          onClick={onDone}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={isPending || !form.title.trim()}
          className="h-8 px-3.5 rounded-[7.5px] text-[13px] font-medium bg-ink text-bg transition-opacity hover:opacity-90 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          onClick={submit}
        >
          {isPending ? (
            <IconLoader2 size={14} className="animate-spin" />
          ) : (
            "Save"
          )}
        </button>
      </div>
    </div>
  );
}
