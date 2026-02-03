/**
 * Ganglion/OpenBCI MCP Adapter for MAIA-SOVEREIGN
 *
 * Provides EEG data access via MCP protocol using BrainFlow.
 * Enables MAIA to correlate consciousness states with biometric data.
 *
 * Key capabilities:
 * - Connect/disconnect from EEG device
 * - Stream real-time EEG data
 * - Compute consciousness metrics (focus, meditation, band powers)
 * - Track coherence and consciousness patterns
 *
 * Uses: Custom Ganglion MCP Server (mcp-servers/ganglion)
 */

import { EventEmitter } from 'events';
import type { MCPToolResult, GanglionReading, GanglionMetrics } from '../types';
import { getMCPClientManager } from '../MCPClientManager';

export interface DeviceStatus {
  connected: boolean;
  streaming: boolean;
  boardType: 'ganglion' | 'cyton' | 'synthetic';
  serialPort: string;
  sampleRate: number;
  brainflowAvailable: boolean;
}

export interface EEGSession {
  startTime: Date;
  readings: number;
  averageMetrics: GanglionMetrics;
  peakFocus: number;
  peakMeditation: number;
}

export interface ConsciousnessState {
  level: 'unfocused' | 'relaxed' | 'alert' | 'focused' | 'flow';
  focusScore: number;
  meditationScore: number;
  dominantWave: 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';
  coherence: number;
  timestamp: Date;
}

/**
 * Ganglion MCP Adapter
 * Provides EEG-aware access to consciousness data
 */
export class GanglionAdapter extends EventEmitter {
  private manager = getMCPClientManager();
  private session: EEGSession | null = null;
  private metricsBuffer: GanglionMetrics[] = [];
  private bufferSize = 30; // Keep last 30 readings (~15 seconds at 2Hz)

  constructor() {
    super();
  }

  /**
   * Check if Ganglion MCP is connected
   */
  isConnected(): boolean {
    return this.manager.isConnected('ganglion');
  }

  /**
   * Get available tools from the Ganglion MCP server
   */
  async getAvailableTools(): Promise<string[]> {
    const allTools = this.manager.getAllTools();
    const ganglionTools = allTools.get('ganglion');
    return ganglionTools?.map(t => t.name) || [];
  }

  // ============================================================================
  // Device Operations
  // ============================================================================

