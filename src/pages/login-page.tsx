import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import { useSetAtom } from "jotai";
import { useState } from "react";
import { authTokenAtom } from "@/store/auth";
import { useApi } from "@/hooks/use-api";
import type { AuthData, IApi } from "@/lib/types";
import { setToken } from "@/lib/auth";
import { urls } from "@/lib/urls";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setAuthToken = useSetAtom(authTokenAtom);

  const { mutate } = useApi<
    IApi<AuthData>,
    { email: string; password: string }
  >({
    url: `${urls.Login}`,
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
          navigate("/")
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-100 dark:bg-neutral-950">
      <form
        className="w-full max-w-95 flex flex-col gap-4 p-7 bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-2xl shadow-lg"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-1 mb-1">
          <div className="text-[22px] font-bold text-neutral-900 dark:text-neutral-100">
            Welcome back
          </div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            Sign in to your account to continue.
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">
            Email
          </span>
          <input
            type="email"
            className="w-full py-2.5 px-3 text-sm text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-[10px] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:border-amber-400 focus:shadow-[0_0_0_3px_rgba(232,176,74,0.22)]"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">
            Password
          </span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full py-2.5 px-3 pr-10.5 text-sm text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-[10px] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:border-amber-400 focus:shadow-[0_0_0_3px_rgba(232,176,74,0.22)]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute top-1/2 right-1.5 -translate-y-1/2 inline-flex items-center justify-center w-7.5 h-7.5 border-none bg-transparent text-neutral-400 dark:text-neutral-500 rounded-lg cursor-pointer transition-[color,background] duration-150 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <IconEyeOff size={17} />
              ) : (
                <IconEye size={17} />
              )}
            </button>
          </div>
        </label>

        <button
          type="submit"
          className="mt-1 py-2.75 px-4 text-sm font-bold text-yellow-950 bg-amber-400 border-none rounded-[10px] cursor-pointer transition-[filter] duration-150 hover:brightness-105"
        >
          Sign in
        </button>

        <div className="text-center text-[13px] text-neutral-500 dark:text-neutral-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-amber-500 dark:text-amber-400 font-semibold no-underline hover:underline"
          >
            Register
          </Link>
        </div>
      </form>
    </div>
  );
}
