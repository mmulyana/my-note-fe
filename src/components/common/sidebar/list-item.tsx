import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { cn } from "../../../lib/utils";
import {
  IconCheck,
  IconPencil,
  IconTagFilled,
  IconX,
} from "@tabler/icons-react";

interface Props {
  data: any;
  open: boolean;
  onRemove: (id: string) => void;
  onEdit: (id: string, name: string) => void;
}

export function ListItem({
  data,
  open,
  onRemove,
  onEdit,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(data.name);
  const [searchParams] = useSearchParams();

  const isActive = searchParams.get("label") === data.name;

  const handleEdit = () => {
    if (editName.trim()) {
      onEdit(data.id, editName.trim());
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center h-9 px-2 rounded-md text-sm font-medium text-ink-2 transition-[background,color] duration-150 group",
        open ? "gap-2" : "justify-center gap-0 px-0",
        isActive
          ? "bg-gray-200 dark:bg-[#18191D] text-ink font-semibold"
          : "hover:bg-surface-2 hover:text-ink",
      )}
    >
      {!isEditing ? (
        <Link
          to={`/label/${encodeURIComponent(data.name)}`}
          className="flex items-center gap-2 flex-1 min-w-0 h-full"
        >
          <div className="w-5 h-5 flex justify-center items-center">
            <IconTagFilled size={16} className="shrink-0" />
          </div>
          {open && (
            <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
              {data.name}
            </span>
          )}
        </Link>
      ) : (
        <>
          <div className="w-5 h-5 flex justify-center items-center">
            <IconTagFilled size={16} className="shrink-0" />
          </div>
          <input
            autoFocus
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleEdit();
              if (e.key === "Escape") setIsEditing(false);
            }}
            className="flex-1 border-0 bg-transparent outline-none text-ink-2 text-[14.5px] font-medium p-0 min-w-0 font-[inherit]"
            onClick={(e) => e.stopPropagation()}
          />
        </>
      )}

      {/* Action buttons — not part of the link */}
      {open && (
        <div className="flex-none flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-120 ml-auto">
          {isEditing ? (
            <>
              <button
                type="button"
                className="w-5 h-5 grid place-items-center rounded-[5px] text-ink-3 hover:bg-surface-hi hover:text-ink cursor-pointer transition-[color,background] duration-120"
                title="Save"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
              >
                <IconCheck size={14} />
              </button>
              <button
                type="button"
                className="w-5 h-5 grid place-items-center rounded-[5px] text-ink-3 hover:bg-surface-hi hover:text-ink cursor-pointer transition-[color,background] duration-120"
                title="Cancel"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(false);
                  setEditName(cat.name);
                }}
              >
                <IconX size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="w-5 h-5 grid place-items-center rounded-[5px] text-ink-3 hover:bg-surface-hi hover:text-ink cursor-pointer transition-[color,background] duration-120"
                title="Edit"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsEditing(true);
                }}
              >
                <IconPencil size={14} />
              </button>
              <button
                type="button"
                className="w-5 h-5 grid place-items-center rounded-[5px] text-[oklch(0.68_0.17_25)] hover:bg-[color-mix(in_srgb,oklch(0.68_0.17_25)_14%,transparent)] cursor-pointer transition-[color,background] duration-120"
                title="Remove"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onRemove(cat.id);
                }}
              >
                <IconX size={14} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
