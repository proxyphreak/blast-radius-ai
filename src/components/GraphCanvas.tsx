import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant
} from '@xyflow/react';
import type {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange
} from '@xyflow/react';
import { ArchitectureNode } from './nodes/ArchitectureNode';
import type { CodeNodeData } from '../types';

const nodeTypes = {
  architectureNode: ArchitectureNode
};

interface GraphCanvasProps {
  nodes: Node<CodeNodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node<CodeNodeData>>;
  onEdgesChange: OnEdgesChange;
  onNodeClick: (node: CodeNodeData) => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick
}) => {
  // Styled edges based on impact level
  const styledEdges = useMemo(() => {
    return edges.map((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);

      const hasDirect =
        sourceNode?.data.status === 'direct-impact' ||
        targetNode?.data.status === 'direct-impact';
      const hasIndirect =
        sourceNode?.data.status === 'indirect-impact' ||
        targetNode?.data.status === 'indirect-impact';

      let stroke = '#475569';
      let strokeWidth = 1.5;
      let animated = false;

      if (hasDirect) {
        stroke = '#ef4444';
        strokeWidth = 2.5;
        animated = true;
      } else if (hasIndirect) {
        stroke = '#f59e0b';
        strokeWidth = 2;
        animated = true;
      }

      return {
        ...edge,
        animated,
        style: {
          stroke,
          strokeWidth,
          transition: 'all 0.5s ease'
        },
        labelStyle: {
          fill: hasDirect ? '#fca5a5' : hasIndirect ? '#fcd34d' : '#94a3b8',
          fontSize: 10,
          fontWeight: 600,
          fontFamily: 'monospace'
        },
        labelBgStyle: {
          fill: '#0f172a',
          fillOpacity: 0.9,
          rx: 4,
          ry: 4
        }
      };
    });
  }, [edges, nodes]);

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] relative bg-[#0b0f19]">
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => onNodeClick(node.data as CodeNodeData)}
        fitView
        minZoom={0.2}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1e293b" />
        <Controls position="bottom-right" className="!m-4" />
        <MiniMap
          nodeColor={(node: any) => {
            if (node.data?.status === 'active-target') return '#06b6d4';
            if (node.data?.status === 'direct-impact') return '#ef4444';
            if (node.data?.status === 'indirect-impact') return '#f59e0b';
            return '#334155';
          }}
          position="bottom-left"
          className="!m-4 !border-slate-800 hidden md:block"
        />
      </ReactFlow>

      {/* Floating Legend */}
      <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md flex flex-wrap items-center gap-3 text-[11px] text-slate-300 z-10 pointer-events-none select-none">
        <span className="font-semibold text-slate-400 uppercase text-[9px] tracking-wider pr-1 border-r border-slate-700">
          Topology Map
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
          <span>Target Component</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500 animate-pulse" />
          <span>Direct Blast (1-Hop)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500" />
          <span>Ripple Risk (2-Hop)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
          <span>Safe Modules</span>
        </div>
      </div>
    </div>
  );
};
