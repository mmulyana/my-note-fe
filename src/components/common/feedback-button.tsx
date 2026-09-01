import { useState } from "react";
import {
  IconMessageReport,
  IconStarFilled,
  IconLoader2,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useApi } from "@/hooks/use-api";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import type { FeedbackPayload, FeedbackResponse, FeedbackType, IApi } from "@/lib/types";

const TYPE_OPTIONS: { value: FeedbackType; label: string }[] = [
  { value: "report", label: "Report bug" },
  { value: "feature_request", label: "Feature request" },
  { value: "feedback", label: "Feedback" },
];

export function FeedbackButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        className="fixed right-4 bottom-18 md:right-6 md:bottom-6 z-40 grid h-9 w-9 md:h-11 md:w-11 place-items-center rounded-full bg-ink text-surface shadow-(--shadow-lg) transition-transform duration-150 active:scale-95 cursor-pointer"
      >
        <IconMessageReport size={18} className="shrink-0" />
      </button>
      <FeedbackModal open={open} onOpenChange={setOpen} />
    </>
  );
}

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const [type, setType] = useState<FeedbackType>("feedback");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(0);
  const [sent, setSent] = useState(false);

  const { mutate: sendFeedback, isPending, error } = useApi<
    IApi<FeedbackResponse>,
    FeedbackPayload
  >({
    url: urls.Feedback,
    method: "POST",
  });

  const reset = () => {
    setType("feedback");
    setTitle("");
    setDescription("");
    setRating(0);
    setSent(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    sendFeedback(
      {
        type,
        title: trimmed,
        description: description.trim(),
        ...(type === "feedback" && rating > 0 ? { customFields: { rating } } : {}),
      },
      {
        onSuccess: () => setSent(true),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send feedback</DialogTitle>
          <DialogDescription>
            Report a bug, suggest a feature, or share what you think.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <p className="text-[13px] font-medium text-(--ink)">Thanks — got it.</p>
            <button
              type="button"
              className="h-8 px-3.5 rounded-md text-[13px] font-medium bg-(--surface-hi) text-(--ink) border border-(--line-2) transition-colors hover:bg-(--surface-2) cursor-pointer"
              onClick={() => handleOpenChange(false)}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-1.5 rounded-lg bg-surface-2 p-1">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={cn(
                    "flex-1 h-7 rounded-md text-[12px] font-medium transition-colors cursor-pointer",
                    type === opt.value
                      ? "bg-(--surface) text-(--ink) shadow-sm"
                      : "text-(--ink-3) hover:text-(--ink-2)",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-(--ink-2)">Title</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short summary"
                className="text-[13px] font-[inherit] text-(--ink) bg-(--surface-2) border border-(--line) rounded-[8px] px-3 py-2 outline-none focus:border-accent"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-(--ink-2)">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details (optional)"
                rows={3}
                className="text-[13px] font-[inherit] text-(--ink) bg-(--surface-2) border border-(--line) rounded-[8px] px-3 py-2 outline-none focus:border-accent resize-none"
              />
            </label>

            {type === "feedback" && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-(--ink-2)">Rating</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n === rating ? 0 : n)}
                      aria-label={`${n} star`}
                      className="cursor-pointer text-(--ink-3) hover:text-(--ink-2)"
                    >
                      <IconStarFilled
                        size={20}
                        className={n <= rating ? "text-yellow-400" : undefined}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p className="text-[12px] text-red-500">
                Failed to send feedback. Please try again.
              </p>
            )}

            <DialogFooter>
              <button
                type="button"
                className="h-8 px-3 rounded-md text-[13px] font-medium text-(--ink-2) transition-colors hover:text-(--ink) cursor-pointer"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending || !title.trim()}
                className="h-8 px-3.5 rounded-md text-[13px] font-medium bg-(--surface-hi) text-(--ink) border border-(--line-2) transition-colors hover:bg-(--surface-2) disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                onClick={handleSubmit}
              >
                {isPending ? (
                  <IconLoader2 size={14} className="animate-spin" />
                ) : (
                  "Send"
                )}
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
