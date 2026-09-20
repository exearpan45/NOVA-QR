import React, { useState, useEffect } from 'react';
import {
  Link2,
  Plus,
  Edit3,
  Trash2,
  Power,
  ExternalLink,
  Copy,
  Check,
  Search,
  BarChart2,
  Download,
  AlertCircle,
  Globe,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { DynamicQRCode } from '../types';
import {
  getStoredDynamicQRs,
  saveDynamicQRCode,
  deleteDynamicQRCode,
  toggleDynamicActive,
  recordScanEvent,
} from '../utils/dynamicQRStorage';
import { QRCanvas } from './QRCanvas';
import { DEFAULT_STYLE } from '../utils/qrPresets';

interface DynamicQRViewProps {
  theme: 'dark' | 'light';
  onAddToast: (title: string, description?: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  onNavigateToAnalytics: (codeId?: string) => void;
}

export const DynamicQRView: React.FC<DynamicQRViewProps> = ({
  theme,
  onAddToast,
  onNavigateToAnalytics,
}) => {
  const [dynamicCodes, setDynamicCodes] = useState<DynamicQRCode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingCode, setEditingCode] = useState<DynamicQRCode | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPreviewCode, setSelectedPreviewCode] = useState<DynamicQRCode | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDestination, setFormDestination] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Marketing');

  // Test redirect modal
  const [simulatingCode, setSimulatingCode] = useState<DynamicQRCode | null>(null);

  useEffect(() => {
    const loaded = getStoredDynamicQRs();
    setDynamicCodes(loaded);
    if (loaded.length > 0 && !selectedPreviewCode) {
      setSelectedPreviewCode(loaded[0]);
    }
  }, []);

  const handleOpenCreate = () => {
    setEditingCode(null);
    setFormTitle('');
    setFormSlug(`link-${Math.random().toString(36).substring(2, 7)}`);
    setFormDestination('https://');
    setFormDescription('');
    setFormCategory('Marketing');
    setIsCreating(true);
  };

  const handleOpenEdit = (code: DynamicQRCode) => {
    setEditingCode(code);
    setFormTitle(code.title);
    setFormSlug(code.slug);
    setFormDestination(code.destinationUrl);
    setFormDescription(code.description || '');
    setFormCategory(code.category || 'General');
    setIsCreating(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDestination.trim()) {
      onAddToast('Missing Information', 'Please provide a title and valid destination URL.', 'warning');
      return;
    }

    let dest = formDestination.trim();
    if (!dest.startsWith('http://') && !dest.startsWith('https://')) {
      dest = 'https://' + dest;
    }

    const cleanSlug = (formSlug.trim() || `link-${Date.now().toString(36)}`)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-');

    if (editingCode) {
      // Updating existing: Keep same slug & QR encoded URL so physical QR prints NEVER break!
      const updatedCode: DynamicQRCode = {
        ...editingCode,
        title: formTitle.trim(),
        destinationUrl: dest,
        description: formDescription.trim(),
        category: formCategory,
        updatedAt: new Date().toISOString(),
      };
      const updatedList = saveDynamicQRCode(updatedCode);
      setDynamicCodes(updatedList);
      if (selectedPreviewCode?.id === updatedCode.id) {
        setSelectedPreviewCode(updatedCode);
      }
      onAddToast('Destination Updated!', 'The dynamic QR target destination was updated without altering the printed QR pattern.', 'success');
    } else {
      // Create new
      const newCode: DynamicQRCode = {
        id: `dyn-${Date.now()}`,
        slug: cleanSlug,
        title: formTitle.trim(),
        destinationUrl: dest,
        description: formDescription.trim(),
        category: formCategory,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalScans: 0,
      };
      const updatedList = saveDynamicQRCode(newCode);
      setDynamicCodes(updatedList);
      setSelectedPreviewCode(newCode);
      onAddToast('Dynamic QR Created', `Dynamic shortcode /${cleanSlug} is now ready for deployment!`, 'success');
    }

    setIsCreating(false);
    setEditingCode(null);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete dynamic QR code "${title}"? This will disable this shortlink.`)) {
      const updated = deleteDynamicQRCode(id);
      setDynamicCodes(updated);
      if (selectedPreviewCode?.id === id) {
        setSelectedPreviewCode(updated[0] || null);
      }
      onAddToast('Deleted', `Dynamic QR code "${title}" was removed.`, 'info');
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = toggleDynamicActive(id);
    setDynamicCodes(updated);
    const item = updated.find((c) => c.id === id);
    if (selectedPreviewCode?.id === id && item) {
      setSelectedPreviewCode(item);
    }
    if (item) {
      onAddToast(
        item.isActive ? 'Dynamic Link Active' : 'Dynamic Link Paused',
        item.isActive ? 'Redirects will resolve normally.' : 'Scans will display a paused notice.',
        item.isActive ? 'success' : 'warning'
      );
    }
  };

  const handleCopyShortLink = (code: DynamicQRCode) => {
    const link = `https://nova-qr.app/r/${code.slug}`;
    navigator.clipboard.writeText(link);
    setCopiedId(code.id);
    setTimeout(() => setCopiedId(null), 2000);
    onAddToast('Copied to Clipboard', link, 'info');
  };

  const handleSimulateScan = (code: DynamicQRCode) => {
    recordScanEvent(code.id, code.title);
    const refreshed = getStoredDynamicQRs();
    setDynamicCodes(refreshed);
    const updatedItem = refreshed.find((c) => c.id === code.id);
    if (updatedItem) setSelectedPreviewCode(updatedItem);
    setSimulatingCode(code);
  };

  const filteredCodes = dynamicCodes.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.destinationUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isDark = theme === 'dark';

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark
          ? 'bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border-slate-800'
          : 'bg-gradient-to-r from-white via-slate-50 to-blue-50/50 border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
              isDark
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                : 'bg-cyan-50 text-cyan-800 border-cyan-300'
            }`}>
              <Sparkles className="w-3 h-3" />
              Dynamic QR Technology
            </span>
            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${
              isDark
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}>
              Real-time Editable
            </span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Dynamic & Editable QR Codes
          </h1>
          <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Update your destination URLs, promotional links, or restaurant menus at any time{' '}
            <strong className={isDark ? 'text-slate-200' : 'text-slate-900'}>
              without reprinting or redesigning your physical QR codes
            </strong>.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Dynamic QR</span>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Codes List & Search */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`} />
              <input
                type="text"
                placeholder="Search by title, slug, or destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs sm:text-sm focus:outline-none transition ${
                  isDark
                    ? 'bg-slate-900/80 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400'
                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-cyan-600 shadow-xs'
                }`}
              />
            </div>
            <div className={`text-xs shrink-0 font-medium ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Showing {filteredCodes.length} of {dynamicCodes.length} dynamic codes
            </div>
          </div>

          {/* Cards List */}
          {filteredCodes.length === 0 ? (
            <div className={`p-12 text-center rounded-3xl border space-y-3 ${
              isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <Layers className={`w-10 h-10 mx-auto ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
              <h3 className={`text-base font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                No Dynamic QR Codes Found
              </h3>
              <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                Create your first dynamic QR code to change destinations on the fly without reprinting.
              </p>
              <button
                onClick={handleOpenCreate}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  isDark
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20'
                    : 'bg-cyan-50 text-cyan-800 border-cyan-300 hover:bg-cyan-100'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Create One Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCodes.map((code) => {
                const isSelected = selectedPreviewCode?.id === code.id;
                return (
                  <div
                    key={code.id}
                    onClick={() => setSelectedPreviewCode(code)}
                    className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-slate-900/90 border-cyan-500/40 ring-1 ring-cyan-500/20 shadow-lg'
                          : 'bg-white border-cyan-500 ring-2 ring-cyan-500/20 shadow-md'
                        : isDark
                        ? 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className={`text-sm sm:text-base font-bold truncate ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}>
                            {code.title}
                          </h3>
                          {code.category && (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {code.category}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border ${
                              code.isActive
                                ? isDark
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : isDark
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${code.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                            {code.isActive ? 'Active' : 'Paused'}
                          </span>
                        </div>

                        {/* Short link */}
                        <div className={`flex items-center gap-2 text-xs font-mono pt-0.5 ${
                          isDark ? 'text-cyan-400' : 'text-cyan-700 font-semibold'
                        }`}>
                          <Link2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">https://nova-qr.app/r/{code.slug}</span>
                        </div>

                        {/* Destination */}
                        <div className="flex items-center gap-2 text-xs pt-0.5">
                          <span className={`text-[11px] uppercase tracking-wider font-semibold shrink-0 ${
                            isDark ? 'text-slate-500' : 'text-slate-500'
                          }`}>
                            Redirects To:
                          </span>
                          <a
                            href={code.destinationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={`truncate underline transition flex items-center gap-1 ${
                              isDark
                                ? 'text-slate-300 hover:text-cyan-400 decoration-slate-700 hover:decoration-cyan-400'
                                : 'text-slate-800 hover:text-cyan-700 decoration-slate-300 hover:decoration-cyan-700 font-medium'
                            }`}
                          >
                            <span className="truncate">{code.destinationUrl}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 pt-2 sm:pt-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleCopyShortLink(code)}
                          className={`p-2 rounded-xl transition cursor-pointer border ${
                            isDark
                              ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
                          }`}
                          title="Copy Dynamic Short Link"
                        >
                          {copiedId === code.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleToggleActive(code.id)}
                          className={`p-2 rounded-xl border transition cursor-pointer ${
                            code.isActive
                              ? isDark
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                              : isDark
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                              : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                          }`}
                          title={code.isActive ? 'Pause Redirects' : 'Resume Redirects'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(code)}
                          className={`p-2 rounded-xl transition cursor-pointer border ${
                            isDark
                              ? 'bg-slate-800/80 hover:bg-slate-700 text-cyan-400 border-slate-700'
                              : 'bg-slate-100 hover:bg-slate-200 text-cyan-700 border-slate-200'
                          }`}
                          title="Edit Target URL"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(code.id, code.title)}
                          className={`p-2 rounded-xl transition cursor-pointer border ${
                            isDark
                              ? 'bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border-slate-700'
                              : 'bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 border-slate-200'
                          }`}
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Stats bar */}
                    <div className={`mt-3 pt-3 border-t flex flex-wrap items-center justify-between text-[11px] gap-2 ${
                      isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-100 text-slate-600'
                    }`}>
                      <div className="flex items-center gap-4">
                        <span className={`flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                          <BarChart2 className={`w-3 h-3 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`} />
                          <strong className={`font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{code.totalScans}</strong> scans
                        </span>
                        {code.lastScannedAt && (
                          <span className={isDark ? 'text-slate-500' : 'text-slate-500'}>
                            Last scan: {new Date(code.lastScannedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSimulateScan(code);
                          }}
                          className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                            isDark
                              ? 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400'
                              : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200'
                          }`}
                        >
                          <Globe className="w-3 h-3" />
                          <span>Test Redirect</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToAnalytics(code.id);
                          }}
                          className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                            isDark
                              ? 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400'
                              : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200'
                          }`}
                        >
                          <BarChart2 className="w-3 h-3" />
                          <span>View Analytics</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Live QR Inspector & Preview */}
        <div className="space-y-4">
          <div className={`sticky top-20 p-5 rounded-3xl border shadow-xl space-y-4 ${
            isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                isDark ? 'text-slate-300' : 'text-slate-800'
              }`}>
                <Globe className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`} />
                Dynamic QR Inspector
              </h2>
              {selectedPreviewCode && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isDark
                    ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
                    : 'text-cyan-800 bg-cyan-50 border-cyan-300 font-semibold'
                }`}>
                  /{selectedPreviewCode.slug}
                </span>
              )}
            </div>

            {selectedPreviewCode ? (
              <div className="space-y-4">
                {/* QR Canvas Preview */}
                <div className={`flex justify-center p-4 rounded-2xl border ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <QRCanvas
                    content={`https://nova-qr.app/r/${selectedPreviewCode.slug}`}
                    styleConfig={{
                      ...DEFAULT_STYLE,
                      size: 220,
                      fgColor: isDark ? '#06b6d4' : '#0891b2',
                      bgColor: isDark ? '#020617' : '#ffffff',
                      dotType: 'rounded',
                      cornerSquareType: 'extra-rounded',
                      cornerDotType: 'dot',
                    }}
                  />
                </div>

                {/* Details info */}
                <div className={`p-3.5 rounded-xl border space-y-2 text-xs ${
                  isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <span className={`text-[10px] uppercase font-semibold block ${
                      isDark ? 'text-slate-500' : 'text-slate-600'
                    }`}>
                      Current Destination:
                    </span>
                    <p className={`font-mono break-all text-[11px] mt-0.5 ${
                      isDark ? 'text-cyan-300' : 'text-cyan-800 font-semibold'
                    }`}>
                      {selectedPreviewCode.destinationUrl}
                    </p>
                  </div>
                  <div className={`flex items-center justify-between pt-1 border-t text-[11px] ${
                    isDark ? 'border-slate-800/60' : 'border-slate-200'
                  }`}>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Total Scans Recorded</span>
                    <span className={`font-mono font-bold text-sm ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>{selectedPreviewCode.totalScans}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Status</span>
                    <span className={
                      selectedPreviewCode.isActive
                        ? isDark ? 'text-emerald-400 font-bold' : 'text-emerald-700 font-bold'
                        : isDark ? 'text-amber-400 font-bold' : 'text-amber-700 font-bold'
                    }>
                      {selectedPreviewCode.isActive ? 'Active (Live)' : 'Paused'}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenEdit(selectedPreviewCode)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 border ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    }`}
                  >
                    <Edit3 className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`} />
                    <span>Edit Destination</span>
                  </button>
                  <button
                    onClick={() => handleSimulateScan(selectedPreviewCode)}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      isDark
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 border-cyan-500/30 text-cyan-300'
                        : 'bg-cyan-50 hover:bg-cyan-100 border-cyan-300 text-cyan-800'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Test Scan</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className={`p-8 text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                Select a dynamic code to inspect its QR pattern and destination settings.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Create or Edit Dynamic QR */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className={`relative w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Link2 className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`} />
              <span>{editingCode ? 'Edit Dynamic Target Destination' : 'Create New Dynamic QR Code'}</span>
            </h2>

            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {editingCode
                ? 'Changing the destination URL will immediately update where users are directed without changing the physical printed QR code.'
                : 'Dynamic QR codes create a short redirect link that allows you to change the target URL anytime in the future.'}
            </p>

            <form onSubmit={handleSaveForm} className="space-y-3 pt-1">
              <div>
                <label className={`block text-[11px] font-semibold uppercase mb-1 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Title / Campaign Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Summer Promo 2026"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isDark
                      ? 'bg-slate-950 border-slate-700 text-white focus:border-cyan-400'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-[11px] font-semibold uppercase mb-1 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Destination URL (Where to redirect) *
                </label>
                <input
                  type="text"
                  placeholder="https://yourwebsite.com/landing"
                  value={formDestination}
                  onChange={(e) => setFormDestination(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none ${
                    isDark
                      ? 'bg-slate-950 border-slate-700 text-cyan-300 focus:border-cyan-400'
                      : 'bg-slate-50 border-slate-300 text-cyan-800 font-semibold focus:border-cyan-600'
                  }`}
                  required
                />
              </div>

              {!editingCode && (
                <div>
                  <label className={`block text-[11px] font-semibold uppercase mb-1 ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Custom Short Slug (Encoded in QR)
                  </label>
                  <div className={`flex items-center rounded-xl border overflow-hidden px-3 ${
                    isDark ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-300'
                  }`}>
                    <span className={`text-[11px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      nova-qr.app/r/
                    </span>
                    <input
                      type="text"
                      placeholder="my-link"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      className={`flex-1 py-2 text-xs font-mono focus:outline-none bg-transparent ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-semibold uppercase mb-1 ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Category Tag
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white focus:border-cyan-400'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600'
                    }`}
                  >
                    <option value="Marketing">Marketing</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Business">Business</option>
                    <option value="Personal">Personal</option>
                    <option value="Social">Social</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-[11px] font-semibold uppercase mb-1 ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Notes / Description
                  </label>
                  <input
                    type="text"
                    placeholder="Optional label..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white focus:border-cyan-400'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className={`px-4 py-2 rounded-xl text-xs transition cursor-pointer ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 transition cursor-pointer shadow-md"
                >
                  {editingCode ? 'Save Changes' : 'Create Dynamic QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulator Modal: Test Scan */}
      {simulatingCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className={`relative w-full max-w-sm p-6 rounded-3xl border shadow-2xl text-center space-y-4 ${
            isDark
              ? 'bg-slate-900 border-cyan-500/40 text-white'
              : 'bg-white border-cyan-500/50 text-slate-900'
          }`}>
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto ${
              isDark ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-cyan-100 text-cyan-700 border-cyan-300'
            }`}>
              <Globe className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}>
                Simulated Scan Captured
              </span>
              <h3 className={`text-base font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {simulatingCode.title}
              </h3>
              <p className={`text-xs mt-1 font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                /{simulatingCode.slug}
              </p>
            </div>

            <div className={`p-3.5 rounded-2xl border text-left space-y-1 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`text-[10px] uppercase font-semibold ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                Redirecting to target:
              </span>
              <p className={`text-xs font-mono break-all ${isDark ? 'text-cyan-300' : 'text-cyan-800 font-semibold'}`}>
                {simulatingCode.destinationUrl}
              </p>
            </div>

            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Scan counter incremented! Live analytics updated with your device signature.
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSimulatingCode(null)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                }`}
              >
                Close Simulator
              </button>
              <a
                href={simulatingCode.destinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSimulatingCode(null)}
                className="flex-1 py-2 px-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
              >
                <span>Visit URL</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
