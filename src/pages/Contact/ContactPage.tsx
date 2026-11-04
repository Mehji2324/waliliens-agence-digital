import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Section } from '../../components/layout/Section';
import { FormField } from '../../components/forms/FormField';
import { TextInput } from '../../components/forms/TextInput';
import { TextArea } from '../../components/forms/TextArea';
import { SubmitButton } from '../../components/forms/SubmitButton';
import { FormMessage } from '../../components/forms/FormMessage';
import { contactService } from '../../services/api/contact';
import { useSeo } from '../../hooks/useSeo';
import { soundManager } from '../../utils/sound';
import { useCursor } from '../../context/CursorContext';
import confetti from 'canvas-confetti';
import { Mail, Clock, Shield, CheckCircle2 } from 'lucide-react';
import type { ContactRequest } from '../../types';

export const ContactPage: React.FC = () => {
  useSeo({
    title: 'Start a Project & Contact Us',
    description: 'Submit your project brief or schedule an architectural consultation with Waliliens.',
  });

  const { setCursorType, resetCursor } = useCursor();

  const [formData, setFormData] = useState<ContactRequest>({
    name: '',
    email: '',
    company: '',
    timeline: 'Within 30 Days',
    budget: '$25k - $50k',
    message: '',
    services: ['Custom Web & Digital Products'],
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    setStatus('loading');
    soundManager.playWhoosh(400, 1000, 0.15);

    try {
      const res = await contactService.submitBrief(formData);
      if (res.data?.success) {
        setStatus('success');
        soundManager.playSuccess();
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#00F0FF', '#8B5CF6', '#10B981', '#ffffff'],
        });
      } else {
        setStatus('error');
        setErrorMessage(res.message || 'Unable to transmit brief. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage((err as Error).message || 'Network error transmitting brief.');
    }
  };

  const faqs = [
    {
      q: 'How fast can a project start?',
      a: 'We can typically kick off Discovery within 5 to 7 business days following contract confirmation.',
    },
    {
      q: 'What is the typical sprint timeline?',
      a: 'Most standalone marketing experiences and 3D landing pages ship in 3-4 weeks. Complex web applications take 6-10 weeks.',
    },
    {
      q: 'Do you offer ongoing retainer support?',
      a: 'Yes, we provide ongoing monthly design engineering retainers for continuous feature iterations and performance tuning.',
    },
  ];

  return (
    <div className="bg-obsidian-950">
      <PageHeader
        badge="PROJECT INITIALIZATION"
        title="START A PROJECT BRIEF"
        titleGradient="& DISCOVERY."
        description="Share your objectives, timeline, and vision. We review every submission and reply within 24 business hours with initial thoughts and next steps."
      />

      <Section id="contact-form">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Form Container */}
          <div className="lg:col-span-8 rounded-3xl border border-white/15 bg-obsidian-900/90 p-7 sm:p-10 backdrop-blur-2xl shadow-2xl">
            {status === 'success' ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cyber-emerald/40 bg-cyber-emerald/10 text-cyber-emerald shadow-[0_0_35px_rgba(16,185,129,0.25)]">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold text-white sm:text-3xl">
                  Brief Successfully Transmitted
                </h3>
                <p className="mt-2 max-w-md text-sm text-neutral-300">
                  Thank you, <span className="font-semibold text-white">{formData.name}</span>. A senior partner will review your project brief and follow up at <span className="font-mono text-cyber-cyan">{formData.email}</span> within 24 hours.
                </p>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setStatus('idle');
                  }}
                  className="mt-6 rounded-full border border-white/20 bg-white/5 px-5 py-2 font-mono text-xs text-neutral-300 hover:bg-white/10"
                >
                  TRANSMIT ANOTHER BRIEF
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                aria-describedby={status === 'error' ? 'contact-page-form-error' : undefined}
                className="space-y-6"
              >
                {status === 'error' && (
                  <FormMessage
                    id="contact-page-form-error"
                    type="error"
                    title="Submission Notice"
                    message={errorMessage || 'An error occurred. Please try again or email us directly.'}
                  />
                )}

                {/* Services Selection */}
                <div>
                  <p id="contact-services-label" className="font-mono text-xs uppercase tracking-wider text-neutral-400">
                    01 // What services do you need?
                  </p>
                  <div role="group" aria-labelledby="contact-services-label" className="mt-2.5 flex flex-wrap gap-2">
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
                          className={`rounded-xl px-3.5 py-2 font-sans text-xs font-semibold transition-all duration-200 ${
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

                {/* Budget Tiers */}
                <div>
                  <p id="contact-budget-label" className="font-mono text-xs uppercase tracking-wider text-neutral-400">
                    02 // Estimated project budget
                  </p>
                  <div role="group" aria-labelledby="contact-budget-label" className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
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
                        className={`rounded-xl border py-2 text-center font-mono text-xs transition-all ${
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

                {/* Inputs Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Your Name" required>
                    <TextInput
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alex Mercer"
                    />
                  </FormField>

                  <FormField label="Work Email" required>
                    <TextInput
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. alex@company.com"
                    />
                  </FormField>
                </div>

                <FormField label="Project Vision & Timeline">
                  <TextArea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Briefly describe what you're building, desired launch date, or specific goals..."
                  />
                </FormField>

                <div className="flex items-start gap-3 text-sm text-neutral-300">
                  <input
                    id="contact-privacy-consent"
                    name="privacyConsent"
                    type="checkbox"
                    required
                    className="mt-1 h-4 w-4 accent-cyber-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyber-cyan"
                  />
                  <label htmlFor="contact-privacy-consent" className="leading-relaxed">
                    I agree to be contacted regarding this inquiry.
                  </label>
                </div>

                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
                    <Clock className="h-3.5 w-3.5 text-cyber-emerald" />
                    <span>24-hour turnaround commitment</span>
                  </div>

                  <SubmitButton isLoading={status === 'loading'} loadingText="TRANSMITTING BRIEF...">
                    DISPATCH PROPOSAL BRIEF
                  </SubmitButton>
                </div>
              </form>
            )}
          </div>

          {/* Right Information Sidebar & FAQ */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-obsidian-900/60 p-6 backdrop-blur-xl space-y-4">
              <h3 className="font-display text-lg font-bold text-white">Direct Communication</h3>
              <div className="space-y-3 font-mono text-xs">
                <a
                  href="mailto:waliliens.ai@gmail.com"
                  className="flex items-center gap-2.5 text-neutral-300 hover:text-cyber-cyan transition-colors"
                >
                  <Mail className="h-4 w-4 text-cyber-cyan shrink-0" />
                  <span>waliliens.ai@gmail.com</span>
                </a>
                <div className="flex items-center gap-2.5 text-neutral-400">
                  <Shield className="h-4 w-4 text-cyber-emerald shrink-0" />
                  <span>NDA upon first consultation</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-obsidian-900/60 p-6 backdrop-blur-xl space-y-4">
              <h3 className="font-display text-base font-bold text-white">Frequently Asked</h3>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="text-xs space-y-1">
                    <div className="font-semibold text-neutral-200">{faq.q}</div>
                    <div className="text-neutral-400 leading-relaxed">{faq.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};
