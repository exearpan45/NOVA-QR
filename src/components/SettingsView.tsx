import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
  Trash2,
  RotateCcw,
  Sliders,
  Shield,
  AlertTriangle,
  Sparkles,
  User as UserIcon,
  LogIn,
  LogOut,
  UserPlus,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { AppSettings, StylePresetKey, ErrorCorrectionLevel } from '../types';
import { STYLE_PRESETS } from '../utils/qrPresets';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onClearHistory: () => void;
  onClearFavorites: () => void;
  onResetAllSettings: () => void;
  theme: 'dark' | 'light';
  onAddToast: (title: string, description?: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  user: User | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onSignOut: () => Promise<void>;
  onNavigateToProfile?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onClearHistory,
  onClearFavorites,
  onResetAllSettings,
  theme,
  onAddToast,
  user,
  onOpenAuth,
  onSignOut,
  onNavigateToProfile,
}) => {
  const [modalAction, setModalAction] = useState<'history' | 'favorites' | 'reset' | null>(null);

  const handleThemeChange = (newTheme: 'dark' | 'light' | 'system') => {
    onSaveSettings({ ...settings, theme: newTheme });
    onAddToast('Theme Updated', `Switched to ${newTheme} mode`, 'success');
  };

  const handleConfirmAction = () => {
    if (modalAction === 'history') {
      onClearHistory();
      onAddToast('History Cleared', 'All stored QR codes have been deleted', 'info');
    } else if (modalAction === 'favorites') {
      onClearFavorites();
      onAddToast('Favorites Cleared', 'All favorite bookmarks removed', 'info');
    } else if (modalAction === 'reset') {
      onResetAllSettings();
      onAddToast('App Reset', 'All settings and history restored to defaults', 'info');
    }
    setModalAction(null);
  };

  const sectionCardClass = `p-6 rounded-3xl border ${
    theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
  }`;

  const labelClass = `text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3 flex items-center gap-2`;

  const userDisplayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.user_name ||
    user?.email?.split('@')[0] ||
    user?.phone ||
    'Account';

  const userInitials = (userDisplayName || 'U')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
          <SettingsIcon className="w-7 h-7 text-cyan-400" />
          <span>Application Settings</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Personalize appearance, manage your account, and configure QR defaults.
        </p>
      </div>

      {/* 0. Account & Authentication */}
      <div className={sectionCardClass}>
        <span className={labelClass}>
          <Database className="w-4 h-4 text-cyan-400" />
          Account & Cloud Sync
        </span>

        {user ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-base shadow-md">
                {userInitials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{userDisplayName}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Cloud Sync Active
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400 mt-0.5">{user.email || user.phone}</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Account ID: {user.id.slice(0, 16)}...
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col gap-2 shrink-0">
              {onNavigateToProfile && (
                <button
                  onClick={onNavigateToProfile}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Profile & Password</span>
                </button>
              )}
              <button
                onClick={onSignOut}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>NOVA Cloud Account</span>
              </div>
              <h3 className="text-sm font-bold text-white">
                Log in or create your account
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 max-w-md">
                Authenticate with your email and password to safely backup and access your codes and favorites across devices.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-200 hover:text-white hover:border-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>Log In</span>
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 1. Appearance */}
      <div className={sectionCardClass}>
        <span className={labelClass}>
          <Sun className="w-4 h-4 text-cyan-400" />
          Appearance & Theme
        </span>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleThemeChange('dark')}
            className={`p-4 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-2 ${
              settings.theme === 'dark'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold ring-1 ring-cyan-400/30'
                : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-semibold">Dark Mode</span>
          </button>

          <button
            onClick={() => handleThemeChange('light')}
            className={`p-4 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-2 ${
              settings.theme === 'light'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold ring-1 ring-cyan-400/30'
                : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-semibold">Light Mode</span>
          </button>

          <button
            onClick={() => handleThemeChange('system')}
            className={`p-4 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-2 ${
              settings.theme === 'system'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold ring-1 ring-cyan-400/30'
                : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-5 h-5 text-slate-400" />
            <span className="text-xs font-semibold">System Theme</span>
          </button>
        </div>
      </div>

      {/* 2. QR Defaults */}
      <div className={sectionCardClass}>
        <span className={labelClass}>
          <Sliders className="w-4 h-4 text-cyan-400" />
          QR Generator Defaults
        </span>

        <div className="space-y-4">
          {/* Default Style Preset */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Default Color Theme Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(STYLE_PRESETS) as StylePresetKey[]).map((key) => {
                const preset = STYLE_PRESETS[key];
                return (
                  <button
                    key={key}
                    onClick={() => {
                      onSaveSettings({ ...settings, defaultPreset: key });
                      onAddToast('Default Saved', `Set default preset to ${preset.name}`, 'info');
                    }}
                    className={`p-2.5 rounded-xl border text-xs text-left transition cursor-pointer flex items-center gap-2.5 ${
                      settings.defaultPreset === key
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                        : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: preset.fgColor }}
                    />
                    <span className="truncate">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Default Resolution */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Default Download Resolution
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[512, 1024, 2048].map((res) => (
                <button
                  key={res}
                  onClick={() => {
                    onSaveSettings({ ...settings, defaultSize: res });
                    onAddToast('Default Saved', `Download resolution set to ${res}px`, 'info');
                  }}
                  className={`py-2 rounded-xl border text-xs font-medium transition cursor-pointer ${
                    settings.defaultSize === res
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {res} × {res} px
                </button>
              ))}
            </div>
          </div>

          {/* Default Error Correction */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Default Error Correction Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['L', 'M', 'Q', 'H'] as ErrorCorrectionLevel[]).map((ec) => (
                <button
                  key={ec}
                  onClick={() => {
                    onSaveSettings({ ...settings, defaultErrorCorrection: ec });
                    onAddToast('Default Saved', `Error correction set to level ${ec}`, 'info');
                  }}
                  className={`py-2 rounded-xl border text-xs font-medium transition cursor-pointer ${
                    settings.defaultErrorCorrection === ec
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Level {ec}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Data Management */}
      <div className={sectionCardClass}>
        <span className={labelClass}>
          <Trash2 className="w-4 h-4 text-rose-400" />
          Data & Local Storage
        </span>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
            <div>
              <h4 className="text-xs font-bold text-slate-200">Clear QR Code History</h4>
              <p className="text-[11px] text-slate-400">Remove all generated history logs</p>
            </div>
            <button
              onClick={() => setModalAction('history')}
              className="px-3.5 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition cursor-pointer"
            >
              Clear History
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
            <div>
              <h4 className="text-xs font-bold text-slate-200">Clear Saved Favorites</h4>
              <p className="text-[11px] text-slate-400">Unfavorite all bookmarked codes</p>
            </div>
            <button
              onClick={() => setModalAction('favorites')}
              className="px-3.5 py-1.5 rounded-xl border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs font-semibold transition cursor-pointer"
            >
              Clear Favorites
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
            <div>
              <h4 className="text-xs font-bold text-slate-200">Factory Reset Application</h4>
              <p className="text-[11px] text-slate-400">Restores defaults and wipes all local data</p>
            </div>
            <button
              onClick={() => setModalAction('reset')}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              Reset Everything
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Notice Card */}
      <div className="p-4 rounded-2xl bg-slate-900/30 border border-cyan-500/20 text-slate-300 flex items-start gap-3">
        <Shield className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <strong className="text-white">“Your QR data stays on your device.”</strong>
          <p className="text-slate-400 mt-0.5">
            NOVA QR operates 100% client-side. No trackers, no cookies, no accounts, and no backend data collection.
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">
                {modalAction === 'history' && 'Clear QR History'}
                {modalAction === 'favorites' && 'Clear Favorites'}
                {modalAction === 'reset' && 'Reset Application'}
              </h3>
            </div>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              {modalAction === 'history' && 'Are you sure you want to permanently erase your QR history?'}
              {modalAction === 'favorites' && 'Are you sure you want to remove all favorite QR bookmarks?'}
              {modalAction === 'reset' && 'This will delete all local history, favorites, and reset all settings to defaults.'}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setModalAction(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
