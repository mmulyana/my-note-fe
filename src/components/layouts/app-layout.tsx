import { Sidebar } from "@/components/common/sidebar";
import { Topbar } from "@/components/common/topbar";
import EditorWrapper from "@/components/editor/wrapper";
import { useState } from "react";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-full flex flex-row bg-[--bg]">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Topbar onMobileMenuToggle={() => setMobileOpen((o) => !o)} />
        <main className="flex-1 px-4 lg:px-0 lg:pr-4 py-1 overflow-y-auto min-w-0 transition-[padding-right] duration-200 ease-[ease]">
          <Outlet />
        </main>
      </div>
      <EditorWrapper />
    </div>
  );
}
