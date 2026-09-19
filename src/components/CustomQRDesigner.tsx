import React, { useState, useRef } from 'react';
import {
  Palette,
  Sparkles,
  Download,
  Copy,
  Printer,
  Check,
  RotateCcw,
  Sliders,
  Type,
  Image as ImageIcon,
  Shield,
  Star,
  Coffee,
  Wifi,
  ShoppingBag,
  Camera,
  Globe,
  Smartphone,
  Zap,
  Heart,
  QrCode,
  Tag,
  Layers,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  Link,
  Lock,
} from 'lucide-react';
import {
  QRStyleConfig,
  QRFrameType,
  QRDesignerConfig,
  DotType,
  CornerSquareType,
  CornerDotType,
  ErrorCorrectionLevel,
  QRHistoryItem,
} from '../types';
import { QRCanvas, QRCanvasRef } from './QRCanvas';
import { saveHistoryItem } from '../utils/storage';
import { DEFAULT_STYLE } from '../utils/qrPresets';

interface CustomQRDesignerProps {
  theme: 'dark' | 'light';
  onAddToast: (title: string, description?: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  onRefreshHistory: () => void;
  initialContent?: string;
  onSyncTrigger?: () => void;
}

// Preset designer templates
interface DesignerTemplate {
  id: string;
  name: string;
  tagline: string;
  previewBg: string;
  designerConfig: QRDesignerConfig;
  styleConfig: QRStyleConfig;
}

const DESIGNER_TEMPLATES: DesignerTemplate[] = [
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    tagline: 'Futuristic glowing bottom badge',
    previewBg: 'from-cyan-900 to-slate-950',
    designerConfig: {
      frameType: 'scan-me-bottom',
      frameText: 'SCAN ME',
      frameSubtext: 'Point your camera & tap link',
      frameBgColor: '#090d16',
      frameTextColor: '#38bdf8',
      frameAccentColor: '#06b6d4',
      showIcon: true,
    },
    styleConfig: {
      ...DEFAULT_STYLE,
      fgColor: '#06b6d4',
      bgColor: '#090d16',
      dotType: 'classy-rounded',
      cornerSquareType: 'extra-rounded',
      cornerDotType: 'dot',
      cornerSquareColor: '#38bdf8',
      cornerDotColor: '#f43f5e',
      gradient: {
        enabled: true,
        type: 'linear',
        rotation: 45,
        colorStops: [
          { offset: 0, color: '#06b6d4' },
          { offset: 1, color: '#ec4899' },
        ],
      },
      errorCorrection: 'Q',
    },
  },
  {
    id: 'vintage-espresso',
    name: 'Espresso Menu',
    tagline: 'Warm artisanal polaroid card',
    previewBg: 'from-amber-950 to-stone-900',
    designerConfig: {
      frameType: 'polaroid',
      frameText: 'DIGITAL MENU',
      frameSubtext: 'Table #04 · Artisan Brews',
      frameBgColor: '#fef3c7',
      frameTextColor: '#451a03',
      frameAccentColor: '#78350f',
      showIcon: true,
    },
    styleConfig: {
      ...DEFAULT_STYLE,
      fgColor: '#451a03',
      bgColor: '#fef3c7',
      dotType: 'rounded',
      cornerSquareType: 'extra-rounded',
      cornerDotType: 'dot',
      cornerSquareColor: '#78350f',
      cornerDotColor: '#92400e',
      errorCorrection: 'Q',
    },
  },
  {
    id: 'vip-ticket',
    name: 'VIP Pass Ticket',
    tagline: 'Concert & coupon perforated ticket',
    previewBg: 'from-amber-900/60 to-slate-950',
    designerConfig: {
      frameType: 'ticket',
      frameText: 'ADMIT ONE · VIP',
      frameSubtext: 'Hold near turnstile scanner',
      frameBgColor: '#0f172a',
      frameTextColor: '#f59e0b',
      frameAccentColor: '#d97706',
      showIcon: true,
    },
    styleConfig: {
      ...DEFAULT_STYLE,
      fgColor: '#f59e0b',
      bgColor: '#0f172a',
      dotType: 'classy',
      cornerSquareType: 'square',
      cornerDotType: 'square',
      cornerSquareColor: '#fbbf24',
      cornerDotColor: '#d97706',
      errorCorrection: 'Q',
    },
  },
  {
    id: 'modern-business',
    name: 'Executive Pill',
    tagline: 'Clean corporate capsule card',
    previewBg: 'from-blue-950 to-slate-900',
    designerConfig: {
      frameType: 'pill',
      frameText: 'CONNECT PROFILE',
      frameSubtext: 'Direct vCard & WhatsApp',
      frameBgColor: '#030712',
      frameTextColor: '#60a5fa',
      frameAccentColor: '#3b82f6',
      showIcon: true,
    },
    styleConfig: {
      ...DEFAULT_STYLE,
      fgColor: '#3b82f6',
      bgColor: '#030712',
      dotType: 'rounded',
      cornerSquareType: 'extra-rounded',
      cornerDotType: 'dot',
      cornerSquareColor: '#60a5fa',
      cornerDotColor: '#3b82f6',
      errorCorrection: 'H',
    },
  },
  {
    id: 'speech-bubble',
    name: 'Social Chat',
    tagline: 'Engaging conversational banner',
    previewBg: 'from-pink-950 to-purple-950',
    designerConfig: {
      frameType: 'balloon',
      frameText: 'FOLLOW OUR STORY',
      frameSubtext: 'New drops & promotions',
      frameBgColor: '#1e1b4b',
      frameTextColor: '#f472b6',
      frameAccentColor: '#ec4899',
      showIcon: true,
    },
    styleConfig: {
      ...DEFAULT_STYLE,
      fgColor: '#ec4899',
      bgColor: '#1e1b4b',
      dotType: 'extra-rounded',
      cornerSquareType: 'extra-rounded',
      cornerDotType: 'dot',
      cornerSquareColor: '#f472b6',
      cornerDotColor: '#a855f7',
      gradient: {
        enabled: true,
        type: 'linear',
        rotation: 90,
        colorStops: [
          { offset: 0, color: '#ec4899' },
          { offset: 1, color: '#8b5cf6' },
        ],
      },
      errorCorrection: 'Q',
    },
  },
];

