# ScanBeforeEat — AI Intelligence, Evidence Standards & Scoring Methodology

## 1. NVIDIA NIM LLM Integration Architecture

ScanBeforeEat integrates with the **NVIDIA API Catalog** (NVIDIA NIM) using an OpenAI-compatible HTTP interface:
- **Default Endpoint**: `https://integrate.api.nvidia.com/v1/chat/completions`
- **Supported Models**: `meta/llama-3.3-70b-instruct`, `mistralai/mistral-large-2-instruct`, or other models configured via `NVIDIA_MODEL`.
- **Backend Key Isolation**: The `NVIDIA_API_KEY` remains strictly on the Node.js backend server. It is never transmitted to the browser, stored in client cookies, or exposed in frontend bundles.

### 1.1 Development Mock Mode (`AI_MOCK_MODE=true`)
When `AI_MOCK_MODE=true` (or when `NVIDIA_API_KEY` is not yet configured), the backend uses a deterministic, rule-based scientific mock generator. This guarantees:
- Fast, predictable local development without consuming API credits.
- Instant automated unit and integration tests.
- High-fidelity mock responses that strictly validate against the identical production Zod schema (`aiReportSchema`).

---

## 2. Prompt Injection Defense & Input Sanitization

User-submitted text from OCR scans, photo uploads, manual typing, and barcode catalogues is treated as **untrusted data**.

To prevent prompt injection:
1. Input text is framed within explicit block quotation boundaries (`"""`).
2. The system prompt contains negative instructions preventing the model from executing code, modifying database state, or altering system instructions.
3. The response format is strictly enforced as JSON (`response_format: { type: 'json_object' }`).
4. The output must parse and validate through the strict Zod schema; any extraneous or invalid fields are rejected with an explicit error.

---

## 3. Scientific Accuracy & Disease Risk Policy

ScanBeforeEat strictly adheres to evidence-based public health principles:

### 3.1 Prohibition of Fabricated Disease Probabilities
- Language models are prone to generating pseudo-statistical statements such as *"73% chance of developing diabetes."*
- ScanBeforeEat strictly **forbids** generating arbitrary percentages.
- All disease-related risk sections set `hasNumericProbability: false` by default, displaying the explicit statement:
  > *"No reliable percentage is available for this specific ingredient and consumption pattern."*
- An epidemiological risk ratio or percentage is included ONLY when an authoritative, peer-reviewed source or public health authority provides a validated statistical estimate for a studied population.

### 3.2 Hazard vs Exposure vs Risk
- An ingredient's safety profile depends on dosage, frequency, and personal health context.
- Synthetic substances are not automatically harmful, and natural substances are not automatically harmless.
- Multi-use ingredients (e.g. food additives also used in cosmetic or industrial formulations) are accompanied by a clear note explaining that food-grade purity, delivery routes, and authorized concentration levels differ significantly.

---

## 4. Transparent Educational Profile Scoring (v1.0)

The overall product score (0–100) is presented strictly as an **educational product-profile score**, not a medical measurement or probability of disease.

```
Starting Base Score: 70

Nutritional Modifiers (when declared):
  - Sugars:
      > 15g:   -15
      8g-15g:  -8
      <= 4g:   +4
  - Sodium:
      > 600mg: -15
      350-600mg: -7
  - Saturated Fat:
      > 5g:    -10
  - Dietary Fiber:
      >= 3g:   +8
  - Protein:
      >= 6g:   +5

Ingredient Modifiers:
  - Wholesome whole-food / grain foundation: +4 per item (max +15)
  - Partially hydrogenated / trans fats: -20
  - Ingredients requiring caution: -8 each

Clamping Bounds:
  - Minimum: 15
  - Maximum: 95
  (Scores of 100 or 0 are avoided to prevent false absolutism)
```

If neither nutritional panels nor sufficient ingredient context is available, the algorithm outputs `null` with the reason:
> *"Insufficient data for a reliable score."*

---

## 5. Authoritative Public Health References

All evaluations cross-reference recognized public health standards:
1. **Food Safety and Standards Authority of India (FSSAI)**: Food Products Standards and Food Additives Regulations.
2. **World Health Organization (WHO)**: Healthy Diet Factsheets and Sugar/Sodium Intake Guidelines.
3. **European Food Safety Authority (EFSA)**: Scientific Opinions on Food Additives.
4. **U.S. Food and Drug Administration (FDA)**: Generally Recognized as Safe (GRAS) Notices and Code of Federal Regulations Title 21.
