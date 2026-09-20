import React, { useRef, useState, useEffect } from 'react';
import {
  Palette,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Upload,
  Trash2,
  Sliders,
  ShieldCheck,
  BookmarkPlus,
  Briefcase,
  Check,
  Plus,
} from 'lucide-react';
import {
  CornerDotType,
  CornerSquareType,
  DotType,
  ErrorCorrectionLevel,
  QRStyleConfig,
  StylePresetKey,
  BrandKit,
} from '../types';
import { STYLE_PRESETS, DEFAULT_STYLE } from '../utils/qrPresets';
import { getStoredBrandKits, saveBrandKit } from '../utils/brandStorage';

interface StyleCustomizerProps {
  styleConfig: QRStyleConfig;
  onChange: (config: QRStyleConfig) => void;
  onReset: () => void;
  theme: 'dark' | 'light';
}

export const StyleCustomizer: React.FC<StyleCustomizerProps> = ({
  styleConfig,
  onChange,
  onReset,
  theme,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dotTypes: { id: DotType; label: string }[] = [
    { id: 'rounded', label: 'Smooth' },
    { id: 'dots', label: 'Dots' },
    { id: 'classy', label: 'Classy' },
    { id: 'classy-rounded', label: 'Elegance' },
    { id: 'square', label: 'Square' },
    { id: 'extra-rounded', label: 'Pill' },
  ];

  const cornerSquareTypes: { id: CornerSquareType; label: string }[] = [
    { id: 'extra-rounded', label: 'Curved' },
    { id: 'square', label: 'Square' },
    { id: 'dot', label: 'Circular' },
  ];

  const cornerDotTypes: { id: CornerDotType; label: string }[] = [
    { id: 'dot', label: 'Round Eye' },
    { id: 'square', label: 'Square Eye' },
  ];

  const errorCorrectionLevels: { id: ErrorCorrectionLevel; label: string; desc: string }[] = [
    { id: 'L', label: 'L (7%)', desc: 'Low density' },
    { id: 'M', label: 'M (15%)', desc: 'Standard' },
    { id: 'Q', label: 'Q (25%)', desc: 'High density' },
    { id: 'H', label: 'H (30%)', desc: 'Max tolerance (Best for logos)' },
  ];

  const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
  const [isSavingBrandKit, setIsSavingBrandKit] = useState(false);
  const [brandKitNameInput, setBrandKitNameInput] = useState('');
  const [activeBrandKitId, setActiveBrandKitId] = useState<string | null>(null);

  useEffect(() => {
    setBrandKits(getStoredBrandKits());
  }, []);

  const handleApplyBrandKit = (kit: BrandKit) => {
    setActiveBrandKitId(kit.id);
    onChange({
      ...styleConfig,
      fgColor: kit.dotColor,
      bgColor: kit.backgroundColor,
      dotType: kit.dotType,
      cornerSquareType: kit.cornerSquareType,
      cornerDotType: kit.cornerDotType,
      cornerSquareColor: kit.cornerSquareColor,
      cornerDotColor: kit.cornerDotColor,
      errorCorrection: kit.errorCorrection,
      logoUrl: kit.logoUrl || styleConfig.logoUrl,
    });
  };

  const handleSaveCurrentAsBrandKit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandKitNameInput.trim()) return;

    const newKit: BrandKit = {
      id: `brand-${Date.now()}`,
      name: brandKitNameInput.trim(),
      dotColor: styleConfig.fgColor,
      dotType: styleConfig.dotType,
      cornerSquareColor: styleConfig.cornerSquareColor || styleConfig.fgColor,
      cornerSquareType: styleConfig.cornerSquareType,
      cornerDotColor: styleConfig.cornerDotColor || styleConfig.fgColor,
      cornerDotType: styleConfig.cornerDotType,
      backgroundColor: styleConfig.bgColor,
      errorCorrection: styleConfig.errorCorrection,
      logoUrl: styleConfig.logoUrl,
      createdAt: new Date().toISOString(),
    };

    const updated = saveBrandKit(newKit);
    setBrandKits(updated);
    setActiveBrandKitId(newKit.id);
    setBrandKitNameInput('');
    setIsSavingBrandKit(false);
  };

  const handleApplyPreset = (presetKey: StylePresetKey) => {
    setActiveBrandKitId(null);
    const preset = STYLE_PRESETS[presetKey];
    if (preset) {
      onChange({
        ...styleConfig,
        fgColor: preset.fgColor,
        bgColor: preset.bgColor,
        dotType: preset.dotType,
        cornerSquareType: preset.cornerSquareType,
        cornerDotType: preset.cornerDotType,
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size should be under 2MB for optimal performance.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onChange({
          ...styleConfig,
          logoUrl: result,
          errorCorrection: 'H', // Automatically set high error correction for readability
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    onChange({
      ...styleConfig,
      logoUrl: undefined,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isLogoTooLarge = (styleConfig.logoSize ?? 0.25) > 0.32;

  const sectionCardClass = `p-4 rounded-2xl border transition ${
    theme === 'dark'
      ? 'bg-slate-900/40 border-slate-800/80'
      : 'bg-slate-50/70 border-slate-200'
  }`;

  const headerClass = `text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-3 ${
    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
  }`;

  return (
    <div className="space-y-4">
      {/* Brand Profiles & Kits */}
      <div className={sectionCardClass}>
        <div className="flex items-center justify-between mb-2.5">
          <span className={headerClass}>
            <Briefcase className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
            Brand Kits & Profiles
          </span>
          <button
            type="button"
            onClick={() => setIsSavingBrandKit(!isSavingBrandKit)}
            className={`flex items-center gap-1 text-xs transition cursor-pointer font-semibold ${
              theme === 'dark' ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-700 hover:text-cyan-800'
            }`}
          >
            <BookmarkPlus className="w-3 h-3" />
            <span>{isSavingBrandKit ? 'Cancel' : 'Save As Brand Kit'}</span>
          </button>
        </div>

        {/* Save Kit Inline Form */}
        {isSavingBrandKit && (
          <form onSubmit={handleSaveCurrentAsBrandKit} className={`mb-3 p-3 rounded-xl border space-y-2 ${
            theme === 'dark'
              ? 'bg-slate-950/70 border-cyan-500/30'
              : 'bg-white border-cyan-400/60 shadow-xs'
          }`}>
            <p className={`text-[11px] font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              Save current colors, pattern geometry, and logo as a reusable Brand Kit:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Brand Name (e.g., Acme Blue)"
                value={brandKitNameInput}
                onChange={(e) => setBrandKitNameInput(e.target.value)}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs outline-none transition ${
                  theme === 'dark'
                    ? 'bg-slate-900 border border-slate-700 text-white focus:border-cyan-400'
                    : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-cyan-600'
                }`}
                autoFocus
              />
              <button
                type="submit"
                disabled={!brandKitNameInput.trim()}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Check className="w-3 h-3" />
                <span>Save</span>
              </button>
            </div>
          </form>
        )}

        {/* Brand Kit Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {brandKits.map((kit) => {
            const isSelected = activeBrandKitId === kit.id;
            return (
              <button
                key={kit.id}
                type="button"
                onClick={() => handleApplyBrandKit(kit)}
                className={`relative flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition cursor-pointer ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/40 font-semibold'
                    : theme === 'dark'
                    ? 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex -space-x-1 shrink-0">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                    style={{ backgroundColor: kit.dotColor }}
                  />
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                    style={{ backgroundColor: kit.cornerSquareColor }}
                  />
                </div>
                <div className="truncate flex-1">
                  <span className="block font-medium truncate text-[11px]">{kit.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset Selector */}
      <div className={sectionCardClass}>
        <div className="flex items-center justify-between mb-2.5">
          <span className={headerClass}>
            <Sparkles className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
            Designer Presets
          </span>
          <button
            id="btn-reset-style"
            onClick={onReset}
            className={`flex items-center gap-1 text-xs transition cursor-pointer font-semibold ${
              theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-700'
            }`}
            title="Reset to default theme"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Style</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.keys(STYLE_PRESETS) as StylePresetKey[]).map((key) => {
            const preset = STYLE_PRESETS[key];
            const isSelected =
              styleConfig.fgColor.toLowerCase() === preset.fgColor.toLowerCase() &&
              styleConfig.bgColor.toLowerCase() === preset.bgColor.toLowerCase();

            return (
              <button
                key={key}
                id={`preset-${key}`}
                onClick={() => handleApplyPreset(key)}
                className={`relative flex items-center gap-2.5 p-2 rounded-xl border text-left text-xs transition cursor-pointer ${
                  isSelected
                    ? theme === 'dark'
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/30 font-bold'
                      : 'border-cyan-500 bg-cyan-50 text-cyan-800 ring-1 ring-cyan-500/40 font-bold shadow-xs'
                    : theme === 'dark'
                    ? 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full border border-slate-300/40 shrink-0 shadow-xs"
                  style={{ backgroundColor: preset.fgColor }}
                />
                <div className="truncate">
                  <span className="block font-medium truncate">{preset.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors & Palette */}
      <div className={sectionCardClass}>
        <span className={headerClass}>
          <Palette className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
          Color Calibration
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Foreground */}
          <div className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
            theme === 'dark'
              ? 'border-slate-700/50 bg-slate-900/40'
              : 'border-slate-200 bg-white shadow-xs'
          }`}>
            <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-800'}`}>
              QR Pattern
            </span>
            <div className="flex items-center gap-2">
              <input
                id="color-fg"
                type="color"
                value={styleConfig.fgColor}
                onChange={(e) => onChange({ ...styleConfig, fgColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <span className={`text-xs font-mono uppercase font-bold ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-700'
              }`}>
                {styleConfig.fgColor}
              </span>
            </div>
          </div>

          {/* Background */}
          <div className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
            theme === 'dark'
              ? 'border-slate-700/50 bg-slate-900/40'
              : 'border-slate-200 bg-white shadow-xs'
          }`}>
            <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-800'}`}>
              Background
            </span>
            <div className="flex items-center gap-2">
              <input
                id="color-bg"
                type="color"
                value={styleConfig.bgColor}
                onChange={(e) => onChange({ ...styleConfig, bgColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <span className={`text-xs font-mono uppercase font-bold ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-700'
              }`}>
                {styleConfig.bgColor}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Shapes & Pattern Geometry */}
      <div className={sectionCardClass}>
        <span className={headerClass}>
          <Sliders className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
          Pattern Geometry
        </span>

        <div className="space-y-3">
          {/* Dot Style */}
          <div>
            <label className={`block text-[11px] font-bold uppercase mb-1.5 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-700'
            }`}>
              Data Modules Style
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {dotTypes.map((dot) => (
                <button
                  key={dot.id}
                  id={`dot-type-${dot.id}`}
                  onClick={() => onChange({ ...styleConfig, dotType: dot.id })}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium transition cursor-pointer border ${
                    styleConfig.dotType === dot.id
                      ? theme === 'dark'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-cyan-50 border-cyan-500 text-cyan-800 font-bold shadow-xs'
                      : theme === 'dark'
                      ? 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                      : 'border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {dot.label}
                </button>
              ))}
            </div>
          </div>

          {/* Corner Square Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className={`block text-[11px] font-bold uppercase mb-1.5 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-700'
              }`}>
                Corner Frame
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {cornerSquareTypes.map((cs) => (
                  <button
                    key={cs.id}
                    onClick={() => onChange({ ...styleConfig, cornerSquareType: cs.id })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition cursor-pointer border text-center ${
                      styleConfig.cornerSquareType === cs.id
                        ? theme === 'dark'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-cyan-50 border-cyan-500 text-cyan-800 font-bold shadow-xs'
                        : theme === 'dark'
                        ? 'border-slate-800 bg-slate-900/60 text-slate-400'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {cs.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-[11px] font-bold uppercase mb-1.5 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-700'
              }`}>
                Corner Eye
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {cornerDotTypes.map((cd) => (
                  <button
                    key={cd.id}
                    onClick={() => onChange({ ...styleConfig, cornerDotType: cd.id })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition cursor-pointer border text-center ${
                      styleConfig.cornerDotType === cd.id
                        ? theme === 'dark'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-cyan-50 border-cyan-500 text-cyan-800 font-bold shadow-xs'
                        : theme === 'dark'
                        ? 'border-slate-800 bg-slate-900/60 text-slate-400'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {cd.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Logo / Image Upload */}
      <div className={sectionCardClass}>
        <div className="flex items-center justify-between mb-2">
          <span className={headerClass}>
            <ImageIcon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
            Center Logo / Icon
          </span>
          {styleConfig.logoUrl && (
            <button
              id="btn-remove-logo"
              onClick={handleRemoveLogo}
              className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition cursor-pointer font-medium"
            >
              <Trash2 className="w-3 h-3" />
              <span>Remove</span>
            </button>
          )}
        </div>

        {!styleConfig.logoUrl ? (
          <div>
            <input
              ref={fileInputRef}
              id="input-logo-file"
              type="file"
              accept="image/png, image/jpeg, image/svg+xml, image/webp"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`w-full py-4 px-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
                theme === 'dark'
                  ? 'border-slate-700/80 hover:border-cyan-400/60 bg-slate-900/30 text-slate-300'
                  : 'border-slate-300 hover:border-cyan-600 bg-white text-slate-700 shadow-xs'
              }`}
            >
              <Upload className={`w-5 h-5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <div className="text-xs font-medium">
                <span className={`font-bold ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'}`}>Click to upload brand logo</span> (PNG, JPG, SVG)
              </div>
              <p className={`text-[11px] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>Processed locally inside your browser</p>
            </button>

            {/* Quick Brand Icon Library */}
            <div className="mt-2.5">
              <p className={`text-[11px] font-medium mb-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}`}>Or choose a sample brand emblem:</p>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  {
                    name: 'NOVA Hex',
                    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpolygon points='50,5 90,25 90,75 50,95 10,75 10,25' fill='%2306b6d4' stroke='%23ffffff' stroke-width='6'/%3E%3Ccircle cx='50' cy='50' r='18' fill='%23ffffff'/%3E%3C/svg%3E",
                  },
                  {
                    name: 'Shield',
                    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50,8 L85,25 L85,55 C85,75 50,92 50,92 C50,92 15,75 15,55 L15,25 Z' fill='%2310b981' stroke='%23ffffff' stroke-width='6'/%3E%3Cpath d='M35,50 L45,60 L65,40' fill='none' stroke='%23ffffff' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E",
                  },
                  {
                    name: 'Star',
                    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpolygon points='50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36' fill='%23f59e0b' stroke='%23ffffff' stroke-width='6'/%3E%3C/svg%3E",
                  },
                  {
                    name: 'Zap',
                    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%238b5cf6' stroke='%23ffffff' stroke-width='6'/%3E%3Cpolygon points='52,15 28,52 48,52 44,85 72,48 52,48' fill='%23ffffff'/%3E%3C/svg%3E",
                  },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => onChange({ ...styleConfig, logoUrl: item.url, errorCorrection: 'H' })}
                    className={`flex items-center gap-1.5 p-1.5 rounded-lg border transition cursor-pointer text-left ${
                      theme === 'dark'
                        ? 'bg-slate-900/60 border-slate-800 hover:border-cyan-400/50'
                        : 'bg-white border-slate-200 hover:border-cyan-500 shadow-xs'
                    }`}
                  >
                    <img src={item.url} alt={item.name} className="w-5 h-5 object-contain shrink-0" />
                    <span className={`text-[10px] font-medium truncate ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    }`}>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className={`flex items-center gap-3 p-2.5 rounded-xl border ${
              theme === 'dark'
                ? 'bg-slate-900/60 border-slate-800'
                : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <img
                src={styleConfig.logoUrl}
                alt="Center Logo Preview"
                className={`w-12 h-12 object-contain rounded-lg p-1 border shrink-0 ${
                  theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-slate-50 border-slate-200'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                  Embedded Logo Active
                </p>
                <p className={`text-[11px] font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Fault tolerance automatically set to High (H)
                </p>
              </div>
            </div>

            {/* Logo Size Slider */}
            <div>
              <div className={`flex justify-between items-center text-xs mb-1 font-semibold ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <span>Logo Proportion</span>
                <span className={`font-mono font-bold ${
                  theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'
                }`}>
                  {Math.round((styleConfig.logoSize ?? 0.25) * 100)}%
                </span>
              </div>
              <input
                id="slider-logo-size"
                type="range"
                min="0.15"
                max="0.4"
                step="0.01"
                value={styleConfig.logoSize ?? 0.25}
                onChange={(e) =>
                  onChange({
                    ...styleConfig,
                    logoSize: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Warning if logo is too large */}
            {isLogoTooLarge && (
              <div className={`flex items-start gap-2 p-2.5 rounded-xl text-xs ${
                theme === 'dark'
                  ? 'bg-amber-950/40 border border-amber-500/30 text-amber-300'
                  : 'bg-amber-50 border border-amber-300 text-amber-900'
              }`}>
                <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                  theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                }`} />
                <span>
                  <strong>Readability Alert:</strong> A logo size above 30% might hinder scanning on older cameras. Test scan before printing.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Correction Level */}
      <div className={sectionCardClass}>
        <div className="flex items-center justify-between mb-2">
          <span className={headerClass}>
            <ShieldCheck className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
            Fault Tolerance (Error Correction)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {errorCorrectionLevels.map((ec) => (
            <button
              key={ec.id}
              onClick={() => onChange({ ...styleConfig, errorCorrection: ec.id })}
              className={`p-2 rounded-xl text-xs font-medium border text-left transition cursor-pointer ${
                styleConfig.errorCorrection === ec.id
                  ? theme === 'dark'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                    : 'bg-cyan-50 border-cyan-500 text-cyan-800 font-bold shadow-xs'
                  : theme === 'dark'
                  ? 'border-slate-800 bg-slate-900/60 text-slate-400'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="font-bold">{ec.label}</div>
              <div className={`text-[10px] leading-tight mt-0.5 ${
                theme === 'dark' ? 'text-slate-500' : 'text-slate-600'
              }`}>{ec.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
