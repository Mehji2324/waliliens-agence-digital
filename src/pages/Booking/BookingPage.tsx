import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Section } from '../../components/layout/Section';
import { FormField } from '../../components/forms/FormField';
import { TextInput } from '../../components/forms/TextInput';
import { TextArea } from '../../components/forms/TextArea';
import { SubmitButton } from '../../components/forms/SubmitButton';
import { FormMessage } from '../../components/forms/FormMessage';
import { bookingService } from '../../services/api/booking';
import { useSeo } from '../../hooks/useSeo';
import { soundManager } from '../../utils/sound';
import { useCursor } from '../../context/CursorContext';
import confetti from 'canvas-confetti';
import { Clock, Video, CheckCircle2, UserCheck, Shield, ExternalLink, Mail, Calendar } from 'lucide-react';
import type { BookingSlot, BookingRequest } from '../../types';

export const BookingPage: React.FC = () => {
  useSeo({
    title: 'Book a Free 30-Min Discovery Session',
    description: 'Schedule a free 30-minute architectural consultation call with Waliliens senior partners.',
  });

  const { setCursorType, resetCursor } = useCursor();

  const [selectedDate, setSelectedDate] = useState<string>('Tomorrow');
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    projectScope: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [confirmationData, setConfirmationData] = useState<{
    bookingId: string;
    scheduledTime: string;
    meetingUrl?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const dateOptions = ['Tomorrow', 'In 2 Days', 'Next Week'];

  const getDateIso = (label: string): string => {
    const d = new Date();
    if (label === 'Tomorrow') {
      d.setDate(d.getDate() + 1);
    } else if (label === 'In 2 Days') {
      d.setDate(d.getDate() + 2);
    } else if (label === 'Next Week') {
      d.setDate(d.getDate() + 7);
    }
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    const loadSlots = async () => {
      setIsLoadingSlots(true);
      setErrorMessage('');
      try {
        const targetDateStr = getDateIso(selectedDate);
        const res = await bookingService.getSlots(targetDateStr);
        setSlots(res.data || []);
        const firstAvailable = (res.data || []).find((s) => s.available);
        if (firstAvailable) {
          setSelectedSlot(firstAvailable.id);
        } else {
          setSelectedSlot('');
        }
      } catch (err) {
        setErrorMessage(
          (err as { message?: string }).message ||
            'Unable to load availability from Google Calendar at this time.'
        );
      } finally {
        setIsLoadingSlots(false);
      }
    };
    loadSlots();
  }, [selectedDate]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !selectedSlot) return;

    const chosen = slots.find((s) => s.id === selectedSlot);
    if (!chosen) return;

    setStatus('loading');
    soundManager.playWhoosh(400, 1000, 0.15);

    const bookingPayload: BookingRequest = {
      slotId: selectedSlot,
      date: chosen.date,
      time: chosen.time,
      name: formData.name,
      email: formData.email,
      company: formData.company,
      projectScope: formData.projectScope,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    };

    try {
      const res = await bookingService.bookCall(bookingPayload);
      if (res.data) {
        setStatus('success');
        setConfirmationData({
          bookingId: res.data.bookingId,
          scheduledTime: res.data.scheduledTime,
          meetingUrl: res.data.meetingUrl,
        });
        soundManager.playSuccess();
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#00F0FF', '#8B5CF6', '#10B981', '#ffffff'],
        });
      } else {
        setStatus('error');
        setErrorMessage(res.message || 'Unable to confirm booking. Please try another slot.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage((err as Error).message || 'Network error scheduling discovery call.');
    }
  };

  return (
    <div className="bg-obsidian-950">
      <PageHeader
        badge="30-MIN DISCOVERY SESSION"
        title="BOOK A FREE STRATEGY"
        titleGradient="& ARCHITECTURE CALL."
        description="Connect directly with Waliliens lead engineering and motion architects. We review your goals, discuss feasibility, and provide actionable next steps."
      />

      <Section id="booking-section">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Booking Flow Container */}
          <div className="lg:col-span-8 rounded-3xl border border-white/15 bg-obsidian-900/90 p-7 sm:p-10 backdrop-blur-2xl shadow-2xl">
            {status === 'success' && confirmationData ? (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cyber-emerald/40 bg-cyber-emerald/10 text-cyber-emerald shadow-[0_0_35px_rgba(16,185,129,0.25)]">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                
                <h3 className="mt-5 font-display text-2xl font-bold text-white sm:text-3xl">
                  Booking Confirmed
                </h3>
                
                <p className="mt-2 max-w-md text-sm text-neutral-300">
                  Your 30-minute discovery call has been booked successfully with Waliliens partners.
                </p>

                {/* Meeting Credentials Card */}
                <div className="mt-6 w-full max-w-md rounded-2xl border border-white/10 bg-obsidian-950/80 p-5 text-left font-mono text-xs space-y-3 shadow-inner">
                  <div className="flex justify-between text-neutral-400">
                    <span>BOOKING ID:</span>
                    <span className="text-white font-bold">{confirmationData.bookingId}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>SCHEDULED TIME:</span>
                    <span className="text-cyber-cyan font-bold">{confirmationData.scheduledTime}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>DURATION:</span>
                    <span className="text-neutral-200">30 Minutes</span>
                  </div>
                  <div className="flex justify-between text-neutral-400 items-center pt-1 border-t border-white/5">
                    <span>GOOGLE MEET:</span>
                    {confirmationData.meetingUrl ? (
                      <span className="text-cyber-cyan font-semibold truncate max-w-[200px]">
                        Available Below
                      </span>
                    ) : (
                      <span className="text-cyber-violet truncate max-w-[200px]">Dispatched to Email</span>
                    )}
                  </div>
                </div>

                {/* Polished Join Google Meet CTA Button */}
                {confirmationData.meetingUrl && (
                  <div className="mt-6 w-full max-w-md">
                    <a
                      href={confirmationData.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyber-cyan to-blue-500 py-3.5 px-6 font-mono text-xs font-bold text-obsidian-950 shadow-[0_0_25px_rgba(0,240,255,0.3)] transition-all hover:shadow-[0_0_35px_rgba(0,240,255,0.5)] hover:scale-[1.02]"
                    >
                      <Video className="h-4 w-4" />
                      <span>JOIN GOOGLE MEET</span>
                      <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </a>
                  </div>
                )}

                {/* Email Confirmation Notice */}
                <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-2.5 font-mono text-[11px] text-neutral-400 max-w-md">
                  <Mail className="h-3.5 w-3.5 text-cyber-cyan shrink-0" />
                  <span>A confirmation email has been sent to <strong className="text-neutral-200">{formData.email}</strong></span>
                </div>

                <button
                  onClick={() => {
                    soundManager.playClick();
                    setStatus('idle');
                  }}
                  className="mt-6 rounded-full border border-white/10 bg-white/5 px-5 py-2 font-mono text-xs text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  SCHEDULE ANOTHER CALL
                </button>
              </div>
            ) : (
              <form onSubmit={handleBook} className="space-y-6">
                {status === 'error' && (
                  <FormMessage
                    type="error"
                    title="Booking Notice"
                    message={errorMessage || 'Selected slot is no longer available. Please select another time.'}
                  />
                )}

                {/* 1. Date Selection */}
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-neutral-400 mb-2">
                    01 // Select Date Window
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {dateOptions.map((date) => (
                      <button
                        key={date}
                        type="button"
                        onClick={() => {
                          soundManager.playClick();
                          setSelectedDate(date);
                        }}
                        onMouseEnter={() => setCursorType('hover')}
                        onMouseLeave={resetCursor}
                        className={`rounded-xl px-4 py-2 font-mono text-xs transition-all ${
                          selectedDate === date
                            ? 'border-cyber-cyan bg-cyber-cyan text-obsidian-950 font-bold'
                            : 'border border-white/10 bg-obsidian-950/60 text-neutral-300 hover:border-white/30'
                        }`}
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Slot Selection */}
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-neutral-400 mb-2">
                    02 // Available 30-Min Time Slots
                  </label>
                  {isLoadingSlots ? (
                    <div className="py-4 font-mono text-xs text-neutral-400 animate-pulse">
                      Checking real-time calendar availability...
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="py-4 font-mono text-xs text-neutral-400">
                      No available slots found for this date. Please select another date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {slots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => {
                            soundManager.playClick();
                            setSelectedSlot(slot.id);
                          }}
                          onMouseEnter={() => slot.available && setCursorType('hover')}
                          onMouseLeave={resetCursor}
                          className={`rounded-xl border py-2.5 px-3 text-center font-mono text-xs transition-all ${
                            !slot.available
                              ? 'border-white/5 bg-obsidian-950/30 text-neutral-600 line-through cursor-not-allowed'
                              : selectedSlot === slot.id
                              ? 'border-cyber-violet bg-cyber-violet/20 font-bold text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                              : 'border-white/10 bg-obsidian-950/60 text-neutral-300 hover:border-white/30'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Client Information */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Your Name" required>
                    <TextInput
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Satoshi Nakamoto"
                    />
                  </FormField>

                  <FormField label="Work Email" required>
                    <TextInput
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. satoshi@bitcoin.org"
                    />
                  </FormField>
                </div>

                <FormField label="Company / Project Scope">
                  <TextArea
                    rows={2}
                    value={formData.projectScope}
                    onChange={(e) => setFormData({ ...formData, projectScope: e.target.value })}
                    placeholder="Briefly mention what you'd like to build or discuss on the call..."
                  />
                </FormField>

                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
                    <Video className="h-3.5 w-3.5 text-cyber-cyan" />
                    <span>Hosted via Google Meet (Calendar Invitation)</span>
                  </div>

                  <SubmitButton isLoading={status === 'loading'} loadingText="CONFIRMING CALL...">
                    CONFIRM DISCOVERY SESSION
                  </SubmitButton>
                </div>
              </form>
            )}
          </div>

          {/* Right Information Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-obsidian-900/60 p-6 backdrop-blur-xl space-y-4">
              <h3 className="font-display text-lg font-bold text-white">What to Expect</h3>
              <div className="space-y-3 text-xs text-neutral-300">
                <div className="flex items-start gap-2.5">
                  <Clock className="h-4 w-4 text-cyber-cyan shrink-0 mt-0.5" />
                  <span><strong>30 Minutes</strong> focused purely on your technical scope and goals.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <UserCheck className="h-4 w-4 text-cyber-emerald shrink-0 mt-0.5" />
                  <span><strong>Senior Partner Access</strong> — no sales representatives or junior account handlers.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4 w-4 text-cyber-cyan shrink-0 mt-0.5" />
                  <span><strong>Instant Calendar Invite</strong> — Google Meet credentials dispatched to your inbox.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Shield className="h-4 w-4 text-cyber-violet shrink-0 mt-0.5" />
                  <span><strong>Direct Next Steps</strong> — actionable architectural roadmap delivered within 48 hours.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};
