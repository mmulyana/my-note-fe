import { IconFileFilled } from "@tabler/icons-react";
import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { AppBackdrop } from "./app-backdrop";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/login", label: "Sign in" },
  { to: "/register", label: "Sign up" },
] as const;

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="relative h-full min-h-screen overflow-hidden bg-(--bg)">
      <AppBackdrop />

      <div className="relative flex min-h-screen items-center justify-center p-5">
        <div className="w-full max-w-100 rounded-3xl border border-line bg-surface p-7 shadow-(--shadow-lg)">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-line bg-surface-2 text-ink">
              <IconFileFilled size={22} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-ink">{title}</h1>
              <p className="mt-1 text-[13px] text-ink-2">{subtitle}</p>
            </div>
          </div>

          <div className="mt-6 flex rounded-full bg-(--bg-2) p-1">
            {tabs.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex-1 rounded-full py-1.5 text-center text-[13px] font-medium no-underline transition-[background,color] duration-150",
                    isActive
                      ? "border border-line bg-surface font-semibold text-ink shadow-(--shadow)"
                      : "border border-transparent text-ink-2 hover:text-ink",
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
