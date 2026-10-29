/**
 * Client-Side Barcode Scanner using @zxing/browser with Web Audio Chime
 */

let zxingReader = null;
let activeControls = null;

async function loadZXing() {
  if (zxingReader) return zxingReader;
  try {
    const zxing = await import('https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/+esm');
    zxingReader = new zxing.BrowserMultiFormatReader();
    return zxingReader;
  } catch (err) {
    console.error('Failed to load @zxing/browser:', err);
    throw new Error('Barcode scanning library could not be loaded.');
  }
}

/**
 * Play a short, pleasant electronic chime on detection
 */
export function playChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12); // E6 note

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {
    // Audio context may be restricted by autoplay policy
  }
}

/**
 * Start continuous scanning on a <video> element
 */
export async function startBarcodeScanner(videoElement, onDetected) {
  stopBarcodeScanner();

  const reader = await loadZXing();

  try {
    activeControls = await reader.decodeFromVideoDevice(
      undefined, // default camera device
      videoElement,
      (result, err) => {
        if (result && result.getText()) {
          const barcode = result.getText().trim();
          playChime();
          stopBarcodeScanner();
          onDetected(barcode);
        }
      }
    );
    return activeControls;
  } catch (err) {
    console.error('ZXing camera error:', err);
    throw err;
  }
}

export function stopBarcodeScanner() {
  if (activeControls) {
    try {
      activeControls.stop();
    } catch (e) {}
    activeControls = null;
  }
}

export default {
  startBarcodeScanner,
  stopBarcodeScanner,
  playChime
};
