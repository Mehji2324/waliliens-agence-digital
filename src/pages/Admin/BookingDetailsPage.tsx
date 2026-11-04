import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { BookingStatusBadge } from '../../components/admin/BookingStatusBadge';
import { CancelBookingDialog } from '../../components/admin/CancelBookingDialog';
import { RescheduleModal } from '../../components/admin/RescheduleModal';
import { adminApi, type AdminBooking } from '../../services/api/admin';
import { useSeo } from '../../hooks/useSeo';
import { ArrowLeft, Video, Calendar, User, FileText, ExternalLink, RefreshCw } from 'lucide-react';

export const AdminBookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  useSeo({
    title: `Booking Details — ${id || 'Waliliens'}`,
    description: 'Waliliens Studio Operations Terminal.',
    robots: 'noindex, nofollow',
  });

  const [booking, setBooking] = useState<AdminBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [cancellingBooking, setCancellingBooking] = useState<AdminBooking | null>(null);
  const [reschedulingBooking, setReschedulingBooking] = useState<AdminBooking | null>(null);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchBooking = async () => {
    if (!id) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await adminApi.getBookingDetails(id);
      if (res.success && res.data) {
        setBooking(res.data);
      } else {
        setError(res.message || 'Booking not found.');
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch booking details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const handleConfirmCancel = async (reason: string) => {
    if (!booking) return;
    setIsActionSubmitting(true);
    try {
      const res = await adminApi.cancelBooking(booking.id, reason);
      if (res.success && res.data) {
        setBooking(res.data);
        setCancellingBooking(null);
        setToastMessage(`Booking [${booking.bookingId}] has been cancelled.`);
        setTimeout(() => setToastMessage(''), 4000);
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
    if (!booking) return;
    setIsActionSubmitting(true);
    try {
      const res = await adminApi.rescheduleBooking(booking.id, { newDate, newSlotId });
      if (res.success && res.data) {
        setBooking(res.data);
        setReschedulingBooking(null);
        setToastMessage(`Booking [${booking.bookingId}] rescheduled successfully.`);
        setTimeout(() => setToastMessage(''), 4000);
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
    <AdminLayout title="Booking Record" subtitle={`Detailed Session Dossier // ${id}`}>
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/admin/bookings"
          className="flex items-center gap-2 font-mono text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>RETURN TO BOOKINGS LIST</span>
        </Link>

        <button
          onClick={fetchBooking}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-obsidian-900 px-3 py-1.5 font-mono text-xs text-neutral-300 hover:text-white"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>REFRESH</span>
        </button>
      </div>

      {toastMessage && (
        <div className="mb-6 rounded-2xl border border-cyber-emerald/30 bg-cyber-emerald/10 p-4 font-mono text-xs text-cyber-emerald">
          ✓ {toastMessage}
        </div>
      )}

      {error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center text-rose-400 font-mono text-xs">
          {error}
        </div>
      ) : isLoading || !booking ? (
        <div className="py-24 text-center font-mono text-xs text-neutral-400 animate-pulse">
          Loading booking dossier...
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Banner Card */}
          <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-obsidian-900/90 p-8 sm:flex-row sm:items-center sm:justify-between backdrop-blur-xl">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-cyber-cyan">{booking.bookingId}</span>
                <BookingStatusBadge status={booking.status} />
              </div>
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">{booking.name}</h2>
              <div className="font-mono text-xs text-neutral-400">{booking.email}</div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              {booking.meetingUrl && (
                <a
                  href={booking.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-500 py-2.5 px-5 font-mono text-xs font-bold text-obsidian-950 shadow-[0_0_25px_rgba(0,240,255,0.3)] hover:scale-[1.02] transition-all"
                >
                  <Video className="h-4 w-4" />
                  <span>JOIN GOOGLE MEET</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}

              {booking.status === 'confirmed' && (
                <>
                  <button
                    onClick={() => setReschedulingBooking(booking)}
                    className="rounded-xl border border-cyber-cyan/40 bg-cyber-cyan/10 py-2.5 px-4 font-mono text-xs font-bold text-cyber-cyan hover:bg-cyber-cyan/20 transition-all"
                  >
                    RESCHEDULE
                  </button>
                  <button
                    onClick={() => setCancellingBooking(booking)}
                    className="rounded-xl border border-rose-500/30 bg-rose-500/10 py-2.5 px-4 font-mono text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-all"
                  >
                    CANCEL CALL
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Session Schedule Card */}
            <div className="rounded-3xl border border-white/10 bg-obsidian-900/60 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2 text-cyber-cyan font-mono text-xs uppercase tracking-wider">
                <Calendar className="h-4 w-4" />
                <span>Session Credentials</span>
              </div>

              <div className="divide-y divide-white/5 font-mono text-xs space-y-3">
                <div className="flex justify-between pt-3">
                  <span className="text-neutral-400">Date</span>
                  <span className="font-bold text-white">{booking.date}</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-neutral-400">Scheduled Time</span>
                  <span className="font-bold text-cyber-cyan">{booking.startTime} {booking.endTime ? `— ${booking.endTime}` : ''}</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-neutral-400">Duration</span>
                  <span className="text-white">30 Minutes</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-neutral-400">Timezone</span>
                  <span className="text-neutral-300">{booking.timezone}</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-neutral-400">Google Calendar Event ID</span>
                  <span className="text-neutral-300 truncate max-w-[200px]">{booking.googleEventId || 'Mock / Offline'}</span>
                </div>
              </div>
            </div>

            {/* Client Profile Card */}
            <div className="rounded-3xl border border-white/10 bg-obsidian-900/60 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2 text-cyber-violet font-mono text-xs uppercase tracking-wider">
                <User className="h-4 w-4" />
                <span>Client Profile</span>
              </div>

              <div className="divide-y divide-white/5 font-mono text-xs space-y-3">
                <div className="flex justify-between pt-3">
                  <span className="text-neutral-400">Client Name</span>
                  <span className="font-bold text-white font-sans">{booking.name}</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-neutral-400">Work Email</span>
                  <a href={`mailto:${booking.email}`} className="text-cyber-cyan hover:underline">
                    {booking.email}
                  </a>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-neutral-400">Company / Organization</span>
                  <span className="text-neutral-200 font-sans">{booking.company || 'Not Specified'}</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-neutral-400">Created Timestamp</span>
                  <span className="text-neutral-400">{new Date(booking.createdAt).toLocaleString()}</span>
                </div>
                {booking.cancelledAt && (
                  <div className="flex justify-between pt-3 text-rose-400">
                    <span>Cancelled Timestamp</span>
                    <span>{new Date(booking.cancelledAt).toLocaleString()}</span>
                  </div>
                )}
                {booking.rescheduledAt && (
                  <div className="flex justify-between pt-3 text-cyber-cyan">
                    <span>Rescheduled Timestamp</span>
                    <span>{new Date(booking.rescheduledAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Project Brief / Scope */}
          <div className="rounded-3xl border border-white/10 bg-obsidian-900/60 p-6 backdrop-blur-xl space-y-3">
            <div className="flex items-center gap-2 text-cyber-emerald font-mono text-xs uppercase tracking-wider">
              <FileText className="h-4 w-4" />
              <span>Project Scope & Strategy Notes</span>
            </div>
            <div className="rounded-2xl border border-white/5 bg-obsidian-950 p-5 text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap font-sans">
              {booking.projectScope || 'No detailed scope provided. Standard 30-minute discovery consultation.'}
            </div>
            {booking.notes && (
              <div className="font-mono text-xs text-neutral-400 mt-2">
                Internal Notes: <span className="text-white">{booking.notes}</span>
              </div>
            )}
          </div>
        </div>
      )}

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
