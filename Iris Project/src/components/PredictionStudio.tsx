import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  RotateCcw, 
  Dice5, 
  SlidersHorizontal, 
  CheckCircle, 
  AlertTriangle,
  Server,
  Flower2,
  ExternalLink
} from 'lucide-react';
import { IrisFeatures, PredictionResponse } from '../types';
import { FEATURE_BOUNDS, PRESET_SAMPLES, DEFAULT_API_URL } from '../config';

interface PredictionStudioProps {
  features: IrisFeatures;
  onChange: (features: IrisFeatures) => void;
  onPredict: () => Promise<void>;
  isLoading: boolean;
  prediction: PredictionResponse | null;
  error: string | null;
  apiUrl: string;
  onOpenDocs: () => void;
  backendOnline: boolean;
}

export const PredictionStudio: React.FC<PredictionStudioProps> = ({
  features,
  onChange,
  onPredict,
  isLoading,
  prediction,
  error,
  apiUrl,
  onOpenDocs,
  backendOnline
}) => {
  const [validationErrors, setValidationErrors] = useState<{ [K in keyof IrisFeatures]?: string }>({});

  const handleValueChange = (key: keyof IrisFeatures, rawVal: string | number) => {
    const val = typeof rawVal === 'string' ? parseFloat(rawVal) : rawVal;
    
    // Clear validation error on edit
    if (validationErrors[key]) {
      setValidationErrors((prev) => ({ ...prev, [key]: undefined }));
    }

    if (isNaN(val)) {
      onChange({ ...features, [key]: 0 });
      return;
    }

    onChange({ ...features, [key]: val });
  };

  const handlePresetSelect = (preset: typeof PRESET_SAMPLES[0]) => {
    setValidationErrors({});
    onChange({ ...preset.features });
  };

  const handleRandomize = () => {
    setValidationErrors({});
    // Generate realistic random sample within biological range
    const rSepalL = +(4.5 + Math.random() * 3.2).toFixed(1);
    const rSepalW = +(2.2 + Math.random() * 1.8).toFixed(1);
    const rPetalL = +(1.2 + Math.random() * 5.3).toFixed(1);
    const rPetalW = +(0.1 + Math.random() * 2.3).toFixed(1);

    onChange({
      SepalLengthCm: rSepalL,
      SepalWidthCm: rSepalW,
      PetalLengthCm: rPetalL,
      PetalWidthCm: rPetalW
    });
  };

  const handleResetDefaults = () => {
    setValidationErrors({});
    onChange({
      SepalLengthCm: FEATURE_BOUNDS.SepalLengthCm.default,
      SepalWidthCm: FEATURE_BOUNDS.SepalWidthCm.default,
      PetalLengthCm: FEATURE_BOUNDS.PetalLengthCm.default,
      PetalWidthCm: FEATURE_BOUNDS.PetalWidthCm.default
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const errors: { [K in keyof IrisFeatures]?: string } = {};
    
    (Object.keys(FEATURE_BOUNDS) as Array<keyof IrisFeatures>).forEach((key) => {
      const val = features[key];
      const bound = FEATURE_BOUNDS[key];
      if (val === undefined || val === null || isNaN(val) || val <= 0) {
        errors[key] = `Please enter a valid ${key}`;
      } else if (val < bound.min * 0.7 || val > bound.max * 1.3) {
        errors[key] = `Out of reasonable botanical range (${bound.min} - ${bound.max} cm)`;
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    onPredict();
  };

  return (
    <div id="prediction-studio" className="w-full max-w-4xl mx-auto scroll-mt-24">
      {/* Studio Card Container */}
      <div className="cosmic-glass rounded-3xl p-6 sm:p-9 border border-white/12 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-white/8 gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <span className="w-8 h-8 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <SlidersHorizontal className="w-4 h-4" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Botanical Measurement Console
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Input physical flower dimensions to identify species via Support Vector Machine classification.
            </p>
          </div>

          {/* Backend Status indicator badge */}
          <div className="flex items-center space-x-2 self-start sm:self-center">
            <button
              onClick={onOpenDocs}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-xs font-mono-code text-slate-300 transition-colors"
              title="Click to view and configure FastAPI endpoint"
            >
              <Server className="w-3 h-3 text-slate-400" />
              <span className={backendOnline ? 'text-emerald-400' : 'text-amber-400'}>
                {backendOnline ? 'FastAPI :8000' : 'Local Engine'}
              </span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-500 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Presets Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-slate-300 tracking-wider uppercase font-mono-code flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Benchmark Presets:</span>
            </span>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleRandomize}
                className="text-slate-400 hover:text-white transition-colors flex items-center space-x-1"
                title="Randomize measurements"
              >
                <Dice5 className="w-3.5 h-3.5" />
                <span>Random</span>
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-slate-400 hover:text-white transition-colors flex items-center space-x-1"
                title="Reset to default Setosa sample (5.1, 3.5, 1.4, 0.2)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PRESET_SAMPLES.map((preset) => {
              const isSelected = 
                features.SepalLengthCm === preset.features.SepalLengthCm &&
                features.SepalWidthCm === preset.features.SepalWidthCm &&
                features.PetalLengthCm === preset.features.PetalLengthCm &&
                features.PetalWidthCm === preset.features.PetalWidthCm;

              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-400/40 text-white shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                      : 'bg-white/5 border-white/8 text-slate-300 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="font-semibold flex items-center justify-between mb-1">
                    <span className="truncate">{preset.species.replace('Iris-', '')}</span>
                    {isSelected && <CheckCircle className="w-3 h-3 text-amber-400 shrink-0" />}
                  </div>
                  <div className="font-mono-code text-[10px] text-slate-400 truncate">
                    {preset.features.SepalLengthCm} / {preset.features.SepalWidthCm} / {preset.features.PetalLengthCm} / {preset.features.PetalWidthCm}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Form with Dual Controls (Slider + Number Field) */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-7">
            
            {/* 1. Sepal Length */}
            <div className="space-y-2.5 bg-black/30 p-4 rounded-2xl border border-white/6">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Sepal Length (cm)</span>
                </label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    step={FEATURE_BOUNDS.SepalLengthCm.step}
                    min={FEATURE_BOUNDS.SepalLengthCm.min}
                    max={FEATURE_BOUNDS.SepalLengthCm.max}
                    value={features.SepalLengthCm}
                    onChange={(e) => handleValueChange('SepalLengthCm', e.target.value)}
                    className="w-16 px-2 py-1 bg-black/60 border border-white/15 rounded-lg text-right font-mono-code text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <span className="text-xs text-slate-500 font-mono-code">cm</span>
                </div>
              </div>

              <input
                type="range"
                step={FEATURE_BOUNDS.SepalLengthCm.step}
                min={FEATURE_BOUNDS.SepalLengthCm.min}
                max={FEATURE_BOUNDS.SepalLengthCm.max}
                value={features.SepalLengthCm}
                onChange={(e) => handleValueChange('SepalLengthCm', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono-code">
                <span>Min: {FEATURE_BOUNDS.SepalLengthCm.min} cm</span>
                <span>Dataset Mean: {FEATURE_BOUNDS.SepalLengthCm.mean} cm</span>
                <span>Max: {FEATURE_BOUNDS.SepalLengthCm.max} cm</span>
              </div>
              {validationErrors.SepalLengthCm && (
                <p className="text-[11px] text-rose-400">{validationErrors.SepalLengthCm}</p>
              )}
            </div>

            {/* 2. Sepal Width */}
            <div className="space-y-2.5 bg-black/30 p-4 rounded-2xl border border-white/6">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <span>Sepal Width (cm)</span>
                </label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    step={FEATURE_BOUNDS.SepalWidthCm.step}
                    min={FEATURE_BOUNDS.SepalWidthCm.min}
                    max={FEATURE_BOUNDS.SepalWidthCm.max}
                    value={features.SepalWidthCm}
                    onChange={(e) => handleValueChange('SepalWidthCm', e.target.value)}
                    className="w-16 px-2 py-1 bg-black/60 border border-white/15 rounded-lg text-right font-mono-code text-sm font-bold text-sky-300 focus:outline-none focus:border-sky-400 transition-colors"
                  />
                  <span className="text-xs text-slate-500 font-mono-code">cm</span>
                </div>
              </div>

              <input
                type="range"
                step={FEATURE_BOUNDS.SepalWidthCm.step}
                min={FEATURE_BOUNDS.SepalWidthCm.min}
                max={FEATURE_BOUNDS.SepalWidthCm.max}
                value={features.SepalWidthCm}
                onChange={(e) => handleValueChange('SepalWidthCm', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono-code">
                <span>Min: {FEATURE_BOUNDS.SepalWidthCm.min} cm</span>
                <span>Dataset Mean: {FEATURE_BOUNDS.SepalWidthCm.mean} cm</span>
                <span>Max: {FEATURE_BOUNDS.SepalWidthCm.max} cm</span>
              </div>
              {validationErrors.SepalWidthCm && (
                <p className="text-[11px] text-rose-400">{validationErrors.SepalWidthCm}</p>
              )}
            </div>

            {/* 3. Petal Length (High Importance) */}
            <div className="space-y-2.5 bg-black/30 p-4 rounded-2xl border border-white/6 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Petal Length (cm)</span>
                  <span className="text-[9px] uppercase font-mono-code px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    Key Feature
                  </span>
                </label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    step={FEATURE_BOUNDS.PetalLengthCm.step}
                    min={FEATURE_BOUNDS.PetalLengthCm.min}
                    max={FEATURE_BOUNDS.PetalLengthCm.max}
                    value={features.PetalLengthCm}
                    onChange={(e) => handleValueChange('PetalLengthCm', e.target.value)}
                    className="w-16 px-2 py-1 bg-black/60 border border-white/15 rounded-lg text-right font-mono-code text-sm font-bold text-emerald-300 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                  <span className="text-xs text-slate-500 font-mono-code">cm</span>
                </div>
              </div>

              <input
                type="range"
                step={FEATURE_BOUNDS.PetalLengthCm.step}
                min={FEATURE_BOUNDS.PetalLengthCm.min}
                max={FEATURE_BOUNDS.PetalLengthCm.max}
                value={features.PetalLengthCm}
                onChange={(e) => handleValueChange('PetalLengthCm', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono-code">
                <span>Setosa: &lt;2.0 cm</span>
                <span>Versicolor: ~4.2 cm</span>
                <span>Virginica: &gt;5.0 cm</span>
              </div>
              {validationErrors.PetalLengthCm && (
                <p className="text-[11px] text-rose-400">{validationErrors.PetalLengthCm}</p>
              )}
            </div>

            {/* 4. Petal Width (Highest Importance) */}
            <div className="space-y-2.5 bg-black/30 p-4 rounded-2xl border border-white/6 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>Petal Width (cm)</span>
                  <span className="text-[9px] uppercase font-mono-code px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                    Rank #1
                  </span>
                </label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    step={FEATURE_BOUNDS.PetalWidthCm.step}
                    min={FEATURE_BOUNDS.PetalWidthCm.min}
                    max={FEATURE_BOUNDS.PetalWidthCm.max}
                    value={features.PetalWidthCm}
                    onChange={(e) => handleValueChange('PetalWidthCm', e.target.value)}
                    className="w-16 px-2 py-1 bg-black/60 border border-white/15 rounded-lg text-right font-mono-code text-sm font-bold text-purple-300 focus:outline-none focus:border-purple-400 transition-colors"
                  />
                  <span className="text-xs text-slate-500 font-mono-code">cm</span>
                </div>
              </div>

              <input
                type="range"
                step={FEATURE_BOUNDS.PetalWidthCm.step}
                min={FEATURE_BOUNDS.PetalWidthCm.min}
                max={FEATURE_BOUNDS.PetalWidthCm.max}
                value={features.PetalWidthCm}
                onChange={(e) => handleValueChange('PetalWidthCm', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono-code">
                <span>Setosa: &lt;0.6 cm</span>
                <span>Versicolor: 1.0-1.8 cm</span>
                <span>Virginica: &gt;1.8 cm</span>
              </div>
              {validationErrors.PetalWidthCm && (
                <p className="text-[11px] text-rose-400">{validationErrors.PetalWidthCm}</p>
              )}
            </div>

          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs sm:text-sm flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block text-white">Backend Connection Notice:</span>
                <p>{error}</p>
                <p className="text-[11px] text-rose-300 pt-1">
                  Local ML inference engine has handled your prediction seamlessly. You can start the FastAPI backend by running{' '}
                  <code className="bg-black/50 px-1 py-0.5 rounded text-amber-300 font-mono">uvicorn main:app --reload</code>.
                </p>
              </div>
            </div>
          )}

          {/* Action Row: Prominent "Predict Species" Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-4">
            <div className="text-xs text-slate-400 font-mono-code flex items-center space-x-2">
              <span className="text-slate-500">Payload:</span>
              <span className="text-slate-300">
                [{features.SepalLengthCm}, {features.SepalWidthCm}, {features.PetalLengthCm}, {features.PetalWidthCm}]
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto min-w-[220px] inline-flex items-center justify-center space-x-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-950 font-bold text-sm tracking-wide uppercase shadow-[0_0_35px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                  <span>Classifying Iris...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
                  <span>Predict Species</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
