"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { isCameraSupported, compressImageForUpload, stopMediaTracks } from "@/lib/camera";

interface IngredientCameraProps {
  onAnalyzeImage: (imageBase64: string, mimeType: string, extractedText?: string) => void;
  onAnalyzeText: (text: string) => void;
  isScanning: boolean;
  onSwitchToBarcode?: () => void;
}

export default function IngredientCamera({
  onAnalyzeImage,
  onAnalyzeText,
  isScanning,
  onSwitchToBarcode,
}: IngredientCameraProps) {
  const [cameraState, setCameraState] = useState<
    "idle" | "requesting" | "running" | "stopped" | "denied" | "error" | "unsupported"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedMime, setCapturedMime] = useState<string>("image/jpeg");
  const [compressionMetrics, setCompressionMetrics] = useState<{ original: number; compressed: number } | null>(null);

  // Client OCR state
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [extractedText, setExtractedText] = useState("");
  const [showTextEditor, setShowTextEditor] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isMountedRef = useRef(true);
  const startSeqRef = useRef(0);
  const userDisabledRef = useRef(false);

  const stopCamera = useCallback(() => {
    // 1. Immediately stop all tracks on the active stream
    if (streamRef.current) {
      stopMediaTracks(streamRef.current);
      streamRef.current = null;
    }
    // 2. Stop and clear the video element
    if (videoRef.current) {
      stopMediaTracks(videoRef.current);
    }
  }, []);

  const startCamera = useCallback(async () => {
    const currentSeq = ++startSeqRef.current;
    userDisabledRef.current = false;

    const support = isCameraSupported();
    if (!support.supported) {
      if (isMountedRef.current) {
        setCameraState("unsupported");
        setErrorMessage(support.reason || "Camera not available.");
      }
      return;
    }

    try {
      stopCamera();
      if (!isMountedRef.current || currentSeq !== startSeqRef.current || userDisabledRef.current) {
        return;
      }

      setCameraState("requesting");
      setErrorMessage("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      // If unmounted or cancelled while getUserMedia was resolving, release stream immediately!
      if (!isMountedRef.current || currentSeq !== startSeqRef.current || userDisabledRef.current) {
        stopMediaTracks(stream);
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
          }
        } catch (playErr: any) {
          // Ignore AbortError when element is removed or paused during tab changes
          if (playErr?.name === "AbortError" || playErr?.message?.includes("interrupted")) {
            return;
          }
          throw playErr;
        }
      }

      // Check once more after playPromise
      if (!isMountedRef.current || currentSeq !== startSeqRef.current || userDisabledRef.current) {
        stopCamera();
        return;
      }

      setCameraState("running");
      setErrorMessage("");
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.message?.includes("interrupted")) {
        return;
      }
      stopCamera();
      if (!isMountedRef.current || currentSeq !== startSeqRef.current) return;

      const name = err?.name || "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setCameraState("denied");
        setErrorMessage("Camera access denied. Please grant camera permissions in your browser.");
      } else if (name === "NotFoundError") {
        setCameraState("error");
        setErrorMessage("No camera hardware detected on this device.");
      } else if (name === "NotReadableError") {
        setCameraState("error");
        setErrorMessage("Camera is currently occupied by another program.");
      } else {
        setCameraState("error");
        setErrorMessage(err?.message || "Could not start camera feed.");
      }
    }
  }, [stopCamera]);

  const handleToggleCameraPower = async () => {
    if (cameraState === "running" || cameraState === "requesting") {
      userDisabledRef.current = true;
      stopCamera();
      setCameraState("stopped");
    } else {
      userDisabledRef.current = false;
      startCamera();
    }
  };

  // Lifecycle listeners: Cleanly release tracks on unmount, page hide, visibility loss, or tab leave
  useEffect(() => {
    isMountedRef.current = true;
    userDisabledRef.current = false;
    if (!capturedImage) {
      startCamera();
    }

    const handlePageHide = () => {
      stopCamera();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopCamera();
      } else if (
        document.visibilityState === "visible" &&
        !userDisabledRef.current &&
        !capturedImage &&
        isMountedRef.current
      ) {
        startCamera();
      }
    };

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopCamera();
    };
  }, [startCamera, stopCamera, capturedImage]);

  // Snap photo from live video feed
  const handleSnapPhoto = async () => {
    if (!videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const rawDataUrl = canvas.toDataURL("image/jpeg", 0.95);

      // Stop camera once captured
      stopCamera();

      // Compress client-side
      const compressed = await compressImageForUpload(rawDataUrl, 1600, 0.85);
      setCapturedImage(compressed.base64);
      setCapturedMime(compressed.mimeType);
      setCompressionMetrics({
        original: compressed.originalSize,
        compressed: compressed.compressedSize,
      });
    } catch (err) {
      console.warn("Failed to capture photo frame:", err);
      setErrorMessage("Could not capture frame from camera.");
    }
  };

  // Upload photo from gallery/file picker
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      stopCamera();
      const compressed = await compressImageForUpload(file, 1600, 0.85);
      setCapturedImage(compressed.base64);
      setCapturedMime(compressed.mimeType);
      setCompressionMetrics({
        original: compressed.originalSize,
        compressed: compressed.compressedSize,
      });
    } catch (err) {
      console.warn("Failed to process uploaded image:", err);
      setErrorMessage("Failed to read image. Please try a different photo.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setExtractedText("");
    setShowTextEditor(false);
    startCamera();
  };

  // Optional client-side OCR preview via Tesseract.js
  const handleRunClientOcr = async () => {
    if (!capturedImage) return;

    setIsOcrRunning(true);
    setOcrProgress(10);
    try {
      const Tesseract = await import("tesseract.js");
      setOcrProgress(30);

      const result = await Tesseract.recognize(capturedImage, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text" && typeof m.progress === "number") {
            setOcrProgress(Math.round(30 + m.progress * 65));
          }
        },
      });

      const text = result.data.text.trim();
      setExtractedText(text);
      setShowTextEditor(true);
      setOcrProgress(100);
    } catch (err) {
      console.warn("Client OCR failed:", err);
      // Even if client OCR fails, user can proceed directly with multimodal AI
      setShowTextEditor(true);
    } finally {
      setIsOcrRunning(false);
    }
  };

  const handleSubmitAnalysis = () => {
    if (showTextEditor && extractedText.trim()) {
      onAnalyzeText(extractedText.trim());
    } else if (capturedImage) {
      onAnalyzeImage(capturedImage, capturedMime, extractedText);
    }
  };

  return (
    <div className="space-y-4">
      {/* Viewport Box */}
      <div className="relative w-full h-84 md:h-96 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
        {/* State A: Photo has been captured/uploaded */}
        {capturedImage ? (
          <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capturedImage}
              alt="Captured Ingredient Label"
              className="w-full h-full object-contain"
            />

            {/* Metric pill */}
            {compressionMetrics && (
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 text-[10px] font-mono text-zinc-300">
                Optimized: {Math.round(compressionMetrics.compressed / 1024)} KB
              </div>
            )}

            {/* Retake Floating Action */}
            <button
              type="button"
              onClick={handleRetake}
              className="absolute top-3 right-3 bg-slate-950/80 hover:bg-slate-900 text-white p-2 rounded-full border border-slate-700 transition-colors"
              title="Retake photo"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        ) : (
          /* State B: Live Camera Feed */
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {cameraState === "running" && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                {/* Floating Power Off Button */}
                <button
                  type="button"
                  onClick={handleToggleCameraPower}
                  className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 text-rose-300 hover:text-white hover:bg-rose-950/80 border border-slate-700 hover:border-rose-700 pointer-events-auto transition-colors"
                  title="Turn Off Camera"
                >
                  <span className="material-symbols-outlined text-base">videocam_off</span>
                </button>

                {/* Ingredient Label Alignment Frame */}
                <div className="relative w-72 h-56 sm:w-80 sm:h-64 border border-emerald-400/30 rounded-xl">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-3 border-l-3 border-emerald-400 rounded-tl shadow-[0_0_12px_rgba(16,185,129,0.9)]"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-3 border-r-3 border-emerald-400 rounded-tr shadow-[0_0_12px_rgba(16,185,129,0.9)]"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-3 border-l-3 border-emerald-400 rounded-bl shadow-[0_0_12px_rgba(16,185,129,0.9)]"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-3 border-r-3 border-emerald-400 rounded-br shadow-[0_0_12px_rgba(16,185,129,0.9)]"></div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[11px] font-mono font-semibold text-emerald-300/80 bg-slate-950/70 px-3 py-1 rounded-full border border-emerald-500/20 backdrop-blur-xs">
                      Frame Nutrition & Ingredients List
                    </span>
                  </div>
                </div>

                {/* Shutter Capture Button */}
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center pointer-events-auto">
                  <button
                    type="button"
                    onClick={handleSnapPhoto}
                    className="w-16 h-16 rounded-full bg-white/90 hover:bg-white p-1 shadow-lg shadow-black/50 transition-transform active:scale-95 flex items-center justify-center group cursor-pointer"
                    title="Take Photo"
                  >
                    <div className="w-13 h-13 rounded-full border-2 border-slate-900 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-slate-900 text-2xl">
                        photo_camera
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Loading Overlay during AI analysis */}
        {isScanning && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-3 z-30 backdrop-blur-xs">
            <div className="w-12 h-12 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-mono text-xs text-emerald-300 font-bold uppercase tracking-wider">
              NVIDIA Multimodal AI Analyzing Ingredients Matrix...
            </span>
            <span className="text-[11px] text-zinc-400">
              Screening 120+ synthetic additives, allergens & NOVA classification
            </span>
          </div>
        )}

        {/* Fallback View when camera cannot run and no photo */}
        {!capturedImage && cameraState !== "running" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-slate-900/95 space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-zinc-400">
              <span className="material-symbols-outlined text-3xl">
                {cameraState === "denied"
                  ? "no_photography"
                  : cameraState === "unsupported"
                  ? "videocam_off"
                  : cameraState === "requesting"
                  ? "photo_camera"
                  : cameraState === "stopped"
                  ? "videocam_off"
                  : "document_scanner"}
              </span>
            </div>

            <div className="max-w-md space-y-1">
              <h3 className="text-sm font-bold text-white font-display">
                {cameraState === "denied"
                  ? "Camera Permission Denied"
                  : cameraState === "unsupported"
                  ? "Camera Hardware Not Available"
                  : cameraState === "requesting"
                  ? "Requesting Camera Access..."
                  : cameraState === "stopped"
                  ? "Camera is Turned Off"
                  : "Capture Ingredients Label"}
              </h3>
              <p className="text-xs text-zinc-400">
                {cameraState === "requesting"
                  ? "Please allow camera access in your browser prompt so the site can capture ingredient labels."
                  : cameraState === "stopped"
                  ? "Camera feed is turned off. Click below to re-enable camera."
                  : errorMessage ||
                    "Take a photo of the ingredients panel or upload an image from your device."}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {cameraState === "stopped" ? (
                <button
                  type="button"
                  onClick={handleToggleCameraPower}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">videocam</span>
                  <span>Turn On Camera</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">videocam</span>
                  <span>{cameraState === "requesting" ? "Waiting for Permission..." : "Enable Camera"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-zinc-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">upload_file</span>
                <span>Upload Label Photo</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Action Controls when image is captured */}
      {capturedImage && (
        <div className="space-y-3">
          {isOcrRunning && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                <span>Reading ingredient text...</span>
                <span>{ocrProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
            </div>
          )}

          {showTextEditor && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700">
                  Extracted Ingredient Text (Editable):
                </label>
                <button
                  type="button"
                  onClick={() => setShowTextEditor(false)}
                  className="text-[11px] text-zinc-500 hover:text-zinc-700 underline"
                >
                  Hide Text Editor
                </button>
              </div>
              <textarea
                rows={4}
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                placeholder="Ingredients text from label..."
                className="w-full p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-900 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRetake}
                className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                <span>Retake</span>
              </button>

              {!showTextEditor && (
                <button
                  type="button"
                  onClick={handleRunClientOcr}
                  disabled={isOcrRunning}
                  className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">text_fields</span>
                  <span>{isOcrRunning ? "Reading..." : "Preview Text"}</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmitAnalysis}
              disabled={isScanning}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">neurology</span>
              <span>{isScanning ? "Analyzing..." : "Analyze with AI"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Secondary Controls Bar when live */}
      {!capturedImage && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-zinc-600 hover:text-emerald-700 font-semibold flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base text-zinc-500">add_photo_alternate</span>
            <span>Upload label photo from gallery</span>
          </button>

          {onSwitchToBarcode && (
            <button
              type="button"
              onClick={onSwitchToBarcode}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              <span>Scan barcode instead</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
