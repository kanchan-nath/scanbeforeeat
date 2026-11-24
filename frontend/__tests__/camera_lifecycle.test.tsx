import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import BarcodeCamera from "../src/components/scanner/BarcodeCamera";
import IngredientCamera from "../src/components/scanner/IngredientCamera";

// Mock html5-qrcode
const mockTrackStop = vi.fn();
const mockHtml5QrcodeStop = vi.fn().mockResolvedValue(undefined);
const mockHtml5QrcodeClear = vi.fn();
let mockScannerState = 2; // SCANNING

vi.mock("html5-qrcode", () => {
  return {
    Html5QrcodeScannerState: {
      UNKNOWN: 0,
      NOT_STARTED: 1,
      SCANNING: 2,
      PAUSED: 3,
    },
    Html5QrcodeSupportedFormats: {
      EAN_13: 0,
      EAN_8: 1,
      UPC_A: 2,
      UPC_E: 3,
      CODE_128: 4,
      CODE_39: 5,
      QR_CODE: 6,
      DATA_MATRIX: 7,
    },
    Html5Qrcode: class {
      elementId: string;
      constructor(elementId: string) {
        this.elementId = elementId;
      }
      static getCameras = vi.fn().mockResolvedValue([
        { id: "cam1", label: "Back Camera" },
      ]);
      getState() {
        return mockScannerState;
      }
      async start() {
        // Simulate video stream attaching to container
        const container = document.getElementById(this.elementId);
        if (container) {
          const video = document.createElement("video");
          video.srcObject = {
            getTracks: () => [{ stop: mockTrackStop, kind: "video" }],
          } as any;
          container.appendChild(video);
        }
        mockScannerState = 2;
        return null;
      }
      async stop() {
        return mockHtml5QrcodeStop();
      }
      clear() {
        return mockHtml5QrcodeClear();
      }
      getRunningTrackCameraCapabilities() {
        return {};
      }
      async applyVideoConstraints() {
        return undefined;
      }
    },
  };
});

