import React, { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion';
import Lenis from 'lenis';
import { router } from './routes';
import { CursorProvider } from '../context/CursorContext';
import { AdminAuthProvider } from '../context/AdminAuthContext';
import { CustomCursor } from '../components/motion/CustomCursor';
import { Preloader } from '../components/motion/Preloader';
import { useMousePosition } from '../hooks/useMousePosition';
import { useReducedMotion } from '../hooks/useReducedMotion';

export const App: React.FC = () => {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Initialize mouse position tracking for CSS spotlight gradients
  useMousePosition();

  // Initialize Lenis smooth scroll
  useEffect(() => {
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [prefersReducedMotion]);

  return (
    <AdminAuthProvider>
      <CursorProvider>
        <MotionConfig reducedMotion={prefersReducedMotion ? 'always' : 'never'}>
          <LazyMotion features={domAnimation} strict>
            <div className="relative min-h-screen bg-obsidian-950 text-neutral-100 selection:bg-cyber-cyan/30 selection:text-white">
              <a href="#main-content" className="skip-link">
                Skip to main content
              </a>

              {!loadingComplete && (
                <Preloader onComplete={() => setLoadingComplete(true)} />
              )}

              <CustomCursor />

              <RouterProvider router={router} />
            </div>
          </LazyMotion>
        </MotionConfig>
      </CursorProvider>
    </AdminAuthProvider>
  );
};

export default App;
