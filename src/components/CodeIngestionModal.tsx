import { useState } from 'react';
import { X, UploadCloud, Code, FileText, CheckCircle2, Sparkles } from 'lucide-react';
import { BlastRadiusEngine } from '../services/aiEngine';
import type { CodeNodeData, CodeEdgeData } from '../types';

interface CodeIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCustomGraph: (nodes: CodeNodeData[], edges: CodeEdgeData[]) => void;
}

const SAMPLE_PROJECT = [
  {
    name: 'src/routes/payment.routes.ts',
    content: `import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

export const paymentRouter = Router();
paymentRouter.post('/charge', AuthMiddleware.verify, PaymentController.charge);`
  },
  {
    name: 'src/controllers/payment.controller.ts',
    content: `import { PaymentService } from '../services/payment.service';
import { AuditLogger } from '../utils/audit.logger';

export class PaymentController {
  static async charge(req, res) {
    const { amount, currency } = req.body;
    AuditLogger.log('CHARGE_REQUEST', { amount, user: req.user.id });
    const receipt = await PaymentService.processCharge(req.user.id, amount, currency);
    return res.json(receipt);
  }
}`
  },
  {
    name: 'src/services/payment.service.ts',
    content: `import { DatabasePool } from '../database/db';
import { StripeAdapter } from '../adapters/stripe.adapter';

export class PaymentService {
  static async processCharge(userId: string, amount: number, currency: string) {
    const charge = await StripeAdapter.execute(amount, currency);
    await DatabasePool.query('INSERT INTO transactions (user_id, amount) VALUES ($1, $2)', [userId, amount]);
    return charge;
  }
}`
  },
  {
    name: 'src/adapters/stripe.adapter.ts',
    content: `export class StripeAdapter {
  static async execute(amount: number, currency: string) {
    return { id: 'ch_mock_123', status: 'paid', amount, currency };
  }
}`
  },
  {
    name: 'src/database/db.ts',
    content: `export const DatabasePool = {
  async query(sql: string, params: any[]) {
    return { rowCount: 1 };
  }
};`
  }
];

export const CodeIngestionModal: React.FC<CodeIngestionModalProps> = ({
  isOpen,
  onClose,
  onApplyCustomGraph
}) => {
  const [activeTab, setActiveTab] = useState<'sample' | 'paste' | 'upload'>('sample');
  const [customFiles, setCustomFiles] = useState<Array<{ name: string; content: string }>>(SAMPLE_PROJECT);
  const [singleFileName, setSingleFileName] = useState('src/services/auth.service.ts');
  const [singleFileContent, setSingleFileContent] = useState(`import { TokenManager } from './token.manager';
import { UserModel } from '../models/user.model';

export class AuthService {
  static async login(email: string, pass: string) {
    const user = await UserModel.findByEmail(email);
    return TokenManager.createSession(user.id);
  }
}`);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const loadedFiles: Array<{ name: string; content: string }> = [];
    let readCount = 0;

    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        loadedFiles.push({ name: file.name, content: text });
        readCount++;
        if (readCount === fileList.length) {
          setCustomFiles(loadedFiles);
        }
      };
      reader.readAsText(file);
    });
  };

  const handleApply = () => {
    let filesToParse = customFiles;
    if (activeTab === 'paste') {
      filesToParse = [{ name: singleFileName, content: singleFileContent }];
    }
    const { nodes, edges } = BlastRadiusEngine.parseUploadedFiles(filesToParse);
    onApplyCustomGraph(nodes, edges);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-950 border border-sky-700/50 text-sky-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Ingest Custom Codebase</h3>
              <p className="text-xs text-slate-400">
                Upload your project files or paste source code to build a custom Blast Radius graph.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 text-xs bg-slate-950 px-4">
          <button
            onClick={() => setActiveTab('sample')}
            className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'sample'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Sample Microservice (5 files)
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" /> Upload File List (.ts, .js, .py)
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> Paste Single File
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'sample' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Ready-to-analyze 5-node Node/Express microservice architecture with routes, controllers, adapters, and database calls:
              </p>
              <div className="space-y-1.5">
                {SAMPLE_PROJECT.map((f, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-sky-400" />
                      <span className="font-mono text-slate-200">{f.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {f.content.split('\n').length} lines
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-2xl p-6 text-center space-y-2 bg-slate-950/40 transition">
                <UploadCloud className="w-8 h-8 text-sky-400 mx-auto animate-bounce" />
                <div className="text-xs font-semibold text-slate-200">
                  Select multiple code files from your computer
                </div>
                <p className="text-[11px] text-slate-500">
                  Supports .ts, .tsx, .js, .jsx, .py, .go, .sql, .json
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500 cursor-pointer pt-2"
                />
              </div>

              {customFiles.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold">
                    Loaded Files ({customFiles.length}):
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {customFiles.map((file, i) => (
                      <div
                        key={i}
                        className="text-xs p-1.5 rounded bg-slate-950 border border-slate-800 flex items-center gap-2 font-mono text-slate-300"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  File Path / Name:
                </label>
                <input
                  type="text"
                  value={singleFileName}
                  onChange={(e) => setSingleFileName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Source Code:
                </label>
                <textarea
                  value={singleFileContent}
                  onChange={(e) => setSingleFileContent(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 font-mono resize-none focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/80">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Blast Graph</span>
          </button>
        </div>
      </div>
    </div>
  );
};
