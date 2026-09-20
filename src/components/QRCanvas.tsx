import React, { useEffect, useRef, useState, useCallback } from 'react';
import QRCodeStyling, { FileExtension } from 'qr-code-styling';
import {
  AlertTriangle,
  RotateCcw,
  WifiOff,
  Sparkles,
  Check,
  Zap,
  ShieldAlert,
} from 'lucide-react';
import { QRStyleConfig } from '../types';

export interface QRErrorState {
  hasError: boolean;
  message: string;
  code?: string;
  canRetry: boolean;
  retryCount: number;
  suggestedEC?: 'L' | 'M' | 'Q' | 'H';
}

interface QRCanvasProps {
  content: string;
  styleConfig: QRStyleConfig;
  className?: string;
  onReady?: () => void;
  onErrorStateChange?: (error: QRErrorState | null) => void;
  simulateApiError?: boolean;
  onFixErrorCorrection?: (ec: 'L' | 'M' | 'Q' | 'H') => void;
}

export interface QRCanvasRef {
  download: (ext: 'png' | 'svg' | 'jpeg', resolution?: number) => Promise<void>;
  getBlob: (ext?: 'png' | 'jpeg') => Promise<Blob | null>;
  retry: () => void;
  resetError: () => void;
  getErrorState: () => QRErrorState | null;
  toggleOfflineMode: (offline: boolean) => void;
}

