import { type ReactNode } from "react";
import {
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { ImageAlign, ImageObjectFit } from "./extensions/image";

interface ImageAttrs {
  width: string | null;
  maxWidth: string | null;
  height: string | null;
  objectFit: ImageObjectFit | null;
  align: ImageAlign;
}

interface ImageSettingsPopupProps {
  attrs: ImageAttrs;
  onChange: (attrs: Partial<ImageAttrs>) => void;
}

const WIDTH_PRESETS = [25, 50, 75, 100];
const ALIGNS: { value: ImageAlign; icon: typeof IconAlignLeft }[] = [
  { value: "left", icon: IconAlignLeft },
  { value: "center", icon: IconAlignCenter },
  { value: "right", icon: IconAlignRight },
];
const OBJECT_FITS: ImageObjectFit[] = [
  "fill",
  "contain",
  "cover",
  "none",
  "scale-down",
];

export function ImageSettingsPopup({
  attrs,
  onChange,
}: ImageSettingsPopupProps) {
  const widthPct = attrs.width ? parseInt(attrs.width, 10) : null;

  return (
    <div className="flex flex-col gap-2.75 text-left">
      <Field label="Width">
        <div className="flex gap-1">
          {WIDTH_PRESETS.map((pct) => (
            <button
              key={pct}
              type="button"
              className={cn(
                "flex-1 h-7 rounded-md text-[11px] font-medium border transition-colors",
                widthPct === pct
                  ? "bg-(--surface-hi) text-(--ink) border-(--line-2)"
                  : "text-(--ink-3) border-(--line) hover:text-(--ink)",
              )}
              onClick={() => onChange({ width: `${pct}%` })}
            >
              {pct}%
            </button>
          ))}
          <button
            type="button"
            className={cn(
              "flex-1 h-7 rounded-md text-[11px] font-medium border transition-colors",
              widthPct === null
                ? "bg-(--surface-hi) text-(--ink) border-(--line-2)"
                : "text-(--ink-3) border-(--line) hover:text-(--ink)",
            )}
            onClick={() => onChange({ width: null })}
          >
            Asli
          </button>
        </div>
      </Field>

      <Field label="Max width (px)">
        <NumberField
          value={attrs.maxWidth}
          unit="px"
          placeholder="Tanpa batas"
          onChange={(v) => onChange({ maxWidth: v ? `${v}px` : null })}
        />
      </Field>

      <Field label="Posisi">
        <div className="flex gap-1">
          {ALIGNS.map(({ value, icon: Icon }) => (
            <button
              key={value}
              type="button"
              className={cn(
                "flex-1 h-7 grid place-items-center rounded-md border transition-colors",
                attrs.align === value
                  ? "bg-(--surface-hi) text-(--ink) border-(--line-2)"
                  : "text-(--ink-3) border-(--line) hover:text-(--ink)",
              )}
              title={value}
              onClick={() => onChange({ align: value })}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      </Field>

      <Field label="Height (px)">
        <NumberField
          value={attrs.height}
          unit="px"
          placeholder="Auto"
          onChange={(v) =>
            onChange(
              v ? { height: `${v}px` } : { height: null, objectFit: null },
            )
          }
        />
      </Field>

      <Field label="Object fit">
        {attrs.height ? (
          <select
            value={attrs.objectFit ?? "fill"}
            onChange={(e) =>
              onChange({ objectFit: e.target.value as ImageObjectFit })
            }
            className="text-[12px] font-[inherit] text-(--ink) bg-(--surface-2) border border-(--line) rounded-[7px] px-2 py-1.5 outline-none focus:border-accent capitalize"
          >
            {OBJECT_FITS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-[11px] text-(--ink-3)">
            Isi Height dulu supaya Object Fit kelihatan efeknya.
          </p>
        )}
      </Field>
    </div>
  );
}

function NumberField({
  value,
  unit,
  placeholder,
  onChange,
}: {
  value: string | null;
  unit: string;
  placeholder: string;
  onChange: (value: number | null) => void;
}) {
  const numeric = value ? parseInt(value, 10) : null;
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={0}
        placeholder={placeholder}
        value={numeric ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
        className="text-[12px] font-[inherit] text-(--ink) bg-(--surface-2) border border-(--line) rounded-[7px] px-2 py-1.5 outline-none focus:border-accent flex-1 min-w-0"
      />
      <span className="text-[11px] text-(--ink-3) w-5">{unit}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.08em] text-(--ink-3)">
        {label}
      </span>
      {children}
    </div>
  );
}