describe("Camera Lifecycle & Teardown Verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockScannerState = 2;
    mockHtml5QrcodeStop.mockImplementation(async () => {
      mockTrackStop();
      mockScannerState = 1;
    });
    if (!navigator.mediaDevices) {
      (navigator as any).mediaDevices = {};
    }
    navigator.mediaDevices.getUserMedia = vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: mockTrackStop, kind: "video" }],
    });
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("BarcodeCamera Lifecycle", () => {
    it("should start camera on mount and terminate all tracks on unmount (page leave)", async () => {
      let unmountFn: () => void;
      await act(async () => {
        const { unmount } = render(
          <BarcodeCamera onDetected={vi.fn()} isScanning={false} />
        );
        unmountFn = unmount;
      });

      expect(screen.getByText("Active 60FPS")).toBeDefined();

      // Trigger unmount (simulating user clicking back or navigating away)
      await act(async () => {
        unmountFn();
      });

      // Verification: Tracks must be stopped and html5-qrcode cleaned up
      expect(mockTrackStop).toHaveBeenCalled();
      expect(mockHtml5QrcodeStop).toHaveBeenCalled();
    });

    it("should allow user to manually turn off and turn back on the camera", async () => {
      await act(async () => {
        render(<BarcodeCamera onDetected={vi.fn()} isScanning={false} />);
      });

      // Find the turn off button
      const turnOffBtn = screen.getByTitle("Turn Off Camera");
      await act(async () => {
        fireEvent.click(turnOffBtn);
      });

      // Camera should now be stopped
      expect(screen.getByText("Camera is Turned Off")).toBeDefined();
      expect(mockTrackStop).toHaveBeenCalled();

      // Click Turn On Camera
      const turnOnBtn = screen.getByText("Turn On Camera");
      await act(async () => {
        fireEvent.click(turnOnBtn);
      });

      expect(screen.getByText("Active 60FPS")).toBeDefined();
    });

    it("should stop camera stream when window pagehide event fires", async () => {
      await act(async () => {
        render(<BarcodeCamera onDetected={vi.fn()} isScanning={false} />);
      });

      expect(screen.getByText("Active 60FPS")).toBeDefined();

      // Simulate pagehide (user navigating away, closing tab, or bfcache transition)
      await act(async () => {
        window.dispatchEvent(new Event("pagehide"));
      });

      expect(mockTrackStop).toHaveBeenCalled();
    });

    it("should pause/stop camera when document visibilitychange is hidden", async () => {
      await act(async () => {
        render(<BarcodeCamera onDetected={vi.fn()} isScanning={false} />);
      });

      expect(screen.getByText("Active 60FPS")).toBeDefined();

      // Simulate tab switch / minimization
      Object.defineProperty(document, "visibilityState", {
        value: "hidden",
        writable: true,
      });

      await act(async () => {
        document.dispatchEvent(new Event("visibilitychange"));
      });

      expect(mockTrackStop).toHaveBeenCalled();
    });

    it("should terminate camera if unmounted while start() is resolving asynchronously", async () => {
      // Create a deferred start promise to simulate user navigating away while browser permission prompt is pending
      let resolveStart: (val: any) => void = () => {};
      const startPromise = new Promise((resolve) => {
        resolveStart = resolve;
      });

      // Override Html5Qrcode.prototype.start temporarily
      const originalStart = (BarcodeCamera as any); // keep reference
      const { Html5Qrcode } = await import("html5-qrcode");
      const spyStart = vi.spyOn(Html5Qrcode.prototype, "start").mockImplementation(async function(this: any) {
        await startPromise;
        const container = document.getElementById(this.elementId);
        if (container) {
          const video = document.createElement("video");
          video.srcObject = {
            getTracks: () => [{ stop: mockTrackStop, kind: "video" }],
          } as any;
          container.appendChild(video);
        }
        mockScannerState = 2;
        return null;
      });

      let unmountFn: () => void = () => {};
      await act(async () => {
        const { unmount } = render(
          <BarcodeCamera onDetected={vi.fn()} isScanning={false} />
        );
        unmountFn = unmount;
      });

      // User immediately clicks back / navigates away while permission prompt is showing!
      await act(async () => {
        unmountFn();
      });

      // Now the browser permission prompt resolves afterwards
      await act(async () => {
        resolveStart(null);
      });

      // The post-start cancellation guard MUST trigger and stop the tracks!
      expect(mockHtml5QrcodeStop).toHaveBeenCalled();
      expect(mockTrackStop).toHaveBeenCalled();

      spyStart.mockRestore();
    });
  });

  describe("IngredientCamera Lifecycle", () => {
    let originalGetUserMedia: any;

    beforeEach(() => {
      originalGetUserMedia = navigator.mediaDevices?.getUserMedia;
      if (!navigator.mediaDevices) {
        (navigator as any).mediaDevices = {};
      }
      navigator.mediaDevices.getUserMedia = vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: mockTrackStop, kind: "video" }],
      });
      // Mock HTMLMediaElement.prototype.play
      window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
      window.HTMLMediaElement.prototype.pause = vi.fn();
    });

    afterEach(() => {
      if (originalGetUserMedia) {
        navigator.mediaDevices.getUserMedia = originalGetUserMedia;
      }
    });

    it("should request camera access on mount and stop tracks on unmount", async () => {
      let unmountFn: () => void;
      await act(async () => {
        const { unmount } = render(
          <IngredientCamera
            onAnalyzeImage={vi.fn()}
            onAnalyzeText={vi.fn()}
            isScanning={false}
          />
        );
        unmountFn = unmount;
      });

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();

      // Simulate user navigating to another page
      await act(async () => {
        unmountFn();
      });

      expect(mockTrackStop).toHaveBeenCalled();
    });

    it("should allow user to manually turn off the camera in Ingredient Lens", async () => {
      await act(async () => {
        render(
          <IngredientCamera
            onAnalyzeImage={vi.fn()}
            onAnalyzeText={vi.fn()}
            isScanning={false}
          />
        );
      });

      const turnOffBtn = screen.getByTitle("Turn Off Camera");
      await act(async () => {
        fireEvent.click(turnOffBtn);
      });

      expect(screen.getByText("Camera is Turned Off")).toBeDefined();
      expect(mockTrackStop).toHaveBeenCalled();
    });

    it("should stop tracks on pagehide event in Ingredient Lens", async () => {
      await act(async () => {
        render(
          <IngredientCamera
            onAnalyzeImage={vi.fn()}
            onAnalyzeText={vi.fn()}
            isScanning={false}
          />
        );
      });

      await act(async () => {
        window.dispatchEvent(new Event("pagehide"));
      });

      expect(mockTrackStop).toHaveBeenCalled();
    });
  });
});
