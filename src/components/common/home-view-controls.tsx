import { useAtom } from "jotai";
import { ButtonGroup } from "@/components/ui/button-group";
import { homeArrangeAtom, homeViewAtom } from "@/store/home-view";
import { ViewButtons } from "./view-buttons";

export function HomeViewControls() {
  const [view, setView] = useAtom(homeViewAtom);
  const [arranging, setArranging] = useAtom(homeArrangeAtom);

  return (
    <ButtonGroup className="mr-1 rounded-full border border-line-2 bg-surface">
      <ViewButtons
        view={view}
        onViewChange={setView}
        arranging={arranging}
        onArrangingChange={setArranging}
        last
      />
    </ButtonGroup>
  );
}
