/**
 * AIN Orchestrator
 * Main coordinator for the Adaptive Intelligence Network
 */

import { EventEmitter } from "events";
import {
  SpiralogicEvent,
  ElementalService,
  EdgeCloudConfig,
  DEFAULT_EDGE_CONFIG,
} from "./types";
import { PubSubManager } from "./pubsub/PubSubManager";
import { fireService } from "./services/fire-service";
import { waterService } from "./services/water-service";
import { earthService } from "./services/earth-service";
import { airService } from "./services/air-service";
import { aetherService } from "./services/aether-service";

export class AINOrchestrator extends EventEmitter {
  private static instance: AINOrchestrator;
  private pubsub: PubSubManager;
  private config: EdgeCloudConfig;
  private services: Map<ElementalService, any> = new Map();
  private orchestrationState: OrchestrationState;

  private constructor(config: EdgeCloudConfig = DEFAULT_EDGE_CONFIG) {
    super();
    this.config = config;
    this.pubsub = PubSubManager.getInstance();
    this.orchestrationState = {
      status: "initializing",
      services_online: new Set(),
      current_load: new Map(),
      last_health_check: 0,
      emergency_mode: false,
    };

    this.initializeAIN();
  }

  static getInstance(config?: EdgeCloudConfig): AINOrchestrator {
    if (!AINOrchestrator.instance) {
      AINOrchestrator.instance = new AINOrchestrator(config);
    }
    return AINOrchestrator.instance;
  }

  /**
   * Initialize the Adaptive Intelligence Network
   */
  private async initializeAIN(): Promise<void> {
    console.log("🌌 Initializing Adaptive Intelligence Network...");

    try {
      // Initialize services based on configuration
      await this.initializeServices();

      // Setup orchestration monitoring
      this.setupOrchestrationMonitoring();

      // Setup emergency protocols
      this.setupEmergencyProtocols();

      // Setup inter-service communication
      this.setupInterServiceCommunication();

      // Setup health monitoring
      this.setupHealthMonitoring();

      this.orchestrationState.status = "online";

      console.log(
        "✨ AIN Orchestrator online - All elemental services initialized",
      );
      this.emit("ain.online", { timestamp: Date.now() });
    } catch (error) {
      console.error("❌ Failed to initialize AIN:", error);
      this.orchestrationState.status = "failed";
      this.emit("ain.failed", { error });
      throw error;
    }
  }

  /**
   * Initialize elemental services based on configuration
   */
  private async initializeServices(): Promise<void> {
    const serviceMap = {
      [ElementalService.Fire]: fireService,
      [ElementalService.Water]: waterService,
      [ElementalService.Earth]: earthService,
      [ElementalService.Air]: airService,
      [ElementalService.Aether]: aetherService,
    };

    // Initialize edge services first
    for (const element of this.config.edge_services) {
      const service = serviceMap[element];
      if (service) {
        await this.initializeService(element, service, "edge");
      }
    }

    // Initialize hybrid services
    for (const element of this.config.hybrid_services) {
      const service = serviceMap[element];
      if (service) {
        await this.initializeService(element, service, "hybrid");
      }
    }

    // Initialize cloud services
    for (const element of this.config.cloud_services) {
      const service = serviceMap[element];
      if (service) {
        await this.initializeService(element, service, "cloud");
      }
    }
  }

  /**
   * Initialize individual service
   */
  private async initializeService(
    element: ElementalService,
    service: any,
    type: "edge" | "hybrid" | "cloud",
  ): Promise<void> {
    try {
      console.log(`🔥🌊🌍🌬️✨ Initializing ${element} service (${type})`);

      // Store service reference
      this.services.set(element, service);

      // Mark as online
      this.orchestrationState.services_online.add(element);
      this.orchestrationState.current_load.set(element, 0);

      // Setup service-specific monitoring
      this.monitorService(element, service);

      console.log(`✅ ${element} service online`);
    } catch (error) {
      console.error(`❌ Failed to initialize ${element} service:`, error);
      throw error;
    }
  }

  /**
   * Setup orchestration monitoring
   */
  private setupOrchestrationMonitoring(): void {
    // Monitor universal field coherence
    this.pubsub.subscribe("coherence.state", async (event) => {
      await this.handleCoherenceUpdate(event);
    });

    // Monitor emergence patterns
    this.pubsub.subscribe("emergence.detected", async (event) => {
      await this.handleEmergence(event);
    });

    // Monitor service health
    setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Every 30 seconds
  }

