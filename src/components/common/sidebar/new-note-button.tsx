import { useDocumentActions } from "@/hooks/use-document-actions";
import { cn } from "@/lib/utils";
import { IconPlus } from "@tabler/icons-react";

export default function NewNoteButton({ sidebar }: { sidebar: boolean }) {
  const { openNew } = useDocumentActions();

  return (
    <button
      onClick={openNew}
      className={cn(
        "flex items-center flex-nowrap text-nowrap w-full gap-2 h-8 px-2 text-[14.5px] font-medium rounded-md text-ink-2 transition-[background,color] duration-150 hover:bg-blue-500 hover:text-white dark:hover:bg-[#18191D] text-ink hover:cursor-pointer",
        !sidebar && "justify-center px-0 gap-0 h-8 w-8",
      )}
    >
      <IconPlus size={20} className="shrink-0" />
      {sidebar && "New"}
    </button>
  );
}
