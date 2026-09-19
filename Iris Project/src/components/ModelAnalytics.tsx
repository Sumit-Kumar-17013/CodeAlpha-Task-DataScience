import React, { useState } from 'react';
import { 
  Cpu, 
  BarChart3, 
  Layers, 
  CheckCircle2, 
  Activity, 
  Zap, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { NOTEBOOK_MODEL_METRICS } from '../config';

export const ModelAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'importance' | 'confusion' | 'benchmark'>('importance');

  // Comparison metrics from user's notebook
  const comparisonModels = [
    { name: 'Support Vector (SVC RBF)', testAcc: 0.9667, cvMean: 0.9667, cvStd: 0.0312, isBest: true },
    { name: 'Random Forest Classifier', testAcc: 0.9667, cvMean: 0.9500, cvStd: 0.0167, isBest: false },
    { name: 'Logistic Regression', testAcc: 0.9333, cvMean: 0.9583, cvStd: 0.0264, isBest: false },
    { name: 'Decision Tree Classifier', testAcc: 0.9333, cvMean: 0.9333, cvStd: 0.0204, isBest: false },
    { name: 'XGBoost Classifier', testAcc: 0.9000, cvMean: 0.9500, cvStd: 0.0167, isBest: false }
  ];

  return (
    <section id="model-analytics" className="py-16 sm:py-24 border-t border-white/8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono-code text-indigo-300 uppercase tracking-widest mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>Trained Model Telemetry</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Model Performance & <span className="font-serif-display italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-sky-200 to-amber-200">Architecture</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Evaluated using 5-fold stratified cross-validation and independent test splits, 
            the Support Vector Classifier with StandardScaler pipeline achieved top-tier 96.67% accuracy.
          </p>
        </div>

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          
          <div className="cosmic-glass rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-mono-code text-slate-400">Test Accuracy</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white font-mono-code mb-1">
              96.7%
            </div>
            <p className="text-[11px] text-slate-400">29 out of 30 test samples correctly classified</p>
          </div>

          <div className="cosmic-glass rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-mono-code text-slate-400">CV Mean Score</span>
              <Activity className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-3xl font-extrabold text-white font-mono-code mb-1">
              96.7%
            </div>
            <p className="text-[11px] text-slate-400">5-fold cross-validation with std 0.031</p>
          </div>

          <div className="cosmic-glass rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-mono-code text-slate-400">Algorithm</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono-code mb-1 truncate">
              SVC (RBF)
            </div>
            <p className="text-[11px] text-slate-400">Radial Basis Function with C=1.0</p>
          </div>

          <div className="cosmic-glass rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-mono-code text-slate-400">Preprocessing</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono-code mb-1 truncate">
              StandardScaler
            </div>
            <p className="text-[11px] text-slate-400">Zero-mean, unit-variance normalization</p>
          </div>

        </div>

        {/* Tab Controls */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-black/50 border border-white/10 text-xs font-medium">
            <button
              onClick={() => setActiveTab('importance')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'importance'
                  ? 'bg-white/15 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Permutation Importance
            </button>
            <button
              onClick={() => setActiveTab('confusion')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'confusion'
                  ? 'bg-white/15 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Confusion Matrix
            </button>
            <button
              onClick={() => setActiveTab('benchmark')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'benchmark'
                  ? 'bg-white/15 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Model Benchmarking
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="cosmic-glass rounded-3xl p-6 sm:p-8 border border-white/12">
          
          {/* 1. Feature Importance Tab */}
          {activeTab === 'importance' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/8 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Permutation Feature Importance
                  </h3>
                  <p className="text-xs text-slate-400">
                    Quantifies the decrease in model score when feature values are randomly shuffled.
                  </p>
                </div>
                <span className="text-xs font-mono-code text-amber-300">
                  Petal metrics account for 85%+ of predictive weight
                </span>
              </div>

              <div className="space-y-4">
                {NOTEBOOK_MODEL_METRICS.featureImportance.map((feat, index) => {
                  const maxImp = 0.3;
                  const pct = Math.round((feat.importance / maxImp) * 100);
                  const colors = ['bg-purple-400', 'bg-emerald-400', 'bg-sky-400', 'bg-amber-400'];

                  return (
                    <div key={feat.feature} className="space-y-1.5 bg-black/30 p-3.5 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between text-xs font-mono-code">
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-500 font-bold">#{index + 1}</span>
                          <span className="text-white font-semibold">{feat.label}</span>
                          <span className="text-slate-500">({feat.feature})</span>
                        </div>
                        <span className="text-amber-300 font-bold">
                          {feat.importance.toFixed(3)}
                        </span>
                      </div>

                      <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${colors[index % colors.length]}`}
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>

                      <p className="text-[11px] text-slate-400 font-normal">
                        {feat.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Confusion Matrix Tab */}
          {activeTab === 'confusion' && (
            <div className="space-y-6">
              <div className="border-b border-white/8 pb-4">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Independent Test Set Confusion Matrix (N = 30)
                </h3>
                <p className="text-xs text-slate-400">
                  Diagonal elements represent verified correct classifications. Notice zero Setosa or Virginica misclassifications.
                </p>
              </div>

              {/* 3x3 Matrix Table */}
              <div className="overflow-x-auto">
                <div className="min-w-[440px] max-w-lg mx-auto bg-black/40 p-5 rounded-2xl border border-white/10 space-y-3">
                  <div className="text-center text-xs font-mono-code uppercase tracking-wider text-slate-400 font-semibold mb-2">
                    Predicted Species &rarr;
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono-code">
                    {/* Header Row */}
                    <div className="text-slate-500 font-bold p-2">Actual &darr;</div>
                    <div className="text-sky-300 font-semibold p-2 bg-sky-950/30 rounded-lg">Setosa</div>
                    <div className="text-emerald-300 font-semibold p-2 bg-emerald-950/30 rounded-lg">Versicolor</div>
                    <div className="text-purple-300 font-semibold p-2 bg-purple-950/30 rounded-lg">Virginica</div>

                    {/* Row 0: Actual Setosa */}
                    <div className="text-sky-300 font-semibold p-3 flex items-center justify-center bg-sky-950/30 rounded-lg">
                      Setosa
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-300 font-extrabold text-base border border-emerald-500/40">
                      10
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 text-slate-500">0</div>
                    <div className="p-3 rounded-lg bg-white/5 text-slate-500">0</div>

                    {/* Row 1: Actual Versicolor */}
                    <div className="text-emerald-300 font-semibold p-3 flex items-center justify-center bg-emerald-950/30 rounded-lg">
                      Versicolor
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 text-slate-500">0</div>
                    <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-300 font-extrabold text-base border border-emerald-500/40">
                      9
                    </div>
                    <div className="p-3 rounded-lg bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30" title="1 borderline case predicted as Virginica">
                      1
                    </div>

                    {/* Row 2: Actual Virginica */}
                    <div className="text-purple-300 font-semibold p-3 flex items-center justify-center bg-purple-950/30 rounded-lg">
                      Virginica
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 text-slate-500">0</div>
                    <div className="p-3 rounded-lg bg-white/5 text-slate-500">0</div>
                    <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-300 font-extrabold text-base border border-emerald-500/40">
                      10
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Model Benchmark Comparison */}
          {activeTab === 'benchmark' && (
            <div className="space-y-6">
              <div className="border-b border-white/8 pb-4">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Multi-Algorithm Evaluation Summary
                </h3>
                <p className="text-xs text-slate-400">
                  Comparison results extracted from cross-validation experiments performed in the training notebook.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono-code border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="py-3 px-4">Algorithm</th>
                      <th className="py-3 px-4">Test Accuracy</th>
                      <th className="py-3 px-4">CV Mean</th>
                      <th className="py-3 px-4">CV Std</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {comparisonModels.map((m) => (
                      <tr key={m.name} className={m.isBest ? 'bg-amber-400/10 text-white font-semibold' : 'text-slate-300'}>
                        <td className="py-3.5 px-4 flex items-center space-x-2">
                          {m.isBest && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                          <span>{m.name}</span>
                        </td>
                        <td className="py-3.5 px-4 text-emerald-400 font-bold">{(m.testAcc * 100).toFixed(1)}%</td>
                        <td className="py-3.5 px-4">{(m.cvMean * 100).toFixed(1)}%</td>
                        <td className="py-3.5 px-4 text-slate-400">&plusmn;{m.cvStd.toFixed(4)}</td>
                        <td className="py-3.5 px-4 text-right">
                          {m.isBest ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[10px]">
                              BEST MODEL (SAVED)
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">Evaluated</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