export const QRCanvas = React.forwardRef<QRCanvasRef, QRCanvasProps>(
  (
    {
      content,
      styleConfig,
      className = '',
      onReady,
      onErrorStateChange,
      simulateApiError = false,
      onFixErrorCorrection,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const qrCodeRef = useRef<QRCodeStyling | null>(null);

    const [errorState, setErrorState] = useState<QRErrorState | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const [autoRetryCountdown, setAutoRetryCountdown] = useState<number | null>(null);
    const [forceOfflineMode, setForceOfflineMode] = useState(false);
    const retryCountRef = useRef(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Notify parent on error changes
    const updateErrorState = useCallback(
      (err: QRErrorState | null) => {
        setErrorState(err);
        onErrorStateChange?.(err);
      },
      [onErrorStateChange]
    );

    // Generate the QR code locally in the browser.
    // GitHub Pages is static hosting, so POST /api/generate-qr cannot be used there.
    // Keeping generation client-side makes NOVA QR work reliably offline and on GitHub Pages.
    const executeGeneration = useCallback(
      async (isManualRetry = false) => {
        if (isManualRetry) {
          setIsRetrying(true);
          retryCountRef.current += 1;
        }

        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setAutoRetryCountdown(null);

        try {
          // Keep the existing "Test Error State" feature without making a network request.
          if (simulateApiError) {
            const newErr: QRErrorState = {
              hasError: true,
              message: 'Simulated QR generation failure for testing the retry UI.',
              code: 'SIMULATED_FAILURE',
              canRetry: true,
              retryCount: retryCountRef.current,
            };
            updateErrorState(newErr);
            setIsRetrying(false);
            return;
          }

          updateErrorState(null);
          retryCountRef.current = 0;

          const dotsOptions: any = {
            color: styleConfig.fgColor,
            type: styleConfig.dotType,
          };
          if (styleConfig.gradient?.enabled && styleConfig.gradient.colorStops.length >= 2) {
            dotsOptions.gradient = {
              type: styleConfig.gradient.type,
              rotation: (styleConfig.gradient.rotation * Math.PI) / 180,
              colorStops: styleConfig.gradient.colorStops,
            };
          }

          const qrOptions = {
            width: 320,
            height: 320,
            type: 'svg' as const,
            data: content || 'https://nova-qr.app',
            image: styleConfig.logoUrl || undefined,
            margin: styleConfig.margin ?? 12,
            qrOptions: {
              errorCorrectionLevel: styleConfig.logoUrl ? ('H' as const) : ((styleConfig.errorCorrection || 'Q') as any),
            },
            imageOptions: {
              hideBackgroundDots: true,
              imageSize: styleConfig.logoSize ?? 0.25,
              margin: 4,
              crossOrigin: 'anonymous',
            },
            dotsOptions,
            backgroundOptions: {
              color: styleConfig.bgColor,
            },
            cornersSquareOptions: {
              color: styleConfig.cornerSquareColor || styleConfig.fgColor,
              type: styleConfig.cornerSquareType,
            },
            cornersDotOptions: {
              color: styleConfig.cornerDotColor || styleConfig.fgColor,
              type: styleConfig.cornerDotType,
            },
          };

          if (!qrCodeRef.current) {
            qrCodeRef.current = new QRCodeStyling(qrOptions);
            if (containerRef.current) {
              containerRef.current.innerHTML = '';
              qrCodeRef.current.append(containerRef.current);
            }
          } else {
            qrCodeRef.current.update(qrOptions);
          }

          onReady?.();
        } catch (renderError: any) {
          console.error('QR Render failed:', renderError);
          updateErrorState({
            hasError: true,
            message: renderError?.message || 'A styling or matrix rendering issue occurred while generating the QR code.',
            code: 'RENDER_ERROR',
            canRetry: true,
            retryCount: retryCountRef.current,
          });
        } finally {
          setIsRetrying(false);
        }
      },
      [content, styleConfig, simulateApiError, onReady, updateErrorState]
    );

    // Debounce execution
    useEffect(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        executeGeneration();
      }, 120);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      };
    }, [executeGeneration]);

    // Imperative ref methods
    React.useImperativeHandle(ref, () => ({
      retry: () => {
        executeGeneration(true);
      },
      resetError: () => {
        retryCountRef.current = 0;
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setAutoRetryCountdown(null);
        updateErrorState(null);
        executeGeneration();
      },
      getErrorState: () => errorState,
      toggleOfflineMode: (offline: boolean) => {
        setForceOfflineMode(offline);
      },
      download: async (ext: 'png' | 'svg' | 'jpeg', resolution = 1024) => {
        if (errorState?.hasError) {
          throw new Error('Cannot download while QR code is in error state. Please resolve or retry.');
        }
        if (!qrCodeRef.current) return;

        const tempDotsOptions: any = {
          color: styleConfig.fgColor,
          type: styleConfig.dotType,
        };
        if (styleConfig.gradient?.enabled && styleConfig.gradient.colorStops.length >= 2) {
          tempDotsOptions.gradient = {
            type: styleConfig.gradient.type,
            rotation: (styleConfig.gradient.rotation * Math.PI) / 180,
            colorStops: styleConfig.gradient.colorStops,
          };
        }

        const tempQR = new QRCodeStyling({
          width: resolution,
          height: resolution,
          type: ext === 'svg' ? 'svg' : 'canvas',
          data: content || 'https://nova-qr.app',
          image: styleConfig.logoUrl || undefined,
          margin: Math.round((styleConfig.margin ?? 12) * (resolution / 320)),
          qrOptions: {
            errorCorrectionLevel: styleConfig.logoUrl ? 'H' : (styleConfig.errorCorrection || 'Q'),
          },
          imageOptions: {
            hideBackgroundDots: true,
            imageSize: styleConfig.logoSize ?? 0.25,
            margin: Math.round(4 * (resolution / 320)),
          },
          dotsOptions: tempDotsOptions,
          backgroundOptions: {
            color: styleConfig.bgColor,
          },
          cornersSquareOptions: {
            color: styleConfig.cornerSquareColor || styleConfig.fgColor,
            type: styleConfig.cornerSquareType,
          },
          cornersDotOptions: {
            color: styleConfig.cornerDotColor || styleConfig.fgColor,
            type: styleConfig.cornerDotType,
          },
        });

        const extension: FileExtension = ext === 'jpeg' ? 'jpeg' : ext === 'svg' ? 'svg' : 'png';
        await tempQR.download({
          name: `nova-qr-${Date.now()}`,
          extension,
        });
      },

      getBlob: async (ext: 'png' | 'jpeg' = 'png'): Promise<Blob | null> => {
        if (errorState?.hasError || !qrCodeRef.current) return null;
        try {
          const raw = await qrCodeRef.current.getRawData(ext === 'jpeg' ? 'jpeg' : 'png');
          if (raw instanceof Blob) {
            return raw;
          }
          if (raw) {
            return new Blob([raw as unknown as BlobPart], { type: `image/${ext}` });
          }
        } catch {
          const canvas = containerRef.current?.querySelector('canvas');
          if (canvas) {
            return new Promise((resolve) => {
              canvas.toBlob((b) => resolve(b), `image/${ext}`);
            });
          }
        }
        return null;
      },
    }));

    return (
      <div className="relative">
        {/* User-friendly error state card if generation/API fails */}
        {errorState?.hasError ? (
          <div
            id="qr-error-state"
            className={`w-[320px] h-[320px] rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-lg border relative transition-all duration-300 ${
              styleConfig.bgColor === '#020617' || styleConfig.bgColor.startsWith('#0') || styleConfig.bgColor.startsWith('#1')
                ? 'bg-slate-900/95 border-rose-500/40 text-slate-100'
                : 'bg-white border-rose-300 text-slate-900'
            }`}
          >
            {/* Warning icon with alert pulse */}
            <div className="relative mb-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center">
                {errorState.code === 'NETWORK_ERROR' ? (
                  <WifiOff className="w-6 h-6 animate-pulse" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              {isRetrying && (
                <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400 border-t-transparent animate-spin" />
              )}
            </div>

            {/* Error title & description */}
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-rose-500 mb-1">
              {errorState.code ? `ERROR: ${errorState.code}` : 'Generation Error'}
            </span>
            <h3 className="text-sm font-bold leading-tight mb-1.5">
              QR Code Generation Interrupted
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4 px-2">
              {errorState.message}
            </p>

            {/* Auto-retry notice */}
            {autoRetryCountdown !== null && (
              <div className="mb-3 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 text-[11px] font-medium flex items-center gap-1.5">
                <RotateCcw className="w-3 h-3 animate-spin" />
                <span>Auto-retrying in {autoRetryCountdown}s...</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-2 w-full max-w-[240px]">
              <button
                id="btn-retry-qr"
                type="button"
                onClick={() => executeGeneration(true)}
                disabled={isRetrying}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>
                  {isRetrying
                    ? 'Retrying Generation...'
                    : errorState.retryCount > 0
                    ? `Retry Now (Attempt ${errorState.retryCount + 1})`
                    : 'Retry Generation'}
                </span>
              </button>

              {/* Offline fallback button if API failed */}
              {!forceOfflineMode && (
                <button
                  type="button"
                  onClick={() => {
                    setForceOfflineMode(true);
                    updateErrorState(null);
                  }}
                  className="w-full py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>Use Local Engine (Offline)</span>
                </button>
              )}

              {/* Quick fix for Error Correction if suggested */}
              {errorState.suggestedEC && onFixErrorCorrection && (
                <button
                  type="button"
                  onClick={() => onFixErrorCorrection(errorState.suggestedEC!)}
                  className="w-full py-1.5 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer hover:bg-emerald-500/25"
                >
                  <Check className="w-3 h-3" />
                  <span>Set EC Level to '{errorState.suggestedEC}'</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            ref={containerRef}
            className={`flex items-center justify-center overflow-hidden rounded-2xl transition-all duration-300 will-change-transform ${className}`}
            style={{
              backgroundColor: styleConfig.bgColor,
              boxShadow: `0 8px 30px -6px ${styleConfig.fgColor}25`,
            }}
          />
        )}
      </div>
    );
  }
);

QRCanvas.displayName = 'QRCanvas';
