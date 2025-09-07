import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SupportButton } from './SupportButton';
import { Toaster } from 'react-hot-toast';
import { useApp } from '../../contexts/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { state } = useApp();

  return (
    <div className={`min-h-screen bg-gray-50 ${state.language === 'ar' ? 'rtl' : 'ltr'}`}>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <SupportButton />
      <Toaster
        position={state.language === 'ar' ? 'top-left' : 'top-right'}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            direction: state.language === 'ar' ? 'rtl' : 'ltr',
          },
        }}
      />
    </div>
  );
}