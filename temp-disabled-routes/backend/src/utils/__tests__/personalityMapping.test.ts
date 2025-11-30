import {
  computePersonalityAdjustment,
  getElementalGuidance,
} from "../personalityMapping";
import type { ElementalProfile } from "../../types/survey";

describe("Personality Mapping", () => {
  const createProfile = (
    scores: Record<string, number>,
    crystalFocus?: ElementalProfile["crystal_focus"],
  ): ElementalProfile => ({
    fire: scores.fire || 0,
    water: scores.water || 0,
    earth: scores.earth || 0,
    air: scores.air || 0,
    aether: scores.aether || 0,
    crystal_focus: crystalFocus,
    user_id: "test-user",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  describe("computePersonalityAdjustment", () => {
    it("should identify dominant fire element", () => {
      const profile = createProfile({
        fire: 90,
        water: 30,
        earth: 40,
        air: 50,
        aether: 20,
      });

      const adjustment = computePersonalityAdjustment(profile);
      expect(adjustment.tone).toBe("passionate");
      expect(adjustment.style).toBe("energetic");
      expect(adjustment.emphasis).toContain("creativity");
    });

    it("should add crystal focus emphasis for career", () => {
      const profile = createProfile(
        {
          fire: 90,
          water: 30,
          earth: 40,
          air: 50,
          aether: 20,
        },
        {
          type: "career",
          challenges: "Finding direction",
          aspirations: "Leadership growth",
        },
      );

      const adjustment = computePersonalityAdjustment(profile);
      expect(adjustment.emphasis).toContain("professional growth");
      expect(adjustment.emphasis).toContain("leadership");
    });

    it("should handle equal element scores", () => {
      const profile = createProfile({
        fire: 50,
        water: 50,
        earth: 50,
        air: 50,
        aether: 50,
      });

      const adjustment = computePersonalityAdjustment(profile);
      expect(adjustment).toBeDefined();
      expect(adjustment.tone).toBeDefined();
      expect(adjustment.style).toBeDefined();
      expect(adjustment.emphasis).toBeDefined();
    });
  });

  describe("getElementalGuidance", () => {
    it("should identify weakest element and provide guidance", () => {
      const profile = createProfile({
        fire: 80,
        water: 70,
        earth: 60,
        air: 50,
        aether: 30,
      });

      const guidance = getElementalGuidance(profile);
      expect(guidance).toContain("spiritual practices");
    });

    it("should include crystal focus context in guidance", () => {
      const profile = createProfile(
        {
          fire: 80,
          water: 70,
          earth: 60,
          air: 50,
          aether: 30,
        },
        {
          type: "spiritual",
          challenges: "Finding meaning",
          aspirations: "Deeper connection",
        },
      );

      const guidance = getElementalGuidance(profile);
      expect(guidance).toContain("spiritual practices");
      expect(guidance).toContain("spiritual");
    });

    it("should handle custom crystal focus description", () => {
      const profile = createProfile(
        {
          fire: 80,
          water: 70,
          earth: 60,
          air: 50,
          aether: 30,
        },
        {
          type: "other",
          customDescription: "Personal development",
          challenges: "Self-improvement",
          aspirations: "Better self",
        },
      );

      const guidance = getElementalGuidance(profile);
      expect(guidance).toContain("Personal development");
    });
  });
});
