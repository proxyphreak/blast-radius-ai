import type { ArchitecturePreset } from '../types';
import { 
  Radar, 
  Sparkles, 
  UploadCloud, 
  Key, 
  FileDown, 
  Cpu, 
  ChevronDown, 
  ShieldCheck, 
  ShoppingCart, 
  Bot,
  Flame
} from 'lucide-react';

interface HeaderProps {
  presets: ArchitecturePreset[];
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
  onOpenUpload: () => void;
  onOpenApiKey: () => void;
  onExportReport: () => void;
  hasApiKey: boolean;
  isSimulated: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  presets,
  activePresetId,
  onSelectPreset,
  onOpenUpload,
  onOpenApiKey,
  onExportReport,
  hasApiKey,
  isSimulated
}) => {
  const activePreset = presets.find((p) => p.id === activePresetId) || presets[0];

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingCart':
        return <ShoppingCart className="w-4 h-4 text-emerald-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-indigo-400" />;
      case 'Bot':
        return <Bot className="w-4 h-4 text-cyan-400" />;
      default:
        return <Cpu className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between z-20 sticky top-0">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="relative p-2 rounded-xl bg-gradient-to-br from-red-500/20 via-indigo-500/20 to-cyan-500/20 border border-slate-700/80 shadow-md shadow-red-500/10">
            <Radar className="w-5 h-5 text-red-400 animate-spin-slow" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                BlastRadius<span className="text-red-500 font-extrabold">.AI</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/60 flex items-center gap-1">
                <Flame className="w-2.5 h-2.5" /> Ripple Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Visual Code Change & Impact Analysis for Mission-Critical Engineering
            </p>
          </div>
        </div>

        {/* Hackathon Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Ace Builders Hackathon '26</span>
        </div>
      </div>

      {/* Preset Switcher & Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Presets Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-200 transition">
            {getPresetIcon(activePreset.icon)}
            <span className="font-medium max-w-[140px] truncate">{activePreset.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform" />
          </button>

          <div className="absolute right-0 top-full mt-1.5 w-64 rounded-xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl p-1.5 hidden group-hover:block z-50">
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Select Architecture Preset
            </div>
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset.id)}
                className={`w-full text-left p-2 rounded-lg flex items-start gap-2.5 transition text-xs ${
                  preset.id === activePresetId
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <div className="mt-0.5">{getPresetIcon(preset.icon)}</div>
                <div>
                  <div className="font-semibold">{preset.name}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{preset.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Custom Code */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-indigo-500/60 text-xs text-slate-200 transition hover:bg-slate-800"
          title="Upload or paste custom codebase"
        >
          <UploadCloud className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden md:inline">Custom Code</span>
        </button>

        {/* Gemini API Key Status */}
        <button
          onClick={onOpenApiKey}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition ${
            hasApiKey
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/40'
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
          title="Configure Gemini API or Local Engine"
        >
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">
            {hasApiKey ? 'Gemini 2.0 Active' : 'Local AI Active'}
          </span>
        </button>

        {/* Export Report */}
        {isSimulated && (
          <button
            onClick={onExportReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/30 transition"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        )}
      </div>
    </header>
  );
};
