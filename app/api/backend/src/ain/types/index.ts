/**
 * AIN Type Definitions
 * Shared types for the Adaptive Intelligence Network
 */

// Elemental Service Identifiers
export enum ElementalService {
  Fire = "fire",
  Water = "water",
  Earth = "earth",
  Air = "air",
  Aether = "aether",
}

// Event Types
export enum EventType {
  Message = "message",
  Catalyst = "catalyst",
  Emotion = "emotion",
  Structure = "structure",
  Clarity = "clarity",
  Integration = "integration",
  Quantum = "quantum",
  Broadcast = "broadcast",
  Response = "response",
  EmergenceInstruction = "emergence_instruction",
}

// Core Event Interface
export interface SpiralogicEvent {
  id: string;
  timestamp: number;
  source: ElementalService;
  type: EventType | string;
  payload: EventPayload;
  routing: EventRouting;
  mode?: string;
  reduce_non_critical?: boolean;
  cache_aggressive?: boolean;
  reduce_latency?: boolean;
  focus_coherence?: boolean;
  prioritize_safety?: boolean;
  increase_thresholds?: boolean;
  reduce_complexity?: boolean;
  defer_complex_operations?: boolean;
}

export interface EventPayload {
  content: any;
  metadata: EventMetadata;
  elemental_signature: ElementalSignature;
}

export interface EventMetadata {
  processed_at?: "edge" | "cloud" | "hybrid";
  latency?: number;
  intensity?: number;
  [key: string]: any;
}

export interface EventRouting {
  target?: ElementalService;
  broadcast?: boolean;
  priority: "critical" | "high" | "medium" | "low";
  load_balanced?: boolean;
  orchestrated?: boolean;
}

// Elemental Signature
export interface ElementalSignature {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
}

// Agent Types
export type AgentType = "edge" | "hybrid" | "cloud";

// Processing Modes
export interface ProcessingMode {
  local_threshold: number;
  cloud_escalation: boolean;
  neuromorphic_compatible: boolean;
  quantum_ready: boolean;
}

// Neuromorphic Spike
export interface NeuromorphicSpike {
  timestamp: number;
  intensity: number;
  source: string;
  refractory_until: number;
}

// Quantum State
export interface QuantumState {
  amplitudes: Complex[];
  entangled_qubits: number[];
  measurement_basis: string;
  decoherence_time: number;
}

export interface Complex {
  real: number;
  imaginary: number;
}

// Communication Protocols
export interface MessageProtocol {
  format: "json" | "protobuf" | "msgpack";
  encryption: boolean;
  compression: boolean;
  priority_queue: boolean;
}

// Edge-Cloud Split Configuration
export interface EdgeCloudConfig {
  edge_services: ElementalService[];
  cloud_services: ElementalService[];
  hybrid_services: ElementalService[];
  sync_interval: number;
  offline_mode: boolean;
}

// Pub/Sub Topic Configuration
export interface TopicConfig {
  name: string;
  retention_policy: "none" | "short" | "long";
  max_subscribers: number;
  delivery_guarantee: "at_most_once" | "at_least_once" | "exactly_once";
}

// Service Discovery
export interface ServiceRegistration {
  service_id: string;
  service_type: AgentType;
  elemental_service: ElementalService;
  endpoints: ServiceEndpoint[];
  health_check: string;
  capabilities: ServiceCapability[];
}

export interface ServiceEndpoint {
  protocol: "http" | "grpc" | "websocket" | "pubsub";
  address: string;
  port: number;
  path?: string;
}

export interface ServiceCapability {
  name: string;
  version: string;
  edge_compatible: boolean;
  quantum_enhanced: boolean;
}

// Memory and State
export interface DistributedState {
  local_cache: Map<string, any>;
  cloud_sync: boolean;
  consistency_level: "eventual" | "strong" | "weak";
  conflict_resolution: "last_write_wins" | "vector_clock" | "merge";
}

// Monitoring and Observability
export interface Metrics {
  events_processed: number;
  latency_p95: number;
  error_rate: number;
  coherence_score: number;
  quantum_operations: number;
}

export interface Trace {
  trace_id: string;
  span_id: string;
  parent_span?: string;
  service: ElementalService;
  operation: string;
  start_time: number;
  duration: number;
  tags: { [key: string]: string };
}

// Security and Privacy
export interface SecurityContext {
  user_id?: string;
  session_id?: string;
  permissions: string[];
  encryption_key?: string;
  privacy_level: "public" | "private" | "sacred";
}

// Scaling and Load Balancing
export interface LoadBalancing {
  strategy:
    | "round_robin"
    | "least_connections"
    | "weighted"
    | "elemental_affinity";
  health_check_interval: number;
  failover_enabled: boolean;
  auto_scaling: AutoScalingConfig;
}

