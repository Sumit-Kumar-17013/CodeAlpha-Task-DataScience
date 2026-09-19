import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Terminal, 
  Server, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  Sliders,
  Code2
} from 'lucide-react';
import { getApiUrl, setApiUrl, resetApiUrl, checkBackendHealth } from '../utils/apiService';
import { DEFAULT_API_URL } from '../config';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUrlUpdated: (newUrl: string) => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({
  isOpen,
  onClose,
  onUrlUpdated
}) => {
  const [currentUrl, setCurrentUrl] = useState(getApiUrl());
  const [inputUrl, setInputUrl] = useState(getApiUrl());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [pingStatus, setPingStatus] = useState<{ isChecking: boolean; result?: string; success?: boolean }>({
    isChecking: false
  });

  useEffect(() => {
    if (isOpen) {
      const active = getApiUrl();
      setCurrentUrl(active);
      setInputUrl(active);
      runHealthCheck(active);
    }
  }, [isOpen]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const runHealthCheck = async (urlToCheck?: string) => {
    setPingStatus({ isChecking: true });
    const target = urlToCheck || inputUrl;
    const res = await checkBackendHealth(target);
    setPingStatus({
      isChecking: false,
      result: res.message,
      success: res.isOnline
    });
  };

  const handleSaveUrl = () => {
    setApiUrl(inputUrl);
    setCurrentUrl(inputUrl);
    onUrlUpdated(inputUrl);
    runHealthCheck(inputUrl);
  };

  const handleReset = () => {
    resetApiUrl();
    setInputUrl(DEFAULT_API_URL);
    setCurrentUrl(DEFAULT_API_URL);
    onUrlUpdated(DEFAULT_API_URL);
    runHealthCheck(DEFAULT_API_URL);
  };

  if (!isOpen) return null;

  const sampleCurl = `curl -X POST "${currentUrl}/predict" \\
  -H "Content-Type: application/json" \\
  -d '{
    "SepalLengthCm": 5.1,
    "SepalWidthCm": 3.5,
    "PetalLengthCm": 1.4,
    "PetalWidthCm": 0.2
  }'`;

  const installCmd = `pip install fastapi uvicorn scikit-learn pydantic numpy joblib`;
  const runCmd = `uvicorn main:app --reload --host 127.0.0.1 --port 8000`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#080c14] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Terminal className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                FastAPI Backend Hub & Documentation
              </h3>
              <p className="text-xs text-slate-400">
                Connection settings, live endpoint diagnostics, and setup instructions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          
          {/* 1. API URL Configuration */}
          <div className="bg-black/40 p-5 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono-code flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Configure API Base URL</span>
              </label>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-slate-400 hover:text-amber-300 font-mono-code transition-colors"
              >
                Reset to Default
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="http://127.0.0.1:8000"
                className="flex-1 px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl font-mono-code text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleSaveUrl}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wide transition-all"
              >
                Save URL
              </button>
              <button
                type="button"
                onClick={() => runHealthCheck()}
                disabled={pingStatus.isChecking}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-mono-code text-slate-200 flex items-center justify-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${pingStatus.isChecking ? 'animate-spin' : ''}`} />
                <span>Test Ping</span>
              </button>
            </div>

            {/* Health Result */}
            {pingStatus.result && (
              <div className={`p-3 rounded-xl text-xs font-mono-code flex items-center space-x-2 ${
                pingStatus.success 
                  ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-950/40 border border-amber-500/30 text-amber-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${pingStatus.success ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span>{pingStatus.result}</span>
              </div>
            )}
            
            <p className="text-[11px] text-slate-400">
              Where to change code-side: In <code className="text-amber-300 font-mono">src/config.ts</code>, modify the <code className="text-amber-300 font-mono">DEFAULT_API_URL</code> constant.
            </p>
          </div>

          {/* 2. How to Start FastAPI Backend */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono-code flex items-center space-x-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>How To Run Your FastAPI Backend</span>
            </h4>

            {/* Step 1 */}
            <div className="bg-black/30 p-4 rounded-2xl border border-white/6 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono-code">
                <span>Step 1: Install Python dependencies</span>
                <button
                  onClick={() => copyToClipboard(installCmd, 'install')}
                  className="text-slate-400 hover:text-white flex items-center space-x-1"
                >
                  {copiedKey === 'install' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'install' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 bg-black/70 rounded-xl font-mono-code text-xs text-emerald-300 overflow-x-auto">
                {installCmd}
              </pre>
            </div>

            {/* Step 2 */}
            <div className="bg-black/30 p-4 rounded-2xl border border-white/6 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono-code">
                <span>Step 2: Start server with Uvicorn</span>
                <button
                  onClick={() => copyToClipboard(runCmd, 'run')}
                  className="text-slate-400 hover:text-white flex items-center space-x-1"
                >
                  {copiedKey === 'run' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'run' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 bg-black/70 rounded-xl font-mono-code text-xs text-emerald-300 overflow-x-auto">
                {runCmd}
              </pre>
            </div>
          </div>

          {/* 3. Sample cURL Request */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono-code text-slate-300">
              <span className="font-semibold uppercase tracking-wider">Example cURL POST Command</span>
              <button
                onClick={() => copyToClipboard(sampleCurl, 'curl')}
                className="text-slate-400 hover:text-white flex items-center space-x-1"
              >
                {copiedKey === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'curl' ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>
            <pre className="p-3.5 bg-black/70 rounded-2xl border border-white/8 font-mono-code text-xs text-sky-300 overflow-x-auto">
              {sampleCurl}
            </pre>
          </div>

          {/* 4. CORS Configuration Note */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/8 text-xs text-slate-300 space-y-2">
            <div className="flex items-center space-x-2 text-white font-semibold font-mono-code">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Required CORS Configuration</span>
            </div>
            <p>
              In <code className="text-amber-300 font-mono">main.py</code>, ensure <code className="text-amber-300 font-mono">CORSMiddleware</code> is attached with <code className="text-amber-300 font-mono">allow_origins=["*"]</code> to permit cross-origin requests from the browser preview.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-white/10 flex items-center justify-between bg-black/40">
          <span className="text-xs font-mono-code text-slate-500">
            OpenAPI Docs: <a href={`${currentUrl}/docs`} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">{currentUrl}/docs</a>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs tracking-wider uppercase transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
