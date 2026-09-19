import React, { useState } from 'react';
import { Sparkles, Terminal, Database, Cpu, Search, Menu, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface NavbarProps {
  onOpenDocs: () => void;
  onScrollToPredict: () => void;
  onScrollToSpecies: () => void;
  onScrollToAnalytics: () => void;
  isBackendOnline: boolean;
  apiUrl: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDocs,
  onScrollToPredict,
  onScrollToSpecies,
  onScrollToAnalytics,
  isBackendOnline,
  apiUrl
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#05070B]/85 backdrop-blur-xl border-b border-white/8 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/15 to-white/5 border border-white/20 flex items-center justify-center shadow-lg group-hover:border-white/40 transition-all duration-300">
            <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white flex items-center space-x-1.5">
              <span>Orchid</span>
              <span className="text-xs font-mono-code px-1.5 py-0.5 rounded bg-white/10 text-amber-300 font-normal">ML</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
              Iris Classifier
            </span>
          </div>
        </div>

        {/* Center Nav Links (Matching video: Home, Features, Pricing, Support, Login) */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-white hover:text-white transition-colors relative py-1"
          >
            Home
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400 to-indigo-400 rounded-full" />
          </button>

          <button 
            onClick={onScrollToPredict}
            className="hover:text-white transition-colors flex items-center space-x-1.5 py-1 text-slate-300"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Predict Species</span>
          </button>

          <button 
            onClick={onScrollToSpecies}
            className="hover:text-white transition-colors py-1 text-slate-300"
          >
            Supported Species
          </button>

          <button 
            onClick={onScrollToAnalytics}
            className="hover:text-white transition-colors flex items-center space-x-1.5 py-1 text-slate-300"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Model Analytics</span>
          </button>

          <button 
            onClick={onOpenDocs}
            className="hover:text-white transition-colors flex items-center space-x-1.5 py-1 text-slate-300"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>FastAPI Docs</span>
          </button>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center space-x-3.5">
          {/* API Status Badge Pill */}
          <button
            onClick={onOpenDocs}
            title={`FastAPI endpoint: ${apiUrl}. Click to configure.`}
            className="flex items-center space-x-2 text-xs font-mono-code px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
          >
            {isBackendOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 hidden sm:inline">FastAPI Online</span>
                <span className="text-slate-400 text-[10px]">:8000</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-amber-200 hidden sm:inline">Engine Ready</span>
                <span className="text-slate-400 text-[10px]">(Local/API)</span>
              </>
            )}
          </button>

          {/* Quick Search / Command Icon (from video) */}
          <button 
            onClick={onScrollToPredict}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            title="Jump to Predictor"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#070a12] border-b border-white/10 px-4 py-4 space-y-3 font-medium text-sm text-slate-200">
          <button 
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded hover:bg-white/5"
          >
            Home
          </button>
          <button 
            onClick={() => {
              onScrollToPredict();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded hover:bg-white/5 flex items-center space-x-2 text-amber-300"
          >
            <Sparkles className="w-4 h-4" />
            <span>Predict Species</span>
          </button>
          <button 
            onClick={() => {
              onScrollToSpecies();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded hover:bg-white/5"
          >
            Supported Species
          </button>
          <button 
            onClick={() => {
              onScrollToAnalytics();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded hover:bg-white/5 flex items-center space-x-2"
          >
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>Model Analytics</span>
          </button>
          <button 
            onClick={() => {
              onOpenDocs();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded hover:bg-white/5 flex items-center space-x-2 text-emerald-300"
          >
            <Terminal className="w-4 h-4" />
            <span>FastAPI Server & Docs</span>
          </button>
        </div>
      )}
    </nav>
  );
};
