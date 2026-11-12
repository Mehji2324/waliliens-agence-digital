import React from 'react';
import { m } from 'framer-motion';
import { TELEMETRY_METRICS } from '../../data/testimonials';

export const TelemetryBar: React.FC = () => {
  return (
    <section className="relative border-y border-white/10 bg-obsidian-900/60 py-10 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 sm:px-12">
        <div className="grid grid-cols-1 gap-x-3 gap-y-6 min-[360px]:grid-cols-2 sm:gap-x-6 lg:grid-cols-4">
          {TELEMETRY_METRICS.map((metric, idx) => (
            <m.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="relative flex min-w-0 flex-col justify-center border-l border-white/10 pl-3 sm:pl-4"
            >
              <div className="flex min-w-0 items-start gap-2 font-mono text-[11px] leading-snug text-neutral-400 sm:text-xs">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyber-cyan animate-ping" />
                <span className="min-w-0 break-words [overflow-wrap:break-word]">{metric.label}</span>
              </div>
              <div className="mt-2 min-w-0 break-words font-display text-[clamp(1rem,5vw,2.25rem)] font-black leading-tight text-white [overflow-wrap:break-word]">
                {metric.value}
              </div>
              <div className="mt-1 min-w-0 break-words font-mono text-[10px] leading-snug text-cyber-violet [overflow-wrap:break-word] sm:text-[11px]">
                {metric.change}
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
};
