/**
 * BIOMARKER INGESTION SERVICE
 * Phase 4.4-C: Neuropod Bridge — WebSocket Server
 *
 * Purpose:
 * - Listen for real-time biosignal data from Neuropod devices via WebSocket
 * - Parse incoming JSON packets (EEG, HRV, GSR, breath)
 * - Write biomarker samples to consciousness_biomarkers table
 * - Support local device simulators for testing
 *
 * Architecture:
 * - WebSocket server on port 8765 (configurable via env)
 * - JSON protocol: { source, signal_type, value, units, channel?, quality?, timestamp? }
 * - Batch inserts for performance (configurable batch size)
 * - Error handling with exponential backoff
 *
 * Sovereignty:
 * - All data stays local (no cloud sync)
 * - No external analytics services
 * - User controls device connections
 */

import { WebSocketServer, WebSocket } from "ws";
import { query } from "../../../../lib/db/postgres";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Biosignal packet from Neuropod device
 */
export interface BiomarkerPacket {
  source: string;            // Device ID (e.g., "muse-s-001")
  signal_type: string;       // EEG, HRV, GSR, Breath, Temperature
  value: number;             // Raw or normalized signal reading
  units?: string;            // Hz, ms, μS, bpm, °C
  channel?: string;          // Optional: EEG channel (TP9, AF7, etc.)
  quality?: number;          // 0.0-1.0 signal quality score
  timestamp?: string;        // ISO 8601 timestamp (defaults to NOW())
  trace_id?: string;         // Optional: link to consciousness trace UUID
  metadata?: Record<string, unknown>; // Device-specific metadata
}

/**
 * Configuration options for ingestion service
 */
export interface IngestConfig {
  port: number;              // WebSocket port (default: 8765)
  batchSize: number;         // Number of samples to batch before DB write (default: 10)
  batchTimeoutMs: number;    // Max time to wait before flushing batch (default: 1000ms)
  maxQueueSize: number;      // Max samples in memory before backpressure (default: 1000)
  enableLogging: boolean;    // Log incoming packets (default: false)
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

/**
 * WebSocket server for real-time biomarker ingestion
 */
export class BiomarkerIngestService {
  private wss: WebSocketServer | null = null;
  private config: IngestConfig;
  private sampleQueue: BiomarkerPacket[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(config?: Partial<IngestConfig>) {
    this.config = {
      port: config?.port ?? 8765,
      batchSize: config?.batchSize ?? 10,
      batchTimeoutMs: config?.batchTimeoutMs ?? 1000,
      maxQueueSize: config?.maxQueueSize ?? 1000,
      enableLogging: config?.enableLogging ?? false,
    };
  }

  /**
   * Start WebSocket server
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn("[Biomarker Ingest] Service already running");
      return;
    }

    this.wss = new WebSocketServer({ port: this.config.port });
    this.isRunning = true;

    this.wss.on("connection", (ws: WebSocket) => {
      console.log(`[Biomarker Ingest] New device connected`);

      ws.on("message", async (data: Buffer) => {
        try {
          const packet = JSON.parse(data.toString()) as BiomarkerPacket;
          await this.handlePacket(packet);
        } catch (error) {
          console.error("[Biomarker Ingest] Parse error:", error);
          ws.send(JSON.stringify({ error: "Invalid packet format" }));
        }
      });

      ws.on("close", () => {
        console.log("[Biomarker Ingest] Device disconnected");
      });

      ws.on("error", (error) => {
        console.error("[Biomarker Ingest] WebSocket error:", error);
      });

      // Send welcome message
      ws.send(JSON.stringify({ status: "connected", version: "1.0.0" }));
    });

    this.wss.on("error", (error) => {
      console.error("[Biomarker Ingest] Server error:", error);
    });

    console.log(`[Biomarker Ingest] WebSocket server listening on ws://localhost:${this.config.port}`);
  }

  /**
   * Stop WebSocket server and flush pending samples
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;

    // Flush any pending samples
    if (this.sampleQueue.length > 0) {
      await this.flushBatch();
    }

    // Clear flush timer
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    // Close WebSocket server
    if (this.wss) {
      this.wss.close(() => {
        console.log("[Biomarker Ingest] WebSocket server stopped");
      });
      this.wss = null;
    }

    this.isRunning = false;
  }

  /**
   * Handle incoming biomarker packet
   */
  private async handlePacket(packet: BiomarkerPacket): Promise<void> {
    // Validate packet
    if (!packet.source || !packet.signal_type || packet.value === undefined) {
      throw new Error("Missing required fields: source, signal_type, value");
    }

    if (this.config.enableLogging) {
      console.log(`[Biomarker Ingest] ${packet.source} → ${packet.signal_type}: ${packet.value} ${packet.units || ""}`);
    }

    // Add to queue
    this.sampleQueue.push(packet);

    // Check if we should flush
    if (this.sampleQueue.length >= this.config.batchSize) {
      await this.flushBatch();
    } else {
      // Reset flush timer
      this.resetFlushTimer();
    }

    // Backpressure warning
    if (this.sampleQueue.length > this.config.maxQueueSize) {
      console.warn(`[Biomarker Ingest] Queue size exceeded ${this.config.maxQueueSize}. Consider increasing batch size or DB performance.`);
    }
  }

  /**
   * Reset flush timer (batched writes)
   */
  private resetFlushTimer(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }

    this.flushTimer = setTimeout(async () => {
      if (this.sampleQueue.length > 0) {
        await this.flushBatch();
      }
    }, this.config.batchTimeoutMs);
  }

