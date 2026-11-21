import type { ArchitecturePreset } from '../types';

export const ARCHITECTURE_PRESETS: ArchitecturePreset[] = [
  {
    id: 'ecommerce-engine',
    name: 'Cloud E-Commerce & Stripe Payments',
    description: 'Modern distributed commerce platform with payment gateway, order orchestrator, and real-time inventory.',
    category: 'E-Commerce / FinTech',
    icon: 'ShoppingCart',
    nodes: [
      {
        id: 'node-client',
        position: { x: 50, y: 180 },
        data: {
          id: 'node-client',
          label: 'Storefront Client',
          sublabel: 'checkout.tsx',
          type: 'frontend',
          filePath: 'src/pages/checkout.tsx',
          language: 'TypeScript / React',
          linesCount: 420,
          testCoverage: 68,
          complexity: 'medium',
          criticalLevel: 3,
          status: 'safe',
          tags: ['React', 'Next.js', 'UI'],
          exportedMembers: ['CheckoutPage', 'usePaymentForm', 'OrderSummaryWidget'],
          codeSnippet: `export const CheckoutPage = () => {
  const { cart, total } = useCart();
  const handlePay = async (paymentMethod) => {
    const res = await api.post('/api/v1/orders/charge', {
      amount: total,
      method: paymentMethod,
      currency: 'USD'
    });
    return res.data;
  };
  return <PaymentContainer onPay={handlePay} />;
};`
        }
      },
      {
        id: 'node-gateway',
        position: { x: 320, y: 180 },
        data: {
          id: 'node-gateway',
          label: 'API Gateway & Auth',
          sublabel: 'api_gateway.ts',
          type: 'gateway',
          filePath: 'src/gateway/api_gateway.ts',
          language: 'TypeScript / Node',
          linesCount: 310,
          testCoverage: 91,
          complexity: 'low',
          criticalLevel: 4,
          status: 'safe',
          tags: ['Fastify', 'RateLimiter', 'JWT'],
          exportedMembers: ['routePaymentRequest', 'verifySessionToken', 'corsPolicy'],
          codeSnippet: `export async function routePaymentRequest(req, res) {
  const session = await verifySessionToken(req.headers['authorization']);
  if (!session.valid) return res.status(401).send('Unauthorized');
  return orderProxy.forward(req);
}`
        }
      },
      {
        id: 'node-order-service',
        position: { x: 600, y: 180 },
        data: {
          id: 'node-order-service',
          label: 'Order Orchestrator',
          sublabel: 'order.service.ts',
          type: 'service',
          filePath: 'src/services/order.service.ts',
          language: 'TypeScript',
          linesCount: 780,
          testCoverage: 84,
          complexity: 'critical',
          criticalLevel: 5,
          status: 'safe',
          tags: ['Core Domain', 'Transactions', 'Idempotency'],
          exportedMembers: ['createOrder', 'processPayment', 'cancelExpiredOrders', 'calculateTaxAndDiscounts'],
          codeSnippet: `export class OrderService {
  async processPayment(orderId: string, paymentToken: string) {
    const order = await OrderRepo.findById(orderId);
    const tax = this.calculateTaxAndDiscounts(order.items, order.customerCountry);
    const chargeResult = await StripeAdapter.chargeCard({
      amount: order.subtotal + tax,
      token: paymentToken,
      idempotencyKey: \`order_\${orderId}\`
    });
    await InventoryService.reserveStock(order.items);
    await NotificationWorker.enqueueEmail(order.userEmail, 'ORDER_CONFIRMED');
    return chargeResult;
  }
}`
        }
      },
      {
        id: 'node-stripe',
        position: { x: 920, y: 70 },
        data: {
          id: 'node-stripe',
          label: 'Stripe Payment Adapter',
          sublabel: 'stripe.adapter.ts',
          type: 'third-party',
          filePath: 'src/adapters/stripe.adapter.ts',
          language: 'TypeScript',
          linesCount: 290,
          testCoverage: 79,
          complexity: 'high',
          criticalLevel: 5,
          status: 'safe',
          tags: ['Stripe SDK', 'PCI-DSS', 'Webhooks'],
          exportedMembers: ['chargeCard', 'createCustomer', 'handleWebhookEvent', 'verifySignature'],
          codeSnippet: `export class StripeAdapter {
  static async chargeCard(params: ChargeParams): Promise<PaymentResponse> {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(params.amount * 100),
      currency: 'usd',
      confirm: true,
      return_url: 'https://store.io/checkout/complete'
    });
    return { status: paymentIntent.status, chargeId: paymentIntent.id };
  }
}`
        }
      },
      {
        id: 'node-inventory',
        position: { x: 920, y: 220 },
        data: {
          id: 'node-inventory',
          label: 'Inventory Sync Service',
          sublabel: 'inventory.service.ts',
          type: 'service',
          filePath: 'src/services/inventory.service.ts',
          language: 'TypeScript',
          linesCount: 340,
          testCoverage: 72,
          complexity: 'medium',
          criticalLevel: 4,
          status: 'safe',
          tags: ['Stock Locks', 'Warehouse API'],
          exportedMembers: ['reserveStock', 'releaseStock', 'checkAvailability'],
          codeSnippet: `export class InventoryService {
  static async reserveStock(items: LineItem[]) {
    for (const item of items) {
      const lockAcquired = await RedisLock.acquire(\`sku_\${item.sku}\`);
      if (!lockAcquired) throw new Error('Stock lock contention');
      await DB.warehouse.decrement(item.sku, item.quantity);
    }
  }
}`
        }
      },
      {
        id: 'node-notification',
        position: { x: 920, y: 360 },
        data: {
          id: 'node-notification',
          label: 'Notification Worker',
          sublabel: 'notification.worker.ts',
          type: 'worker',
          filePath: 'src/workers/notification.worker.ts',
          language: 'TypeScript',
          linesCount: 190,
          testCoverage: 55,
          complexity: 'low',
          criticalLevel: 2,
          status: 'safe',
          tags: ['BullMQ', 'Sendgrid', 'SMS'],
          exportedMembers: ['enqueueEmail', 'processEmailQueue', 'sendReceiptSms'],
          codeSnippet: `export const NotificationWorker = {
  async enqueueEmail(recipient: string, template: string) {
    return emailQueue.add('send_receipt', { recipient, template, timestamp: Date.now() });
  }
};`
        }
      },
      {
        id: 'node-db',
        position: { x: 600, y: 390 },
        data: {
          id: 'node-db',
          label: 'PostgreSQL Orders DB',
          sublabel: 'orders.schema.sql',
          type: 'database',
          filePath: 'prisma/schema.prisma',
          language: 'Prisma / SQL',
          linesCount: 150,
          testCoverage: 95,
          complexity: 'high',
          criticalLevel: 5,
          status: 'safe',
          tags: ['Prisma', 'PostgreSQL', 'ACID'],
          exportedMembers: ['OrderTable', 'OrderItemTable', 'OrderStatusEnum'],
          codeSnippet: `model Order {
  id            String      @id @default(uuid())
  userId        String
  subtotal      Decimal
  taxAmount     Decimal
  status        OrderStatus @default(PENDING)
  stripeChargeId String?
  createdAt     DateTime    @default(now())
  items         OrderItem[]
}`
        }
      },
      {
        id: 'node-cache',
        position: { x: 320, y: 360 },
        data: {
          id: 'node-cache',
          label: 'Redis Session & Idempotency',
          sublabel: 'redis.client.ts',
          type: 'cache',
          filePath: 'src/lib/redis.client.ts',
          language: 'TypeScript',
          linesCount: 110,
          testCoverage: 88,
          complexity: 'low',
          criticalLevel: 3,
          status: 'safe',
          tags: ['Redis', 'Cache', 'Cluster'],
          exportedMembers: ['getCache', 'setWithExpiry', 'acquireLock'],
          codeSnippet: `export const RedisClient = {
  async acquireLock(key: string, ttlMs: number = 5000): Promise<boolean> {
    const res = await redis.set(key, 'locked', 'PX', ttlMs, 'NX');
    return res === 'OK';
  }
};`
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'node-client', target: 'node-gateway', type: 'calls', label: 'HTTP /api/charge' },
      { id: 'e2', source: 'node-gateway', target: 'node-cache', type: 'reads_from', label: 'Validate Session' },
      { id: 'e3', source: 'node-gateway', target: 'node-order-service', type: 'calls', label: 'gRPC ProcessOrder' },
      { id: 'e4', source: 'node-order-service', target: 'node-stripe', type: 'calls', label: 'StripeAdapter.chargeCard()' },
      { id: 'e5', source: 'node-order-service', target: 'node-inventory', type: 'calls', label: 'reserveStock()' },
      { id: 'e6', source: 'node-order-service', target: 'node-notification', type: 'triggers', label: 'enqueueEmail()' },
      { id: 'e7', source: 'node-order-service', target: 'node-db', type: 'writes_to', label: 'Persist Transaction' },
      { id: 'e8', source: 'node-inventory', target: 'node-cache', type: 'reads_from', label: 'Distributed Lock' }
    ],
    quickScenarios: [
      {
        title: '💥 Stripe 3D-Secure Protocol Mandate',
        targetNodeId: 'node-stripe',
        description: 'Update Stripe payment intent response to require mandatory 3D Secure redirect url and async webhook confirmation instead of synchronous charge.',
        sampleChange: `Refactor StripeAdapter.chargeCard to return { requiresAction: true, redirectUrl: string } instead of { status: 'succeeded' }. Synchronous charging is deprecated.`
      },
      {
        title: '⚠️ Order Tax & Multi-Currency Engine',
        targetNodeId: 'node-order-service',
        description: 'Modify calculateTaxAndDiscounts to require ISO-4217 Currency Code and dynamic VAT rates by state.',
        sampleChange: `Change signature of calculateTaxAndDiscounts(items, country) -> calculateTaxAndDiscounts(items, country, currencyCode, vatExemptTaxId). Remove fallback defaults.`
      },
      {
        title: '🗄️ Database Schema Breaking Migration',
        targetNodeId: 'node-db',
        description: 'Split OrderStatus enum into PaymentStatus and FulfillmentStatus, dropping legacy status column.',
        sampleChange: `ALTER TABLE "Order" DROP COLUMN "status"; ADD COLUMN "paymentStatus" VARCHAR NOT NULL; ADD COLUMN "fulfillmentStatus" VARCHAR NOT NULL;`
      }
    ]
  },
  {
    id: 'fintech-core',
    name: 'FinTech Banking & Real-time Ledger',
    description: 'High-compliance banking infrastructure with cryptographic JWT verification, double-entry ledger, and fraud scoring.',
    category: 'FinTech / Security',
    icon: 'ShieldCheck',
    nodes: [
      {
        id: 'node-fin-app',
        position: { x: 60, y: 180 },
        data: {
          id: 'node-fin-app',
          label: 'Mobile Banking App',
          sublabel: 'TransferScreen.tsx',
          type: 'frontend',
          filePath: 'mobile/src/screens/TransferScreen.tsx',
          language: 'React Native',
          linesCount: 350,
          testCoverage: 60,
          complexity: 'medium',
          criticalLevel: 3,
          status: 'safe',
          tags: ['React Native', 'Biometrics'],
          exportedMembers: ['TransferScreen', 'initiateBankTransfer'],
          codeSnippet: `export const initiateBankTransfer = async (payload) => {
  return await SecureClient.post('/v2/transfer', payload);
};`
        }
      },
      {
        id: 'node-fin-auth',
        position: { x: 340, y: 180 },
        data: {
          id: 'node-fin-auth',
          label: 'JWT & Biometric Auth Guard',
          sublabel: 'auth.guard.ts',
          type: 'gateway',
          filePath: 'src/guards/auth.guard.ts',
          language: 'TypeScript',
          linesCount: 220,
          testCoverage: 98,
          complexity: 'critical',
          criticalLevel: 5,
          status: 'safe',
          tags: ['mTLS', 'JWT', 'HMAC'],
          exportedMembers: ['verifyBiometricToken', 'extractAccountClaims'],
          codeSnippet: `export function verifyBiometricToken(token: string) {
  return jwt.verify(token, PUBLIC_RSA_KEY, { algorithms: ['RS512'] });
}`
        }
      },
      {
        id: 'node-fin-ledger',
        position: { x: 620, y: 180 },
        data: {
          id: 'node-fin-ledger',
          label: 'Double-Entry Ledger Core',
          sublabel: 'ledger.service.ts',
          type: 'service',
          filePath: 'src/services/ledger.service.ts',
          language: 'Go / Node',
          linesCount: 890,
          testCoverage: 96,
          complexity: 'critical',
          criticalLevel: 5,
          status: 'safe',
          tags: ['Double-Entry', 'ACID', 'Idempotent'],
          exportedMembers: ['recordTransfer', 'lockAccountPair', 'computeBalance'],
          codeSnippet: `export class LedgerService {
  async recordTransfer(debitAcc: string, creditAcc: string, amountCents: bigint) {
    return await DB.transaction(async (tx) => {
      await tx.debit(debitAcc, amountCents);
      await tx.credit(creditAcc, amountCents);
    });
  }
}`
        }
      },
      {
        id: 'node-fin-kyc',
        position: { x: 920, y: 110 },
        data: {
          id: 'node-fin-kyc',
          label: 'KYC & AML Fraud Detector',
          sublabel: 'aml_scanner.py',
          type: 'service',
          filePath: 'services/aml/aml_scanner.py',
          language: 'Python',
          linesCount: 450,
          testCoverage: 81,
          complexity: 'high',
          criticalLevel: 4,
          status: 'safe',
          tags: ['Python', 'ML Scoring', 'Sanctions'],
          exportedMembers: ['screenTransaction', 'checkSanctionList'],
          codeSnippet: `def screen_transaction(sender_id, receiver_id, amount):
    score = ml_model.predict([sender_id, amount])
    if score > 0.85:
        raise AMLViolation("Suspicious high-velocity transfer detected")
    return {"approved": True, "risk_score": score}`
        }
      },
      {
        id: 'node-fin-audit',
        position: { x: 920, y: 280 },
        data: {
          id: 'node-fin-audit',
          label: 'Kafka Immutable Audit Log',
          sublabel: 'audit.producer.ts',
          type: 'worker',
          filePath: 'src/kafka/audit.producer.ts',
          language: 'TypeScript',
          linesCount: 160,
          testCoverage: 89,
          complexity: 'low',
          criticalLevel: 5,
          status: 'safe',
          tags: ['Kafka', 'WORM Storage', 'Compliance'],
          exportedMembers: ['publishAuditEvent', 'flushBatch'],
          codeSnippet: `export const publishAuditEvent = async (event: AuditRecord) => {
  await producer.send({ topic: 'fintech-audit-ledger', messages: [{ value: JSON.stringify(event) }] });
};`
        }
      },
      {
        id: 'node-fin-vault',
        position: { x: 620, y: 390 },
        data: {
          id: 'node-fin-vault',
          label: 'Encrypted Vault & Ledger DB',
          sublabel: 'vault.schema.sql',
          type: 'database',
          filePath: 'db/migrations/003_vault.sql',
          language: 'PostgreSQL',
          linesCount: 200,
          testCoverage: 99,
          complexity: 'critical',
          criticalLevel: 5,
          status: 'safe',
          tags: ['pgcrypto', 'Row-Level Security'],
          exportedMembers: ['accounts_table', 'entries_table', 'balances_view'],
          codeSnippet: `CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  amount_cents BIGINT NOT NULL,
  type VARCHAR(10) CHECK (type IN ('DEBIT', 'CREDIT'))
);`
        }
      }
    ],
    edges: [
      { id: 'f1', source: 'node-fin-app', target: 'node-fin-auth', type: 'calls', label: 'HTTPS + Biometric' },
      { id: 'f2', source: 'node-fin-auth', target: 'node-fin-ledger', type: 'calls', label: 'Authenticated Dispatch' },
      { id: 'f3', source: 'node-fin-ledger', target: 'node-fin-kyc', type: 'calls', label: 'Synchronous AML Check' },
      { id: 'f4', source: 'node-fin-ledger', target: 'node-fin-vault', type: 'writes_to', label: 'Two-Phase ACID Commit' },
      { id: 'f5', source: 'node-fin-ledger', target: 'node-fin-audit', type: 'triggers', label: 'Produce Event' }
    ],
    quickScenarios: [
      {
        title: '🔐 Token Signature Upgrade (RS256 to EdDSA)',
        targetNodeId: 'node-fin-auth',
        description: 'Upgrade cryptographic signature validation from RSA-512 to Edwards-curve Digital Signature (Ed25519). Invalidates legacy tokens.',
        sampleChange: `Change verifyBiometricToken to accept only Ed25519 keys and require hardware attestation header X-Attestation-Signature.`
      },
      {
        title: '💸 Enforce Multi-Currency Decimal Precision',
        targetNodeId: 'node-fin-ledger',
        description: 'Switch amount from bigint cents to arbitrary precision BigDecimal with strict FX exchange rate conversion.',
        sampleChange: `Update recordTransfer signature to: recordTransfer(debitAcc, creditAcc, amount: BigDecimal, currency: SupportedCurrency, fxRate: Decimal). Throw if fxRate is expired.`
      }
    ]
  },
  {
    id: 'ai-agent-cloud',
    name: 'Multi-Agent Autonomous AI Engine',
    description: 'High-concurrency AI orchestration system with vector memory, tool sandboxing, and LLM coordinator.',
    category: 'AI / LLM Systems',
    icon: 'Bot',
    nodes: [
      {
        id: 'node-ai-canvas',
        position: { x: 60, y: 180 },
        data: {
          id: 'node-ai-canvas',
          label: 'Interactive Canvas UI',
          sublabel: 'AgentCanvas.tsx',
          type: 'frontend',
          filePath: 'src/components/AgentCanvas.tsx',
          language: 'TypeScript / React',
          linesCount: 520,
          testCoverage: 75,
          complexity: 'medium',
          criticalLevel: 3,
          status: 'safe',
          tags: ['React', 'WebSocket', 'SSE'],
          exportedMembers: ['AgentCanvas', 'renderExecutionStream'],
          codeSnippet: `export const AgentCanvas = () => {
  const { messages, streamStep } = useAgentStream();
  return <CanvasBoard stream={streamStep} />;
};`
        }
      },
      {
        id: 'node-ai-coord',
        position: { x: 350, y: 180 },
        data: {
          id: 'node-ai-coord',
          label: 'Agent Coordinator',
          sublabel: 'coordinator.ts',
          type: 'service',
          filePath: 'src/agents/coordinator.ts',
          language: 'TypeScript',
          linesCount: 820,
          testCoverage: 88,
          complexity: 'critical',
          criticalLevel: 5,
          status: 'safe',
          tags: ['ReAct Loop', 'Plan & Execute'],
          exportedMembers: ['dispatchTask', 'planNextAction', 'synthesizeFinalResponse'],
          codeSnippet: `export class AgentCoordinator {
  async dispatchTask(goal: string) {
    const memory = await VectorStore.retrieveRelevantContext(goal, 5);
    const plan = await LLMGateway.generatePlan(goal, memory);
    const result = await ToolSandbox.executeAction(plan.nextAction);
    return result;
  }
}`
        }
      },
      {
        id: 'node-ai-llm',
        position: { x: 650, y: 70 },
        data: {
          id: 'node-ai-llm',
          label: 'Gemini LLM Gateway',
          sublabel: 'gemini.provider.ts',
          type: 'third-party',
          filePath: 'src/llm/gemini.provider.ts',
          language: 'TypeScript',
          linesCount: 260,
          testCoverage: 92,
          complexity: 'high',
          criticalLevel: 5,
          status: 'safe',
          tags: ['Gemini 2.0', 'Function Calling'],
          exportedMembers: ['generatePlan', 'callStructuredTools', 'streamTokens'],
          codeSnippet: `export async function callStructuredTools(prompt: string, toolDefs: ToolDef[]) {
  return await geminiClient.chat.completions.create({
    model: 'gemini-2.0-flash',
    tools: toolDefs
  });
}`
        }
      },
      {
        id: 'node-ai-vector',
        position: { x: 650, y: 220 },
        data: {
          id: 'node-ai-vector',
          label: 'Pinecone Vector Memory',
          sublabel: 'vector_store.ts',
          type: 'database',
          filePath: 'src/memory/vector_store.ts',
          language: 'TypeScript',
          linesCount: 310,
          testCoverage: 80,
          complexity: 'medium',
          criticalLevel: 4,
          status: 'safe',
          tags: ['Embeddings', 'HNSW', 'Cosine'],
          exportedMembers: ['retrieveRelevantContext', 'upsertEpisodeVector'],
          codeSnippet: `export const VectorStore = {
  async retrieveRelevantContext(query: string, topK: number = 5) {
    const embedding = await generateEmbedding(query);
    return await pineconeIndex.query({ vector: embedding, topK, includeMetadata: true });
  }
};`
        }
      },
      {
        id: 'node-ai-sandbox',
        position: { x: 650, y: 360 },
        data: {
          id: 'node-ai-sandbox',
          label: 'Tool Sandbox Executor',
          sublabel: 'sandbox.executor.ts',
          type: 'worker',
          filePath: 'src/tools/sandbox.executor.ts',
          language: 'TypeScript / Docker',
          linesCount: 410,
          testCoverage: 71,
          complexity: 'critical',
          criticalLevel: 5,
          status: 'safe',
          tags: ['Isolated V8', 'Docker Engine', 'Security'],
          exportedMembers: ['executeAction', 'enforceResourceLimits', 'terminateWorker'],
          codeSnippet: `export class ToolSandbox {
  static async executeAction(action: ActionPayload) {
    const container = await docker.createContainer({ Image: 'agent-sandbox:node-latest' });
    return await container.start();
  }
}`
        }
      }
    ],
    edges: [
      { id: 'a1', source: 'node-ai-canvas', target: 'node-ai-coord', type: 'calls', label: 'WebSocket /goal' },
      { id: 'a2', source: 'node-ai-coord', target: 'node-ai-llm', type: 'calls', label: 'Reasoning Prompt' },
      { id: 'a3', source: 'node-ai-coord', target: 'node-ai-vector', type: 'reads_from', label: 'RAG Retrieval' },
      { id: 'a4', source: 'node-ai-coord', target: 'node-ai-sandbox', type: 'triggers', label: 'Isolated Tool Exec' }
    ],
    quickScenarios: [
      {
        title: '🛡️ Enforce Zero-Trust Network in Sandbox',
        targetNodeId: 'node-ai-sandbox',
        description: 'Block all external egress from Tool Sandbox unless domain is in an explicit signed allowlist.',
        sampleChange: `Update executeAction to pass strict iptables drop rules. Default allow outbound is removed. Requires signed manifest.`
      },
      {
        title: '⚡ Embedding Dimension Migration',
        targetNodeId: 'node-ai-vector',
        description: 'Migrate embedding model from 768-dim (BERT) to 1536-dim (Gemini Multimodal). Queries with old dimensions will crash.',
        sampleChange: `Change embedding vector schema to Float32Array(1536). Any existing 768-dim query throws DimensionMismatchException.`
      }
    ]
  }
];