  /**
   * Connect to EEG device
   */
  async connect(
    serialPort: string = '/dev/tty.usbserial',
    boardType: 'ganglion' | 'cyton' | 'synthetic' = 'ganglion'
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.manager.callTool('ganglion', {
        name: 'ganglion_connect',
        arguments: { serial_port: serialPort, board_type: boardType },
      });

      const response = this.parseToolResult(result);
      if (response.success) {
        this.emit('connected', { serialPort, boardType });
      }
      return response;
    } catch (error) {
      console.error('[GanglionAdapter] Failed to connect:', error);
      return { success: false, message: String(error) };
    }
  }

  /**
   * Disconnect from device
   */
  async disconnect(): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.manager.callTool('ganglion', {
        name: 'ganglion_disconnect',
        arguments: {},
      });

      const response = this.parseToolResult(result);
      if (response.success) {
        this.session = null;
        this.metricsBuffer = [];
        this.emit('disconnected');
      }
      return response;
    } catch (error) {
      console.error('[GanglionAdapter] Failed to disconnect:', error);
      return { success: false, message: String(error) };
    }
  }

  /**
   * Start streaming EEG data
   */
  async startStream(): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.manager.callTool('ganglion', {
        name: 'ganglion_stream_start',
        arguments: {},
      });

      const response = this.parseToolResult(result);
      if (response.success) {
        this.session = {
          startTime: new Date(),
          readings: 0,
          averageMetrics: this.createEmptyMetrics(),
          peakFocus: 0,
          peakMeditation: 0,
        };
        this.emit('streamStarted');
      }
      return response;
    } catch (error) {
      console.error('[GanglionAdapter] Failed to start stream:', error);
      return { success: false, message: String(error) };
    }
  }

  /**
   * Stop streaming EEG data
   */
  async stopStream(): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.manager.callTool('ganglion', {
        name: 'ganglion_stream_stop',
        arguments: {},
      });

      const response = this.parseToolResult(result);
      if (response.success) {
        this.emit('streamStopped', this.session);
      }
      return response;
    } catch (error) {
      console.error('[GanglionAdapter] Failed to stop stream:', error);
      return { success: false, message: String(error) };
    }
  }

  /**
   * Get device status
   */
  async getStatus(): Promise<DeviceStatus | null> {
    try {
      const result = await this.manager.callTool('ganglion', {
        name: 'ganglion_status',
        arguments: {},
      });

      return this.parseStatus(result);
    } catch (error) {
      console.error('[GanglionAdapter] Failed to get status:', error);
      return null;
    }
  }

  // ============================================================================
  // Data Operations
  // ============================================================================

  /**
   * Get current EEG reading
   */
  async getReading(): Promise<GanglionReading | null> {
    try {
      const result = await this.manager.callTool('ganglion', {
        name: 'ganglion_get_reading',
        arguments: {},
      });

      const reading = this.parseReading(result);
      if (reading) {
        this.emit('reading', reading);
      }
      return reading;
    } catch (error) {
      console.error('[GanglionAdapter] Failed to get reading:', error);
      return null;
    }
  }

  /**
   * Get current consciousness metrics
   */
  async getMetrics(): Promise<GanglionMetrics | null> {
    try {
      const result = await this.manager.callTool('ganglion', {
        name: 'ganglion_get_metrics',
        arguments: {},
      });

      const metrics = this.parseMetrics(result);
      if (metrics) {
        this.updateMetricsBuffer(metrics);
        this.emit('metrics', metrics);
      }
      return metrics;
    } catch (error) {
      console.error('[GanglionAdapter] Failed to get metrics:', error);
      return null;
    }
  }

  // ============================================================================
  // Consciousness Analysis (for Oracle integration)
  // ============================================================================

  /**
   * Get current consciousness state
   * Main method for Oracle context
   */
  async getConsciousnessState(): Promise<ConsciousnessState | null> {
    const metrics = await this.getMetrics();
    if (!metrics) return null;

    // Determine consciousness level
    const level = this.determineConsciousnessLevel(metrics);

    // Find dominant wave
    const dominantWave = this.findDominantWave(metrics);

    return {
      level,
      focusScore: metrics.focusScore,
      meditationScore: metrics.meditationScore,
      dominantWave,
      coherence: metrics.coherence || 0,
      timestamp: new Date(metrics.timestamp),
    };
  }

  /**
   * Get averaged metrics over buffer
   * Provides smoother readings for consciousness context
   */
  getAveragedMetrics(): GanglionMetrics | null {
    if (this.metricsBuffer.length === 0) return null;

    const avgMetrics = this.createEmptyMetrics();
    const count = this.metricsBuffer.length;

    for (const m of this.metricsBuffer) {
      avgMetrics.focusScore += m.focusScore / count;
      avgMetrics.meditationScore += m.meditationScore / count;
      avgMetrics.alphaPower += m.alphaPower / count;
      avgMetrics.betaPower += m.betaPower / count;
      avgMetrics.thetaPower += m.thetaPower / count;
      avgMetrics.deltaPower += m.deltaPower / count;
    }

    avgMetrics.timestamp = new Date();
    return avgMetrics;
  }

  /**
   * Check if metrics indicate good state for deep work
   */
  async isGoodForDeepWork(): Promise<{
    suitable: boolean;
    reason: string;
    suggestion?: string;
  }> {
    const metrics = await this.getMetrics();
    if (!metrics) {
      return {
        suitable: false,
        reason: 'No EEG data available',
        suggestion: 'Connect EEG device for biometric guidance',
      };
    }

    if (metrics.focusScore >= 60 && metrics.meditationScore < 70) {
      return {
        suitable: true,
        reason: `Good focus state (${Math.round(metrics.focusScore)}/100)`,
      };
    }

    if (metrics.meditationScore > 70) {
      return {
        suitable: false,
        reason: 'Currently in relaxed/meditative state',
        suggestion: 'Good time for reflection or creative work instead',
      };
    }

    if (metrics.focusScore < 40) {
      return {
        suitable: false,
        reason: 'Focus levels are low',
        suggestion: 'Consider a brief meditation or walk before deep work',
      };
    }

    return {
      suitable: true,
      reason: 'Moderate focus - can engage with structured tasks',
    };
  }

  /**
   * Get session summary
   */
  getSessionSummary(): EEGSession | null {
    return this.session;
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private parseToolResult(result: MCPToolResult): { success: boolean; message: string } {
    if (result.isError) {
      return { success: false, message: 'Tool call failed' };
    }

    try {
      const textContent = result.content?.find(c => c.type === 'text');
      if (!textContent?.text) {
        return { success: false, message: 'No response' };
      }

      const data = JSON.parse(textContent.text);
      return {
        success: Boolean(data.success),
        message: String(data.message || data.error || ''),
      };
    } catch {
      return { success: false, message: 'Parse error' };
    }
  }

  private parseStatus(result: MCPToolResult): DeviceStatus | null {
    if (result.isError || !result.content) return null;

    try {
      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent?.text) return null;

      const data = JSON.parse(textContent.text);
      return {
        connected: Boolean(data.connected),
        streaming: Boolean(data.streaming),
        boardType: data.board_type || 'ganglion',
        serialPort: String(data.serial_port || ''),
        sampleRate: Number(data.sample_rate || 200),
        brainflowAvailable: Boolean(data.brainflow_available),
      };
    } catch {
      return null;
    }
  }

  private parseReading(result: MCPToolResult): GanglionReading | null {
    if (result.isError || !result.content) return null;

    try {
      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent?.text) return null;

      const data = JSON.parse(textContent.text);
      return {
        timestamp: new Date(data.timestamp || Date.now()),
        channels: Array.isArray(data.channels) ? data.channels.map(Number) : [0, 0, 0, 0],
        accelerometer: data.accelerometer,
      };
    } catch {
      return null;
    }
  }

  private parseMetrics(result: MCPToolResult): GanglionMetrics | null {
    if (result.isError || !result.content) return null;

    try {
      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent?.text) return null;

      const data = JSON.parse(textContent.text);
      return {
        focusScore: Number(data.focus_score || 50),
        meditationScore: Number(data.meditation_score || 50),
        alphaPower: Number(data.alpha_power || 0),
        betaPower: Number(data.beta_power || 0),
        thetaPower: Number(data.theta_power || 0),
        deltaPower: Number(data.delta_power || 0),
        timestamp: new Date(data.timestamp || Date.now()),
      };
    } catch {
      return null;
    }
  }

  private createEmptyMetrics(): GanglionMetrics {
    return {
      focusScore: 50,
      meditationScore: 50,
      alphaPower: 0,
      betaPower: 0,
      thetaPower: 0,
      deltaPower: 0,
      timestamp: new Date(),
    };
  }

  private updateMetricsBuffer(metrics: GanglionMetrics): void {
    this.metricsBuffer.push(metrics);
    if (this.metricsBuffer.length > this.bufferSize) {
      this.metricsBuffer.shift();
    }

    // Update session stats
    if (this.session) {
      this.session.readings++;
      if (metrics.focusScore > this.session.peakFocus) {
        this.session.peakFocus = metrics.focusScore;
      }
      if (metrics.meditationScore > this.session.peakMeditation) {
        this.session.peakMeditation = metrics.meditationScore;
      }
    }
  }

  private determineConsciousnessLevel(metrics: GanglionMetrics): ConsciousnessState['level'] {
    const { focusScore, meditationScore } = metrics;

    if (focusScore >= 75 && meditationScore >= 60) {
      return 'flow';
    }
    if (focusScore >= 60) {
      return 'focused';
    }
    if (meditationScore >= 70) {
      return 'relaxed';
    }
    if (focusScore >= 40 || meditationScore >= 40) {
      return 'alert';
    }
    return 'unfocused';
  }

  private findDominantWave(metrics: GanglionMetrics): ConsciousnessState['dominantWave'] {
    const waves = [
      { name: 'delta' as const, power: metrics.deltaPower },
      { name: 'theta' as const, power: metrics.thetaPower },
      { name: 'alpha' as const, power: metrics.alphaPower },
      { name: 'beta' as const, power: metrics.betaPower },
    ];

    waves.sort((a, b) => b.power - a.power);
    return waves[0].name;
  }
}

// Singleton instance
let instance: GanglionAdapter | null = null;

export function getGanglionAdapter(): GanglionAdapter {
  if (!instance) {
    instance = new GanglionAdapter();
  }
  return instance;
}

export function resetGanglionAdapter(): void {
  if (instance) {
    instance = null;
  }
}
