import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  MessageCircle,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Download,
  Copy,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Smartphone,
  Share2,
  Check,
  Palette,
  Briefcase,
  Contact,
  QrCode,
} from 'lucide-react';
import { BioCustomLink, LinkInBioProfile } from '../types';
import { getStoredBioProfile, saveBioProfile } from '../utils/bioStorage';
import { QRCanvas } from './QRCanvas';
import { DEFAULT_STYLE } from '../utils/qrPresets';

interface LinkInBioViewProps {
  theme: 'dark' | 'light';
  onAddToast: (title: string, description?: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
}

export const LinkInBioView: React.FC<LinkInBioViewProps> = ({
  theme,
  onAddToast,
}) => {
  const [profile, setProfile] = useState<LinkInBioProfile>(getStoredBioProfile());
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'links' | 'socials' | 'qr'>('profile');

  // Custom link modal/form
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkHighlight, setNewLinkHighlight] = useState(false);

  useEffect(() => {
    setProfile(getStoredBioProfile());
  }, []);

  const handleUpdateField = <K extends keyof LinkInBioProfile>(
    field: K,
    value: LinkInBioProfile[K]
  ) => {
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    saveBioProfile(updated);
  };

  const handleAddCustomLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;

    let url = newLinkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const newLink: BioCustomLink = {
      id: `link-${Date.now()}`,
      title: newLinkTitle.trim(),
      url,
      highlight: newLinkHighlight,
    };

    const updated = {
      ...profile,
      customLinks: [...profile.customLinks, newLink],
    };

