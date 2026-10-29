/**
 * Client-Side OCR Pipeline with Canvas Preprocessing & Text Normalization
 */

let tesseractInstance = null;

async function loadTesseract() {
  if (tesseractInstance) return tesseractInstance;

  // 1. Check if Tesseract is already available on window
  if (typeof window !== 'undefined' && window.Tesseract && typeof window.Tesseract.createWorker === 'function') {
    tesseractInstance = window.Tesseract;
    return tesseractInstance;
  }

  // 2. Try loading jsDelivr +esm bundle (which exports createWorker directly)
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/tesseract.js@5/+esm');
    if (typeof mod.createWorker === 'function') {
      tesseractInstance = mod;
      return tesseractInstance;
    }
    if (mod.default && typeof mod.default.createWorker === 'function') {
      tesseractInstance = mod.default;
      return tesseractInstance;
    }
  } catch (err) {
    console.warn('Could not load Tesseract +esm build, trying dist/tesseract.esm.min.js...', err);
  }

  // 3. Fallback to dist/tesseract.esm.min.js
  try {
    const fallback = await import('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js');
    if (fallback.default && typeof fallback.default.createWorker === 'function') {
      tesseractInstance = fallback.default;
      return tesseractInstance;
    }
    if (typeof fallback.createWorker === 'function') {
      tesseractInstance = fallback;
      return tesseractInstance;
    }
  } catch (err2) {
    console.error('Failed to load Tesseract.js fallback:', err2);
  }

  throw new Error('Could not load OCR engine. Please check your network connection.');
}

/**
 * Pre-process image on canvas to boost OCR accuracy on packaged labels:
 * 1. Downscales if excessively large
 * 2. Grayscale & contrast enhancement
 */
export function preprocessImage(imageSource) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  let width = imageSource.naturalWidth || imageSource.videoWidth || imageSource.width;
  let height = imageSource.naturalHeight || imageSource.videoHeight || imageSource.height;

  // Max dimension 1600px for mobile performance
  const maxDim = 1600;
  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(imageSource, 0, 0, width, height);

  // Apply Grayscale and Contrast adjustment
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Simple contrast multiplier
  const contrast = 25; // -255 to 255
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    // Luminance grayscale
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const adjusted = factor * (gray - 128) + 128;
    const clamped = Math.max(0, Math.min(255, adjusted));

    data[i] = clamped;     // R
    data[i + 1] = clamped; // G
    data[i + 2] = clamped; // B
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Normalize OCR text:
 * - Fix common OCR typos in ingredient lists
 * - Extract text following "Ingredients:" header if present
 * - Clean whitespace and linebreaks
 */
export function normalizeOcrText(rawText) {
  if (!rawText) return '';

  let cleaned = rawText
    // Replace OCR errors on "Ingredients" header
    .replace(/\b[il1!|]ngredients?\b/gi, 'Ingredients')
    .replace(/\b1ngredients?\s*[:\-]/gi, 'Ingredients:')
    // Unify line breaks into commas if not ending with punctuation
    .replace(/\r\n|\r/g, '\n')
    // Remove multiple spaces
    .replace(/[ \t]+/g, ' ');

  // If "Ingredients:" prefix found, prioritize text starting there
  const match = cleaned.match(/ingredients\s*[:\-]?\s*([\s\S]+)/i);
  if (match && match[1] && match[1].trim().length > 10) {
    cleaned = match[1].trim();
  }

  // Remove common footer noise like "Batch No", "Mfg Date", "Best Before", "MRP"
  cleaned = cleaned.split(/(?:mfg|batch|best before|use by|expiry|net weight|m\.r\.p|lic\. no)/i)[0].trim();

  // Clean trailing punctuation
  cleaned = cleaned.replace(/[\.\,\;\:\s]+$/, '');

  // If aggressive stripping made it empty but rawText was substantial, preserve rawText
  if (!cleaned || cleaned.length < 5) {
    cleaned = rawText.trim().replace(/[ \t]+/g, ' ');
  }

  return cleaned;
}

/**
 * Perform Client-Side OCR on canvas or image element
 */
export async function recognizeText(imageSource, onProgress = null) {
  console.log('[OCR] Step 1: Starting recognizeText...');
  const tess = await loadTesseract();
  console.log('[OCR] Step 2: Loaded Tesseract module successfully');

  const createWorkerFn = tess.createWorker || (tess.default && tess.default.createWorker);
  console.log('[OCR] Step 3: createWorkerFn type:', typeof createWorkerFn);

  if (typeof createWorkerFn !== 'function') {
    console.error('[OCR] createWorker is not a function');
    throw new Error('OCR initialization failed: createWorker is not available.');
  }

  console.log('[OCR] Step 4: Preprocessing image...');
  const preprocessedCanvas = preprocessImage(imageSource);
  console.log('[OCR] Step 4 complete. Dimensions:', preprocessedCanvas.width, preprocessedCanvas.height);

  const progressHandler = (m) => {
    if (onProgress) {
      let percent = Math.round((m.progress || 0) * 100);
      let userMessage = 'Analyzing label...';
      if (m.status === 'loading tesseract core') userMessage = 'Loading OCR engine...';
      else if (m.status === 'initializing tesseract') userMessage = 'Initializing OCR core...';
      else if (m.status === 'loading language traineddata') userMessage = `Loading model (${percent}%)...`;
      else if (m.status === 'initializing api') userMessage = 'Preparing recognition...';
      else if (m.status === 'recognizing text') userMessage = `Reading ingredients (${percent}%)...`;
      onProgress(percent, userMessage);
    }
  };

  const createWithTimeout = (options, timeoutMs = 8000) => {
    return Promise.race([
      createWorkerFn('eng', 1, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Local OCR worker timed out')), timeoutMs)
      )
    ]);
  };

  let worker;
  try {
    // 1. Try local bundled files (instant, 100% offline, zero network latency)
    worker = await createWithTimeout({
      workerPath: '/vendor/tesseract/worker.min.js',
      corePath: '/vendor/tesseract',
      langPath: '/tessdata',
      gzip: true,
      logger: progressHandler
    }, 7000);
  } catch (localErr) {
    console.warn('Local OCR worker failed or timed out, falling back to CDN worker...', localErr);
    // 2. Fallback to default remote worker
    worker = await createWorkerFn('eng', 1, {
      logger: progressHandler
    });
  }

  try {
    const { data } = await worker.recognize(preprocessedCanvas);
    console.log('[OCR] Step 7: Recognition complete! Raw text length:', data.text?.length);
    const rawText = data.text;
    const confidence = Math.round(data.confidence || 85);
    const normalizedText = normalizeOcrText(rawText);

    return {
      rawText,
      normalizedText,
      confidence
    };
  } finally {
    console.log('[OCR] Step 8: Terminating worker');
    await worker.terminate();
  }
}

export default {
  preprocessImage,
  normalizeOcrText,
  recognizeText
};
