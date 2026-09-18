import React, { useRef } from 'react';
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
} from 'lucide-react';
import {
  CornerDotType,
  CornerSquareType,
  DotType,
  ErrorCorrectionLevel,
  QRStyleConfig,
  StylePresetKey,
} from '../types';
import { STYLE_PRESETS, DEFAULT_STYLE } from '../utils/qrPresets';

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

  const handleApplyPreset = (presetKey: StylePresetKey) => {
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
      {/* Preset Selector */}
      <div className={sectionCardClass}>
        <div className="flex items-center justify-between mb-2.5">
          <span className={headerClass}>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Designer Presets
          </span>
          <button
            id="btn-reset-style"
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 transition cursor-pointer"
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
                    ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-400/30 font-semibold'
                    : theme === 'dark'
                    ? 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-xs"
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
          <Palette className="w-3.5 h-3.5 text-cyan-400" />
          Color Calibration
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Foreground */}
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-700/50 bg-slate-900/30">
            <span className="text-xs font-medium text-slate-300">QR Pattern</span>
            <div className="flex items-center gap-2">
              <input
                id="color-fg"
                type="color"
                value={styleConfig.fgColor}
                onChange={(e) => onChange({ ...styleConfig, fgColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs font-mono text-slate-400 uppercase">
                {styleConfig.fgColor}
              </span>
            </div>
          </div>

          {/* Background */}
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-700/50 bg-slate-900/30">
            <span className="text-xs font-medium text-slate-300">Background</span>
            <div className="flex items-center gap-2">
              <input
                id="color-bg"
                type="color"
                value={styleConfig.bgColor}
                onChange={(e) => onChange({ ...styleConfig, bgColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs font-mono text-slate-400 uppercase">
                {styleConfig.bgColor}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Shapes & Pattern Geometry */}
      <div className={sectionCardClass}>
        <span className={headerClass}>
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          Pattern Geometry
        </span>

        <div className="space-y-3">
          {/* Dot Style */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">
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
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                      : theme === 'dark'
                      ? 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                      : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
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
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">
                Corner Frame
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {cornerSquareTypes.map((cs) => (
                  <button
                    key={cs.id}
                    onClick={() => onChange({ ...styleConfig, cornerSquareType: cs.id })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition cursor-pointer border text-center ${
                      styleConfig.cornerSquareType === cs.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                        : theme === 'dark'
                        ? 'border-slate-800 bg-slate-900/60 text-slate-400'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {cs.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">
                Corner Eye
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {cornerDotTypes.map((cd) => (
                  <button
                    key={cd.id}
                    onClick={() => onChange({ ...styleConfig, cornerDotType: cd.id })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition cursor-pointer border text-center ${
                      styleConfig.cornerDotType === cd.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                        : theme === 'dark'
                        ? 'border-slate-800 bg-slate-900/60 text-slate-400'
                        : 'border-slate-200 bg-white text-slate-600'
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
            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
            Center Logo / Icon
          </span>
          {styleConfig.logoUrl && (
            <button
              id="btn-remove-logo"
              onClick={handleRemoveLogo}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition cursor-pointer"
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
                  : 'border-slate-300 hover:border-cyan-500 bg-white text-slate-600'
              }`}
            >
              <Upload className="w-5 h-5 text-cyan-400" />
              <div className="text-xs font-medium">
                <span className="text-cyan-400 font-semibold">Click to upload brand logo</span> (PNG, JPG, SVG)
              </div>
              <p className="text-[11px] text-slate-500">Processed locally inside your browser</p>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <img
                src={styleConfig.logoUrl}
                alt="Center Logo Preview"
                className="w-12 h-12 object-contain rounded-lg bg-white/10 p-1 border border-white/20 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200">Embedded Logo Active</p>
                <p className="text-[11px] text-slate-400">Fault tolerance automatically set to High (H)</p>
              </div>
            </div>

            {/* Logo Size Slider */}
            <div>
              <div className="flex justify-between items-center text-xs text-slate-300 mb-1">
                <span>Logo Proportion</span>
                <span className="font-mono text-cyan-400">
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
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Warning if logo is too large */}
            {isLogoTooLarge && (
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
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
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
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
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                  : theme === 'dark'
                  ? 'border-slate-800 bg-slate-900/60 text-slate-400'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              <div className="font-semibold">{ec.label}</div>
              <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{ec.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
