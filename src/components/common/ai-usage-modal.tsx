import { IconLoader2 } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApi } from "@/hooks/use-api";
import { urls } from "@/lib/urls";
import type { IApi } from "@/lib/types";

interface AiUsage {
  used: number;
  limit: number;
  remaining: number;
  resetsAt: string;
}

interface AiUsageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatResetsIn(resetsAt: string): string {
  const minutes = Math.max(
    0,
    Math.round((new Date(resetsAt).getTime() - Date.now()) / 60000),
  );
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function AiUsageModal({ open, onOpenChange }: AiUsageModalProps) {
  const { data, isPending, isError, error, refetch } = useApi<IApi<AiUsage>>({
    url: urls.AiUsage,
    queryKey: ["ai-usage"],
    enabled: open,
    staleTime: 0,
  });

  const usage = data?.data;
  const percent = usage
    ? Math.min(100, Math.round((usage.used / usage.limit) * 100))
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Usage</DialogTitle>
          <DialogDescription>
            Daily token allowance for AI writing.
          </DialogDescription>
        </DialogHeader>

        {isPending && (
          <div className="grid place-items-center py-6 text-ink-3">
            <IconLoader2 size={18} className="animate-spin" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-start gap-2 py-2">
            <p className="text-[13px] text-ink-2">
              {error?.message || "Couldn't load usage"}
            </p>
            <button
              type="button"
              className="h-8 px-3 rounded-md text-[13px] font-medium bg-surface-hi text-ink border border-line-2 transition-colors hover:bg-surface-2 cursor-pointer"
              onClick={() => refetch()}
            >
              Retry
            </button>
          </div>
        )}

        {usage && (
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold tabular-nums text-ink">
                {usage.remaining.toLocaleString()}
              </span>
              <span className="text-[13px] text-ink-3">tokens left</span>
            </div>

            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={usage.limit}
              aria-valuenow={usage.used}
              className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
            >
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[12px] text-ink-3">
              <span className="tabular-nums">
                {usage.used.toLocaleString()} of {usage.limit.toLocaleString()}{" "}
                used
              </span>
              <span>Resets in {formatResetsIn(usage.resetsAt)}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