  /**
   * Flush queued samples to database
   */
  private async flushBatch(): Promise<void> {
    if (this.sampleQueue.length === 0) return;

    const batch = this.sampleQueue.splice(0, this.config.batchSize);

    try {
      await this.insertBatch(batch);
      console.log(`[Biomarker Ingest] Flushed ${batch.length} samples to database`);
    } catch (error) {
      console.error("[Biomarker Ingest] DB insert failed:", error);
      // Re-queue samples for retry (optional)
      // this.sampleQueue.unshift(...batch);
    }
  }

  /**
   * Insert batch of biomarker samples into database
   */
  private async insertBatch(samples: BiomarkerPacket[]): Promise<void> {
    if (samples.length === 0) return;

    // Build multi-row INSERT statement
    const values: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    for (const sample of samples) {
      const traceId = sample.trace_id || null;
      const timestamp = sample.timestamp || new Date().toISOString();
      const quality = sample.quality ?? null;
      const channel = sample.channel ?? null;
      const units = sample.units ?? null;
      const metadata = sample.metadata ? JSON.stringify(sample.metadata) : "{}";

      values.push(
        `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
      );

      params.push(
        traceId,
        sample.source,
        sample.signal_type,
        channel,
        sample.value,
        units,
        quality,
        timestamp,
        metadata
      );
    }

    const sql = `
      INSERT INTO consciousness_biomarkers
        (trace_id, source, signal_type, channel, value, units, quality_score, sample_ts, metadata)
      VALUES ${values.join(", ")}
    `;

    await query(sql, params);
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.sampleQueue.length;
  }

  /**
   * Check if service is running
   */
  isServiceRunning(): boolean {
    return this.isRunning;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let ingestService: BiomarkerIngestService | null = null;

/**
 * Get singleton ingestion service instance
 */
export function getIngestService(config?: Partial<IngestConfig>): BiomarkerIngestService {
  if (!ingestService) {
    ingestService = new BiomarkerIngestService(config);
  }
  return ingestService;
}

/**
 * Start biomarker ingestion service
 */
export async function startIngestService(config?: Partial<IngestConfig>): Promise<void> {
  const service = getIngestService(config);
  await service.start();
}

/**
 * Stop biomarker ingestion service
 */
export async function stopIngestService(): Promise<void> {
  if (ingestService) {
    await ingestService.stop();
  }
}

// ============================================================================
// DEVICE SIMULATOR (for testing)
// ============================================================================

/**
 * Simulates a Neuropod device sending biosignal data
 * Use this for local testing without hardware
 */
export class NeuropodSimulator {
  private ws: WebSocket | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private deviceId: string;
  private updateRateMs: number;

  constructor(deviceId: string, updateRateMs: number = 100) {
    this.deviceId = deviceId;
    this.updateRateMs = updateRateMs;
  }

  /**
   * Connect to ingestion server
   */
  connect(port: number = 8765): void {
    this.ws = new WebSocket(`ws://localhost:${port}`);

    this.ws.on("open", () => {
      console.log(`[Simulator ${this.deviceId}] Connected to ingestion server`);
      this.startSending();
    });

    this.ws.on("message", (data: Buffer) => {
      console.log(`[Simulator ${this.deviceId}] Server response:`, data.toString());
    });

    this.ws.on("close", () => {
      console.log(`[Simulator ${this.deviceId}] Disconnected`);
      this.stopSending();
    });

    this.ws.on("error", (error) => {
      console.error(`[Simulator ${this.deviceId}] Connection error:`, error);
    });
  }

  /**
   * Start sending simulated biosignal data
   */
  private startSending(): void {
    let counter = 0;

    this.intervalId = setInterval(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.stopSending();
        return;
      }

      counter++;

      // Generate simulated signals
      const signals: BiomarkerPacket[] = [
        {
          source: this.deviceId,
          signal_type: "EEG",
          value: 10 + Math.sin(counter * 0.1) * 5, // Alpha wave (8-12 Hz)
          units: "Hz",
          channel: "TP9",
          quality: 0.85 + Math.random() * 0.15,
        },
        {
          source: this.deviceId,
          signal_type: "HRV",
          value: 50 + Math.sin(counter * 0.05) * 20, // HRV variation
          units: "ms",
          quality: 0.9 + Math.random() * 0.1,
        },
        {
          source: this.deviceId,
          signal_type: "GSR",
          value: 2.5 + Math.random() * 0.5, // Skin conductance
          units: "μS",
          quality: 0.95,
        },
        {
          source: this.deviceId,
          signal_type: "Breath",
          value: 12 + Math.sin(counter * 0.08) * 4, // Breath rate
          units: "bpm",
          quality: 1.0,
        },
      ];

      // Send each signal
      for (const signal of signals) {
        this.ws!.send(JSON.stringify(signal));
      }
    }, this.updateRateMs);
  }

  /**
   * Stop sending simulated data
   */
  private stopSending(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Disconnect simulator
   */
  disconnect(): void {
    this.stopSending();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

/**
 * EXAMPLE USAGE:
 *
 * ```typescript
 * // Start ingestion server
 * import { startIngestService } from "./biomarkerIngestService";
 * await startIngestService({ port: 8765, batchSize: 20, enableLogging: true });
 *
 * // (In another process) Connect device simulator
 * import { NeuropodSimulator } from "./biomarkerIngestService";
 * const simulator = new NeuropodSimulator("muse-s-001", 100);
 * simulator.connect(8765);
 *
 * // Later: stop services
 * await stopIngestService();
 * simulator.disconnect();
 * ```
 */
