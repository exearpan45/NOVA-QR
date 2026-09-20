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
  ArrowDown,
  ArrowUp,
  QrCode,
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
import { QRCanvas, QRCanvasRef, QRErrorState } from './QRCanvas';
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
  const [qrError, setQrError] = useState<QRErrorState | null>(null);
  const [simulateApiError, setSimulateApiError] = useState(false);

  const qrCanvasRef = useRef<QRCanvasRef>(null);
  const qrPreviewRef = useRef<HTMLDivElement>(null);
  const generatorCardRef = useRef<HTMLDivElement>(null);
  const [isHighlightingQR, setIsHighlightingQR] = useState(false);
  const [showFloatingScrollBtn, setShowFloatingScrollBtn] = useState(false);

  // Monitor when QR preview is in view to show/hide floating jump button on mobile
  React.useEffect(() => {
    if (!qrPreviewRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFloatingScrollBtn(!entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    observer.observe(qrPreviewRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToQR = () => {
    if (qrPreviewRef.current) {
      qrPreviewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsHighlightingQR(true);
      setTimeout(() => setIsHighlightingQR(false), 2000);
    }
  };

  const scrollToGenerator = () => {
    if (generatorCardRef.current) {
      generatorCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
        <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
          theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
        }`}>
          QR Code Generator
        </h1>
        <p className={`mt-2 text-sm sm:text-base font-medium ${
          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
        }`}>
          Create customized, high-precision QR codes in seconds.
        </p>
      </div>

      {/* Main Grid: Left Config Panel & Right Live Preview Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input & Customizer Controls */}
        <div ref={generatorCardRef} className="lg:col-span-7 space-y-6 scroll-mt-24">
          {/* Main Card */}
          <div
            className={`p-5 sm:p-6 rounded-3xl border shadow-xl ${
              theme === 'dark'
                ? 'bg-slate-900/80 border-slate-800'
                : 'bg-white border-slate-200 shadow-md'
            }`}
          >
            {/* Mobile Quick Jump to QR Code Button */}
            <div className="lg:hidden mb-5">
              <button
                id="btn-scroll-to-qr-top"
                type="button"
                onClick={scrollToQR}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all shadow-sm active:scale-[0.98] cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-cyan-500/20 hover:from-cyan-500/30 hover:to-blue-500/25 border-cyan-400/50 text-cyan-200'
                    : 'bg-cyan-50 hover:bg-cyan-100/90 border-cyan-300 text-cyan-950 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${
                    theme === 'dark' ? 'bg-cyan-400/20 text-cyan-300' : 'bg-cyan-500 text-slate-950'
                  }`}>
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className={`font-black text-xs sm:text-sm ${
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}>
                      Jump to Your QR Code
                    </p>
                    <p className={`text-[11px] ${
                      theme === 'dark' ? 'text-cyan-300/90' : 'text-cyan-800 font-medium'
                    }`}>
                      Scroll down to view, download or share your QR
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 font-extrabold text-xs px-3 py-2 rounded-xl border shrink-0 ${
                  theme === 'dark'
                    ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400/50'
                    : 'bg-cyan-600 text-white border-cyan-700 shadow-xs'
                }`}>
                  <span>View QR</span>
                  <ArrowDown className="w-4 h-4 animate-bounce" />
                </div>
              </button>
            </div>

            {/* Category Carousel / Tab Selector */}
            <div className="mb-6">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-700'
              }`}>
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
                          ? theme === 'dark'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 ring-1 ring-cyan-400/20 shadow-xs'
                            : 'bg-cyan-100 text-cyan-900 border-cyan-500 font-bold shadow-xs'
                          : theme === 'dark'
                          ? 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? (theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700') : ''}`} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub Mode Tabs: Content vs Customize Style */}
            <div className={`flex items-center gap-2 p-1 rounded-xl border mb-6 ${
              theme === 'dark'
                ? 'bg-slate-950/60 border-slate-800/80'
                : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                id="tab-mode-content"
                onClick={() => setActiveTabMode('content')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTabMode === 'content'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : theme === 'dark'
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
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
                    : theme === 'dark'
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
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
                <div className={`flex flex-wrap items-center justify-between gap-2 pt-4 border-t ${
                  theme === 'dark' ? 'border-slate-800/60' : 'border-slate-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-clear-fields"
                      onClick={handleClearInputs}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        theme === 'dark'
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                    <button
                      id="btn-reset-generator"
                      onClick={handleResetAll}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        theme === 'dark'
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset All</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Mobile Jump to QR button directly on form */}
                    <button
                      id="btn-scroll-to-qr-action"
                      type="button"
                      onClick={scrollToQR}
                      className={`lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition cursor-pointer active:scale-95 border ${
                        theme === 'dark'
                          ? 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-400/50 text-cyan-300'
                          : 'bg-cyan-100 hover:bg-cyan-200 border-cyan-400 text-cyan-900 shadow-xs'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Scroll to QR</span>
                      <ArrowDown className="w-3 h-3" />
                    </button>

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
              </div>
            ) : (
              /* Customizer Tab */
              <div>
                <StyleCustomizer
                  styleConfig={styleConfig}
                  onChange={setStyleConfig}
                  onReset={() => setStyleConfig(DEFAULT_STYLE)}
                  theme={theme}
                />
                <div className={`mt-5 pt-4 border-t lg:hidden ${
                  theme === 'dark' ? 'border-slate-800/60' : 'border-slate-200'
                }`}>
                  <button
                    id="btn-scroll-to-qr-customizer"
                    type="button"
                    onClick={scrollToQR}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs transition cursor-pointer active:scale-95 border ${
                      theme === 'dark'
                        ? 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-400/50 text-cyan-300'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-700 shadow-xs'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View Styled QR Preview Below</span>
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Privacy & Device-Only Processing Card */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              theme === 'dark'
                ? 'bg-slate-900/40 border-slate-800 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 border ${
              theme === 'dark'
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                : 'bg-cyan-100 text-cyan-700 border-cyan-200'
            }`}>
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className={`text-xs font-bold uppercase tracking-wider ${
                theme === 'dark' ? 'text-slate-200' : 'text-slate-900'
              }`}>
                Your QR data stays on your device
              </h4>
              <p className={`text-xs mt-0.5 leading-relaxed font-medium ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>
                All generation, styling, logos, and downloads happen strictly within your local browser. Zero server uploads, zero logging, 100% private.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Live Preview & Download Controls */}
        <div
          id="qr-preview-section"
          ref={qrPreviewRef}
          className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 scroll-mt-20 sm:scroll-mt-24"
        >
          <div
            className={`p-6 rounded-3xl border shadow-2xl flex flex-col items-center text-center transition-all duration-300 ${
              isHighlightingQR
                ? 'border-cyan-400 ring-4 ring-cyan-400/30 shadow-cyan-500/30'
                : theme === 'dark'
                ? 'bg-slate-900/90 border-slate-800'
                : 'bg-white border-slate-200 shadow-xl'
            }`}
          >
            {/* Mobile Return to Generator Button */}
            <button
              id="btn-scroll-back-to-generator"
              type="button"
              onClick={scrollToGenerator}
              className={`lg:hidden flex items-center justify-center gap-1.5 w-full mb-4 py-2.5 px-3 rounded-xl text-xs font-bold border transition cursor-pointer active:scale-98 ${
                theme === 'dark'
                  ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
            >
              <ArrowUp className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'}`} />
              <span>Back to Content Generator</span>
            </button>

            {/* Header: Live Preview Label & Actions */}
            <div className="w-full flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`flex h-2 w-2 rounded-full ${qrError?.hasError ? 'bg-rose-500 animate-bounce' : 'bg-cyan-400 animate-ping'}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  qrError?.hasError
                    ? 'text-rose-500'
                    : theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'
                }`}>
                  {qrError?.hasError ? 'Generation Alert' : 'Live QR Preview'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Simulated API Error Toggle for Testing */}
                <button
                  type="button"
                  id="btn-simulate-api-error"
                  onClick={() => {
                    const next = !simulateApiError;
                    setSimulateApiError(next);
                    if (next) {
                      onAddToast('Simulated API Error Enabled', 'Showing error state and retry mechanism', 'warning');
                    } else {
                      onAddToast('Normal Mode Restored', 'API generation restored', 'info');
                    }
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                    simulateApiError
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
                      : theme === 'dark'
                      ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                  title="Test error state and auto-retry flow"
                >
                  <RotateCcw className={`w-3 h-3 ${simulateApiError ? 'animate-spin' : ''}`} />
                  <span>{simulateApiError ? 'Clear Error' : 'Test Error State'}</span>
                </button>

                <button
                  id="btn-toggle-favorite-current"
                  onClick={handleToggleFavoriteCurrent}
                  className={`p-2 rounded-xl transition cursor-pointer border ${
                    isFavorite
                      ? 'border-amber-500/40 bg-amber-500/20 text-amber-400'
                      : theme === 'dark'
                      ? 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-amber-300'
                      : 'border-slate-200 bg-slate-100 text-slate-500 hover:text-amber-500'
                  }`}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  aria-label="Toggle favorite"
                >
                  <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Live QR Canvas Container */}
            <div className={`p-3 sm:p-4 rounded-2xl border max-w-[340px] w-full flex items-center justify-center min-h-[300px] ${
              qrError?.hasError
                ? theme === 'dark'
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-rose-50/50 border-rose-300'
                : theme === 'dark'
                ? 'bg-slate-950/50 border-slate-800/80'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <QRCanvas
                ref={qrCanvasRef}
                content={payloadString}
                styleConfig={styleConfig}
                className="w-[260px] h-[260px] sm:w-[280px] sm:h-[280px]"
                simulateApiError={simulateApiError}
                onErrorStateChange={setQrError}
                onFixErrorCorrection={(ec) => setStyleConfig((prev) => ({ ...prev, errorCorrection: ec }))}
              />
            </div>

            {/* Error Banner if in error state */}
            {qrError?.hasError && (
              <div className="mt-3 w-full p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between gap-2">
                <span className="font-semibold truncate">
                  {qrError.code ? `API Error (${qrError.code})` : 'QR Generation paused'}
                </span>
                <button
                  type="button"
                  onClick={() => qrCanvasRef.current?.retry()}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] shrink-0 transition cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* Encoded preview info */}
            <div className="mt-4 w-full px-2">
              <p className={`text-xs font-bold truncate ${
                theme === 'dark' ? 'text-slate-200' : 'text-slate-900'
              }`}>{payloadTitle}</p>
              <p className={`text-[11px] font-mono truncate mt-0.5 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {payloadString.length > 55 ? `${payloadString.slice(0, 55)}...` : payloadString}
              </p>
            </div>

            {/* Resolution Selector for Export */}
            <div className={`w-full mt-5 pt-4 border-t ${
              theme === 'dark' ? 'border-slate-800/70' : 'border-slate-200'
            }`}>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className={`font-bold uppercase tracking-wider text-[11px] ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>Download Quality</span>
                <span className={`font-mono font-bold ${
                  theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'
                }`}>{downloadResolution} × {downloadResolution} px</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[512, 1024, 2048].map((res) => (
                  <button
                    key={res}
                    onClick={() => setDownloadResolution(res)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      downloadResolution === res
                        ? theme === 'dark'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-cyan-100 border-cyan-500 text-cyan-900 font-bold'
                        : theme === 'dark'
                        ? 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                        : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
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
                disabled={qrError?.hasError}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl font-bold text-xs shadow-md transition cursor-pointer ${
                  qrError?.hasError
                    ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950'
                }`}
              >
                <Download className="w-4 h-4 mb-0.5" />
                <span>PNG</span>
              </button>

              <button
                id="btn-download-svg"
                onClick={() => handleDownload('svg')}
                disabled={qrError?.hasError}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border font-bold text-xs transition cursor-pointer ${
                  qrError?.hasError
                    ? 'border-slate-700 text-slate-500 cursor-not-allowed'
                    : theme === 'dark'
                    ? 'border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300'
                    : 'border-cyan-300 bg-cyan-50 hover:bg-cyan-100 text-cyan-800'
                }`}
              >
                <Download className="w-4 h-4 mb-0.5" />
                <span>SVG</span>
              </button>

              <button
                id="btn-download-jpg"
                onClick={() => handleDownload('jpeg')}
                disabled={qrError?.hasError}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border font-bold text-xs transition cursor-pointer ${
                  qrError?.hasError
                    ? 'border-slate-700 text-slate-500 cursor-not-allowed'
                    : theme === 'dark'
                    ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                    : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
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
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  theme === 'dark'
                    ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                    : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
                title="Copy QR image to clipboard"
              >
                {isCopiedImage ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'}`} />}
                <span>Copy QR</span>
              </button>

              <button
                id="btn-share-qr"
                onClick={handleShareQR}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  theme === 'dark'
                    ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                    : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
                title="Share QR via Web Share API"
              >
                <Share2 className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'}`} />
                <span>Share QR</span>
              </button>

              <button
                id="btn-copy-content"
                onClick={handleCopyContent}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  theme === 'dark'
                    ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                    : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
                title="Copy raw encoded URL/text"
              >
                {isCopiedContent ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <FileText className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'}`} />}
                <span>Copy Text</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Button: Quick Scroll to QR */}
      {showFloatingScrollBtn && (
        <button
          id="btn-floating-scroll-to-qr"
          type="button"
          onClick={scrollToQR}
          className="lg:hidden fixed bottom-20 right-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-xl shadow-cyan-500/40 border border-cyan-300/50 transition-all active:scale-95 cursor-pointer"
          aria-label="Scroll to QR Code"
        >
          <QrCode className="w-4 h-4" />
          <span>View QR Code</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
