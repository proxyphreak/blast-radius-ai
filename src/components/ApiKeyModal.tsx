import { useState } from 'react';
import { X, Key, ShieldCheck, ExternalLink, Zap, Check } from 'lucide-react';

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
            <div className="p-2 rounded-lg bg-amber-950 border border-amber-700/50 text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">AI Engine Settings</h3>
              <p className="text-xs text-slate-400">Dual-Mode: Gemini 2.0 Flash or Local Intelligence</p>
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
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-indigo-300">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Zero-Setup Guaranteed</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              If left blank, BlastRadius uses its high-precision local AST heuristics engine. No API key is mandatory for the hackathon demo!
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Google Gemini API Key (Optional):
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
            />
            <div className="mt-1.5 flex justify-between items-center text-[11px]">
              <span className="text-slate-500">Stored safely in browser localStorage</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline flex items-center gap-1"
              >
                Get Free Gemini Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Current Mode:</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded ${
                inputKey.trim()
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {inputKey.trim() ? 'Google Gemini 2.0 Flash' : 'High-Speed Local AI Engine'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/80">
          <button
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-red-400 transition"
          >
            Clear Key
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/30 transition"
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
