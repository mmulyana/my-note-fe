import { useLocation } from "react-router-dom";
import { IconPlus } from "@tabler/icons-react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useDocumentActions } from "@/hooks/use-document-actions";

export function NewNoteFab() {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const { openNew } = useDocumentActions();

  if (!isMobile || pathname.startsWith("/note/")) return null;

  return (
    <button
      onClick={openNew}
      aria-label="New note"
      className="fixed right-1/2 translate-x-1/2 bottom-6 z-40 flex h-fit w-fit items-center justify-center rounded-full bg-ink text-surface shadow-(--shadow-lg) transition-transform duration-150 active:scale-95 cursor-pointer pl-2.5 pr-3.5 gap-1 py-2 text-[13px]"
    >
      <IconPlus size={17} className="shrink-0" />
      <p>New Note</p>
    </button>
  );
}