// Center emblem sticker library
const STICKER_ICONS = [
  { id: 'none', label: 'None', icon: null },
  { id: 'zap', label: 'Energy Zap', icon: Zap },
  { id: 'shield', label: 'Shield', icon: Shield },
  { id: 'star', label: 'Golden Star', icon: Star },
  { id: 'wifi', label: 'Wi-Fi AP', icon: Wifi },
  { id: 'coffee', label: 'Coffee Cup', icon: Coffee },
  { id: 'camera', label: 'Scanner', icon: Camera },
  { id: 'heart', label: 'Heart', icon: Heart },
  { id: 'bag', label: 'Shopping', icon: ShoppingBag },
  { id: 'globe', label: 'Web Link', icon: Globe },
  { id: 'phone', label: 'Mobile', icon: Smartphone },
];

export const CustomQRDesigner: React.FC<CustomQRDesignerProps> = ({
  theme,
  onAddToast,
  onRefreshHistory,
  initialContent = 'https://nova-qr.app',
  onSyncTrigger,
}) => {
  const [activeStudioTab, setActiveStudioTab] = useState<'templates' | 'frames' | 'patterns' | 'stickers' | 'payload'>('frames');
  const [content, setContent] = useState(initialContent);

  // Designer Frame State
  const [designerConfig, setDesignerConfig] = useState<QRDesignerConfig>({
    frameType: 'scan-me-bottom',
    frameText: 'SCAN ME',
    frameSubtext: 'Use your smartphone camera',
    frameBgColor: '#090d16',
    frameTextColor: '#38bdf8',
    frameAccentColor: '#06b6d4',
    showIcon: true,
  });

  // QR Style State
  const [styleConfig, setStyleConfig] = useState<QRStyleConfig>({
    ...DEFAULT_STYLE,
    fgColor: '#06b6d4',
    bgColor: '#090d16',
    dotType: 'classy-rounded',
    cornerSquareType: 'extra-rounded',
    cornerDotType: 'dot',
    cornerSquareColor: '#38bdf8',
    cornerDotColor: '#06b6d4',
    gradient: {
      enabled: true,
      type: 'linear',
      rotation: 45,
      colorStops: [
        { offset: 0, color: '#06b6d4' },
        { offset: 1, color: '#3b82f6' },
      ],
    },
    errorCorrection: 'Q',
    margin: 8,
  });

  const [selectedSticker, setSelectedSticker] = useState<string>('none');
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const qrCanvasRef = useRef<QRCanvasRef>(null);
  const compositeCardRef = useRef<HTMLDivElement>(null);

  // Apply a Designer Template
  const handleApplyTemplate = (tpl: DesignerTemplate) => {
    setDesignerConfig(tpl.designerConfig);
    setStyleConfig(tpl.styleConfig);
    onAddToast('Template Applied', `"${tpl.name}" design loaded successfully`, 'success');
  };

  // Convert an SVG Sticker into a data URL for embedding in qr-code-styling
  const handleSelectSticker = (stickerId: string) => {
    setSelectedSticker(stickerId);
    if (stickerId === 'none') {
      setStyleConfig((prev) => ({ ...prev, logoUrl: undefined }));
      return;
    }

    // Generate high-contrast SVG data URI for the sticker
    const stickerColors: Record<string, string> = {
      zap: '#f59e0b',
      shield: '#3b82f6',
      star: '#fbbf24',
      wifi: '#06b6d4',
      coffee: '#d97706',
      camera: '#10b981',
      heart: '#f43f5e',
      bag: '#a855f7',
      globe: '#38bdf8',
      phone: '#6366f1',
    };
    const accent = stickerColors[stickerId] || '#38bdf8';

    const svgIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" fill="#030712" stroke="${accent}" stroke-width="6"/>
        <circle cx="50" cy="50" r="36" fill="${accent}" fill-opacity="0.18"/>
        <text x="50" y="58" font-size="34" text-anchor="middle" fill="${accent}" font-family="sans-serif" font-weight="900">★</text>
      </svg>
    `;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgIcon.trim())}`;
    setStyleConfig((prev) => ({
      ...prev,
      logoUrl: dataUrl,
      logoSize: 0.28,
      errorCorrection: 'H', // upgrade error correction for center sticker
    }));
  };

  // Handle custom logo image file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedSticker('custom');
      setStyleConfig((prev) => ({
        ...prev,
        logoUrl: result,
        logoSize: 0.26,
        errorCorrection: 'H',
      }));
      onAddToast('Logo Loaded', 'Center image embedded into custom QR code', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Composite High-Resolution Canvas Download (Renders frame + QR together)
  const handleCompositeDownload = async (format: 'png' | 'jpeg' = 'png') => {
    setIsExporting(true);
    try {
      if (designerConfig.frameType === 'none') {
        // Simple direct download
        await qrCanvasRef.current?.download(format, 1200);
        onAddToast('Download Complete', `High-res ${format.toUpperCase()} saved`, 'success');
        return;
      }

      // Generate off-screen composite canvas
      const width = 1000;
      const height =
        designerConfig.frameType === 'polaroid'
          ? 1300
          : designerConfig.frameType === 'ticket'
          ? 1350
          : 1250;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        await qrCanvasRef.current?.download(format, 1024);
        return;
      }

      // Draw Card Background
      ctx.fillStyle = designerConfig.frameBgColor;
      ctx.fillRect(0, 0, width, height);

      // Draw Accent Border
      ctx.strokeStyle = designerConfig.frameAccentColor;
      ctx.lineWidth = 14;
      ctx.strokeRect(16, 16, width - 32, height - 32);

      // For ticket style, draw notch cutouts
      if (designerConfig.frameType === 'ticket') {
        ctx.fillStyle = '#020617';
        // Left notch
        ctx.beginPath();
        ctx.arc(16, height * 0.72, 40, 0, Math.PI * 2);
        ctx.fill();
        // Right notch
        ctx.beginPath();
        ctx.arc(width - 16, height * 0.72, 40, 0, Math.PI * 2);
        ctx.fill();

        // Dashed perforation line
        ctx.setLineDash([16, 12]);
        ctx.strokeStyle = designerConfig.frameAccentColor + '60';
        ctx.beginPath();
        ctx.moveTo(60, height * 0.72);
        ctx.lineTo(width - 60, height * 0.72);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw Top Banner if scan-me-top
      if (designerConfig.frameType === 'scan-me-top') {
        ctx.fillStyle = designerConfig.frameAccentColor;
        ctx.fillRect(20, 20, width - 40, 140);
        ctx.fillStyle = '#020617';
        ctx.font = 'bold 52px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(designerConfig.frameText.toUpperCase(), width / 2, 108);
      }

      // Get QR Code Image Blob
      const qrBlob = await qrCanvasRef.current?.getBlob('png');
      if (qrBlob) {
        const img = new Image();
        const url = URL.createObjectURL(qrBlob);
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = url;
        });

        // Draw QR in center
        const qrSize = 640;
        const qrX = (width - qrSize) / 2;
        const qrY =
          designerConfig.frameType === 'scan-me-top'
            ? 200
            : designerConfig.frameType === 'polaroid'
            ? 120
            : 130;

        ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
        URL.revokeObjectURL(url);
      }

      // Draw Bottom CTA Badge (scan-me-bottom, polaroid, pill, ticket)
      if (designerConfig.frameType !== 'scan-me-top') {
        const textY =
          designerConfig.frameType === 'polaroid'
            ? 880
            : designerConfig.frameType === 'ticket'
            ? 860
            : 860;

        // Badge pill background
        if (designerConfig.frameType === 'scan-me-bottom' || designerConfig.frameType === 'pill') {
          ctx.fillStyle = designerConfig.frameAccentColor;
          const pillW = 540;
          const pillH = 100;
          const pillX = (width - pillW) / 2;
          const pillY = textY - 60;
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillW, pillH, 50);
          ctx.fill();

          ctx.fillStyle = '#020617';
          ctx.font = 'bold 46px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(designerConfig.frameText.toUpperCase(), width / 2, textY + 8);
        } else {
          ctx.fillStyle = designerConfig.frameTextColor;
          ctx.font = 'bold 54px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(designerConfig.frameText.toUpperCase(), width / 2, textY);
        }

        // Subtext
        if (designerConfig.frameSubtext) {
          ctx.fillStyle = designerConfig.frameTextColor + 'aa';
          ctx.font = '32px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(designerConfig.frameSubtext, width / 2, textY + 90);
        }
      }

      // Download file
      const link = document.createElement('a');
      link.download = `nova-designed-qr-${Date.now()}.${format}`;
      link.href = canvas.toDataURL(`image/${format}`, 0.95);
      link.click();

      onAddToast('Designer Badge Exported', `High-resolution framed graphic downloaded (${width}x${height}px)`, 'success');
    } catch (err) {
      console.error(err);
      onAddToast('Export Warning', 'Fallback to standard QR export', 'info');
      await qrCanvasRef.current?.download('png', 1024);
    } finally {
      setIsExporting(false);
    }
  };

  // Save to history & trigger cloud sync
  const handleSaveToHistory = () => {
    saveHistoryItem({
      type: 'url',
      title: designerConfig.frameText || 'Custom Designed QR',
      content,
      style: styleConfig,
    });
    onRefreshHistory();
    onSyncTrigger?.();
    onAddToast('Saved to History', 'Designed QR saved and synced with cloud', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(content);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    onAddToast('Link Copied', content, 'info');
  };

  const isDark = theme === 'dark';

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-6 space-y-6 animate-fadeIn">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-xs">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Custom QR Designer Studio
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Studio Pro
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Design custom "SCAN ME" frames, multi-color gradients, ticket stubs, and brand stickers.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSaveToHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer border border-slate-700"
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Save to History</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print Badge</span>
          </button>
          <button
            onClick={() => handleCompositeDownload('png')}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition cursor-pointer shadow-md shadow-cyan-500/20 disabled:opacity-60"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export High-Res'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Workspace: Left Controls (55%), Right Live Canvas (45%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Creative Customizer Suite */}
        <div className="lg:col-span-7 space-y-4">
          {/* Navigation Pill Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900/80 border border-slate-800 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveStudioTab('frames')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeStudioTab === 'frames'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Frames & Badges</span>
            </button>

            <button
              onClick={() => setActiveStudioTab('templates')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeStudioTab === 'templates'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pro Templates</span>
            </button>

            <button
              onClick={() => setActiveStudioTab('patterns')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeStudioTab === 'patterns'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Gradients & Eyes</span>
            </button>

            <button
              onClick={() => setActiveStudioTab('stickers')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeStudioTab === 'stickers'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Center Stickers</span>
            </button>

            <button
              onClick={() => setActiveStudioTab('payload')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeStudioTab === 'payload'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              <span>Target Content</span>
            </button>
          </div>

          {/* TAB 1: FRAMES & BADGES */}
          {activeStudioTab === 'frames' && (
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                  Select Frame Layout
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'scan-me-bottom', label: 'Scan Me Badge', desc: 'Pill CTA at bottom' },
                    { id: 'scan-me-top', label: 'Top Banner', desc: 'Header banner' },
                    { id: 'polaroid', label: 'Polaroid', desc: 'Artisanal photo frame' },
                    { id: 'ticket', label: 'Ticket Stub', desc: 'Notched coupon pass' },
                    { id: 'balloon', label: 'Speech Bubble', desc: 'Conversational CTA' },
                    { id: 'pill', label: 'Capsule Pill', desc: 'Curved modern bezel' },
                    { id: 'phone', label: 'Smartphone', desc: 'Phone screen mockup' },
                    { id: 'none', label: 'Borderless', desc: 'Pure minimal QR' },
                  ].map((frm) => (
                    <button
                      key={frm.id}
                      type="button"
                      onClick={() =>
                        setDesignerConfig((prev) => ({
                          ...prev,
                          frameType: frm.id as QRFrameType,
                        }))
                      }
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                        designerConfig.frameType === frm.id
                          ? 'border-cyan-400 bg-cyan-500/10 ring-1 ring-cyan-400'
                          : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-200">{frm.label}</span>
                        {designerConfig.frameType === frm.id && (
                          <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 flex items-center justify-center text-slate-950">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">{frm.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {designerConfig.frameType !== 'none' && (
                <div className="space-y-4 pt-2 border-t border-slate-800/80">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Primary CTA Text
                      </label>
                      <input
                        type="text"
                        value={designerConfig.frameText}
                        onChange={(e) =>
                          setDesignerConfig((prev) => ({ ...prev, frameText: e.target.value }))
                        }
                        placeholder="e.g. SCAN ME, VISIT MENU, CONNECT"
                        className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-950/80 border border-slate-800 text-slate-100 focus:border-cyan-400 outline-none uppercase font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Secondary Instruction / Caption
                      </label>
                      <input
                        type="text"
                        value={designerConfig.frameSubtext || ''}
                        onChange={(e) =>
                          setDesignerConfig((prev) => ({ ...prev, frameSubtext: e.target.value }))
                        }
                        placeholder="e.g. Point phone camera & tap"
                        className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-950/80 border border-slate-800 text-slate-100 focus:border-cyan-400 outline-none"
                      />
                    </div>
                  </div>

                  {/* Frame Colors */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Frame Background
                      </label>
                      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <input
                          type="color"
                          value={designerConfig.frameBgColor}
                          onChange={(e) => {
                            setDesignerConfig((prev) => ({ ...prev, frameBgColor: e.target.value }));
                            setStyleConfig((prev) => ({ ...prev, bgColor: e.target.value }));
                          }}
                          className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs font-mono text-slate-300">{designerConfig.frameBgColor}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Frame Text Color
                      </label>
                      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <input
                          type="color"
                          value={designerConfig.frameTextColor}
                          onChange={(e) =>
                            setDesignerConfig((prev) => ({ ...prev, frameTextColor: e.target.value }))
                          }
                          className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs font-mono text-slate-300">{designerConfig.frameTextColor}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Accent / Border Color
                      </label>
                      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <input
                          type="color"
                          value={designerConfig.frameAccentColor}
                          onChange={(e) =>
                            setDesignerConfig((prev) => ({ ...prev, frameAccentColor: e.target.value }))
                          }
                          className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs font-mono text-slate-300">{designerConfig.frameAccentColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRO TEMPLATES */}
          {activeStudioTab === 'templates' && (
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">1-Click Curated Designer Templates</h3>
                <p className="text-xs text-slate-400">
                  Select a professionally configured preset with tuned frames, contrast, and corner accents.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DESIGNER_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="p-4 rounded-2xl bg-gradient-to-br border border-slate-800 hover:border-cyan-500/50 transition cursor-pointer text-left group relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-white group-hover:text-cyan-300 transition">
                        {tpl.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                        {tpl.designerConfig.frameType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mb-3">{tpl.tagline}</p>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                        style={{ backgroundColor: tpl.styleConfig.fgColor }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                        style={{ backgroundColor: tpl.designerConfig.frameAccentColor }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                        style={{ backgroundColor: tpl.designerConfig.frameBgColor }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PATTERNS & GRADIENTS */}
          {activeStudioTab === 'patterns' && (
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
              {/* Dot Shape */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  QR Dot Matrix Shape
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(['dots', 'rounded', 'classy', 'classy-rounded', 'square', 'extra-rounded'] as DotType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setStyleConfig((prev) => ({ ...prev, dotType: type }))}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold border text-center transition cursor-pointer capitalize ${
                        styleConfig.dotType === type
                          ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-400'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white'
                      }`}
                    >
                      {type.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gradient Mode Toggle */}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-300">Multi-Color Gradient</span>
                    <p className="text-[11px] text-slate-400">Add dynamic color blending to the QR matrix</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setStyleConfig((prev) => ({
                        ...prev,
                        gradient: {
                          enabled: !prev.gradient?.enabled,
                          type: prev.gradient?.type || 'linear',
                          rotation: prev.gradient?.rotation ?? 45,
                          colorStops: prev.gradient?.colorStops || [
                            { offset: 0, color: prev.fgColor },
                            { offset: 1, color: '#ec4899' },
                          ],
                        },
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${
                      styleConfig.gradient?.enabled ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        styleConfig.gradient?.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {styleConfig.gradient?.enabled && (
                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Gradient Start Color
                        </label>
                        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                          <input
                            type="color"
                            value={styleConfig.gradient.colorStops[0]?.color || styleConfig.fgColor}
                            onChange={(e) => {
                              const val = e.target.value;
                              setStyleConfig((prev) => ({
                                ...prev,
                                fgColor: val,
                                gradient: {
                                  ...prev.gradient!,
                                  colorStops: [
                                    { offset: 0, color: val },
                                    prev.gradient!.colorStops[1] || { offset: 1, color: '#ec4899' },
                                  ],
                                },
                              }));
                            }}
                            className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                          />
                          <span className="text-xs font-mono text-slate-200">
                            {styleConfig.gradient.colorStops[0]?.color}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Gradient End Color
                        </label>
                        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                          <input
                            type="color"
                            value={styleConfig.gradient.colorStops[1]?.color || '#ec4899'}
                            onChange={(e) => {
                              const val = e.target.value;
                              setStyleConfig((prev) => ({
                                ...prev,
                                gradient: {
                                  ...prev.gradient!,
                                  colorStops: [
                                    prev.gradient!.colorStops[0] || { offset: 0, color: prev.fgColor },
                                    { offset: 1, color: val },
                                  ],
                                },
                              }));
                            }}
                            className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                          />
                          <span className="text-xs font-mono text-slate-200">
                            {styleConfig.gradient.colorStops[1]?.color}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Gradient Angle Slider */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span>Rotation Angle</span>
                        <span className="font-mono text-cyan-400">{styleConfig.gradient.rotation}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="15"
                        value={styleConfig.gradient.rotation}
                        onChange={(e) => {
                          const rot = parseInt(e.target.value, 10);
                          setStyleConfig((prev) => ({
                            ...prev,
                            gradient: {
                              ...prev.gradient!,
                              rotation: rot,
                            },
                          }));
                        }}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Corner Eye Customization */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Independent Corner Eye Accents
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Corner Square */}
                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <span className="text-xs font-semibold text-slate-300">Outer Eye Square</span>
                    <div className="flex items-center gap-1.5">
                      {(['extra-rounded', 'square', 'dot'] as CornerSquareType[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setStyleConfig((prev) => ({ ...prev, cornerSquareType: t }))}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-semibold border capitalize transition ${
                            styleConfig.cornerSquareType === t
                              ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300'
                              : 'border-slate-800 text-slate-400'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="color"
                        value={styleConfig.cornerSquareColor || styleConfig.fgColor}
                        onChange={(e) =>
                          setStyleConfig((prev) => ({ ...prev, cornerSquareColor: e.target.value }))
                        }
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-slate-300">
                        {styleConfig.cornerSquareColor || styleConfig.fgColor}
                      </span>
                    </div>
                  </div>

                  {/* Corner Dot */}
                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <span className="text-xs font-semibold text-slate-300">Inner Eye Dot</span>
                    <div className="flex items-center gap-1.5">
                      {(['dot', 'square'] as CornerDotType[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setStyleConfig((prev) => ({ ...prev, cornerDotType: t }))}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-semibold border capitalize transition ${
                            styleConfig.cornerDotType === t
                              ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300'
                              : 'border-slate-800 text-slate-400'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="color"
                        value={styleConfig.cornerDotColor || styleConfig.fgColor}
                        onChange={(e) =>
                          setStyleConfig((prev) => ({ ...prev, cornerDotColor: e.target.value }))
                        }
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-slate-300">
                        {styleConfig.cornerDotColor || styleConfig.fgColor}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STICKERS & LOGOS */}
          {activeStudioTab === 'stickers' && (
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Pick a Center Vector Emblem
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {STICKER_ICONS.map((st) => {
                    const IconComp = st.icon;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleSelectSticker(st.id)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                          selectedSticker === st.id
                            ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400'
                            : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white'
                        }`}
                      >
                        {IconComp ? <IconComp className="w-5 h-5" /> : <span className="text-xs">✕</span>}
                        <span className="text-[10px] font-medium">{st.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom File Upload */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Or Upload Your Own Brand Logo
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer border border-slate-700">
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <span>Upload Image (PNG/SVG)</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {styleConfig.logoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setStyleConfig((prev) => ({ ...prev, logoUrl: undefined }));
                        setSelectedSticker('none');
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 transition"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>

                {styleConfig.logoUrl && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>Logo Scale</span>
                      <span className="font-mono text-cyan-400">{Math.round(styleConfig.logoSize * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.15"
                      max="0.38"
                      step="0.02"
                      value={styleConfig.logoSize}
                      onChange={(e) =>
                        setStyleConfig((prev) => ({ ...prev, logoSize: parseFloat(e.target.value) }))
                      }
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: TARGET PAYLOAD */}
          {activeStudioTab === 'payload' && (
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Destination URL or Text
                </label>
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="https://yourwebsite.com or text payload"
                  className="w-full px-4 py-3 rounded-xl text-xs sm:text-sm bg-slate-950/80 border border-slate-800 text-slate-100 focus:border-cyan-400 outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy Content'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Live Designed Preview Canvas */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full sticky top-24 space-y-4">
            {/* The Live Composite Card Preview */}
            <div className="flex justify-center p-4 rounded-3xl bg-slate-950/60 border border-slate-800/80 shadow-2xl">
              <div
                ref={compositeCardRef}
                className="relative flex flex-col items-center justify-center p-6 rounded-3xl transition-all duration-300 shadow-xl overflow-hidden"
                style={{
                  backgroundColor: designerConfig.frameBgColor,
                  border: designerConfig.frameType !== 'none' ? `5px solid ${designerConfig.frameAccentColor}` : 'none',
                  minWidth: '280px',
                  maxWidth: '360px',
                  width: '100%',
                }}
              >
                {/* For ticket style: simulated cutouts */}
                {designerConfig.frameType === 'ticket' && (
                  <>
                    <div className="absolute -left-3 top-3/4 w-6 h-6 rounded-full bg-slate-950 border border-slate-800" />
                    <div className="absolute -right-3 top-3/4 w-6 h-6 rounded-full bg-slate-950 border border-slate-800" />
                  </>
                )}

                {/* Top Banner (if frameType === 'scan-me-top') */}
                {designerConfig.frameType === 'scan-me-top' && (
                  <div
                    className="w-full py-2.5 px-4 mb-4 rounded-xl text-center shadow-md"
                    style={{ backgroundColor: designerConfig.frameAccentColor }}
                  >
                    <span className="text-sm font-black text-slate-950 tracking-wider">
                      {designerConfig.frameText.toUpperCase()}
                    </span>
                  </div>
                )}

                {/* The QR Matrix Canvas Component */}
                <div className="p-2 rounded-2xl bg-transparent">
                  <QRCanvas
                    ref={qrCanvasRef}
                    content={content}
                    styleConfig={{
                      ...styleConfig,
                      size: 240,
                    }}
                  />
                </div>

                {/* Bottom Frame Badge (scan-me-bottom, polaroid, pill, ticket, balloon) */}
                {designerConfig.frameType !== 'scan-me-top' && designerConfig.frameType !== 'none' && (
                  <div className="w-full flex flex-col items-center text-center mt-4">
                    {/* Bottom Pill Banner */}
                    {designerConfig.frameType === 'scan-me-bottom' || designerConfig.frameType === 'pill' ? (
                      <div
                        className="flex items-center gap-1.5 px-5 py-2 rounded-full shadow-md"
                        style={{ backgroundColor: designerConfig.frameAccentColor }}
                      >
                        <Camera className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                        <span className="text-xs font-black text-slate-950 tracking-wider">
                          {designerConfig.frameText.toUpperCase()}
                        </span>
                      </div>
                    ) : (
                      <span
                        className="text-sm font-black tracking-wide"
                        style={{ color: designerConfig.frameTextColor }}
                      >
                        {designerConfig.frameText.toUpperCase()}
                      </span>
                    )}

                    {/* Subtext */}
                    {designerConfig.frameSubtext && (
                      <span
                        className="text-[11px] mt-1.5 opacity-80"
                        style={{ color: designerConfig.frameTextColor }}
                      >
                        {designerConfig.frameSubtext}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Live Canvas Download & Share Row */}
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-300 pl-1">Export Graphic</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleCompositeDownload('png')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition cursor-pointer"
                >
                  PNG
                </button>
                <button
                  type="button"
                  onClick={() => handleCompositeDownload('jpeg')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                >
                  JPEG
                </button>
                <button
                  type="button"
                  onClick={() => qrCanvasRef.current?.download('svg', 1024)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                >
                  SVG
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
