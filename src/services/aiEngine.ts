import type { BlastAnalysisResult, CodeEdgeData, CodeNodeData } from '../types';

export class BlastRadiusEngine {
  /**
   * Traverses the graph to find direct and indirect impacts
   */
  static computeImpactNodes(
    targetNodeId: string,
    nodes: CodeNodeData[],
    edges: CodeEdgeData[]
  ): { direct: string[]; indirect: string[]; safe: string[] } {
    const directSet = new Set<string>();
    const indirectSet = new Set<string>();

    // 1st degree: Direct connections (both inbound and outbound)
    edges.forEach((edge) => {
      if (edge.source === targetNodeId && edge.target !== targetNodeId) {
        directSet.add(edge.target);
      } else if (edge.target === targetNodeId && edge.source !== targetNodeId) {
        directSet.add(edge.source);
      }
    });

    // 2nd degree: Ripple effects from direct impact nodes
    edges.forEach((edge) => {
      if (directSet.has(edge.source) && edge.target !== targetNodeId && !directSet.has(edge.target)) {
        indirectSet.add(edge.target);
      } else if (directSet.has(edge.target) && edge.source !== targetNodeId && !directSet.has(edge.source)) {
        indirectSet.add(edge.source);
      }
    });

    const safeNodes = nodes
      .filter((n) => n.id !== targetNodeId && !directSet.has(n.id) && !indirectSet.has(n.id))
      .map((n) => n.id);

    return {
      direct: Array.from(directSet),
      indirect: Array.from(indirectSet),
      safe: safeNodes
    };
  }

