import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  Upload,
  Copy,
  ExternalLink,
  Check,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  Wifi,
  Contact,
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  Globe,
  FileText,
  StopCircle,
} from 'lucide-react';
import { DetectedQRInfo, detectPayloadType } from '../utils/qrPayload';

interface ScannerViewProps {
  theme: 'dark' | 'light';
  onAddToast: (title: string, description?: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  onSendToGenerator?: (text: string) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  theme,
  onAddToast,
  onSendToGenerator,
}) => {
  const [scanMode, setScanMode] = useState<'camera' | 'upload'>('upload');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<DetectedQRInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [showUrlConfirm, setShowUrlConfirm] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const handleScanTick = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          const detected = detectPayloadType(code.data);
          setScannedResult(detected);
          onAddToast('QR Detected!', detected.title, 'success');
          stopCamera();
          return;
        }
      }
    }

    animFrameId.current = requestAnimationFrame(handleScanTick);
  }, [stopCamera, onAddToast]);

  const startCamera = async () => {
    setCameraError(null);
    setScannedResult(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported on this browser or platform. Please upload an image instead.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
        animFrameId.current = requestAnimationFrame(handleScanTick);
      }
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || '';
      if (errorMsg.includes('Permission') || errorMsg.includes('denied')) {
        setCameraError('Camera permission was denied. You can enable camera access in your browser settings, or easily upload a QR image below.');
      } else {
        setCameraError(`Unable to start camera: ${errorMsg || 'Device camera unavailable'}. You can upload an image file instead.`);
      }
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          const detected = detectPayloadType(code.data);
          setScannedResult(detected);
          onAddToast('QR Code Recognized', detected.title, 'success');
        } else {
          onAddToast('Scan Unsuccessful', 'No clear QR code detected in this image. Try another photo with good lighting and contrast.', 'warning');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCopyScannedText = async () => {
    if (!scannedResult) return;
    try {
      await navigator.clipboard.writeText(scannedResult.displayValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onAddToast('Copied', 'Content copied to clipboard', 'success');
    } catch {
      onAddToast('Copy Error', 'Failed to write to clipboard', 'error');
    }
  };

  const handleOpenLink = () => {
    if (!scannedResult || !scannedResult.linkUrl) return;
    // Security verification dialog check
    setShowUrlConfirm(true);
  };

  const confirmOpenLink = () => {
    if (scannedResult?.linkUrl) {
      window.open(scannedResult.linkUrl, '_blank', 'noopener,noreferrer');
      setShowUrlConfirm(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'url':
        return Globe;
      case 'wifi':
        return Wifi;
      case 'vcard':
        return Contact;
      case 'calendar':
        return Calendar;
      case 'email':
        return Mail;
      case 'phone':
        return Phone;
      case 'sms':
        return MessageSquare;
      default:
        return FileText;
    }
  };

  const CategoryIcon = scannedResult ? getCategoryIcon(scannedResult.category) : FileText;

  const isDark = theme === 'dark';

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="text-center">
        <h1 className={`text-3xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          QR Code Scanner
        </h1>
        <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Decode QR codes using your device camera or by uploading an image.
        </p>
      </div>

      {/* Mode Selector */}
      <div className={`flex items-center justify-center gap-2 p-1.5 rounded-2xl border max-w-md mx-auto ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100 border-slate-300 shadow-xs'
      }`}>
        <button
          id="btn-scanner-mode-upload"
          onClick={() => {
            stopCamera();
            setScanMode('upload');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            scanMode === 'upload'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Image</span>
        </button>

        <button
          id="btn-scanner-mode-camera"
          onClick={() => {
            setScanMode('camera');
            startCamera();
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            scanMode === 'camera'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Use Live Camera</span>
        </button>
      </div>

      {/* Camera Viewfinder */}
      {scanMode === 'camera' && (
        <div
          className={`p-6 rounded-3xl border shadow-xl backdrop-blur-xl text-center relative overflow-hidden ${
            isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          {cameraError ? (
            <div className={`p-6 rounded-2xl border max-w-lg mx-auto ${
              isDark
                ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                : 'bg-rose-50 border-rose-300 text-rose-800 shadow-xs'
            }`}>
              <AlertCircle className={`w-8 h-8 mx-auto mb-3 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} />
              <h3 className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-rose-950'}`}>Camera Notice</h3>
              <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-rose-200/90' : 'text-rose-700'}`}>{cameraError}</p>
              <button
                onClick={() => setScanMode('upload')}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold shadow-md hover:bg-cyan-400 transition"
              >
                Switch to Image Upload
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-black border-2 border-cyan-500/40 shadow-2xl flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />

                {/* Laser scanline overlay animation */}
                {isCameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
                    <div className="w-full h-full border-2 border-cyan-400/50 rounded-xl relative">
                      <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-cyan-400" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-cyan-400" />
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-cyan-400" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-cyan-400" />

                      {/* Moving glowing laser line */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400 animate-pulse mt-12" />
                    </div>
                  </div>
                )}

                {!isCameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-slate-400 p-4">
                    <Camera className="w-10 h-10 text-slate-600 mb-2" />
                    <p className="text-xs">Camera is paused</p>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="mt-4 flex items-center gap-3">
                {isCameraActive ? (
                  <button
                    onClick={stopCamera}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      isDark
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                        : 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    <StopCircle className="w-4 h-4" />
                    <span>Stop Camera</span>
                  </button>
                ) : (
                  <button
                    onClick={startCamera}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 shadow-md transition cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Start Camera</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Upload Area */}
      {scanMode === 'upload' && (
        <div
          className={`p-8 rounded-3xl border shadow-xl backdrop-blur-xl text-center ${
            isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <input
            ref={fileInputRef}
            id="input-scan-file"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 cursor-pointer transition flex flex-col items-center justify-center max-w-lg mx-auto ${
              isDark
                ? 'border-slate-700 hover:border-cyan-400/80 bg-slate-950/30 hover:bg-cyan-500/5'
                : 'border-slate-300 hover:border-cyan-600 bg-slate-50 hover:bg-cyan-50/50 shadow-xs'
            }`}
          >
            <div className={`p-4 rounded-2xl border mb-4 ${
              isDark
                ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                : 'bg-cyan-100 border-cyan-300 text-cyan-700'
            }`}>
              <Upload className="w-8 h-8" />
            </div>
            <h3 className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Upload QR Code Image</h3>
            <p className={`text-xs mt-1 max-w-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Drag and drop an image here, or click to browse (PNG, JPG, WEBP, SVG)
            </p>
            <span className={`mt-4 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
            }`}>
              Select File
            </span>
          </div>
        </div>
      )}

      {/* Detected QR Results Display */}
      {scannedResult && (
        <div
          className={`p-6 rounded-3xl border shadow-2xl backdrop-blur-xl animate-scaleIn ${
            isDark
              ? 'bg-slate-900/90 border-cyan-500/40 text-slate-100'
              : 'bg-white border-cyan-600/40 text-slate-900 shadow-cyan-500/10'
          }`}
        >
          <div className={`flex items-center justify-between pb-4 border-b ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${
                isDark
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                  : 'bg-cyan-100 text-cyan-800 border-cyan-300'
              }`}>
                <CategoryIcon className="w-5 h-5" />
              </div>
              <div>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${
                  isDark ? 'text-cyan-400' : 'text-cyan-700'
                }`}>
                  {scannedResult.category}
                </span>
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{scannedResult.title}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-copy-scanned-content"
                onClick={handleCopyScannedText}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {scannedResult.isLink && (
                <button
                  id="btn-open-scanned-link"
                  onClick={handleOpenLink}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Link</span>
                </button>
              )}
            </div>
          </div>

          {/* Structured details if available */}
          {scannedResult.details && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {Object.entries(scannedResult.details).map(([key, val]) => (
                <div key={key} className={`p-2.5 rounded-xl border ${
                  isDark
                    ? 'bg-slate-950/40 border-slate-800'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{key}: </span>
                  <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{val}</span>
                </div>
              ))}
            </div>
          )}

          {/* Raw payload string */}
          <div className={`mt-4 p-3.5 rounded-2xl border ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Raw Encoded Content
            </span>
            <p className={`font-mono text-xs break-all select-all leading-relaxed ${
              isDark ? 'text-cyan-300' : 'text-cyan-800 font-semibold'
            }`}>
              {scannedResult.displayValue}
            </p>
          </div>

          {/* Optional Action: Send to Generator to edit or customize */}
          {onSendToGenerator && (
            <div className="mt-4 pt-3 flex justify-end">
              <button
                onClick={() => onSendToGenerator(scannedResult.displayValue)}
                className={`flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer ${
                  isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-700 hover:text-cyan-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Remix / Style in Generator</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Safety URL confirmation dialog */}
      {showUrlConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-3 text-amber-500 mb-3">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>External Link Safety Check</h3>
            </div>

            <p className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              NOVA QR will never automatically open external links without your consent. Verify the destination URL before visiting:
            </p>

            <div className={`p-3 rounded-xl border font-mono text-xs break-all mb-5 ${
              isDark ? 'bg-slate-950 border-slate-800 text-cyan-300' : 'bg-slate-50 border-slate-200 text-cyan-800 font-semibold'
            }`}>
              {scannedResult?.linkUrl}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowUrlConfirm(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmOpenLink}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
              >
                Continue to URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
