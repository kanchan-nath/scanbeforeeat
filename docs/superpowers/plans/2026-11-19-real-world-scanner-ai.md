# Real-World Barcode & Ingredient Scanner with AI Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the mock scanner into a production-grade, real-world camera scanner supporting live barcode detection, ingredient label photography & OCR, and multimodal AI analysis (NVIDIA NIM API with zero-downtime offline toxicology fallback), with exhaustive edge-case coverage and multi-agent verification.

**Architecture:** 
- Frontend: Next.js client component with HTML5 Camera Stream (`html5-qrcode` & HTML5 Canvas), dual-mode viewfinder (Barcode video reticle & Ingredient Photo lens), client-side photo downsampling/compression (<1MB), torch/camera flip controls, and comprehensive camera permission/error fallbacks.
- Backend: Express endpoint `/api/scan` expanded with `/api/scan/ai-status` and `/api/scan/ai-extract`, powered by a new `server/src/services/ai.ts` module integrating NVIDIA NIM multimodal vision API (`meta/llama-3.2-11b-vision-instruct` / `meta/llama-3.1-70b-instruct`) and an intelligent local toxicology engine handling 120+ additives, allergens, NOVA classification, and score deductions.
- Resiliency: Zero-downtime fallback if NVIDIA API key is missing or throttled, barcode format/checksum validation, debounce guards, non-food image detection, and quota enforcement.

**Tech Stack:** Next.js 16 (React 19), Express 4 (TypeScript), `html5-qrcode`, `tesseract.js` (client OCR helper), NVIDIA NIM REST API, SQLite (better-sqlite3), Vitest.

**Spec:** Real-world camera scanning for barcodes and ingredient labels with AI-driven toxicology monograph generation, handling all hardware, network, and input edge cases.

## Global Constraints
- Target Node.js >= 22.5.0
- React 19 / Next.js 16 App Router client compatibility (no SSR window/navigator access bugs)
- Zero build or test regressions across existing 48 frontend tests and 18 server tests
- Respect user plan scan quotas (`free`: 15, `pro`: 99)
- Always provide fallback when `NVIDIA_API_KEY` is not present, while seamlessly utilizing it when present

---

### Task 1: Backend AI Service & Toxicology Analysis Engine (`server/src/services/ai.ts`)

**Files:**
- Create: `server/src/services/ai.ts`
- Modify: `server/src/index.ts:281-354`
- Test: `server/__tests__/ai_scanner.test.ts`

**Interfaces:**
- Consumes: `CleanProduct` from `server/src/services/openfoodfacts.ts`
- Produces: `analyzeIngredientsTextWithAI(text, nameHint?)`, `analyzeFoodImageWithAI(imageBase64, mimeType?)`, `getAiServiceStatus()`

- [ ] **Step 1: Write failing tests in `server/__tests__/ai_scanner.test.ts`**
  Cover:
  - Text analysis parsing additives (E-numbers, chemical names), allergens, NOVA classification, and deductions.
  - Image base64 analysis handling (mocking NVIDIA NIM or verifying fallback).
  - Edge cases: empty text, non-food input text, corrupted base64, missing NVIDIA key fallback, rate-limit fallback.
- [ ] **Step 2: Run test to confirm failures**
- [ ] **Step 3: Implement `server/src/services/ai.ts`**
  - NVIDIA NIM API caller using `process.env.NVIDIA_API_KEY` and model `meta/llama-3.2-11b-vision-instruct` (or `meta/llama-3.1-70b-instruct`).
  - Comprehensive toxicology rule-based analyzer covering 120+ additives, allergens, NOVA 1-4 calculation, and health score deductions.
  - Non-food item detection returning appropriate friendly error/score.
- [ ] **Step 4: Update `server/src/index.ts`**
  - Support `image` and `imageType` in `POST /api/scan`.
  - Add `GET /api/scan/ai-status` and `POST /api/scan/ai-extract`.
  - Cache AI-analyzed products into SQLite `products` table so subsequent scans are instant.
- [ ] **Step 5: Run tests and verify all pass**
- [ ] **Step 6: Commit changes**

---

