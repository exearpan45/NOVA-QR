import React, { useState } from 'react';
import {
  History as HistoryIcon,
  Star,
  Trash2,
  Download,
  RotateCcw,
  Copy,
  ExternalLink,
  Check,
  Search,
  AlertTriangle,
  Globe,
  Wifi,
  FileText,
  Phone,
  Mail,
  Calendar,
  Contact,
  MapPin,
  MessageSquare,
  MessageCircle,
} from 'lucide-react';
import { QRHistoryItem, QRCategory } from '../types';
import { QRCanvas } from './QRCanvas';

interface HistoryAndFavoritesViewProps {
  items: QRHistoryItem[];
  isFavoritesOnly?: boolean;
  onDeleteItem: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onClearAll: () => void;
  onRegenerate: (item: QRHistoryItem) => void;
  theme: 'dark' | 'light';
  onAddToast: (title: string, description?: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
}

export const HistoryAndFavoritesView: React.FC<HistoryAndFavoritesViewProps> = ({
  items,
  isFavoritesOnly = false,
  onDeleteItem,
  onToggleFavorite,
  onClearAll,
  onRegenerate,
  theme,
  onAddToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter items
  const displayedItems = items
    .filter((item) => (isFavoritesOnly ? item.isFavorite : true))
    .filter((item) => {
      if (filterCategory !== 'all' && item.type !== filterCategory) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
      );
    });

  const handleCopyContent = async (item: QRHistoryItem) => {
    try {
      await navigator.clipboard.writeText(item.content);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1800);
      onAddToast('Copied', 'QR content copied to clipboard', 'success');
    } catch {
      onAddToast('Error', 'Unable to copy text', 'error');
    }
  };

  const getCategoryIcon = (cat: QRCategory) => {
    switch (cat) {
      case 'url':
        return Globe;
      case 'wifi':
        return Wifi;
      case 'phone':
        return Phone;
      case 'email':
        return Mail;
      case 'calendar':
        return Calendar;
      case 'vcard':
        return Contact;
      case 'location':
        return MapPin;
      case 'sms':
        return MessageSquare;
      case 'whatsapp':
        return MessageCircle;
      default:
        return FileText;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Title & Clear Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            {isFavoritesOnly ? (
              <>
                <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
                <span>Favorites</span>
              </>
            ) : (
              <>
                <HistoryIcon className="w-7 h-7 text-cyan-400" />
                <span>QR History</span>
              </>
            )}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            {isFavoritesOnly
              ? 'Your starred QR codes saved locally on this browser.'
              : 'Recently created QR codes. Stored exclusively in local storage.'}
          </p>
        </div>

        {items.length > 0 && !isFavoritesOnly && (
          <button
            id="btn-clear-history-dialog"
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 border border-rose-500/30 hover:bg-rose-500/10 transition cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, text, or link..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none transition ${
                theme === 'dark'
                  ? 'bg-slate-900/60 border border-slate-800 text-slate-100 focus:border-cyan-400'
                  : 'bg-white border border-slate-200 text-slate-900 focus:border-cyan-600'
              }`}
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold outline-none transition cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-900/60 border border-slate-800 text-slate-300'
                : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            <option value="all">All Types</option>
            <option value="url">Website URL</option>
            <option value="text">Text</option>
            <option value="wifi">Wi-Fi</option>
            <option value="vcard">Contact Card</option>
            <option value="phone">Phone</option>
            <option value="email">Email</option>
            <option value="calendar">Calendar</option>
          </select>
        </div>
      )}

      {/* Grid of History Items */}
      {displayedItems.length === 0 ? (
        <div
          className={`p-12 text-center rounded-3xl border ${
            theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-3">
            {isFavoritesOnly ? <Star className="w-6 h-6" /> : <HistoryIcon className="w-6 h-6" />}
          </div>
          <h3 className="text-sm font-bold text-slate-200">
            {isFavoritesOnly ? 'No favorite QR codes yet' : 'No history found'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {isFavoritesOnly
              ? 'Click the star icon in the generator or history cards to pin your frequent QR codes here.'
              : 'Generate your first customized QR code to see it recorded here automatically.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedItems.map((item) => {
            const Icon = getCategoryIcon(item.type);
            const dateStr = new Date(item.timestamp).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition hover:shadow-lg flex flex-col justify-between ${
                  theme === 'dark'
                    ? 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex gap-3.5 items-start">
                  {/* Miniature QR Preview */}
                  <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800 p-1 flex items-center justify-center">
                    <QRCanvas
                      content={item.content}
                      styleConfig={{
                        ...item.style,
                        size: 72,
                        margin: 4,
                      }}
                      className="w-16 h-16 pointer-events-none"
                    />
                  </div>

                  {/* Info Header */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                        <Icon className="w-3 h-3" />
                        <span>{item.type}</span>
                      </div>

                      <button
                        onClick={() => onToggleFavorite(item.id)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          item.isFavorite
                            ? 'text-amber-400 hover:bg-amber-500/10'
                            : 'text-slate-500 hover:text-amber-400'
                        }`}
                        title={item.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
                      >
                        <Star
                          className={`w-4 h-4 ${item.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`}
                        />
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-slate-200 truncate mt-1.5">{item.title}</h4>
                    <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">{item.content}</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">{dateStr}</span>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onRegenerate(item)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-cyan-400 hover:bg-cyan-500/10 font-medium transition cursor-pointer"
                      title="Load in generator to modify"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Regenerate</span>
                    </button>

                    <button
                      onClick={() => handleCopyContent(item)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 font-medium transition cursor-pointer"
                      title="Copy content text"
                    >
                      {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Clear History</h3>
            </div>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Are you sure you want to permanently delete all items in your local QR history? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                  onAddToast('History Cleared', 'All local history items removed', 'info');
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
              >
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
