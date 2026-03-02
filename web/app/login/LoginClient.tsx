// app/login/LoginClient.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Gamepad2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { apiAuthPost, setToken } from "@/components/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

type FormErrors = {
  email?: string;
  password?: string;
  general?: string;
};

export function LoginClient() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error, setError] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    try {
      const savedEmail = localStorage.getItem("remembered_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    try {
      if (rememberMe) {
        timer = setTimeout(() => {
          try {
            if (email) {
              localStorage.setItem("remembered_email", email);
            } else {
              localStorage.removeItem("remembered_email");
            }
          } catch {
            // ignore
          }
        }, 500);
      } else {
        try {
          localStorage.removeItem("remembered_email");
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [rememberMe, email]);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!password || password.length < 6) {
      errs.password = "Password must be at least 6 characters long.";
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({});

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setError(errs);
      return;
    }

    try {
      setLoading(true);

      const data = await apiAuthPost<{
        token: string;
        user: {
          id: number;
          email: string;
          role: string;
          subscription?: any;
        };
      }>("/api/auth/login", { email, password });

      setToken(data.token);
      localStorage.setItem("fgz_user", JSON.stringify(data.user));
      router.replace("/");
    } catch (err) {
      console.error("Login error:", err);
      let errorMessage = "An error occurred. Please try again.";
      if (err instanceof Error) {
        try {
          const errorData = JSON.parse(err.message);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = err.message || errorMessage;
        }
      }
      setError({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "6s", animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "8s", animationDelay: "2s" }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            style={{
              left: `${(i * 5.3) % 100}%`,
              top: `${(i * 7.1) % 100}%`,
              animation: `float ${5 + (i % 10)}s ease-in-out infinite`,
              animationDelay: `${(i % 5)}s`,
            }}
          />
        ))}
      </div>

      <div
        className={`w-full max-w-md relative z-10 transition-all duration-1000 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Card */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />

          <div className="relative bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 mb-4 shadow-lg shadow-blue-500/50 relative group-hover:scale-110 transition-transform duration-500">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <Gamepad2 className="w-10 h-10 text-white relative z-10" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2 animate-gradient">
                Welcome Back
              </h1>
              <p className="text-slate-400 text-sm">
                Sign in to continue your Flacron Gamezone journey
              </p>
            </div>

            {/* General error */}
            {error.general && (
              <div
                className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-4 rounded-xl backdrop-blur-sm animate-shake"
                role="alert"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error.general}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-invalid={Boolean(error.email)}
                    aria-describedby={error.email ? "email-error" : undefined}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:border-slate-600/50"
                  />
                </div>
                {error.email && (
                  <p
                    id="email-error"
                    className="text-sm text-red-400 flex items-center gap-1 animate-slideIn"
                    role="alert"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    aria-invalid={Boolean(error.password)}
                    aria-describedby={error.password ? "password-error" : undefined}
                    className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:border-slate-600/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-400 transition-all duration-300 hover:scale-110"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {error.password && (
                  <p
                    id="password-error"
                    className="text-sm text-red-400 flex items-center gap-1 animate-slideIn"
                    role="alert"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error.password}
                  </p>
                )}
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer group">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-900/50 text-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-0 cursor-pointer transition-all"
                  />
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors select-none">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => handleNavigation("/forgot-password")}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-all duration-300 hover:underline underline-offset-2"
                  aria-label="Forgot password"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center gap-2 py-3 text-white font-semibold">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-gradient-to-b from-slate-800/95 to-slate-900/95 text-slate-500">
                  New to Flacron Gamezone?
                </span>
              </div>
            </div>

            {/* Sign up link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => handleNavigation("/signup")}
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-all duration-300 group"
              >
                <span>Create your account</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-slate-500 mt-6 animate-fadeIn">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-blue-400 hover:text-blue-300 transition-colors" aria-label="Terms of Service">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors" aria-label="Privacy Policy">
            Privacy Policy
          </Link>
        </p>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
        .animate-fadeIn { animation: fadeIn 1s ease-out 0.5s both; }
        .animate-gradient { background-size: 200% auto; animation: gradient 3s ease infinite; }
      `}</style>
    </div>
  );
}