import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { NovaLogo } from "./NovaLogo";
import { syncHistoryWithCloud } from "../utils/cloudSync";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
  theme: "dark" | "light";
  onSuccess: (message: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "login",
  theme,
  onSuccess,
}) => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(initialMode);

  // Email / Password states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Loadings and messages
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Sync mode whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
      setInfoMessage(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setErrorMessage(null);
    setInfoMessage(null);
  };

  const handleSwitchMode = (newMode: "login" | "signup" | "forgot") => {
    setMode(newMode);
    setErrorMessage(null);
    setInfoMessage(null);
  };

  // Email & Password Auth Handler
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (mode === "forgot") {
      try {
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo: window.location.origin,
          },
        );
        if (error) throw error;
        setInfoMessage(
          "Password reset link sent to your email. Please check your inbox.",
        );
        onSuccess("Password reset link sent to your email");
      } catch (err: unknown) {
        setErrorMessage(
          (err as Error).message || "Failed to send password reset email.",
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (mode === "signup") {
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match. Please verify and try again.");
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim() || undefined,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          try {
            await syncHistoryWithCloud(data.user);
          } catch (syncErr) {
            console.error("Signup history sync error:", syncErr);
          }
        }

        if (data.session) {
          onSuccess("Account created and logged in successfully!");
          resetForm();
          onClose();
        } else {
          setInfoMessage(
            "Account registered! Please check your email to confirm your account before logging in.",
          );
          onSuccess("Registration successful! Check email for verification.");
        }
      } catch (err: unknown) {
        const msg = (err as Error).message || "";
        if (msg.toLowerCase().includes("captcha")) {
          setErrorMessage(
            'hCaptcha protection is not required by this app. If your Supabase project enforces Captcha, please turn off "Enable Captcha protection" in your Supabase Auth dashboard under Authentication -> Bot Protection to permit direct sign-in.',
          );
        } else {
          setErrorMessage(msg || "Registration failed. Please try again.");
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // Login mode
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) throw error;

      if (data.user) {
        try {
          await syncHistoryWithCloud(data.user);
        } catch (syncErr) {
          console.error("Login history sync error:", syncErr);
        }
      }

      onSuccess("Welcome back! Successfully logged in.");
      resetForm();
      onClose();
    } catch (err: unknown) {
      const msg = (err as Error).message || "";
      if (msg.toLowerCase().includes("captcha")) {
        setErrorMessage(
          "hCaptcha is disabled in this application. Please disable Captcha in your Supabase Bot Protection settings to allow password login without captcha tokens.",
        );
      } else {
        setErrorMessage(
          msg || "Invalid email or password. Please verify your credentials.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 z-10 ${
          theme === "dark"
            ? "bg-slate-900/95 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-900 shadow-2xl"
        }`}
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-5 right-5 p-2 rounded-xl transition cursor-pointer ${
            theme === "dark"
              ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          }`}
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-5">
          <NovaLogo size="sm" showTagline={false} />
          <h2
            className={`text-xl sm:text-2xl font-black tracking-tight mt-3 ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}
          >
            {mode === "login"
              ? "Welcome to NOVA QR"
              : mode === "signup"
                ? "Create Your Account"
                : "Reset Password"}
          </h2>
          <p
            className={`text-xs mt-1 max-w-xs font-medium ${
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {mode === "login"
              ? "Log in to securely sync your QR codes and preferences."
              : mode === "signup"
                ? "Create an account to securely save and access your QR codes anywhere."
                : "Enter your email to receive password recovery instructions."}
          </p>
        </div>

        {/* Email-only authentication */}
        <div className="mb-4">
          <div className={`flex items-center justify-center gap-2 text-xs font-semibold ${
            theme === "dark" ? "text-slate-400" : "text-slate-600"
          }`}>
            <Mail className="w-4 h-4 text-cyan-500" />
            <span>Continue with Gmail / Email</span>
          </div>
        </div>

        {/* FORM: Email & Password */}
        {true && (
          <div>
            {/* Mode Switcher Tabs (Login vs Signup) */}
            {mode !== "forgot" && (
              <div
                className={`flex items-center p-1 rounded-xl border mb-4 ${
                  theme === "dark"
                    ? "bg-slate-950/60 border-slate-800/80"
                    : "bg-slate-100 border-slate-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSwitchMode("login")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    mode === "login"
                      ? theme === "dark"
                        ? "bg-slate-800 text-white shadow-xs"
                        : "bg-white text-slate-900 shadow-xs border border-slate-200"
                      : theme === "dark"
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchMode("signup")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    mode === "signup"
                      ? theme === "dark"
                        ? "bg-slate-800 text-white shadow-xs"
                        : "bg-white text-slate-900 shadow-xs border border-slate-200"
                      : theme === "dark"
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 ${
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                        theme === "dark" ? "text-slate-400" : "text-slate-500"
                      }`}
                    />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Arpan Goswami"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none transition ${
                        theme === "dark"
                          ? "bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                          : "bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 shadow-xs"
                      }`}
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                      theme === "dark" ? "text-slate-400" : "text-slate-500"
                    }`}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none transition ${
                      theme === "dark"
                        ? "bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                        : "bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 shadow-xs"
                    }`}
                  />
                </div>
              </div>

              {mode !== "forgot" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      className={`text-xs font-bold ${
                        theme === "dark" ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Password
                    </label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => handleSwitchMode("forgot")}
                        className={`text-[11px] font-semibold transition cursor-pointer ${
                          theme === "dark"
                            ? "text-cyan-400 hover:text-cyan-300"
                            : "text-cyan-700 hover:text-cyan-800"
                        }`}
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                        theme === "dark" ? "text-slate-400" : "text-slate-500"
                      }`}
                    />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none transition ${
                        theme === "dark"
                          ? "bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                          : "bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 shadow-xs"
                      }`}
                    />
                  </div>
                </div>
              )}

              {mode === "signup" && (
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 ${
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <KeyRound
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                        theme === "dark" ? "text-slate-400" : "text-slate-500"
                      }`}
                    />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none transition ${
                        theme === "dark"
                          ? "bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                          : "bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 shadow-xs"
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === "login" && "Log In with Email"}
                      {mode === "signup" && "Create Account"}
                      {mode === "forgot" && "Send Recovery Email"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Toggle / Navigation */}
            <div
              className={`mt-4 pt-3 border-t text-center text-xs ${
                theme === "dark"
                  ? "border-slate-800/60 text-slate-400"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              {mode === "forgot" ? (
                <button
                  type="button"
                  onClick={() => handleSwitchMode("login")}
                  className={`font-bold transition cursor-pointer ${
                    theme === "dark"
                      ? "text-cyan-400 hover:text-cyan-300"
                      : "text-cyan-700 hover:text-cyan-800"
                  }`}
                >
                  Back to Log In
                </button>
              ) : mode === "login" ? (
                <span>
                  Don't have an account yet?{" "}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode("signup")}
                    className={`font-bold transition cursor-pointer underline underline-offset-2 ${
                      theme === "dark"
                        ? "text-cyan-400 hover:text-cyan-300"
                        : "text-cyan-700 hover:text-cyan-800"
                    }`}
                  >
                    Sign Up
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode("login")}
                    className={`font-bold transition cursor-pointer underline underline-offset-2 ${
                      theme === "dark"
                        ? "text-cyan-400 hover:text-cyan-300"
                        : "text-cyan-700 hover:text-cyan-800"
                    }`}
                  >
                    Log In
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