### Task 2: Install and Configure Frontend Scanner Dependencies

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/src/lib/camera.ts`
- Test: `frontend/__tests__/camera.test.ts`

**Interfaces:**
- Produces: `isCameraSupported()`, `compressImageForUpload(fileOrDataUrl, maxDimension, quality)`, `validateBarcode(code)`

- [ ] **Step 1: Install `html5-qrcode` and `tesseract.js` in `frontend`**
- [ ] **Step 2: Write failing unit test for camera utility and image compressor in `frontend/__tests__/camera.test.ts`**
- [ ] **Step 3: Implement `frontend/src/lib/camera.ts`**
  - Check browser camera support (`navigator.mediaDevices.getUserMedia`).
  - Client-side image resizer/compressor via HTML5 `<canvas>` to ensure high-res smartphone photos (12-48MP) are downsampled to <=1600px and compressed to JPEG <= 800KB before upload.
  - Barcode format & checksum validators (EAN-13, EAN-8, UPC-A, Code 128).
- [ ] **Step 4: Run tests and verify all pass**
- [ ] **Step 5: Commit changes**

---

### Task 3: Real-World Barcode & Ingredient Camera Scanner Component

**Files:**
- Create: `frontend/src/components/scanner/BarcodeCamera.tsx`
- Create: `frontend/src/components/scanner/IngredientCamera.tsx`
- Modify: `frontend/src/app/scanner/page.tsx`
- Modify: `frontend/src/lib/api.ts`

**Interfaces:**
- Consumes: `performScan` with optional `image` payload from `frontend/src/lib/api.ts`
- Produces: Interactive camera viewfinders for Barcode (live auto-detect) and Ingredient (live capture + photo upload + OCR preview)

- [ ] **Step 1: Update `frontend/src/lib/api.ts`**
  - Add `image` and `imageType` to `performScan` parameters.
  - Add `fetchAiStatus()`.
- [ ] **Step 2: Create `BarcodeCamera.tsx`**
  - Uses `html5-qrcode` with auto-start on mount, auto-cleanup on unmount.
  - Supports camera switching (rear/environment vs front/user).
  - Torch / flashlight toggle button with capability detection.
  - File upload fallback button ("Upload Barcode Photo").
  - Debounce lock: once a barcode is detected, triggers visual lock, plays sound/haptic feedback, and pauses stream to prevent duplicate scans.
  - User-friendly error handlers for `NotAllowedError`, `NotFoundError`, and unsecure origin with clear fallback UI.
- [ ] **Step 3: Create `IngredientCamera.tsx`**
  - Live video camera preview with "Capture Label Photo" button.
  - "Upload Photo from Gallery" file drop/input.
  - Image review mode: show captured/uploaded photo, with "Retake", "Crop/Focus", and "Analyze with AI" actions.
  - Optional client OCR preview with `tesseract.js` if user wants to see and edit extracted text before analysis.
  - Animated AI processing states ("Extracting ingredients...", "Screening 120+ additives...", "Classifying NOVA score...").
- [ ] **Step 4: Update `frontend/src/app/scanner/page.tsx`**
  - Integrate `BarcodeCamera` and `IngredientCamera`.
  - Display live AI telemetry badge (NVIDIA NIM Active vs High-Speed Toxicology Engine).
  - Handle all scanning modes cleanly with tabs: "Barcode Camera", "Ingredient Camera", "Manual Lookup".
  - Include quick preset buttons below the scanner for one-tap sample testing.
- [ ] **Step 5: Run frontend tests to ensure no regressions**
- [ ] **Step 6: Commit changes**

---

### Task 4: Edge Cases Hardening & Safety Guards

**Files:**
- Modify: `server/src/services/ai.ts`
- Modify: `server/src/index.ts`
- Modify: `frontend/src/app/scanner/page.tsx`
- Test: `server/__tests__/scanner_edge_cases.test.ts`
- Test: `frontend/__tests__/scanner_edge_cases.test.tsx`

**Interfaces:**
- Produces: Exhaustive resilience for camera errors, corrupted images, non-food items, quota limits, and API failures.

- [ ] **Step 1: Write comprehensive edge-case tests in `server/__tests__/scanner_edge_cases.test.ts`**
  - Test 1: Quota exceeded stops scan before AI processing.
  - Test 2: Uncataloged barcode gracefully handled.
  - Test 3: Non-food image or nonsensical text returns guidance rather than hallucinatory additives.
  - Test 4: Giant image base64 processed without server crash.
  - Test 5: Malformed JSON or prompt injection in ingredients sanitized.
  - Test 6: Offline fallback behaves identically to schema when NVIDIA key is absent.
- [ ] **Step 2: Write frontend edge-case component tests in `frontend/__tests__/scanner_edge_cases.test.tsx`**
  - Test 1: Camera permission denied surfaces friendly error UI and file upload.
  - Test 2: Debounced barcode prevents rapid duplicate submission.
  - Test 3: Large image compressed before sending to API.
- [ ] **Step 3: Run tests, implement any missing guards, verify all pass**
- [ ] **Step 4: Commit changes**

---

### Task 5: Multi-Agent Swarm Testing & End-to-End Verification

**Files:**
- Test scripts & automated verification across frontend and server

- [ ] **Step 1: Dispatch subagents to run focused verification tasks:**
  - Subagent A: Test Barcode scanning with standard UPC/EAN barcodes and uncataloged barcodes.
  - Subagent B: Test Ingredient AI scanner with real food ingredient texts (Maggi, Doritos, clean organic oats, energy drinks, allergen-heavy products).
  - Subagent C: Stress-test edge cases (network timeouts, non-food images, huge payloads, quota boundaries).
- [ ] **Step 2: Review findings from all subagents, fix any reported issues.**
- [ ] **Step 3: Verify all test suites pass (both frontend and backend).**
- [ ] **Step 4: Final verification and summary presentation.**
