import { Sidebar } from "@/components/common/sidebar";
import { Tabbar } from "@/components/common/tabbar";
import { Topbar } from "@/components/common/topbar";
import EditorWrapper from "@/components/editor/wrapper";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="h-full flex flex-row bg-[--bg]">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 px-4 md:px-0 md:pr-4 py-1 pb-20 md:pb-1 overflow-y-auto min-w-0 transition-[padding-right] duration-200 ease-[ease]">
          <Outlet />
        </main>
      </div>
      <EditorWrapper />
      <Tabbar />
    </div>
  );
}
