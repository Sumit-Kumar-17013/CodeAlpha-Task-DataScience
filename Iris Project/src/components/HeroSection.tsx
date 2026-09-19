import React from 'react';
import { Sparkles, ArrowDown, Play, Flower2, Ruler, Maximize2, Gauge } from 'lucide-react';
import { IrisFeatures, IrisSpeciesName } from '../types';
import { CosmicPortal } from './CosmicPortal';

interface HeroSectionProps {
  features: IrisFeatures;
  onUpdateFeature: (key: keyof IrisFeatures, value: number) => void;
  onStartPrediction: () => void;
  onApplyPreset: () => void;
  activeSpecies?: IrisSpeciesName | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  features,
  onUpdateFeature,
  onStartPrediction,
  onApplyPreset,
  activeSpecies
}) => {
  return (
    <section className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden">
      {/* Subtle ambient background glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-96 h-96 bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[480px] h-[480px] bg-amber-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Typography, Badges, CTAs (from Orchid reference video) */}
          <div className="lg:col-span-6 flex flex-col items-start text-left z-10">
            
            {/* Top Pill Badge with 3 Gradient Orbs */}
            <div className="inline-flex items-center space-x-3 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 hover:border-white/20 transition-all duration-300 shadow-lg">
              {/* 3 Overlapping Colorful Avatar Circles as seen in video */}
              <div className="flex -space-x-1.5 items-center">
                <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 border border-[#05070B] shadow-sm" />
                <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-400 to-pink-500 border border-[#05070B] shadow-sm" />
                <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 border border-[#05070B] shadow-sm" />
              </div>
              <span className="text-xs font-medium text-slate-300">
                +150k predictions classified with <span className="text-white font-semibold">"Orchid"</span>
              </span>
            </div>

            {/* Main Headline (Styling matches "Manage Your Work / The Simple Way") */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white font-bold leading-[1.12] mb-6">
              <span>Predict The </span>
              <span className="font-serif-display italic font-normal tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-200 to-indigo-200 pr-1">
                Iris Species
              </span>
              <br />
              <span>The </span>
              <span className="font-serif-display italic font-normal tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-sky-200 to-amber-200 pr-1">
                Intelligent Way
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed mb-8 font-normal">
              Beautifully simple machine learning prediction for creative teams and botanical researchers. 
              Your flower measurements are just four inputs away from instant species classification.
            </p>

            {/* Action Buttons (Matches the black pill button with sparkle icon from video) */}
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <button
                onClick={onStartPrediction}
                className="inline-flex items-center space-x-2.5 px-6 py-3.5 rounded-full bg-white text-slate-950 font-semibold text-sm hover:bg-slate-100 hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all duration-300 transform active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="tracking-wide uppercase text-xs font-bold">Start Your Prediction</span>
              </button>

              <button
                onClick={onApplyPreset}
                className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/12 text-slate-200 hover:text-white font-medium text-xs tracking-wider uppercase transition-all duration-300"
              >
                <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Quick Preset</span>
              </button>
            </div>

            {/* Process / Steps Bar: 4 Cards (01, 02, 03, 04) from Orchid video */}
            <div className="w-full pt-4 border-t border-white/8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                
                {/* 01: Sepal Length */}
                <div 
                  onClick={onStartPrediction}
                  className="cosmic-glass cosmic-glass-hover rounded-2xl p-3.5 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-amber-300 group-hover:border-amber-300/30 transition-colors">
                      <Ruler className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[11px] font-mono-code font-bold text-slate-400 group-hover:text-white">
                      01
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
                      Sepal L.
                    </span>
                    <span className="text-sm font-semibold text-white font-mono-code">
                      {features.SepalLengthCm.toFixed(1)} cm
                    </span>
                  </div>
                </div>

                {/* 02: Sepal Width */}
                <div 
                  onClick={onStartPrediction}
                  className="cosmic-glass cosmic-glass-hover rounded-2xl p-3.5 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-sky-300 group-hover:border-sky-300/30 transition-colors">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[11px] font-mono-code font-bold text-slate-400 group-hover:text-white">
                      02
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
                      Sepal W.
                    </span>
                    <span className="text-sm font-semibold text-white font-mono-code">
                      {features.SepalWidthCm.toFixed(1)} cm
                    </span>
                  </div>
                </div>

                {/* 03: Petal Length */}
                <div 
                  onClick={onStartPrediction}
                  className="cosmic-glass cosmic-glass-hover rounded-2xl p-3.5 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-emerald-300 group-hover:border-emerald-300/30 transition-colors">
                      <Flower2 className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[11px] font-mono-code font-bold text-slate-400 group-hover:text-white">
                      03
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
                      Petal L.
                    </span>
                    <span className="text-sm font-semibold text-white font-mono-code">
                      {features.PetalLengthCm.toFixed(1)} cm
                    </span>
                  </div>
                </div>

                {/* 04: Petal Width */}
                <div 
                  onClick={onStartPrediction}
                  className="cosmic-glass cosmic-glass-hover rounded-2xl p-3.5 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-purple-300 group-hover:border-purple-300/30 transition-colors">
                      <Gauge className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[11px] font-mono-code font-bold text-slate-400 group-hover:text-white">
                      04
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
                      Petal W.
                    </span>
                    <span className="text-sm font-semibold text-white font-mono-code">
                      {features.PetalWidthCm.toFixed(1)} cm
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Right Column: The Iconic Cosmic Portal (from video) */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <CosmicPortal activeSpecies={activeSpecies} />
          </div>

        </div>
      </div>
    </section>
  );
};
