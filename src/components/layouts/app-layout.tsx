import { Sidebar } from "@/components/common/sidebar";
import { Tabbar } from "@/components/common/tabbar";
import { Topbar } from "@/components/common/topbar";
import EditorWrapper from "@/components/editor/wrapper";
import { useScrolledPast } from "@/hooks/use-scrolled-past";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  const { setRoot, setSentinel, scrolled } = useScrolledPast<HTMLElement>();

  return (
    <div className="h-full flex flex-row bg-[--bg]">
      <Sidebar />
      <div className="relative flex flex-1 flex-col min-w-0 overflow-hidden">
        <Topbar scrolled={scrolled} />
        <main
          ref={setRoot}
          className="main-layout relative flex-1 px-2 md:px-0 md:pr-4 pt-15 pb-20 md:pb-1 overflow-y-auto min-w-0 transition-[padding-right] duration-200 ease-[ease]"
        >
          {/* note: h-15 matches the topbar, so it leaves view exactly at that scroll depth */}
          <div
            ref={setSentinel}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-15"
          />
          <Outlet />
        </main>
      </div>
      <EditorWrapper />
      <Tabbar />
    </div>
  );
}
