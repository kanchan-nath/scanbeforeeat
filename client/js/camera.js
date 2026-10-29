/**
 * Mobile Camera Scanner Manager
 * Handles getUserMedia permissions, stream lifecycle, track release, and frame capture.
 */

let activeStream = null;
let currentFacingMode = 'environment';

export async function startCamera(videoElement, preferredFacingMode = 'environment') {
  stopCamera(); // Clean up any existing stream

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Camera access is not supported by your current browser.');
  }

  currentFacingMode = preferredFacingMode;

  const constraints = {
    audio: false,
    video: {
      facingMode: { ideal: preferredFacingMode }
    }
  };

  try {
    activeStream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = activeStream;
    videoElement.setAttribute('playsinline', 'true');
    videoElement.setAttribute('webkit-playsinline', 'true');
    videoElement.muted = true;
    await videoElement.play().catch(() => {});
    return activeStream;
  } catch (err) {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      throw new Error('Camera permission was denied. Please allow camera access in your mobile browser settings to scan food labels.');
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      throw new Error('No camera found on this device.');
    }
    throw new Error(`Unable to access camera: ${err.message}`);
  }
}

export function stopCamera() {
  if (activeStream) {
    activeStream.getTracks().forEach(track => {
      track.stop();
    });
    activeStream = null;
  }
}

export function isCameraRunning() {
  return Boolean(activeStream && activeStream.active);
}

/**
 * Capture high-resolution still frame from active video element
 */
export function captureFrame(videoElement) {
  if (!videoElement || videoElement.videoWidth === 0) {
    throw new Error('Camera video stream is not ready for capture.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  return canvas;
}

export function toggleFacingMode(videoElement) {
  const newFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
  return startCamera(videoElement, newFacingMode);
}
