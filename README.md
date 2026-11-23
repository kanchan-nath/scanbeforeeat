# ScanBeforeEat

> An open-source food ingredient toxicology and additive intelligence platform translating complex food package labels into transparent, evidence-aware nutritional health guidance.

[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D22.0.0-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org)
[![Next.js Version](https://img.shields.io/badge/Next.js-16.4.6-000000.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License: MIT Permissive](https://img.shields.io/badge/License-MIT_Permissive-blue.svg)](LICENSE)
[![Security Policy](https://img.shields.io/badge/Security-Policy-green.svg)](SECURITY.md)

---

## 🥗 Overview

**ScanBeforeEat** bridges the gap between opaque food industry ingredient lists and everyday consumers. By combining mobile-first camera scanning, optical character recognition (OCR), Open Food Facts catalog integration, and evidence-grounded toxicology indexing, ScanBeforeEat surfaces critical facts regarding food additives, ultra-processed ingredients (UPFs), preservative synergy risks, and declared nutritional metrics.

---

## ⚡ Core Capabilities

- **Multi-Modal Ingredient Capture**:
  - **Barcode Scanning**: Instant lookup against the Open Food Facts global database via HTML5 QR/Barcode reader.
  - **In-Browser OCR**: High-performance camera framing with client-side text extraction powered by `Tesseract.js` workers and HTML5 canvas normalization.
  - **Manual Label Input**: Direct input for uncataloged artisanal or regional food packaging.
- **Toxicology & Additive Analytics**:
  - Automated classification of E-numbers, preservatives, colorants, emulsifiers, and synthetic sweeteners.
  - Chemical synergy hazard detection highlighting potentially adverse additive combinations.
  - Objective classification along NOVA ultra-processed food scales.
- **Evidence-Based Health Grounding**:
  - Health insights citing peer-reviewed literature and published standards from public health institutions (WHO, EFSA, US FDA, FSSAI).
  - Explicit distinction between observational lifestyle correlations and direct scientific causality.
- **User Exposure & Pantry History**:
  - Additive exposure ledger tracking cumulative consumption across meals and days.
  - Safe pantry indexing and intelligent, healthier alternative recommendations.
- **Developer API & Accounting Utilities**:
  - Robust REST API endpoints for external integrations.
  - Dynamic PDF invoice and scan summary generation powered by PDFKit.

---

## 🛠️ Technology Stack

ScanBeforeEat is built as a high-performance monorepo composed of a modern web application, an API server, and automated data pipelines:

| Layer | Technologies & Libraries | Purpose & Function |
|:---|:---|:---|
| **Frontend Framework** | **Next.js 16 (App Router)** & **React 19** | Server-side rendering, static route generation, and interactive mobile-first layout |
| **Styling & Icons** | **Tailwind CSS v4** & **Lucide React** | Modern, responsive component styling and iconography |
| **Testing & Build Tools** | **Vite / Vitest**, **Testing Library**, **ESLint** | Ultra-fast unit testing across client components and backend services |
| **Client-Side Scanner** | **Tesseract.js**, **html5-qrcode** | Zero-latency, browser-native barcode decoding and OCR text extraction |
| **Authentication** | **Firebase Auth** (Client) & **JWT** (Server) | Multi-provider authentication (Google, GitHub, Twitter/X, Email OTP) and stateless session validation |
| **API Server** | **Node.js (v22+)** & **Express 4 (TypeScript)** | Business logic, toxicology computation, PDF creation, and webhook handlers |
| **Relational Database** | **PostgreSQL** & **SQLite (`node:sqlite`)** | Production cloud persistence via Supabase with zero-config embedded SQLite for local development |
| **Data Modeling** | **Prisma ORM** (Architecture Roadmap) | Type-safe schema definition and database migration workflow |
| **Document Archiving** | **Mongoose / MongoDB** (Architecture Roadmap) | Semi-structured ingredient catalog caching and historical batch scan archives |
| **Asynchronous Queues** | **Redis / BullMQ** (Architecture Roadmap) | Scalable background worker queues for asynchronous high-volume batch image OCR |
| **Real-Time Push** | **Socket.io** (Architecture Roadmap) | Live WebSocket event streaming for real-time batch processing updates |
| **Vector Search** | **Pinecone** (Architecture Roadmap) | High-dimensional vector index for semantic similarity retrieval over toxicology studies |

---

## 📂 Repository Folder Structure

```
scanbeforeeat/
├── frontend/                     # Next.js 16 App Router web application
│   ├── src/
│   │   ├── app/                  # Application routes, layouts, and pages
│   │   ├── components/           # Reusable UI components and scanner widgets
│   │   ├── content/              # Editorial articles and educational blog guides
│   │   └── lib/                  # Client utilities, API clients, and scoring engines
│   ├── public/                   # Static media, icons, and sitemap definitions
│   └── package.json              # Frontend workspace dependencies
├── server/                       # Node.js TypeScript Express API server
│   ├── src/
│   │   ├── services/             # AI, toxicology, PDF, payment, and email engines
│   │   ├── middleware/           # JWT authentication and security middleware
│   │   ├── db.ts                 # SQLite / PostgreSQL connection layer
│   │   └── index.ts              # API server entrypoint and route declarations
│   ├── scripts/                  # Database migration and synchronization tools
│   ├── __tests__/                # Vitest backend integration test suites
│   └── package.json              # Server workspace dependencies
├── docs/                         # In-depth architectural and operational guides
│   ├── ARCHITECTURE.md           # System design diagrams and component flow
│   ├── DATABASE.md               # Schema definitions and data models
│   ├── SECURITY.md               # Security architecture and threat boundaries
│   ├── DEPLOYMENT.md             # Production hosting and cloud procedures
│   └── BACKEND_AUDIT.md          # Comprehensive backend route audit and roadmap
├── scripts/                      # Autonomous pipelines and operations
│   └── seo-pipeline/             # Evidence-backed nutritional content generator
├── .env.example                  # Full environment variable configuration template
├── .gitignore                    # Production version control exclusions
├── package.json                  # Top-level npm monorepo workspace definition
├── render.yaml                   # Infrastructure-as-code deployment blueprint
├── CONTRIBUTING.md               # Contributor workflow and testing rules
├── CODE_OF_CONDUCT.md           # Community guidelines and collaboration standards
├── SECURITY.md                   # Security vulnerability reporting policy
└── LICENSE                       # Open-source permissive license
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v22.0.0` or later ([nodejs.org](https://nodejs.org))
- **npm**: `v10.0.0` or later
- **Python**: `3.10+` (optional, for `scripts/seo-pipeline`)

### 2. Installation
Clone the repository and install dependencies across the monorepo:

```bash
git clone https://github.com/kanchan-nath/scanbeforeeat.git
cd scanbeforeeat
npm install
```

### 3. Environment Configuration
Create a `.env` configuration file from the template:

```bash
cp .env.example .env
```

Review and adjust variables in `.env` as required for your local setup. See [Environment Variables](#-environment-variables) below.

### 4. Running the Development Servers
You can start the frontend, backend, or both simultaneously:

```bash
# Start the Next.js frontend development server (http://localhost:3000)
npm run dev:frontend

# Start the Express API server with automatic hot reloading (http://localhost:4000)
npm run dev:server

# Run the complete stack concurrently from root
npm run dev
```

---

## 🔐 Environment Variables

All configuration settings are documented in [.env.example](file:///.env.example). Never commit production secrets or live credentials to source control.

Key configuration groupings include:
- **Frontend Configuration**:
  - `NEXT_PUBLIC_SITE_URL`: Canonical site origin (e.g. `http://localhost:3000`).
  - `NEXT_PUBLIC_API_URL`: Backend API URL (e.g. `http://localhost:4000/api`).
  - `NEXT_PUBLIC_FIREBASE_*`: Public credentials for Firebase Authentication.
- **Backend Server Settings**:
  - `PORT`: HTTP port for Express (default: `4000`).
  - `NODE_ENV`: Runtime environment (`development`, `production`, `test`).
  - `JWT_SECRET`: Secret key for cryptographic session tokens.
- **Persistence & Cloud Sync**:
  - `DATABASE_PATH`: Local SQLite path (defaults to `./data/scanbeforeeat.sqlite`).
  - `DATABASE_URL`: Optional PostgreSQL connection URI for Supabase or Render Postgres.
- **Third-Party Services**:
  - `NVIDIA_API_KEY`: NVIDIA NIM inference key for deep ingredient synthesis.
  - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Razorpay billing gateway credentials.
  - `SMTP_*`: Mail server connection credentials for email OTP authentication.

---

## 🧪 Testing & Verification

ScanBeforeEat enforces strict verification gates. Always run the automated test suites before committing changes:

```bash
# Run all server tests (53+ test cases)
npm --prefix server test

# Run all frontend tests (74+ test cases)
npm --prefix frontend test

# Run all test suites across the monorepo
npm test

# Verify production builds
npm --prefix server run build
npm --prefix frontend run build
```

---

## 🚢 Deployment

The repository includes a production-ready [render.yaml](file:///render.yaml) configuration specifying:
1. **Frontend Web Service**: Static Next.js distribution with edge rewriting.
2. **API Server**: Node.js web service running the compiled Express TypeScript backend with health-check monitoring at `/api/health`.

For custom infrastructure deployments (Docker, AWS, Vercel), consult [docs/DEPLOYMENT.md](file:///docs/DEPLOYMENT.md).

---

## 🤝 Contributing

We welcome community contributions! Please review:
- [CONTRIBUTING.md](file:///CONTRIBUTING.md) for branch naming conventions, workflow policies, and our mandatory testing checklist.
- [CODE_OF_CONDUCT.md](file:///CODE_OF_CONDUCT.md) for community behavior expectations.

---

## 🛡️ Security

To report security vulnerabilities or privacy concerns, please read [SECURITY.md](file:///SECURITY.md) for our private disclosure process.

---

## 📄 License

This project is licensed under the permissive terms of the [LICENSE](file:///LICENSE).
