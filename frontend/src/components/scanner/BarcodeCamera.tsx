"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { isCameraSupported, validateBarcode } from "@/lib/camera";

interface BarcodeCameraProps {
  onDetected: (barcode: string) => void;
  isScanning: boolean;
  onSwitchToManual?: () => void;
  onSwitchToOcr?: () => void;
}

export default function BarcodeCamera({
  onDetected,
  isScanning,
  onSwitchToManual,
  onSwitchToOcr,
}: BarcodeCameraProps) {
  const [cameraState, setCameraState] = useState<"idle" | "running" | "denied" | "error" | "unsupported">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [lastDetectedCode, setLastDetectedCode] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isCooldownRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isMountedRef = useRef(true);

  const playBeep = () => {
    try {
      if (typeof window === "undefined") return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // AudioContext policy or restricted browser
    }
  };

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn("[BarcodeCamera] Error stopping camera:", err);
      }
      scannerRef.current = null;
    }
  }, []);

  const startScanner = useCallback(async (cameraIdOrFacing?: string | { facingMode: string }) => {
    const support = isCameraSupported();
    if (!support.supported) {
      setCameraState("unsupported");
      setErrorMessage(support.reason || "Camera not supported on this browser.");
      return;
    }

    try {
      await stopScanner();

      const html5QrCode = new Html5Qrcode("reader-viewport", {
        verbose: false,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
        ],
      });

      scannerRef.current = html5QrCode;

      // Enumerate available devices
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
        }
      } catch {
        // Enumerate fallback
      }

      const cameraConfig = cameraIdOrFacing || { facingMode: "environment" };

      await html5QrCode.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const edge = Math.floor(minEdge * 0.75);
            return { width: Math.max(260, edge), height: Math.max(160, Math.floor(edge * 0.65)) };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          if (isCooldownRef.current) return;

          const validation = validateBarcode(decodedText);
          if (validation.valid) {
            isCooldownRef.current = true;
            playBeep();
            setLastDetectedCode(decodedText);
            onDetected(decodedText);

            // 2.5s debounce lock
            setTimeout(() => {
              isCooldownRef.current = false;
            }, 2500);
          }
        },
        () => {
          // Frame without barcode - normal scanning loop
        }
      );

      setCameraState("running");
      setErrorMessage("");

      // Check torch capability
      try {
        const capabilities = html5QrCode.getRunningTrackCameraCapabilities();
        if ((capabilities as any)?.torchFeature?.().isSupported?.()) {
          setTorchSupported(true);
        }
      } catch {
        setTorchSupported(false);
      }
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.message?.includes("interrupted")) {
        return;
      }
      console.warn("[BarcodeCamera] Camera start failure:", err);
      if (!isMountedRef.current) return;

      const name = err?.name || "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setCameraState("denied");
        setErrorMessage("Camera access was blocked. Please allow camera permissions in your browser address bar.");
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setCameraState("error");
        setErrorMessage("No camera hardware detected on this device.");
      } else if (name === "NotReadableError" || name === "TrackStartError") {
        setCameraState("error");
        setErrorMessage("Camera is currently in use by another app or browser tab.");
      } else {
        setCameraState("error");
        setErrorMessage(err?.message || "Unable to start camera stream.");
      }
    }
  }, [onDetected, stopScanner]);

  const toggleTorch = async () => {
    if (!scannerRef.current || !torchSupported) return;
    try {
      const nextState = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextState } as any],
      });
      setTorchOn(nextState);
    } catch (err) {
      console.warn("Torch toggle failed:", err);
    }
  };

  const handleDeviceChange = (deviceId: string) => {
    setSelectedCameraId(deviceId);
    startScanner(deviceId);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let qrEngine = scannerRef.current;
      if (!qrEngine) {
        qrEngine = new Html5Qrcode("reader-viewport-file-temp", {
          verbose: false,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
        });
      }

      const decodedText = await qrEngine.scanFile(file, true);
      const validation = validateBarcode(decodedText);
      if (validation.valid) {
        playBeep();
        setLastDetectedCode(decodedText);
        onDetected(decodedText);
      } else {
        setErrorMessage("Scanned code was not a recognized grocery barcode.");
      }
    } catch {
      setErrorMessage("Could not detect a clear barcode in the uploaded image. Try another photo or enter manually.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    startScanner();
    return () => {
      isMountedRef.current = false;
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  return (
    <div className="space-y-4">
      {/* Viewport Box */}
      <div className="relative w-full h-84 md:h-96 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
        {/* Hidden temp div for file scan */}
        <div id="reader-viewport-file-temp" className="hidden" />

        {/* Live Camera Element */}
        <div
          id="reader-viewport"
          className="w-full h-full object-cover [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
        />

        {/* Reticle Overlay when camera running */}
        {cameraState === "running" && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            {/* Corner brackets */}
            <div className="relative w-72 h-44 sm:w-80 sm:h-52 border border-emerald-500/30 rounded-xl">
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-3 border-l-3 border-emerald-400 rounded-tl shadow-[0_0_12px_rgba(16,185,129,0.9)]"></div>
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-3 border-r-3 border-emerald-400 rounded-tr shadow-[0_0_12px_rgba(16,185,129,0.9)]"></div>
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-3 border-l-3 border-emerald-400 rounded-bl shadow-[0_0_12px_rgba(16,185,129,0.9)]"></div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-3 border-r-3 border-emerald-400 rounded-br shadow-[0_0_12px_rgba(16,185,129,0.9)]"></div>

              {/* Animated Scan Beam */}
              <div className="absolute inset-x-2 h-0.5 bg-emerald-400 shadow-[0_0_12px_#10b981,0_0_24px_#10b981] animate-scanline"></div>

              {/* Center target indicator */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] font-mono font-semibold text-emerald-300/80 bg-slate-950/70 px-2.5 py-1 rounded-full border border-emerald-500/20 backdrop-blur-xs">
                  {lastDetectedCode ? `Locked: ${lastDetectedCode}` : "Align Barcode in Reticle"}
                </span>
              </div>
            </div>

            {/* Bottom HUD Bar */}
            <div className="absolute bottom-3 inset-x-4 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 text-[11px] text-zinc-300 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active 60FPS</span>
              </div>

              <div className="flex items-center gap-2">
                {torchSupported && (
                  <button
                    type="button"
                    onClick={toggleTorch}
                    className={`p-2 rounded-full border transition-colors ${
                      torchOn
                        ? "bg-amber-400 text-slate-950 border-amber-300"
                        : "bg-slate-900/80 text-zinc-300 border-slate-700 hover:bg-slate-800"
                    }`}
                    title="Toggle Flashlight / Torch"
                  >
                    <span className="material-symbols-outlined text-base">
                      {torchOn ? "flashlight_on" : "flashlight_off"}
                    </span>
                  </button>
                )}

                {cameras.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextCam = cameras.find((c) => c.id !== selectedCameraId) || cameras[0];
                      handleDeviceChange(nextCam.id);
                    }}
                    className="p-2 rounded-full bg-slate-900/80 text-zinc-300 border border-slate-700 hover:bg-slate-800 transition-colors"
                    title="Switch Camera Lens"
                  >
                    <span className="material-symbols-outlined text-base">flip_camera_ios</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isScanning && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-3 z-30 backdrop-blur-xs">
            <div className="w-12 h-12 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-mono text-xs text-emerald-300 font-bold uppercase tracking-wider">
              Querying OpenFoodFacts & AI Database...
            </span>
          </div>
        )}

        {/* Fallback View when camera cannot run */}
        {cameraState !== "running" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-slate-900/95 space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-zinc-400">
              <span className="material-symbols-outlined text-3xl">
                {cameraState === "denied"
                  ? "no_photography"
                  : cameraState === "unsupported"
                  ? "videocam_off"
                  : "barcode_scanner"}
              </span>
            </div>

            <div className="max-w-md space-y-1">
              <h3 className="text-sm font-bold text-white font-display">
                {cameraState === "denied"
                  ? "Camera Permission Denied"
                  : cameraState === "unsupported"
                  ? "Camera Hardware Not Available"
                  : "Live Camera Unavailable"}
              </h3>
              <p className="text-xs text-zinc-400">
                {errorMessage ||
                  "Ensure camera permissions are granted or upload a photo of the product barcode."}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => startScanner()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                <span>Retry Camera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-zinc-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">upload_file</span>
                <span>Upload Barcode Image</span>
              </button>

              {onSwitchToManual && (
                <button
                  type="button"
                  onClick={onSwitchToManual}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">dialpad</span>
                  <span>Type Code</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input for Image Drop / Select */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Secondary Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs text-zinc-600 hover:text-emerald-700 font-semibold flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base text-zinc-500">add_photo_alternate</span>
          <span>Upload photo from gallery instead</span>
        </button>

        {onSwitchToOcr && (
          <button
            type="button"
            onClick={onSwitchToOcr}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
          >
            <span>Scan ingredients text directly</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        )}
      </div>
    </div>
  );
}
