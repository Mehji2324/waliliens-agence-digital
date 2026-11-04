import React, { useState, useEffect, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { STORY_STEPS } from '../../data/testimonials';
import { ShieldCheck, Compass, Sparkles, Code2, Rocket, Terminal, Activity } from 'lucide-react';

export const ScrollPinStory: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(max-width: 1023px), (any-pointer: coarse)').matches) return;
    let frameId = 0;

    const handleScroll = () => {
      if (frameId) return;
      frameId = requestAnimationFrame(() => {
        frameId = 0;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollable = rect.height - windowHeight;

      if (totalScrollable <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / totalScrollable));
      const stepIndex = Math.min(
        STORY_STEPS.length - 1,
        Math.floor(progress * STORY_STEPS.length)
      );

      setActiveStep(stepIndex);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(frameId);
    };
  }, []);

  const icons = [Compass, Sparkles, Code2, Rocket];
  const StepIcon = icons[activeStep] || Compass;

  return (
    <section
      ref={containerRef}
      id="process"
      className="relative min-h-[100vh] bg-obsidian-950 px-6 py-20 sm:px-12 lg:min-h-[260vh] lg:px-24"
    >
      {/* Sticky Storytelling Stage */}
      <div className="sticky top-20 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyber-violet/30 bg-cyber-violet/10 px-3.5 py-1 text-xs font-mono font-medium tracking-widest text-cyber-violet uppercase">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            <span>How We Work</span>
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Our 4-Stage <span className="gradient-text-accent">Delivery Methodology</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-400">
            A disciplined, transparent process taking you from initial concept to high-converting production deployment.
          </p>
        </div>

        {/* Two-Column Matrix */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          {/* Left Stepper List */}
          <div className="space-y-4 lg:col-span-5">
            {STORY_STEPS.map((step, index) => {
              const isActive = activeStep === index;
              return (
                <m.div
                  key={step.phase}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  onClick={() => setActiveStep(index)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setActiveStep(index);
                    }
                  }}
                  animate={{
                    opacity: isActive ? 1 : 0.4,
                    x: isActive ? 6 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 ${
                    isActive
                      ? 'border-cyber-violet/50 bg-obsidian-900/90 shadow-[0_0_25px_rgba(139,92,246,0.15)]'
                      : 'border-white/5 bg-obsidian-900/30 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold tracking-widest text-cyber-cyan">
                      STAGE // {step.phase}
                    </span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] text-neutral-400">
                      {step.tag}
                    </span>
                  </div>

                  <h3 className="mt-2.5 font-display text-lg font-bold text-white">
                    {step.title}
                  </h3>

                  <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">
                    {step.description}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs font-mono text-neutral-300">
                    <ShieldCheck className="h-3.5 w-3.5 text-cyber-emerald shrink-0" />
                    <span className="truncate">{step.stats}</span>
                  </div>
                </m.div>
              );
            })}
          </div>

          {/* Right Holographic Display Container */}
          <div className="lg:col-span-7">
            <div className="relative flex aspect-square max-h-[460px] w-full flex-col justify-between overflow-hidden rounded-3xl border border-white/15 bg-obsidian-900/90 p-7 shadow-2xl backdrop-blur-2xl">
              {/* Glow Cones */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyber-violet/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyber-cyan/20 blur-3xl" />

              {/* Holographic Header Bar */}
              <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-cyber-rose/80" />
                  <div className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-cyber-amber/80" />
                  <div className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-cyber-emerald/80" />
                  <span className="ml-2 font-mono text-[11px] text-neutral-400">
                    WALILIENS_PROCESS_STAGE_0{activeStep + 1}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 rounded-full bg-cyber-violet/20 px-2.5 py-0.5 font-mono text-[11px] text-cyber-violet">
                  <Terminal className="h-3 w-3" />
                  <span>ACTIVE_STAGE</span>
                </div>
              </div>

              {/* Graphic State */}
              <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center">
                <AnimatePresence mode="wait">
                  <m.div
                    key={activeStep}
                    initial={{ opacity: 0, scale: 0.88, rotate: -4 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.88, rotate: 4 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative flex h-32 w-32 items-center justify-center">
                      <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-dashed border-cyber-cyan/40" />
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyber-cyan/30 via-cyber-violet/30 to-cyber-purple/30 border border-white/20 shadow-[0_0_30px_rgba(139,92,246,0.4)]">
                        <StepIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>

                    <h4 className="mt-5 font-display text-xl font-bold text-white sm:text-2xl">
                      {STORY_STEPS[activeStep].title}
                    </h4>
                    <p className="mt-1.5 max-w-sm text-xs text-neutral-400">
                      {STORY_STEPS[activeStep].subtitle}
                    </p>
                  </m.div>
                </AnimatePresence>
              </div>

              {/* Stage Status Stream */}
              <div className="relative z-10 rounded-xl border border-white/5 bg-obsidian-950/80 p-3 font-mono text-xs text-neutral-400">
                <div className="truncate text-cyber-cyan">
                  {`> STAGE: ${STORY_STEPS[activeStep].tag} // DELIVERABLE: ${STORY_STEPS[activeStep].stats}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
