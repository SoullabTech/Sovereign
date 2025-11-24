// voiceRouter.test.ts - Test cases for voice routing logic

import { routeVoice, getVoiceConfig } from "./voiceRouter";
import { synthesizeVoice } from "./voiceService";
import { spawn } from "child_process";

// Mock dependencies
jest.mock("./voiceService");
jest.mock("child_process");
jest.mock("fs");
jest.mock("path");

const mockedSynthesizeVoice = synthesizeVoice as jest.MockedFunction<
  typeof synthesizeVoice
>;
const mockedSpawn = spawn as jest.MockedFunction<typeof spawn>;

describe("Voice Router", () => {
  // Store original env value
  const originalUseSesame = process.env.USE_SESAME;

  afterEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    // Restore original env value
    process.env.USE_SESAME = originalUseSesame;
  });

  describe("routeVoice", () => {
    it("should route oracle agent to Sesame when USE_SESAME is true", async () => {
      process.env.USE_SESAME = "true";

      const mockParams = {
        text: "Test oracle message",
        voiceId: "oracle-voice-id",
        agentRole: "oracle",
      };

      // Mock Sesame synthesis
      const mockSpawn = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === "close") {
            // Simulate successful completion
            mockSpawn.stdout.on.mock.calls[0][1](
              '{"success": true, "path": "/audio/test.wav"}',
            );
            callback(0);
          }
        }),
      };
      mockedSpawn.mockReturnValue(mockSpawn as any);

      await routeVoice(mockParams);

      expect(mockedSpawn).toHaveBeenCalledWith("python3", expect.any(Array));
      expect(mockedSynthesizeVoice).not.toHaveBeenCalled();
    });

    it("should route elemental agent to Sesame when USE_SESAME is true", async () => {
      process.env.USE_SESAME = "true";

      const mockParams = {
        text: "Test elemental message",
        voiceId: "elemental-voice-id",
        agentRole: "elemental",
      };

      const mockSpawn = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === "close") {
            mockSpawn.stdout.on.mock.calls[0][1](
              '{"success": true, "path": "/audio/test.wav"}',
            );
            callback(0);
          }
        }),
      };
      mockedSpawn.mockReturnValue(mockSpawn as any);

      await routeVoice(mockParams);

      expect(mockedSpawn).toHaveBeenCalledWith("python3", expect.any(Array));
      expect(mockedSynthesizeVoice).not.toHaveBeenCalled();
    });

    it("should route narrator to ElevenLabs even when USE_SESAME is true", async () => {
      process.env.USE_SESAME = "true";
      mockedSynthesizeVoice.mockResolvedValue("/audio/narrator.mp3");

      const mockParams = {
        text: "Test narrator message",
        voiceId: "narrator-voice-id",
        agentRole: "narrator",
      };

      const result = await routeVoice(mockParams);

      expect(synthesizeVoice).toHaveBeenCalledWith({
        text: "Test narrator message",
        voiceId: "narrator-voice-id",
      });
      expect(result).toBe("/audio/narrator.mp3");
    });

    it("should route all agents to ElevenLabs when USE_SESAME is false", async () => {
      process.env.USE_SESAME = "false";
      mockedSynthesizeVoice.mockResolvedValue("/audio/elevenlabs.mp3");

      const agentRoles = ["oracle", "elemental", "narrator"];

      for (const agentRole of agentRoles) {
        const mockParams = {
          text: `Test ${agentRole} message`,
          voiceId: `${agentRole}-voice-id`,
          agentRole,
        };

        const result = await routeVoice(mockParams);

        expect(mockedSynthesizeVoice).toHaveBeenCalledWith({
          text: `Test ${agentRole} message`,
          voiceId: `${agentRole}-voice-id`,
        });
        expect(result).toBe("/audio/elevenlabs.mp3");
      }
    });

    it("should handle Sesame synthesis errors gracefully", async () => {
      process.env.USE_SESAME = "true";

      const mockParams = {
        text: "Test oracle message",
        voiceId: "oracle-voice-id",
        agentRole: "oracle",
      };

      const mockSpawn = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === "close") {
            // Simulate error
            mockSpawn.stderr.on.mock.calls[0][1]("Python error occurred");
            callback(1);
          }
        }),
      };
      mockedSpawn.mockReturnValue(mockSpawn as any);

      await expect(routeVoice(mockParams)).rejects.toThrow(
        "Sesame synthesis failed",
      );
    });
  });

  describe("getVoiceConfig", () => {
    it("should return oracle configuration", () => {
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

    it("should return elemental configuration", () => {
      process.env.USE_SESAME = "true";
      const config = getVoiceConfig("elemental");

      expect(config).toEqual({
        service: "sesame",
        voiceId: "elemental-voice-id",
        settings: {
          stability: 0.6,
          similarity_boost: 0.7,
        },
      });
    });

    it("should return narrator configuration (always ElevenLabs)", () => {
      process.env.USE_SESAME = "true";
      const config = getVoiceConfig("narrator");

      expect(config).toEqual({
        service: "elevenlabs",
        voiceId: "narrator-voice-id",
        settings: {
          stability: 0.7,
          similarity_boost: 0.9,
        },
      });
    });

    it("should default to narrator config for unknown roles", () => {
      const config = getVoiceConfig("unknown-role");

      expect(config).toEqual({
        service: "elevenlabs",
        voiceId: "narrator-voice-id",
        settings: {
          stability: 0.7,
          similarity_boost: 0.9,
        },
      });
    });

    it("should use elevenlabs for all roles when USE_SESAME is false", () => {
      process.env.USE_SESAME = "false";

      const oracleConfig = getVoiceConfig("oracle");
      const elementalConfig = getVoiceConfig("elemental");

      expect(oracleConfig.service).toBe("elevenlabs");
      expect(elementalConfig.service).toBe("elevenlabs");
    });
  });
});
