import { IconFileFilled } from "@tabler/icons-react";
import { AccountMenu } from "./account-menu";
import { SearchBar } from "./search-bar";
import ToggleTheme from "./toggle-theme";
import { cn } from "@/lib/utils";

type Props = {
  // note: true once content has scrolled past the topbar's height
  scrolled?: boolean;
};

export function Topbar({ scrolled = false }: Props) {
  return (
    <header
      className={cn(
        "absolute inset-x-0 top-0 z-30 flex h-15 flex-none items-center gap-3.5 pl-2 md:pl-2.75 pr-2 justify-between",
        "transition-[background-color,backdrop-filter] duration-200 ease-[ease]",
        scrolled ? "bg-(--bg)/20 backdrop-blur-sm" : "bg-(--bg)",
      )}
    >
      <div className="flex gap-1 items-center flex-nowrap transition-all md:hidden">
        <IconFileFilled className="shrink-0 text-ink" height={24} width={24} />
        <p className="text-sm font-semibold text-nowrap text-ink">My Note</p>
      </div>
      <SearchBar />
      <div className="flex items-center gap-1.5">
        <ToggleTheme />
        <AccountMenu />
      </div>
    </header>
  );
}
