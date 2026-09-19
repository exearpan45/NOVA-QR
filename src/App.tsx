import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import {
  AppSettings,
  NavTab,
  QRHistoryItem,
  ToastMessage,
} from './types';
import {
  getStoredHistory,
  getStoredSettings,
  getStoredTheme,
  setStoredSettings,
  setStoredTheme,
  deleteHistoryItem,
  toggleFavoriteItem,
  clearAllHistory,
  clearAllFavorites,
  resetAllAppSettings,
  DEFAULT_SETTINGS,
} from './utils/storage';
import { SplashScreen } from './components/SplashScreen';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { GeneratorView } from './components/GeneratorView';
import { ScannerView } from './components/ScannerView';
import { HistoryAndFavoritesView } from './components/HistoryAndFavoritesView';
import { SettingsView } from './components/SettingsView';
import { ProfileView } from './components/ProfileView';
import { DynamicQRView } from './components/DynamicQRView';
import { AnalyticsView } from './components/AnalyticsView';
import { LinkInBioView } from './components/LinkInBioView';
import { HelpView } from './components/HelpView';
import { AboutView } from './components/AboutView';
import { ToastContainer } from './components/ToastContainer';
import { AuthModal } from './components/AuthModal';
import { CustomQRDesigner } from './components/CustomQRDesigner';
import { syncHistoryWithCloud } from './utils/cloudSync';
import {
  QrCode,
  ScanLine,
  History,
  Star,
  Link2,
  TrendingUp,
  Smartphone,
} from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentTab, setCurrentTab] = useState<NavTab>('generator');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [historyItems, setHistoryItems] = useState<QRHistoryItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [analyticsTargetCodeId, setAnalyticsTargetCodeId] = useState<string | undefined>(undefined);

  // Supabase Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // Supabase session listener & automatic cloud history sync
  useEffect(() => {
    // 1. Fetch initial session and sync history if logged in
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          const syncResult = await syncHistoryWithCloud(session.user);
          if (syncResult.success && syncResult.mergedItems) {
            setHistoryItems(syncResult.mergedItems);
          }
        } catch (err) {
          console.error('Initial history sync error:', err);
        }
      }
    });

    // 2. Subscribe to auth changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        try {
          const syncResult = await syncHistoryWithCloud(session.user);
          if (syncResult.success && syncResult.mergedItems) {
            setHistoryItems(syncResult.mergedItems);
          }
          addToast('History Synchronized', 'Your cloud & local QR history is now in sync across devices.', 'success');
        } catch (err) {
          console.error('Auth change history sync error:', err);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Trigger login/signup popup modal when a visitor scrolls down
  useEffect(() => {
    if (user || showSplash) return;

    const alreadyPrompted = sessionStorage.getItem('nova_scroll_auth_prompted') === 'true';
    if (alreadyPrompted) return;

    const handleScroll = () => {
      if (window.scrollY > 160) {
        setAuthModalMode('signup');
        setAuthModalOpen(true);
        sessionStorage.setItem('nova_scroll_auth_prompted', 'true');
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user, showSplash]);

  // Initial load
  useEffect(() => {
    // 1. Theme
    const storedTheme = getStoredTheme();
    if (storedTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    } else {
      setTheme(storedTheme === 'light' ? 'light' : 'dark');
    }

    // 2. Settings
    const loadedSettings = getStoredSettings();
    setSettings(loadedSettings);

    // 3. History
    setHistoryItems(getStoredHistory());

    // 4. Register PWA Service Worker if available
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(() => {
          // SW registration ignored in dev/preview if not served over https
        });
      });
    }
  }, []);

  // Sync dark/light class on body / html
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-slate-100 text-slate-900 antialiased selection:bg-cyan-600/20 selection:text-cyan-800';
    }
  }, [theme]);

  const addToast = useCallback((title: string, description?: string, type: 'success' | 'info' | 'error' | 'warning' = 'info') => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, title, description, type }]);

    // Auto dismiss after 3.8s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const handleDismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setStoredTheme(next);
    addToast('Theme Switched', next === 'dark' ? 'Dark Mode active' : 'Light Mode active', 'info');
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    setStoredSettings(newSettings);
    if (newSettings.theme !== 'system') {
      setTheme(newSettings.theme);
      setStoredTheme(newSettings.theme);
    }
  };

  const handleRefreshHistory = useCallback(() => {
    setHistoryItems(getStoredHistory());
  }, []);

  const handleDeleteHistoryItem = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistoryItems(updated);
    addToast('Item Deleted', 'Removed from your local history', 'info');
  };

  const handleToggleFavorite = (id: string) => {
    const updated = toggleFavoriteItem(id);
    setHistoryItems(updated);
    const target = updated.find((i) => i.id === id);
    if (target?.isFavorite) {
      addToast('Added to Favorites', target.title, 'success');
    } else {
      addToast('Removed from Favorites', target?.title, 'info');
    }
  };

  const handleClearAllHistory = () => {
    clearAllHistory();
    setHistoryItems(getStoredHistory());
  };

  const handleClearAllFavorites = () => {
    const updated = clearAllFavorites();
    setHistoryItems(updated);
  };

  const handleResetAll = () => {
    resetAllAppSettings();
    setSettings(DEFAULT_SETTINGS);
    setTheme('dark');
    setStoredTheme('dark');
    setHistoryItems([]);
  };

  const handleRegenerateFromHistory = (item: QRHistoryItem) => {
    // Switch to generator view
    setCurrentTab('generator');
    addToast('Loaded in Generator', item.title, 'info');
  };

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      addToast('Signed Out', 'You have been successfully logged out', 'info');
    } catch (err) {
      addToast('Sign Out Error', (err as Error).message || 'Failed to sign out', 'error');
    }
  };

  const favoritesCount = historyItems.filter((i) => i.isFavorite).length;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 relative ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Animated Splash Screen at startup */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Cybernetic background ambient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[140px] opacity-25 ${
          theme === 'dark' ? 'bg-cyan-500/20' : 'bg-cyan-200/50'
        }`} />
        <div className={`absolute top-1/3 -left-40 w-[450px] h-[450px] rounded-full blur-[120px] opacity-20 ${
          theme === 'dark' ? 'bg-purple-600/20' : 'bg-purple-200/40'
        }`} />
      </div>

      {/* Navbar Header */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        favoritesCount={favoritesCount}
        user={user}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {currentTab === 'generator' && (
          <GeneratorView
            theme={theme}
            onAddToast={addToast}
            onRefreshHistory={handleRefreshHistory}
          />
        )}

        {currentTab === 'designer' && (
          <CustomQRDesigner
            theme={theme}
            onAddToast={addToast}
            onRefreshHistory={handleRefreshHistory}
            onSyncTrigger={() => {
              if (user) {
                syncHistoryWithCloud(user).then((synced) => {
                  if (synced.success && synced.mergedItems) {
                    setHistoryItems(synced.mergedItems);
                  }
                });
              }
            }}
          />
        )}

        {currentTab === 'dynamic' && (
          <DynamicQRView
            theme={theme}
            onAddToast={addToast}
            onNavigateToAnalytics={(codeId) => {
              setAnalyticsTargetCodeId(codeId);
              setCurrentTab('analytics');
            }}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            theme={theme}
            onAddToast={addToast}
            selectedCodeId={analyticsTargetCodeId}
          />
        )}

        {currentTab === 'bio' && (
          <LinkInBioView
            theme={theme}
            onAddToast={addToast}
          />
        )}

        {currentTab === 'scanner' && (
          <ScannerView
            theme={theme}
            onAddToast={addToast}
            onSendToGenerator={() => {
              setCurrentTab('generator');
              addToast('Loaded to Generator', 'You can now re-style or export this code', 'info');
            }}
          />
        )}

        {currentTab === 'history' && (
          <HistoryAndFavoritesView
            items={historyItems}
            isFavoritesOnly={false}
            onDeleteItem={handleDeleteHistoryItem}
            onToggleFavorite={handleToggleFavorite}
            onClearAll={handleClearAllHistory}
            onRegenerate={handleRegenerateFromHistory}
            theme={theme}
            onAddToast={addToast}
          />
        )}

        {currentTab === 'favorites' && (
          <HistoryAndFavoritesView
            items={historyItems}
            isFavoritesOnly={true}
            onDeleteItem={handleDeleteHistoryItem}
            onToggleFavorite={handleToggleFavorite}
            onClearAll={handleClearAllFavorites}
            onRegenerate={handleRegenerateFromHistory}
            theme={theme}
            onAddToast={addToast}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onClearHistory={handleClearAllHistory}
            onClearFavorites={handleClearAllFavorites}
            onResetAllSettings={handleResetAll}
            theme={theme}
            onAddToast={addToast}
            user={user}
            onOpenAuth={handleOpenAuth}
            onSignOut={handleSignOut}
            onNavigateToProfile={() => setCurrentTab('profile')}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            user={user}
            historyItems={historyItems}
            theme={theme}
            onOpenAuth={handleOpenAuth}
            onSignOut={handleSignOut}
            onAddToast={addToast}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'help' && (
          <HelpView
            theme={theme}
            onGoToGenerator={() => setCurrentTab('generator')}
            onGoToScanner={() => setCurrentTab('scanner')}
          />
        )}

        {currentTab === 'about' && <AboutView theme={theme} />}
      </main>

      {/* Mobile Bottom Quick Navigation Bar */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t backdrop-blur-xl px-2 py-1.5 flex items-center justify-around ${
        theme === 'dark' ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-md'
      }`}>
        <button
          onClick={() => setCurrentTab('generator')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition cursor-pointer ${
            currentTab === 'generator' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span className="text-[10px]">Create</span>
        </button>

        <button
          onClick={() => setCurrentTab('dynamic')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition cursor-pointer ${
            currentTab === 'dynamic' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Link2 className="w-4 h-4" />
          <span className="text-[10px]">Dynamic</span>
        </button>

        <button
          onClick={() => setCurrentTab('analytics')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition cursor-pointer ${
            currentTab === 'analytics' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-[10px]">Analytics</span>
        </button>

        <button
          onClick={() => setCurrentTab('bio')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition cursor-pointer ${
            currentTab === 'bio' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span className="text-[10px]">Bio</span>
        </button>

        <button
          onClick={() => setCurrentTab('history')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition cursor-pointer ${
            currentTab === 'history' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span className="text-[10px]">History</span>
        </button>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        theme={theme}
        onSuccess={(msg) => addToast('Account', msg, 'success')}
      />

      {/* Footer */}
      <Footer onTabChange={setCurrentTab} theme={theme} />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
