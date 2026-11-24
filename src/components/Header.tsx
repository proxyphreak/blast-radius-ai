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
  Flame,
  Box
} from 'lucide-react';

interface HeaderProps {
  presets: ArchitecturePreset[];
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
  onOpenUpload: () => void;
  onOpenApiKey: () => void;
  onExportReport: () => void;
  onToggle3D: () => void;
  is3DActive: boolean;
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
  onToggle3D,
  is3DActive: _is3DActive,
  hasApiKey: _hasApiKey,
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
                <Flame className="w-2.5 h-2.5" /> 3D Ripple Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Visual Code Change & Impact Analysis for Mission-Critical Engineering
            </p>
          </div>
        </div>

        {/* Codebenders Hackathon Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-700/60 text-[11px] text-indigo-300 font-semibold shadow-sm shadow-indigo-500/10">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Codebenders ACE Builders '26</span>
        </div>
      </div>

      {/* Preset Switcher & Action Buttons */}
      <div className="flex items-center gap-2.5">
        {/* 3D Hologram Toggle Button */}
        <button
          onClick={onToggle3D}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950/80 to-indigo-950/80 border border-cyan-500/60 hover:border-cyan-400 text-xs text-cyan-300 font-semibold transition shadow-sm shadow-cyan-500/20"
          title="Toggle 3D Holographic Matrix View"
        >
          <Box className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
          <span className="hidden sm:inline">3D Matrix View</span>
        </button>

        {/* Presets Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-200 transition">
            {getPresetIcon(activePreset.icon)}
            <span className="font-medium max-w-[130px] truncate">{activePreset.name}</span>
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

        {/* Codebenders Nexen AI Status */}
        <button
          onClick={onOpenApiKey}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-500/50 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/40 text-xs transition"
          title="Configure Codebenders Nexen AI & Reasoning Engine"
        >
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">
            Nexen AI
          </span>
        </button>

        {/* Export Report */}
        {isSimulated && (
          <button
            onClick={onExportReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/30 transition"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        )}
      </div>
    </header>
  );
};
