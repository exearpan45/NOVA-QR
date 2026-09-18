import React from 'react';
import {
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Layers,
  Edit3,
  Sliders,
  Eye,
  Download,
  ScanLine,
} from 'lucide-react';

interface HelpViewProps {
  theme: 'dark' | 'light';
  onGoToGenerator: () => void;
  onGoToScanner: () => void;
}

export const HelpView: React.FC<HelpViewProps> = ({
  theme,
  onGoToGenerator,
  onGoToScanner,
}) => {
  const steps = [
    {
      num: '1',
      title: 'Select a QR Category',
      desc: 'Pick between 10 versatile formats: Website URL, Plain Text, Wi-Fi credentials, Phone, Email, SMS, WhatsApp, Contact (vCard), GPS Location, or Calendar Event.',
      icon: Layers,
    },
    {
      num: '2',
      title: 'Enter Your Information',
      desc: 'Fill in the corresponding form fields. NOVA QR formats data according to global international standards like vCard 3.0, iCalendar 2.0, and Wi-Fi WPA standards.',
      icon: Edit3,
    },
    {
      num: '3',
      title: 'Customize Styling & Logo',
      desc: 'Personalize the QR pattern with custom dot shapes, corner eye geometries, and color schemes, or choose from sleek designer presets like Midnight, Neon, or Minimal.',
      icon: Sliders,
    },
    {
      num: '4',
      title: 'Live Real-Time Preview',
      desc: 'Watch the preview update instantaneously as you type without page reloads. Test scanning directly from the screen.',
      icon: Eye,
    },
    {
      num: '5',
      title: 'Download, Copy, or Share',
      desc: 'Export crisp raster PNG, lossless vector SVG, or JPG up to 2048px resolution. You can also copy the image directly to your clipboard or use the native Share sheet.',
      icon: Download,
    },
    {
      num: '6',
      title: 'Scan Existing QR Codes',
      desc: 'Switch to the Scanner tab to decode QR codes with your device camera or upload an image file for instant client-side decoding.',
      icon: ScanLine,
    },
  ];

  const bestPractices = [
    {
      title: 'Ensure Sufficient Color Contrast',
      desc: 'Standard QR scanners require strong contrast between the dark foreground and light background (or vice versa). Avoid low-contrast pastel-on-white or gray-on-black combinations.',
    },
    {
      title: 'Keep Center Logos Balanced',
      desc: 'Center logos should not occupy more than 25–30% of the QR matrix. NOVA QR automatically upgrades fault tolerance to High (H / 30%) when you add an image.',
    },
    {
      title: 'Always Test Before Printing',
      desc: 'Scan your finalized code using multiple camera devices and QR scanner apps before sending it to a commercial print press or packaging.',
    },
    {
      title: 'Size Appropriately for Distance',
      desc: 'For business cards, 2×2 cm (0.8×0.8 in) is the minimum recommended size. For billboards or posters, the ratio should be approximately 10:1 (viewing distance to QR width).',
    },
  ];

  const cardClass = `p-6 rounded-3xl border ${
    theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
  }`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-100 flex items-center justify-center gap-3">
          <HelpCircle className="w-8 h-8 text-cyan-400" />
          <span>How to Use NOVA QR</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          A straightforward guide to generating, styling, and scanning professional QR codes.
        </p>
      </div>

      {/* 6 Step Guide */}
      <div className={cardClass}>
        <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-6 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Step-by-Step Workflow
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 flex items-start gap-3.5"
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{step.title}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/70 justify-center">
          <button
            onClick={onGoToGenerator}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
          >
            Open QR Generator
          </button>
          <button
            onClick={onGoToScanner}
            className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer"
          >
            Launch QR Scanner
          </button>
        </div>
      </div>

      {/* QR Best Practices */}
      <div className={cardClass}>
        <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          QR Code Best Practices & Scanning Reliability
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bestPractices.map((bp, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-start gap-3"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">{bp.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{bp.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
