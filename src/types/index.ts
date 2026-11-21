export type NodeType = 
  | 'frontend'
  | 'gateway'
  | 'service'
  | 'controller'
  | 'database'
  | 'worker'
  | 'third-party'
  | 'cache';

export type ImpactStatus = 'safe' | 'active-target' | 'direct-impact' | 'indirect-impact';

export interface CodeNodeData {
  [key: string]: unknown;
  id: string;
  label: string;
  sublabel: string;
  type: NodeType;
  filePath: string;
  language: string;
  linesCount: number;
  testCoverage: number;
  complexity: 'low' | 'medium' | 'high' | 'critical';
  criticalLevel: 1 | 2 | 3 | 4 | 5;
  status: ImpactStatus;
  exportedMembers: string[];
  codeSnippet: string;
  tags: string[];
}

export interface CodeEdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  impactLevel?: 'none' | 'direct' | 'indirect';
  type?: 'calls' | 'imports' | 'reads_from' | 'writes_to' | 'triggers';
}

export interface BreakingChange {
  id: string;
  title: string;
  affectedFile: string;
  reason: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  suggestedFix: string;
}

export interface GeneratedTest {
  id: string;
  filename: string;
  framework: 'jest' | 'playwright' | 'pytest';
  purpose: string;
  code: string;
}

export interface MitigationStep {
  id: string;
  title: string;
  description: string;
  category: 'code' | 'schema' | 'infra' | 'testing';
  completed: boolean;
}

export interface BlastAnalysisResult {
  targetNodeId: string;
  targetNodeLabel: string;
  proposedChange: string;
  blastScore: number; // 0 - 100
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  directImpactNodes: string[];
  indirectImpactNodes: string[];
  safeNodes: string[];
  breakingChanges: BreakingChange[];
  generatedTests: GeneratedTest[];
  mitigationSteps: MitigationStep[];
  executiveSummary: string;
  timestamp: string;
}

export interface ArchitecturePreset {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  nodes: Array<{
    id: string;
    position: { x: number; y: number };
    data: CodeNodeData;
  }>;
  edges: CodeEdgeData[];
  quickScenarios: Array<{
    title: string;
    targetNodeId: string;
    description: string;
    sampleChange: string;
  }>;
}
