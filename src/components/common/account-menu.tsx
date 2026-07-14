import { useEffect, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import { IconLogout, IconUserCircle } from "@tabler/icons-react";
import { useAuth } from "@/hooks/use-auth";
import { profileAtom } from "@/store/profile";
import { assetUrl } from "@/lib/urls";
import { ProfileModal } from "@/components/common/profile-modal";

export function AccountMenu() {
  const { logout } = useAuth();
  const profile = useAtomValue(profileAtom);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initial = (profile?.email?.[0] ?? "?").toUpperCase();
  const avatarUrl = assetUrl(profile?.photo);

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

  return (
    <div className="relative ml-1" ref={menuRef}>
      <button
        className="grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-(--line) text-sm font-semibold text-(--ink-2) cursor-pointer transition-colors hover:text-ink active:scale-[0.94]"
        title={profile?.username || profile?.email || "Account"}
        onClick={() => setMenuOpen((o) => !o)}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </button>
      {menuOpen && (
        <div className="absolute right-0 top-full z-40 mt-1.5 min-w-40 overflow-hidden rounded-[10px] border border-(--line-2) py-1 shadow-card-lg bg-(--surface)">
          <button
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-ink-2 transition-colors hover:text-ink"
            onClick={() => {
              setMenuOpen(false);
              setProfileOpen(true);
            }}
          >
            <IconUserCircle size={16} />
            Edit Profile
          </button>
          <button
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-ink-2 transition-colors hover:text-ink"
            onClick={() => {
              setMenuOpen(false);
              logout();
            }}
          >
            <IconLogout size={16} />
            Logout
          </button>
        </div>
      )}
      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
}
