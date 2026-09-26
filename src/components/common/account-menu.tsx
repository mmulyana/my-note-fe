import { useEffect, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import {
  IconDeviceDesktop,
  IconLogout,
  IconMessageReport,
  IconMoon,
  IconSun,
  IconUserCircle,
} from "@tabler/icons-react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { profileAtom } from "@/store/profile";
import { assetUrl } from "@/lib/urls";
import type { Theme } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SparklesIcon } from "@/components/icons";
import { ProfileModal } from "@/components/common/profile-modal";
import { AiUsageModal } from "@/components/common/ai-usage-modal";
import { FeedbackModal } from "@/components/common/feedback-modal";

const ITEM =
  "flex w-full items-center gap-2.5 px-3 py-2 max-md:py-3 text-left text-[13px] max-md:text-sm text-ink-2 transition-colors hover:text-ink cursor-pointer";
const ICON = "size-4 max-md:size-[18px]";

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof IconMoon }[] =
  [
    { value: "dark", label: "Dark", icon: IconMoon },
    { value: "light", label: "Light", icon: IconSun },
    { value: "system", label: "System", icon: IconDeviceDesktop },
  ];

function Avatar({
  url,
  initial,
  className,
}: {
  url?: string;
  initial: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid flex-none place-items-center overflow-hidden rounded-full border border-line font-semibold text-ink-2",
        className,
      )}
    >
      {url ? (
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </span>
  );
}

function Divider() {
  return <div className="h-px bg-line" />;
}

export function AccountMenu() {
  const { logout } = useAuth();
  const profile = useAtomValue(profileAtom);
  const [theme, setTheme] = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [usageOpen, setUsageOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const email = profile?.email ?? "";
  const initial = (email[0] ?? "?").toUpperCase();
  const avatarUrl = assetUrl(profile?.photo);
  const displayName = profile?.username || email.split("@")[0] || "Account";

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const openFrom = (open: (value: boolean) => void) => () => {
    setMenuOpen(false);
    open(true);
  };

  return (
    <div className="relative ml-1" ref={menuRef}>
      <button
        className="cursor-pointer rounded-full transition-colors hover:text-ink active:scale-[0.94]"
        title={profile?.username || email || "Account"}
        onClick={() => setMenuOpen((o) => !o)}
      >
        <Avatar
          url={avatarUrl}
          initial={initial}
          className="h-8 w-8 text-sm max-md:h-10 max-md:w-10 max-md:text-base"
        />
      </button>
      {menuOpen && (
        <div className="absolute right-0 top-full z-40 mt-1.5 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-line-2 bg-surface shadow-card-lg">
          <div className="flex items-center gap-2.5 px-3 py-3">
            <Avatar url={avatarUrl} initial={initial} className="size-9 text-sm" />
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-ink">
                {displayName}
              </div>
              {email && (
                <div className="truncate text-[12px] text-ink-3">{email}</div>
              )}
            </div>
          </div>

          <Divider />

          <div className="py-1">
            <button className={ITEM} onClick={openFrom(setProfileOpen)}>
              <IconUserCircle className={ICON} />
              Profile
            </button>
            <button className={ITEM} onClick={openFrom(setUsageOpen)}>
              <SparklesIcon gradient={false} className={ICON} />
              AI Usage
            </button>
            <button className={ITEM} onClick={openFrom(setFeedbackOpen)}>
              <IconMessageReport className={ICON} />
              Send Feedback
            </button>
          </div>

          <Divider />

          <div className="py-1">
            <button
              className={ITEM}
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
            >
              <IconLogout className={ICON} />
              Logout
            </button>
          </div>

          <Divider />

          <div className="grid grid-cols-3 gap-1 p-1.5">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                title={label}
                aria-label={label}
                aria-pressed={theme === value}
                className={cn(
                  "grid h-8 max-md:h-10 cursor-pointer place-items-center rounded-md border transition-colors",
                  theme === value
                    ? "border-line-2 bg-surface-hi text-ink"
                    : "border-transparent text-ink-3 hover:text-ink",
                )}
                onClick={() => setTheme(value)}
              >
                <Icon className={ICON} />
              </button>
            ))}
          </div>
        </div>
      )}
      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
      <AiUsageModal open={usageOpen} onOpenChange={setUsageOpen} />
      <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  );
}
