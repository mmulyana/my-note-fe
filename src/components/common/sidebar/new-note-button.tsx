import { IconChevronDown, IconFile, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDocumentActions } from "@/hooks/use-document-actions";
import { NOTE_TEMPLATES } from "@/lib/note-templates";
import { cn } from "@/lib/utils";

const soft =
  "text-ink hover:text-ink aria-expanded:text-ink hover:bg-black/6 aria-expanded:bg-black/6 dark:text-white dark:hover:text-white dark:aria-expanded:text-white dark:hover:bg-white/10 dark:aria-expanded:bg-white/10";

export default function NewNoteButton({ sidebar }: { sidebar: boolean }) {
  const { openNew, openNewWith } = useDocumentActions();

  const menu = (
    <DropdownMenuContent
      className="w-56"
      align="start"
      onCloseAutoFocus={(e) => e.preventDefault()}
    >
      {!sidebar && (
        <>
          <DropdownMenuItem onSelect={openNew}>
            <IconFile />
            Blank note
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuLabel>Quick create</DropdownMenuLabel>
      {NOTE_TEMPLATES.map(({ id, label, icon: Icon, build }) => (
        <DropdownMenuItem key={id} onSelect={() => openNewWith(build())}>
          <Icon />
          {label}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  );

  if (!sidebar) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="New note"
            className="rounded-md text-ink hover:bg-surface-hi"
          >
            <IconPlus />
          </Button>
        </DropdownMenuTrigger>
        {menu}
      </DropdownMenu>
    );
  }

  return (
    <ButtonGroup className="mb-px w-full rounded-full border border-line dark:border-line-2 dark:bg-[#18191D] [&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-full! bg-white">
      <Button
        variant="ghost"
        onClick={openNew}
        className={cn(
          soft,
          "flex-1 pr-8 justify-start items-center pl-1.5 rounded-l-full",
        )}
      >
        <div className="shrink-0 w-4.5 h-4.5 flex justify-center items-center">
          <IconPlus />
        </div>
        New
      </Button>
      <ButtonGroupSeparator className="bg-line-2 data-vertical:h-5 data-vertical:self-center" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="New note from template"
            className={cn(soft, "w-11")}
          >
            <IconChevronDown />
          </Button>
        </DropdownMenuTrigger>
        {menu}
      </DropdownMenu>
    </ButtonGroup>
  );
}
