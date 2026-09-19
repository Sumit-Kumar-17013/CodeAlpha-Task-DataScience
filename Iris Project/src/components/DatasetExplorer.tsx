import React, { useState } from 'react';
import { Database, Search, Filter, TrendingUp, Info } from 'lucide-react';
import { FEATURE_BOUNDS } from '../config';

export const DatasetExplorer: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<'SepalLengthCm' | 'SepalWidthCm' | 'PetalLengthCm' | 'PetalWidthCm'>('PetalLengthCm');

  // Summary statistics from the notebook
  const statsTable = [
    { feature: 'SepalLengthCm', name: 'Sepal Length', mean: 5.84, std: 0.83, min: 4.3, q25: 5.1, median: 5.8, q75: 6.4, max: 7.9, skew: '+0.31' },
    { feature: 'SepalWidthCm',  name: 'Sepal Width',  mean: 3.05, std: 0.43, min: 2.0, q25: 2.8, median: 3.0, q75: 3.3, max: 4.4, skew: '+0.33' },
    { feature: 'PetalLengthCm', name: 'Petal Length', mean: 3.76, std: 1.76, min: 1.0, q25: 1.6, median: 4.35, q75: 5.1, max: 6.9, skew: '-0.27' },
    { feature: 'PetalWidthCm',  name: 'Petal Width',  mean: 1.20, std: 0.76, min: 0.1, q25: 0.3, median: 1.3, q75: 1.8, max: 2.5, skew: '-0.10' },
  ];

  // Correlation matrix values from notebook
  const correlationMatrix = [
    { feat: 'SepalLengthCm', values: [1.00, -0.11, 0.87, 0.82] },
    { feat: 'SepalWidthCm',  values: [-0.11, 1.00, -0.42, -0.36] },
    { feat: 'PetalLengthCm', values: [0.87, -0.42, 1.00, 0.96] },
    { feat: 'PetalWidthCm',  values: [0.82, -0.36, 0.96, 1.00] }
  ];

  const colLabels = ['Sepal L.', 'Sepal W.', 'Petal L.', 'Petal W.'];

  return (
    <section id="dataset-eda" className="py-16 sm:py-24 border-t border-white/8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono-code text-sky-300 uppercase tracking-widest mb-4">
            <Database className="w-3.5 h-3.5" />
            <span>Dataset & EDA</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Exploratory Data <span className="font-serif-display italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-indigo-200 to-amber-200">Analysis</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Data distributions, correlation matrices, and outlier characteristics analyzed before model training.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Five-Number Summary Table */}
          <div className="lg:col-span-7 cosmic-glass rounded-3xl p-6 sm:p-7 border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Feature Descriptive Statistics (N = 150)
                </h3>
                <p className="text-xs text-slate-400">
                  Calculated across all three species classes.
                </p>
              </div>
              <span className="text-xs font-mono-code text-slate-500">
                0 null values • 0 duplicates
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono-code border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-2.5 px-3">Feature</th>
                    <th className="py-2.5 px-3">Mean</th>
                    <th className="py-2.5 px-3">Std</th>
                    <th className="py-2.5 px-3">Min</th>
                    <th className="py-2.5 px-3">Median</th>
                    <th className="py-2.5 px-3">Max</th>
                    <th className="py-2.5 px-3 text-right">Skewness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {statsTable.map((row) => (
                    <tr key={row.feature} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-semibold text-white">
                        {row.name}
                      </td>
                      <td className="py-3 px-3 text-slate-300">{row.mean}</td>
                      <td className="py-3 px-3 text-slate-400">&plusmn;{row.std}</td>
                      <td className="py-3 px-3 text-slate-400">{row.min}</td>
                      <td className="py-3 px-3 text-amber-300 font-bold">{row.median}</td>
                      <td className="py-3 px-3 text-slate-400">{row.max}</td>
                      <td className="py-3 px-3 text-right text-sky-400">{row.skew}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/6 text-xs text-slate-400 space-y-1">
              <span className="text-slate-300 font-semibold block text-[11px]">
                💡 Outlier Analysis Insight:
              </span>
              <p>
                IQR analysis detected 4 minor outliers in Sepal Width, but skewness (+0.33) remained normal, so values were retained to prevent information loss.
              </p>
            </div>
          </div>

          {/* Right: Correlation Heatmap Matrix */}
          <div className="lg:col-span-5 cosmic-glass rounded-3xl p-6 sm:p-7 border border-white/10 space-y-4">
            <div className="border-b border-white/8 pb-4">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Feature Correlation Matrix</span>
              </h3>
              <p className="text-xs text-slate-400">
                Strong collinearity (+0.96) between Petal Length and Petal Width.
              </p>
            </div>

            {/* Visual Heatmap Grid */}
            <div className="overflow-x-auto">
              <div className="min-w-[280px] max-w-sm mx-auto space-y-2">
                {/* Column Headers */}
                <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-mono-code text-slate-400 font-semibold">
                  <div></div>
                  {colLabels.map((lbl) => (
                    <div key={lbl} className="p-1">{lbl}</div>
                  ))}
                </div>

                {/* Rows */}
                {correlationMatrix.map((row, rIdx) => (
                  <div key={row.feat} className="grid grid-cols-5 gap-1.5 text-center text-xs font-mono-code items-center">
                    <div className="text-[10px] text-slate-400 text-left truncate font-semibold">
                      {colLabels[rIdx]}
                    </div>
                    {row.values.map((val, cIdx) => {
                      const isHighPos = val >= 0.8;
                      const isNeg = val < 0;
                      const isSelf = rIdx === cIdx;

                      let cellBg = 'bg-white/5 text-slate-300';
                      if (isSelf) {
                        cellBg = 'bg-white/20 text-white font-bold';
                      } else if (isHighPos) {
                        cellBg = 'bg-amber-500/25 text-amber-300 font-bold border border-amber-500/30';
                      } else if (isNeg) {
                        cellBg = 'bg-sky-950/40 text-sky-300';
                      }

                      return (
                        <div
                          key={cIdx}
                          className={`py-2 px-1 rounded-lg text-[11px] ${cellBg}`}
                          title={`Corr(${row.feat}, ${colLabels[cIdx]}): ${val}`}
                        >
                          {val > 0 && !isSelf ? `+${val.toFixed(2)}` : val.toFixed(2)}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-mono-code text-center pt-2">
              Pearson correlation coefficients calculated on N=150
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
