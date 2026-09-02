# CommercePilot ⚡ Autonomous AI E-Commerce & Growth Platform

An intelligent, full-stack multi-agent autonomous commerce platform built for high-conversion retail operations. Powered by **Groq Llama/Qwen** as primary ultra-low latency LLM inference with **Google Gemini** multi-tier fallback, deterministic policy gating, real-time cart recovery, and full Razorpay integration.

---

## 🚀 Key Features

### 1. 🤖 Multi-Agent Architecture
- **Commerce Discovery Agent**: Semantic NLP product parsing, budget constraint evaluation, feature matching (waterproofing, cushioning, terrain), and contextual recommendations.
- **Growth & Intent Agent**: Dynamic cart scoring (0–100%) calculating purchase intent based on dwell time, scroll depth, item value, and user behavior.
- **Policy Engine (Gated Safety Guardrails)**: Deterministic policy rules preventing spam, enforcing cooldown periods (6 hours), quiet hours (10 PM – 8 AM), and discount safety margins.
- **Campaign Orchestrator Agent**: Automated WhatsApp recovery dispatching personalized messages tailored to cart contents.

### 2. ⚡ Multi-Tier AI Provider System
- **Tier 1 (Primary)**: **Groq** (`qwen/qwen3.8-27b`, `groq/compound`, etc.) for sub-second LLM inference.
- **Tier 2 (Fallback)**: **Google Gemini** (`gemini-2.5-flash`, `gemini-3.7-flash`) for multi-modal reasoning.
- **Tier 3 (Fallback)**: **OpenAI** (`gpt-4o-mini`).
- **Tier 4 (Offline Engine)**: Built-in deterministic semantic engine if offline.

### 3. 💳 Checkout & Payment Gateway
- Complete cart management with persistent synchronized state.
- Embedded Razorpay checkout modal with instant confirmation, receipt generation, and order tracking.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons + Framer Motion
- **AI / LLM**: Groq Cloud API, Google Generative AI API, OpenAI API
- **Database**: Prisma ORM with PostgreSQL / In-Memory synced persistence
- **Payments**: Razorpay Node SDK & Client Gateway

---

## 📦 Getting Started

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/KeerthiKumarR/Agent.git
cd Agent
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and insert your API keys:
\`\`\`env
# 1. LLM API Keys (Groq as Primary, Gemini as Fallback)
GROQ_API_KEY="your_groq_api_key_here"
GEMINI_API_KEY="your_gemini_api_key_here"

# 2. Razorpay Gateway Keys
RAZORPAY_KEY_ID="rzp_test_demo12345678"
RAZORPAY_KEY_SECRET="demo_secret_key_abcdef"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_demo12345678"

# 3. Database URL (Optional)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/commercepilot?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
\`\`\`

### 4. Run the Development Server
\`\`\`bash
npm run dev
\`\`\`
Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Security & Privacy
Sensitive `.env` keys and environment tokens are excluded in `.gitignore`. Always configure keys directly via environment variables.
