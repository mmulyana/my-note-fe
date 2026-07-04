import { IconMoon, IconSun } from "@tabler/icons-react";
import { useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { applyTheme } from "@/lib/theme";
import type { Theme } from "@/lib/types";


export default function ToggleTheme() {
    const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
    const [theme, setTheme] = useLocalStorage<Theme>("mynote-theme", "dark");

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    return (
        <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] border-none bg-transparent text-ink-2 cursor-pointer transition-[background,color,transform] duration-150 hover:text-ink active:scale-[0.94]"
            title="Toggle theme"
            onClick={toggleTheme}
        >
            {theme === "dark" ? (
                <IconSun size={18} />
            ) : (
                <IconMoon size={18} />
            )}
        </button>
    )
}