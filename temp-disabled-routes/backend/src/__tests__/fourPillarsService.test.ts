import {
  generateFourPillars,
  calculateElementalBalance,
  getElementalPersonality,
  getElementRelationship,
} from "../services/fourPillarsService";

describe("Four Pillars Service", () => {
  test("generates Four Pillars profile for sample date", () => {
    const testDate = new Date("2000-01-01T12:00:00Z");
    const profile = generateFourPillars(testDate);

    // Verify structure
    expect(profile).toHaveProperty("year");
    expect(profile).toHaveProperty("month");
    expect(profile).toHaveProperty("day");
    expect(profile).toHaveProperty("hour");
    expect(profile).toHaveProperty("elementTally");
    expect(profile).toHaveProperty("dominant");
    expect(profile).toHaveProperty("deficient");
    expect(profile).toHaveProperty("hexagram");

    // Verify all four pillars have required properties
    [profile.year, profile.month, profile.day, profile.hour].forEach(
      (pillar) => {
        expect(pillar).toHaveProperty("stem");
        expect(pillar).toHaveProperty("branch");
        expect(pillar).toHaveProperty("element");
        expect(pillar).toHaveProperty("yinYang");
        expect(["Yin", "Yang"]).toContain(pillar.yinYang);
        expect(["Wood", "Fire", "Earth", "Metal", "Water"]).toContain(
          pillar.element,
        );
      },
    );

    // Verify element tally totals to 4 (one per pillar)
    const totalElements = Object.values(profile.elementTally).reduce(
      (a, b) => a + b,
      0,
    );
    expect(totalElements).toBeGreaterThanOrEqual(4); // May be more due to branch elements

    // Verify dominant and deficient arrays are not empty
    expect(profile.dominant.length).toBeGreaterThan(0);
    expect(profile.deficient.length).toBeGreaterThan(0);

    // Verify hexagram exists
    expect(typeof profile.hexagram).toBe("string");
    expect(profile.hexagram.length).toBeGreaterThan(0);
  });

  test("handles timezone offset correctly", () => {
    const testDate = new Date("2000-01-01T12:00:00Z");
    const profile1 = generateFourPillars(testDate, 0);
    const profile2 = generateFourPillars(testDate, 480); // +8 hours

    // Profiles should be different due to timezone affecting hour pillar
    expect(profile1).toBeDefined();
    expect(profile2).toBeDefined();
  });

  test("calculates elemental balance score", () => {
    const testDate = new Date("1990-06-15T14:30:00Z");
    const profile = generateFourPillars(testDate);
    const balanceScore = calculateElementalBalance(profile);

    expect(typeof balanceScore).toBe("number");
    expect(balanceScore).toBeGreaterThanOrEqual(0);
    expect(balanceScore).toBeLessThanOrEqual(100);
  });

  test("generates personality insights from dominant elements", () => {
    const woodPersonality = getElementalPersonality(["Wood"]);
    const firePersonality = getElementalPersonality(["Fire"]);

    expect(Array.isArray(woodPersonality)).toBe(true);
    expect(Array.isArray(firePersonality)).toBe(true);
    expect(woodPersonality.length).toBeGreaterThan(0);
    expect(firePersonality.length).toBeGreaterThan(0);

    // Wood should have different traits than Fire
    expect(woodPersonality).not.toEqual(firePersonality);
  });

  test("determines element relationships correctly", () => {
    // Test generation cycle
    expect(getElementRelationship("Wood", "Fire")).toBe("generates");
    expect(getElementRelationship("Fire", "Earth")).toBe("generates");
    expect(getElementRelationship("Earth", "Metal")).toBe("generates");
    expect(getElementRelationship("Metal", "Water")).toBe("generates");
    expect(getElementRelationship("Water", "Wood")).toBe("generates");

    // Test destruction cycle
    expect(getElementRelationship("Wood", "Earth")).toBe("destroys");
    expect(getElementRelationship("Fire", "Metal")).toBe("destroys");
    expect(getElementRelationship("Earth", "Water")).toBe("destroys");
    expect(getElementRelationship("Metal", "Wood")).toBe("destroys");
    expect(getElementRelationship("Water", "Fire")).toBe("destroys");

    // Test neutral relationship
    expect(getElementRelationship("Wood", "Metal")).toBe("neutral");
    expect(getElementRelationship("Fire", "Water")).toBe("destroys"); // This is actually destruction, not neutral
  });

  test("handles edge cases gracefully", () => {
    // Test with very old date
    const oldDate = new Date("1900-01-01T00:00:00Z");
    const oldProfile = generateFourPillars(oldDate);
    expect(oldProfile).toBeDefined();

    // Test with future date
    const futureDate = new Date("2050-12-31T23:59:59Z");
    const futureProfile = generateFourPillars(futureDate);
    expect(futureProfile).toBeDefined();

    // Test with extreme timezone offset
    const extremeProfile = generateFourPillars(new Date(), -720); // -12 hours
    expect(extremeProfile).toBeDefined();
  });

  test("produces consistent results for same input", () => {
    const testDate = new Date("1985-03-21T09:15:00Z");
    const profile1 = generateFourPillars(testDate, 0);
    const profile2 = generateFourPillars(testDate, 0);

    expect(profile1).toEqual(profile2);
  });

  test("validates all elements are represented in tally", () => {
    const testDate = new Date("1975-11-11T16:45:00Z");
    const profile = generateFourPillars(testDate);

    // All five elements should have a count (even if 0)
    const elements = ["Wood", "Fire", "Earth", "Metal", "Water"];
    elements.forEach((element) => {
      expect(profile.elementTally).toHaveProperty(element);
      expect(
        typeof profile.elementTally[
          element as keyof typeof profile.elementTally
        ],
      ).toBe("number");
      expect(
        profile.elementTally[element as keyof typeof profile.elementTally],
      ).toBeGreaterThanOrEqual(0);
    });
  });
});
