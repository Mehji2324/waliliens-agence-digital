import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { BookingStatusBadge } from '../../components/admin/BookingStatusBadge';
import { CancelBookingDialog } from '../../components/admin/CancelBookingDialog';
import { RescheduleModal } from '../../components/admin/RescheduleModal';
import { adminApi, type AdminBooking, type PaginatedResponse } from '../../services/api/admin';
import { useSeo } from '../../hooks/useSeo';
import { Search, Video, RefreshCw, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

export const AdminBookingsPage: React.FC = () => {
  useSeo({
    title: 'Bookings Management',
    description: 'Waliliens Studio Operations & Management Terminal.',
    robots: 'noindex, nofollow',
  });

  const [bookingsData, setBookingsData] = useState<PaginatedResponse<AdminBooking> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Action Dialog states
  const [cancellingBooking, setCancellingBooking] = useState<AdminBooking | null>(null);
  const [reschedulingBooking, setReschedulingBooking] = useState<AdminBooking | null>(null);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await adminApi.getBookings({
        page,
        limit: 10,
        search,
        status,
        date,
      });
      if (res.success && res.data) {
        setBookingsData(res.data);
      } else {
        setError(res.message || 'Unable to load bookings.');
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch bookings.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status, date]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleConfirmCancel = async (reason: string) => {
    if (!cancellingBooking) return;
    setIsActionSubmitting(true);
    try {
      const res = await adminApi.cancelBooking(cancellingBooking.id, reason);
      if (res.success) {
        setSuccessToast(`Booking [${cancellingBooking.bookingId}] has been cancelled.`);
        setCancellingBooking(null);
        fetchBookings();
        setTimeout(() => setSuccessToast(''), 4000);
      } else {
        alert(res.message || 'Failed to cancel booking.');
      }
    } catch (err) {
      alert((err as Error).message || 'Failed to cancel booking.');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleConfirmReschedule = async (newDate: string, newSlotId: string) => {
    if (!reschedulingBooking) return;
    setIsActionSubmitting(true);
    try {
      const res = await adminApi.rescheduleBooking(reschedulingBooking.id, { newDate, newSlotId });
      if (res.success) {
        setSuccessToast(`Booking [${reschedulingBooking.bookingId}] rescheduled successfully.`);
        setReschedulingBooking(null);
        fetchBookings();
        setTimeout(() => setSuccessToast(''), 4000);
      } else {
        alert(res.message || 'Failed to reschedule booking.');
      }
    } catch (err) {
      alert((err as Error).message || 'Failed to reschedule booking.');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Bookings Terminal" subtitle="Live 30-Min Discovery Consultations">
      {/* Toast Notification */}
      {successToast && (
        <div className="mb-6 rounded-2xl border border-cyber-emerald/30 bg-cyber-emerald/10 p-4 font-mono text-xs text-cyber-emerald shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-fade-in">
          ✓ {successToast}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-500" />
            <input
              aria-label="Search bookings"
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by client name, email, company, booking ID..."
              className="w-full rounded-xl border border-white/10 bg-obsidian-900/80 pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:border-cyber-cyan focus:outline-none transition-colors"
            />
          </div>

          {/* Status Filter */}
          <select
            aria-label="Filter bookings by status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-white/10 bg-obsidian-900/80 px-3 py-2 text-xs font-mono text-white focus:border-cyber-cyan focus:outline-none"
          >
            <option value="all">ALL STATUSES</option>
            <option value="confirmed">CONFIRMED</option>
            <option value="cancelled">CANCELLED</option>
            <option value="completed">COMPLETED</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            aria-label="Filter bookings by date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-white/10 bg-obsidian-900/80 px-3 py-2 text-xs font-mono text-white focus:border-cyber-cyan focus:outline-none"
          />

          {(search || status !== 'all' || date) && (
            <button
              onClick={() => {
                setSearch('');
                setStatus('all');
                setDate('');
                setPage(1);
              }}
              className="font-mono text-xs text-neutral-400 hover:text-white underline"
            >
              CLEAR
            </button>
          )}
        </div>

        <button
          onClick={fetchBookings}
          disabled={isLoading}
          className="flex items-center gap-2 self-end lg:self-auto rounded-xl border border-white/10 bg-obsidian-900 px-3.5 py-2 font-mono text-xs text-neutral-300 hover:border-cyber-cyan hover:text-cyber-cyan transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>RELOAD</span>
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 font-mono text-xs text-rose-400 mb-6">
          {error}
        </div>
      )}

      {/* Bookings Data Table */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-obsidian-900/80 backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b border-white/10 bg-obsidian-950/60 text-neutral-400">
              <tr>
                <th className="py-4 px-6">DATE & TIME</th>
                <th className="py-4 px-6">CLIENT</th>
                <th className="py-4 px-6">COMPANY</th>
                <th className="py-4 px-6">STATUS</th>
                <th className="py-4 px-6">GOOGLE MEET</th>
                <th className="py-4 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-neutral-400 animate-pulse">
                    Loading booking reservations...
                  </td>
                </tr>
              ) : !bookingsData?.bookings || bookingsData.bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-neutral-400">
                    No bookings found matching the current filters.
                  </td>
                </tr>
              ) : (
                bookingsData.bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white">{b.date}</div>
                      <div className="text-[11px] text-cyber-cyan">{b.startTime} ({b.timezone.split('/')[1]?.replace('_', ' ') || b.timezone})</div>
                      <div className="text-[10px] text-neutral-400">ID: {b.bookingId}</div>
                    </td>

                    <td className="py-4 px-6 font-sans">
                      <div className="font-semibold text-white">{b.name}</div>
                      <div className="font-mono text-xs text-neutral-400">{b.email}</div>
                    </td>

                    <td className="py-4 px-6 text-neutral-300 font-sans">
                      {b.company || <span className="text-neutral-600 italic">Not specified</span>}
                    </td>

                    <td className="py-4 px-6">
                      <BookingStatusBadge status={b.status} />
                    </td>

                    <td className="py-4 px-6">
                      {b.meetingUrl ? (
                        <a
                          href={b.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-cyber-cyan/30 bg-cyber-cyan/10 px-2.5 py-1 text-[11px] font-bold text-cyber-cyan hover:bg-cyber-cyan/20 transition-colors"
                        >
                          <Video className="h-3 w-3" />
                          <span>JOIN MEET</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ) : (
                        <span className="text-neutral-500 text-[11px]">N/A</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/bookings/${b.bookingId}`}
                          className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-neutral-300 hover:bg-white/10 transition-colors"
                        >
                          DETAILS
                        </Link>

                        {b.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => setReschedulingBooking(b)}
                              className="rounded-lg border border-cyber-cyan/30 bg-cyber-cyan/10 px-2.5 py-1 text-[11px] font-bold text-cyber-cyan hover:bg-cyber-cyan/20 transition-colors"
                            >
                              RESCHEDULE
                            </button>
                            <button
                              onClick={() => setCancellingBooking(b)}
                              className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-400 hover:bg-rose-500/20 transition-colors"
                            >
                              CANCEL
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {bookingsData && bookingsData.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 bg-obsidian-950/60 px-6 py-3 font-mono text-xs">
            <div className="text-neutral-400">
              Showing page <strong className="text-white">{bookingsData.page}</strong> of{' '}
              <strong className="text-white">{bookingsData.totalPages}</strong> ({bookingsData.total} total records)
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-1.5 text-neutral-300 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>PREV</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(bookingsData.totalPages, p + 1))}
                disabled={page >= bookingsData.totalPages}
                className="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-1.5 text-neutral-300 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>NEXT</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Modals */}
      <CancelBookingDialog
        booking={cancellingBooking}
        isOpen={Boolean(cancellingBooking)}
        onClose={() => setCancellingBooking(null)}
        onConfirm={handleConfirmCancel}
        isSubmitting={isActionSubmitting}
      />

      <RescheduleModal
        booking={reschedulingBooking}
        isOpen={Boolean(reschedulingBooking)}
        onClose={() => setReschedulingBooking(null)}
        onConfirm={handleConfirmReschedule}
        isSubmitting={isActionSubmitting}
      />
    </AdminLayout>
  );
};
