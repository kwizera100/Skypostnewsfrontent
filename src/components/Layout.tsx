import { type ReactNode } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import BreakingNewsTicker from './BreakingNewsTicker';
import Footer from './Footer';
import AIChat from './AIChat';
import { Toaster } from 'react-hot-toast';

interface Props {
  children: ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f5f5f5' }}>
      <Toaster position="top-right" />
      <Header />
      <Navbar />
      <BreakingNewsTicker />
      <main className="flex-1 w-full">
        <div className="w-full px-0 sm:px-4 py-3 sm:py-5">
          {children}
        </div>
      </main>
      <Footer />
      <AIChat />
    </div>
  );
}

