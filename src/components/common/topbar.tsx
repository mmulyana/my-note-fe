
import { IconMenu2 } from "@tabler/icons-react";
import { AccountMenu } from "./account-menu";
import ToggleTheme from "./toggle-theme";

interface TopbarProps {
  onMobileMenuToggle: () => void;
}

export function Topbar({ onMobileMenuToggle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-15 flex-none items-center gap-3.5 px-4 bg-transparent">
      <button
        className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-[10px] text-ink-2 hover:bg-surface-2 hover:text-ink transition-[background,color] duration-150"
        onClick={onMobileMenuToggle}
        aria-label="Open menu"
      >
        <IconMenu2 size={18} />
      </button>
      <div className="ml-auto flex items-center gap-1.5">
        <ToggleTheme />
        <AccountMenu />
      </div>
    </header>
  );
}
