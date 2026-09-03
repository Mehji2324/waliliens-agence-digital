import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { BookingStatusBadge } from '../../components/admin/BookingStatusBadge';
import { adminApi, type DashboardData } from '../../services/api/admin';
import { useSeo } from '../../hooks/useSeo';
import { Calendar, Video, ArrowRight, MessageSquare, Clock, RefreshCw, ExternalLink } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  useSeo({
    title: 'Operations Dashboard',
    description: 'Waliliens Studio Operations & Management Terminal.',
  });

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await adminApi.getDashboard();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || 'Unable to load dashboard data.');
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to connect to admin API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AdminLayout title="Operations Terminal" subtitle="Live Booking & Inquiries Overview">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Studio Overview</h2>
          <p className="font-mono text-xs text-neutral-400">Real-time metrics from Google Calendar and PostgreSQL</p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-obsidian-900 px-3.5 py-2 font-mono text-xs text-neutral-300 hover:border-cyber-cyan hover:text-cyber-cyan transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>REFRESH</span>
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-400 font-mono text-xs mb-8">
          {error}
        </div>
      ) : null}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-10">
        <div className="rounded-2xl border border-white/10 bg-obsidian-900/80 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="font-mono text-[11px] uppercase">Upcoming Calls</span>
            <Calendar className="h-4 w-4 text-cyber-cyan" />
          </div>
          <div className="font-display text-3xl font-bold text-cyber-cyan">
            {isLoading ? '...' : data?.stats.upcomingCalls ?? 0}
          </div>
          <div className="font-mono text-[10px] text-neutral-400 mt-1">Confirmed next 30 days</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-obsidian-900/80 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="font-mono text-[11px] uppercase">This Week</span>
            <Clock className="h-4 w-4 text-cyber-emerald" />
          </div>
          <div className="font-display text-3xl font-bold text-cyber-emerald">
            {isLoading ? '...' : data?.stats.thisWeekCalls ?? 0}
          </div>
          <div className="font-mono text-[10px] text-neutral-400 mt-1">Next 7 days scheduled</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-obsidian-900/80 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="font-mono text-[11px] uppercase">Total Bookings</span>
            <Calendar className="h-4 w-4 text-white" />
          </div>
          <div className="font-display text-3xl font-bold text-white">
            {isLoading ? '...' : data?.stats.totalBookings ?? 0}
          </div>
          <div className="font-mono text-[10px] text-neutral-400 mt-1">All-time reservations</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-obsidian-900/80 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="font-mono text-[11px] uppercase">Active Confirmed</span>
            <span className="h-2 w-2 rounded-full bg-cyber-emerald" />
          </div>
          <div className="font-display text-3xl font-bold text-neutral-200">
            {isLoading ? '...' : data?.stats.confirmedBookings ?? 0}
          </div>
          <div className="font-mono text-[10px] text-neutral-400 mt-1">In good standing</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-obsidian-900/80 p-5 backdrop-blur-xl col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="font-mono text-[11px] uppercase">Cancelled</span>
            <span className="h-2 w-2 rounded-full bg-rose-500" />
          </div>
          <div className="font-display text-3xl font-bold text-rose-400">
            {isLoading ? '...' : data?.stats.cancelledBookings ?? 0}
          </div>
          <div className="font-mono text-[10px] text-neutral-400 mt-1">Slot released to pool</div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upcoming Discovery Calls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-cyber-cyan" />
              <h3 className="font-display text-lg font-bold text-white">Upcoming Discovery Calls</h3>
            </div>
            <Link
              to="/admin/bookings"
              className="flex items-center gap-1 font-mono text-xs text-cyber-cyan hover:underline"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-obsidian-900/60 p-4 divide-y divide-white/5 backdrop-blur-xl">
            {isLoading ? (
              <div className="py-12 text-center font-mono text-xs text-neutral-400 animate-pulse">
                Loading upcoming bookings...
              </div>
            ) : !data?.upcomingBookings || data.upcomingBookings.length === 0 ? (
              <div className="py-12 text-center font-mono text-xs text-neutral-400">
                No upcoming calls scheduled at this time.
              </div>
            ) : (
              data.upcomingBookings.map((b) => (
                <div key={b.id} className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyber-cyan">{b.date} at {b.startTime}</span>
                      <BookingStatusBadge status={b.status} />
                    </div>
                    <div className="text-sm font-semibold text-white">{b.name}</div>
                    <div className="font-mono text-xs text-neutral-400">
                      {b.company ? `${b.company} — ` : ''}{b.email}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {b.meetingUrl && (
                      <a
                        href={b.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-xl border border-cyber-cyan/30 bg-cyber-cyan/10 px-3 py-1.5 font-mono text-[11px] font-bold text-cyber-cyan hover:bg-cyber-cyan/20 transition-colors"
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span>JOIN MEET</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                    <Link
                      to={`/admin/bookings/${b.bookingId}`}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[11px] text-neutral-300 hover:bg-white/10 transition-colors"
                    >
                      MANAGE
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Recent Brief Submissions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-cyber-violet" />
              <h3 className="font-display text-lg font-bold text-white">Recent Project Briefs</h3>
            </div>
            <Link
              to="/admin/contacts"
              className="flex items-center gap-1 font-mono text-xs text-cyber-violet hover:underline"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-obsidian-900/60 p-4 divide-y divide-white/5 backdrop-blur-xl">
            {isLoading ? (
              <div className="py-12 text-center font-mono text-xs text-neutral-400 animate-pulse">
                Loading briefs...
              </div>
            ) : !data?.recentContacts || data.recentContacts.length === 0 ? (
              <div className="py-12 text-center font-mono text-xs text-neutral-400">
                No recent contact inquiries received.
              </div>
            ) : (
              data.recentContacts.map((c) => (
                <div key={c.id} className="py-3.5 first:pt-1 last:pb-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{c.name}</span>
                    <span className="font-mono text-[10px] text-neutral-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-neutral-400 truncate">{c.email}</div>
                  <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                    {c.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
