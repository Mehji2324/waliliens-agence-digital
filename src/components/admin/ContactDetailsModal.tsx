import React, { useState } from 'react';
import { X, Mail, Building, DollarSign, Calendar, MessageSquare, CheckCircle } from 'lucide-react';
import type { AdminContactSubmission } from '../../services/api/admin';

interface ContactDetailsModalProps {
  contact: AdminContactSubmission | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: 'new' | 'processed' | 'archived', notes?: string) => Promise<void>;
}

export const ContactDetailsModal: React.FC<ContactDetailsModalProps> = ({
  contact,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  const [status, setStatus] = useState<'new' | 'processed' | 'archived'>('new');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (contact) {
      setStatus(contact.status);
      setNotes(contact.notes || '');
    }
  }, [contact]);

  if (!isOpen || !contact) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdateStatus(contact.id, status, notes);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl border border-white/15 bg-obsidian-900 p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyber-cyan/30 bg-cyber-cyan/10 text-cyber-cyan">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">{contact.name}</h3>
            <a href={`mailto:${contact.email}`} className="font-mono text-xs text-cyber-cyan hover:underline">
              {contact.email}
            </a>
          </div>
        </div>

        {/* Contact Specs */}
        <div className="mt-5 grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="rounded-xl border border-white/5 bg-obsidian-950/60 p-3">
            <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
              <Building className="h-3.5 w-3.5" />
              <span>COMPANY</span>
            </div>
            <div className="text-white font-bold">{contact.company || 'Not Specified'}</div>
          </div>

          <div className="rounded-xl border border-white/5 bg-obsidian-950/60 p-3">
            <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
              <DollarSign className="h-3.5 w-3.5" />
              <span>BUDGET</span>
            </div>
            <div className="text-emerald-400 font-bold">{contact.budget || 'Flexible'}</div>
          </div>

          <div className="rounded-xl border border-white/5 bg-obsidian-950/60 p-3">
            <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>TIMELINE</span>
            </div>
            <div className="text-cyber-cyan font-bold">{contact.timeline || 'Flexible'}</div>
          </div>

          <div className="rounded-xl border border-white/5 bg-obsidian-950/60 p-3">
            <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
              <Mail className="h-3.5 w-3.5" />
              <span>SUBMITTED</span>
            </div>
            <div className="text-neutral-300">{new Date(contact.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Selected Services */}
        {contact.services && contact.services.length > 0 && (
          <div className="mt-4">
            <div className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider mb-1.5">
              Requested Capabilities
            </div>
            <div className="flex flex-wrap gap-1.5">
              {contact.services.map((svc) => (
                <span
                  key={svc}
                  className="rounded-lg border border-cyber-violet/30 bg-cyber-violet/10 px-2 py-0.5 font-mono text-[11px] text-cyber-violet font-semibold"
                >
                  {svc}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Message / Brief */}
        <div className="mt-4">
          <div className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider mb-1.5">
            Brief Message
          </div>
          <div className="rounded-2xl border border-white/10 bg-obsidian-950 p-4 text-xs text-neutral-200 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
            {contact.message}
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleSave} className="mt-5 space-y-4 border-t border-white/10 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs text-neutral-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'new' | 'processed' | 'archived')}
                className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2 text-xs font-mono text-white focus:border-cyber-cyan focus:outline-none"
              >
                <option value="new">NEW / UNPROCESSED</option>
                <option value="processed">PROCESSED / CONTACTED</option>
                <option value="archived">ARCHIVED</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs text-neutral-300 mb-1">Internal Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Sent discovery questionnaire..."
                className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2 text-xs text-white focus:border-cyber-cyan focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2 font-mono text-xs text-neutral-400 hover:bg-white/5"
            >
              CLOSE
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-cyber-cyan px-5 py-2 font-mono text-xs font-bold text-obsidian-950 hover:bg-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{isSubmitting ? 'SAVING...' : 'UPDATE STATUS'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
