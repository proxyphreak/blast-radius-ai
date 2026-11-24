import { useState, useCallback } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import { ARCHITECTURE_PRESETS } from './data/presets';
import type { 
  ArchitecturePreset, 
  CodeNodeData, 
  CodeEdgeData, 
  BlastAnalysisResult 
} from './types';
import { BlastRadiusEngine } from './services/aiEngine';
import { Header } from './components/Header';
import { GraphCanvas } from './components/GraphCanvas';
import { BlastSidebar } from './components/BlastSidebar';
import { NodeInspectorModal } from './components/NodeInspectorModal';
import { CodeIngestionModal } from './components/CodeIngestionModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ExportReportModal } from './components/ExportReportModal';
import { Hologram3DCanvas } from './components/Hologram3DCanvas';
import confetti from 'canvas-confetti';

export function App() {
  const [activePresetId, setActivePresetId] = useState<string>('ecommerce-engine');
  const [activePreset, setActivePreset] = useState<ArchitecturePreset>(ARCHITECTURE_PRESETS[0]);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('blast_gemini_api_key') || '');

  // Selection & Simulation state
  const [selectedTargetId, setSelectedTargetId] = useState<string>('node-stripe');
  const [proposedChange, setProposedChange] = useState<string>(
    ARCHITECTURE_PRESETS[0].quickScenarios[0]?.sampleChange || ''
  );
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [result, setResult] = useState<BlastAnalysisResult | null>(null);

  // 3D Matrix & Modals state
  const [is3DFullOpen, setIs3DFullOpen] = useState<boolean>(false);
  const [inspectedNode, setInspectedNode] = useState<CodeNodeData | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // Helper to format preset into React Flow nodes
  const createFlowNodes = useCallback((preset: ArchitecturePreset): Node<CodeNodeData>[] => {
    return preset.nodes.map((n) => ({
      id: n.id,
      position: n.position,
      type: 'architectureNode',
      data: { ...n.data, status: 'safe' }
    }));
  }, []);

  const createFlowEdges = useCallback((preset: ArchitecturePreset): Edge[] => {
    return preset.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      type: 'default'
    }));
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CodeNodeData>>(
    createFlowNodes(ARCHITECTURE_PRESETS[0])
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    createFlowEdges(ARCHITECTURE_PRESETS[0])
  );

  // Handle Preset Switching
  const handleSelectPreset = (presetId: string) => {
    const preset = ARCHITECTURE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setActivePresetId(presetId);
    setActivePreset(preset);
    setNodes(createFlowNodes(preset));
    setEdges(createFlowEdges(preset));
    setResult(null);

    const defaultScenario = preset.quickScenarios[0];
    if (defaultScenario) {
      setSelectedTargetId(defaultScenario.targetNodeId);
      setProposedChange(defaultScenario.sampleChange);
    } else if (preset.nodes[0]) {
      setSelectedTargetId(preset.nodes[0].id);
      setProposedChange('');
    }
  };

  // Run Blast Radius Simulation
  const handleSimulate = async () => {
    const targetNode = nodes.find((n) => n.id === selectedTargetId)?.data;
    if (!targetNode) return;

    setIsSimulating(true);

    const allNodeData = nodes.map((n) => n.data);
    const allEdgeData = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label as string
    }));

    try {
      const analysisResult = await BlastRadiusEngine.analyzeWithGemini(
        apiKey,
        targetNode,
        proposedChange || 'Generic refactoring of function signatures and parameters.',
        allNodeData,
        allEdgeData
      );

      setResult(analysisResult);

      // Update Node Statuses on Graph
      setNodes((prevNodes) =>
        prevNodes.map((n) => {
          let status: CodeNodeData['status'] = 'safe';
          if (n.id === selectedTargetId) {
            status = 'active-target';
          } else if (analysisResult.directImpactNodes.includes(n.id)) {
            status = 'direct-impact';
          } else if (analysisResult.indirectImpactNodes.includes(n.id)) {
            status = 'indirect-impact';
          }
          return {
            ...n,
            data: { ...n.data, status }
          };
        })
      );

      confetti({
        particleCount: 70,
        spread: 90,
        origin: { y: 0.5 }
      });
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Reset Simulation
  const handleResetSimulation = () => {
    setResult(null);
    setNodes((prevNodes) =>
      prevNodes.map((n) => ({
        ...n,
        data: { ...n.data, status: 'safe' }
      }))
    );
  };

  // Apply custom ingested codebase
  const handleApplyCustomGraph = (customNodes: CodeNodeData[], customEdges: CodeEdgeData[]) => {
    // Layout nodes in a neat staggered grid
    const flowNodes: Node<CodeNodeData>[] = customNodes.map((n, idx) => ({
      id: n.id,
      type: 'architectureNode',
      position: {
        x: 60 + (idx % 3) * 320,
        y: 80 + Math.floor(idx / 3) * 180
      },
      data: n
    }));

    const flowEdges: Edge[] = customEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      type: 'default'
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
    setResult(null);

    if (customNodes[0]) {
      setSelectedTargetId(customNodes[0].id);
      setProposedChange(`Refactor ${customNodes[0].label} and modify exports.`);
    }

    setActivePreset({
      id: 'custom',
      name: 'Custom Ingested Codebase',
      description: 'Extracted from user source files via AST regex parser.',
      category: 'Custom Project',
      icon: 'UploadCloud',
      nodes: flowNodes as any,
      edges: customEdges,
      quickScenarios: []
    });
    setActivePresetId('custom');
  };

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    localStorage.setItem('blast_gemini_api_key', newKey);
  };

  const currentNodesData = nodes.map((n) => n.data);
  const currentEdgesData = edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target
  }));

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-red-500/30 selection:text-white relative overflow-hidden">
      {/* Top Navbar */}
      <Header
        presets={ARCHITECTURE_PRESETS}
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenApiKey={() => setIsApiKeyOpen(true)}
        onExportReport={() => setIsReportOpen(true)}
        onToggle3D={() => setIs3DFullOpen(true)}
        is3DActive={is3DFullOpen}
        hasApiKey={Boolean(apiKey && apiKey.trim())}
        isSimulated={Boolean(result)}
      />

      {/* Main Graph & Sidebar Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* Ambient 3D Holographic Particle Matrix in Canvas Background */}
        <Hologram3DCanvas
          mode="ambient"
          isSimulated={Boolean(result)}
          severity={result?.severity || null}
        />

        {/* Interactive React Flow Architecture Graph Canvas */}
        <GraphCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(nodeData) => setInspectedNode(nodeData)}
        />

        {/* Control Cockpit & Blast Radius Dashboard */}
        <BlastSidebar
          nodes={currentNodesData}
          selectedTargetId={selectedTargetId}
          onSelectTarget={(id) => setSelectedTargetId(id)}
          proposedChange={proposedChange}
          onChangeProposedText={(text) => setProposedChange(text)}
          onSimulate={handleSimulate}
          onResetSimulation={handleResetSimulation}
          isSimulating={isSimulating}
          result={result}
          activePreset={activePreset}
        />
      </main>

      {/* Full 3D Holographic Matrix HUD View */}
      {is3DFullOpen && (
        <Hologram3DCanvas
          mode="full"
          isSimulated={Boolean(result)}
          severity={result?.severity || null}
          onCloseFull={() => setIs3DFullOpen(false)}
        />
      )}

      {/* Modals */}
      <NodeInspectorModal
        node={inspectedNode}
        edges={currentEdgesData}
        allNodes={currentNodesData}
        onClose={() => setInspectedNode(null)}
        onSetAsTarget={(nodeId) => {
          setSelectedTargetId(nodeId);
        }}
      />

      <CodeIngestionModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onApplyCustomGraph={handleApplyCustomGraph}
      />

      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      <ExportReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        result={result}
      />
    </div>
  );
}

export default App;
