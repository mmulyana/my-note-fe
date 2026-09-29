import { useLocation } from "react-router-dom";
import { useSetAtom } from "jotai";
import { IconMenu2 } from "@tabler/icons-react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import {
  mobileSidebarOpenAtom,
  topbarActionsSlotAtom,
  topbarTitleSlotAtom,
} from "@/store/topbar";
import { AccountMenu } from "./account-menu";
import { HomeViewControls } from "./home-view-controls";

export function Topbar() {
  const { pathname } = useLocation();
  const setTitleSlot = useSetAtom(topbarTitleSlotAtom);
  const setActionsSlot = useSetAtom(topbarActionsSlotAtom);
  const setMobileSidebarOpen = useSetAtom(mobileSidebarOpenAtom);
  const isMobile = useIsMobile();
  const usesTitleSlot =
    pathname.startsWith("/folder/") || pathname.startsWith("/note/");

  return (
    <header className="sticky top-0 z-30 -mx-4 mb-2 flex h-[52px] flex-none items-center gap-3.5 max-lg:h-[64px] max-lg:-mb-1 max-lg:pt-2 justify-between bg-linear-to-b from-bg via-bg/82 via-65% to-transparent px-4">
      <div className="flex min-w-0 items-center gap-1.5">
        {isMobile && (
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open menu"
            className="inline-flex h-8 w-8 max-lg:h-10 max-lg:w-10 flex-none items-center justify-center text-ink-2 transition-[color,transform] duration-150 hover:text-ink active:scale-[0.94] cursor-pointer -ml-2"
          >
            <IconMenu2 size={16} />
          </button>
        )}
        {usesTitleSlot ? (
          <div
            ref={setTitleSlot}
            className="flex min-w-0 items-center gap-1.5"
          />
        ) : (
          <h1 className="min-w-0 truncate text-[17px] font-semibold text-ink">
            {getPageTitle(pathname)}
          </h1>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {pathname === "/" && <HomeViewControls />}
        <div ref={setActionsSlot} className="flex items-center" />
        <AccountMenu />
      </div>
    </header>
  );
}

function getPageTitle(pathname: string) {
  if (pathname === "/") return "Notes";
  if (pathname === "/todos") return "Todo";
  if (pathname === "/folders") return "Folders";
  if (pathname === "/archive") return "Archive";
  if (pathname === "/trash") return "Trash";

  const [, section, value] = pathname.split("/");
  if (section === "label" && value) return decodeURIComponent(value);
  if (section === "note") return "Note";

  return "My Note";
}
