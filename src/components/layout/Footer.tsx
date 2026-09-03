import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Globe, Clock, Mail } from 'lucide-react';
import { MagneticButton } from '../motion/MagneticButton';
import { Logo } from '../ui/Logo';
import { soundManager } from '../../utils/sound';
import { FOOTER_NAV_ITEMS } from '../../data/navigation';

export const Footer: React.FC = () => {
  const [times, setTimes] = useState({
    tokyo: '',
    london: '',
    sanfrancisco: '',
    casablanca: '',
  });

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      const format = (tz: string) =>
        new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(now);

      setTimes({
        tokyo: format('Asia/Tokyo'),
        london: format('Europe/London'),
        sanfrancisco: format('America/Los_Angeles'),
        casablanca: format('Africa/Casablanca'),
      });
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    soundManager.playWhoosh(400, 900, 0.15);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-white/10 bg-obsidian-950 px-6 pt-16 pb-12 sm:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        {/* Top Tier */}
        <div className="flex flex-col justify-between gap-8 border-b border-white/10 pb-12 lg:flex-row lg:items-end">
          <div>
            <Link to="/" className="group">
              <Logo size={38} />
            </Link>
            <p className="mt-3 max-w-md text-sm text-neutral-400">
              Creative digital & AI studio. We design and build high-converting websites, bespoke web applications, and immersive 3D interfaces.
            </p>

            {/* Quick Navigation Row */}
            <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono text-neutral-400">
              {FOOTER_NAV_ITEMS.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`transition-colors hover:text-white ${
                    item.highlight ? 'text-cyber-cyan font-bold' : ''
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Direct Contact & Top Action */}
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="mailto:hello@waliliens.com"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-obsidian-900/80 px-4 py-2.5 font-mono text-xs text-neutral-300 transition-colors hover:border-cyber-cyan hover:text-white focus-visible:ring-2 focus-visible:ring-cyber-cyan"
            >
              <Mail className="h-3.5 w-3.5 text-cyber-cyan" />
              <span>hello@waliliens.com</span>
            </a>

            <MagneticButton
              onClick={scrollToTop}
              variant="secondary"
              className="py-2.5 px-5 text-xs font-mono"
            >
              <ArrowUp className="h-3.5 w-3.5 text-cyber-cyan" />
              <span>BACK TO TOP</span>
            </MagneticButton>
          </div>
        </div>

        {/* Clocks Tier */}
        <div className="grid grid-cols-2 gap-5 py-8 sm:grid-cols-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-500">
              <Clock className="h-3 w-3 text-cyber-cyan" />
              <span>TOKYO // JST</span>
            </div>
            <div className="mt-1 font-mono text-sm font-bold text-white">
              {times.tokyo || '19:00:00'}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-500">
              <Clock className="h-3 w-3 text-cyber-violet" />
              <span>LONDON // GMT</span>
            </div>
            <div className="mt-1 font-mono text-sm font-bold text-white">
              {times.london || '10:00:00'}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-500">
              <Clock className="h-3 w-3 text-cyber-emerald" />
              <span>CASABLANCA // WET</span>
            </div>
            <div className="mt-1 font-mono text-sm font-bold text-white">
              {times.casablanca || '10:00:00'}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-500">
              <Clock className="h-3 w-3 text-cyber-rose" />
              <span>SAN FRANCISCO // PST</span>
            </div>
            <div className="mt-1 font-mono text-sm font-bold text-white">
              {times.sanfrancisco || '02:00:00'}
            </div>
          </div>
        </div>

        {/* Bottom Tier */}
        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs font-mono text-neutral-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-cyber-cyan" />
            <span>STUDIO PROTOCOL // 34.020882° N, 6.841650° W</span>
          </div>

          <div>
            © {new Date().getFullYear()} WALILIENS. ALL RIGHTS RESERVED.
          </div>
        </div>
      </div>
    </footer>
  );
};
