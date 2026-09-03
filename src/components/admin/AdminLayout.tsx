import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

interface AdminLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ title, subtitle, children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-obsidian-950 font-mono text-xs text-cyber-cyan">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyber-cyan border-t-transparent" />
          <span>VERIFYING ADMIN SESSION...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-obsidian-950 text-neutral-100 selection:bg-cyber-cyan selection:text-obsidian-950">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-x-hidden">
        <AdminHeader
          title={title}
          subtitle={subtitle}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 p-6 sm:p-10 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};
