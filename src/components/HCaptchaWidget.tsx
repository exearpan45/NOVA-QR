import React, { useState, useEffect } from 'react';
import {
  Check,
  ShieldCheck,
  RotateCw,
  X,
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface HCaptchaWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  theme?: 'dark' | 'light';
  hasError?: boolean;
  errorMessage?: string;
  resetTrigger?: number;
}

// Challenge types for interactive verification
interface ChallengeTile {
  id: number;
  isTarget: boolean;
  label: string;
  iconType: 'qr' | 'phone' | 'wifi' | 'coffee' | 'camera';
}

export const HCaptchaWidget: React.FC<HCaptchaWidgetProps> = ({
  onVerify,
  onExpire,
  theme = 'dark',
  hasError = false,
  errorMessage,
  resetTrigger = 0,
}) => {
  const [status, setStatus] = useState<'idle' | 'verifying' | 'challenge' | 'verified' | 'expired'>('idle');
  const [token, setToken] = useState<string | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [challengeError, setChallengeError] = useState<string | null>(null);
  const [challengeStep, setChallengeStep] = useState<1 | 2>(1);

  // Generate challenge tiles
  const [tiles, setTiles] = useState<ChallengeTile[]>([]);

  const generateNewChallenge = () => {
    // 9 tiles, exactly 3-4 target tiles
    const targetCount = 3 + Math.floor(Math.random() * 2);
    const targetIndices = new Set<number>();
    while (targetIndices.size < targetCount) {
      targetIndices.add(Math.floor(Math.random() * 9));
    }

    const newTiles: ChallengeTile[] = Array.from({ length: 9 }, (_, i) => {
      const isTarget = targetIndices.has(i);
      return {
        id: i,
        isTarget,
        label: isTarget ? 'QR Matrix Code' : 'Generic Icon',
        iconType: isTarget ? 'qr' : (['phone', 'wifi', 'coffee', 'camera'][i % 4] as any),
      };
    });

    setTiles(newTiles);
    setSelectedTiles([]);
    setChallengeError(null);
  };

  // Reset when resetTrigger changes
  useEffect(() => {
    setStatus('idle');
    setToken(null);
    setShowChallengeModal(false);
    setSelectedTiles([]);
  }, [resetTrigger]);

  // Token expiration timer (120 seconds)
  useEffect(() => {
    if (status === 'verified') {
      const timer = setTimeout(() => {
        setStatus('expired');
        setToken(null);
        onExpire?.();
      }, 120000);
      return () => clearTimeout(timer);
    }
  }, [status, onExpire]);

  const handleCheckboxClick = () => {
    if (status === 'verifying' || status === 'verified') return;

    setStatus('verifying');

    // Simulate smart verification: 40% instant pass, 60% interactive visual challenge
    setTimeout(() => {
      const requireInteractiveChallenge = Math.random() > 0.35;

      if (requireInteractiveChallenge) {
        generateNewChallenge();
        setStatus('challenge');
        setShowChallengeModal(true);
      } else {
        completeVerification();
      }
    }, 700);
  };

  const completeVerification = () => {
    const verifiedToken = 'hc_tok_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
    setStatus('verified');
    setToken(verifiedToken);
    setShowChallengeModal(false);
    onVerify(verifiedToken);
  };

  const handleToggleTile = (id: number) => {
    setSelectedTiles((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleVerifyChallenge = () => {
    // Check if user correctly selected all target tiles
    const targetIds = tiles.filter((t) => t.isTarget).map((t) => t.id);
    const isCorrect =
      targetIds.length === selectedTiles.length &&
      targetIds.every((id) => selectedTiles.includes(id));

    if (isCorrect) {
      if (challengeStep === 1 && Math.random() > 0.6) {
        // Step 2 challenge for extra realism
        setChallengeStep(2);
        generateNewChallenge();
      } else {
        completeVerification();
      }
    } else {
      setChallengeError('Please select all relevant squares containing QR codes.');
      setTimeout(() => {
        generateNewChallenge();
      }, 900);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="w-full select-none">
      {/* hCaptcha Main Widget Box */}
      <div
        className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all ${
          hasError
            ? 'border-rose-500/80 bg-rose-500/5 ring-2 ring-rose-500/20'
            : status === 'verified'
            ? 'border-emerald-500/60 bg-emerald-500/5'
            : isDark
            ? 'border-slate-700/80 bg-slate-900/90 hover:border-slate-600'
            : 'border-slate-300 bg-white hover:border-slate-400 shadow-sm'
        }`}
      >
        {/* Left Side: Checkbox & Label */}
        <div
          onClick={handleCheckboxClick}
          className="flex items-center gap-3 cursor-pointer group flex-1 py-1"
          role="checkbox"
          aria-checked={status === 'verified'}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              handleCheckboxClick();
            }
          }}
        >
          {/* Checkbox box */}
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
              status === 'verified'
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                : status === 'verifying'
                ? isDark
                  ? 'border-2 border-cyan-400 border-t-transparent animate-spin'
                  : 'border-2 border-cyan-600 border-t-transparent animate-spin'
                : isDark
                ? 'border-2 border-slate-500 group-hover:border-cyan-400 bg-slate-800'
                : 'border-2 border-slate-400 group-hover:border-cyan-600 bg-slate-50'
            }`}
          >
            {status === 'verified' && <Check className="w-4 h-4 stroke-[3]" />}
          </div>

          {/* Label */}
          <div className="flex flex-col">
            <span
              className={`text-sm font-medium transition ${
                status === 'verified'
                  ? 'text-emerald-400 font-semibold'
                  : isDark
                  ? 'text-slate-200 group-hover:text-white'
                  : 'text-slate-800 group-hover:text-slate-900'
              }`}
            >
              {status === 'verified' ? 'Verified Human' : 'I am human'}
            </span>
            {status === 'expired' && (
              <span className="text-[11px] text-amber-400">Session expired. Click to re-verify.</span>
            )}
          </div>
        </div>

        {/* Right Side: hCaptcha Logo & Branding */}
        <div className="flex flex-col items-center justify-center pl-3 border-l border-slate-700/50">
          <div className="flex items-center gap-1">
            {/* Stylized hCaptcha Brand Icon */}
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-xs">
              <span className="text-[10px] font-black text-slate-950 font-mono">h</span>
            </div>
            <span className="text-[11px] font-bold tracking-tight text-slate-400">hCaptcha</span>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-slate-500 mt-0.5">
            <span className="hover:underline cursor-pointer">Privacy</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Terms</span>
          </div>
        </div>
      </div>

      {/* Error Message if provided */}
      {hasError && errorMessage && (
        <p className="mt-1 text-xs text-rose-400 flex items-center gap-1 pl-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{errorMessage}</span>
        </p>
      )}

      {/* Interactive Visual Challenge Modal */}
      {showChallengeModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
            }`}
          >
            {/* Challenge Header */}
            <div className="bg-gradient-to-r from-teal-700 to-cyan-700 p-4 text-white">
              <div className="flex items-center justify-between text-xs opacity-90 mb-1">
                <span className="font-semibold uppercase tracking-wider">hCaptcha Verification</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                  Step {challengeStep} of 2
                </span>
              </div>
              <h3 className="text-base font-bold leading-tight">
                Please click each image containing a <span className="underline decoration-cyan-300 font-extrabold">QR Code</span>
              </h3>
            </div>

            {/* 3x3 Tile Grid */}
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2">
                {tiles.map((tile) => {
                  const isSelected = selectedTiles.includes(tile.id);
                  return (
                    <button
                      key={tile.id}
                      type="button"
                      onClick={() => handleToggleTile(tile.id)}
                      className={`relative aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all cursor-pointer border ${
                        isSelected
                          ? 'border-cyan-400 ring-2 ring-cyan-400/50 bg-cyan-500/20'
                          : isDark
                          ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-800'
                          : 'border-slate-200 bg-slate-100 hover:bg-slate-200/70'
                      }`}
                    >
                      {/* Selection Check Badge */}
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}

                      {/* Tile Icon Graphics */}
                      {tile.iconType === 'qr' && (
                        <div className="flex flex-col items-center">
                          <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 mb-1">
                            <QrCode className="w-7 h-7" />
                          </div>
                          <span className="text-[10px] font-medium text-slate-300">QR Matrix</span>
                        </div>
                      )}

                      {tile.iconType === 'phone' && (
                        <div className="flex flex-col items-center">
                          <div className="p-2 rounded-lg bg-slate-700/40 text-slate-400 mb-1">
                            <Smartphone className="w-7 h-7" />
                          </div>
                          <span className="text-[10px] font-medium text-slate-400">Mobile Phone</span>
                        </div>
                      )}

                      {tile.iconType === 'wifi' && (
                        <div className="flex flex-col items-center">
                          <div className="p-2 rounded-lg bg-slate-700/40 text-slate-400 mb-1">
                            <HelpCircle className="w-7 h-7" />
                          </div>
                          <span className="text-[10px] font-medium text-slate-400">Wireless AP</span>
                        </div>
                      )}

                      {tile.iconType === 'coffee' && (
                        <div className="flex flex-col items-center">
                          <div className="p-2 rounded-lg bg-slate-700/40 text-slate-400 mb-1">
                            <HelpCircle className="w-7 h-7" />
                          </div>
                          <span className="text-[10px] font-medium text-slate-400">Coffee Cup</span>
                        </div>
                      )}

                      {tile.iconType === 'camera' && (
                        <div className="flex flex-col items-center">
                          <div className="p-2 rounded-lg bg-slate-700/40 text-slate-400 mb-1">
                            <HelpCircle className="w-7 h-7" />
                          </div>
                          <span className="text-[10px] font-medium text-slate-400">Photo Lens</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {challengeError && (
                <p className="text-xs text-rose-400 text-center mt-2 font-medium">
                  {challengeError}
                </p>
              )}
            </div>

            {/* Challenge Footer */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950/40 border-t border-slate-800">
              <button
                type="button"
                onClick={generateNewChallenge}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                title="Reload new images"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowChallengeModal(false);
                    setStatus('idle');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerifyChallenge}
                  disabled={selectedTiles.length === 0}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
