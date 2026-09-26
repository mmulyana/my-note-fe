import { useLocation } from "react-router-dom";
import { useSetAtom } from "jotai";
import { topbarActionsSlotAtom, topbarTitleSlotAtom } from "@/store/topbar";
import { AccountMenu } from "./account-menu";
import ToggleTheme from "./toggle-theme";

export function Topbar() {
  const { pathname } = useLocation();
  const setTitleSlot = useSetAtom(topbarTitleSlotAtom);
  const setActionsSlot = useSetAtom(topbarActionsSlotAtom);
  const isFolderDetail = pathname.startsWith("/folder/");

  return (
    <header className="absolute inset-x-0 top-0 z-30 flex h-[52px] flex-none items-center gap-3.5 max-lg:pl-2 pl-2.75 pr-6.5 max-lg:pr-2 justify-between bg-[linear-gradient(to_bottom,var(--bg)_0%,color-mix(in_oklch,var(--bg)_82%,transparent)_65%,transparent_100%)]">
      {isFolderDetail ? (
        <div ref={setTitleSlot} className="flex min-w-0 items-center gap-1.5" />
      ) : (
        <h1 className="min-w-0 truncate text-[17px] font-semibold text-ink">
          {getPageTitle(pathname)}
        </h1>
      )}
      <div className="flex items-center gap-1.5">
        <div ref={setActionsSlot} className="flex items-center" />
        <ToggleTheme />
        <AccountMenu />
      </div>
    </header>
  );
}

function getPageTitle(pathname: string) {
  if (pathname === "/") return "Notes";
  if (pathname === "/todos") return "Todo";
  if (pathname === "/labels") return "Labels";
  if (pathname === "/folders") return "Folders";
  if (pathname === "/archive") return "Archive";
  if (pathname === "/trash") return "Trash";

  const [, section, value] = pathname.split("/");
  if (section === "label" && value) return decodeURIComponent(value);
  if (section === "note") return "Note";

  return "My Note";
}
