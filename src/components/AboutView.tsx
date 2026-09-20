import React from 'react';
import {
  Github,
  Mail,
  Instagram,
  Shield,
  Zap,
  Cpu,
} from 'lucide-react';
import { NovaLogo } from './NovaLogo';

interface AboutViewProps {
  theme: 'dark' | 'light';
}

export const AboutView: React.FC<AboutViewProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  const cardClass = `p-6 sm:p-8 rounded-3xl border transition-all ${
    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-md'
  }`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Brand Hero */}
      <div className={`${cardClass} text-center relative overflow-hidden`}>
        <div className="flex justify-center mb-5">
          <NovaLogo size="lg" showTagline={true} />
        </div>

        <h1 className={`text-2xl sm:text-3xl font-extrabold ${
          isDark ? 'text-slate-100' : 'text-slate-900'
        }`}>
          About NOVA QR
        </h1>
        <p className={`mt-3 text-sm max-w-2xl mx-auto leading-relaxed font-normal ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        }`}>
          NOVA QR is a lightweight, privacy-focused QR generation and scanning suite designed to make creating, customizing, and sharing QR codes fast, intuitive, and beautiful. Built entirely with client-side engineering for zero server latency, complete privacy, and full offline resilience.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 text-left">
          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
          }`}>
            <Zap className={`w-5 h-5 mb-2 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
            <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Instant & Lightweight</h4>
            <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Optimized for instant load times, low RAM usage, and smooth rendering on low-end laptops and mobile phones.
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
          }`}>
            <Shield className={`w-5 h-5 mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>100% Client-Side Privacy</h4>
            <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Your Wi-Fi passwords, contact details, and locations never touch a remote server or analytics service.
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
          }`}>
            <Cpu className={`w-5 h-5 mb-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Progressive Web App</h4>
            <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
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
            <span className={`text-xs font-bold uppercase tracking-widest ${
              isDark ? 'text-cyan-400' : 'text-cyan-700'
            }`}>
              Developer & Creator
            </span>
            <h2 className={`text-xl font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Created by Arpan Goswami</h2>
            <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600 font-medium'
            }`}>
              “Arpan Goswami is an aspiring web developer interested in technology, science, AI, and building useful digital tools.”
            </p>

            {/* Social & Contact Links */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
              <a
                href="https://github.com/exearpan45"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-950 border-slate-300 shadow-xs'
                }`}
                title="Visit GitHub Profile"
              >
                <Github className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`} />
                <span>GitHub</span>
              </a>

              <a
                href="https://instagram.com/_arpan.x"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-pink-400 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-pink-600 border-slate-300 shadow-xs'
                }`}
                title="Visit Instagram Profile"
              >
                <Instagram className="w-3.5 h-3.5 text-pink-500" />
                <span>Instagram</span>
              </a>

              <a
                href="mailto:exe.arpan45@gmail.com"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-cyan-300 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-cyan-700 border-slate-300 shadow-xs'
                }`}
                title="Send Email"
              >
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className={`text-center py-4 text-xs font-medium ${
        isDark ? 'text-slate-500' : 'text-slate-600'
      }`}>
        © 2026 Copyright Arpan Goswami. All rights reserved.
      </div>
    </div>
  );
};
