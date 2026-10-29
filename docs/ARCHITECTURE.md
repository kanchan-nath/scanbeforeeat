# ScanBeforeEat — System Architecture

## 1. High-Level Architecture Overview

```mermaid
graph TD
    subgraph Client["Mobile PWA (<= 599px) / Desktop Blocker (>= 600px)"]
        UI[Vanilla JS ES Modules]
        Router[AppRouter - 16 Views]
        Cam[Camera API & Canvas Preprocessor]
        OCR[Tesseract.js Client Worker]
        BC[ZXing Barcode Reader]
        SW[Service Worker & App Shell Cache]
    end

    subgraph Server["Node.js / Express.js Backend"]
        MW[Security: Helmet CSP, CSRF, Rate Limiting, Correlation ID]
        Auth[Auth Controller & Argon2id Hashing]
        ScanCtrl[Scan & Report Controller]
        ProdCtrl[Product Lookup Controller]
        SessStore[Native MySQL Session Store]
        AISvc[AI Analysis Service & Zod Validation]
        ScoreSvc[Transparent Scoring Engine v1.0]
    end

    subgraph Data["Persistence & External Services"]
        MySQL[(MySQL 8+ Database)]
        NVIDIA[NVIDIA NIM / LLM API]
        OFF[Open Food Facts Catalogue API]
    end

    UI --> Router
    Router --> Cam
    Router --> OCR
    Router --> BC
    Router -->|fetch + x-csrf-token| MW

    MW --> Auth
    MW --> ScanCtrl
    MW --> ProdCtrl
    Auth --> SessStore
    SessStore --> MySQL

    ScanCtrl --> AISvc
    AISvc --> ScoreSvc
    AISvc -->|HTTPS Authorization: Bearer| NVIDIA
    ProdCtrl -->|HTTPS User-Agent| OFF
    ScanCtrl -->|Parameterized SQL| MySQL
```

---

## 2. Layer Responsibilities

### 2.1 Client Layer (`client/`)
- **Vanilla ES Modules**: No heavy frontend framework runtime; zero compilation overhead; native browser loading.
- **Progressive Web App**: Manifest (`manifest.webmanifest`), service worker (`service-worker.js`), offline fallback.
- **Mobile-First & Desktop Blocker**: Viewport enforcement via CSS media queries (`max-width: 599px`) and programmatic JavaScript window listener.
- **Client-Side Image Preprocessing**: Downscales and enhances contrast on `<canvas>` before feeding images into Tesseract.js.

### 2.2 Server Architecture (`server/`)
- **`server/app.js`**: Express configuration, Helmet with tailored Content Security Policy, rate limiting, and static serving.
- **`server/config/`**: Zod environment validation (`env.js`) and MySQL connection pool (`database.js`).
- **`server/middleware/`**:
  - `session-store.js`: Custom MySQL session store replacing vulnerable external packages.
  - `csrf.middleware.js`: Cryptographic CSRF token validation.
  - `auth.middleware.js`: Multi-tenant ownership verification (`checkOwnership`).
  - `rate-limit.middleware.js`: Segmented rate limiters for auth, AI, and barcodes.
  - `correlation-id.middleware.js`: Request correlation ID tracking.
- **`server/services/`**:
  - `ai.service.js`: NVIDIA NIM API client with bounded retries, prompt-injection defenses, and mock fallback.
  - `scoring.service.js`: Versioned transparent product scoring algorithm.
  - `product-data.service.js`: Open Food Facts API integration and MySQL caching.
- **`server/repositories/`**: Parameterized SQL query abstractions for `users`, `scans`, and `reports`.

---

## 3. Data Flow: End-to-End Scan & Analysis Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as Consumer (Mobile)
    participant UI as Mobile PWA Client
    participant API as Express API Server
    participant DB as MySQL Database
    participant AI as NVIDIA NIM LLM

    User->>UI: Captures label via camera or types text
    UI->>UI: Tesseract OCR extracts text & user reviews in editor
    User->>UI: Confirms ingredient list & taps "Analyze"
    UI->>API: POST /api/v1/scans (creates scan record)
    API->>DB: INSERT INTO scans (user_id, ingredients_text)
    DB-->>API: scan_id
    API-->>UI: 201 Created (scan_id)

    UI->>API: POST /api/v1/scans/:id/analyze
    API->>API: Validates session & verifies scan ownership
    API->>AI: Constrained system prompt + ingredient list
    AI-->>API: Structured JSON output
    API->>API: Validates response against aiReportSchema (Zod)
    API->>API: Computes educational profile score (v1.0)
    API->>DB: INSERT INTO reports & report_ingredients (Transaction)
    API-->>UI: 200 OK (Validated structured report)
    UI->>User: Displays interactive score gauge & accordion report
```
