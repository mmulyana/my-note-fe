import { type ReactNode } from "react";
import { IconPhotoCheck, IconPhotoStar } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
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
  // note: only uploaded images can be a thumbnail; omit for URL images
  thumbnail?: { active: boolean; onToggle: () => void };
}

const WIDTH_PRESETS = [25, 50, 75, 100];
const ALIGNS: { value: ImageAlign; label: string }[] = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];
const OBJECT_FITS: ImageObjectFit[] = [
  "fill",
  "contain",
  "cover",
  "none",
  "scale-down",
];

const inputClass =
  "text-[13px] font-[inherit] text-ink bg-surface border border-line rounded-[7.5px] px-2.5 h-8 outline-none transition-[border-color,box-shadow] focus:border-line-2 focus:ring-2 focus:ring-line min-w-0 w-full disabled:opacity-50";

export function ImageSettingsPopup({
  attrs,
  onChange,
  thumbnail,
}: ImageSettingsPopupProps) {
  const widthPct = attrs.width ? parseInt(attrs.width, 10) : null;

  return (
    <div className="flex flex-col gap-3 text-left">
      {thumbnail && (
        <>
          <Button
            type="button"
            variant={thumbnail.active ? "secondary" : "outline"}
            onClick={thumbnail.onToggle}
            className="w-full justify-start rounded-[7.5px]"
          >
            {thumbnail.active ? (
              <IconPhotoCheck size={15} />
            ) : (
              <IconPhotoStar size={15} />
            )}
            <span className="flex-1 text-left">
              {thumbnail.active ? "Note thumbnail" : "Use as thumbnail"}
            </span>
            {thumbnail.active && (
              <span className="text-[11px] font-normal text-ink-3">
                Remove
              </span>
            )}
          </Button>
          <div className="h-px bg-line -mx-3" />
        </>
      )}

      <Field label="Size">
        <select
          value={widthPct ? String(widthPct) : "auto"}
          onChange={(e) =>
            onChange({
              width: e.target.value === "auto" ? null : `${e.target.value}%`,
            })
          }
          className={cn(inputClass, "capitalize")}
        >
          {WIDTH_PRESETS.map((pct) => (
            <option key={pct} value={pct}>
              {pct}%
            </option>
          ))}
          <option value="auto">Auto</option>
        </select>
        <NumberField
          value={attrs.maxWidth}
          placeholder="Max width"
          onChange={(v) => onChange({ maxWidth: v ? `${v}px` : null })}
        />
      </Field>

      <Field label="Position">
        <select
          value={attrs.align}
          onChange={(e) => onChange({ align: e.target.value as ImageAlign })}
          className={cn(inputClass, "capitalize")}
        >
          {ALIGNS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Crop">
        <div className="grid grid-cols-2 gap-1.5">
          <NumberField
            value={attrs.height}
            placeholder="Height"
            onChange={(v) =>
              onChange(
                v ? { height: `${v}px` } : { height: null, objectFit: null },
              )
            }
          />
          <select
            value={attrs.objectFit ?? "fill"}
            disabled={!attrs.height}
            title={attrs.height ? undefined : "Set a height first"}
            onChange={(e) =>
              onChange({ objectFit: e.target.value as ImageObjectFit })
            }
            className={cn(inputClass, "capitalize")}
          >
            {OBJECT_FITS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </Field>
    </div>
  );
}

function NumberField({
  value,
  placeholder,
  onChange,
}: {
  value: string | null;
  placeholder: string;
  onChange: (value: number | null) => void;
}) {
  const numeric = value ? parseInt(value, 10) : null;
  return (
    <div className="relative">
      <input
        type="number"
        min={0}
        placeholder={placeholder}
        value={numeric ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
        className={cn(inputClass, "pr-7")}
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-ink-3 pointer-events-none">
        px
      </span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-18 shrink-0 items-center text-[11px] font-medium text-ink-3">
        {label}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">{children}</div>
    </div>
  );
}
