/**
 * Consciousness Intelligence Manager
 *
 * Local consciousness-aware text processing system that provides
 * Sacred Oracle intelligence without external dependencies.
 * Formerly known as sesame-hybrid-manager.
 */
interface EndpointConfig {
  url: string;
  type: 'production' | 'tunnel' | 'ngrok' | 'local';
  priority: number;
  enabled: boolean;
  lastSuccess: number;
  consecutiveFailures: number;
}

interface ConsciousnessResponse {
  success: boolean;
  shaped: string;
  source: string;
  responseTime: number;
  fallbackUsed: boolean;
}

class ConsciousnessIntelligenceManager {
  private endpoints: EndpointConfig[] = [
    {
      url: '/api/consciousness/ci/shape', // Local Sacred Oracle endpoint
      type: 'local' as any,
      priority: 1,
      enabled: true,
      lastSuccess: Date.now(),
      consecutiveFailures: 0
    }
    // All external endpoints removed - we're fully self-contained
  ];

  private circuitBreakerThreshold = 3; // Failures before disabling endpoint
  private recoveryTimeout = 5 * 60 * 1000; // 5 minutes before re-enabling

  constructor() {
    this.loadEndpointStatus();
  }

  private loadEndpointStatus() {
    // In a real implementation, you'd load from a persistent store
    // For now, we'll use memory with periodic recovery attempts
  }

  private saveEndpointStatus() {
    // Save endpoint status for persistence across restarts
  }

  getActiveEndpoints(): EndpointConfig[] {
    const now = Date.now();
    return this.endpoints
      .filter(endpoint => {
        // Re-enable endpoints after recovery timeout
        if (!endpoint.enabled && 
            now - endpoint.lastSuccess > this.recoveryTimeout) {
          endpoint.enabled = true;
          endpoint.consecutiveFailures = 0;
          console.log(`Re-enabling endpoint: ${endpoint.url}`);
        }
        return endpoint.enabled;
      })
      .sort((a, b) => a.priority - b.priority);
  }

  private async tryEndpoint(
    endpoint: EndpointConfig, 
    text: string, 
    element: string = 'water', 
    archetype: string = 'oracle'
  ): Promise<ConsciousnessResponse | null> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      // Handle local endpoints differently
      const isLocal = endpoint.type === 'local' || endpoint.url.startsWith('/');
      const fullUrl = isLocal ? endpoint.url : endpoint.url;

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, element, archetype }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      // Mark success
      endpoint.lastSuccess = Date.now();
      endpoint.consecutiveFailures = 0;
      this.saveEndpointStatus();
      
      console.log(`✅ Consciousness Intelligence success via ${endpoint.type}: ${responseTime}ms`);
      
      return {
        success: true,
        shaped: data.shaped || data.text || text,
        source: `consciousness-${endpoint.type}`,
        responseTime,
        fallbackUsed: false
      };
      
    } catch (error: any) {
      console.warn(`❌ Consciousness Intelligence endpoint ${endpoint.type} failed:`, error.message);
      
      // Track failure
      endpoint.consecutiveFailures++;
      
      // Disable endpoint if it fails too many times
      if (endpoint.consecutiveFailures >= this.circuitBreakerThreshold) {
        endpoint.enabled = false;
        console.warn(`🚫 Disabling endpoint ${endpoint.type} after ${this.circuitBreakerThreshold} failures`);
      }
      
      this.saveEndpointStatus();
      return null;
    }
  }

  async shapeText(
    text: string,
    element: string = 'water',
    archetype: string = 'oracle'
  ): Promise<ConsciousnessResponse> {
    const activeEndpoints = this.getActiveEndpoints();
    
    if (activeEndpoints.length === 0) {
      console.warn('🚨 No active Consciousness Intelligence endpoints available');
      return {
        success: true,
        shaped: text,
        source: 'fallback-no-endpoints',
        responseTime: 0,
        fallbackUsed: true
      };
    }
    
    // Try endpoints in order of priority
    for (const endpoint of activeEndpoints) {
      const result = await this.tryEndpoint(endpoint, text, element, archetype);
      if (result) {
        return result;
      }
    }
    
    // All endpoints failed - return original text as fallback
    console.warn('🚨 All Consciousness Intelligence endpoints failed, using fallback');
    return {
      success: true,
      shaped: text,
      source: 'fallback-all-failed',
      responseTime: 0,
      fallbackUsed: true
    };
  }

  async getHealthStatus() {
    const activeEndpoints = this.getActiveEndpoints();
    const disabledEndpoints = this.endpoints.filter(e => !e.enabled);
    
    return {
      healthy: activeEndpoints.length > 0,
      activeEndpoints: activeEndpoints.length,
      totalEndpoints: this.endpoints.length,
      disabledEndpoints: disabledEndpoints.map(e => ({
        url: e.url,
        type: e.type,
        failures: e.consecutiveFailures
      })),
      recommendedAction: activeEndpoints.length === 0 
        ? 'All endpoints down - using Claude-only mode'
        : activeEndpoints.length < this.endpoints.length 
        ? 'Some endpoints down - monitoring recovery'
        : 'All systems operational'
    };
  }

  // Force endpoint recovery (useful for manual intervention)
  forceRecoverEndpoint(type: string) {
    const endpoint = this.endpoints.find(e => e.type === type);
    if (endpoint) {
      endpoint.enabled = true;
      endpoint.consecutiveFailures = 0;
      endpoint.lastSuccess = Date.now();
      this.saveEndpointStatus();
      console.log(`🔧 Manually recovered endpoint: ${type}`);
    }
  }
}

// Lazy-loading singleton pattern
let _consciousnessIntelligenceManager: ConsciousnessIntelligenceManager | null = null;

export const getConsciousnessIntelligenceManager = (): ConsciousnessIntelligenceManager => {
  if (!_consciousnessIntelligenceManager) {
    _consciousnessIntelligenceManager = new ConsciousnessIntelligenceManager();
  }
  return _consciousnessIntelligenceManager;
};

// Backward compatibility alias
export const getSesameHybridManager = getConsciousnessIntelligenceManager;

// Export the class directly for new implementations
export { ConsciousnessIntelligenceManager };