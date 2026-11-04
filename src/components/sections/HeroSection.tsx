import React, { lazy, Suspense } from 'react';
import { m } from 'framer-motion';
import { ArrowUpRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { MagneticButton } from '../motion/MagneticButton';
import { TextReveal } from '../motion/TextReveal';
import { MOTION_TOKENS } from '../../utils/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const HeroCanvas = lazy(() =>
  import('../motion/HeroCanvas').then((module) => ({ default: module.HeroCanvas })),
);

export const HeroSection: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-[92vh] w-full flex-col justify-between overflow-hidden bg-obsidian-950 px-6 pt-32 pb-14 sm:px-12 lg:px-24">
      {/* Interactive 60fps Kinetic Canvas Background */}
      {!prefersReducedMotion && (
        <Suspense fallback={null}>
          <HeroCanvas />
        </Suspense>
      )}

      {/* Ambient Lighting Cones */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[750px] rounded-full bg-gradient-to-tr from-cyber-violet/20 via-cyber-cyan/10 to-transparent blur-[130px]" />

      {/* Main Hero Content */}
      <div className="relative z-10 mx-auto w-full max-w-5xl">
        {/* Studio Badge */}
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={MOTION_TOKENS.medium}
          className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-obsidian-900/90 px-4 py-1.5 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
        >
          <span className="flex h-2 w-2 rounded-full bg-cyber-cyan shadow-[0_0_8px_#00F0FF]" />
          <span className="font-mono text-xs font-medium text-neutral-300">
            WALILIENS // CREATIVE DIGITAL & AI STUDIO
          </span>
          <span className="rounded-full bg-cyber-violet/20 px-2 py-0.5 font-mono text-[10px] text-cyber-violet font-semibold">
            AVAILABLE FOR Q3/Q4
          </span>
        </m.div>

        {/* Hero Headline with Masked Word Stagger */}
        <div className="mt-7">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[5rem] leading-[1.08]">
            <TextReveal text="WE DESIGN & BUILD" delay={0.15} type="words" />
            <br />
            <span className="gradient-text-hero">
              <TextReveal text="HIGH-CONVERTING EXPERIENCES" delay={0.3} type="words" />
            </span>
            <br />
            <TextReveal text="POWERED BY MOTION & AI." delay={0.45} type="words" />
          </h1>

          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...MOTION_TOKENS.slow, delay: 0.6 }}
            className="mt-6 max-w-2xl text-base font-sans leading-relaxed text-neutral-300 sm:text-lg lg:text-xl"
          >
            We partner with visionary startups and established brands to build award-winning websites, bespoke web applications, and immersive 3D interfaces designed to turn traffic into revenue.
          </m.p>
        </div>

        {/* Clear CTA Hierarchy */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...MOTION_TOKENS.slow, delay: 0.75 }}
          className="mt-9 flex flex-wrap items-center gap-4 sm:gap-5"
        >
          {/* Primary CTA */}
          <MagneticButton
            href="#contact"
            variant="primary"
            className="py-4 px-8 text-sm font-bold sm:text-base"
          >
            <span>START A PROJECT</span>
            <ArrowUpRight className="h-4 w-4" />
          </MagneticButton>

          {/* Secondary CTA */}
          <MagneticButton
            href="#portfolio"
            variant="secondary"
            className="py-4 px-8 text-sm font-medium sm:text-base"
          >
            <span>VIEW SELECTED WORK</span>
            <Sparkles className="h-4 w-4 text-cyber-cyan" />
          </MagneticButton>
        </m.div>
      </div>

      {/* Hero Bottom Trust Metrics */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...MOTION_TOKENS.slow, delay: 0.9 }}
        className="relative z-10 mx-auto mt-16 w-full max-w-5xl border-t border-white/10 pt-6"
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 font-mono text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-cyber-cyan shrink-0" />
            <span>100% Bespoke Code</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-cyber-violet shrink-0" />
            <span>60 FPS Motion Budget</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-cyber-emerald shrink-0" />
            <span>Sub-Second Load Time</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-cyber-rose shrink-0" />
            <span>Dedicated Senior Team</span>
          </div>
        </div>
      </m.div>
    </section>
  );
};
