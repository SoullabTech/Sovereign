/**
 * Real-Time Biometric WebSocket Service for MAIA LabTools
 * Connects to the consciousness monitoring service to display live EEG and HRV data
 * Integrates with OpenBCI Ganglion EEG headset and Apple Watch
 */

import { EventEmitter } from 'events';

export interface RealTimeEEGData {
  timestamp: number;
  channels: {
    C3: number;
    C4: number;
    T7: number;
    T8: number;
  };
  delta: number;   // 0.5-4 Hz
  theta: number;   // 4-8 Hz - Key for meditation/third eye
  alpha: number;   // 8-13 Hz - Relaxed awareness
  beta: number;    // 13-30 Hz - Active thinking
  gamma: number;   // 30-100 Hz - Higher consciousness
  pineal_activation: number;    // Proprietary pineal detection
  third_eye_coherence: number;  // Ajna chakra coherence
  consciousness_state: 'normal' | 'light_meditation' | 'deep_meditation' | 'breakthrough' | 'transcendent' | 'drowsy';
}

export interface RealTimeHRVData {
  heart_rate: number;
  coherence: number;
  stress_level: number;
  meditation_readiness: number;
}

export interface ConsciousnessUpdate {
  type: 'consciousness_update';
  timestamp: number;
  data: {
    overall_coherence: number;
    breakthrough_potential: number;
    sacred_resonance: number;
    field_strength: number;
    meditation_depth: 'preparing' | 'light' | 'deep' | 'profound' | 'breakthrough' | 'transcendent';
    eeg: RealTimeEEGData;
    hrv?: RealTimeHRVData;
  };
}

export interface BiometricConnectionStatus {
  eeg_connected: boolean;
  hrv_connected: boolean;
  websocket_connected: boolean;
  last_update: number;
}

