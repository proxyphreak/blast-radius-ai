import { Handle, Position } from '@xyflow/react';
import type { CodeNodeData } from '../../types';
import { 
  Server, 
  Database, 
  Layout, 
  Shield, 
  Cpu, 
  ExternalLink, 
  HardDrive, 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  Flame,
  Code2
} from 'lucide-react';

interface ArchitectureNodeProps {
  data: CodeNodeData & { isSelectedTarget?: boolean };
}

const getNodeIcon = (type: CodeNodeData['type']) => {
  switch (type) {
    case 'frontend':
      return <Layout className="w-4 h-4 text-sky-400" />;
    case 'gateway':
      return <Shield className="w-4 h-4 text-emerald-400" />;
    case 'service':
      return <Server className="w-4 h-4 text-indigo-400" />;
    case 'database':
      return <Database className="w-4 h-4 text-amber-400" />;
    case 'worker':
      return <Cpu className="w-4 h-4 text-purple-400" />;
    case 'cache':
      return <HardDrive className="w-4 h-4 text-rose-400" />;
    case 'third-party':
      return <ExternalLink className="w-4 h-4 text-cyan-400" />;
    default:
      return <Code2 className="w-4 h-4 text-slate-400" />;
  }
};

const getStatusBadge = (status: CodeNodeData['status']) => {
  switch (status) {
    case 'active-target':
      return (
        <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20">
          <Radio className="w-2.5 h-2.5 animate-pulse text-cyan-400" /> Target
        </span>
      );
    case 'direct-impact':
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-red-950/90 text-red-300 border border-red-500/80 shadow-md shadow-red-500/30">
          <Flame className="w-2.5 h-2.5 animate-bounce text-red-400" /> Direct Blast
        </span>
      );
    case 'indirect-impact':
      return (
        <span className="flex items-center gap-1 text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/60 shadow-sm shadow-amber-500/20">
          <AlertTriangle className="w-2.5 h-2.5 text-amber-400" /> Ripple Risk
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1 text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-900/60 text-slate-400 border border-slate-700/60">
          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" /> Safe
        </span>
      );
  }
};

export const ArchitectureNode: React.FC<ArchitectureNodeProps> = ({ data }) => {
  const isDirect = data.status === 'direct-impact';
  const isIndirect = data.status === 'indirect-impact';
  const isTarget = data.status === 'active-target';

  let borderStyle = 'border-slate-800 hover:border-slate-600 bg-slate-900/90';
  let pulseClass = '';

  if (isTarget) {
    borderStyle = 'border-cyan-400 shadow-lg shadow-cyan-500/25 bg-slate-900/95 ring-2 ring-cyan-500/30';
  } else if (isDirect) {
    borderStyle = 'border-red-500 shadow-xl shadow-red-500/30 bg-red-950/30 ring-2 ring-red-500/40';
    pulseClass = 'node-blast-direct';
  } else if (isIndirect) {
    borderStyle = 'border-amber-500 shadow-lg shadow-amber-500/25 bg-amber-950/20 ring-1 ring-amber-500/30';
    pulseClass = 'node-blast-indirect';
  }

  return (
    <div
      className={`relative min-w-[240px] max-w-[270px] rounded-xl border backdrop-blur-md p-3.5 transition-all duration-300 ${borderStyle} ${pulseClass}`}
    >
      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-cyan-400 !border-2 !border-slate-900"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-indigo-400 !border-2 !border-slate-900"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-slate-500 !border-slate-900 opacity-40"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-slate-500 !border-slate-900 opacity-40"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
            {getNodeIcon(data.type)}
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-100 leading-tight truncate max-w-[120px]">
              {data.label}
            </h4>
            <p className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
              {data.sublabel}
            </p>
          </div>
        </div>
        <div>{getStatusBadge(data.status)}</div>
      </div>

      {/* Code Path */}
      <div className="mb-2.5 px-2 py-1 rounded bg-slate-950/60 border border-slate-800/80 font-mono text-[10px] text-slate-400 truncate">
        {data.filePath}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] pt-2 border-t border-slate-800/80">
        <div className="px-1.5 py-1 rounded bg-slate-800/40">
          <span className="text-slate-500 block text-[9px]">Coverage</span>
          <span
            className={`font-semibold ${
              data.testCoverage > 80
                ? 'text-emerald-400'
                : data.testCoverage > 60
                ? 'text-amber-400'
                : 'text-red-400'
            }`}
          >
            {data.testCoverage}%
          </span>
        </div>
        <div className="px-1.5 py-1 rounded bg-slate-800/40">
          <span className="text-slate-500 block text-[9px]">Crit Level</span>
          <span className="font-semibold text-indigo-300">
            {'★'.repeat(data.criticalLevel)}
          </span>
        </div>
        <div className="px-1.5 py-1 rounded bg-slate-800/40">
          <span className="text-slate-500 block text-[9px]">Exports</span>
          <span className="font-semibold text-slate-300">
            {data.exportedMembers?.length || 1}
          </span>
        </div>
      </div>
    </div>
  );
};
