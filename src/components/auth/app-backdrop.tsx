import { cn } from "@/lib/utils";

export function AppBackdrop() {
  return (
    <div
      aria-hidden
      inert
      className="pointer-events-none absolute inset-0 select-none overflow-hidden"
    >
      <div className="h-full w-full origin-center blur-[2px]">
        <div className="flex h-full flex-row">
          <MockSidebar />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="backdrop-drift min-w-0 shrink-0 px-2 pr-4">
              <CardGrid />
              <CardGrid />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-(--bg)/45" />
      <div className="absolute inset-0 bg-[radial-gradient(115%_85%_at_50%_45%,transparent_0%,var(--bg)_100%)] opacity-70" />
    </div>
  );
}

function Bar({
  w,
  className,
}: {
  w: string;
  className?: string;
}) {
  return <div className={cn("h-2.5 rounded-full bg-ink/10", w, className)} />;
}

function MockSidebar() {
  return (
    <nav className="hidden h-full w-64 shrink-0 flex-col p-3.5 md:flex">
      <div className="flex w-full items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-md bg-ink/15" />
          <Bar w="w-16" />
        </div>
        <div className="h-5 w-5 rounded-md bg-ink/10" />
      </div>

      <div className="mt-4 flex flex-col gap-1">
        {navRows.map(({ w, active }, i) => (
          <div
            key={i}
            className={cn(
              "flex h-8 items-center gap-2 rounded-md px-2",
              active && "bg-surface-2",
            )}
          >
            <div className="h-4.5 w-4.5 shrink-0 rounded bg-ink/10" />
            <Bar w={w} />
          </div>
        ))}
      </div>

      <MockSection widths={["w-14", "w-20", "w-16"]} />
      <MockSection widths={["w-24", "w-14", "w-18"]} />
    </nav>
  );
}

function MockSection({ widths }: { widths: string[] }) {
  return (
    <div className="mt-5 flex flex-col gap-1">
      <Bar w="w-12" className="mx-2 mb-1 h-2" />
      {widths.map((w, i) => (
        <div key={i} className="flex h-8 items-center gap-2 px-2">
          <div className="h-4 w-4 shrink-0 rounded bg-ink/10" />
          <Bar w={w} />
        </div>
      ))}
    </div>
  );
}

function CardGrid() {
  return (
    <div className="masonry grid-view min-w-0">
      {cards.map((card, i) => (
        <MockCard key={i} {...card} />
      ))}
    </div>
  );
}

interface MockCardProps {
  lines: string[];
  title?: boolean;
  folder?: boolean;
  footer?: boolean;
}

function MockCard({ lines, title, folder, footer }: MockCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[14px] border border-line bg-surface">
      <div className="flex items-center justify-between px-3 pt-3.5">
        {folder ? <Bar w="w-12" className="h-2" /> : <span />}
        <Bar w="w-14" className="h-2" />
      </div>

      <div className="min-h-0 flex-1 space-y-2.5 overflow-hidden px-3 pt-3.5 pb-1 mask-[linear-gradient(to_bottom,black_78%,transparent)]">
        {title && <Bar w="w-3/4" className="mb-4 h-3.5 bg-ink/20" />}
        {lines.map((w, i) => (
          <Bar key={i} w={w} />
        ))}
      </div>

      {footer && (
        <div className="flex shrink-0 items-center gap-1.5 bg-linear-to-b from-transparent via-surface via-60% to-surface px-3 pt-1.5 pb-3">
          <div className="h-5 w-11 rounded-full border border-line" />
          <div className="h-5 w-14 rounded-full border border-line" />
        </div>
      )}
    </article>
  );
}

const navRows = [
  { w: "w-10", active: false },
  { w: "w-20", active: true },
  { w: "w-12", active: false },
  { w: "w-16", active: false },
];

const cards: MockCardProps[] = [
  { title: true, folder: true, lines: ["w-full", "w-11/12", "w-2/3"] },
  { title: true, lines: ["w-full", "w-4/5", "w-full", "w-1/2"], footer: true },
  { folder: true, lines: ["w-full", "w-3/4", "w-5/6", "w-2/5"] },
  { title: true, lines: ["w-5/6", "w-full", "w-3/5"] },
  { lines: ["w-full", "w-full", "w-4/5", "w-1/2"], footer: true },
  { title: true, folder: true, lines: ["w-full", "w-2/3"] },
  { lines: ["w-11/12", "w-full", "w-3/4", "w-3/5", "w-1/3"] },
  { title: true, lines: ["w-full", "w-5/6", "w-1/2"], footer: true },
  { folder: true, lines: ["w-full", "w-4/5", "w-full", "w-2/3"] },
  { title: true, lines: ["w-3/4", "w-full", "w-5/6", "w-2/5"] },
  { lines: ["w-full", "w-1/2"], footer: true },
  { title: true, folder: true, lines: ["w-full", "w-11/12", "w-3/5", "w-1/3"] },
  { lines: ["w-5/6", "w-full", "w-2/3"] },
  { title: true, lines: ["w-full", "w-4/5", "w-1/2"], footer: true },
  { folder: true, lines: ["w-full", "w-3/4", "w-full", "w-2/5"] },
  { title: true, lines: ["w-2/3", "w-full", "w-5/6"] },
  { lines: ["w-full", "w-11/12", "w-1/2"], footer: true },
  { title: true, folder: true, lines: ["w-full", "w-4/5", "w-3/5"] },
];
