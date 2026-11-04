import React from 'react';
import { m } from 'framer-motion';
import { TELEMETRY_METRICS } from '../../data/testimonials';

export const TelemetryBar: React.FC = () => {
  return (
    <section className="relative border-y border-white/10 bg-obsidian-900/60 py-10 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 sm:px-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {TELEMETRY_METRICS.map((metric, idx) => (
            <m.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="relative flex flex-col justify-center border-l border-white/10 pl-6"
            >
              <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
                <span className="h-1.5 w-1.5 rounded-full bg-cyber-cyan animate-ping" />
                <span>{metric.label}</span>
              </div>
              <div className="mt-2 font-display text-3xl font-black text-white sm:text-4xl">
                {metric.value}
              </div>
              <div className="mt-1 font-mono text-[11px] text-cyber-violet">
                {metric.change}
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
};
