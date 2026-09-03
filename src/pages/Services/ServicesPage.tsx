import React from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../../components/layout/PageHeader';
import { Section } from '../../components/layout/Section';
import { TiltCard } from '../../components/motion/TiltCard';
import { SERVICES } from '../../data/services';
import { useSeo } from '../../hooks/useSeo';
import { Cpu, Layers, Activity, Zap, Check, X, ArrowUpRight, ShieldCheck, UserCheck } from 'lucide-react';
import { MagneticButton } from '../../components/motion/MagneticButton';
import { Link } from 'react-router-dom';

export const ServicesPage: React.FC = () => {
  useSeo({
    title: 'Services & Capabilities',
    description: 'Explore Waliliens core engineering capabilities: Custom Web Applications, Motion Design & 3D, AI Integrations, and Design Systems.',
  });

  const iconMap: Record<string, React.ReactNode> = {
    Zap: <Zap className="h-6 w-6 text-cyber-cyan" />,
    Layers: <Layers className="h-6 w-6 text-cyber-violet" />,
    Cpu: <Cpu className="h-6 w-6 text-cyber-emerald" />,
    Activity: <Activity className="h-6 w-6 text-cyber-rose" />,
  };

  const comparisonRows = [
    { feature: '100% Bespoke Code & Architecture', walili: true, agency: false, template: false },
    { feature: '60 FPS Hardware-Accelerated Motion', walili: true, agency: 'Sometimes', template: false },
    { feature: 'Sub-Second Global Edge Delivery', walili: true, agency: false, template: false },
    { feature: 'Dedicated Senior Partner Access', walili: true, agency: false, template: false },
    { feature: 'AI Integration & Smart Interfaces', walili: true, agency: 'Extra Cost', template: false },
    { feature: 'Continuous Telemetry & Post-Launch Support', walili: true, agency: 'Hourly Fee', template: false },
  ];

  return (
    <div className="bg-obsidian-950">
      <PageHeader
        badge="SERVICES & DISCIPLINES"
        title="ENGINEERING COMMERCIAL"
        titleGradient="ADVANTAGE."
        description="We partner with ambitious companies to build high-converting websites, web apps, and immersive 3D interfaces designed to dominate their category."
      />

      {/* Services Deep Dive Grid */}
      <Section id="services-grid">
        <div className="space-y-12">
          {SERVICES.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
            >
              <TiltCard maxTilt={3} className="p-8 sm:p-12">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                  {/* Left Column: Number, Title, Overview */}
                  <div className="lg:col-span-6 space-y-5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-cyber-cyan">
                        // 0{idx + 1}
                      </span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                        {iconMap[service.icon]}
                      </div>
                    </div>

                    <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                      {service.title}
                    </h2>
                    <p className="font-mono text-xs text-cyber-violet font-semibold">
                      {service.subtitle}
                    </p>
                    <p className="text-sm leading-relaxed text-neutral-300">
                      {service.description}
                    </p>

                    <div className="space-y-2 rounded-xl border border-white/5 bg-obsidian-950/70 p-4 text-xs">
                      <div className="flex items-start gap-2 text-neutral-200">
                        <UserCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyber-cyan" />
                        <span><strong>Target Audience:</strong> {service.whoFor}</span>
                      </div>
                      <div className="flex items-start gap-2 text-neutral-400">
                        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyber-emerald" />
                        <span><strong>Problem Solved:</strong> {service.problemSolved}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Capabilities & Deliverables */}
                  <div className="lg:col-span-6 flex flex-col justify-between space-y-6 lg:border-l lg:border-white/10 lg:pl-8">
                    <div>
                      <h3 className="font-mono text-xs uppercase tracking-wider text-neutral-400">
                        Core Capabilities:
                      </h3>
                      <div className="mt-3 space-y-2">
                        {service.capabilities.map((cap, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-neutral-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyber-violet" />
                            <span>{cap}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-mono text-xs uppercase tracking-wider text-neutral-400">
                        Key Deliverables:
                      </h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {service.deliverables.map((del, i) => (
                          <span
                            key={i}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-neutral-300"
                          >
                            {del}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="font-mono text-xs text-neutral-500">
                        ESTIMATED SPRINT: 2-4 WEEKS
                      </span>
                      <Link
                        to="/contact"
                        className="flex items-center gap-1.5 font-mono text-xs font-bold text-cyber-cyan hover:underline"
                      >
                        <span>INQUIRE ABOUT THIS DISCIPLINE</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Comparison Matrix Table */}
      <Section id="comparison" className="border-t border-white/10 bg-obsidian-900/40">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-2xl font-bold text-white sm:text-4xl">
            Why Waliliens <span className="gradient-text-hero">Stands Apart</span>
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            How our focused senior engineering model compares to legacy agencies and off-the-shelf templates.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-obsidian-900/80 backdrop-blur-xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-obsidian-950 font-mono text-neutral-400">
                <th className="p-4 sm:p-5">CRITERIA</th>
                <th className="p-4 sm:p-5 text-cyber-cyan font-bold">WALILIENS STUDIO</th>
                <th className="p-4 sm:p-5">TRADITIONAL AGENCY</th>
                <th className="p-4 sm:p-5">TEMPLATES / BUILDERS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans text-neutral-300">
              {comparisonRows.map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 sm:p-5 font-medium text-white">{row.feature}</td>
                  <td className="p-4 sm:p-5 text-cyber-emerald font-semibold font-mono">
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-cyber-emerald" /> Yes
                    </span>
                  </td>
                  <td className="p-4 sm:p-5 text-neutral-400 font-mono">
                    {typeof row.agency === 'boolean' ? (
                      row.agency ? <Check className="h-4 w-4 text-neutral-400" /> : <X className="h-4 w-4 text-cyber-rose/70" />
                    ) : (
                      row.agency
                    )}
                  </td>
                  <td className="p-4 sm:p-5 text-neutral-500 font-mono">
                    {typeof row.template === 'boolean' ? (
                      row.template ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 text-cyber-rose/70" />
                    ) : (
                      row.template
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action CTA */}
        <div className="mt-14 text-center">
          <MagneticButton href="/book" variant="primary" className="py-4 px-8 text-sm font-bold">
            <span>BOOK A FREE 30-MIN DISCOVERY CALL</span>
            <ArrowUpRight className="h-4 w-4" />
          </MagneticButton>
        </div>
      </Section>
    </div>
  );
};
