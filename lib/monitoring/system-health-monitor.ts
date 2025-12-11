/**
 * MAIA SYSTEM HEALTH MONITOR
 *
 * Real-time monitoring of all redundancy systems to ensure
 * MAIA stays available during updates and outages.
 */

export interface SystemHealth {
  timestamp: string;
  endpoints: EndpointHealth[];
  serviceWorker: ServiceWorkerHealth;
  webSocket: WebSocketHealth;
  storage: StorageHealth;
  overall: 'healthy' | 'degraded' | 'critical';
}

interface EndpointHealth {
  url: string;
  status: 'online' | 'offline' | 'slow';
  responseTime: number;
  lastChecked: string;
  consecutiveFailures: number;
}

interface ServiceWorkerHealth {
  active: boolean;
  cacheSize: number;
  offlineResponsesReady: boolean;
  lastUpdate: string;
}

interface WebSocketHealth {
  connected: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  reconnectAttempts: number;
  lastHeartbeat: string;
}

interface StorageHealth {
  localStorage: boolean;
  encryptedBackup: boolean;
  cloudSync: boolean;
  dataIntegrity: number; // 0-1 score
}

export class SystemHealthMonitor {
  private healthHistory: SystemHealth[] = [];
  private monitoring = false;
  private checkInterval = 30000; // 30 seconds

  async startMonitoring(): Promise<void> {
    this.monitoring = true;
    console.log('🔍 MAIA System Health Monitor activated');

    while (this.monitoring) {
      try {
        const health = await this.checkSystemHealth();
        this.healthHistory.push(health);

        // Keep only last 100 checks (50 minutes of history)
        if (this.healthHistory.length > 100) {
          this.healthHistory = this.healthHistory.slice(-100);
        }

        // Alert on critical issues
        if (health.overall === 'critical') {
          await this.triggerEmergencyProtocols(health);
        }

        // Broadcast health status
        this.broadcastHealth(health);

      } catch (error) {
        console.error('Health check failed:', error);
      }

      await this.sleep(this.checkInterval);
    }
  }

  async checkSystemHealth(): Promise<SystemHealth> {
    const timestamp = new Date().toISOString();

    // Check all API endpoints
    const endpoints = await this.checkEndpoints();

    // Check service worker
    const serviceWorker = await this.checkServiceWorker();

    // Check WebSocket
    const webSocket = await this.checkWebSocket();

    // Check storage systems
    const storage = await this.checkStorage();

    // Calculate overall health
    const overall = this.calculateOverallHealth(endpoints, serviceWorker, webSocket, storage);

    return {
      timestamp,
      endpoints,
      serviceWorker,
      webSocket,
      storage,
      overall
    };
  }

  private async checkEndpoints(): Promise<EndpointHealth[]> {
    // Check the CURRENT application's health endpoint, not external URLs
    const endpoints = ['/api/health/'];

    const results: EndpointHealth[] = [];

    for (const url of endpoints) {
      const startTime = Date.now();
      let status: 'online' | 'offline' | 'slow' = 'offline';
      let consecutiveFailures = 0;

      try {
        const response = await fetch(url, {
          method: 'GET',
          timeout: 5000
        });

        const responseTime = Date.now() - startTime;

        if (response.ok) {
          status = responseTime > 2000 ? 'slow' : 'online';
        } else {
          consecutiveFailures++;
        }

        results.push({
          url,
          status,
          responseTime,
          lastChecked: new Date().toISOString(),
          consecutiveFailures
        });

      } catch (error) {
        consecutiveFailures++;
        results.push({
          url,
          status: 'offline',
          responseTime: Date.now() - startTime,
          lastChecked: new Date().toISOString(),
          consecutiveFailures
        });
      }
    }

    return results;
  }

