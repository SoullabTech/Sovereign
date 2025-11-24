/**
 * SingularityNET Bridge Service for Archetypal Consciousness
 * Connects the Spiralogic Oracle System to the decentralized AI network
 */

import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";
import { HierarchyOrchestrator } from "../core/agents/HierarchyOrchestrator.js";
import { ArchetypalVoiceSelector } from "../config/archetypalVoiceProfiles.js";
import { ElevenLabsService } from "./ElevenLabsService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load protobuf definition
const PROTO_PATH = path.join(
  __dirname,
  "../../proto/archetypal_consciousness.proto",
);
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const archetypalProto =
  grpc.loadPackageDefinition(packageDefinition).archetypal_consciousness;

export class SNetArchetypalService {
  private orchestrator: HierarchyOrchestrator;
  private elevenLabsService: ElevenLabsService;
  private server: grpc.Server;

  constructor() {
    this.orchestrator = new HierarchyOrchestrator();
    this.elevenLabsService = new ElevenLabsService();
    this.server = new grpc.Server();
  }

  /**
   * Initialize the gRPC service
   */
  async initialize() {
    // Add service implementation
    this.server.addService(
      archetypalProto.ArchetypalConsciousnessService.service,
      {
        ProcessQuery: this.processQuery.bind(this),
        StreamInsights: this.streamInsights.bind(this),
        SynthesizeVoice: this.synthesizeVoice.bind(this),
      },
    );

    // Bind to port
    const port = process.env.SNET_SERVICE_PORT || "7000";
    this.server.bindAsync(
      `0.0.0.0:${port}`,
      grpc.ServerCredentials.createInsecure(),
      (err, port) => {
        if (err) {
          console.error("Failed to bind gRPC server:", err);
          return;
        }
        console.log(`🌐 SingularityNET service listening on port ${port}`);
        this.server.start();
      },
    );
  }

  /**
   * Process consciousness query through archetypal system
   */
  private async processQuery(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>,
  ) {
    try {
      const request = call.request;
      console.log("📥 SNet Request:", {
        user_id: request.user_id,
        query: request.query_text.substring(0, 50) + "...",
        include_voice: request.include_voice,
      });

      // Process through orchestrator
      const response = await this.orchestrator.processQuery({
        userId: request.user_id,
        message: request.query_text,
        context: request.context_history || [],
        currentState: this.convertConsciousnessState(request.current_state),
      });

      // Prepare response
      const consciousnessResponse = {
        response_id: response.id,
        oracle_response: response.response,
        analysis: {
          primary_archetype: response.primaryArchetype,
          secondary_archetype: response.secondaryArchetype,
          elemental_contributions: response.elementalBalance,
          detected_patterns: response.patterns.map((p) => ({
            pattern_id: p.id,
            pattern_name: p.name,
            strength: p.strength,
            description: p.description,
          })),
          energy_signature: response.energySignature,
        },
        updated_state: {
          elemental_balance: response.updatedState.elementalBalance,
          dominant_archetype: response.updatedState.dominantArchetype,
          coherence_level: response.updatedState.coherenceLevel,
          active_patterns: response.updatedState.activePatterns,
        },
        confidence_score: response.confidence,
      };

      // Add voice if requested
      if (request.include_voice) {
        const voiceData = await this.generateVoice(
          response.response,
          response.primaryArchetype,
        );
        consciousnessResponse.voice_data = voiceData;
      }

      callback(null, consciousnessResponse);
    } catch (error) {
      console.error("❌ SNet processing error:", error);
      callback({
        code: grpc.status.INTERNAL,
        details: "Failed to process consciousness query",
      });
    }
  }

  /**
   * Stream real-time insights
   */
  private async streamInsights(call: grpc.ServerDuplexStream<any, any>) {
    console.log("🌊 Starting insight stream...");

    call.on("data", async (request) => {
      try {
        // Generate insights based on current state
        const insights = await this.orchestrator.generateInsights({
          sessionId: request.session_id,
          insightType: request.insight_type,
          currentState: this.convertConsciousnessState(request.current_state),
        });

        // Stream each insight
        for (const insight of insights) {
          call.write({
            insight_id: insight.id,
            insight_text: insight.text,
            archetype_source: insight.archetype,
            relevance_score: insight.relevance,
            timestamp: Date.now(),
          });

          // Pace the stream
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error("Stream error:", error);
        call.emit("error", error);
      }
    });

    call.on("end", () => {
      console.log("🔚 Insight stream ended");
      call.end();
    });
  }

  /**
   * Synthesize archetypal voice
   */
  private async synthesizeVoice(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>,
  ) {
    try {
      const { text, archetype, settings } = call.request;

      const voiceProfile = ArchetypalVoiceSelector.getVoiceProfile(archetype);
      const enhancedText = ArchetypalVoiceSelector.enhanceTextForArchetype(
        text,
        archetype,
      );

      // Merge custom settings if provided
      const voiceSettings = settings
        ? {
            ...voiceProfile.voiceSettings,
            ...settings,
          }
        : voiceProfile.voiceSettings;

      // Generate audio
      const audioData = await this.elevenLabsService.synthesizeSpeech(
        enhancedText,
        voiceProfile.voiceId,
        voiceSettings,
      );

      callback(null, {
        audio_data: audioData,
        audio_format: "audio/mpeg",
        duration_ms: this.estimateDuration(text),
        voice_id: voiceProfile.voiceId,
      });
    } catch (error) {
      console.error("Voice synthesis error:", error);
      callback({
        code: grpc.status.INTERNAL,
        details: "Failed to synthesize voice",
      });
    }
  }

  /**
   * Generate voice data for response
   */
  private async generateVoice(text: string, archetype: string): Promise<any> {
    try {
      const voiceProfile = ArchetypalVoiceSelector.getVoiceProfile(archetype);
      const enhancedText = ArchetypalVoiceSelector.enhanceTextForArchetype(
        text,
        archetype,
      );

      const audioData = await this.elevenLabsService.synthesizeSpeech(
        enhancedText,
        voiceProfile.voiceId,
        voiceProfile.voiceSettings,
      );

      return {
        audio_content: audioData,
        mime_type: "audio/mpeg",
        duration_ms: this.estimateDuration(text),
        voice_profile: archetype,
      };
    } catch (error) {
      console.error("Voice generation failed:", error);
      return null;
    }
  }

  /**
   * Convert proto consciousness state to internal format
   */
  private convertConsciousnessState(protoState: any): any {
    if (!protoState) return null;

    return {
      elementalBalance: protoState.elemental_balance || {},
      dominantArchetype: protoState.dominant_archetype,
      coherenceLevel: protoState.coherence_level,
      activePatterns: protoState.active_patterns || [],
    };
  }

  /**
   * Estimate audio duration from text length
   */
  private estimateDuration(text: string): number {
    // Rough estimate: 150 words per minute
    const words = text.split(" ").length;
    return Math.ceil((words / 150) * 60 * 1000);
  }

  /**
   * Shutdown service gracefully
   */
  async shutdown() {
    return new Promise<void>((resolve) => {
      this.server.tryShutdown(() => {
        console.log("🛑 SNet service shut down gracefully");
        resolve();
      });
    });
  }
}

// Export for SingularityNET daemon
export const createSNetService = () => {
  const service = new SNetArchetypalService();
  service.initialize();
  return service;
};
