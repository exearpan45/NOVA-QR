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

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-100">QR Code Scanner</h1>
        <p className="mt-2 text-sm text-slate-400">
          Decode QR codes using your device camera or by uploading an image.
        </p>
      </div>

      {/* Mode Selector */}
      <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-900/60 border border-slate-800 max-w-md mx-auto">
        <button
          id="btn-scanner-mode-upload"
          onClick={() => {
            stopCamera();
            setScanMode('upload');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            scanMode === 'upload'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
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
              : 'text-slate-400 hover:text-white'
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
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          {cameraError ? (
            <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 max-w-lg mx-auto">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">Camera Notice</h3>
              <p className="text-xs text-rose-200/90 leading-relaxed mb-4">{cameraError}</p>
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
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold hover:bg-rose-500/30 transition cursor-pointer"
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
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
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
            className="border-2 border-dashed border-slate-700 hover:border-cyan-400/80 rounded-2xl p-10 cursor-pointer bg-slate-950/30 hover:bg-cyan-500/5 transition flex flex-col items-center justify-center max-w-lg mx-auto"
          >
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-4">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Upload QR Code Image</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Drag and drop an image here, or click to browse (PNG, JPG, WEBP, SVG)
            </p>
            <span className="mt-4 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition">
              Select File
            </span>
          </div>
        </div>
      )}

      {/* Detected QR Results Display */}
      {scannedResult && (
        <div
          className={`p-6 rounded-3xl border shadow-2xl backdrop-blur-xl animate-scaleIn ${
            theme === 'dark'
              ? 'bg-slate-900/90 border-cyan-500/40 text-slate-100'
              : 'bg-white border-cyan-600/40 text-slate-900 shadow-cyan-500/10'
          }`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <CategoryIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                  {scannedResult.category}
                </span>
                <h3 className="text-base font-bold text-white">{scannedResult.title}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-copy-scanned-content"
                onClick={handleCopyScannedText}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
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
                <div key={key} className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-slate-400 font-medium">{key}: </span>
                  <span className="text-slate-200 font-semibold">{val}</span>
                </div>
              ))}
            </div>
          )}

          {/* Raw payload string */}
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Raw Encoded Content
            </span>
            <p className="font-mono text-xs text-cyan-300 break-all select-all leading-relaxed">
              {scannedResult.displayValue}
            </p>
          </div>

          {/* Optional Action: Send to Generator to edit or customize */}
          {onSendToGenerator && (
            <div className="mt-4 pt-3 flex justify-end">
              <button
                onClick={() => onSendToGenerator(scannedResult.displayValue)}
                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition"
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
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 mb-3">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">External Link Safety Check</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              NOVA QR will never automatically open external links without your consent. Verify the destination URL before visiting:
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 break-all mb-5">
              {scannedResult?.linkUrl}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowUrlConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmOpenLink}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition"
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
