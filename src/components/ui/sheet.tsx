import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Sheet({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-[15px] font-semibold text-(--ink)", className)}
      {...props}
    />
  );
}

const SIDES = {
  right: {
    wrapper:
      "inset-y-0 right-0 h-full w-[calc(100%-2rem)] max-w-sm p-2 data-open:slide-in-from-right data-closed:slide-out-to-right",
    panel: "rounded-2xl border border-(--line-2) shadow-(--shadow-lg)",
  },
  bottom: {
    wrapper:
      "inset-x-0 bottom-0 min-h-[45vh] max-h-[85vh] w-full data-open:slide-in-from-bottom data-closed:slide-out-to-bottom",
    panel: "rounded-t-2xl border-t border-(--line-2) shadow-(--shadow-lg)",
  },
} as const;

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  side?: keyof typeof SIDES;
}) {
  const { wrapper, panel } = SIDES[side];

  return (
    <DialogPrimitive.Portal data-slot="sheet-portal">
      <DialogPrimitive.Overlay
        data-slot="sheet-overlay"
        className="fixed inset-0 z-50 bg-black/50 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
      />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex bg-transparent duration-200 data-open:animate-in data-closed:animate-out",
          wrapper,
        )}
        {...props}
      >
        <div
          data-slot="sheet-panel"
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-hidden bg-(--surface)",
            panel,
            className,
          )}
        >
          {children}
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export { Sheet, SheetClose, SheetContent, SheetTitle };
