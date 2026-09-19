```tsx
import React, { useState, useEffect } from 'react';
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
  Github,
  Facebook,
  Phone,
  RotateCcw,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { NovaLogo } from './NovaLogo';
import { syncHistoryWithCloud } from '../utils/cloudSync';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  theme: 'dark' | 'light';
  onSuccess: (message: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  theme,
  onSuccess,
}) => {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);

  // Email / Password states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Mobile / Phone OTP states
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [phoneStep, setPhoneStep] = useState<'request' | 'verify'>('request');

  // Loadings and messages
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Sync mode whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
      setInfoMessage(null);
      setPhoneStep('request');
      setOtpCode('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setPhone('');
    setOtpCode('');
    setPhoneStep('request');
    setErrorMessage(null);
    setInfoMessage(null);
  };

  const handleSwitchMode = (newMode: 'login' | 'signup' | 'forgot') => {
    setMode(newMode);
    setErrorMessage(null);
    setInfoMessage(null);
  };

  // GitHub OAuth Sign In
  const handleGitHubSignIn = async () => {
    setErrorMessage(null);
    setInfoMessage(null);
    setGithubLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: unknown) {
      const msg = (err as Error).message || '';

      if (
        msg.toLowerCase().includes('unsupported provider') ||
        msg.toLowerCase().includes('not enabled')
      ) {
        setErrorMessage(
          'GitHub Authentication is not enabled yet in your backend project settings. Please turn on GitHub in your Supabase Auth Providers dashboard, or use Phone Number / Email below.'
        );
      } else {
        setErrorMessage(
          msg || 'Failed to initialize GitHub sign in. Please try again.'
        );
      }

      setGithubLoading(false);
    }
  };

  // Facebook OAuth Sign In
  const handleFacebookSignIn = async () => {
    setErrorMessage(null);
    setInfoMessage(null);
    setFacebookLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: unknown) {
      const msg = (err as Error).message || '';

      if (
        msg.toLowerCase().includes('unsupported provider') ||
        msg.toLowerCase().includes('not enabled')
      ) {
        setErrorMessage(
          'Facebook Login is not enabled yet in your backend project settings. Please enable the Facebook provider in your Supabase Auth Providers dashboard, or use GitHub / Phone / Email below.'
        );
      } else {
        setErrorMessage(
          msg || 'Failed to initialize Facebook sign in. Please try again.'
        );
      }

      setFacebookLoading(false);
    }
  };

  // Mobile Number: Send OTP SMS
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    let cleanPhone = phone.trim().replace(/[\s-()]/g, '');

    if (!cleanPhone) {
      setErrorMessage('Please enter your mobile number.');
      return;
    }

    // Ensure it has country code prefix
    if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+' + cleanPhone;
    }

    if (cleanPhone.length < 8) {
      setErrorMessage(
        'Please enter a valid mobile number with country code (e.g. +1234567890 or +919876543210).'
      );
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithOtp({
        phone: cleanPhone,
      });

      if (error) throw error;

      setPhone(cleanPhone);
      setPhoneStep('verify');

      setInfoMessage(
        `Verification code sent to ${cleanPhone}. Please enter the 6-digit OTP.`
      );

      onSuccess(`OTP sent to ${cleanPhone}`);
    } catch (err: unknown) {
      const msg = (err as Error).message || '';

      if (
        msg.toLowerCase().includes('unsupported provider') ||
        msg.toLowerCase().includes('sms provider') ||
        msg.toLowerCase().includes('not enabled')
      ) {
        setErrorMessage(
          'SMS provider (Twilio / MessageBird) is not configured yet in your backend dashboard. Please configure an SMS provider or use Email / GitHub.'
        );
      } else {
        setErrorMessage(
          msg ||
            'Failed to send OTP to mobile number. Please check the number and try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Mobile Number: Verify OTP
  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const cleanToken = otpCode.trim();

    if (!cleanToken || cleanToken.length < 4) {
      setErrorMessage(
        'Please enter the verification code received via SMS.'
      );
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: cleanToken,
        type: 'sms',
      });

      if (error) throw error;

      if (data.user) {
        try {
          await syncHistoryWithCloud(data.user);
        } catch (syncErr) {
          console.error('Phone login history sync error:', syncErr);
        }
      }

      if (data.session) {
        onSuccess('Mobile number verified! Logged in successfully.');
        resetForm();
        onClose();
      } else {
        onSuccess('Mobile number verified!');
        resetForm();
        onClose();
      }
    } catch (err: unknown) {
      setErrorMessage(
        (err as Error).message ||
          'Invalid or expired verification code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Email & Password Auth Handler
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    // Forgot Password
    if (mode === 'forgot') {
      try {
        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo: window.location.origin,
          }
        );

        if (error) throw error;

        setInfoMessage(
          'Password reset link sent to your email. Please check your inbox.'
        );

        onSuccess('Password reset link sent to your email');
      } catch (err: unknown) {
        setErrorMessage(
          (err as Error).message ||
            'Failed to send password reset email.'
        );
      } finally {
        setLoading(false);
      }

      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    // Sign Up
    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setErrorMessage(
          'Passwords do not match. Please verify and try again.'
        );
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
            console.error('Signup history sync error:', syncErr);
          }
        }

        if (data.session) {
          onSuccess('Account created and logged in successfully!');
          resetForm();
          onClose();
        } else {
          setInfoMessage(
            'Account registered! Please check your email to confirm your account before logging in.'
          );

          onSuccess(
            'Registration successful! Check email for verification.'
          );
        }
      } catch (err: unknown) {
        setErrorMessage(
          (err as Error).message ||
            'Registration failed. Please try again.'
        );
      } finally {
        setLoading(false);
      }

      return;
    }

    // Login mode
    try {
      setLoading(true);

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (error) throw error;

      if (data.user) {
        try {
          await syncHistoryWithCloud(data.user);
        } catch (syncErr) {
          console.error('Login history sync error:', syncErr);
        }
      }

      onSuccess('Welcome back! Successfully logged in.');
      resetForm();
      onClose();
    } catch (err: unknown) {
      setErrorMessage(
        (err as Error).message ||
          'Invalid email or password. Please verify your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 z-10 ${
          theme === 'dark'
            ? 'bg-slate-900/90 border-slate-800 text-slate-100'
            : 'bg-white/95 border-slate-200 text-slate-900'
        }`}
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-5">
          <NovaLogo size="sm" showTagline={false} />

          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-3 text-white">
            {authMethod === 'phone'
              ? 'Mobile Number Sign-In'
              : mode === 'login'
              ? 'Welcome to NOVA QR'
              : mode === 'signup'
              ? 'Create Your Account'
              : 'Reset Password'}
          </h2>

          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            {authMethod === 'phone'
              ? 'Instant verification via mobile SMS OTP.'
              : mode === 'login'
              ? 'Log in to securely sync your QR codes and preferences.'
              : mode === 'signup'
              ? 'Create an account to securely save and access your QR codes anywhere.'
              : 'Enter your email to receive password recovery instructions.'}
          </p>
        </div>

        {/* Social OAuth Buttons: GitHub & Facebook */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleGitHubSignIn}
              disabled={loading || githubLoading || facebookLoading}
              className="py-2.5 px-3 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950/70 hover:bg-slate-900 text-slate-200 hover:text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {githubLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : (
                <Github className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              )}

              <span>GitHub</span>
            </button>

            <button
              type="button"
              onClick={handleFacebookSignIn}
              disabled={loading || githubLoading || facebookLoading}
              className="py-2.5 px-3 rounded-xl border border-slate-800 hover:border-blue-900/60 bg-slate-950/70 hover:bg-blue-950/20 text-slate-200 hover:text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {facebookLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
              ) : (
                <Facebook className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform" />
              )}

              <span>Facebook</span>
            </button>
          </div>

          <div className="relative my-4 flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />

            <span className="bg-slate-900 px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider absolute">
              or continue with
            </span>
          </div>
        </div>

        {/* Primary Method Switcher: Email vs Mobile Number */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('email');
              setErrorMessage(null);
              setInfoMessage(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              authMethod === 'email'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod('phone');
              setErrorMessage(null);
              setInfoMessage(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              authMethod === 'phone'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Mobile No.</span>
          </button>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* FORM 1: Mobile Number */}
        {authMethod === 'phone' && (
          <div>
            {phoneStep === 'request' ? (
              <form
                onSubmit={handleSendPhoneOtp}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Mobile Number (with country code)
                  </label>

                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555 123 4567 or +91 9876543210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none transition bg-slate-950/60 border border-slate-800 text-slate-100 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono"
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Include your country calling code (e.g. +1 for US, +91 for India).
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending SMS Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleVerifyPhoneOtp}
                className="space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Enter 6-Digit SMS OTP
                    </label>

                    <button
                      type="button"
                      onClick={() => setPhoneStep('request')}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 transition cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Change Number</span>
                    </button>
                  </div>

                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

                    <input
                      type="text"
                      maxLength={8}
                      required
                      autoFocus
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition bg-slate-950/60 border border-slate-800 text-slate-100 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono tracking-widest text-center"
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                    Sent to{' '}
                    <span className="font-mono text-cyan-300">
                      {phone}
                    </span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Sign In</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={handleSendPhoneOtp}
                    disabled={loading}
                    className="text-xs text-slate-400 hover:text-cyan-400 transition cursor-pointer disabled:opacity-50"
                  >
                    Didn't receive the code? Resend SMS
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* FORM 2: Email & Password */}
        {authMethod === 'email' && (
          <div>
            {/* Mode Switcher Tabs */}
            {mode !== 'forgot' && (
              <div className="flex items-center p-1 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    mode === 'login'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Log In
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchMode('signup')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            <form
              onSubmit={handleEmailSubmit}
              className="space-y-4"
            >
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name
                  </label>

                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Arpan Goswami"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none transition bg-slate-950/60 border border-slate-800 text-slate-100 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none transition bg-slate-950/60 border border-slate-800 text-slate-100 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Password
                    </label>

                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => handleSwitchMode('forgot')}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none transition bg-slate-950/60 border border-slate-800 text-slate-100 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm Password
                  </label>

                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      placeholder="Repeat your password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none transition bg-slate-950/60 border border-slate-800 text-slate-100 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
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
                      {mode === 'login' && 'Log In with Email'}
                      {mode === 'signup' && 'Create Account'}
                      {mode === 'forgot' && 'Send Recovery Email'}
                    </span>

                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Toggle / Navigation */}
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-center text-xs text-slate-400">
              {mode === 'forgot' ? (
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition cursor-pointer"
                >
                  Back to Log In
                </button>
              ) : mode === 'login' ? (
                <span>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('signup')}
                    className="text-cyan-400 hover:text-cyan-300 font-bold transition cursor-pointer underline underline-offset-2"
                  >
                    Sign Up
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login')}
                    className="text-cyan-400 hover:text-cyan-300 font-bold transition cursor-pointer underline underline-offset-2"
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
```

**After pasting:** save the file, then disable **hCaptcha/CAPTCHA in Supabase Authentication settings**. You can leave `HCaptchaWidget.tsx` for now; it won't be imported by this file anymore.

One more thing: **your resend SMS button calls `handleSendPhoneOtp`, so that's still fine after removing hCaptcha.**
