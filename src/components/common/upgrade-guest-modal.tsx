import { useState } from "react";
import { useSetAtom } from "jotai";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FormError,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/components/auth/auth-fields";
import { useApi } from "@/hooks/use-api";
import { profileAtom } from "@/store/profile";
import { urls } from "@/lib/urls";
import type { IApi, ProfileResponse } from "@/lib/types";

interface UpgradeGuestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeGuestModal({
  open,
  onOpenChange,
}: UpgradeGuestModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const setProfile = useSetAtom(profileAtom);

  const { mutate, isPending, error, reset } = useApi<
    IApi<ProfileResponse>,
    { email: string; password: string }
  >({
    url: urls.UpgradeGuest,
    method: "POST",
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setEmail("");
      setPassword("");
      reset();
    }
    onOpenChange(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(
      { email, password },
      {
        onSuccess: (res) => {
          setProfile(res.data);
          handleOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save your account</DialogTitle>
          <DialogDescription>
            Add an email and password to keep your notes and sign in from any
            device.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <PasswordField
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <FormError message={error?.message} />
          <SubmitButton pending={isPending}>Save account</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
