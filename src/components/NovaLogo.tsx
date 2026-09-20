import React from 'react';

interface NovaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  glow?: boolean;
}

export const NovaLogo: React.FC<NovaLogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
  glow = true,
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-lg', badge: 'text-[9px]' },
    md: { icon: 38, text: 'text-2xl', badge: 'text-[10px]' },
    lg: { icon: 52, text: 'text-3xl', badge: 'text-xs' },
    xl: { icon: 84, text: 'text-5xl', badge: 'text-sm' },
  };

  const dim = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Futuristic QR Emblem */}
      <div className={`relative flex items-center justify-center ${glow ? 'group' : ''}`}>
        {glow && (
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/30 via-sky-500/20 to-purple-600/30 blur-md opacity-70 transition group-hover:opacity-100" />
        )}
        <svg
          width={dim.icon}
          height={dim.icon}
          viewBox="0 0 100 100"
          className="relative rounded-xl transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="innerBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#090d16" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* Base rounded square */}
          <rect width="100" height="100" rx="24" fill="url(#innerBg)" stroke="url(#logoGrad)" strokeWidth="3" />

          {/* QR Corner Markers */}
          {/* Top Left */}
          <rect x="14" y="14" width="24" height="24" rx="6" fill="none" stroke="url(#logoGrad)" strokeWidth="3.5" />
          <rect x="21" y="21" width="10" height="10" rx="3" fill="#00f2fe" />

          {/* Top Right */}
          <rect x="62" y="14" width="24" height="24" rx="6" fill="none" stroke="url(#logoGrad)" strokeWidth="3.5" />
          <rect x="69" y="21" width="10" height="10" rx="3" fill="#38bdf8" />

          {/* Bottom Left */}
          <rect x="14" y="62" width="24" height="24" rx="6" fill="none" stroke="url(#logoGrad)" strokeWidth="3.5" />
          <rect x="21" y="69" width="10" height="10" rx="3" fill="#a855f7" />

          {/* Digital QR Matrix Dots */}
          <rect x="46" y="18" width="8" height="6" rx="2" fill="#38bdf8" opacity="0.8" />
          <rect x="18" y="46" width="6" height="8" rx="2" fill="#38bdf8" opacity="0.8" />
          <rect x="64" y="46" width="10" height="6" rx="2" fill="#a855f7" opacity="0.8" />
          <rect x="46" y="74" width="8" height="8" rx="2" fill="#00f2fe" opacity="0.8" />
          <rect x="74" y="66" width="12" height="6" rx="2" fill="#38bdf8" opacity="0.8" />
          <rect x="66" y="76" width="16" height="8" rx="3" fill="url(#logoGrad)" opacity="0.9" />

          {/* Central Nova Starburst Flare */}
          <circle cx="50" cy="50" r="14" fill="#00f2fe" opacity="0.2" />
          <path
            d="M50 36 C50 45 45 50 36 50 C45 50 50 55 50 64 C50 55 55 50 64 50 C55 50 50 45 50 36 Z"
            fill="#ffffff"
          />
          <circle cx="50" cy="50" r="3.5" fill="#00f2fe" />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 font-bold tracking-tight">
          <span className={`${dim.text} text-slate-900 dark:text-slate-100 font-extrabold tracking-wider`}>NOVA</span>
          <span className={`${dim.text} bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 dark:from-cyan-400 dark:via-sky-400 dark:to-purple-400 bg-clip-text text-transparent font-black`}>
            QR
          </span>
        </div>
        {showTagline && (
          <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-400/90 tracking-widest uppercase">
            Create. Scan. Share.
          </span>
        )}
      </div>
    </div>
  );
};
