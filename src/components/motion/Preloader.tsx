import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Logo } from '../ui/Logo';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const prefersReducedMotion = useReducedMotion();
  const [hasSeenPreloader] = useState(() =>
    typeof window !== 'undefined' && sessionStorage.getItem('walili_preloader_seen') === 'true',
  );
  const [percent, setPercent] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion || hasSeenPreloader) {
      onComplete();
      return;
    }

    const duration = 500; // Ultra-fast 500ms
    const intervalTime = 16;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setPercent((prev) => {
        const next = prev + step + Math.random() * 5;
        if (next >= 100) {
          clearInterval(timer);
          sessionStorage.setItem('walili_preloader_seen', 'true');
          setTimeout(() => {
            setIsFinished(true);
            setTimeout(onComplete, 350);
          }, 100);
          return 100;
        }
        return Math.floor(next);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [hasSeenPreloader, onComplete, prefersReducedMotion]);

  if (prefersReducedMotion || hasSeenPreloader) return null;

  return (
    <AnimatePresence>
      {!isFinished && (
        <m.div
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
            transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-obsidian-950 px-6"
        >
          <div className="relative z-10 flex flex-col items-center">
            {/* Minimalist Studio Mark */}
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <Logo size={46} />
            </m.div>

            {/* Quick Loading Bar */}
            <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-obsidian-800">
              <m.div
                className="h-full bg-gradient-to-r from-cyber-cyan via-cyber-violet to-cyber-purple"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="mt-3 flex w-48 items-center justify-between font-mono text-[11px] text-neutral-400">
              <span className="text-cyber-cyan">STUDIO INITIALIZED</span>
              <span className="font-bold text-white">{percent}%</span>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
};
