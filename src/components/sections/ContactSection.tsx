import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Send, CheckCircle2, Terminal, Clock } from 'lucide-react';
import { MagneticButton } from '../motion/MagneticButton';
import { useCursor } from '../../context/CursorContext';
import { soundManager } from '../../utils/sound';

export const ContactSection: React.FC = () => {
  const { setCursorType, resetCursor } = useCursor();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    timeline: 'Within 30 Days',
    budget: '$25k - $50k',
    message: '',
    services: ['Custom Web & Digital Products'] as string[],
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableServices = [
    'Custom Web & Digital Products',
    'Motion Design & Interactive 3D',
    'AI Integration & Smart Interfaces',
    'Brand Systems & Design Architecture',
  ];

  const budgetTiers = [
    '$10k - $25k',
    '$25k - $50k',
    '$50k - $100k',
    '$100k+',
  ];

  const handleToggleService = (service: string) => {
    soundManager.playClick();
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    setIsSubmitting(true);
    soundManager.playWhoosh(400, 1000, 0.15);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      soundManager.playSuccess();

      // Launch celebratory particle confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00F0FF', '#8B5CF6', '#10B981', '#ffffff'],
      });
    }, 800);
  };

  return (
    <section id="contact" className="relative bg-obsidian-950 px-6 py-24 sm:px-12 lg:px-24">
      {/* Ambient Lighting Cones */}
      <div className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-cyber-violet/15 blur-[140px]" />

      <div className="mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyber-cyan/30 bg-cyber-cyan/10 px-3.5 py-1 text-xs font-mono font-medium tracking-widest text-cyber-cyan uppercase">
            <Terminal className="h-3.5 w-3.5" />
            <span>Start a Project</span>
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Let's Build Something <span className="gradient-text-hero">Exceptional</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-neutral-400">
            Tell us about your project vision, timeline, and goals. We review every brief and reply within 24 hours with initial thoughts and next steps.
          </p>
        </div>

        {/* Form Container */}
        <div className="mt-14 rounded-3xl border border-white/15 bg-obsidian-900/90 p-7 shadow-[0_20px_70px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:p-11">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <m.div
                key="success"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-10 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cyber-emerald/40 bg-cyber-emerald/10 text-cyber-emerald shadow-[0_0_35px_rgba(16,185,129,0.25)]">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold text-white sm:text-3xl">
                  Brief Received
                </h3>
                <p className="mt-2 max-w-md text-sm text-neutral-300">
                  Thank you, <span className="font-semibold text-white">{formData.name}</span>. A senior partner from Waliliens will review your requirements and reach out to <span className="font-mono text-cyber-cyan">{formData.email}</span> within 24 business hours.
                </p>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setIsSubmitted(false);
                  }}
                  className="mt-7 rounded-full border border-white/20 bg-white/5 px-5 py-2 font-mono text-xs text-neutral-300 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyber-cyan"
                >
                  SUBMIT ANOTHER INQUIRY
                </button>
              </m.div>
            ) : (
              <m.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-7"
              >
                {/* 1. Services Selection */}
                <div>
                  <p id="home-contact-services-label" className="font-mono text-xs uppercase tracking-wider text-neutral-400">
                    01 // What services do you need?
                  </p>
                  <div role="group" aria-labelledby="home-contact-services-label" className="mt-3 flex flex-wrap gap-2.5">
                    {availableServices.map((service) => {
                      const selected = formData.services.includes(service);
                      return (
                        <button
                          key={service}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => handleToggleService(service)}
                          onMouseEnter={() => setCursorType('hover')}
                          onMouseLeave={resetCursor}
                          className={`rounded-xl px-3.5 py-2 font-sans text-xs font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cyber-cyan ${
                            selected
                              ? 'border-cyber-cyan bg-cyber-cyan text-obsidian-950 shadow-[0_0_12px_rgba(0,240,255,0.35)]'
                              : 'border border-white/10 bg-obsidian-950/60 text-neutral-300 hover:border-white/30'
                          }`}
                        >
                          {service}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Budget Tiers */}
                <div>
                  <p id="home-contact-budget-label" className="font-mono text-xs uppercase tracking-wider text-neutral-400">
                    02 // Estimated project budget
                  </p>
                  <div role="group" aria-labelledby="home-contact-budget-label" className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {budgetTiers.map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        aria-pressed={formData.budget === tier}
                        onClick={() => {
                          soundManager.playClick();
                          setFormData({ ...formData, budget: tier });
                        }}
                        onMouseEnter={() => setCursorType('hover')}
                        onMouseLeave={resetCursor}
                        className={`rounded-xl border py-2.5 text-center font-mono text-xs transition-all focus-visible:ring-2 focus-visible:ring-cyber-cyan ${
                          formData.budget === tier
                            ? 'border-cyber-violet bg-cyber-violet/20 font-bold text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                            : 'border-white/10 bg-obsidian-950/60 text-neutral-400 hover:border-white/30'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Inputs Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="block font-mono text-xs text-neutral-400">
                      YOUR NAME *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alex Mercer"
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-obsidian-950/80 px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-cyber-cyan focus:outline-none focus:ring-1 focus:ring-cyber-cyan"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block font-mono text-xs text-neutral-400">
                      WORK EMAIL *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. alex@company.com"
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-obsidian-950/80 px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-cyber-cyan focus:outline-none focus:ring-1 focus:ring-cyber-cyan"
                    />
                  </div>
                </div>

                {/* 4. Project Brief */}
                <div>
                  <label htmlFor="contact-brief" className="block font-mono text-xs text-neutral-400">
                    PROJECT OBJECTIVES & TIMELINE
                  </label>
                  <textarea
                    id="contact-brief"
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Briefly describe what you're looking to build, desired timeline, or any specific reference sites..."
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-obsidian-950/80 p-3.5 text-sm text-white placeholder-neutral-600 focus:border-cyber-cyan focus:outline-none focus:ring-1 focus:ring-cyber-cyan"
                  />
                </div>

                {/* Submit Action */}
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row border-t border-white/10 pt-5">
                  <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
                    <Clock className="h-3.5 w-3.5 text-cyber-emerald" />
                    <span>24-hour response turnaround</span>
                  </div>

                  <MagneticButton
                    variant="primary"
                    className="w-full sm:w-auto py-3.5 px-8 text-sm font-bold"
                  >
                    <span>{isSubmitting ? 'SENDING INQUIRY...' : 'START A PROJECT'}</span>
                    <Send className="h-3.5 w-3.5" />
                  </MagneticButton>
                </div>
              </m.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
