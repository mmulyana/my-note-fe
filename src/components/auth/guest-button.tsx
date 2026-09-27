import { useNavigate } from "react-router-dom";
import { useSetAtom } from "jotai";
import { FormError } from "@/components/auth/auth-fields";
import { authTokenAtom } from "@/store/auth";
import { profileAtom } from "@/store/profile";
import { useApi } from "@/hooks/use-api";
import type { AuthData, IApi } from "@/lib/types";
import { setAuthTokens } from "@/lib/auth";
import { urls } from "@/lib/urls";

export function GuestButton() {
  const navigate = useNavigate();
  const setAuthToken = useSetAtom(authTokenAtom);
  const setProfile = useSetAtom(profileAtom);

  const { mutate, isPending, error } = useApi<IApi<AuthData>, void>({
    url: urls.Guest,
    method: "POST",
  });

  const handleClick = () => {
    mutate(undefined, {
      onSuccess: (res) => {
        setAuthTokens({
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
          expiresAt: res.data.expiresAt,
        });
        setAuthToken(res.data.accessToken);
        setProfile({ isGuest: true });
        navigate("/");
      },
    });
  };

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex items-center gap-3 text-[12px] text-ink-3">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>
      <FormError message={error?.message} />
      <button
        type="button"
        disabled={isPending}
        onClick={handleClick}
        className="cursor-pointer rounded-[8px] border border-line-2 bg-surface-hi px-4 py-2.75 text-sm font-medium text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Please wait…" : "Continue as guest"}
      </button>
    </div>
  );
}
