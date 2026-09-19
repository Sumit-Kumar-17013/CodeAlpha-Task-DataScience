import React from 'react';
import { Sparkles, Terminal, Heart, Flower2, Github } from 'lucide-react';

interface FooterProps {
  onOpenDocs: () => void;
  onScrollToPredict: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDocs, onScrollToPredict }) => {
  return (
    <footer className="w-full bg-[#030508] border-t border-white/8 py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/6">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight flex items-center space-x-1.5">
                <span>Orchid</span>
                <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-white/10 text-amber-300">ML</span>
              </span>
              <p className="text-[11px] text-slate-500">
                Iris Flower Classification Machine Learning Studio
              </p>
            </div>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 font-medium">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="hover:text-white transition-colors"
            >
              Back to Top
            </button>
            <button 
              onClick={onScrollToPredict} 
              className="hover:text-amber-300 transition-colors"
            >
              Predict Species
            </button>
            <button 
              onClick={onOpenDocs} 
              className="hover:text-emerald-300 transition-colors flex items-center space-x-1"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>FastAPI Server</span>
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px] font-mono-code">
          <div>
            Built with React, Vite &amp; FastAPI • Trained on R.A. Fisher Iris Dataset (1936)
          </div>
          <div className="flex items-center space-x-2">
            <span>Accuracy: 96.7%</span>
            <span>•</span>
            <span>SVC RBF Pipeline</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
