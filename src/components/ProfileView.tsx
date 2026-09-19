import React, { useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import {
  User,
  Mail,
  Phone,
  Github,
  Facebook,
  KeyRound,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Download,
  Edit3,
  Save,
  LogOut,
  Eye,
  EyeOff,
  QrCode,
  Star,
  Clock,
  Send,
  Briefcase,
  TrendingUp,
  Sparkles,
  Smartphone,
  Link2,
  Trash2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { QRHistoryItem, NavTab, BrandKit } from '../types';
import { getStoredBrandKits, deleteBrandKit } from '../utils/brandStorage';
import { getStoredDynamicQRs } from '../utils/dynamicQRStorage';

interface ProfileViewProps {
  user: SupabaseUser | null;
  historyItems: QRHistoryItem[];
  theme: 'dark' | 'light';
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onSignOut: () => Promise<void>;
  onAddToast: (title: string, description?: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  onNavigateToTab: (tab: NavTab) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  historyItems,
  theme,
  onOpenAuth,
  onSignOut,
  onAddToast,
  onNavigateToTab,
}) => {
  // Brand kits state
  const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
  const [dynamicQRsCount, setDynamicQRsCount] = useState(0);

  useEffect(() => {
    setBrandKits(getStoredBrandKits());
    setDynamicQRsCount(getStoredDynamicQRs().length);
  }, []);

  const handleDeleteBrandKit = (id: string, name: string) => {
    const updated = deleteBrandKit(id);
    setBrandKits(updated);
    onAddToast('Brand Kit Removed', `Deleted profile "${name}".`, 'info');
  };
  // Display name editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.full_name || user?.user_metadata?.user_name || ''
  );
  const [savingName, setSavingName] = useState(false);

  // Password Update states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Password Reset Email states
  const [sendingResetEmail, setSendingResetEmail] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Styling helpers
  const cardClass = `p-6 sm:p-7 rounded-3xl border transition-all ${
    theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
  }`;

  const favoritesCount = historyItems.filter((i) => i.isFavorite).length;
  const historyCount = historyItems.length;

  // Compute provider name
  const provider = user?.app_metadata?.provider || (user?.phone ? 'phone' : 'email');
  const userInitials = (
    user?.user_metadata?.full_name ||
    user?.user_metadata?.user_name ||
    user?.email?.split('@')[0] ||
    user?.phone ||
    'U'
  )
    .slice(0, 2)
    .toUpperCase();

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Moderate', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  // Handle display name update
  const handleSaveDisplayName = async () => {
    if (!displayName.trim()) {
      onAddToast('Validation Error', 'Display name cannot be empty', 'warning');
      return;
    }

    try {
      setSavingName(true);
      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName.trim() },
      });

      if (error) throw error;

      setIsEditingName(false);
      onAddToast('Profile Updated', 'Your display name has been updated', 'success');
    } catch (err: unknown) {
      onAddToast('Update Failed', (err as Error).message || 'Could not update name', 'error');
    } finally {
      setSavingName(false);
    }
  };

  // Handle password change directly
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    try {
      setUpdatingPassword(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordSuccess('Your password has been changed successfully!');
      onAddToast('Security Alert', 'Your account password has been updated', 'success');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setPasswordError((err as Error).message || 'Failed to update password. Please try again.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Handle email reset link request
  const handleSendResetEmail = async () => {
    if (!user?.email) {
      onAddToast('Not Applicable', 'This account has no email associated for reset links', 'warning');
      return;
    }

    try {
      setSendingResetEmail(true);
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: window.location.origin,
      });

      if (error) throw error;

      setResetEmailSent(true);
      onAddToast('Email Sent', `Password reset instructions sent to ${user.email}`, 'success');
    } catch (err: unknown) {
      onAddToast('Reset Error', (err as Error).message || 'Failed to send reset email', 'error');
    } finally {
      setSendingResetEmail(false);
    }
  };

  // Export account data (History + Favorites + Profile Metadata)
  const handleExportAccountData = () => {
    const dataToExport = {
      profile: {
        id: user?.id,
        email: user?.email,
        phone: user?.phone,
        provider,
        createdAt: user?.created_at,
        fullName: user?.user_metadata?.full_name || displayName,
      },
      exportTimestamp: new Date().toISOString(),
      statistics: {
        totalHistoryItems: historyCount,
        totalFavorites: favoritesCount,
      },
      history: historyItems,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nova_qr_account_export_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);

    onAddToast('Export Complete', 'Your account and QR data backup has been downloaded', 'success');
  };

  // 1. Guest / Logged Out View
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-white flex items-center justify-center sm:justify-start gap-3">
            <User className="w-8 h-8 text-cyan-400" />
            <span>Account Profile</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Sign in to manage your profile, security settings, and password options.
          </p>
        </div>

        <div className={`${cardClass} text-center py-12 px-6 sm:px-12`}>
          <div className="w-20 h-20 mx-auto rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 shadow-xl shadow-cyan-500/5">
            <Lock className="w-10 h-10" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">You are currently in Guest Mode</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-8">
            Create an account or log in with GitHub, Mobile Number, or Email to unlock cloud sync, profile customization, and password security.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
            <button
              onClick={() => onOpenAuth('login')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition cursor-pointer"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated Profile View
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Page Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <User className="w-8 h-8 text-cyan-400" />
          <span>Profile & Security</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your personal identity, login credentials, and account security.
        </p>
      </div>

      {/* 1. Identity & Profile Hero Card */}
      <div className={cardClass}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            {/* Avatar */}
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Avatar"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-400/40 shadow-lg shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-cyan-500/20 shrink-0">
                {userInitials}
              </div>
            )}

            {/* User Meta */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your name"
                      className="px-3 py-1 text-sm rounded-lg bg-slate-950 border border-cyan-400 text-white outline-none"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveDisplayName}
                      disabled={savingName}
                      className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition cursor-pointer"
                      title="Save Name"
                    >
                      {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="text-xs text-slate-400 hover:text-white px-2"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      {user.user_metadata?.full_name || displayName || 'Account Holder'}
                    </h2>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1 rounded-md text-slate-400 hover:text-cyan-400 transition cursor-pointer"
                      title="Edit Display Name"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>

              {/* Email / Phone identifier */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-mono">
                {user.email && (
                  <span className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    {user.email}
                  </span>
                )}
                {user.phone && (
                  <span className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    {user.phone}
                  </span>
                )}
                {provider === 'github' && (
                  <span className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
                    <Github className="w-3.5 h-3.5 text-purple-400" />
                    GitHub Auth
                  </span>
                )}
                {provider === 'facebook' && (
                  <span className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-blue-900/60 text-blue-300">
                    <Facebook className="w-3.5 h-3.5 text-blue-400" />
                    Facebook Auth
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Member since{' '}
                  {new Date(user.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex sm:flex-col gap-2 shrink-0 justify-end">
            <button
              onClick={handleExportAccountData}
              className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition cursor-pointer"
              title="Download your QR data backup"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Data</span>
            </button>
            <button
              onClick={onSignOut}
              className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Usage & Cloud Activity Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => onNavigateToTab('generator')}
          className={`${cardClass} p-4 cursor-pointer hover:border-cyan-500/40 transition group`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Generator
            </span>
            <QrCode className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-xl font-black text-white">Create</div>
          <p className="text-[10px] text-slate-400 mt-0.5">10+ categories</p>
        </div>

        <div
          onClick={() => onNavigateToTab('history')}
          className={`${cardClass} p-4 cursor-pointer hover:border-cyan-500/40 transition group`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              History
            </span>
            <Clock className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-xl font-black text-white">{historyCount}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Saved codes</p>
        </div>

        <div
          onClick={() => onNavigateToTab('favorites')}
          className={`${cardClass} p-4 cursor-pointer hover:border-amber-500/40 transition group`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Favorites
            </span>
            <Star className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-xl font-black text-white">{favoritesCount}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Starred codes</p>
        </div>

        <div
          onClick={() => onNavigateToTab('dynamic')}
          className={`${cardClass} p-4 cursor-pointer hover:border-emerald-500/40 transition group`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Dynamic QRs
            </span>
            <Link2 className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-xl font-black text-white">{dynamicQRsCount}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Editable targets</p>
        </div>

        <div
          onClick={() => onNavigateToTab('analytics')}
          className={`${cardClass} p-4 cursor-pointer hover:border-purple-500/40 transition group`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Analytics
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-xl font-black text-white">Live</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Scan telemetry</p>
        </div>

        <div
          onClick={() => onNavigateToTab('bio')}
          className={`${cardClass} p-4 cursor-pointer hover:border-pink-500/40 transition group`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Link-in-Bio
            </span>
            <Smartphone className="w-3.5 h-3.5 text-pink-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-xl font-black text-white">Page</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Digital vCard</p>
        </div>
      </div>

      {/* Brand Profiles & Logo Library */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            <span>Brand Kit & Logo Profiles</span>
          </div>
          <button
            onClick={() => onNavigateToTab('generator')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
          >
            Customize in Generator →
          </button>
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Saved Design Presets & Brand Kits</h3>
        <p className="text-xs text-slate-400 mb-4">
          Reusable palettes, dot styles, and center logos synced for your QR campaigns.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {brandKits.map((kit) => (
            <div
              key={kit.id}
              className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex -space-x-1.5 shrink-0">
                  <div
                    className="w-5 h-5 rounded-full border border-white/20 shadow-xs"
                    style={{ backgroundColor: kit.dotColor }}
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-white/20 shadow-xs"
                    style={{ backgroundColor: kit.cornerSquareColor }}
                  />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">{kit.name}</p>
                  <p className="text-[10px] text-slate-400">
                    Pattern: {kit.dotType} • Frame: {kit.cornerSquareType}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDeleteBrandKit(kit.id, kit.name)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition cursor-pointer shrink-0"
                title="Delete Brand Kit"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Password & Security Management */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-2">
          <KeyRound className="w-4 h-4" />
          <span>Security & Credentials</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Update Your Password</h3>
        <p className="text-xs text-slate-400 mb-6">
          Change your account login password directly below, or send a reset link to your registered email.
        </p>

        {/* Feedback alerts */}
        {passwordError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm outline-none transition bg-slate-950/60 border border-slate-800 text-slate-100 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength meter bar */}
            {newPassword && (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'
                    } ${passwordStrength.score === 1 ? 'w-1/3' : passwordStrength.score === 2 ? 'w-2/3' : 'w-full'}`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Password strength:</span>
                  <span className="font-semibold text-slate-200">{passwordStrength.label}</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none transition bg-slate-950/60 border border-slate-800 text-slate-100 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={updatingPassword}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/20 transition cursor-pointer flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {updatingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>

            {/* Email Reset Link Option */}
            {user.email && (
              <button
                type="button"
                onClick={handleSendResetEmail}
                disabled={sendingResetEmail || resetEmailSent}
                className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 disabled:opacity-60"
              >
                {sendingResetEmail ? (
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-cyan-400" />
                )}
                <span>
                  {resetEmailSent ? 'Reset Link Emailed' : 'Email Me a Reset Link'}
                </span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 4. Session & Authentication Information */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Security & Sessions</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Session Information</h3>
        <p className="text-xs text-slate-400 mb-4">
          Details about your active cryptographic session and authenticated connection.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px] mb-0.5">Authentication Method</span>
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              {provider} Authenticated
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px] mb-0.5">Account ID</span>
            <span className="font-mono text-slate-300 truncate block">
              {user.id}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