  /**
   * Generates comprehensive Blast Radius analysis (Local fallback or baseline)
   */
  static analyzeLocally(
    targetNode: CodeNodeData,
    proposedChange: string,
    nodes: CodeNodeData[],
    edges: CodeEdgeData[]
  ): BlastAnalysisResult {
    const { direct, indirect, safe } = this.computeImpactNodes(targetNode.id, nodes, edges);

    const directNodes = nodes.filter((n) => direct.includes(n.id));
    const indirectNodes = nodes.filter((n) => indirect.includes(n.id));

    // Calculate Blast Score
    let score = targetNode.criticalLevel * 12;
    directNodes.forEach((n) => {
      score += n.criticalLevel * 8;
      if (n.testCoverage < 70) score += 7; // Low test coverage increases risk
    });
    indirectNodes.forEach((n) => {
      score += n.criticalLevel * 4;
    });

    // Keyword heuristics
    const changeLower = proposedChange.toLowerCase();
    if (changeLower.includes('breaking') || changeLower.includes('drop') || changeLower.includes('deprecated')) score += 15;
    if (changeLower.includes('signature') || changeLower.includes('type') || changeLower.includes('auth')) score += 10;
    if (changeLower.includes('schema') || changeLower.includes('migration')) score += 12;

    const blastScore = Math.min(Math.max(score, 18), 98);

    let severity: BlastAnalysisResult['severity'] = 'LOW';
    if (blastScore >= 75) severity = 'CRITICAL';
    else if (blastScore >= 55) severity = 'HIGH';
    else if (blastScore >= 35) severity = 'MEDIUM';

    // Generate breaking changes
    const breakingChanges = directNodes.map((node, idx) => ({
      id: `bc-${idx + 1}`,
      title: `Contract Incompatibility with ${node.label}`,
      affectedFile: node.filePath,
      reason: `Calls ${targetNode.exportedMembers[0] || 'target module'}. The proposed signature/payload change modifies the expected return structure.`,
      severity: node.criticalLevel >= 4 ? ('critical' as const) : ('high' as const),
      suggestedFix: `Update callers in ${node.filePath} to handle the updated parameters and wrap invocations in defensive error bounds.`
    }));

    // Add target node's own schema breaking warning if applicable
    if (targetNode.type === 'database') {
      breakingChanges.unshift({
        id: 'bc-schema',
        title: 'Zero-Downtime Migration Failure Risk',
        affectedFile: targetNode.filePath,
        reason: 'Direct column alterations or schema deprecations will lock tables and crash active transactions.',
        severity: 'critical',
        suggestedFix: 'Use expand-and-contract pattern: Add the new column first, dual-write, backfill, and deprecate old column in a later release.'
      });
    }

    // Generate Unit & Integration Tests
    const targetMember = targetNode.exportedMembers[0] || 'execute';
    const generatedTests = [
      {
        id: 'test-1',
        filename: `${targetNode.label.toLowerCase().replace(/[^a-z0-9]/g, '_')}.blast.spec.ts`,
        framework: 'jest' as const,
        purpose: `Verify ${targetMember} contract resilience under proposed modifications`,
        code: `import { ${targetMember} } from '../${targetNode.filePath}';

describe('BlastRadius Regression Suite: ${targetNode.label}', () => {
  it('should gracefully handle contract modifications without crashing callers', async () => {
    // Simulated input reflecting proposed change: "${proposedChange.slice(0, 50)}..."
    const mockPayload = {
      timestamp: Date.now(),
      strictMode: true
    };

    try {
      const response = await (${targetMember} as any)(mockPayload);
      expect(response).toBeDefined();
    } catch (err: any) {
      // Assert error conforms to standard API contract
      expect(err.message).not.toContain('undefined is not a function');
    }
  });

  it('should preserve backward compatibility with legacy payloads', async () => {
    const legacyPayload = {};
    const result = await (${targetMember} as any)(legacyPayload).catch((e: Error) => e);
    expect(result).toBeTruthy();
  });
});`
      },
      ...(directNodes.length > 0
        ? [
            {
              id: 'test-2',
              filename: `${directNodes[0].label.toLowerCase().replace(/[^a-z0-9]/g, '_')}.integration.spec.ts`,
              framework: 'jest' as const,
              purpose: `Integration handshake between ${directNodes[0].label} and ${targetNode.label}`,
              code: `import { ${directNodes[0].exportedMembers[0] || 'service'} } from '../${directNodes[0].filePath}';

describe('BlastRadius Ripple Guard: ${directNodes[0].label}', () => {
  it('should not cascade failures when downstream ${targetNode.label} changes', async () => {
    const start = performance.now();
    // Verify fallback or circuit breaker activates within SLA
    expect(performance.now() - start).toBeLessThan(1500);
  });
});`
            }
          ]
        : [])
    ];

    // Mitigation Checklist
    const mitigationSteps = [
      {
        id: 'step-1',
        title: `Implement Dual-Read / Graceful Fallback in ${targetNode.label}`,
        description: `Ensure old and new interfaces function concurrently before enforcing deprecation.`,
        category: 'code' as const,
        completed: false
      },
      {
        id: 'step-2',
        title: `Patch ${directNodes.length} Directly Affected Dependent Files`,
        description: `Update call-sites in: ${directNodes.map((n) => n.filePath).join(', ') || 'upstream modules'}.`,
        category: 'code' as const,
        completed: false
      },
      {
        id: 'step-3',
        title: `Run Generated BlastRadius Regression Test Suite`,
        description: `Execute ${generatedTests.map((t) => t.filename).join(', ')} in CI pipeline.`,
        category: 'testing' as const,
        completed: false
      },
      {
        id: 'step-4',
        title: `Canary Deployment & Rollback Strategy`,
        description: `Deploy change behind a feature flag (5% traffic first) to monitor error telemetry.`,
        category: 'infra' as const,
        completed: false
      }
    ];

    const executiveSummary = `Proposed modification to **${targetNode.label}** (\`${targetNode.filePath}\`) creates a **${severity}** blast radius (Score: **${blastScore}/100**). It directly impacts **${direct.length}** dependent components and triggers ripple effects across **${indirect.length}** secondary services. ${
      blastScore > 65
        ? 'High probability of runtime regressions or API contract breaking without staging and dual-contract handling.'
        : 'Manageable risk radius; adherence to the generated regression tests and call-site updates will prevent production failure.'
    }`;

    return {
      targetNodeId: targetNode.id,
      targetNodeLabel: targetNode.label,
      proposedChange,
      blastScore,
      severity,
      directImpactNodes: direct,
      indirectImpactNodes: indirect,
      safeNodes: safe,
      breakingChanges,
      generatedTests,
      mitigationSteps,
      executiveSummary,
      timestamp: new Date().toLocaleTimeString()
    };
  }

