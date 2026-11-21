import { useState } from 'react';
import { X, ShieldCheck, ExternalLink, Check, Sparkles } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [selectedEngine, setSelectedEngine] = useState<'codebenders' | 'gemini' | 'local'>('codebenders');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setInputKey('');
    onSaveApiKey('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-700/50 text-indigo-400">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">AI Intelligence Core</h3>
              <p className="text-xs text-slate-400">Powered by Codebenders Nexen AI & ACE Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Codebenders Highlight Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/50 border border-indigo-700/50 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-bold text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Codebenders Nexen AI</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-900/80 text-indigo-300 border border-indigo-600/50 font-semibold">
                8M Token Pool Active
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Native ambient engineering engine for zero-downtime architecture modernization and automated blast radius reasoning.
            </p>
          </div>

          {/* Engine Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Active Reasoning Engine:
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedEngine('codebenders')}
                className={`p-2.5 rounded-xl border text-center transition ${
                  selectedEngine === 'codebenders'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <span className="block text-[11px]">Codebenders</span>
                <span className="text-[9px] text-indigo-400">Nexen AI</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedEngine('gemini')}
                className={`p-2.5 rounded-xl border text-center transition ${
                  selectedEngine === 'gemini'
                    ? 'bg-amber-600/20 border-amber-500 text-amber-200 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <span className="block text-[11px]">Gemini 2.0</span>
                <span className="text-[9px] text-amber-400">Flash</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedEngine('local')}
                className={`p-2.5 rounded-xl border text-center transition ${
                  selectedEngine === 'local'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <span className="block text-[11px]">Offline AST</span>
                <span className="text-[9px] text-emerald-400">Zero-Latency</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {selectedEngine === 'codebenders' ? 'Codebenders API Config / Token (Optional):' : 'API Key (Optional):'}
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder={selectedEngine === 'codebenders' ? 'cb_live_token_...' : 'AIzaSy...'}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
            />
            <div className="mt-1.5 flex justify-between items-center text-[11px]">
              <span className="text-slate-500">Connected to Codebenders Workspace</span>
              <a
                href="https://app.codebenders.ai/app"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline flex items-center gap-1"
              >
                Codebenders IDE <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/80">
          <button
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-red-400 transition"
          >
            Reset Default
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" /> Saved!
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" /> Save Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
