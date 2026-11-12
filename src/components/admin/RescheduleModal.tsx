import React, { useState, useEffect, useRef } from 'react';
import { Calendar, X, Clock, AlertCircle } from 'lucide-react';
import { bookingService } from '../../services/api/booking';
import type { BookingSlot } from '../../types';
import type { AdminBooking } from '../../services/api/admin';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

interface RescheduleModalProps {
  booking: AdminBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newDate: string, newSlotId: string) => Promise<void>;
  isSubmitting: boolean;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  booking,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}) => {
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = new Intl.DateTimeFormat('en-CA').format(tomorrowDate);
  const [targetDate, setTargetDate] = useState<string>(tomorrowStr);
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [slotError, setSlotError] = useState<string>('');
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalAccessibility(isOpen && Boolean(booking), dialogRef, onClose);

  useEffect(() => {
    if (!isOpen || !targetDate) return;

    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      setSlotError('');
      try {
        const res = await bookingService.getSlots(targetDate);
        if (res.data) {
          setSlots(res.data);
          const firstAvail = res.data.find((s) => s.available);
          setSelectedSlotId(firstAvail?.id || '');
        } else {
          setSlots([]);
          setSelectedSlotId('');
        }
      } catch (err) {
        setSlotError((err as Error).message || 'Failed to fetch slots.');
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [isOpen, targetDate]);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId || !targetDate) return;
    await onConfirm(targetDate, selectedSlotId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-obsidian-950/80 p-4 backdrop-blur-md animate-fade-in sm:items-center">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="reschedule-title" tabIndex={-1} className="relative my-auto max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-3xl border border-cyber-cyan/30 bg-obsidian-900 p-5 shadow-2xl shadow-cyan-950/40 sm:p-8">
        <button
          onClick={onClose}
          aria-label="Close reschedule dialog"
          className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 text-cyber-cyan">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyber-cyan/30 bg-cyber-cyan/10">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 id="reschedule-title" className="font-display text-lg font-bold text-white">Reschedule Discovery Call</h3>
            <p className="font-mono text-xs text-neutral-400">ID: {booking.bookingId} — {booking.name}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-obsidian-950/60 p-3 font-mono text-xs text-neutral-300">
          <span className="text-neutral-500">Current Slot: </span>
          <span className="text-rose-400 font-bold">{booking.date} at {booking.startTime}</span>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Target Date Picker */}
          <div>
            <label htmlFor="reschedule-date" className="block font-mono text-xs text-neutral-300 mb-1.5">
              01 // Choose New Date
            </label>
            <input
              id="reschedule-date"
              type="date"
              min={tomorrowStr}
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2 text-xs font-mono text-white focus:border-cyber-cyan focus:outline-none transition-colors"
            />
          </div>

          {/* Time Slot Selection */}
          <div>
            <div id="available-slots-label" className="mb-1.5 flex items-center justify-between font-mono text-xs text-neutral-300">
              <span>02 // Available 30-Minute Slots</span>
              {isLoadingSlots && <span className="text-cyber-cyan animate-pulse">Checking calendar...</span>}
            </div>

            {slotError ? (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{slotError}</span>
              </div>
            ) : slots.length === 0 && !isLoadingSlots ? (
              <div className="rounded-xl border border-white/5 bg-obsidian-950/40 p-4 text-center font-mono text-xs text-neutral-400">
                No slots found for this date.
              </div>
            ) : (
              <div role="group" aria-labelledby="available-slots-label" className="grid grid-cols-2 gap-2 sm:grid-cols-3 max-h-48 overflow-y-auto pr-1">
                {slots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setSelectedSlotId(slot.id)}
                    aria-pressed={selectedSlotId === slot.id}
                    className={`rounded-xl border py-2 px-2 text-center font-mono text-xs transition-all ${
                      !slot.available
                        ? 'border-white/5 bg-obsidian-950/30 text-neutral-600 line-through cursor-not-allowed'
                        : selectedSlotId === slot.id
                        ? 'border-cyber-cyan bg-cyber-cyan/20 text-white font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                        : 'border-white/10 bg-obsidian-950/60 text-neutral-300 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>{slot.time.split(' ')[0]} {slot.time.split(' ')[1]}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-white/10 px-4 py-2 font-mono text-xs text-neutral-400 hover:bg-white/5 transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedSlotId}
              className="rounded-xl bg-cyber-cyan px-5 py-2 font-mono text-xs font-bold text-obsidian-950 hover:bg-cyan-300 transition-colors shadow-[0_0_20px_rgba(0,240,255,0.3)] disabled:opacity-50"
            >
              {isSubmitting ? 'UPDATING...' : 'CONFIRM RESCHEDULE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
