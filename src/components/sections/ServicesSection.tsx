import React from 'react';
import { m } from 'framer-motion';
import { TiltCard } from '../motion/TiltCard';
import { Cpu, Layers, Activity, Zap, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { useServices } from '../../hooks/useCatalogData';

export const ServicesSection: React.FC = () => {
  const { items: services, isLoading, error } = useServices();
  const iconMap: Record<string, React.ReactNode> = {
    Zap: <Zap className="h-5 w-5 text-cyber-cyan" />,
    Layers: <Layers className="h-5 w-5 text-cyber-violet" />,
    Cpu: <Cpu className="h-5 w-5 text-cyber-emerald" />,
    Activity: <Activity className="h-5 w-5 text-cyber-rose" />,
  };

  return (
    <section id="services" className="relative bg-obsidian-950 px-6 py-24 sm:px-12 lg:px-24">
      {/* Background Glow */}
      <div className="pointer-events-none absolute right-10 top-1/3 h-96 w-96 rounded-full bg-cyber-cyan/10 blur-[130px]" />

      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyber-violet/30 bg-cyber-violet/10 px-3.5 py-1 text-xs font-mono font-medium tracking-widest text-cyber-violet uppercase">
              <Zap className="h-3.5 w-3.5" />
              <span>What We Do</span>
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Engineered for <span className="gradient-text-accent">Business Impact</span>
            </h2>
          </div>
          <p className="max-w-md text-sm text-neutral-400">
            Four specialized disciplines delivering high-converting, unforgettable digital products.
          </p>
        </div>

        {isLoading && <p className="mt-10 text-sm text-neutral-400" role="status">Loading services…</p>}
        {error && <p className="mt-10 text-sm text-rose-300" role="alert">{error}</p>}
        {!isLoading && !error && services.length === 0 && (
          <p className="mt-10 text-sm text-neutral-400">No services are currently published.</p>
        )}
        {/* 2x2 Services Grid */}
        <div className="mt-14 grid grid-cols-1 gap-7 md:grid-cols-2">
          {services.map((service, idx) => (
            <m.div
              key={service.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
            >
              <TiltCard
                maxTilt={5}
                glowColor={
                  service.id === 'custom-web'
                    ? 'rgba(0, 240, 255, 0.18)'
                    : service.id === 'motion-3d'
                    ? 'rgba(139, 92, 246, 0.18)'
                    : service.id === 'ai-interfaces'
                    ? 'rgba(16, 185, 129, 0.18)'
                    : 'rgba(244, 63, 94, 0.18)'
                }
                className="flex h-full flex-col justify-between p-7 sm:p-9"
              >
                <div>
                  {/* Top Bar: Number & Icon */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-5">
                    <span className="font-mono text-xs font-bold tracking-widest text-neutral-500">
                      // 0{idx + 1}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                      {iconMap[service.icon]}
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="mt-5 font-display text-2xl font-bold text-white sm:text-3xl">
                    {service.title}
                  </h3>
                  <p className="mt-1 font-mono text-xs text-cyber-cyan">
                    {service.subtitle}
                  </p>

                  <p className="mt-3 text-sm leading-relaxed text-neutral-300">
                    {service.description}
                  </p>

                  {/* Who it is for & Problem Solved */}
                  <div className="mt-6 space-y-3 rounded-xl border border-white/5 bg-obsidian-950/60 p-4 text-xs">
                    <div className="flex items-start gap-2 text-neutral-300">
                      <UserCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyber-cyan" />
                      <span><strong>Ideal for:</strong> {service.whoFor}</span>
                    </div>
                    <div className="flex items-start gap-2 text-neutral-400">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyber-violet" />
                      <span><strong>Problem solved:</strong> {service.problemSolved}</span>
                    </div>
                  </div>

                  {/* Capabilities List */}
                  <div className="mt-6 space-y-2">
                    <div className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
                      Capabilities:
                    </div>
                    {service.capabilities.map((cap, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-neutral-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyber-violet shrink-0" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Deliverables Pill & Action */}
                <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5">
                  <div className="flex flex-wrap gap-1.5">
                    {service.deliverables.slice(0, 2).map((del, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-white/5 px-2.5 py-1 font-mono text-[10px] text-neutral-400"
                      >
                        {del}
                      </span>
                    ))}
                  </div>

                  <a
                    href="#contact"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all duration-300 group-hover:border-cyber-cyan group-hover:bg-cyber-cyan group-hover:text-obsidian-950 focus-visible:ring-2 focus-visible:ring-cyber-cyan"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </TiltCard>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
};
