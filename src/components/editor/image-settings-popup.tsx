import { type ReactNode } from "react";
import {
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconPhotoCheck,
  IconPhotoStar,
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
  // note: only uploaded images can be a thumbnail; omit for URL images
  thumbnail?: { active: boolean; onToggle: () => void };
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

const inputClass =
  "text-[12px] font-[inherit] text-ink bg-surface-2 border border-line rounded-[6px] px-2 h-7 outline-none focus:border-accent min-w-0 w-full disabled:opacity-50";

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
          <button
            type="button"
            onClick={thumbnail.onToggle}
            className={cn(
              "flex items-center gap-2 h-8 px-2.5 rounded-lg border text-[12px] font-medium transition-colors cursor-pointer",
              thumbnail.active
                ? "bg-accent text-accent-foreground border-line-2"
                : "bg-surface-2 text-ink border-line hover:bg-surface-hi",
            )}
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
          </button>
          <div className="h-px bg-line -mx-3" />
        </>
      )}

      <Field label="Size">
        <Segmented>
          {WIDTH_PRESETS.map((pct) => (
            <SegmentItem
              key={pct}
              active={widthPct === pct}
              onClick={() => onChange({ width: `${pct}%` })}
            >
              {pct}%
            </SegmentItem>
          ))}
          <SegmentItem
            active={widthPct === null}
            onClick={() => onChange({ width: null })}
          >
            Auto
          </SegmentItem>
        </Segmented>
        <NumberField
          value={attrs.maxWidth}
          placeholder="Max width"
          onChange={(v) => onChange({ maxWidth: v ? `${v}px` : null })}
        />
      </Field>

      <Field label="Position">
        <Segmented>
          {ALIGNS.map(({ value, icon: Icon }) => (
            <SegmentItem
              key={value}
              active={attrs.align === value}
              title={value}
              onClick={() => onChange({ align: value })}
            >
              <Icon size={14} />
            </SegmentItem>
          ))}
        </Segmented>
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

function Segmented({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-0.5 p-0.5 rounded-lg border border-line bg-surface-2">
      {children}
    </div>
  );
}

function SegmentItem({
  active,
  title,
  onClick,
  children,
}: {
  active: boolean;
  title?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "flex-1 h-6 grid place-items-center rounded-md text-[11px] font-medium transition-colors cursor-pointer",
        active
          ? "bg-surface text-ink shadow-card"
          : "text-ink-3 hover:text-ink",
      )}
    >
      {children}
    </button>
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
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-[0.08em] text-ink-3">
        {label}
      </span>
      {children}
    </div>
  );
}
