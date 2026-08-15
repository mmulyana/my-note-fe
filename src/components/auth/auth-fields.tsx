import { IconAlertCircle, IconEye, IconEyeOff } from "@tabler/icons-react";
import { useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-[10px] border border-line bg-(--bg-2) px-3 py-2.5 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-3 focus:border-(--accent) focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--accent)_22%,transparent)]";

interface FieldProps extends ComponentProps<"input"> {
  label: string;
}

export function TextField({ label, className, ...props }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-ink-2">{label}</span>
      <input className={cn(inputClass, className)} {...props} />
    </label>
  );
}

export function PasswordField({ label, className, ...props }: FieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-ink-2">{label}</span>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          className={cn(inputClass, "pr-10.5", className)}
          {...props}
        />
        <button
          type="button"
          className="absolute top-1/2 right-1.5 inline-flex h-7.5 w-7.5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-ink-3 transition-[background,color] duration-150 hover:bg-(--surface-hi) hover:text-ink"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <IconEyeOff size={17} /> : <IconEye size={17} />}
        </button>
      </div>
    </label>
  );
}

export function SubmitButton({
  pending,
  children,
}: {
  pending?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 cursor-pointer rounded-[10px] bg-(--accent) px-4 py-2.75 text-sm font-semibold text-white transition-[filter,opacity] duration-150 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Please wait…" : children}
    </button>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="flex items-start gap-1.5 rounded-[10px] border border-red-500/25 bg-red-500/10 px-3 py-2 text-[13px] text-red-500">
      <IconAlertCircle size={16} className="mt-px shrink-0" />
      {message}
    </p>
  );
}
