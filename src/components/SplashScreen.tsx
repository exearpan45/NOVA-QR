import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NovaLogo } from './NovaLogo';
import { Sparkles, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto transition after 2.4 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 400); // Allow exit fade animation
    }, 2400);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onFinish, 200);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden select-none"
        >
          {/* Cybernetic background ambient glow rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-purple-600/15 blur-[90px] pointer-events-none" />

          {/* Background grid lines */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10 flex flex-col items-center text-center px-6">
            {/* Animated Logo Container */}
            <motion.div
              initial={{ scale: 0.75, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8"
            >
              <NovaLogo size="xl" glow={true} />
            </motion.div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-sm font-semibold tracking-widest uppercase mb-6"
            >
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Create. Scan. Share.</span>
            </motion.div>

            {/* Creator Credit */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-xs text-slate-400 tracking-wide font-medium"
            >
              Made with precision by <span className="text-slate-200 font-semibold">Arpan Goswami</span>
            </motion.div>

            {/* Loading progress indicator */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 140 }}
              transition={{ delay: 0.4, duration: 1.6, ease: 'easeInOut' }}
              className="h-1 bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 rounded-full mt-8 shadow-sm shadow-cyan-500/50"
            />
          </div>

          {/* Instant Skip button */}
          <button
            id="btn-skip-splash"
            onClick={handleSkip}
            className="absolute bottom-8 right-8 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-cyan-300 hover:bg-slate-900/80 border border-slate-800 transition cursor-pointer"
          >
            <span>Skip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