  /**
   * Setup emergency protocols
   */
  private setupEmergencyProtocols(): void {
    // Listen for emergency signals
    this.pubsub.subscribe("emergency.broadcast", async (event) => {
      await this.handleEmergency(event);
    });

    // Service failure detection
    this.on("service.failure", async (data) => {
      await this.handleServiceFailure(data);
    });

    // System overload protection
    this.on("system.overload", async (data) => {
      await this.handleSystemOverload(data);
    });
  }

  /**
   * Setup inter-service communication monitoring
   */
  private setupInterServiceCommunication(): void {
    // Monitor message flow between services
    this.pubsub.on("message.published", (result) => {
      this.updateLoadMetrics(result.topic, result.subscribers_notified);
    });

    // Setup intelligent routing
    this.pubsub.subscribe("routing.request", async (event) => {
      const optimalRoute = await this.calculateOptimalRoute(event);
      await this.pubsub.publish("routing.response", optimalRoute);
    });
  }

  /**
   * Setup health monitoring for all services
   */
  private setupHealthMonitoring(): void {
    setInterval(() => {
      this.performHealthCheck();
    }, this.config.sync_interval);
  }

  /**
   * Monitor individual service health and performance
   */
  private monitorService(element: ElementalService, service: any): void {
    // Monitor service events
    if (service.on) {
      service.on("error", (error: any) => {
        this.emit("service.failure", { element, error, timestamp: Date.now() });
      });

      service.on("overload", (data: any) => {
        this.emit("service.overload", { element, data, timestamp: Date.now() });
      });
    }
  }

  /**
   * Perform comprehensive health check
   */
  private async performHealthCheck(): Promise<void> {
    const healthResults: HealthCheckResult[] = [];

    for (const [element, service] of this.services.entries()) {
      try {
        const health = await this.checkServiceHealth(element, service);
        healthResults.push(health);

        // Update orchestration state
        if (health.status === "healthy") {
          this.orchestrationState.services_online.add(element);
        } else {
          this.orchestrationState.services_online.delete(element);
        }
      } catch (error) {
        healthResults.push({
          service: element,
          status: "unhealthy",
          details: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
          timestamp: Date.now(),
        });
      }
    }

    this.orchestrationState.last_health_check = Date.now();

    // Emit health status
    this.emit("health.check.complete", {
      results: healthResults,
      overall_health: this.calculateOverallHealth(healthResults),
    });
  }

  /**
   * Check individual service health
   */
  private async checkServiceHealth(
    element: ElementalService,
    service: any,
  ): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Basic connectivity check
      const isResponsive = await this.pingService(service);

      // Resource usage check
      const metrics = service.getMetrics ? await service.getMetrics() : {};

      const responseTime = Date.now() - startTime;

