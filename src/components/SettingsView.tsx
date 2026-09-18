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
} from 'lucide-react';
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
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onClearHistory,
  onClearFavorites,
  onResetAllSettings,
  theme,
  onAddToast,
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

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
          <SettingsIcon className="w-7 h-7 text-cyan-400" />
          <span>Application Settings</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Personalize appearance, default export formats, and manage local storage.
        </p>
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
