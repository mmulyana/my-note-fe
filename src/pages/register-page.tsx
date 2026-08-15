import { useNavigate } from "react-router-dom";
import { useSetAtom } from "jotai";
import { useState } from "react";
import {
  PasswordField,
  SubmitButton,
  FormError,
  TextField,
} from "@/components/auth/auth-fields";
import { AuthShell } from "@/components/auth/auth-shell";
import { authTokenAtom } from "@/store/auth";
import { profileAtom } from "@/store/profile";
import { useApi } from "@/hooks/use-api";
import type { AuthData, IApi } from "@/lib/types";
import { setToken } from "@/lib/auth";
import { urls } from "@/lib/urls";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const setAuthToken = useSetAtom(authTokenAtom);
  const setProfile = useSetAtom(profileAtom);

  const { mutate, isPending, error } = useApi<
    IApi<AuthData>,
    { email: string; password: string }
  >({
    url: `${urls.Register}`,
    method: "POST",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(
      { email, password },
      {
        onSuccess: (res) => {
          setToken(res.data.accessToken, res.data.expiresAt);
          setAuthToken(res.data.accessToken);
          setProfile({ email: res.data.email });
          navigate("/");
        },
      },
    );
  };

  return (
    <AuthShell
      title="Create an account"
      subtitle="Sign up to start taking notes."
    >
      <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
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
        <SubmitButton pending={isPending}>Create account</SubmitButton>
      </form>
    </AuthShell>
  );
}
