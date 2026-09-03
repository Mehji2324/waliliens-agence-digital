import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight, Calendar } from 'lucide-react';
import { MagneticButton } from '../motion/MagneticButton';
import { SoundToggle } from '../ui/SoundToggle';
import { Logo } from '../ui/Logo';
import { useCursor } from '../../context/CursorContext';
import { soundManager } from '../../utils/sound';
import { MAIN_NAV_ITEMS } from '../../data/navigation';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setCursorType, resetCursor } = useCursor();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'py-2.5' : 'py-5'
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-12">
          <nav
            aria-label="Main Navigation"
            className={`flex items-center justify-between rounded-full px-5 transition-all duration-300 ${
              isScrolled
                ? 'border border-white/10 bg-obsidian-900/85 py-2 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl'
                : 'border border-transparent bg-transparent py-2.5'
            }`}
          >
            {/* Logo */}
            <Link
              to="/"
              onMouseEnter={() => setCursorType('hover')}
              onMouseLeave={resetCursor}
              className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan rounded-lg"
            >
              <Logo size={34} />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden items-center gap-1 md:flex">
              {MAIN_NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onMouseEnter={() => {
                      setCursorType('hover');
                      soundManager.playHover();
                    }}
                    onMouseLeave={resetCursor}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-sans transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan ${
                      isActive
                        ? 'bg-white/10 text-white font-semibold shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                        : 'text-neutral-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Right Controls: Book a Call CTA + Audio Toggle + Start Project */}
            <div className="hidden items-center gap-3 md:flex">
              {/* Secondary CTA: Book a 30-min call */}
              <Link
                to="/book"
                onMouseEnter={() => setCursorType('hover')}
                onMouseLeave={resetCursor}
                className="hidden lg:flex items-center gap-1.5 rounded-full border border-cyber-cyan/30 bg-cyber-cyan/10 px-3.5 py-1.5 text-xs font-mono text-cyber-cyan transition-colors hover:bg-cyber-cyan/20 focus-visible:ring-2 focus-visible:ring-cyber-cyan"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>BOOK A CALL</span>
              </Link>

              <SoundToggle />

              <MagneticButton
                href="/contact"
                as="a"
                variant="primary"
                className="py-2 px-5 text-xs font-bold"
              >
                <span>START A PROJECT</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </MagneticButton>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <SoundToggle />
              <button
                onClick={() => {
                  soundManager.playClick();
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
                aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
                aria-expanded={mobileMenuOpen}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-obsidian-900/80 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Full-Screen Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 flex flex-col justify-between bg-obsidian-950/98 px-6 pt-28 pb-10 backdrop-blur-2xl md:hidden"
          >
            <div className="space-y-6">
              <div className="font-mono text-xs text-cyber-cyan">
                // WALILIENS_NAVIGATION
              </div>
              <div className="flex flex-col space-y-3">
                <Link
                  to="/"
                  onClick={() => {
                    soundManager.playClick();
                    setMobileMenuOpen(false);
                  }}
                  className="font-display text-2xl font-bold text-white transition-colors hover:text-cyber-cyan"
                >
                  Home
                </Link>
                {MAIN_NAV_ITEMS.map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => {
                        soundManager.playClick();
                        setMobileMenuOpen(false);
                      }}
                      className="font-display text-2xl font-bold text-white transition-colors hover:text-cyber-cyan"
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                <Link
                  to="/book"
                  onClick={() => {
                    soundManager.playClick();
                    setMobileMenuOpen(false);
                  }}
                  className="font-display text-2xl font-bold text-cyber-cyan"
                >
                  Book a Free 30-Min Call
                </Link>
              </div>
            </div>

            <div className="space-y-3 border-t border-white/10 pt-5">
              <div className="flex items-center gap-2 text-xs font-mono text-cyber-emerald">
                <span className="h-2 w-2 rounded-full bg-cyber-emerald" />
                <span>Q3/Q4 COMMISSIONS OPEN</span>
              </div>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyber-cyan to-cyber-violet py-3.5 font-display text-sm font-bold text-obsidian-950"
              >
                <span>START A PROJECT</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
