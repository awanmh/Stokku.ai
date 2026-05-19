import { describe, it, expect } from "vitest";
import { formatCurrency, formatNumber, formatDateShort } from "./utils";

describe("Utility Functions", () => {
  describe("formatCurrency", () => {
    it("should format numbers to IDR currency style correctly", () => {
      expect(formatCurrency(10000)).toBe("Rp 10.000");
      expect(formatCurrency(2500000)).toBe("Rp 2.500.000");
      expect(formatCurrency(0)).toBe("Rp 0");
    });
  });

  describe("formatNumber", () => {
    it("should format numbers with dot separators correctly", () => {
      expect(formatNumber(1250)).toBe("1.250");
      expect(formatNumber(1000000)).toBe("1.000.000");
      expect(formatNumber(0)).toBe("0");
    });
  });

  describe("formatDateShort", () => {
    it("should format ISO date strings to short Indonesian date style correctly", () => {
      const dateStr = "2026-05-19T00:00:00Z";
      expect(formatDateShort(dateStr)).toBe("19 Mei 2026");
    });
  });
});
