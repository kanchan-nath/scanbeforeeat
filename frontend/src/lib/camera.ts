/**
 * Real-World Camera & Barcode Helper Utilities
 * Provides camera permission checking, image compression, and barcode verification.
 */

export interface BarcodeValidationResult {
  valid: boolean;
  format?: "EAN-13" | "UPC-A" | "EAN-8" | "CODE-128/QR" | "CUSTOM";
  error?: string;
  cleanedCode?: string;
  checksumVerified?: boolean;
}

/**
 * Validates UPC/EAN standard barcodes and general barcode formats
 */
export function validateBarcode(input: string): BarcodeValidationResult {
  if (!input || typeof input !== "string") {
    return { valid: false, error: "Empty or invalid barcode string." };
  }

  const cleaned = input.trim();
  if (cleaned.length < 4) {
    return { valid: false, error: "Barcode is too short (minimum 4 characters)." };
  }

  // Check if pure digits
  const isDigitsOnly = /^\d+$/.test(cleaned);

  if (isDigitsOnly) {
    if (cleaned.length === 13) {
      const isCheckValid = verifyMod10Checksum(cleaned, [1, 3]);
      return {
        valid: true,
        format: "EAN-13",
        cleanedCode: cleaned,
        checksumVerified: isCheckValid,
      };
    }

    if (cleaned.length === 12) {
      const isCheckValid = verifyMod10Checksum(cleaned, [3, 1]);
      return {
        valid: true,
        format: "UPC-A",
        cleanedCode: cleaned,
        checksumVerified: isCheckValid,
      };
    }

    if (cleaned.length === 8) {
      const isCheckValid = verifyMod10Checksum(cleaned, [3, 1]);
      return {
        valid: true,
        format: "EAN-8",
        cleanedCode: cleaned,
        checksumVerified: isCheckValid,
      };
    }

    // 14-digit GTIN or other valid length
    if (cleaned.length >= 8 && cleaned.length <= 14) {
      return { valid: true, format: "CUSTOM", cleanedCode: cleaned };
    }
  }

  // Alphanumeric barcodes (e.g. Code 128, Code 39, QR code payload)
  if (/^[A-Za-z0-9\-_.]+$/.test(cleaned)) {
    return { valid: true, format: "CODE-128/QR", cleanedCode: cleaned };
  }

  return { valid: false, error: "Barcode contains invalid characters." };
}

function verifyMod10Checksum(digits: string, weights: [number, number]): boolean {
  const nums = digits.split("").map(Number);
  const checkDigit = nums[nums.length - 1];
  const payload = nums.slice(0, nums.length - 1);

  let sum = 0;
  for (let i = 0; i < payload.length; i++) {
    const weight = weights[i % 2];
    sum += payload[i] * weight;
  }

  const remainder = sum % 10;
  const calculatedCheck = remainder === 0 ? 0 : 10 - remainder;
  return calculatedCheck === checkDigit;
}

/**
 * Checks if the user's browser environment supports camera access
 */
export function isCameraSupported(): { supported: boolean; reason?: string } {
  if (typeof window === "undefined") {
    return { supported: false, reason: "Server-side rendering environment." };
  }

  if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      supported: false,
      reason: "Camera access API (getUserMedia) is not supported in this browser or webview.",
    };
  }

  // Check secure context (localhost or HTTPS is required by browsers for camera)
  if (window.isSecureContext === false) {
    return {
      supported: false,
      reason: "Camera access requires an HTTPS connection or localhost.",
    };
  }

  return { supported: true };
}

/**
 * Compresses an image file or Base64 data URL via HTML5 Canvas
 * Downsamples high-resolution smartphone photos (e.g. 12-48MP) to maximum dimension <= 1600px
 * and compresses to JPEG with 85% quality to keep payload well under 1MB.
 */
export async function compressImageForUpload(
  source: File | string,
  maxDimension = 1600,
  quality = 0.85
): Promise<{ base64: string; mimeType: string; originalSize: number; compressedSize: number }> {
  if (typeof window === "undefined") {
    throw new Error("Canvas compression is only available in browser client.");
  }

  return new Promise((resolve, reject) => {
    let originalSize = 0;
    const img = new Image();

    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Unable to create canvas 2D context"));
        }

        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = "image/jpeg";
        const base64 = canvas.toDataURL(mimeType, quality);
        const compressedSize = Math.round((base64.length * 3) / 4);

        resolve({
          base64,
          mimeType,
          originalSize: originalSize || compressedSize,
          compressedSize,
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image into canvas for compression."));
    };

    if (typeof source === "string") {
      originalSize = Math.round((source.length * 3) / 4);
      img.src = source;
    } else {
      originalSize = source.size;
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    }
  });
}
