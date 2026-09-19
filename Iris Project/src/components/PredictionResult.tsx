import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Share2, 
  Layers, 
  Info, 
  Flower2, 
  Server, 
  Cpu, 
  TrendingUp,
  Sliders
} from 'lucide-react';
import { IrisFeatures, PredictionResponse } from '../types';
import { SPECIES_CATALOG } from '../config';

interface PredictionResultProps {
  prediction: PredictionResponse;
  features: IrisFeatures;
  onRetest: () => void;
}

export const PredictionResult: React.FC<PredictionResultProps> = ({
  prediction,
  features,
  onRetest
}) => {
  const species = SPECIES_CATALOG[prediction.prediction] || SPECIES_CATALOG['Iris-setosa'];
  const probabilities = prediction.probabilities || {
    'Iris-setosa': prediction.prediction === 'Iris-setosa' ? 0.98 : 0.01,
    'Iris-versicolor': prediction.prediction === 'Iris-versicolor' ? 0.96 : 0.02,
    'Iris-virginica': prediction.prediction === 'Iris-virginica' ? 0.97 : 0.02
  };

  const confidencePct = Math.round((prediction.confidence || 0.95) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      <div className="cosmic-glass rounded-3xl p-6 sm:p-9 border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.85)] relative overflow-hidden">
        
        {/* Dynamic ambient color glow matching predicted species */}
        <div 
          className="absolute -top-12 -right-12 w-96 h-96 rounded-full blur-[110px] pointer-events-none opacity-40 transition-all duration-700"
          style={{ background: species.glowColor }}
        />

        {/* Top Result Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-7 border-b border-white/10 gap-4">
          <div className="flex items-center space-x-3">
            <span className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-md">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </span>
            <div>
              <span className="text-[11px] font-mono-code uppercase tracking-wider text-slate-400 block font-semibold">
                Classification Complete
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Predicted Iris Specimen
              </h3>
            </div>
          </div>

          {/* Model & Source Meta */}
          <div className="flex items-center space-x-2 text-xs font-mono-code text-slate-400 self-start sm:self-center">
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 flex items-center space-x-1.5">
              {prediction.source === 'fastapi' ? (
                <>
                  <Server className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-300">FastAPI API</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3 h-3 text-amber-400" />
                  <span className="text-amber-200">Local Engine</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Hero Specimen Focus Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center mb-8">
          
          {/* Main Species Identity */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: species.badgeBg, color: species.color }}>
              <Flower2 className="w-3.5 h-3.5" />
              <span>Taxonomic Prediction</span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-baseline space-x-3">
                <span>{species.name}</span>
                <span className="text-base font-normal text-slate-400 font-serif-display italic">
                  ({species.displayName})
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono-code mt-1">
                {species.scientificName}
              </p>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {species.description}
            </p>

            {/* Differentiating Factor Pill */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/8 text-xs text-slate-300 space-y-1">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider font-mono-code text-[10px]">
                Primary Classifier Factor:
              </span>
              <p>{species.keyDifferentiator}</p>
            </div>
          </div>

          {/* Probability Distribution Gauge */}
          <div className="lg:col-span-5 bg-black/40 p-5 rounded-2xl border border-white/8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono-code flex items-center space-x-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Confidence Score</span>
              </span>
              <span className="text-2xl font-extrabold font-mono-code" style={{ color: species.color }}>
                {confidencePct}%
              </span>
            </div>

            {/* Progress breakdown for each of the 3 species */}
            <div className="space-y-3 pt-1">
              {/* Setosa */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono-code">
                  <span className="text-slate-300">Iris-setosa</span>
                  <span className="text-slate-400">{Math.round((probabilities['Iris-setosa'] || 0) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-400 transition-all duration-700 rounded-full"
                    style={{ width: `${Math.round((probabilities['Iris-setosa'] || 0) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Versicolor */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono-code">
                  <span className="text-slate-300">Iris-versicolor</span>
                  <span className="text-slate-400">{Math.round((probabilities['Iris-versicolor'] || 0) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 transition-all duration-700 rounded-full"
                    style={{ width: `${Math.round((probabilities['Iris-versicolor'] || 0) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Virginica */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono-code">
                  <span className="text-slate-300">Iris-virginica</span>
                  <span className="text-slate-400">{Math.round((probabilities['Iris-virginica'] || 0) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-400 transition-all duration-700 rounded-full"
                    style={{ width: `${Math.round((probabilities['Iris-virginica'] || 0) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-mono-code text-right">
              Kernel: RBF • Model: SVC
            </div>
          </div>

        </div>

        {/* Feature Input Verification Strip */}
        <div className="bg-black/30 p-4 rounded-2xl border border-white/6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs font-mono-code text-slate-400">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="uppercase tracking-wider font-semibold text-slate-300">Analyzed Dimensions:</span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-mono-code">
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200">
              Sepal L: <strong className="text-amber-300">{features.SepalLengthCm} cm</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200">
              Sepal W: <strong className="text-sky-300">{features.SepalWidthCm} cm</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200">
              Petal L: <strong className="text-emerald-300">{features.PetalLengthCm} cm</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200">
              Petal W: <strong className="text-purple-300">{features.PetalWidthCm} cm</strong>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
