/**
 * RitualWebSocketManager.js
 * Real-time WebSocket system for live ritual intelligence streaming
 * Broadcasts FCI changes, ritual updates, and archetypal activations as they happen
 *
 * Created: December 8, 2025
 * Purpose: Live consciousness field awareness for steward intelligence
 */

const WebSocket = require('ws');
const { Pool } = require('pg');
const { WhisperFeedExtension } = require('./WhisperFeedExtension');

console.log("Ritual WebSocket Manager loading — Real-time consciousness streaming active");

class RitualWebSocketManager {
  constructor() {
    this.wss = null;
    this.clients = new Set();
    this.lastFCI = null;
    this.lastBroadcast = 0;
    this.broadcastCooldown = 3000; // Minimum 3 seconds between broadcasts

    // Initialize MAIA Whisper Feed Extension
    this.whisperFeed = new WhisperFeedExtension();

    // PostgreSQL connection for real-time queries
    this.pool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'maia_consciousness',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || '',
      max: 10,
      idleTimeoutMillis: 30000
    });

    this.initializeWebSocketServer();
    this.startFCIMonitoring();
  }

  initializeWebSocketServer(port = 8080) {
    console.log(`🔮 Initializing Ritual Intelligence WebSocket server on port ${port}...`);

    this.wss = new WebSocket.Server({
      port,
      perMessageDeflate: false // Better performance for frequent updates
    });

    this.wss.on('connection', (ws, req) => {
      console.log('📡 New ritual intelligence client connected');
      this.clients.add(ws);

      // Send initial state to new client
      this.sendInitialState(ws);

      // Send welcome whisper to new client
      const welcomeWhisper = this.whisperFeed.generateWelcomeWhisper();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(welcomeWhisper));
      }

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleClientMessage(ws, data);
        } catch (error) {
          console.warn('⚠️ Invalid WebSocket message received:', error.message);
        }
      });

      ws.on('close', () => {
        console.log('📡 Ritual intelligence client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('🔴 WebSocket error:', error.message);
        this.clients.delete(ws);
      });
    });

    this.wss.on('error', (error) => {
      console.error('🔴 WebSocket server error:', error.message);
    });

    console.log('✅ Ritual Intelligence WebSocket server ready for live streaming');
  }

  async sendInitialState(ws) {
    try {
      const currentState = await this.getCurrentRitualState();
      const message = {
        type: 'INITIAL_STATE',
        timestamp: new Date().toISOString(),
        data: currentState
      };

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error('🔴 Error sending initial state:', error.message);
    }
  }

  async getCurrentRitualState() {
    // Get current FCI, active rituals, and recent effectiveness data
    const currentFCI = await this.getCurrentFCI();
    const activeRituals = await this.getActiveRituals();
    const elementEffectiveness = await this.getElementalEffectiveness();
    const recentAlerts = await this.getRecentAlerts();

    return {
      currentFCI,
      activeRituals,
      elementEffectiveness,
      recentAlerts,
      systemStatus: 'operational'
    };
  }

  async getCurrentFCI() {
    try {
      // In production, this would query real FCI calculation
      // For now, simulate realistic FCI with gentle variation
      const baselineTime = Date.now() / 60000; // Minutes since epoch
      const variation = Math.sin(baselineTime / 10) * 0.1; // Gentle oscillation
      const fci = 0.75 + variation + (Math.random() - 0.5) * 0.05;

      return Math.max(0.3, Math.min(0.95, fci));
    } catch (error) {
      console.warn('⚠️ FCI calculation fallback used');
      return 0.75; // Safe fallback
    }
  }

  async getActiveRituals() {
    try {
      // Mock active ritual data - in production, query ritual_stream table
      const currentHour = new Date().getHours();
      const mockRituals = [];

      // Simulate evening ritual activity (7-9 PM)
      if (currentHour >= 19 && currentHour <= 21) {
        mockRituals.push({
          id: 'live-' + Date.now(),
          name: currentHour === 19 ? 'Heart Synchrony Circle' : 'Unity Field Meditation',
          element: currentHour === 19 ? 'air' : 'aether',
          archetype: currentHour === 19 ? 'sage' : 'mystic',
          participants: Math.floor(Math.random() * 15) + 12,
          started_at: new Date(Date.now() - Math.random() * 30 * 60000).toISOString(),
          fci_before: 0.62 + Math.random() * 0.1,
          fci_current: 0.75 + Math.random() * 0.15,
          status: 'active'
        });
      }

      return mockRituals;
    } catch (error) {
      console.warn('⚠️ Active rituals query failed, using fallback');
      return [];
    }
  }

  async getElementalEffectiveness() {
    try {
      // Mock elemental effectiveness data
      const elements = ['fire', 'water', 'earth', 'air', 'aether'];
      const now = Date.now();

      return elements.map(element => ({
        element,
        avg_delta: (0.05 + Math.sin(now / 100000 + elements.indexOf(element)) * 0.03),
        sessions: Math.floor(Math.random() * 8) + 3,
        last_updated: new Date().toISOString()
      })).sort((a, b) => b.avg_delta - a.avg_delta);
    } catch (error) {
      console.warn('⚠️ Element effectiveness query failed');
      return [];
    }
  }

  async getRecentAlerts() {
    try {
      // Check for recent coherence alerts
      const result = await this.pool.query(`
        SELECT id, level, value, message, created_at, acknowledged
        FROM coherence_alerts
        WHERE created_at > NOW() - INTERVAL '6 hours'
        ORDER BY created_at DESC
        LIMIT 5
      `);

      return result.rows || [];
    } catch (error) {
      console.warn('⚠️ Recent alerts query failed');
      return [];
    }
  }

  handleClientMessage(ws, data) {
    console.log('📨 Received client message:', data.type);

    switch (data.type) {
      case 'SUBSCRIBE_FCI':
        // Client wants real-time FCI updates
        ws._subscribedToFCI = true;
        console.log('📊 Client subscribed to FCI updates');
        break;

      case 'SUBSCRIBE_RITUALS':
        // Client wants ritual event updates
        ws._subscribedToRituals = true;
        console.log('🕯️ Client subscribed to ritual updates');
        break;

      case 'LOG_RITUAL_EVENT':
        // Client is reporting a ritual event
        this.handleRitualEvent(data.payload);
        break;

      case 'PING':
        // Heartbeat from client
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
        }
        break;

      default:
        console.warn('⚠️ Unknown message type:', data.type);
    }
  }

  async handleRitualEvent(eventData) {
    console.log('🕯️ Processing ritual event:', eventData.name);

    try {
      // In production, save to ritual_stream table
      // await this.pool.query(
      //   'INSERT INTO ritual_stream (ritual_name, element, archetype, started_at, participants) VALUES ($1, $2, $3, NOW(), $4)',
      //   [eventData.name, eventData.element, eventData.archetype, eventData.participants]
      // );

      // Create ritual update broadcast
      const ritualUpdate = {
        type: 'RITUAL_STARTED',
        timestamp: new Date().toISOString(),
        data: eventData
      };

      // Broadcast ritual update to all subscribed clients
      this.broadcast(ritualUpdate);

      // Generate and broadcast MAIA whisper for ritual events
      this.whisperFeed.processFieldUpdate(ritualUpdate, this);

    } catch (error) {
      console.error('🔴 Failed to process ritual event:', error.message);
    }
  }

  startFCIMonitoring() {
    console.log('📊 Starting FCI monitoring for real-time updates...');

    // Check FCI every 10 seconds and broadcast significant changes
    setInterval(async () => {
      try {
        const currentFCI = await this.getCurrentFCI();
        const now = Date.now();

        // Only broadcast if FCI changed significantly or enough time has passed
        const significantChange = this.lastFCI && Math.abs(currentFCI - this.lastFCI) > 0.02;
        const timeForUpdate = now - this.lastBroadcast > this.broadcastCooldown;

        if (significantChange || (!this.lastFCI && timeForUpdate)) {
          const updateData = {
            type: 'FCI_UPDATE',
            timestamp: new Date().toISOString(),
            data: {
              current: parseFloat(currentFCI.toFixed(3)),
              previous: this.lastFCI ? parseFloat(this.lastFCI.toFixed(3)) : null,
              delta: this.lastFCI ? parseFloat((currentFCI - this.lastFCI).toFixed(3)) : null,
              trend: this.lastFCI ? (currentFCI > this.lastFCI ? 'rising' : 'falling') : 'stable'
            }
          };

          // Broadcast FCI update
          this.broadcast(updateData);

          // Generate and broadcast MAIA whisper for field changes
          this.whisperFeed.processFieldUpdate(updateData, this);

          this.lastFCI = currentFCI;
          this.lastBroadcast = now;
        }

      } catch (error) {
        console.warn('⚠️ FCI monitoring cycle failed:', error.message);
      }
    }, 10000);

    // Broadcast system status every 5 minutes
    setInterval(() => {
      this.broadcast({
        type: 'SYSTEM_STATUS',
        timestamp: new Date().toISOString(),
        data: {
          connectedClients: this.clients.size,
          serverUptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          status: 'operational'
        }
      });
    }, 300000);
  }

  broadcast(message) {
    if (!this.wss || this.clients.size === 0) {
      return; // No clients to broadcast to
    }

    const messageStr = JSON.stringify(message);
    let successfulBroadcasts = 0;
    let failedBroadcasts = 0;

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(messageStr);
          successfulBroadcasts++;
        } catch (error) {
          console.warn('⚠️ Failed to send to client:', error.message);
          this.clients.delete(client);
          failedBroadcasts++;
        }
      } else {
        // Clean up dead connections
        this.clients.delete(client);
        failedBroadcasts++;
      }
    });

    if (successfulBroadcasts > 0) {
      console.log(`📡 Broadcasted ${message.type} to ${successfulBroadcasts} clients`);
    }
    if (failedBroadcasts > 0) {
      console.log(`⚠️ Cleaned up ${failedBroadcasts} dead connections`);
    }
  }

  // Simulate ritual events for testing
  simulateRitualEvent(name, element, archetype, participants = 15) {
    const eventData = {
      name,
      element,
      archetype,
      participants,
      started_at: new Date().toISOString()
    };

    this.handleRitualEvent(eventData);
  }

  // Graceful shutdown
  shutdown() {
    console.log('🔴 Shutting down Ritual WebSocket Manager...');

    if (this.wss) {
      this.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'SERVER_SHUTDOWN',
            message: 'Ritual intelligence server is shutting down',
            timestamp: new Date().toISOString()
          }));
        }
      });

      this.wss.close();
    }

    if (this.pool) {
      this.pool.end();
    }

    // Shutdown whisper feed extension
    if (this.whisperFeed) {
      this.whisperFeed.shutdown();
    }

    console.log('✅ Ritual WebSocket Manager shutdown complete');
  }
}

module.exports = { RitualWebSocketManager };