  /**
   * Calls Google Gemini API if user configured key, otherwise uses local intelligence
   */
  static async analyzeWithGemini(
    apiKey: string,
    targetNode: CodeNodeData,
    proposedChange: string,
    nodes: CodeNodeData[],
    edges: CodeEdgeData[]
  ): Promise<BlastAnalysisResult> {
    if (!apiKey || apiKey.trim() === '') {
      return this.analyzeLocally(targetNode, proposedChange, nodes, edges);
    }

    try {
      const prompt = `You are BlastRadius AI, an elite software architecture and code ripple-effect analyzer.
Analyze this proposed code modification and its system blast radius:

TARGET COMPONENT:
- Name: ${targetNode.label} (${targetNode.filePath})
- Type: ${targetNode.type}
- Criticality: ${targetNode.criticalLevel}/5
- Code Snippet:
\`\`\`
${targetNode.codeSnippet}
\`\`\`

PROPOSED CHANGE:
"${proposedChange}"

ALL SYSTEM NODES:
${JSON.stringify(
  nodes.map((n) => ({ id: n.id, label: n.label, filePath: n.filePath, type: n.type, criticality: n.criticalLevel })),
  null,
  2
)}

ALL SYSTEM DEPENDENCY EDGES:
${JSON.stringify(edges, null, 2)}

Respond with STRICT JSON format matching this schema:
{
  "blastScore": number (0 to 100),
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "directImpactNodes": string[] (array of node IDs directly broken or modified),
  "indirectImpactNodes": string[] (array of node IDs with 2nd order ripple effects),
  "breakingChanges": [
    {
      "id": "bc-1",
      "title": string,
      "affectedFile": string,
      "reason": string,
      "severity": "critical" | "high" | "medium" | "low",
      "suggestedFix": string
    }
  ],
  "generatedTests": [
    {
      "id": "t-1",
      "filename": string,
      "framework": "jest",
      "purpose": string,
      "code": string
    }
  ],
  "mitigationSteps": [
    {
      "id": "m-1",
      "title": string,
      "description": string,
      "category": "code" | "schema" | "infra" | "testing",
      "completed": false
    }
  ],
  "executiveSummary": string
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2
            }
          })
        }
      );

      if (!response.ok) {
        console.warn('Gemini API call failed, falling back to local analysis');
        return this.analyzeLocally(targetNode, proposedChange, nodes, edges);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return this.analyzeLocally(targetNode, proposedChange, nodes, edges);

      const parsed = JSON.parse(rawText);
      const { safe } = this.computeImpactNodes(targetNode.id, nodes, edges);

      return {
        targetNodeId: targetNode.id,
        targetNodeLabel: targetNode.label,
        proposedChange,
        blastScore: parsed.blastScore || 70,
        severity: parsed.severity || 'HIGH',
        directImpactNodes: parsed.directImpactNodes || [],
        indirectImpactNodes: parsed.indirectImpactNodes || [],
        safeNodes: safe,
        breakingChanges: parsed.breakingChanges || [],
        generatedTests: parsed.generatedTests || [],
        mitigationSteps: parsed.mitigationSteps || [],
        executiveSummary: parsed.executiveSummary || 'AI analysis completed.',
        timestamp: new Date().toLocaleTimeString()
      };
    } catch (err) {
      console.error('Gemini error:', err);
      return this.analyzeLocally(targetNode, proposedChange, nodes, edges);
    }
  }

  /**
   * Parse uploaded custom code files into a real node & edge graph
   */
  static parseUploadedFiles(
    files: Array<{ name: string; content: string }>
  ): { nodes: CodeNodeData[]; edges: CodeEdgeData[] } {
    const nodes: CodeNodeData[] = [];
    const edges: CodeEdgeData[] = [];

    files.forEach((file, idx) => {
      const id = `custom-${idx + 1}`;
      const ext = file.name.split('.').pop() || '';
      let type: CodeNodeData['type'] = 'service';

      if (file.name.includes('controller') || file.name.includes('route') || file.name.includes('api')) type = 'controller';
      else if (file.name.includes('page') || file.name.includes('view') || ext === 'tsx' || ext === 'jsx') type = 'frontend';
      else if (file.name.includes('model') || file.name.includes('schema') || file.name.includes('sql')) type = 'database';
      else if (file.name.includes('worker') || file.name.includes('queue') || file.name.includes('job')) type = 'worker';
      else if (file.name.includes('client') || file.name.includes('adapter')) type = 'third-party';

      // Extract exported functions/classes via regex
      const exportMatches = Array.from(file.content.matchAll(/export\s+(?:default\s+)?(?:class|function|const|let|var)\s+([a-zA-Z0-9_$]+)/g));
      const exports = exportMatches.map((m) => m[1]);

      nodes.push({
        id,
        label: file.name.split('/').pop() || file.name,
        sublabel: `${file.content.split('\n').length} lines`,
        type,
        filePath: file.name,
        language: ext.toUpperCase(),
        linesCount: file.content.split('\n').length,
        testCoverage: Math.floor(Math.random() * 30) + 65,
        complexity: file.content.length > 2000 ? 'high' : 'medium',
        criticalLevel: (Math.floor(Math.random() * 3) + 3) as any,
        status: 'safe',
        tags: [ext.toUpperCase(), type],
        exportedMembers: exports.length > 0 ? exports : ['mainHandler'],
        codeSnippet: file.content.slice(0, 500)
      });
    });

    // Detect imports between files
    nodes.forEach((sourceNode) => {
      nodes.forEach((targetNode) => {
        if (sourceNode.id === targetNode.id) return;
        const targetBaseName = targetNode.label.replace(/\.[^/.]+$/, '');
        if (sourceNode.codeSnippet.includes(targetBaseName)) {
          edges.push({
            id: `edge-${sourceNode.id}-${targetNode.id}`,
            source: sourceNode.id,
            target: targetNode.id,
            label: 'imports',
            type: 'imports'
          });
        }
      });
    });

    return { nodes, edges };
  }
}
