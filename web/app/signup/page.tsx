"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Shield,
  UserPlus,
} from "lucide-react";
import { apiAuthPost, setToken } from "@/components/api";

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  general?: string;
};

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [error, setError] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Calculate password strength
    const password = formData.password;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): FormErrors => {
    const errs: FormErrors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters long.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errs.email = "Please enter a valid email address.";
    }

    if (!formData.password || formData.password.length < 6) {
      errs.password = "Password must be at least 6 characters long.";
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    if (!agreedToTerms) {
      errs.terms = "You must agree to the Terms of Service.";
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
        };
      }>("/api/auth/signup", {
        email: formData.email,
        password: formData.password,
      });

      // Store token using utility function
      setToken(data.token);

      // Store user data
      localStorage.setItem("fgz_user", JSON.stringify(data.user));

      // Redirect to dashboard
      window.location.href = "/";
    } catch (err) {
      console.error("Signup error:", err);

      // Parse error message
      let errorMessage = "Something went wrong. Please try again.";
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
    window.location.href = path;
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 3) return "Medium";
    return "Strong";
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "5s" }}
        ></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "7s", animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "9s", animationDelay: "2s" }}
        ></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div
        className={`w-full max-w-md relative z-10 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Premium card with enhanced aesthetics */}
        <div className="relative group">
          {/* Glow effect on hover */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>

          <div className="relative bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            {/* Logo section with animation */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 mb-4 shadow-lg shadow-purple-500/50 relative group-hover:scale-110 transition-transform duration-500">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400 to-blue-500 blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <UserPlus className="w-10 h-10 text-white relative z-10" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2 animate-gradient">
                Join Flacron Gamezone
              </h1>
              <p className="text-slate-400 text-sm">
                Create your account and start your gaming journey
              </p>
            </div>

            {/* Error message with animation */}
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

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Name field - Note: Backend doesn't store name, but keeping for UX */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-300"
                >
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                    required
                    aria-invalid={Boolean(error.name)}
                    aria-describedby={error.name ? "name-error" : undefined}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 hover:border-slate-600/50"
                  />
                </div>
                {error.name && (
                  <p
                    id="name-error"
                    className="text-sm text-red-400 flex items-center gap-1 animate-slideIn"
                    role="alert"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error.name}
                  </p>
                )}
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-300"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                    required
                    aria-invalid={Boolean(error.email)}
                    aria-describedby={error.email ? "email-error" : undefined}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 hover:border-slate-600/50"
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

              {/* Password field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-300"
                >
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                    required
                    aria-invalid={Boolean(error.password)}
                    aria-describedby={
                      error.password ? "password-error" : undefined
                    }
                    className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 hover:border-slate-600/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-400 transition-all duration-300 hover:scale-110"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Password strength</span>
                      <span
                        className={`font-semibold ${
                          passwordStrength <= 1
                            ? "text-red-400"
                            : passwordStrength <= 3
                              ? "text-yellow-400"
                              : "text-green-400"
                        }`}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full ${getPasswordStrengthColor()} transition-all duration-500 rounded-full`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
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

              {/* Confirm Password field */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-300"
                >
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CheckCircle2 className="w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                    required
                    aria-invalid={Boolean(error.confirmPassword)}
                    aria-describedby={
                      error.confirmPassword
                        ? "confirm-password-error"
                        : undefined
                    }
                    className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 hover:border-slate-600/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-400 transition-all duration-300 hover:scale-110"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {error.confirmPassword && (
                  <p
                    id="confirm-password-error"
                    className="text-sm text-red-400 flex items-center gap-1 animate-slideIn"
                    role="alert"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms checkbox */}
              <div className="space-y-2 pt-2">
                <label
                  htmlFor="terms-checkbox"
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <div className="relative">
                    <input
                      id="terms-checkbox"
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-slate-600 bg-slate-900/50 text-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-0 cursor-pointer transition-all"
                    />
                  </div>
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors select-none">
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => handleNavigation("/terms")}
                      className="text-purple-400 hover:text-purple-300 transition-colors underline underline-offset-2"
                    >
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      onClick={() => handleNavigation("/privacy")}
                      className="text-purple-400 hover:text-purple-300 transition-colors underline underline-offset-2"
                    >
                      Privacy Policy
                    </button>
                  </span>
                </label>
                {error.terms && (
                  <p
                    className="text-sm text-red-400 flex items-center gap-1 ml-7 animate-slideIn"
                    role="alert"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error.terms}
                  </p>
                )}
              </div>

              {/* Signup button */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full group overflow-hidden mt-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl transition-transform duration-300 group-hover:scale-105"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-2 py-3 text-white font-semibold">
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-gradient-to-b from-slate-800/95 to-slate-900/95 text-slate-500">
                  Already a member?
                </span>
              </div>
            </div>

            {/* Login link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => handleNavigation("/login")}
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-purple-400 transition-all duration-300 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Sign in to your account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-slate-500 mt-6 flex items-center justify-center gap-2 animate-fadeIn">
          <Shield className="w-3 h-3" />
          Protected by industry-standard encryption
        </p>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out 0.5s both;
        }

        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
