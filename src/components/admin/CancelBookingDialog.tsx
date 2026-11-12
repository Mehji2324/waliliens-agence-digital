import React, { useRef, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { AdminBooking } from '../../services/api/admin';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

interface CancelBookingDialogProps {
  booking: AdminBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isSubmitting: boolean;
}

export const CancelBookingDialog: React.FC<CancelBookingDialogProps> = ({
  booking,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}) => {
  const [reason, setReason] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalAccessibility(isOpen && Boolean(booking), dialogRef, onClose);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(reason);
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-obsidian-950/80 p-4 backdrop-blur-md animate-fade-in sm:items-center">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="cancel-booking-title" tabIndex={-1} className="relative my-auto max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-3xl border border-rose-500/30 bg-obsidian-900 p-5 shadow-2xl shadow-rose-950/40 sm:p-8">
        <button
          onClick={onClose}
          aria-label="Close cancellation dialog"
          className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 text-rose-400">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 id="cancel-booking-title" className="font-display text-lg font-bold text-white">Cancel Discovery Call</h3>
            <p className="font-mono text-xs text-neutral-400">ID: {booking.bookingId}</p>
          </div>
        </div>

        <p className="mt-4 text-xs text-neutral-300 leading-relaxed">
          Are you sure you want to cancel the 30-minute discovery call with{' '}
          <strong className="text-white">{booking.name}</strong> on{' '}
          <strong className="text-cyber-cyan">{booking.date} at {booking.startTime}</strong>?
        </p>

        <div className="mt-4 rounded-xl border border-white/5 bg-obsidian-950/60 p-3 font-mono text-[11px] text-neutral-400 space-y-1">
          <div>• Google Calendar event will be removed automatically.</div>
          <div>• Client confirmation & internal team emails will be dispatched.</div>
          <div>• Record will remain in the database marked as cancelled.</div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="cancel-reason" className="block font-mono text-xs text-neutral-300 mb-1.5">
              Cancellation Reason / Internal Note (Optional)
            </label>
            <textarea
              id="cancel-reason"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Client requested postponement or schedule conflict..."
              className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-white/10 px-4 py-2 font-mono text-xs text-neutral-400 hover:bg-white/5 transition-colors"
            >
              KEEP BOOKING
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-rose-500 px-5 py-2 font-mono text-xs font-bold text-obsidian-950 hover:bg-rose-400 transition-colors shadow-[0_0_20px_rgba(244,63,94,0.3)] disabled:opacity-50"
            >
              {isSubmitting ? 'CANCELLING...' : 'CONFIRM CANCELLATION'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