    setProfile(updated);
    saveBioProfile(updated);
    setNewLinkTitle('');
    setNewLinkUrl('');
    setNewLinkHighlight(false);
    onAddToast('Custom Link Added', newLink.title, 'success');
  };

  const handleRemoveCustomLink = (id: string) => {
    const updated = {
      ...profile,
      customLinks: profile.customLinks.filter((l) => l.id !== id),
    };
    setProfile(updated);
    saveBioProfile(updated);
  };

  const handleCopyBioUrl = () => {
    const url = `https://nova-qr.app/bio/${profile.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    onAddToast('Copied to Clipboard', url, 'info');
  };

  // Generate .vcf download on the fly for saving contact
  const handleDownloadVCF = () => {
    const vcfContent = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${profile.name}`,
      `TITLE:${profile.title}`,
      `ORG:${profile.company || ''}`,
      profile.phone ? `TEL;TYPE=CELL:${profile.phone}` : '',
      profile.email ? `EMAIL:${profile.email}` : '',
      profile.website ? `URL:${profile.website}` : '',
      `NOTE:${profile.bio}`,
      'END:VCARD',
    ]
      .filter(Boolean)
      .join('\r\n');

    const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.name.replace(/\s+/g, '_')}_contact.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onAddToast('Contact Card (.vcf)', 'Digital vCard downloaded to your device.', 'success');
  };

  // Theme styles for mockup phone
  const themeStyles = {
    cyan: {
      accentGrad: 'from-cyan-500 to-blue-600',
      textAccent: 'text-cyan-400',
      bgGlow: 'bg-cyan-500/20',
      buttonBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/25',
      primaryBtn: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold',
      qrFg: '#06b6d4',
    },
    purple: {
      accentGrad: 'from-purple-500 to-pink-600',
      textAccent: 'text-purple-400',
      bgGlow: 'bg-purple-500/20',
      buttonBg: 'bg-purple-500/15 border-purple-500/30 text-purple-200 hover:bg-purple-500/25',
      primaryBtn: 'bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold',
      qrFg: '#a855f7',
    },
    emerald: {
      accentGrad: 'from-emerald-500 to-teal-600',
      textAccent: 'text-emerald-400',
      bgGlow: 'bg-emerald-500/20',
      buttonBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/25',
      primaryBtn: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold',
      qrFg: '#10b981',
    },
    amber: {
      accentGrad: 'from-amber-500 to-orange-600',
      textAccent: 'text-amber-400',
      bgGlow: 'bg-amber-500/20',
      buttonBg: 'bg-amber-500/15 border-amber-500/30 text-amber-200 hover:bg-amber-500/25',
      primaryBtn: 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold',
      qrFg: '#f59e0b',
    },
    sunset: {
      accentGrad: 'from-rose-500 via-pink-500 to-amber-500',
      textAccent: 'text-rose-400',
      bgGlow: 'bg-rose-500/20',
      buttonBg: 'bg-rose-500/15 border-rose-500/30 text-rose-200 hover:bg-rose-500/25',
      primaryBtn: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold',
      qrFg: '#f43f5e',
    },
    dark: {
      accentGrad: 'from-slate-700 to-slate-900',
      textAccent: 'text-slate-300',
      bgGlow: 'bg-slate-700/20',
      buttonBg: 'bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-800',
      primaryBtn: 'bg-slate-100 text-slate-950 font-bold',
      qrFg: '#e2e8f0',
    },
  }[profile.theme || 'cyan'];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Digital Business Card & Bio
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
              1-Click vCard Save
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Link-in-Bio Landing Page Builder
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Design an interactive digital business card with quick contact actions, social icons, and portfolio links, paired with a custom-styled QR code.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyBioUrl}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>Copy Bio URL</span>
          </button>
          <button
            onClick={handleDownloadVCF}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export vCard</span>
          </button>
        </div>
      </div>

      {/* Builder & Mobile Simulator Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Builder Form Tabs */}
        <div className="lg:col-span-7 space-y-4">
          {/* Sub Navigation */}
          <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-900/80 border border-slate-800">
            {[
              { id: 'profile', label: 'Identity', icon: User },
              { id: 'links', label: 'Links & CTAs', icon: Globe },
              { id: 'socials', label: 'Socials', icon: Share2 },
              { id: 'qr', label: 'QR Code', icon: QrCode },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Profile & Identity */}
          {activeTab === 'profile' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                Personal & Brand Identity
              </h2>

              {/* Theme Color Picker */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-2">
                  Visual Theme & Color Accent
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { id: 'cyan', label: 'Cyan Pro', color: '#06b6d4' },
                    { id: 'purple', label: 'Violet Neon', color: '#a855f7' },
                    { id: 'emerald', label: 'Emerald Mint', color: '#10b981' },
                    { id: 'amber', label: 'Amber Gold', color: '#f59e0b' },
                    { id: 'sunset', label: 'Sunset Rose', color: '#f43f5e' },
                    { id: 'dark', label: 'Noir Minimal', color: '#475569' },
                  ].map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => handleUpdateField('theme', th.id as any)}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                        profile.theme === th.id
                          ? 'border-cyan-400 bg-cyan-500/10 ring-1 ring-cyan-400/40'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: th.color }} />
                      <span className="text-[10px] font-medium truncate">{th.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleUpdateField('name', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                    placeholder="Arpan Goswami"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                    Job Title / Specialty *
                  </label>
                  <input
                    type="text"
                    value={profile.title}
                    onChange={(e) => handleUpdateField('title', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                    placeholder="Full Stack & AI Engineer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={profile.company || ''}
                    onChange={(e) => handleUpdateField('company', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                    placeholder="NOVA Systems"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                    Custom Handle / Slug
                  </label>
                  <input
                    type="text"
                    value={profile.slug}
                    onChange={(e) => handleUpdateField('slug', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-400"
                    placeholder="arpan-goswami"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Bio / Tagline
                </label>
                <textarea
                  rows={2}
                  value={profile.bio}
                  onChange={(e) => handleUpdateField('bio', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                  placeholder="Tell people what you do and what you are building..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Avatar / Profile Photo URL
                </label>
                <input
                  type="text"
                  value={profile.avatarUrl || ''}
                  onChange={(e) => handleUpdateField('avatarUrl', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>
          )}

          {/* Tab 2: Direct Contact Actions & Custom Links */}
          {activeTab === 'links' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                Contact Buttons & Highlight Links
              </h2>

              {/* Direct Quick Actions */}
              <div className="space-y-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <p className="text-xs font-bold text-slate-200">1-Click Direct Action Buttons</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={profile.phone || ''}
                      onChange={(e) => handleUpdateField('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      value={profile.email || ''}
                      onChange={(e) => handleUpdateField('email', e.target.value)}
                      placeholder="hello@domain.com"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">WhatsApp No.</label>
                    <input
                      type="text"
                      value={profile.whatsapp || ''}
                      onChange={(e) => handleUpdateField('whatsapp', e.target.value)}
                      placeholder="+15550000000"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Add Custom Link Form */}
              <form onSubmit={handleAddCustomLink} className="p-3.5 rounded-2xl bg-slate-950/70 border border-cyan-500/20 space-y-2.5">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  Add Custom Link Button
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Button Title (e.g., Book Consultation)"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  <input
                    type="text"
                    placeholder="Target URL (https://...)"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newLinkHighlight}
                      onChange={(e) => setNewLinkHighlight(e.target.checked)}
                      className="accent-cyan-400 rounded cursor-pointer"
                    />
                    <span>Highlight with pulsing glow</span>
                  </label>
                  <button
                    type="submit"
                    disabled={!newLinkTitle.trim() || !newLinkUrl.trim()}
                    className="px-4 py-1.5 rounded-lg bg-cyan-400 text-slate-950 text-xs font-bold hover:bg-cyan-300 transition cursor-pointer disabled:opacity-50"
                  >
                    Add Button
                  </button>
                </div>
              </form>

              {/* Existing custom links list */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Current Link Buttons ({profile.customLinks.length})</p>
                {profile.customLinks.map((link) => (
                  <div key={link.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="truncate mr-2">
                      <p className="font-bold text-white truncate flex items-center gap-1.5">
                        {link.highlight && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                        {link.title}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{link.url}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomLink(link.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Social Profiles */}
          {activeTab === 'socials' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-cyan-400" />
                Social Profiles & Networks
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'github', label: 'GitHub URL', icon: Github, placeholder: 'https://github.com/username' },
                  { key: 'linkedin', label: 'LinkedIn URL', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
                  { key: 'twitter', label: 'Twitter / X URL', icon: Twitter, placeholder: 'https://x.com/username' },
                  { key: 'instagram', label: 'Instagram URL', icon: Instagram, placeholder: 'https://instagram.com/username' },
                  { key: 'facebook', label: 'Facebook URL', icon: Facebook, placeholder: 'https://facebook.com/username' },
                  { key: 'website', label: 'Personal Website', icon: Globe, placeholder: 'https://arpangoswami.dev' },
                ].map((soc) => {
                  const Icon = soc.icon;
                  return (
                    <div key={soc.key}>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                        {soc.label}
                      </label>
                      <input
                        type="text"
                        value={(profile as any)[soc.key] || ''}
                        onChange={(e) => handleUpdateField(soc.key as any, e.target.value)}
                        placeholder={soc.placeholder}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 4: QR Code & Integration */}
          {activeTab === 'qr' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 text-center">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2">
                <QrCode className="w-4 h-4 text-cyan-400" />
                Digital Landing Page QR Code
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Scan this code to immediately load this digital business card on any smartphone camera:
              </p>

              <div className="flex justify-center p-6 rounded-3xl bg-slate-950 border border-slate-800 max-w-xs mx-auto">
                <QRCanvas
                  content={`https://nova-qr.app/bio/${profile.slug}`}
                  styleConfig={{
                    ...DEFAULT_STYLE,
                    size: 200,
                    fgColor: themeStyles.qrFg,
                    bgColor: '#020617',
                    dotType: 'rounded',
                    cornerSquareType: 'extra-rounded',
                    cornerDotType: 'dot',
                  }}
                />
              </div>

              <div className="flex justify-center gap-2">
                <button
                  onClick={handleCopyBioUrl}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition cursor-pointer flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Copy Page URL</span>
                </button>
                <button
                  onClick={handleDownloadVCF}
                  className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-xs font-bold text-slate-950 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save vCard</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Authentic Live Smartphone Mockup */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-20 flex flex-col items-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              Live Mobile Visitor Simulator
            </span>

            {/* Smartphone Frame */}
            <div className="relative w-[300px] h-[600px] bg-slate-950 border-4 border-slate-800 rounded-[44px] shadow-2xl p-3 flex flex-col overflow-hidden ring-1 ring-white/10">
              {/* Dynamic Island / Speaker Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 mr-2" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-900/60" />
              </div>

              {/* Phone Content Screen */}
              <div className="relative flex-1 w-full rounded-[34px] bg-slate-950 overflow-y-auto px-4 pt-8 pb-6 text-center space-y-4 select-none scrollbar-none border border-slate-900">
                {/* Ambient Glow */}
                <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full ${themeStyles.bgGlow} blur-2xl pointer-events-none`} />

                {/* Avatar */}
                <div className="relative mx-auto w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-cyan-400 to-blue-500 shadow-lg shrink-0">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="w-full h-full object-cover rounded-full bg-slate-900"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-cyan-400 font-black text-xl">
                      {profile.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Name & Title */}
                <div>
                  <h3 className="text-base font-black text-white">{profile.name}</h3>
                  <p className={`text-xs font-semibold ${themeStyles.textAccent}`}>{profile.title}</p>
                  {profile.company && <p className="text-[10px] text-slate-400">{profile.company}</p>}
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-[11px] text-slate-300 leading-relaxed max-w-xs mx-auto">
                    {profile.bio}
                  </p>
                )}

                {/* Direct Action Chips */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  {profile.phone && (
                    <a
                      href={`tel:${profile.phone}`}
                      className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-200 hover:text-cyan-400 transition"
                      title="Call"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {profile.email && (
                    <a
                      href={`mailto:${profile.email}`}
                      className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-200 hover:text-cyan-400 transition"
                      title="Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {profile.whatsapp && (
                    <a
                      href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 hover:text-emerald-300 transition"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={handleDownloadVCF}
                    className="p-2 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
                    title="Save Contact"
                  >
                    <Contact className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Primary CTA button: Save to Contacts */}
                <button
                  onClick={handleDownloadVCF}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-1.5 ${themeStyles.primaryBtn}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save Contact (.vcf)</span>
                </button>

                {/* Custom Links */}
                <div className="space-y-2 pt-1">
                  {profile.customLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold block transition ${
                        link.highlight
                          ? 'border-cyan-400/80 bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-400/40'
                          : themeStyles.buttonBg
                      }`}
                    >
                      <span className="truncate block">{link.title}</span>
                    </a>
                  ))}
                </div>

                {/* Social Icons row */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-900">
                  {profile.github && (
                    <a href={profile.github} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-white">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {profile.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-white">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {profile.twitter && (
                    <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-white">
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {profile.instagram && (
                    <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-white">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {profile.facebook && (
                    <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-white">
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Footer brand */}
                <p className="text-[9px] text-slate-600 uppercase font-mono tracking-widest pt-2">
                  Powered by NOVA QR
                </p>
              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="w-28 h-1 bg-slate-600 rounded-full mx-auto mt-2 shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
