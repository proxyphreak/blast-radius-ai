import { useState } from 'react';
import type { 
  BlastAnalysisResult, 
  CodeNodeData, 
  ArchitecturePreset 
} from '../types';
import { 
  Flame, 
  AlertOctagon, 
  CheckCircle, 
  FileCode2, 
  ListChecks, 
  MessageSquare, 
  Play, 
  RefreshCw, 
  Copy, 
  Check, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BlastSidebarProps {
  nodes: CodeNodeData[];
  selectedTargetId: string;
  onSelectTarget: (id: string) => void;
  proposedChange: string;
  onChangeProposedText: (text: string) => void;
  onSimulate: () => void;
  onResetSimulation: () => void;
  isSimulating: boolean;
  result: BlastAnalysisResult | null;
  activePreset: ArchitecturePreset;
}

export const BlastSidebar: React.FC<BlastSidebarProps> = ({
  nodes,
  selectedTargetId,
  onSelectTarget,
  proposedChange,
  onChangeProposedText,
  onSimulate,
  onResetSimulation,
  isSimulating,
  result,
  activePreset
}) => {
  const [activeTab, setActiveTab] = useState<'breaking' | 'tests' | 'mitigation' | 'chat'>('breaking');
  const [copiedTestId, setCopiedTestId] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Hello! I am your BlastRadius Copilot. Select a target component and simulate a code change to see ripple effects, or ask me questions about this architecture.'
    }
  ]);
  const [inputChat, setInputChat] = useState('');

  const targetNode = nodes.find((n) => n.id === selectedTargetId) || nodes[0];

  const handleCopyTest = (testId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTestId(testId);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    setTimeout(() => setCopiedTestId(null), 2000);
  };

  const handleToggleChecklist = (id: string) => {
    setChecklist((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      // Check if all completed
      if (result && result.mitigationSteps.every((step) => next[step.id])) {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }
      return next;
    });
  };

  const handleSendChat = () => {
    if (!inputChat.trim()) return;
    const userQ = inputChat;
    setInputChat('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userQ }]);

    setTimeout(() => {
      let reply = `Based on the current architecture of **${targetNode?.label}**: `;
      if (userQ.toLowerCase().includes('stripe') || userQ.toLowerCase().includes('payment')) {
        reply += `Payment flows directly pass through \`StripeAdapter\`. Any alteration to currency or tokenization cascades back to \`OrderService\` and breaks the checkout webhook handler.`;
      } else if (userQ.toLowerCase().includes('test') || userQ.toLowerCase().includes('coverage')) {
        reply += `Currently, ${targetNode?.label} has ${targetNode?.testCoverage}% coverage. Generating automated regression suites for inbound callers is strongly advised before PR merge.`;
      } else if (userQ.toLowerCase().includes('database') || userQ.toLowerCase().includes('db') || userQ.toLowerCase().includes('schema')) {
        reply += `Database schema migrations require an expand-contract deployment strategy. Never drop legacy columns synchronously!`;
      } else {
        reply += `A modification in this module affects ${result?.directImpactNodes?.length || 2} direct dependencies. We recommend deploying with canary routing (5% traffic) and monitoring HTTP 5xx error spikes.`;
      }
      setChatMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    }, 450);
  };

  // Severity color helpers
  const getSeverityBadge = (sev: BlastAnalysisResult['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-950/90 text-red-400 border-red-500/80 shadow-red-500/30';
      case 'HIGH':
        return 'bg-rose-950/80 text-rose-300 border-rose-500/60 shadow-rose-500/20';
      case 'MEDIUM':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/60 shadow-amber-500/20';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 shadow-emerald-500/20';
    }
  };

  return (
    <aside className="w-full lg:w-[420px] xl:w-[460px] h-[calc(100vh-4rem)] border-l border-slate-800 bg-slate-950/95 flex flex-col z-10 overflow-hidden">
      {/* Simulation Setup Area */}
      <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Blast Radius Cockpit
            </span>
          </div>
          {result && (
            <button
              onClick={onResetSimulation}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>

        {/* Target Component Selector */}
        <div>
          <label className="text-[11px] font-medium text-slate-400 block mb-1">
            Target Component To Modify:
          </label>
          <select
            value={selectedTargetId}
            onChange={(e) => onSelectTarget(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition font-medium"
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label} ({n.filePath})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Scenario Preset Chips */}
        {activePreset.quickScenarios.length > 0 && (
          <div>
            <span className="text-[10px] font-medium text-slate-500 block mb-1.5">
              Quick Impact Scenarios:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activePreset.quickScenarios.map((sc, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onSelectTarget(sc.targetNodeId);
                    onChangeProposedText(sc.sampleChange);
                  }}
                  className="px-2 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-[10px] text-slate-300 transition text-left"
                >
                  {sc.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Proposed Change Input */}
        <div>
          <label className="text-[11px] font-medium text-slate-400 block mb-1">
            Proposed Code / Interface Modification:
          </label>
          <textarea
            value={proposedChange}
            onChange={(e) => onChangeProposedText(e.target.value)}
            placeholder="e.g. Change StripeAdapter.chargeCard signature to require 3D-secure redirectUrl..."
            rows={2}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-red-500/80 transition resize-none placeholder:text-slate-600 font-mono"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={onSimulate}
          disabled={isSimulating}
          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white shadow-lg shadow-red-600/30 transition-all transform active:scale-[0.98] disabled:opacity-50"
        >
          {isSimulating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Architecture Blast Radius...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Simulate Blast Radius</span>
            </>
          )}
        </button>
      </div>

      {/* Analysis Results Area */}
      {result ? (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Severity & Score Banner */}
          <div className="p-3.5 bg-slate-900/80 border-b border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Blast Severity:</span>
                <span
                  className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full border shadow-sm ${getSeverityBadge(
                    result.severity
                  )}`}
                >
                  {result.severity} RISK
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 mr-1.5">Impact Score:</span>
                <span className="text-base font-extrabold text-white">
                  {result.blastScore}
                  <span className="text-xs text-slate-500">/100</span>
                </span>
              </div>
            </div>

            {/* Score Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2.5">
              <div
                className={`h-full transition-all duration-700 ${
                  result.blastScore > 70
                    ? 'bg-gradient-to-r from-amber-500 to-red-500'
                    : result.blastScore > 40
                    ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${result.blastScore}%` }}
              />
            </div>

            {/* Impact Counts */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="p-1.5 rounded-lg bg-red-950/40 border border-red-900/60 text-red-300">
                <span className="block font-bold text-sm text-red-400">
                  {result.directImpactNodes.length}
                </span>
                Direct Impacts
              </div>
              <div className="p-1.5 rounded-lg bg-amber-950/40 border border-amber-900/60 text-amber-300">
                <span className="block font-bold text-sm text-amber-400">
                  {result.indirectImpactNodes.length}
                </span>
                Ripple Risks
              </div>
              <div className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-emerald-300">
                <span className="block font-bold text-sm text-emerald-400">
                  {result.safeNodes.length}
                </span>
                Safe Modules
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 text-xs bg-slate-950">
            <button
              onClick={() => setActiveTab('breaking')}
              className={`flex-1 py-2 text-center font-medium border-b-2 transition flex items-center justify-center gap-1 ${
                activeTab === 'breaking'
                  ? 'border-red-500 text-red-400 bg-red-950/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Breaking ({result.breakingChanges.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`flex-1 py-2 text-center font-medium border-b-2 transition flex items-center justify-center gap-1 ${
                activeTab === 'tests'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-950/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Tests ({result.generatedTests.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('mitigation')}
              className={`flex-1 py-2 text-center font-medium border-b-2 transition flex items-center justify-center gap-1 ${
                activeTab === 'mitigation'
                  ? 'border-cyan-500 text-cyan-400 bg-cyan-950/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span>PR Checklist</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 text-center font-medium border-b-2 transition flex items-center justify-center gap-1 ${
                activeTab === 'chat'
                  ? 'border-purple-500 text-purple-400 bg-purple-950/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Copilot</span>
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {/* Tab 1: Breaking Changes */}
            {activeTab === 'breaking' && (
              <div className="space-y-3">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Executive Impact
                    Summary
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {result.executiveSummary}
                  </p>
                </div>

                {result.breakingChanges.map((change) => (
                  <div
                    key={change.id}
                    className="p-3 rounded-xl bg-slate-900/90 border border-red-900/40 hover:border-red-500/60 transition space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                        <AlertOctagon className="w-3.5 h-3.5 text-red-400" /> {change.title}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase bg-red-950 text-red-400 border border-red-800">
                        {change.severity}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      File: {change.affectedFile}
                    </div>
                    <p className="text-xs text-slate-300">{change.reason}</p>
                    <div className="p-2 rounded-lg bg-indigo-950/30 border border-indigo-900/50 text-[11px] text-indigo-300">
                      <span className="font-semibold block text-indigo-200">Recommended Fix:</span>
                      {change.suggestedFix}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Auto-Generated Tests */}
            {activeTab === 'tests' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Regression Test Suites</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-indigo-300 font-mono">
                    Jest / TypeScript
                  </span>
                </div>

                {result.generatedTests.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl border border-slate-800 bg-slate-900/95 overflow-hidden"
                  >
                    <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-mono text-xs text-slate-200 font-semibold">
                          {t.filename}
                        </div>
                        <div className="text-[10px] text-slate-400">{t.purpose}</div>
                      </div>
                      <button
                        onClick={() => handleCopyTest(t.id, t.code)}
                        className="px-2.5 py-1 rounded-md bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-[11px] text-indigo-200 flex items-center gap-1 transition"
                      >
                        {copiedTestId === t.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy Suite
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3 text-[10px] font-mono text-slate-300 bg-slate-950 overflow-x-auto max-h-56 leading-relaxed">
                      <code>{t.code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: PR Mitigation Checklist */}
            {activeTab === 'mitigation' && (
              <div className="space-y-3">
                <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200">
                  Verify these critical gates before submitting your Pull Request to eliminate production downtime.
                </div>

                <div className="space-y-2">
                  {result.mitigationSteps.map((step) => {
                    const isDone = checklist[step.id] || false;
                    return (
                      <div
                        key={step.id}
                        onClick={() => handleToggleChecklist(step.id)}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                          isDone
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-300'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
                        }`}
                      >
                        <div className="mt-0.5">
                          {isDone ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <div className="w-4 h-4 rounded-md border border-slate-600" />
                          )}
                        </div>
                        <div>
                          <div
                            className={`text-xs font-semibold ${
                              isDone ? 'line-through text-slate-500' : 'text-slate-200'
                            }`}
                          >
                            {step.title}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 4: AI Copilot Chat */}
            {activeTab === 'chat' && (
              <div className="h-full flex flex-col justify-between space-y-3">
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl text-xs ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 ml-6'
                          : 'bg-slate-900 border border-slate-800 text-slate-300 mr-4'
                      }`}
                    >
                      <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                        {msg.sender === 'user' ? 'You' : 'BlastRadius AI Copilot'}
                      </div>
                      <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    value={inputChat}
                    onChange={(e) => setInputChat(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder="Ask about breaking changes or architecture..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                  <button
                    onClick={handleSendChat}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-3">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <HelpCircle className="w-8 h-8 text-slate-600" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-300">Ready to Analyze</h4>
            <p className="text-[11px] text-slate-500 max-w-xs mt-1">
              Select any component above, review the proposed change, and click{' '}
              <strong className="text-red-400">"Simulate Blast Radius"</strong> to trigger real-time
              ripple analysis.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