  private async checkServiceWorker(): Promise<ServiceWorkerHealth> {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const caches = await window.caches.keys();
      const cache = await window.caches.open('maya-oracle-v4');
      const cachedRequests = await cache.keys();

      return {
        active: !!registration?.active,
        cacheSize: cachedRequests.length,
        offlineResponsesReady: cachedRequests.some(req =>
          req.url.includes('/api/consciousness') ||
          req.url.includes('/api/maia')
        ),
        lastUpdate: registration?.updateTime || 'unknown'
      };
    } catch (error) {
      return {
        active: false,
        cacheSize: 0,
        offlineResponsesReady: false,
        lastUpdate: 'error'
      };
    }
  }

  private async checkWebSocket(): Promise<WebSocketHealth> {
    // This would integrate with your existing WebSocketService
    // For now, return mock data - integrate with actual WebSocket service
    return {
      connected: true, // Get from WebSocketService
      connectionQuality: 'good',
      reconnectAttempts: 0,
      lastHeartbeat: new Date().toISOString()
    };
  }

  private async checkStorage(): Promise<StorageHealth> {
    let localStorage = false;
    let encryptedBackup = false;
    let cloudSync = false;
    let dataIntegrity = 0;

    try {
      // Test localStorage
      localStorage = !!window.localStorage;

      // Test encrypted backup (integrate with your backup system)
      // encryptedBackup = await EncryptedBackup.testConnectivity();
      encryptedBackup = true; // Placeholder

      // Test cloud sync (integrate with cloud-backup.ts)
      // cloudSync = await CloudBackupService.testConnectivity();
      cloudSync = true; // Placeholder

      // Calculate data integrity score
      dataIntegrity = 0.95; // Placeholder - implement checksum validation

    } catch (error) {
      console.error('Storage health check failed:', error);
    }

    return {
      localStorage,
      encryptedBackup,
      cloudSync,
      dataIntegrity
    };
  }

  private calculateOverallHealth(
    endpoints: EndpointHealth[],
    serviceWorker: ServiceWorkerHealth,
    webSocket: WebSocketHealth,
    storage: StorageHealth
  ): 'healthy' | 'degraded' | 'critical' {

    // Count healthy endpoints
    const healthyEndpoints = endpoints.filter(e => e.status === 'online').length;
    const totalEndpoints = endpoints.length;

    // Critical: No endpoints online AND service worker down
    if (healthyEndpoints === 0 && !serviceWorker.active) {
      return 'critical';
    }

    // Degraded: Less than 50% endpoints OR no offline capability
    if (healthyEndpoints < totalEndpoints * 0.5 || !serviceWorker.offlineResponsesReady) {
      return 'degraded';
    }

    return 'healthy';
  }

  private async triggerEmergencyProtocols(health: SystemHealth): Promise<void> {
    console.error('🚨 CRITICAL: MAIA system health is compromised!', health);

    // Emergency protocols:
    // 1. Activate P2P mode
    // 2. Enable maximum caching
    // 3. Switch to offline-first mode
    // 4. Notify user gracefully

    // Broadcast emergency status
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'EMERGENCY_MODE_ACTIVATE',
        health
      });
    }
  }

  private broadcastHealth(health: SystemHealth): void {
    // Broadcast to all windows/tabs
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('maia-health');
      channel.postMessage({
        type: 'HEALTH_UPDATE',
        health
      });
    }

    // Also store in localStorage for persistence
    localStorage.setItem('maia-last-health', JSON.stringify(health));
  }

  stopMonitoring(): void {
    this.monitoring = false;
    console.log('🔍 MAIA System Health Monitor deactivated');
  }

  getHealthHistory(): SystemHealth[] {
    return this.healthHistory;
  }

  getCurrentHealth(): SystemHealth | null {
    return this.healthHistory[this.healthHistory.length - 1] || null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const systemHealthMonitor = new SystemHealthMonitor();

// Auto-start in production - TEMPORARILY DISABLED
// TODO: Re-enable after fixing endpoint configuration
// if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
//   systemHealthMonitor.startMonitoring();
// }