      return {
        service: element,
        status: isResponsive ? "healthy" : "unhealthy",
        details: {
          response_time: responseTime,
          metrics,
          last_check: Date.now(),
        },
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        service: element,
        status: "unhealthy",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Ping service for basic health check
   */
  private async pingService(service: any): Promise<boolean> {
    try {
      if (service.ping) {
        return await service.ping();
      }

      // If no ping method, assume healthy if service exists
      return service !== null && service !== undefined;
    } catch (error) {
      return false;
    }
  }

  /**
   * Calculate overall system health
   */
  private calculateOverallHealth(results: HealthCheckResult[]): SystemHealth {
    const totalServices = results.length;
    const healthyServices = results.filter(
      (r) => r.status === "healthy",
    ).length;
    const healthRatio = healthyServices / totalServices;

    let status: "healthy" | "degraded" | "unhealthy";

    if (healthRatio === 1.0) {
      status = "healthy";
    } else if (healthRatio >= 0.6) {
      status = "degraded";
    } else {
      status = "unhealthy";
    }

    return {
      status,
      healthy_services: healthyServices,
      total_services: totalServices,
      health_ratio: healthRatio,
    };
  }

  /**
   * Handle coherence updates from Aether service
   */
  private async handleCoherenceUpdate(event: SpiralogicEvent): Promise<void> {
    const coherence = event.payload.content;

    // Adjust orchestration based on coherence level
    if (coherence.overall_coherence > 0.9) {
      // High coherence - optimize for performance
      await this.optimizeForPerformance();
    } else if (coherence.overall_coherence < 0.3) {
      // Low coherence - stabilize system
      await this.stabilizeSystem();
    }
  }

  /**
   * Handle emergence patterns
   */
  private async handleEmergence(event: SpiralogicEvent): Promise<void> {
    const emergence = event.payload.content;

    console.log(`🌟 Emergence detected: ${emergence.pattern.type}`);

    // Coordinate elemental response to emergence
    await this.coordinateEmergenceResponse(emergence);
  }

  /**
   * Handle emergency situations
   */
  private async handleEmergency(event: SpiralogicEvent): Promise<void> {
    console.log("🚨 Emergency protocol activated");

    this.orchestrationState.emergency_mode = true;

    // Prioritize critical services
    await this.activateEmergencyMode();

    // Notify all services
    await this.pubsub.emergencyBroadcast(event);
  }

  /**
   * Handle service failures
   */
  private async handleServiceFailure(data: any): Promise<void> {
    const { element, error } = data;

    console.error(`⚠️ Service failure detected: ${element}`);

    // Remove from online services
    this.orchestrationState.services_online.delete(element);

    // Attempt recovery
    await this.attemptServiceRecovery(element);
  }

  /**
   * Handle system overload
   */
  private async handleSystemOverload(data: any): Promise<void> {
    console.warn("⚡ System overload detected");

    // Implement load shedding
    await this.implementLoadShedding();

    // Scale services if possible
    await this.scaleServices();
  }

  /**
   * Calculate optimal route for message
   */
  private async calculateOptimalRoute(
    event: SpiralogicEvent,
  ): Promise<SpiralogicEvent> {
    const availableServices = Array.from(
      this.orchestrationState.services_online,
    );
    const loads = this.orchestrationState.current_load;

    // Find least loaded service that can handle the request
    let optimalTarget = availableServices[0];
    let minLoad = loads.get(optimalTarget) || 0;

    for (const service of availableServices) {
      const load = loads.get(service) || 0;
      if (load < minLoad) {
        minLoad = load;
        optimalTarget = service;
      }
    }

    return {
      ...event,
      routing: {
        ...event.routing,
        target: optimalTarget,
        load_balanced: true,
        orchestrated: true,
      },
    };
  }

  /**
   * Update load metrics based on message activity
   */
  private updateLoadMetrics(topic: string, subscriberCount: number): void {
    // Extract service from topic name
    const serviceName = topic.split(".")[0] as ElementalService;

    if (this.orchestrationState.current_load.has(serviceName)) {
      const currentLoad =
        this.orchestrationState.current_load.get(serviceName)! +
        subscriberCount;
      this.orchestrationState.current_load.set(serviceName, currentLoad);
    }
  }

  /**
   * Optimize system for high performance
   */
  private async optimizeForPerformance(): Promise<void> {
    // Reduce sync interval for faster response
    this.config.sync_interval = Math.max(this.config.sync_interval * 0.8, 1000);

    // Enable aggressive caching
    await this.pubsub.publish(
      "system.optimization",
      this.createSystemEvent("system.optimization", {
        mode: "performance",
        cache_aggressive: true,
        reduce_latency: true,
      }),
    );
  }

  /**
   * Stabilize system during low coherence
   */
  private async stabilizeSystem(): Promise<void> {
    // Increase sync interval for stability
    this.config.sync_interval = Math.min(
      this.config.sync_interval * 1.2,
      30000,
    );

    // Focus on coherence building
    await this.pubsub.publish(
      "system.stabilization",
      this.createSystemEvent("system.stabilization", {
        mode: "stability",
        focus_coherence: true,
        reduce_complexity: true,
      }),
    );
  }

  /**
   * Coordinate response to emergence
   */
  private async coordinateEmergenceResponse(emergence: any): Promise<void> {
    const instructions = emergence.instructions || {};

    // Send specific instructions to each service
    for (const [element, instruction] of Object.entries(instructions)) {
      await this.pubsub.publish(`${element}.channel`, {
        id: this.generateEventId(),
        timestamp: Date.now(),
        source: ElementalService.Aether,
        type: "emergence_instruction",
        payload: {
          content: { instruction, emergence },
          metadata: { orchestrated: true },
          elemental_signature: {
            aether: 1.0,
            fire: 0,
            water: 0,
            earth: 0,
            air: 0,
          },
        },
        routing: { priority: "critical" },
      });
    }
  }

  /**
   * Activate emergency mode
   */
  private async activateEmergencyMode(): Promise<void> {
    // Reduce non-critical processing
    await this.pubsub.publish(
      "system.emergency",
      this.createSystemEvent("system.emergency", {
        mode: "emergency",
        reduce_non_critical: true,
        prioritize_safety: true,
      }),
    );
  }

  /**
   * Attempt to recover failed service
   */
  private async attemptServiceRecovery(
    element: ElementalService,
  ): Promise<void> {
    const service = this.services.get(element);

    if (service && service.restart) {
      try {
        await service.restart();
        this.orchestrationState.services_online.add(element);
        console.log(`✅ Service ${element} recovered`);
      } catch (error) {
        console.error(`❌ Failed to recover service ${element}:`, error);
      }
    }
  }

  /**
   * Implement load shedding
   */
  private async implementLoadShedding(): Promise<void> {
    // Temporarily reduce processing of non-critical events
    await this.pubsub.publish(
      "system.load_shedding",
      this.createSystemEvent("system.load_shedding", {
        reduce_non_critical: true,
        increase_thresholds: true,
        defer_complex_operations: true,
      }),
    );
  }

  /**
   * Scale services if possible
   */
  private async scaleServices(): Promise<void> {
    // In a production environment, this would trigger container scaling
    console.log("🔄 Scaling services (placeholder for production scaling)");
  }

  /**
   * Get orchestration status
   */
  getStatus(): OrchestrationStatus {
    return {
      status: this.orchestrationState.status,
      services_online: Array.from(this.orchestrationState.services_online),
      total_services: this.services.size,
      emergency_mode: this.orchestrationState.emergency_mode,
      last_health_check: this.orchestrationState.last_health_check,
      load_distribution: Object.fromEntries(
        this.orchestrationState.current_load,
      ),
    };
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `ain-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create properly formatted SpiralogicEvent
   */
  private createSystemEvent(type: string, content: any): SpiralogicEvent {
    return {
      id: this.generateEventId(),
      timestamp: Date.now(),
      source: ElementalService.Aether,
      type: type,
      payload: {
        content,
        metadata: { orchestrated: true },
        elemental_signature: {
          aether: 1.0,
          fire: 0,
          water: 0,
          earth: 0,
          air: 0,
        },
      },
      routing: { priority: "high" },
    };
  }

  /**
   * Shutdown orchestrator gracefully
   */
  async shutdown(): Promise<void> {
    console.log("🌌 Shutting down AIN Orchestrator...");

    this.orchestrationState.status = "shutting_down";

    // Shutdown all services
    for (const [element, service] of this.services.entries()) {
      try {
        if (service.shutdown) {
          await service.shutdown();
        }
        console.log(`✅ ${element} service shutdown complete`);
      } catch (error) {
        console.error(`❌ Error shutting down ${element}:`, error);
      }
    }

    // Cleanup pub/sub
    this.pubsub.cleanup();

    this.orchestrationState.status = "offline";
    this.emit("ain.shutdown", { timestamp: Date.now() });

    console.log("✨ AIN Orchestrator shutdown complete");
  }
}

// Type definitions
interface OrchestrationState {
  status:
    | "initializing"
    | "online"
    | "degraded"
    | "failed"
    | "shutting_down"
    | "offline";
  services_online: Set<ElementalService>;
  current_load: Map<ElementalService, number>;
  last_health_check: number;
  emergency_mode: boolean;
}

interface HealthCheckResult {
  service: ElementalService;
  status: "healthy" | "unhealthy";
  details: any;
  timestamp: number;
}

interface SystemHealth {
  status: "healthy" | "degraded" | "unhealthy";
  healthy_services: number;
  total_services: number;
  health_ratio: number;
}

interface OrchestrationStatus {
  status: string;
  services_online: ElementalService[];
  total_services: number;
  emergency_mode: boolean;
  last_health_check: number;
  load_distribution: { [key: string]: number };
}

export default AINOrchestrator;
