// note: a native drag can end without `dragend` reaching the page (e.g. a Win+Shift+S screenshot overlay steals it),
// leaving drag visuals stuck. A mouse move can't happen during a native drag, so one after the drag started means it is over.
export function watchNativeDrag(onEnd: () => void): () => void {
  let armed = false;
  const arm = () => {
    armed = true;
  };
  const move = () => {
    if (armed) finish();
  };
  const key = (e: KeyboardEvent) => {
    if (e.key === "Escape") finish();
  };

  const stop = () => {
    document.removeEventListener("drag", arm);
    document.removeEventListener("dragend", finish, true);
    document.removeEventListener("drop", finish, true);
    document.removeEventListener("mousemove", move);
    document.removeEventListener("keydown", key);
  };
  function finish() {
    stop();
    onEnd();
  }

  document.addEventListener("drag", arm);
  document.addEventListener("dragend", finish, true);
  document.addEventListener("drop", finish, true);
  document.addEventListener("mousemove", move);
  document.addEventListener("keydown", key);
  return stop;
}
