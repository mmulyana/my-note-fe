import { useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { applyTheme, SYSTEM_DARK_QUERY } from "@/lib/theme";
import type { Theme } from "@/lib/types";

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>("mynote-theme", "dark");

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;

    const mql = window.matchMedia(SYSTEM_DARK_QUERY);
    const onChange = () => applyTheme(theme);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [theme]);

  return [theme, setTheme] as const;
}
