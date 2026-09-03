import React from 'react';

interface BookingStatusBadgeProps {
  status: 'confirmed' | 'cancelled' | 'completed' | string;
}

export const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status }) => {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          CONFIRMED
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-rose-400">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
          CANCELLED
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-purple-300">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
          COMPLETED
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-800 px-2.5 py-0.5 font-mono text-[11px] text-neutral-300">
          {status.toUpperCase()}
        </span>
      );
  }
};
