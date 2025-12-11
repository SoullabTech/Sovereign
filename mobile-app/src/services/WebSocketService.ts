/**
 * WebSocketService.ts
 * Real-time WebSocket connection for consciousness field streaming
 * Handles live FCI updates, ritual events, and MAIA whisper feed
 *
 * Created: December 8, 2025
 * Purpose: Real-time consciousness field awareness for mobile
 */

import {
  WebSocketMessage,
  WebSocketMessageType,
  WhisperMessage,
  FieldState,
  ConsciousnessState,
  ConnectionStatus,
} from '../types';

export type WebSocketEventListener = (message: WebSocketMessage) => void;
export type ConnectionStatusListener = (status: ConnectionStatus) => void;

class WebSocketServiceClass {
  private ws: WebSocket | null = null;
  private wsUrl: string = 'ws://localhost:8080'; // Ritual WebSocket server (currently disabled for iOS Simulator compatibility)
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isIntentionalDisconnect: boolean = false;
  private isMinimized: boolean = false;

  // Event listeners
  private eventListeners: Map<WebSocketMessageType, WebSocketEventListener[]> = new Map();
  private connectionListeners: ConnectionStatusListener[] = [];

  // Connection state
  private connectionStatus: ConnectionStatus = {
    websocket: 'disconnected',
    api: 'disconnected',
    fieldStream: 'inactive',
    lastHeartbeat: new Date().toISOString(),
  };

  constructor() {
    console.log('📡 WebSocketService initialized');
  }

  /**
   * Initialize WebSocket connection
   */
  async initialize(): Promise<void> {
    console.log('🔌 Initializing WebSocket connection to consciousness field...');

    try {
      await this.connect();
    } catch (error) {
      console.warn('⚠️ WebSocket not available - running in offline mode:', error);
      this.updateConnectionStatus('websocket', 'disconnected');
      this.updateConnectionStatus('fieldStream', 'inactive');
      // Continue app initialization even without WebSocket
      return Promise.resolve();
    }
  }

  /**
   * Establish WebSocket connection
   */
  private async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.updateConnectionStatus('websocket', 'connecting');

        this.ws = new WebSocket(this.wsUrl);

        // Connection opened
        this.ws.onopen = () => {
          console.log('✅ WebSocket connected to consciousness field');
          this.updateConnectionStatus('websocket', 'connected');
          this.updateConnectionStatus('fieldStream', 'active');
          this.reconnectAttempts = 0;
          this.isIntentionalDisconnect = false;

          // Start heartbeat
          this.startHeartbeat();

          // Subscribe to FCI updates and ritual events
          this.subscribeToFCIUpdates();
          this.subscribeToRitualEvents();

          resolve();
        };

