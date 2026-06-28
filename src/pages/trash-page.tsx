import { IconTrash } from "@tabler/icons-react";

export default function TrashPage() {
  return (
    <div className="flex flex-col items-center gap-2 py-22.5 px-5 text-center text-ink-3">
      <div className="w-18 h-18 rounded-full grid place-items-center bg-surface-2 border border-line text-ink-3 mb-1.5">
        <IconTrash size={40} />
      </div>
      <div className="text-[17px] font-semibold text-ink-2">Trash is empty</div>
      <div className="text-sm max-w-75">Notes you delete rest here for 7 days.</div>
    </div>
  );
}
