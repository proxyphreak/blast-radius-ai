import type { CodeNodeData, CodeEdgeData } from '../types';
import { X, Code2, ArrowRight, ArrowLeft, Target } from 'lucide-react';

interface NodeInspectorModalProps {
  node: CodeNodeData | null;
  edges: CodeEdgeData[];
  allNodes: CodeNodeData[];
  onClose: () => void;
  onSetAsTarget: (nodeId: string) => void;
}

export const NodeInspectorModal: React.FC<NodeInspectorModalProps> = ({
  node,
  edges,
  allNodes,
  onClose,
  onSetAsTarget
}) => {
  if (!node) return null;

  // Find incoming callers
  const inboundEdgeIds = edges.filter((e) => e.target === node.id).map((e) => e.source);
  const inboundNodes = allNodes.filter((n) => inboundEdgeIds.includes(n.id));

  // Find outgoing dependencies
  const outboundEdgeIds = edges.filter((e) => e.source === node.id).map((e) => e.target);
  const outboundNodes = allNodes.filter((n) => outboundEdgeIds.includes(n.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-700/50 text-indigo-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                {node.label}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {node.type}
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">{node.filePath}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Metadata badges */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Lines of Code</span>
              <span className="font-bold text-slate-200">{node.linesCount}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Test Coverage</span>
              <span
                className={`font-bold ${
                  node.testCoverage > 80
                    ? 'text-emerald-400'
                    : node.testCoverage > 60
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {node.testCoverage}%
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Complexity</span>
              <span className="font-bold text-indigo-300 capitalize">{node.complexity}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Criticality</span>
              <span className="font-bold text-amber-400">{'★'.repeat(node.criticalLevel)}</span>
            </div>
          </div>

          {/* Exported Members */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
              Exported Functions & Interfaces:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {node.exportedMembers.map((m, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 font-mono text-xs text-cyan-300"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Code Snippet */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
              Source Code Preview:
            </label>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 overflow-x-auto max-h-48 font-mono text-[11px] text-slate-300 leading-relaxed">
              <pre>{node.codeSnippet}</pre>
            </div>
          </div>

          {/* Dependency Connections */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Inbound Callers */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
                <span>Callers / Inbound ({inboundNodes.length})</span>
              </div>
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {inboundNodes.length > 0 ? (
                  inboundNodes.map((n) => (
                    <div
                      key={n.id}
                      className="text-[11px] p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 truncate"
                    >
                      {n.label}
                    </div>
                  ))
                ) : (
                  <div className="text-[11px] text-slate-500 italic">No incoming callers (Root entrypoint)</div>
                )}
              </div>
            </div>

            {/* Outbound Dependencies */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dependencies / Outbound ({outboundNodes.length})</span>
              </div>
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {outboundNodes.length > 0 ? (
                  outboundNodes.map((n) => (
                    <div
                      key={n.id}
                      className="text-[11px] p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 truncate"
                    >
                      {n.label}
                    </div>
                  ))
                ) : (
                  <div className="text-[11px] text-slate-500 italic">No external dependencies</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/80">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
          >
            Close
          </button>
          <button
            onClick={() => {
              onSetAsTarget(node.id);
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition"
          >
            <Target className="w-4 h-4" />
            <span>Target in Blast Simulator</span>
          </button>
        </div>
      </div>
    </div>
  );
};