        // Message received
        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleIncomingMessage(message);
          } catch (error) {
            console.warn('⚠️ Failed to parse WebSocket message:', error);
          }
        };

        // Connection error
        this.ws.onerror = (error) => {
          console.error('🔴 WebSocket error:', error);
          this.updateConnectionStatus('websocket', 'error');
          reject(error);
        };

        // Connection closed
        this.ws.onclose = (event) => {
          console.log('📡 WebSocket connection closed:', event.code, event.reason);
          this.updateConnectionStatus('websocket', 'disconnected');
          this.updateConnectionStatus('fieldStream', 'inactive');

          this.stopHeartbeat();

          // Auto-reconnect unless intentionally disconnected or minimized
          if (!this.isIntentionalDisconnect && !this.isMinimized) {
            this.scheduleReconnect();
          }
        };

        // Timeout for connection attempt
        setTimeout(() => {
          if (this.ws?.readyState === WebSocket.CONNECTING) {
            this.ws.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);

      } catch (error) {
        console.error('🔴 Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleIncomingMessage(message: WebSocketMessage): void {
    // Update last heartbeat timestamp
    this.connectionStatus.lastHeartbeat = message.timestamp;

    // Distribute message to registered listeners
    const listeners = this.eventListeners.get(message.type) || [];
    listeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        console.error('🔴 Error in WebSocket event listener:', error);
      }
    });

    // Special handling for different message types
    switch (message.type) {
      case 'FCI_UPDATE':
        console.log('📊 FCI Update:', message.data.current);
        break;

      case 'MAIA_WHISPER':
        console.log('🌬️ MAIA Whisper:', message.data.text);
        this.handleWhisperMessage(message as WhisperMessage);
        break;

      case 'RITUAL_STARTED':
        console.log('🕯️ Ritual Started:', message.data.name);
        break;

      case 'SYSTEM_STATUS':
        console.log('⚙️ System Status:', message.data.status);
        break;

      case 'INITIAL_STATE':
        console.log('🏁 Received initial field state');
        break;

      case 'PONG':
        // Heartbeat response received
        break;

      default:
        console.log('📨 Unknown message type:', message.type);
    }
  }

  /**
   * Handle MAIA whisper messages with special formatting
   */
  private handleWhisperMessage(whisper: WhisperMessage): void {
    // Additional whisper-specific processing could go here
    // For now, just pass to regular listeners
  }

  /**
   * Subscribe to FCI updates
   */
  private subscribeToFCIUpdates(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const subscribeMessage = {
        type: 'SUBSCRIBE_FCI',
        timestamp: new Date().toISOString(),
      };
      this.ws.send(JSON.stringify(subscribeMessage));
      console.log('📊 Subscribed to FCI updates');
    }
  }

  /**
   * Subscribe to ritual events
   */
  private subscribeToRitualEvents(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const subscribeMessage = {
        type: 'SUBSCRIBE_RITUALS',
        timestamp: new Date().toISOString(),
      };
      this.ws.send(JSON.stringify(subscribeMessage));
      console.log('🕯️ Subscribed to ritual events');
    }
  }

  /**
   * Start heartbeat to maintain connection
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        const pingMessage = {
          type: 'PING',
          timestamp: new Date().toISOString(),
        };
        this.ws.send(JSON.stringify(pingMessage));
      }
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Schedule reconnect with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🔴 Max reconnection attempts reached');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    this.reconnectTimeout = setTimeout(() => {
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connect().catch(error => {
        console.error('🔴 Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Add event listener for specific message types
   */
  addEventListener(type: WebSocketMessageType, listener: WebSocketEventListener): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(type: WebSocketMessageType, listener: WebSocketEventListener): void {
    const listeners = this.eventListeners.get(type) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Add connection status listener
   */
  addConnectionListener(listener: ConnectionStatusListener): void {
    this.connectionListeners.push(listener);
  }

  /**
   * Remove connection status listener
   */
  removeConnectionListener(listener: ConnectionStatusListener): void {
    const index = this.connectionListeners.indexOf(listener);
    if (index > -1) {
      this.connectionListeners.splice(index, 1);
    }
  }

  /**
   * Update connection status and notify listeners
   */
  private updateConnectionStatus(key: keyof ConnectionStatus, value: any): void {
    this.connectionStatus = {
      ...this.connectionStatus,
      [key]: value,
    };

    // Notify all connection listeners
    this.connectionListeners.forEach(listener => {
      try {
        listener(this.connectionStatus);
      } catch (error) {
        console.error('🔴 Error in connection status listener:', error);
      }
    });
  }

  /**
   * Send message to server (if connected)
   */
  sendMessage(message: Partial<WebSocketMessage>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const fullMessage = {
        timestamp: new Date().toISOString(),
        ...message,
      };
      this.ws.send(JSON.stringify(fullMessage));
    } else {
      console.warn('⚠️ Cannot send message - WebSocket not connected');
    }
  }

  /**
   * Log ritual event to the server
   */
  logRitualEvent(ritualData: any): void {
    this.sendMessage({
      type: 'LOG_RITUAL_EVENT',
      data: ritualData,
    });
  }

  /**
   * Reconnect manually
   */
  async reconnect(): Promise<void> {
    console.log('🔄 Manual reconnect requested...');
    this.isIntentionalDisconnect = false;
    this.isMinimized = false;

    if (this.ws) {
      this.ws.close();
    }

    // Clear any existing reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.reconnectAttempts = 0;
    await this.connect();
  }

  /**
   * Minimize connection (for background mode)
   */
  minimize(): void {
    console.log('📱 Minimizing WebSocket connection...');
    this.isMinimized = true;

    // Keep connection alive but reduce activity
    this.stopHeartbeat();

    // Start slower heartbeat for background
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        const pingMessage = {
          type: 'PING',
          timestamp: new Date().toISOString(),
        };
        this.ws.send(JSON.stringify(pingMessage));
      }
    }, 60000); // Ping every 60 seconds in background
  }

  /**
   * Disconnect intentionally
   */
  disconnect(): void {
    console.log('📡 Disconnecting from consciousness field...');
    this.isIntentionalDisconnect = true;

    // Clear reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Stop heartbeat
    this.stopHeartbeat();

    // Close WebSocket connection
    if (this.ws) {
      this.ws.close();
    }

    // Clear event listeners
    this.eventListeners.clear();
    this.connectionListeners.length = 0;

    this.updateConnectionStatus('websocket', 'disconnected');
    this.updateConnectionStatus('fieldStream', 'inactive');
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get WebSocket ready state
   */
  getReadyState(): number | undefined {
    return this.ws?.readyState;
  }
}

// Export singleton instance
export const WebSocketService = new WebSocketServiceClass();