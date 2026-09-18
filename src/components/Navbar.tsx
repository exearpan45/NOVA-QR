import React, { useState } from 'react';
import {
  QrCode,
  ScanLine,
  History,
  Star,
  Settings,
  HelpCircle,
  Info,
  Sun,
  Moon,
  Download,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { NavTab } from '../types';
import { NovaLogo } from './NovaLogo';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  favoritesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  theme,
  onToggleTheme,
  favoritesCount,
}) => {
  const { isInstallable, install, isIOS } = usePWAInstall();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'generator', label: 'Generator', icon: QrCode },
    { id: 'scanner', label: 'Scanner', icon: ScanLine },
    { id: 'history', label: 'History', icon: History },
    { id: 'favorites', label: 'Favorites', icon: Star, badge: favoritesCount },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'about', label: 'About', icon: Info },
  ];

  const handleNavClick = (tab: NavTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        id="main-navbar"
        className={`sticky top-0 z-40 w-full transition-colors duration-300 backdrop-blur-xl border-b ${
          theme === 'dark'
            ? 'bg-slate-950/80 border-slate-800/80 text-slate-100'
            : 'bg-white/85 border-slate-200 text-slate-900 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <button
            id="nav-logo-btn"
            onClick={() => handleNavClick('generator')}
            className="flex items-center gap-2 hover:opacity-90 transition text-left cursor-pointer"
            aria-label="NOVA QR Home"
          >
            <NovaLogo size="sm" showTagline={false} />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/40 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-800/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                    isActive
                      ? theme === 'dark'
                        ? 'bg-gradient-to-r from-cyan-500/20 to-sky-500/20 text-cyan-300 border border-cyan-500/30 shadow-xs'
                        : 'bg-white text-cyan-700 shadow-sm border border-slate-200'
                      : theme === 'dark'
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : ''}`} />
                  <span>{item.label}</span>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools (PWA Install, Theme Toggle, Mobile Menu) */}
          <div className="flex items-center gap-2">
            {/* Install PWA Button */}
            {isInstallable && (
              <button
                id="btn-pwa-install"
                onClick={install}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs shadow-md shadow-cyan-500/20 transition cursor-pointer"
                title="Install NOVA QR as an app"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}

            {isIOS && (
              <button
                id="btn-ios-install"
                onClick={() => setShowIOSModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-medium text-xs transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              id="btn-theme-toggle"
              onClick={onToggleTheme}
              className={`p-2 rounded-xl transition cursor-pointer border ${
                theme === 'dark'
                  ? 'border-slate-800 bg-slate-900/80 text-amber-300 hover:bg-slate-800'
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 pt-2 pb-4 space-y-1 animate-fadeIn">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span>{item.label}</span>
                  </div>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {isInstallable && (
              <button
                onClick={() => {
                  install();
                  setMobileMenuOpen(false);
                }}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-semibold text-sm shadow-md transition"
              >
                <Download className="w-4 h-4" />
                <span>Install NOVA QR App</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* iOS Installation Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 text-slate-100 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Install on iPhone / iPad
            </h3>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              1. Tap the <strong className="text-cyan-400">Share</strong> button in your Safari toolbar.
              <br />
              2. Scroll down and tap <strong className="text-cyan-400">Add to Home Screen</strong>.
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
