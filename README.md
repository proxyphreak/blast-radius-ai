# 🚀 BlastRadius AI
### *Visual Code Change & Ripple-Effect Engine for Mission-Critical Engineering*

**Ace Builders Hackathon 2026 Official Submission**  
Built natively for: **Codebenders ACE Architecture & Nexen AI Ecosystem**  
Developer: **@proxyphreak** | Global Online Hackathon by Codebenders

---

## ⚡ The Problem: "The Production Break Anxiety"
Every developer, engineering lead, and DevOps team faces the same terrifying reality:
> *"I changed one function signature or database column on line 42... why did checkout, mobile notifications, and billing all crash in production?"*

Modern architectures are distributed webs of microservices, third-party adapters, database schemas, and background workers. Traditional linters and IDEs only analyze local file syntax—they have **zero visibility into cross-system ripple effects, contract breaches, or downstream blast radius.**

---

## 💡 The Solution: BlastRadius AI + Codebenders ACE
**BlastRadius AI** is an intelligent, visual architecture and code change simulation platform aligned with Codebenders' mission of **zero-downtime brownfield modernization and ambient software engineering**.

Before creating a PR or pushing to `main`, developers can:
1. **Explore Live Architecture Topology**: Interactive, zoomable graph with service health, lines of code, test coverage, and dependency flows.
2. **Simulate Blast Radius in Real-Time**: Select any component and describe a proposed code modification. The system computes 1st-hop direct impacts and 2nd-hop ripple risks.
3. **Automated Breaking Change Detection**: Identifies API contract breaks, schema desyncs, and runtime exceptions before they happen.
4. **Auto-Generated Regression Tests**: Instantly writes TypeScript / Jest regression suites tailored to the exact blast radius.
5. **Interactive PR Mitigation Checklist**: Step-by-step pre-flight checklist to guarantee zero-downtime deployments.
6. **Codebenders Nexen AI Copilot**: Conversational AI assistant that understands your full system topology and ambient codebase dependencies.
7. **Custom Code Ingestion**: Upload custom project files (.ts, .js, .py) or paste source code; our AST parser constructs the graph automatically.

---

## 🛠️ Architecture & Tech Stack
* **Frontend**: React 19, TypeScript, Tailwind CSS v4, Framer Motion
* **Graph Engine**: `@xyflow/react` (React Flow) with custom interactive nodes and neon pulse shaders
* **AI Engine**: Dual-Mode Architecture:
  * **Codebenders Nexen AI & Gemini 2.0 Flash**: Deep semantic reasoning, contract verification, and test generation
  * **High-Precision Local AST Heuristics Engine**: Fallback zero-latency offline analyzer (100% demo uptime guaranteed)
* **Visual Polish**: Lucide Icons, Canvas Confetti, Glassmorphism Dark Cyberpunk UI

---

## 🎮 How to Run Locally

```bash
# 1. Clone repository & navigate to directory
git clone https://github.com/proxyphreak/blast-radius-ai.git
cd blast-radius-ai

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Open in browser:
http://localhost:5173
```

---

## 🏆 Hackathon Demo Script (2-Minute Pitch)
1. **0:00 - 0:30 (The Hook)**: Show the E-Commerce architecture graph. Explain how touching `StripeAdapter` or `OrderService` triggers invisible ripple effects.
2. **0:30 - 1:15 (The Action)**: Click on the *Stripe 3D-Secure Protocol Mandate* scenario. Hit **"Simulate Blast Radius"**. Watch the graph pulse red on direct callers (`OrderService`) and amber on secondary services (`Storefront Client`, `Postgres DB`).
3. **1:15 - 1:45 (The Value & Codebenders Alignment)**: Open the **Generated Tests** tab to copy the automated regression test. Switch to **PR Checklist** to demonstrate zero-downtime migration steps—fulfilling Codebenders' core vision of fearless code transformation.
4. **1:45 - 2:00 (The Closing)**: Show custom code ingestion and export audit report to Markdown. Emphasize: *"BlastRadius AI saves engineering teams hundreds of hours of downtime and debugging."*
