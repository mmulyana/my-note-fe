import { Outlet } from "react-router-dom";
import { useAtomValue } from "jotai";
import { NewNoteFab } from "@/components/common/new-note-fab";
import { NoteModal } from "@/components/editor/note-modal";
import { Sidebar } from "@/components/common/sidebar";
import { EditorSession } from "@/components/editor";
import { Topbar } from "@/components/common/topbar";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { editingDocAtom } from "@/store/document";

export default function AppLayout() {
  const isMobile = useIsMobile();
  const editingDoc = useAtomValue(editingDocAtom);

  return (
    <div className="h-full flex flex-row bg-[--bg]">
      <Sidebar />
      <MainContent />
      {editingDoc && <EditorSession key={editingDoc.id} doc={editingDoc} />}
      {!isMobile && <NoteModal />}
      <NewNoteFab />
    </div>
  );
}

function MainContent() {
  return (
    <div className="relative flex flex-1 flex-col min-w-0 overflow-hidden">
      <Topbar />
      <main className="main-layout relative flex-1 px-2 md:px-0 md:pr-4 pt-15 pb-20 md:pb-1 overflow-y-auto min-w-0 transition-[padding-right] duration-200 ease-[ease]">
        <Outlet />
      </main>
    </div>
  );
}
