import { Link } from "react-router-dom";
import { IconFileOff } from "@tabler/icons-react";

export default function NotFoundPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 px-5 text-center text-ink-3 bg-bg">
      <div className="w-18 h-18 rounded-full grid place-items-center bg-surface-2 border border-line text-ink-3 mb-1.5">
        <IconFileOff size={40} />
      </div>
      <div className="text-[17px] font-semibold text-ink-2">Page not found</div>
      <div className="text-sm max-w-75">
        The page you are looking for doesn't exist or has been moved.
      </div>
      <Link
        to="/"
        className="mt-3 inline-flex h-9 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
      >
        Back to home
      </Link>
    </div>
  );
}
