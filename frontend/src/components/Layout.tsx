import React from 'react';
import { Header } from './Header';
import { PassphraseModal } from './PassphraseModal';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 sm:py-6">
        {children}
      </main>
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200">
        © 杉本研究室 (IMLab) 備品管理システム
      </footer>
      <PassphraseModal />
    </div>
  );
};

