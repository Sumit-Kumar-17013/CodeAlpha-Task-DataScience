import React from 'react';
import { Flower2, ArrowRight, CheckCircle, Info, Sparkles } from 'lucide-react';
import { IrisFeatures } from '../types';
import { SPECIES_CATALOG, PRESET_SAMPLES } from '../config';

interface SpeciesShowcaseProps {
  onLoadPreset: (features: IrisFeatures) => void;
}

export const SpeciesShowcase: React.FC<SpeciesShowcaseProps> = ({ onLoadPreset }) => {
  const speciesList = Object.values(SPECIES_CATALOG);

  return (
    <section id="species-showcase" className="py-16 sm:py-24 border-t border-white/8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono-code text-amber-300 uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Taxonomic Distribution</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            The Three Supported <span className="font-serif-display italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-200 to-indigo-200">Iris Species</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Ronald Fisher’s classic 1936 dataset consists of 50 samples from each of three species, 
            morphologically differentiated by petal and sepal dimensions.
          </p>
        </div>

        {/* 3 Species Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {speciesList.map((sp) => {
            // Find representative sample
            const sample = PRESET_SAMPLES.find((p) => p.species === sp.id);

            return (
              <div
                key={sp.id}
                className="cosmic-glass cosmic-glass-hover rounded-3xl p-6 sm:p-7 border border-white/10 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-semibold font-mono-code flex items-center space-x-1.5"
                      style={{ background: sp.badgeBg, color: sp.color }}
                    >
                      <Flower2 className="w-3.5 h-3.5" />
                      <span>{sp.displayName}</span>
                    </span>
                    <span className="text-[10px] font-mono-code text-slate-500 uppercase">
                      50 Samples (33.3%)
                    </span>
                  </div>

                  {/* Species Name */}
                  <h3 className="text-2xl font-bold text-white tracking-tight mb-1 group-hover:text-amber-200 transition-colors">
                    {sp.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono-code italic mb-4">
                    {sp.scientificName}
                  </p>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                    {sp.description}
                  </p>

                  {/* Dimension Metrics */}
                  <div className="space-y-2.5 bg-black/40 p-4 rounded-2xl border border-white/6 mb-6">
                    <div className="flex justify-between text-xs font-mono-code">
                      <span className="text-slate-400">Petal Length:</span>
                      <span className="text-slate-200 font-semibold">{sp.petalLengthTypical}</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono-code">
                      <span className="text-slate-400">Petal Width:</span>
                      <span className="text-slate-200 font-semibold">{sp.petalWidthTypical}</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono-code">
                      <span className="text-slate-400">Sepal Length:</span>
                      <span className="text-slate-200 font-semibold">{sp.sepalLengthTypical}</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono-code">
                      <span className="text-slate-400">Sepal Width:</span>
                      <span className="text-slate-200 font-semibold">{sp.sepalWidthTypical}</span>
                    </div>
                  </div>
                </div>

                {/* Load Preset Action Button */}
                {sample && (
                  <button
                    type="button"
                    onClick={() => onLoadPreset(sample.features)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/12 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <span>Load {sp.displayName} Benchmark</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