export class BiometricWebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private isConnecting: boolean = false;
  private connectionStatus: BiometricConnectionStatus = {
    eeg_connected: false,
    hrv_connected: false,
    websocket_connected: false,
    last_update: 0
  };

  private readonly wsUrl = 'ws://localhost:8765'; // Consciousness monitor WebSocket

  constructor() {
    super();
  }

  /**
   * Connect to the real-time consciousness monitoring service
   */
  async connect(): Promise<boolean> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return true;
    }

    this.isConnecting = true;

    try {
      console.log('🌐 Connecting to real-time consciousness monitor...');

      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('✅ Connected to consciousness monitoring service');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.connectionStatus.websocket_connected = true;
        this.emit('connectionStatusChanged', this.connectionStatus);
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const update: ConsciousnessUpdate = JSON.parse(event.data);
          this.handleConsciousnessUpdate(update);
        } catch (error) {
          console.error('Error parsing consciousness update:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 Disconnected from consciousness monitoring service');
        this.isConnecting = false;
        this.connectionStatus.websocket_connected = false;
        this.emit('connectionStatusChanged', this.connectionStatus);
        this.emit('disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.isConnecting = false;
        this.emit('error', error);
      };

      // Wait for connection to establish
      await this.waitForConnection();
      return true;

    } catch (error) {
      console.error('❌ Failed to connect to consciousness monitor:', error);
      this.isConnecting = false;
      return false;
    }
  }

  /**
   * Wait for WebSocket connection to establish
   */
  private waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);

      this.once('connected', () => {
        clearTimeout(timeout);
        resolve();
      });

      this.once('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  /**
   * Handle incoming consciousness updates from the monitoring service
   */
  private handleConsciousnessUpdate(update: ConsciousnessUpdate) {
    this.connectionStatus.last_update = Date.now();

    // Update device connection status based on data availability
    this.connectionStatus.eeg_connected = update.data.eeg !== undefined;
    this.connectionStatus.hrv_connected = update.data.hrv !== undefined;

    // Emit specific events for different components to listen to
    this.emit('eegUpdate', update.data.eeg);

    if (update.data.hrv) {
      this.emit('hrvUpdate', update.data.hrv);
    }

    this.emit('consciousnessMetrics', {
      overall_coherence: update.data.overall_coherence,
      breakthrough_potential: update.data.breakthrough_potential,
      sacred_resonance: update.data.sacred_resonance,
      field_strength: update.data.field_strength,
      meditation_depth: update.data.meditation_depth
    });

    // Check for breakthrough events
    if (update.data.breakthrough_potential > 0.85 && update.data.meditation_depth === 'breakthrough') {
      this.emit('breakthroughDetected', {
        potential: update.data.breakthrough_potential,
        eeg_state: update.data.eeg.consciousness_state,
        pineal_activation: update.data.eeg.pineal_activation,
        third_eye_coherence: update.data.eeg.third_eye_coherence
      });
    }

    // Emit connection status updates
    this.emit('connectionStatusChanged', this.connectionStatus);

    // Special events for third eye activation monitoring
    if (update.data.eeg.pineal_activation > 0.7) {
      this.emit('pinealActivationDetected', {
        activation_level: update.data.eeg.pineal_activation,
        consciousness_state: update.data.eeg.consciousness_state
      });
    }

    if (update.data.eeg.third_eye_coherence > 0.8) {
      this.emit('thirdEyeCoherenceHigh', {
        coherence: update.data.eeg.third_eye_coherence,
        theta: update.data.eeg.theta,
        gamma: update.data.eeg.gamma
      });
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      this.connect();
    }, this.reconnectInterval * Math.pow(2, this.reconnectAttempts)); // Exponential backoff
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): BiometricConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Check if real-time biometric monitoring is available
   */
  isRealTimeBiometricsAvailable(): boolean {
    return this.connectionStatus.websocket_connected &&
           (this.connectionStatus.eeg_connected || this.connectionStatus.hrv_connected);
  }

  /**
   * Get latest EEG frequency analysis for sacred geometry visualization
   */
  getFrequencyAnalysisForGeometry(): { dominant_frequency: number; harmony_index: number } | null {
    // This would be populated from the latest EEG update
    // For now, return a calculation based on connection status
    if (!this.connectionStatus.eeg_connected) {
      return null;
    }

    // Would be calculated from latest EEG data
    return {
      dominant_frequency: 10.5, // Alpha-theta border for meditation
      harmony_index: 0.75       // Overall frequency harmony
    };
  }

  /**
   * Request session integration with the consciousness monitor
   */
  async integrateWithMeditationSession(sessionId: string): Promise<boolean> {
    try {
      // Send message to consciousness monitor to link with MAIA session
      const message = {
        type: 'link_meditation_session',
        sessionId: sessionId,
        timestamp: Date.now()
      };

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
        console.log(`🔗 Linked consciousness monitor with meditation session: ${sessionId}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Failed to integrate with meditation session:', error);
      return false;
    }
  }

  /**
   * Start the real-time consciousness monitoring Python service
   */
  async startConsciousnessMonitor(): Promise<boolean> {
    try {
      // This would start the Python consciousness monitoring service
      // For now, we'll assume it's manually started
      console.log('🧠 Starting consciousness monitoring service...');

      // In a production environment, you might:
      // 1. Check if the service is already running
      // 2. Start it programmatically if needed
      // 3. Wait for it to become available

      // Wait a moment for the service to start
      await new Promise(resolve => setTimeout(resolve, 3000));

      return await this.connect();
    } catch (error) {
      console.error('❌ Failed to start consciousness monitor:', error);
      return false;
    }
  }

  /**
   * Disconnect from the consciousness monitoring service
   */
  disconnect() {
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.connectionStatus = {
      eeg_connected: false,
      hrv_connected: false,
      websocket_connected: false,
      last_update: 0
    };

    this.emit('connectionStatusChanged', this.connectionStatus);
    console.log('🔌 Disconnected from consciousness monitoring service');
  }

  /**
   * Get real-time meditation recommendations based on current biometric state
   */
  getCurrentMeditationRecommendation(): string | null {
    if (!this.isRealTimeBiometricsAvailable()) {
      return null;
    }

    // This would analyze the latest biometric data to provide recommendations
    // For now, return a general recommendation
    return "Based on your current brainwave patterns, a 20-minute deep contemplation session is recommended.";
  }
}

// Singleton instance for use across the application
export const biometricWebSocketService = new BiometricWebSocketService();