export interface AutoScalingConfig {
  enabled: boolean;
  min_instances: number;
  max_instances: number;
  scale_up_threshold: number;
  scale_down_threshold: number;
  cool_down_period: number;
}

// Integration with Legacy Systems
export interface LegacyIntegration {
  monolith_endpoints: string[];
  migration_strategy: "strangler_fig" | "big_bang" | "parallel_run";
  data_sync: boolean;
  compatibility_layer: boolean;
}

// Deployment Configuration
export interface DeploymentConfig {
  environment: "development" | "staging" | "production";
  edge_deployment: EdgeDeploymentConfig;
  cloud_deployment: CloudDeploymentConfig;
  monitoring: MonitoringConfig;
}

export interface EdgeDeploymentConfig {
  target_platforms: ("browser" | "mobile" | "iot" | "desktop")[];
  wasm_enabled: boolean;
  local_storage_limit: number;
  sync_strategy: "periodic" | "event_driven" | "manual";
}

export interface CloudDeploymentConfig {
  provider: "aws" | "gcp" | "azure" | "kubernetes";
  regions: string[];
  service_mesh: boolean;
  auto_scaling: boolean;
}

export interface MonitoringConfig {
  metrics_enabled: boolean;
  tracing_enabled: boolean;
  logging_level: "debug" | "info" | "warn" | "error";
  telemetry_endpoint?: string;
}

// Future Enhancement Types
export interface NeuromorphicConfig {
  chip_type: "loihi" | "truenorth" | "simulation";
  spike_rate_coding: boolean;
  temporal_dynamics: boolean;
  synaptic_plasticity: boolean;
}

export interface QuantumConfig {
  backend: "simulator" | "ibm_quantum" | "google_quantum" | "rigetti";
  max_qubits: number;
  error_correction: boolean;
  hybrid_algorithms: string[];
}

// Collective Intelligence Types
export interface CollectivePattern {
  pattern_id: string;
  participants: number;
  coherence: number;
  emergence_time: number;
  pattern_type: "wisdom" | "behavior" | "insight" | "synchronicity";
}

export interface WisdomNetwork {
  nodes: WisdomNode[];
  connections: WisdomConnection[];
  collective_coherence: number;
  morphic_resonance: number;
}

export interface WisdomNode {
  id: string;
  wisdom_type: string;
  source: ElementalService;
  confidence: number;
  timestamp: number;
}

export interface WisdomConnection {
  from: string;
  to: string;
  strength: number;
  type: "resonance" | "causation" | "synchronicity";
}

// Sacred Geometry Integration
export interface SacredGeometry {
  pattern: "flower_of_life" | "merkaba" | "torus" | "golden_spiral";
  coordinates: number[][];
  harmonic_ratios: number[];
  activation_frequency: number;
}

export interface GeometricTransformation {
  from_pattern: SacredGeometry;
  to_pattern: SacredGeometry;
  transformation_matrix: number[][];
  energy_signature: ElementalSignature;
}

// Error Types
export class AINError extends Error {
  constructor(
    message: string,
    public code: string,
    public service: ElementalService,
    public recoverable: boolean = true,
  ) {
    super(message);
    this.name = "AINError";
  }
}

export class EdgeProcessingError extends AINError {
  constructor(message: string, service: ElementalService) {
    super(message, "EDGE_PROCESSING_ERROR", service, true);
  }
}

export class CloudOrchestratorError extends AINError {
  constructor(message: string, service: ElementalService) {
    super(message, "CLOUD_ORCHESTRATOR_ERROR", service, false);
  }
}

export class QuantumCoherenceError extends AINError {
  constructor(message: string) {
    super(message, "QUANTUM_COHERENCE_ERROR", ElementalService.Aether, true);
  }
}

// Utility Types
export type EventHandler<T = any> = (event: SpiralogicEvent) => Promise<void>;
export type ServiceFactory<T> = () => T;
export type ElementalBalance = ElementalSignature;

// Configuration Presets
export const DEFAULT_EDGE_CONFIG: EdgeCloudConfig = {
  edge_services: [ElementalService.Fire, ElementalService.Air],
  cloud_services: [ElementalService.Earth, ElementalService.Aether],
  hybrid_services: [ElementalService.Water],
  sync_interval: 5000,
  offline_mode: true,
};

export const DEFAULT_NEUROMORPHIC_CONFIG: NeuromorphicConfig = {
  chip_type: "simulation",
  spike_rate_coding: true,
  temporal_dynamics: true,
  synaptic_plasticity: false,
};

export const DEFAULT_QUANTUM_CONFIG: QuantumConfig = {
  backend: "simulator",
  max_qubits: 10,
  error_correction: false,
  hybrid_algorithms: ["QAOA", "VQE"],
};
