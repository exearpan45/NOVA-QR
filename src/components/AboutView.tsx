import React from 'react';
import {
  ExternalLink,
  Github,
  Globe,
  Mail,
  Linkedin,
  Shield,
  Zap,
  Cpu,
} from 'lucide-react';
import { NovaLogo } from './NovaLogo';

interface AboutViewProps {
  theme: 'dark' | 'light';
}

export const AboutView: React.FC<AboutViewProps> = ({ theme }) => {
  const cardClass = `p-6 sm:p-8 rounded-3xl border ${
    theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
  }`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Brand Hero */}
      <div className={`${cardClass} text-center relative overflow-hidden`}>
        <div className="flex justify-center mb-5">
          <NovaLogo size="lg" showTagline={true} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          About NOVA QR
        </h1>
        <p className="mt-3 text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          NOVA QR is a lightweight, privacy-focused QR generation and scanning suite designed to make creating, customizing, and sharing QR codes fast, intuitive, and beautiful. Built entirely with client-side engineering for zero server latency, complete privacy, and full offline resilience.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 text-left">
          <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
            <Zap className="w-5 h-5 text-cyan-400 mb-2" />
            <h4 className="text-xs font-bold text-white">Instant & Lightweight</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Optimized for instant load times, low RAM usage, and smooth rendering on low-end laptops and mobile phones.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
            <Shield className="w-5 h-5 text-emerald-400 mb-2" />
            <h4 className="text-xs font-bold text-white">100% Client-Side Privacy</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Your Wi-Fi passwords, contact details, and locations never touch a remote server or analytics service.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
            <Cpu className="w-5 h-5 text-purple-400 mb-2" />
            <h4 className="text-xs font-bold text-white">Progressive Web App</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Installable onto Android, iOS, Windows, and Mac with offline service-worker caching.
            </p>
          </div>
        </div>
      </div>

      {/* Creator Profile */}
      <div className={cardClass}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-purple-600 p-0.5 shrink-0 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
              <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                AG
              </span>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Developer & Creator
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">Created by Arpan Goswami</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              “Arpan Goswami is an aspiring web developer interested in technology, science, AI, and building useful digital tools.”
            </p>

            {/* Social & Portfolio Links */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
              <a
                href="https://arpangoswami.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Portfolio</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
              </a>

              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </a>

              <a
                href="mailto:contact@arpangoswami.dev"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="text-center py-4 text-xs text-slate-500 font-medium">
        © 2026 Copyright Arpan Goswami. All rights reserved.
      </div>
    </div>
  );
};
