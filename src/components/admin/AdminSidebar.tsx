import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, MessageSquare, ExternalLink, LogOut } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Logo } from '../ui/Logo';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { logout, adminEmail } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Bookings', to: '/admin/bookings', icon: Calendar },
    { label: 'Briefs & Contacts', to: '/admin/contacts', icon: MessageSquare },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-obsidian-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-obsidian-950/95 backdrop-blur-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Studio Brand */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <div className="font-display text-sm font-bold text-white tracking-wider">WALILIENS</div>
              <div className="font-mono text-[10px] text-cyber-cyan tracking-widest uppercase">Studio Admin</div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 px-3 mb-2">
            Operations
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 font-mono text-xs transition-all ${
                  isActive
                    ? 'border border-cyber-cyan/40 bg-cyber-cyan/10 font-bold text-cyber-cyan shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                    : 'text-neutral-400 hover:border-white/10 hover:bg-white/5 hover:text-white border border-transparent'
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="pt-6 font-mono text-[10px] uppercase tracking-wider text-neutral-400 px-3 mb-2">
            Platform
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-2xl border border-transparent px-4 py-2.5 font-mono text-xs text-neutral-400 hover:border-white/10 hover:bg-white/5 hover:text-white transition-all"
          >
            <span className="flex items-center gap-3">
              <ExternalLink className="h-4 w-4 text-cyber-violet shrink-0" />
              <span>Public Website</span>
            </span>
          </a>
        </nav>

        {/* Admin Footer Pill */}
        <div className="border-t border-white/10 p-4">
          <div className="rounded-2xl border border-white/5 bg-obsidian-900/80 p-3 mb-3">
            <div className="font-mono text-[10px] text-neutral-400">AUTHENTICATED AS</div>
            <div className="truncate font-mono text-xs text-white font-semibold">{adminEmail || 'admin@waliliens.com'}</div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 py-2.5 px-4 font-mono text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>TERMINATE SESSION</span>
          </button>
        </div>
      </aside>
    </>
  );
};
