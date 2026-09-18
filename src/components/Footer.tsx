import React from 'react';
import { NavTab } from '../types';
import { NovaLogo } from './NovaLogo';
import { Shield, Sparkles } from 'lucide-react';

interface FooterProps {
  onTabChange: (tab: NavTab) => void;
  theme: 'dark' | 'light';
}

export const Footer: React.FC<FooterProps> = ({ onTabChange, theme }) => {
  return (
    <footer
      id="main-footer"
      className={`w-full mt-20 border-t transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-slate-950/90 border-slate-800 text-slate-400'
          : 'bg-white border-slate-200 text-slate-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800/60">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <button
              onClick={() => onTabChange('generator')}
              className="cursor-pointer hover:opacity-90 transition"
              aria-label="NOVA QR Home"
            >
              <NovaLogo size="sm" showTagline={true} />
            </button>
            <p className="text-xs text-slate-400 mt-2 max-w-sm">
              Ultra-fast, modern QR code generator and client-side scanner. Built with precision for privacy, speed, and aesthetics.
            </p>
          </div>

          {/* Nav Links */}
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs font-medium">
            <button
              onClick={() => onTabChange('generator')}
              className="hover:text-cyan-400 transition cursor-pointer"
            >
              Generator
            </button>
            <button
              onClick={() => onTabChange('scanner')}
              className="hover:text-cyan-400 transition cursor-pointer"
            >
              Scanner
            </button>
            <button
              onClick={() => onTabChange('history')}
              className="hover:text-cyan-400 transition cursor-pointer"
            >
              History
            </button>
            <button
              onClick={() => onTabChange('favorites')}
              className="hover:text-cyan-400 transition cursor-pointer"
            >
              Favorites
            </button>
            <button
              onClick={() => onTabChange('settings')}
              className="hover:text-cyan-400 transition cursor-pointer"
            >
              Settings
            </button>
            <button
              onClick={() => onTabChange('help')}
              className="hover:text-cyan-400 transition cursor-pointer"
            >
              Help
            </button>
            <button
              onClick={() => onTabChange('about')}
              className="hover:text-cyan-400 transition cursor-pointer"
            >
              About
            </button>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Client-side only. Your QR data stays on your device.</span>
          </div>

          <div className="text-slate-400 text-center sm:text-right font-medium">
            © 2026 Copyright Arpan Goswami. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
