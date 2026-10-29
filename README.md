# ScanBeforeEat — AI-Powered Food Ingredient Intelligence Platform

[![Node.js CI](https://img.shields.io/badge/Node.js-v20%2B-brightgreen.svg)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-blue.svg)](https://www.mysql.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Mobile--First-lime.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Security Audited](https://img.shields.io/badge/Security-Argon2id%20%7C%20CSRF%20%7C%20CSP-black.svg)](docs/SECURITY.md)

**ScanBeforeEat** is a mobile-first Progressive Web Application (PWA) that translates complex food-package ingredient labels into understandable, evidence-aware consumer health intelligence.

---

## 🌟 Key Features

1. **Mobile-Only Interface & Dedicated Desktop Blocker**:
   - Built exclusively for mobile devices (viewport widths up to 599px).
   - Desktop and laptop screens (≥ 600px) display an off-white and lime-green desktop blocker featuring a CSS phone illustration, QR code, and copy-link action.
2. **Multi-Modal Ingredient Capture**:
   - **Live Camera Scanner**: `navigator.mediaDevices` with real-time framing guide and camera switching.
   - **Client-Side OCR**: `Tesseract.js` worker with canvas preprocessing (grayscale, contrast enhancement) and text normalization.
   - **Barcode Identification**: `@zxing/browser` camera scanner integrated with Open Food Facts API and MySQL caching.
   - **Manual Text Entry**: Paste or type ingredients with demo sample buttons.
3. **Mandatory OCR Review & Correction**:
   - Users review and correct extracted text before submitting it for AI analysis.
4. **Constrained AI Ingredient Intelligence**:
   - Integrated with **NVIDIA NIM** (`meta/llama-3.3-70b-instruct`) with strict Zod JSON schema validation.
   - Deterministic development mock mode for local testing without external API dependency.
   - Explains ingredient technological functions, potential benefits, and evidence quality.
   - Discloses non-food uses (cosmetics, pharmaceuticals, industrial) with educational clarity.
5. **Transparent Educational Profile Scoring (v1.0)**:
   - Educational score from 15 to 95 based on whole-food foundations and declared sugars, sodium, and saturated fats.
   - Returns `null` when data is insufficient, preventing false precision.
6. **Scientific Integrity & Disease Context**:
   - Strictly prohibits fabricated percentage gauges (e.g. *"73% chance of diabetes"*).
   - Distinguishes observational dietary associations from direct causal claims.
   - References authoritative public health sources (WHO, FSSAI, US FDA, EFSA).
7. **Personal Scan History & Multi-Product Comparison**:
   - Server-side search, filtering by scan method and verdict, and pagination.
   - Side-by-side comparison of 2 to 3 saved products.
8. **Security & Privacy by Design**:
   - Multi-tenant data ownership verification at both route and database query levels.
   - Cryptographic CSRF protection, Helmet Content Security Policy, and rate limiting.
   - `argon2id` password hashing and persistent MySQL session store.
   - Full GDPR-compliant data export (JSON) and one-click permanent account deletion.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Vanilla JavaScript (ES Modules), HTML5, CSS3 Custom Properties, Progressive Web App |
| **Scanning & OCR** | `Tesseract.js` (Client-side), `@zxing/browser` (Barcode reader), HTML5 Canvas |
| **Backend** | Node.js (v24), Express.js (ES modules) |
| **Database** | MySQL 8.0+ (`mysql2/promise`), Native MySQL Session Store |
| **Security** | `argon2`, `helmet` (CSP), `express-rate-limit`, `cookie-parser`, CSRF Middleware |
| **Validation** | `zod` for request and AI response validation |
| **AI Provider** | NVIDIA NIM LLM API (`https://integrate.api.nvidia.com/v1`) |
| **Catalogue API** | Open Food Facts API (with compliant User-Agent attribution) |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v20 or newer (`node -v`)
- **MySQL**: 8.0+ or compatible running locally or via Docker (`mysql --version`)

### 2. Installation
```bash
git clone https://github.com/kanchan-nath/scanbeforeeat.git
cd scanbeforeeat
npm install
```

### 3. Database Setup
Log into MySQL and create the database:
```sql
CREATE DATABASE IF NOT EXISTS scanbeforeeat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'scanbeforeeat_app'@'localhost' IDENTIFIED BY 'scanbeforeeat_dev_2026';
GRANT ALL PRIVILEGES ON scanbeforeeat.* TO 'scanbeforeeat_app'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```

Verify your `.env` settings:
```dotenv
NODE_ENV=development
PORT=3000
APP_BASE_URL=http://localhost:3000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=scanbeforeeat
DB_USER=scanbeforeeat_app
DB_PASSWORD=scanbeforeeat_dev_2026
DB_SOCKET_PATH=/tmp/mysql_brew.sock # or leave empty if using TCP
DB_SSL=false

SESSION_SECRET=dev_scanbeforeeat_secret_session_key_32_chars_long_minimum_value

# NVIDIA NIM API (Leave empty for deterministic mock mode)
NVIDIA_API_KEY=
NVIDIA_API_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=meta/llama-3.3-70b-instruct

AI_MOCK_MODE=true
```

### 5. Run Database Migrations & Demonstration Seed
```bash
# Run relational table migrations
npm run db:migrate

# Seed realistic demo products and initial scans
npm run db:seed
```

### 6. Start the Server
```bash
# Production mode
npm start

# Or Development mode with live watcher
npm run dev
```

Visit the application at [http://localhost:3000](http://localhost:3000).

---

## 🧪 Running Automated Tests

Run the full automated test suite (Unit, Integration, and Security tests):
```bash
npm test
```

Test coverage includes:
- ✅ Barcode format and length validation
- ✅ Educational scoring algorithm (modifiers, fiber bonus, sugar penalties, clamping)
- ✅ Zod AI report schema validation & mock generation
- ✅ 401 unauthenticated endpoint protection
- ✅ Cryptographic CSRF token enforcement (403 on missing token)
- ✅ User registration & session generation
- ✅ Multi-tenant scan ownership isolation (User B cannot read or delete User A's data)
- ✅ Full AI analysis and transactional report generation

---

## 📱 Testing on Physical Mobile Devices (Over HTTPS)

The Browser Camera API (`navigator.mediaDevices.getUserMedia`) requires a **secure HTTPS context** to operate on remote mobile devices.

To test camera scanning and barcode detection on your smartphone:

1. **Start the local server**:
   ```bash
   npm start
   ```
2. **Create an HTTPS tunnel using ngrok**:
   ```bash
   ngrok http 3000
   ```
3. Open the generated `https://xxxx.ngrok-free.app` URL on your smartphone's browser (Safari on iOS or Chrome on Android).
4. Tap **"Scan ingredients"** -> **"Camera Label Scanner"** and grant camera permission when prompted.

---

## 📚 Technical Documentation

- [System Architecture](docs/ARCHITECTURE.md)
- [Database Schema & ER Diagram](docs/DATABASE.md)
- [Security & Abuse Prevention](docs/SECURITY.md)
- [AI Intelligence & Evidence Standards](docs/AI_AND_EVIDENCE.md)
- [Production Deployment Guide](docs/DEPLOYMENT.md)

---

## ⚖️ Scientific & Medical Disclaimer

ScanBeforeEat provides educational ingredient context synthesized from food regulations and scientific literature. It does **not** provide clinical diagnosis, individual medical recommendations, or emergency assistance for acute allergic reactions. Consumers should always consult qualified healthcare professionals for personal dietary and medical decisions.
