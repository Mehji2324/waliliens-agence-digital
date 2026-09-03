import React, { useState, useEffect } from 'react';
import { Menu, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onOpenSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle, onOpenSidebar }) => {
  const { adminEmail } = useAdminAuth();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Africa/Casablanca',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' WET'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-obsidian-950/80 px-6 sm:px-10 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="rounded-xl border border-white/10 p-2 text-neutral-400 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="font-display text-lg sm:text-xl font-bold text-white tracking-wide">{title}</h1>
          {subtitle && <p className="font-mono text-xs text-neutral-400 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Live Casablanca Studio Clock */}
        <div className="hidden md:flex items-center gap-2 rounded-xl border border-white/10 bg-obsidian-900/60 px-3.5 py-1.5 font-mono text-xs text-neutral-300">
          <span className="h-2 w-2 rounded-full bg-cyber-emerald animate-pulse" />
          <span>CASABLANCA // {time}</span>
        </div>

        {/* Security / Admin Badge */}
        <div className="flex items-center gap-2 rounded-xl border border-cyber-cyan/30 bg-cyber-cyan/10 px-3 py-1.5 font-mono text-xs text-cyber-cyan">
          <ShieldCheck className="h-4 w-4" />
          <span className="hidden sm:inline font-semibold">{adminEmail || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
};
