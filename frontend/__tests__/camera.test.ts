import { describe, it, expect } from "vitest";
import { validateBarcode, isCameraSupported } from "../src/lib/camera";

describe("Camera & Barcode Utilities", () => {
  describe("EAN-13 Validation", () => {
    it("should validate standard 13-digit EAN-13 barcode correctly (Maggi)", () => {
      const result = validateBarcode("8901058852331");
      expect(result.valid).toBe(true);
      expect(result.format).toBe("EAN-13");
      expect(result.cleanedCode).toBe("8901058852331");
    });

    it("should validate standard 13-digit EAN-13 barcode (Oatly)", () => {
      const result = validateBarcode("7321461144417");
      expect(result.valid).toBe(true);
      expect(result.format).toBe("EAN-13");
      expect(result.cleanedCode).toBe("7321461144417");
    });

    it("should validate standard 13-digit EAN-13 barcode with verified checksum (Nutella)", () => {
      const result = validateBarcode("3017620422003");
      expect(result.valid).toBe(true);
      expect(result.format).toBe("EAN-13");
      expect(result.checksumVerified).toBe(true);
    });

    it("should trim surrounding whitespace on EAN-13", () => {
      const result = validateBarcode("   8901058852331 \n");
      expect(result.valid).toBe(true);
      expect(result.format).toBe("EAN-13");
      expect(result.cleanedCode).toBe("8901058852331");
    });
  });

  describe("UPC-A Validation", () => {
    it("should validate standard 12-digit UPC-A barcode correctly (Doritos)", () => {
      const result = validateBarcode("028400064088");
      expect(result.valid).toBe(true);
      expect(result.format).toBe("UPC-A");
      expect(result.cleanedCode).toBe("028400064088");
      expect(result.checksumVerified).toBe(true);
    });

    it("should validate another 12-digit UPC-A barcode (LesserEvil)", () => {
      const result = validateBarcode("085523800412");
      expect(result.valid).toBe(true);
      expect(result.format).toBe("UPC-A");
    });
  });

  describe("EAN-8 Validation", () => {
    it("should validate standard 8-digit EAN-8 barcode", () => {
      const result = validateBarcode("96385074");
      expect(result.valid).toBe(true);
      expect(result.format).toBe("EAN-8");
      expect(result.cleanedCode).toBe("96385074");
      expect(result.checksumVerified).toBe(true);
    });

    it("should validate 8-digit EAN-8 barcode (90311017)", () => {
      const result = validateBarcode("90311017");
      expect(result.valid).toBe(true);
      expect(result.format).toBe("EAN-8");
      expect(result.checksumVerified).toBe(true);
    });
  });

  describe("Custom & Alphanumeric Codes", () => {
    it("should accept valid custom numeric barcodes (e.g. 10 or 14 digits)", () => {
      const result10 = validateBarcode("9991234567");
      expect(result10.valid).toBe(true);
      expect(result10.format).toBe("CUSTOM");

      const result14 = validateBarcode("00012345678905");
      expect(result14.valid).toBe(true);
      expect(result14.format).toBe("CUSTOM");
    });

    it("should accept valid alphanumeric codes like QR or Code 128", () => {
      const result = validateBarcode("PROD-ORGANIC-OATS-99");
      expect(result.valid).toBe(true);
      expect(result.format).toBe("CODE-128/QR");
      expect(result.cleanedCode).toBe("PROD-ORGANIC-OATS-99");
    });

    it("should accept alphanumeric code with underscores and dots", () => {
      const result = validateBarcode("ITEM_A.1-99");
      expect(result.valid).toBe(true);
      expect(result.format).toBe("CODE-128/QR");
    });
  });

  describe("Malformed & Invalid Inputs", () => {
    it("should reject empty string or whitespace only", () => {
      expect(validateBarcode("").valid).toBe(false);
      expect(validateBarcode("   ").valid).toBe(false);
    });

    it("should reject non-string or falsy values", () => {
      expect(validateBarcode(null as unknown as string).valid).toBe(false);
      expect(validateBarcode(undefined as unknown as string).valid).toBe(false);
      expect(validateBarcode(12345678 as unknown as string).valid).toBe(false);
    });

    it("should reject inputs shorter than 4 characters", () => {
      const short1 = validateBarcode("1");
      const short2 = validateBarcode("12");
      const short3 = validateBarcode("123");
      expect(short1.valid).toBe(false);
      expect(short2.valid).toBe(false);
      expect(short3.valid).toBe(false);
      expect(short3.error).toContain("too short");
    });

    it("should reject strings containing invalid special characters or spaces", () => {
      const badChars = validateBarcode("8901058852331#$");
      expect(badChars.valid).toBe(false);
      expect(badChars.error).toContain("invalid characters");

      const badSpace = validateBarcode("8901 0588 52331");
      expect(badSpace.valid).toBe(false);
      expect(badSpace.error).toContain("invalid characters");

      const badSymbol = validateBarcode("PROD@FOOD*");
      expect(badSymbol.valid).toBe(false);
      expect(badSymbol.error).toContain("invalid characters");
    });
  });

  describe("Camera Hardware Support Detection", () => {
    it("should safely evaluate camera support in current environment", () => {
      const status = isCameraSupported();
      expect(status).toHaveProperty("supported");
    });
  });
});
