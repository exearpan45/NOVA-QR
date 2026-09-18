import React, { useState, useRef, useMemo } from 'react';
import {
  Globe,
  FileText,
  Wifi,
  Phone,
  Mail,
  MessageSquare,
  MessageCircle,
  Contact,
  MapPin,
  Calendar,
  Download,
  Copy,
  Share2,
  Sparkles,
  Check,
  RotateCcw,
  XCircle,
  Sliders,
  Palette,
  Star,
  Shield,
} from 'lucide-react';
import {
  CalendarForm,
  EmailForm,
  LocationForm,
  QRCategory,
  QRStyleConfig,
  SmsForm,
  VCardForm,
  WhatsAppForm,
  WifiForm,
} from '../types';
import {
  formatCalendarPayload,
  formatEmailPayload,
  formatLocationPayload,
  formatPhonePayload,
  formatSmsPayload,
  formatVCardPayload,
  formatWhatsAppPayload,
  formatWifiPayload,
} from '../utils/qrPayload';
import { CategoryForms } from './CategoryForms';
import { StyleCustomizer } from './StyleCustomizer';
import { QRCanvas, QRCanvasRef } from './QRCanvas';
import { DEFAULT_STYLE } from '../utils/qrPresets';
import { saveHistoryItem } from '../utils/storage';

