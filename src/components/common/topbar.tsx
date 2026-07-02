import { IconFileFilled } from "@tabler/icons-react";
import { AccountMenu } from "./account-menu";
import ToggleTheme from "./toggle-theme";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-15 flex-none items-center gap-3.5 px-4 bg-transparent">
      <div
        className="flex gap-1 items-center flex-nowrap transition-all md:hidden"
      >
        <IconFileFilled className="shrink-0 text-ink" height={24} width={24} />
        <p className="text-sm font-semibold text-nowrap text-ink">My Note</p>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <ToggleTheme />
        <AccountMenu />
      </div>
    </header>
  );
}
