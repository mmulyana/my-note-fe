import { IconSearch, IconX } from "@tabler/icons-react";
import { useAtom } from "jotai";
import { searchQueryAtom } from "@/store/search";

export function SearchBar() {
  const [query, setQuery] = useAtom(searchQueryAtom);

  return (
    <div className="relative min-w-0 flex-1 max-w-60">
      <IconSearch
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--ink-3)"
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && setQuery("")}
        placeholder="Cari catatan…"
        aria-label="Cari catatan"
        className="h-8 w-full rounded-[10px] border border-(--line) bg-(--surface) pl-9 pr-9 text-sm text-(--ink) placeholder:text-(--ink-3) outline-none transition-[border-color,box-shadow] duration-150"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          aria-label="Bersihkan pencarian"
          className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center h-6 w-6 rounded-md text-(--ink-3) transition-colors hover:text-(--ink) hover:bg-(--surface-2)"
        >
          <IconX size={15} />
        </button>
      )}
    </div>
  );
}