interface GeneratorViewProps {
  theme: 'dark' | 'light';
  onAddToast: (title: string, description?: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  onRefreshHistory: () => void;
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({
  theme,
  onAddToast,
  onRefreshHistory,
}) => {
  const [activeCategory, setActiveCategory] = useState<QRCategory>('url');
  const [activeTabMode, setActiveTabMode] = useState<'content' | 'customize'>('content');

  // Input states
  const [urlInput, setUrlInput] = useState('https://arpangoswami.dev');
  const [textInput, setTextInput] = useState('');
  const [wifiInput, setWifiInput] = useState<WifiForm>({
    ssid: '',
    password: '',
    encryption: 'WPA',
    hidden: false,
  });
  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState<EmailForm>({
    email: '',
    subject: '',
    body: '',
  });
  const [smsInput, setSmsInput] = useState<SmsForm>({
    phone: '',
    message: '',
  });
  const [whatsAppInput, setWhatsAppInput] = useState<WhatsAppForm>({
    phone: '',
    message: '',
  });
  const [vCardInput, setVCardInput] = useState<VCardForm>({
    name: '',
    phone: '',
    email: '',
    organization: '',
    website: '',
    title: '',
  });
  const [locationInput, setLocationInput] = useState<LocationForm>({
    latitude: '',
    longitude: '',
    query: '',
  });
  const [calendarInput, setCalendarInput] = useState<CalendarForm>({
    title: '',
    startDate: '',
    startTime: '10:00',
    endDate: '',
    endTime: '11:00',
    location: '',
    description: '',
  });

  // Customization state
  const [styleConfig, setStyleConfig] = useState<QRStyleConfig>(DEFAULT_STYLE);
  const [downloadResolution, setDownloadResolution] = useState<number>(1024);
  const [isCopiedContent, setIsCopiedContent] = useState(false);
  const [isCopiedImage, setIsCopiedImage] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const qrCanvasRef = useRef<QRCanvasRef>(null);

  const categories: { id: QRCategory; label: string; icon: React.ElementType }[] = [
    { id: 'url', label: 'URL', icon: Globe },
    { id: 'text', label: 'Text', icon: FileText },
    { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
    { id: 'phone', label: 'Phone', icon: Phone },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'sms', label: 'SMS', icon: MessageSquare },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { id: 'vcard', label: 'Contact', icon: Contact },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
  ];

  // Derive QR payload string dynamically
  const payloadString = useMemo(() => {
    switch (activeCategory) {
      case 'url':
        return urlInput.trim() || 'https://arpangoswami.dev';
      case 'text':
        return textInput.trim() || 'Hello from NOVA QR!';
      case 'wifi':
        return wifiInput.ssid ? formatWifiPayload(wifiInput) : 'WIFI:S:NOVA-Network;T:WPA;P:Password123;;';
      case 'phone':
        return phoneInput.trim() ? formatPhonePayload(phoneInput) : 'tel:+15550192834';
      case 'email':
        return emailInput.email ? formatEmailPayload(emailInput) : 'mailto:info@example.com';
      case 'sms':
        return smsInput.phone ? formatSmsPayload(smsInput) : 'sms:+15550192834';
      case 'whatsapp':
        return whatsAppInput.phone ? formatWhatsAppPayload(whatsAppInput) : 'https://wa.me/15550192834';
      case 'vcard':
        return vCardInput.name ? formatVCardPayload(vCardInput) : formatVCardPayload({
          name: 'Arpan Goswami',
          phone: '+1 555-0199',
          email: 'arpan@example.com',
          organization: 'NOVA QR',
          website: 'https://arpangoswami.dev',
          title: 'Software Developer',
        });
      case 'location':
        return formatLocationPayload(locationInput) || 'https://www.google.com/maps?q=37.7749,-122.4194';
      case 'calendar':
        return calendarInput.title ? formatCalendarPayload(calendarInput) : 'BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:NOVA Event\nEND:VEVENT\nEND:VCALENDAR';
      default:
        return 'https://arpangoswami.dev';
    }
  }, [
    activeCategory,
    urlInput,
    textInput,
    wifiInput,
    phoneInput,
    emailInput,
    smsInput,
    whatsAppInput,
    vCardInput,
    locationInput,
    calendarInput,
  ]);

  // Derived Title for history & labels
  const payloadTitle = useMemo(() => {
    switch (activeCategory) {
      case 'url':
        return urlInput || 'Website Link';
      case 'text':
        return textInput.slice(0, 30) || 'Text Note';
      case 'wifi':
        return wifiInput.ssid ? `Wi-Fi: ${wifiInput.ssid}` : 'Wi-Fi Network';
      case 'phone':
        return phoneInput ? `Phone: ${phoneInput}` : 'Phone Call';
      case 'email':
        return emailInput.email ? `Email: ${emailInput.email}` : 'Email Message';
      case 'sms':
        return smsInput.phone ? `SMS: ${smsInput.phone}` : 'SMS Message';
      case 'whatsapp':
        return whatsAppInput.phone ? `WhatsApp: ${whatsAppInput.phone}` : 'WhatsApp Chat';
      case 'vcard':
        return vCardInput.name ? `Contact: ${vCardInput.name}` : 'vCard Contact';
      case 'location':
        return locationInput.query || (locationInput.latitude ? `GPS: ${locationInput.latitude}, ${locationInput.longitude}` : 'Location');
      case 'calendar':
        return calendarInput.title || 'Calendar Event';
    }
  }, [
    activeCategory,
    urlInput,
    textInput,
    wifiInput,
    phoneInput,
    emailInput,
    smsInput,
    whatsAppInput,
    vCardInput,
    locationInput,
    calendarInput,
  ]);

  // Actions
  const handleDownload = async (ext: 'png' | 'svg' | 'jpeg') => {
    try {
      await qrCanvasRef.current?.download(ext, downloadResolution);
      onAddToast('QR Downloaded', `Saved as ${ext.toUpperCase()} at ${downloadResolution}x${downloadResolution}px`, 'success');
      // Record in local history
      saveHistoryItem({
        type: activeCategory,
        title: payloadTitle,
        content: payloadString,
        style: styleConfig,
      });
      onRefreshHistory();
    } catch {
      onAddToast('Download Error', 'Could not generate image file for download', 'error');
    }
  };

  const handleCopyImage = async () => {
    try {
      const blob = await qrCanvasRef.current?.getBlob('png');
      if (blob && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ]);
        setIsCopiedImage(true);
        setTimeout(() => setIsCopiedImage(false), 2200);
        onAddToast('Copied QR Image', 'QR Code image copied to your clipboard', 'success');
      } else {
        throw new Error('ClipboardItem not supported');
      }
    } catch {
      onAddToast('Clipboard Notice', 'Direct image copy not supported on this browser. Use Download PNG instead.', 'info');
    }
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(payloadString);
      setIsCopiedContent(true);
      setTimeout(() => setIsCopiedContent(false), 2000);
      onAddToast('Content Copied', 'Encoded text/link copied to clipboard', 'success');
    } catch {
      onAddToast('Copy Error', 'Failed to write to clipboard', 'error');
    }
  };

  const handleShareQR = async () => {
    try {
      const blob = await qrCanvasRef.current?.getBlob('png');
      if (blob && navigator.canShare) {
        const file = new File([blob], 'nova-qr.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'NOVA QR Code',
            text: `QR Code for ${payloadTitle}`,
            files: [file],
          });
          onAddToast('Shared Successfully', 'QR Code shared via device dialog', 'success');
          return;
        }
      }

      // Fallback share URL / text
      if (navigator.share) {
        await navigator.share({
          title: 'NOVA QR Code',
          text: payloadString,
          url: payloadString.startsWith('http') ? payloadString : undefined,
        });
        onAddToast('Shared', 'QR content shared', 'success');
      } else {
        // Fallback to copy
        await handleCopyContent();
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        onAddToast('Share Fallback', 'Copied QR content to clipboard', 'info');
        handleCopyContent();
      }
    }
  };

  const handleExplicitGenerate = () => {
    saveHistoryItem({
      type: activeCategory,
      title: payloadTitle,
      content: payloadString,
      style: styleConfig,
    });
    onRefreshHistory();
    onAddToast('QR Generated', 'Code saved to your local history', 'success');
  };

  const handleClearInputs = () => {
    switch (activeCategory) {
      case 'url':
        setUrlInput('');
        break;
      case 'text':
        setTextInput('');
        break;
      case 'wifi':
        setWifiInput({ ssid: '', password: '', encryption: 'WPA', hidden: false });
        break;
      case 'phone':
        setPhoneInput('');
        break;
      case 'email':
        setEmailInput({ email: '', subject: '', body: '' });
        break;
      case 'sms':
        setSmsInput({ phone: '', message: '' });
        break;
      case 'whatsapp':
        setWhatsAppInput({ phone: '', message: '' });
        break;
      case 'vcard':
        setVCardInput({ name: '', phone: '', email: '', organization: '', website: '', title: '' });
        break;
      case 'location':
        setLocationInput({ latitude: '', longitude: '', query: '' });
        break;
      case 'calendar':
        setCalendarInput({ title: '', startDate: '', startTime: '10:00', endDate: '', endTime: '11:00', location: '', description: '' });
        break;
    }
    onAddToast('Inputs Cleared', 'Active fields have been emptied', 'info');
  };

  const handleResetAll = () => {
    handleClearInputs();
    setStyleConfig(DEFAULT_STYLE);
    onAddToast('Reset Complete', 'Inputs and styling restored to defaults', 'info');
  };

  const handleToggleFavoriteCurrent = () => {
    setIsFavorite(!isFavorite);
    onAddToast(
      !isFavorite ? 'Added to Favorites' : 'Removed from Favorites',
      payloadTitle,
      'success'
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Home Header / Title */}
      <div className="text-center max-w-2xl mx-auto pt-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
          QR Code Generator
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-400">
          Create customized, high-precision QR codes in seconds.
        </p>
      </div>

      {/* Main Grid: Left Config Panel & Right Live Preview Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input & Customizer Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Card */}
          <div
            className={`p-5 sm:p-6 rounded-3xl border shadow-xl backdrop-blur-xl ${
              theme === 'dark'
                ? 'bg-slate-900/60 border-slate-800'
                : 'bg-white/90 border-slate-200'
            }`}
          >
            {/* Category Carousel / Tab Selector */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Select Content Category
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      id={`cat-tab-${cat.id}`}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 border ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 ring-1 ring-cyan-400/20 shadow-xs'
                          : theme === 'dark'
                          ? 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : ''}`} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub Mode Tabs: Content vs Customize Style */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950/40 border border-slate-800/80 mb-6">
              <button
                id="tab-mode-content"
                onClick={() => setActiveTabMode('content')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTabMode === 'content'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>1. Enter Content</span>
              </button>
              <button
                id="tab-mode-customize"
                onClick={() => setActiveTabMode('customize')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTabMode === 'customize'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>2. Customize Style & Logo</span>
              </button>
            </div>

            {/* Content Tab */}
            {activeTabMode === 'content' ? (
              <div className="space-y-6">
                <CategoryForms
                  category={activeCategory}
                  urlValue={urlInput}
                  onUrlChange={setUrlInput}
                  textValue={textInput}
                  onTextChange={setTextInput}
                  wifiForm={wifiInput}
                  onWifiChange={setWifiInput}
                  phoneValue={phoneInput}
                  onPhoneChange={setPhoneInput}
                  emailForm={emailInput}
                  onEmailChange={setEmailInput}
                  smsForm={smsInput}
                  onSmsChange={setSmsInput}
                  whatsAppForm={whatsAppInput}
                  onWhatsAppChange={setWhatsAppInput}
                  vCardForm={vCardInput}
                  onVCardChange={setVCardInput}
                  locationForm={locationInput}
                  onLocationChange={setLocationInput}
                  calendarForm={calendarInput}
                  onCalendarChange={setCalendarInput}
                  theme={theme}
                />

                {/* Form Quick Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-clear-fields"
                      onClick={handleClearInputs}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                    <button
                      id="btn-reset-generator"
                      onClick={handleResetAll}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset All</span>
                    </button>
                  </div>

                  <button
                    id="btn-generate-qr"
                    onClick={handleExplicitGenerate}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Save to History</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Customizer Tab */
              <StyleCustomizer
                styleConfig={styleConfig}
                onChange={setStyleConfig}
                onReset={() => setStyleConfig(DEFAULT_STYLE)}
                theme={theme}
              />
            )}
          </div>

          {/* Privacy & Device-Only Processing Card */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              theme === 'dark'
                ? 'bg-slate-900/30 border-slate-800/70 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0 border border-cyan-500/20">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Your QR data stays on your device
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                All generation, styling, logos, and downloads happen strictly within your local browser. Zero server uploads, zero logging, 100% private.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Live Preview & Download Controls */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div
            className={`p-6 rounded-3xl border shadow-2xl backdrop-blur-xl flex flex-col items-center text-center ${
              theme === 'dark'
                ? 'bg-slate-900/70 border-slate-800'
                : 'bg-white/95 border-slate-200'
            }`}
          >
            {/* Header: Live Preview Label & Favorite Toggle */}
            <div className="w-full flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Live QR Preview
                </span>
              </div>

              <button
                id="btn-toggle-favorite-current"
                onClick={handleToggleFavoriteCurrent}
                className={`p-2 rounded-xl transition cursor-pointer border ${
                  isFavorite
                    ? 'border-amber-500/40 bg-amber-500/20 text-amber-300'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-amber-300'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                aria-label="Toggle favorite"
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            </div>

            {/* Live QR Canvas Container */}
            <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 max-w-[340px] w-full flex items-center justify-center min-h-[300px]">
              <QRCanvas
                ref={qrCanvasRef}
                content={payloadString}
                styleConfig={styleConfig}
                className="w-[260px] h-[260px] sm:w-[280px] sm:h-[280px]"
              />
            </div>

            {/* Encoded preview info */}
            <div className="mt-4 w-full px-2">
              <p className="text-xs font-semibold text-slate-200 truncate">{payloadTitle}</p>
              <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                {payloadString.length > 55 ? `${payloadString.slice(0, 55)}...` : payloadString}
              </p>
            </div>

            {/* Resolution Selector for Export */}
            <div className="w-full mt-5 pt-4 border-t border-slate-800/70">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Download Quality</span>
                <span className="font-mono text-cyan-400 font-bold">{downloadResolution} × {downloadResolution} px</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[512, 1024, 2048].map((res) => (
                  <button
                    key={res}
                    onClick={() => setDownloadResolution(res)}
                    className={`py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                      downloadResolution === res
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {res === 512 ? 'Standard (512)' : res === 1024 ? 'HD (1024)' : 'Ultra (2048)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Download Buttons */}
            <div className="w-full mt-4 grid grid-cols-3 gap-2">
              <button
                id="btn-download-png"
                onClick={() => handleDownload('png')}
                className="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
              >
                <Download className="w-4 h-4 mb-0.5" />
                <span>PNG</span>
              </button>

              <button
                id="btn-download-svg"
                onClick={() => handleDownload('svg')}
                className="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold text-xs transition cursor-pointer"
              >
                <Download className="w-4 h-4 mb-0.5" />
                <span>SVG</span>
              </button>

              <button
                id="btn-download-jpg"
                onClick={() => handleDownload('jpeg')}
                className="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
              >
                <Download className="w-4 h-4 mb-0.5" />
                <span>JPG</span>
              </button>
            </div>

            {/* Copy & Share Quick Actions */}
            <div className="w-full mt-3 grid grid-cols-3 gap-2">
              <button
                id="btn-copy-qr"
                onClick={handleCopyImage}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs font-medium transition cursor-pointer"
                title="Copy QR image to clipboard"
              >
                {isCopiedImage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                <span>Copy QR</span>
              </button>

              <button
                id="btn-share-qr"
                onClick={handleShareQR}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs font-medium transition cursor-pointer"
                title="Share QR via Web Share API"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Share QR</span>
              </button>

              <button
                id="btn-copy-content"
                onClick={handleCopyContent}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs font-medium transition cursor-pointer"
                title="Copy raw encoded URL/text"
              >
                {isCopiedContent ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5 text-cyan-400" />}
                <span>Copy Text</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
