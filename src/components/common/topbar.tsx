import { useEffect, useRef, useState } from "react";
import type { Theme } from "../../lib/types";
import { useAuth } from "../../hooks/use-auth";
import { useLocalStorage } from "../../hooks/use-local-storage";
import { applyTheme } from "../../lib/theme";
import { IconLogout, IconMenu2, IconMoon, IconSun } from "@tabler/icons-react";

interface TopbarProps {
  onMobileMenuToggle: () => void;
}

export function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const { logout } = useAuth();
  const [theme, setTheme] = useLocalStorage<Theme>("mynote-theme", "dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

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
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border-none bg-transparent text-ink-2 cursor-pointer transition-[background,color,transform] duration-150 hover:text-ink active:scale-[0.94]"
          title="Toggle theme"
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <IconSun size={18} />
          ) : (
            <IconMoon size={18} />
          )}
        </button>
        <div className="relative ml-1" ref={menuRef}>
          <button
            className="grid h-8 w-8 place-items-center rounded-full border border-line font-[JetBrains_Mono,ui-monospace,monospace] text-[13px] font-semibold text-ink-2 cursor-pointer transition-colors hover:text-ink active:scale-[0.94]"
            title="Account"
            onClick={() => setMenuOpen((o) => !o)}
          >
            A
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-40 mt-1.5 min-w-40 overflow-hidden rounded-[10px] border border-line-2 py-1 shadow-card-lg">
              <button
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-ink-2 transition-colors hover:text-ink"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
              >
                <IconLogout size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
