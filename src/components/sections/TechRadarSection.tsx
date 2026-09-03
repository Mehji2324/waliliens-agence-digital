import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Orbit } from 'lucide-react';
import { useCursor } from '../../context/CursorContext';
import { soundManager } from '../../utils/sound';

export const TechRadarSection: React.FC = () => {
  const { setCursorType, resetCursor } = useCursor();
  const [activeTechIndex, setActiveTechIndex] = useState(0);

  const technologies = [
    {
      name: 'React 19 & Next.js',
      category: 'Core Architecture',
      description: 'Server components, instant edge hydration, zero runtime bloat, and sub-second initial page loads.',
      status: 'PRODUCTION STANDARD',
      color: '#00F0FF',
    },
    {
      name: 'TypeScript & Type-Safety',
      category: 'Resilient Code',
      description: 'Strict type validation from API schema to UI components, preventing production regressions.',
      status: 'STRICT TYPE-SAFETY',
      color: '#8B5CF6',
    },
    {
      name: 'Framer Motion & Spring Physics',
      category: 'Kinetic Motion',
      description: 'Natural spring damping, layout orchestrations, and accessible reduced-motion failovers.',
      status: '60 FPS MOTION',
      color: '#A855F7',
    },
    {
      name: 'Three.js & WebGL Shaders',
      category: 'Interactive 3D',
      description: 'GPU-accelerated 3D product visualizers with compressed assets and zero mobile frame drops.',
      status: 'HARDWARE ACCELERATED',
      color: '#10B981',
    },
    {
      name: 'Tailwind CSS & CSS Tokens',
      category: 'Design Systems',
      description: 'Modular design tokens and atomic utility styling ensuring clean responsive scaling across viewports.',
      status: 'DESIGN ENGINE',
      color: '#F43F5E',
    },
    {
      name: 'Web Audio API FX',
      category: 'Tactile Sound',
      description: 'Procedurally synthesized micro-audio feedback with full user mute controls and zero audio downloads.',
      status: 'PROCEDURAL',
      color: '#F59E0B',
    },
  ];

  return (
    <section id="ecosystem" className="relative bg-obsidian-950 px-6 py-24 sm:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyber-emerald/30 bg-cyber-emerald/10 px-3.5 py-1 text-xs font-mono font-medium tracking-widest text-cyber-emerald uppercase">
              <Orbit className="h-3.5 w-3.5" />
              <span>Technology & Tools</span>
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Our Production <span className="gradient-text-hero">Stack</span>
            </h2>
          </div>
          <p className="max-w-md text-sm text-neutral-400">
            Battle-tested technologies selected for reliability, 60 FPS frame rates, and frictionless scalability.
          </p>
        </div>

        {/* Radar Cards Grid */}
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {technologies.map((tech, idx) => {
            const isSelected = activeTechIndex === idx;
            return (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06, duration: 0.4 }}
                onClick={() => {
                  soundManager.playClick();
                  setActiveTechIndex(idx);
                }}
                onMouseEnter={() => {
                  setCursorType('hover');
                  soundManager.playHover();
                }}
                onMouseLeave={resetCursor}
                className={`cursor-pointer rounded-2xl border p-6 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cyber-cyan ${
                  isSelected
                    ? 'border-cyber-cyan bg-obsidian-900 shadow-[0_0_25px_rgba(0,240,255,0.15)]'
                    : 'border-white/10 bg-obsidian-900/40 hover:border-white/20 hover:bg-obsidian-900/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="font-mono text-xs font-semibold uppercase tracking-wider"
                    style={{ color: tech.color }}
                  >
                    {tech.category}
                  </span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] text-neutral-400">
                    {tech.status}
                  </span>
                </div>

                <h3 className="mt-3 font-display text-lg font-bold text-white">
                  {tech.name}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                  {tech.description}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[11px] text-neutral-500">
                  <span>FRAME TARGET</span>
                  <span className="text-white font-mono">60 FPS</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
