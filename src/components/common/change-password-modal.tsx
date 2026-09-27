import { useState } from "react";
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
} from "@/components/auth/auth-fields";
import { useApi } from "@/hooks/use-api";
import { urls } from "@/lib/urls";
import type { IApi } from "@/lib/types";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordModal({
  open,
  onOpenChange,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { mutate, isPending, error, reset } = useApi<
    IApi<null>,
    { currentPassword: string; newPassword: string }
  >({
    url: urls.ChangePassword,
    method: "PATCH",
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setCurrentPassword("");
      setNewPassword("");
      reset();
    }
    onOpenChange(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => handleOpenChange(false),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Enter your current password and a new one.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <PasswordField
            label="Current password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
          <PasswordField
            label="New password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
          <FormError message={error?.message} />
          <SubmitButton pending={isPending}>Change password</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
