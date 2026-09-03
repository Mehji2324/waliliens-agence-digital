import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ContactDetailsModal } from '../../components/admin/ContactDetailsModal';
import { adminApi, type AdminContactSubmission, type PaginatedResponse } from '../../services/api/admin';
import { useSeo } from '../../hooks/useSeo';
import { Search, RefreshCw, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

export const AdminContactsPage: React.FC = () => {
  useSeo({
    title: 'Client Briefs & Inquiries',
    description: 'Waliliens Studio Operations & Management Terminal.',
  });

  const [contactsData, setContactsData] = useState<PaginatedResponse<AdminContactSubmission> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedContact, setSelectedContact] = useState<AdminContactSubmission | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await adminApi.getContacts({
        page,
        limit: 10,
        search,
        status,
      });
      if (res.success && res.data) {
        setContactsData(res.data);
      } else {
        setError(res.message || 'Unable to load contact submissions.');
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch contact inquiries.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleUpdateStatus = async (
    id: string,
    newStatus: 'new' | 'processed' | 'archived',
    notes?: string
  ) => {
    try {
      const res = await adminApi.updateContactStatus(id, newStatus, notes);
      if (res.success) {
        setToastMessage(`Contact inquiry status updated to "${newStatus.toUpperCase()}".`);
        fetchContacts();
        setTimeout(() => setToastMessage(''), 4000);
      } else {
        alert(res.message || 'Failed to update contact status.');
      }
    } catch (err) {
      alert((err as Error).message || 'Failed to update contact status.');
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-cyber-cyan/40 bg-cyber-cyan/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-cyber-cyan">
            <span className="h-1.5 w-1.5 rounded-full bg-cyber-cyan animate-pulse" />
            NEW BRIEF
          </span>
        );
      case 'processed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-cyber-emerald/40 bg-cyber-emerald/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-cyber-emerald">
            PROCESSED
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-800 px-2.5 py-0.5 font-mono text-[10px] text-neutral-400">
            ARCHIVED
          </span>
        );
      default:
        return <span>{st}</span>;
    }
  };

  return (
    <AdminLayout title="Project Briefs" subtitle="Incoming Client Proposals & Inquiries">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="mb-6 rounded-2xl border border-cyber-emerald/30 bg-cyber-emerald/10 p-4 font-mono text-xs text-cyber-emerald shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-fade-in">
          ✓ {toastMessage}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by client name, email, company, brief content..."
              className="w-full rounded-xl border border-white/10 bg-obsidian-900/80 pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:border-cyber-cyan focus:outline-none transition-colors"
            />
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-white/10 bg-obsidian-900/80 px-3 py-2 text-xs font-mono text-white focus:border-cyber-cyan focus:outline-none"
          >
            <option value="all">ALL SUBMISSIONS</option>
            <option value="new">NEW / UNPROCESSED</option>
            <option value="processed">PROCESSED / CONTACTED</option>
            <option value="archived">ARCHIVED</option>
          </select>

          {(search || status !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setStatus('all');
                setPage(1);
              }}
              className="font-mono text-xs text-neutral-400 hover:text-white underline"
            >
              CLEAR
            </button>
          )}
        </div>

        <button
          onClick={fetchContacts}
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

      {/* Contacts Data Table */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-obsidian-900/80 backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b border-white/10 bg-obsidian-950/60 text-neutral-400">
              <tr>
                <th className="py-4 px-6">RECEIVED DATE</th>
                <th className="py-4 px-6">CLIENT</th>
                <th className="py-4 px-6">COMPANY</th>
                <th className="py-4 px-6">BUDGET / TIMELINE</th>
                <th className="py-4 px-6">STATUS</th>
                <th className="py-4 px-6 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-neutral-400 animate-pulse">
                    Loading contact submissions...
                  </td>
                </tr>
              ) : !contactsData?.contacts || contactsData.contacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-neutral-400">
                    No submissions found matching the current filters.
                  </td>
                </tr>
              ) : (
                contactsData.contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 text-neutral-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 font-sans">
                      <div className="font-semibold text-white">{c.name}</div>
                      <div className="font-mono text-xs text-neutral-400">{c.email}</div>
                    </td>

                    <td className="py-4 px-6 font-sans text-neutral-300">
                      {c.company || <span className="text-neutral-600 italic">Not specified</span>}
                    </td>

                    <td className="py-4 px-6">
                      <div className="text-emerald-400 font-bold">{c.budget || 'Flexible'}</div>
                      <div className="text-[10px] text-neutral-400">{c.timeline || 'Flexible'}</div>
                    </td>

                    <td className="py-4 px-6">
                      {getStatusBadge(c.status)}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedContact(c)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[11px] font-semibold text-white hover:bg-white/10 transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                        <span>REVIEW BRIEF</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {contactsData && contactsData.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 bg-obsidian-950/60 px-6 py-3 font-mono text-xs">
            <div className="text-neutral-400">
              Showing page <strong className="text-white">{contactsData.page}</strong> of{' '}
              <strong className="text-white">{contactsData.totalPages}</strong> ({contactsData.total} submissions)
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
                onClick={() => setPage((p) => Math.min(contactsData.totalPages, p + 1))}
                disabled={page >= contactsData.totalPages}
                className="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-1.5 text-neutral-300 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>NEXT</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contact Details Modal */}
      <ContactDetailsModal
        contact={selectedContact}
        isOpen={Boolean(selectedContact)}
        onClose={() => setSelectedContact(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </AdminLayout>
  );
};
