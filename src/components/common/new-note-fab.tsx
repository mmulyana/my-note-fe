import { useLocation } from "react-router-dom";
import { IconFile, IconPlus } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useDocumentActions } from "@/hooks/use-document-actions";
import { NOTE_TEMPLATES } from "@/lib/note-templates";

export function NewNoteFab() {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const { openNew, openNewWith } = useDocumentActions();

  if (!isMobile || pathname.startsWith("/note/")) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="New note"
          className="group fixed right-4 bottom-4 z-40 grid size-12 place-items-center rounded-full bg-ink text-surface shadow-card-lg transition-transform duration-150 active:scale-95 cursor-pointer"
        >
          <IconPlus
            size={22}
            className="transition-transform duration-200 group-aria-expanded:rotate-45"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        side="top"
        align="end"
        sideOffset={10}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuItem onSelect={openNew}>
          <IconFile />
          Blank note
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Quick create</DropdownMenuLabel>
        {NOTE_TEMPLATES.map(({ id, label, icon: Icon, build }) => (
          <DropdownMenuItem key={id} onSelect={() => openNewWith(build())}>
            <Icon />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
