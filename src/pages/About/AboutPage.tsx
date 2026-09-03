import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Section } from '../../components/layout/Section';
import { ManifestoSection } from '../../components/sections/ManifestoSection';
import { TechRadarSection } from '../../components/sections/TechRadarSection';
import { TeamSection } from '../../components/sections/TeamSection';
import { useSeo } from '../../hooks/useSeo';
import { Shield, Award, Clock, ArrowUpRight } from 'lucide-react';
import { MagneticButton } from '../../components/motion/MagneticButton';
import { TiltCard } from '../../components/motion/TiltCard';

export const AboutPage: React.FC = () => {
  useSeo({
    title: 'About the Studio & Philosophy',
    description: 'Learn about Waliliens: our mission, bespoke senior engineering model, kinetic motion philosophy, and production stack.',
  });

  const studioValues = [
    {
      title: 'Craft Over Volume',
      desc: 'We take on a strictly limited number of commissions per quarter to ensure partners get direct, undivided senior attention.',
      icon: Award,
    },
    {
      title: 'Zero Bloat Architecture',
      desc: 'No bloated template builders or heavy unused libraries. Every line of code serves a measurable performance or aesthetic goal.',
      icon: Shield,
    },
    {
      title: 'Velocity & Reliability',
      desc: 'We deliver complete production milestones in 2-4 week sprints with real-time preview links and transparent communication.',
      icon: Clock,
    },
  ];

  return (
    <div className="bg-obsidian-950">
      <PageHeader
        badge="STUDIO MANIFESTO"
        title="WE FORGE DISTINCTION"
        titleGradient="THROUGH MOTION & CODE."
        description="Waliliens is a senior digital studio founded on the belief that digital experiences should be memorable, lightning-fast, and designed to generate tangible revenue."
      />

      {/* Studio Story Section */}
      <Section id="story">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="font-mono text-xs text-cyber-cyan uppercase tracking-widest">
              // OUR BACKGROUND
            </span>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              An engineering-first studio for the next decade of the web.
            </h2>
            <p className="text-sm leading-relaxed text-neutral-300">
              The modern web is inundated with cookie-cutter SaaS templates and sluggish corporate sites. Users tune them out within seconds.
            </p>
            <p className="text-sm leading-relaxed text-neutral-300">
              At Waliliens, we merge high-end visual design with disciplined software engineering. From custom WebGL shaders to sub-second edge routing, we build digital touchpoints that command authority and convert visitors into long-term clients.
            </p>
          </div>

          <div className="lg:col-span-6 space-y-4">
            {studioValues.map((val) => {
              const Icon = val.icon;
              return (
                <TiltCard key={val.title} maxTilt={4} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-cyber-cyan">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-white">
                        {val.title}
                      </h3>
                      <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
                        {val.desc}
                      </p>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Embedded Philosophy & Tech Stack */}
      <ManifestoSection />
      <TechRadarSection />
      <TeamSection />

      {/* CTA */}
      <Section id="about-cta" className="text-center border-t border-white/10">
        <div className="max-w-2xl mx-auto space-y-5">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Ready to build something extraordinary?
          </h2>
          <p className="text-sm text-neutral-400">
            Book a 30-minute discovery session with our lead architects to discuss your technical and creative goals.
          </p>
          <div className="pt-2">
            <MagneticButton href="/book" variant="primary" className="py-3.5 px-8 text-sm font-bold">
              <span>SCHEDULE A 30-MIN CALL</span>
              <ArrowUpRight className="h-4 w-4" />
            </MagneticButton>
          </div>
        </div>
      </Section>
    </div>
  );
};
