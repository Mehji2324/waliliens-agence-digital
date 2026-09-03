import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useScrollToTop } from '../../hooks/useScrollToTop';

export const SiteLayout: React.FC = () => {
  useScrollToTop();

  return (
    <div className="flex min-h-screen flex-col bg-obsidian-950 text-neutral-100 selection:bg-cyber-cyan/30 selection:text-white bg-noise">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
