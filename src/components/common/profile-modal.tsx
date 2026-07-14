import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useAtom } from "jotai";
import { IconCamera, IconLoader2 } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApi } from "@/hooks/use-api";
import { profileAtom } from "@/store/profile";
import { assetUrl, urls } from "@/lib/urls";
import type { IApi } from "@/lib/types";

interface UploadResponse {
  path: string;
}

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const [profile, setProfile] = useAtom(profileAtom);
  const [username, setUsername] = useState(profile?.username ?? "");
  const [photo, setPhoto] = useState<string | null>(profile?.photo ?? null);
  const [preview, setPreview] = useState<string | undefined>(
    assetUrl(profile?.photo),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setUsername(profile?.username ?? "");
    setPhoto(profile?.photo ?? null);
    setPreview(assetUrl(profile?.photo));
    // Only resync when the modal opens, not on every profile change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const { mutate: upload, isPending: uploading } = useApi<
    IApi<UploadResponse>,
    FormData
  >({
    url: urls.Uploads,
    method: "POST",
  });

  const { mutate: updateProfile, isPending: saving } = useApi<
    IApi<{ username: string | null; photo: string | null }>,
    { username?: string; photo?: string | null }
  >({
    url: urls.Profile,
    method: "PATCH",
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("location", "avatars");

    upload(formData, {
      onSuccess: (res) => {
        setPhoto(res.data.path);
        setPreview(assetUrl(res.data.path));
        URL.revokeObjectURL(objectUrl);
      },
      onError: () => {
        URL.revokeObjectURL(objectUrl);
        setPreview(assetUrl(profile?.photo));
      },
    });
  };

  const handleSave = () => {
    const trimmed = username.trim();
    const body: { username?: string; photo?: string | null } = {};
    if (trimmed !== (profile?.username ?? "")) body.username = trimmed;
    if (photo !== (profile?.photo ?? null)) body.photo = photo;

    if (Object.keys(body).length === 0) {
      onOpenChange(false);
      return;
    }

    updateProfile(body, {
      onSuccess: () => {
        setProfile({
          email: profile?.email ?? "",
          username: trimmed || null,
          photo,
        });
        onOpenChange(false);
      },
    });
  };

  const initial = (profile?.email?.[0] ?? "?").toUpperCase();
  const busy = uploading || saving;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-2 py-1">
          <button
            type="button"
            className="group relative grid h-20 w-20 place-items-center overflow-hidden rounded-full border border-(--line-2) bg-(--surface-2) text-2xl font-semibold text-(--ink-2) cursor-pointer disabled:cursor-not-allowed"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {preview ? (
              <img
                src={preview}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              initial
            )}
            <span className="absolute inset-0 grid place-items-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              {uploading ? (
                <IconLoader2 size={18} className="animate-spin text-white" />
              ) : (
                <IconCamera size={18} className="text-white" />
              )}
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <span className="text-[11px] text-(--ink-3)">
            Klik foto untuk mengganti
          </span>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-(--ink-2)">
            Username
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="text-[13px] font-[inherit] text-(--ink) bg-(--surface-2) border border-(--line) rounded-[8px] px-3 py-2 outline-none focus:border-accent"
          />
        </label>

        <DialogFooter>
          <button
            type="button"
            className="h-8 px-3 rounded-md text-[13px] font-medium text-(--ink-2) transition-colors hover:text-(--ink) cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </button>
          <button
            type="button"
            disabled={busy}
            className="h-8 px-3.5 rounded-md text-[13px] font-medium bg-(--surface-hi) text-(--ink) border border-(--line-2) transition-colors hover:bg-(--surface-2) disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            onClick={handleSave}
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
