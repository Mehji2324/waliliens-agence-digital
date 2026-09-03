import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Eye, Zap, ShieldCheck } from 'lucide-react';
import { TiltCard } from '../motion/TiltCard';

export const ManifestoSection: React.FC = () => {
  const pillars = [
    {
      icon: Eye,
      title: 'Intentional Motion',
      desc: 'Animation is not decoration. Every transition, spring, and parallax cue is engineered to guide user attention and clarify product value.',
    },
    {
      icon: Zap,
      title: 'Zero Latency & 60 FPS',
      desc: 'We enforce strict frame budgets and sub-second edge delivery so your users experience immediate tactile responsiveness across all devices.',
    },
    {
      icon: ShieldCheck,
      title: 'Business-Led Design',
      desc: 'Aesthetics serve commercial growth. We structure user flows and messaging to maximize engagement, retention, and conversion rates.',
    },
  ];

  return (
    <section id="manifesto" className="relative overflow-hidden bg-obsidian-950 px-6 py-24 sm:px-12 lg:px-24">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute -left-40 top-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-cyber-violet/15 blur-[120px]" />

      <div className="mx-auto max-w-5xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyber-cyan/30 bg-cyber-cyan/10 px-3.5 py-1 text-xs font-mono font-medium tracking-widest text-cyber-cyan uppercase">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Our Philosophy</span>
        </div>

        {/* Headline Manifesto */}
        <div className="mt-7">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
            We build digital experiences that refuse to be ignored.
          </h2>
          <div className="mt-5 text-xl font-display font-medium text-neutral-300 sm:text-2xl lg:text-3xl leading-snug">
            <span className="text-white">In a sea of template-driven websites, </span>
            <span className="gradient-text-hero">
              bespoke craft and purposeful motion create the distinction your brand deserves.
            </span>
          </div>
        </div>

        {/* 3 Core Pillars */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <TiltCard maxTilt={6} className="p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-cyber-cyan">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-white">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                    {pillar.desc}
                  </p>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
