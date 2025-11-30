import {
  generateIChingAstroProfile,
  getBaseNumberFromYear,
  mapTrigramFromBaseNumber,
  getCurrentTrigramForYear,
  getTrigramArchetype,
  calculateTrigramCompatibility,
} from "../services/ichingService";

describe("I Ching Service", () => {
  describe("getBaseNumberFromYear", () => {
    test("calculates base number correctly for various years", () => {
      expect(getBaseNumberFromYear(1924)).toBe(9); // Reference year cycle position 0 = 9
      expect(getBaseNumberFromYear(1925)).toBe(1);
      expect(getBaseNumberFromYear(1930)).toBe(6);
      expect(getBaseNumberFromYear(2000)).toBe(4); // (2000-1924) % 9 = 76 % 9 = 4
      expect(getBaseNumberFromYear(2024)).toBe(1); // (2024-1924) % 9 = 100 % 9 = 1
    });

    test("handles edge cases correctly", () => {
      expect(getBaseNumberFromYear(1900)).toBe(3); // Before reference year
      expect(getBaseNumberFromYear(2100)).toBe(5); // Future year
    });
  });

  describe("mapTrigramFromBaseNumber", () => {
    test("maps base numbers to correct trigrams", () => {
      const trigram1 = mapTrigramFromBaseNumber(1);
      expect(trigram1.name).toBe("Thunder");
      expect(trigram1.element).toBe("Wood");
      expect(trigram1.archetype).toBe("The Initiator");

      const trigram5 = mapTrigramFromBaseNumber(5);
      expect(trigram5.name).toBe("Lake");
      expect(trigram5.element).toBe("Metal");
      expect(trigram5.archetype).toBe("The Communicator");

      const trigram9 = mapTrigramFromBaseNumber(9);
      expect(trigram9.name).toBe("Thunder");
      expect(trigram9.element).toBe("Wood");
    });

    test("includes all required trigram properties", () => {
      const trigram = mapTrigramFromBaseNumber(3);
      expect(trigram).toHaveProperty("name");
      expect(trigram).toHaveProperty("symbol");
      expect(trigram).toHaveProperty("element");
      expect(trigram).toHaveProperty("direction");
      expect(trigram).toHaveProperty("attribute");
      expect(trigram).toHaveProperty("archetype");
      expect(trigram).toHaveProperty("description");
      expect(trigram).toHaveProperty("keywords");
      expect(Array.isArray(trigram.keywords)).toBe(true);
    });
  });

  describe("generateIChingAstroProfile", () => {
    test("generates complete profile for birth date", () => {
      const testDate = new Date("1990-06-15T12:00:00Z");
      const profile = generateIChingAstroProfile(testDate);

      expect(profile).toHaveProperty("baseNumber");
      expect(profile).toHaveProperty("birthTrigram");
      expect(profile).toHaveProperty("birthElement");
      expect(profile).toHaveProperty("currentTrigramCycle");
      expect(profile).toHaveProperty("hexagramMapping");
      expect(profile).toHaveProperty("currentYearNumber");
      expect(profile).toHaveProperty("cyclePosition");
      expect(profile).toHaveProperty("fractalPhase");
      expect(profile).toHaveProperty("yearlyGuidance");

      expect(typeof profile.baseNumber).toBe("number");
      expect(profile.baseNumber).toBeGreaterThanOrEqual(1);
      expect(profile.baseNumber).toBeLessThanOrEqual(9);

      expect(Array.isArray(profile.hexagramMapping)).toBe(true);
      expect(typeof profile.yearlyGuidance).toBe("string");
      expect(profile.yearlyGuidance.length).toBeGreaterThan(10);
    });

    test("current year calculations are accurate", () => {
      const testDate = new Date("2000-01-01T00:00:00Z");
      const profile = generateIChingAstroProfile(testDate);

      const currentYear = new Date().getFullYear();
      const expectedCurrentNumber = getBaseNumberFromYear(currentYear);

      expect(profile.currentYearNumber).toBe(expectedCurrentNumber);
    });

    test("produces consistent results for same input", () => {
      const testDate = new Date("1985-03-21T09:15:00Z");
      const profile1 = generateIChingAstroProfile(testDate);
      const profile2 = generateIChingAstroProfile(testDate);

      expect(profile1).toEqual(profile2);
    });
  });

  describe("getTrigramArchetype", () => {
    test("retrieves archetype by name", () => {
      const thunder = getTrigramArchetype("Thunder");
      expect(thunder).toBeTruthy();
      expect(thunder?.name).toBe("Thunder");
      expect(thunder?.element).toBe("Wood");

      const water = getTrigramArchetype("Water");
      expect(water).toBeTruthy();
      expect(water?.name).toBe("Water");
      expect(water?.element).toBe("Water");
    });

    test("returns null for invalid trigram name", () => {
      const invalid = getTrigramArchetype("Invalid");
      expect(invalid).toBeNull();
    });

    test("handles case sensitivity", () => {
      const thunder = getTrigramArchetype("Thunder");
      const invalidCase = getTrigramArchetype("thunder");

      expect(thunder).toBeTruthy();
      expect(invalidCase).toBeNull();
    });
  });

  describe("calculateTrigramCompatibility", () => {
    test("calculates compatibility between same element trigrams", () => {
      const result = calculateTrigramCompatibility("Thunder", "Wind");
      expect(typeof result.compatibility).toBe("number");
      expect(result.compatibility).toBeGreaterThanOrEqual(0);
      expect(result.compatibility).toBeLessThanOrEqual(100);
      expect(typeof result.description).toBe("string");

      // Thunder and Wind are both Wood element - should have high compatibility
      expect(result.compatibility).toBeGreaterThan(70);
    });

    test("calculates compatibility for different elements", () => {
      const result = calculateTrigramCompatibility("Fire", "Water");
      expect(typeof result.compatibility).toBe("number");
      expect(typeof result.description).toBe("string");
    });

    test("handles invalid trigram names gracefully", () => {
      const result = calculateTrigramCompatibility("Invalid", "Thunder");
      expect(result.compatibility).toBe(0);
      expect(result.description).toContain("Unable to calculate");
    });

    test("same trigram has high compatibility", () => {
      const result = calculateTrigramCompatibility("Heaven", "Heaven");
      expect(result.compatibility).toBeGreaterThan(80);
    });
  });

  describe("getCurrentTrigramForYear", () => {
    test("returns correct trigram for current year", () => {
      const currentYear = new Date().getFullYear();
      const trigram = getCurrentTrigramForYear(currentYear);

      expect(trigram).toHaveProperty("name");
      expect(trigram).toHaveProperty("element");
      expect(trigram).toHaveProperty("archetype");

      const expectedBaseNumber = getBaseNumberFromYear(currentYear);
      const expectedTrigram = mapTrigramFromBaseNumber(expectedBaseNumber);
      expect(trigram).toEqual(expectedTrigram);
    });

    test("handles various years correctly", () => {
      const trigram2000 = getCurrentTrigramForYear(2000);
      const trigram2024 = getCurrentTrigramForYear(2024);

      expect(trigram2000.name).toBeTruthy();
      expect(trigram2024.name).toBeTruthy();

      // Different years should potentially have different trigrams
      // (unless they happen to be in the same cycle position)
    });
  });

  describe("integration tests", () => {
    test("full profile generation and validation", () => {
      const birthDate = new Date("1975-11-30T14:30:00Z");
      const profile = generateIChingAstroProfile(birthDate);

      // Validate birth trigram consistency
      const birthArchetype = getTrigramArchetype(profile.birthTrigram);
      expect(birthArchetype).toBeTruthy();
      expect(birthArchetype?.element).toBe(profile.birthElement);

      // Validate current trigram consistency
      const currentArchetype = getTrigramArchetype(profile.currentTrigramCycle);
      expect(currentArchetype).toBeTruthy();

      // Validate hexagram mappings
      expect(profile.hexagramMapping.length).toBeGreaterThan(0);
      profile.hexagramMapping.forEach((hexagram) => {
        expect(typeof hexagram).toBe("string");
        expect(hexagram.length).toBeGreaterThan(0);
      });
    });

    test("compatibility calculation between birth and current trigrams", () => {
      const birthDate = new Date("1988-08-08T08:08:08Z");
      const profile = generateIChingAstroProfile(birthDate);

      const compatibility = calculateTrigramCompatibility(
        profile.birthTrigram,
        profile.currentTrigramCycle,
      );

      expect(compatibility.compatibility).toBeGreaterThanOrEqual(0);
      expect(compatibility.compatibility).toBeLessThanOrEqual(100);
      expect(compatibility.description).toBeTruthy();
    });
  });

  describe("edge cases and error handling", () => {
    test("handles very old dates", () => {
      const oldDate = new Date("1850-01-01T00:00:00Z");
      const profile = generateIChingAstroProfile(oldDate);

      expect(profile.baseNumber).toBeGreaterThanOrEqual(1);
      expect(profile.baseNumber).toBeLessThanOrEqual(9);
      expect(profile.birthTrigram).toBeTruthy();
    });

    test("handles future dates", () => {
      const futureDate = new Date("2100-12-31T23:59:59Z");
      const profile = generateIChingAstroProfile(futureDate);

      expect(profile.baseNumber).toBeGreaterThanOrEqual(1);
      expect(profile.baseNumber).toBeLessThanOrEqual(9);
      expect(profile.birthTrigram).toBeTruthy();
    });

    test("validates all elements are valid", () => {
      const elements = ["Wood", "Fire", "Earth", "Metal", "Water"];

      for (let i = 1; i <= 9; i++) {
        const trigram = mapTrigramFromBaseNumber(i);
        expect(elements).toContain(trigram.element);
      }
    });
  });
});
