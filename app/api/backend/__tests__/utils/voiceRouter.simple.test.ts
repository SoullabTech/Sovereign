// Simple test for voice router without complex setup
import { getVoiceConfig } from "../../src/utils/voiceRouter";

describe("Voice Router Simple Tests", () => {
  const originalUseSesame = process.env.USE_SESAME;

  afterEach(() => {
    process.env.USE_SESAME = originalUseSesame;
  });

  describe("getVoiceConfig", () => {
    it("should return oracle configuration with Sesame when enabled", () => {
      process.env.USE_SESAME = "true";
      const config = getVoiceConfig("oracle");

      expect(config).toEqual({
        service: "sesame",
        voiceId: "oracle-voice-id",
        settings: {
          stability: 0.5,
          similarity_boost: 0.8,
        },
      });
    });

    it("should return oracle configuration with ElevenLabs when Sesame disabled", () => {
      process.env.USE_SESAME = "false";
      const config = getVoiceConfig("oracle");

      expect(config).toEqual({
        service: "elevenlabs",
        voiceId: "oracle-voice-id",
        settings: {
          stability: 0.5,
          similarity_boost: 0.8,
        },
      });
    });

    it("should always return elevenlabs for narrator", () => {
      process.env.USE_SESAME = "true";
      const config = getVoiceConfig("narrator");

      expect(config.service).toBe("elevenlabs");
    });
  });
});
