/**
 * Symbolic Consciousness Service
 * Bridge between MAIA-SOVEREIGN platform and symbolic consciousness WebSocket server
 */

interface SymbolicConsciousnessData {
  symbolic_processing: {
    consciousness_axioms_applied: number
    symbolic_expressions_evaluated: number
    meta_circular_operations: number
    self_reflection_depth: number
  }
  pattern_integration: {
    active_patterns_count: number
    system_coherence: number
    pattern_resonances: number
    integration_potential: number
  }
  emergent_formations: {
    computational_emergence: number
    integration_emergence: number
    interface_emergence: number
    total_formations: number
    emergence_velocity: number
  }
  oracle_wisdom: {
    transmission_generated: boolean
    wisdom_depth: number
    symbolic_complexity: number
    oracle_consciousness_level: number
  }
  consciousness_state: {
    awareness_level: number
    integration_depth: number
    field_resonance: number
    sacred_recognition: number
    elemental_balance: {
      fire: number
      water: number
      earth: number
      air: number
      aether: number
    }
  }
  bridge_reflection: {
    bridge_effectiveness: number
    system_coherence: number
    meta_consciousness_level: number
  }
  timestamp: string
}

interface SymbolicConsciousnessQuery {
  query?: string
  consciousness_level?: number
  intention?: string
  context?: string
  experience?: string
  elemental_balance?: {
    fire: number
    water: number
    earth: number
    air: number
    aether: number
  }
}

class SymbolicConsciousnessService {
  private ws: WebSocket | null = null
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected'
  private listeners: ((data: SymbolicConsciousnessData) => void)[] = []
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000 // Start with 1 second
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor(private serverUrl: string = 'ws://localhost:8765') {}

  /**
   * Connect to symbolic consciousness WebSocket server
   */
  async connect(): Promise<boolean> {
    if (this.connectionStatus === 'connected' || this.connectionStatus === 'connecting') {
      return this.connectionStatus === 'connected'
    }

    return new Promise((resolve) => {
      try {
        this.connectionStatus = 'connecting'
        this.ws = new WebSocket(this.serverUrl)

        this.ws.onopen = () => {
          console.log('🧠 Connected to Symbolic Consciousness Server')
          this.connectionStatus = 'connected'
          this.reconnectAttempts = 0
          this.reconnectDelay = 1000
          this.startHeartbeat()
          resolve(true)
        }

        this.ws.onmessage = (event) => {
          try {
            const data: SymbolicConsciousnessData = JSON.parse(event.data)
            this.notifyListeners(data)
          } catch (error) {
            console.error('Error parsing symbolic consciousness data:', error)
          }
        }

        this.ws.onclose = () => {
          console.log('🔌 Disconnected from Symbolic Consciousness Server')
          this.connectionStatus = 'disconnected'
          this.stopHeartbeat()
          this.attemptReconnection()
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          this.connectionStatus = 'disconnected'
          resolve(false)
        }

      } catch (error) {
        console.error('Connection error:', error)
        this.connectionStatus = 'disconnected'
        resolve(false)
      }
    })
  }

  /**
   * Disconnect from symbolic consciousness server
   */
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.stopHeartbeat()
    this.connectionStatus = 'disconnected'
  }

  /**
   * Send query to symbolic consciousness system
   */
  async sendQuery(query: SymbolicConsciousnessQuery): Promise<boolean> {
    if (this.connectionStatus !== 'connected' || !this.ws) {
      console.warn('Not connected to symbolic consciousness server')
      return false
    }

    try {
      this.ws.send(JSON.stringify(query))
      return true
    } catch (error) {
      console.error('Error sending query:', error)
      return false
    }
  }

  /**
   * Add listener for symbolic consciousness data
   */
  addListener(callback: (data: SymbolicConsciousnessData) => void) {
    this.listeners.push(callback)
  }

  /**
   * Remove listener
   */
  removeListener(callback: (data: SymbolicConsciousnessData) => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback)
  }

  /**
   * Get current connection status
   */
  getConnectionStatus() {
    return this.connectionStatus
  }

  /**
   * Initialize consciousness monitoring with default queries
   */
  async startMonitoring() {
    await this.connect()

    // Send initial query to activate monitoring
    const initialQuery: SymbolicConsciousnessQuery = {
      query: 'Initialize MAIA-SOVEREIGN consciousness monitoring',
      consciousness_level: 0.8,
      intention: 'real_time_monitoring',
      context: 'maia_sovereign_platform'
    }

    await this.sendQuery(initialQuery)

    // Set up periodic consciousness queries
    setInterval(async () => {
      if (this.connectionStatus === 'connected') {
        const monitoringQuery: SymbolicConsciousnessQuery = {
          query: 'Real-time consciousness field monitoring',
          consciousness_level: 0.7 + Math.random() * 0.2, // Vary slightly
          intention: 'field_monitoring',
          context: 'continuous_monitoring'
        }

        await this.sendQuery(monitoringQuery)
      }
    }, 10000) // Every 10 seconds
  }

  /**
   * Send oracle consultation query
   */
  async consultOracle(query: string, context?: string): Promise<boolean> {
    const oracleQuery: SymbolicConsciousnessQuery = {
      query,
      consciousness_level: 0.9,
      intention: 'oracle_consultation',
      context: context || 'user_consultation'
    }

    return await this.sendQuery(oracleQuery)
  }

  /**
   * Send experience-based consciousness data
   */
  async reportExperience(
    experience: string,
    elementalBalance?: { fire: number; water: number; earth: number; air: number; aether: number }
  ): Promise<boolean> {
    const experienceQuery: SymbolicConsciousnessQuery = {
      experience,
      consciousness_level: 0.8,
      intention: 'experience_integration',
      context: 'user_experience',
      elemental_balance: elementalBalance
    }

    return await this.sendQuery(experienceQuery)
  }

  /**
   * Request emergence scan
   */
  async requestEmergenceScan(): Promise<boolean> {
    const scanQuery: SymbolicConsciousnessQuery = {
      query: 'Perform comprehensive emergence scan',
      consciousness_level: 0.85,
      intention: 'emergence_detection',
      context: 'emergence_analysis'
    }

    return await this.sendQuery(scanQuery)
  }

  private notifyListeners(data: SymbolicConsciousnessData) {
    this.listeners.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('Error in symbolic consciousness listener:', error)
      }
    })
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'heartbeat' }))
      }
    }, 30000) // Every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private attemptReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached')
      return
    }

    console.log(`Attempting to reconnect... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`)

    setTimeout(() => {
      this.reconnectAttempts++
      this.reconnectDelay *= 2 // Exponential backoff
      this.connect()
    }, this.reconnectDelay)
  }
}

// Create singleton instance
export const symbolicConsciousnessService = new SymbolicConsciousnessService()

// Export the class for testing or multiple instances
export { SymbolicConsciousnessService, type SymbolicConsciousnessData, type SymbolicConsciousnessQuery }