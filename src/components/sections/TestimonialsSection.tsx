import React from 'react';
import { m } from 'framer-motion';
import { TESTIMONIALS } from '../../data/testimonials';
import { TiltCard } from '../motion/TiltCard';
import { MessageSquareQuote, Star } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="relative bg-obsidian-950 px-6 py-28 sm:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyber-cyan/30 bg-cyber-cyan/10 px-3.5 py-1 text-xs font-mono font-medium tracking-widest text-cyber-cyan uppercase">
            <MessageSquareQuote className="h-3.5 w-3.5" />
            <span>Executive Endorsements</span>
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Trusted by the <span className="gradient-text-accent">Visionaries</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-400">
            How our engineering and motion direction helped world-class companies command their markets.
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((item, idx) => (
            <m.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
            >
              <TiltCard maxTilt={6} className="flex h-full flex-col justify-between p-8">
                <div>
                  {/* Rating Stars & Impact Badge */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-5">
                    <div className="flex gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="rounded-full bg-cyber-emerald/10 px-3 py-1 font-mono text-xs font-bold text-cyber-emerald">
                      {item.impact}
                    </span>
                  </div>

                  {/* Quote */}
                  <p className="mt-6 text-sm leading-relaxed text-neutral-200">
                    "{item.quote}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="mt-8 flex items-center gap-4 border-t border-white/10 pt-5">
                  <img
                    src={item.avatar}
                    alt=""
                    width={200}
                    height={200}
                    loading="lazy"
                    className="h-12 w-12 rounded-full border border-white/20 object-cover"
                  />
                  <div>
                    <div className="font-display text-sm font-bold text-white">
                      {item.author}
                    </div>
                    <div className="font-mono text-xs text-neutral-400">
                      {item.role}, <span className="text-cyber-cyan">{item.company}</span>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
};
