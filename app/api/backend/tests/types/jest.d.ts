import type { AIResponse } from "../../src/types/ai";

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeBetween(min: number, max: number): R;
      toBeWithinRange(min: number, max: number): R;
      toContainSacredLanguage(): R;
      toBeValidOracleResponse(): R;
    }
  }
}

export {};