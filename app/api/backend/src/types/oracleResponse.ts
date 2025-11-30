// Unified Oracle Response Schema
// Ensures consistent API responses across all oracle endpoints

export interface OracleResponse {
  element: string;
  archetype: string;
  message: string;
  metadata: OracleMetadata;
}

export interface OracleMetadata {
  timestamp: string;
  userId?: string;
  confidence?: number;
  cached?: boolean;
  processingTime?: number;
  tokens?: number;
  model?: string;
  provider?: string;

  // Elemental properties
  phase?: string;
  facet?: string;
  symbols?: string[];

  // Spiritual insights
  reflections?: string[];
  ritual?: string;
  guidance?: string;

  // Session context
  sessionId?: string;
  conversationId?: string;
  memoryContext?: boolean;

  // Quality metrics
  resonance?: "high" | "medium" | "low";
  depth?: "basic" | "detailed" | "comprehensive";

  // System information
  version?: string;
  buildVersion?: string;

  // Error information (if applicable)
  warning?: string;
  debugInfo?: Record<string, any>;
}

export interface OracleErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  metadata: {
    timestamp: string;
    requestId?: string;
    path?: string;
    method?: string;
  };
}

export interface BatchOracleResponse {
  results: OracleResponse[];
  metadata: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    processingTime: number;
    timestamp: string;
  };
  errors?: OracleErrorResponse[];
}

// Standard HTTP status codes for oracle responses
export const OracleResponseCodes = {
  SUCCESS: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// Oracle-specific error codes
export const OracleErrorCodes = {
  INVALID_ELEMENT: "ORACLE_INVALID_ELEMENT",
  AGENT_NOT_AVAILABLE: "ORACLE_AGENT_NOT_AVAILABLE",
  PROCESSING_FAILED: "ORACLE_PROCESSING_FAILED",
  RATE_LIMITED: "ORACLE_RATE_LIMITED",
  INSUFFICIENT_CONTEXT: "ORACLE_INSUFFICIENT_CONTEXT",
  AUTHENTICATION_REQUIRED: "ORACLE_AUTH_REQUIRED",
  PERMISSION_DENIED: "ORACLE_PERMISSION_DENIED",
  VALIDATION_FAILED: "ORACLE_VALIDATION_FAILED",
  CACHE_ERROR: "ORACLE_CACHE_ERROR",
  MEMORY_SERVICE_ERROR: "ORACLE_MEMORY_ERROR",
  AI_SERVICE_ERROR: "ORACLE_AI_SERVICE_ERROR",
} as const;

// Response builder utility class
export class OracleResponseBuilder {
  private response: Partial<OracleResponse> = {};
  private metadata: Partial<OracleMetadata> = {};

  static create(): OracleResponseBuilder {
    return new OracleResponseBuilder();
  }

  element(element: string): OracleResponseBuilder {
    this.response.element = element;
    return this;
  }

  archetype(archetype: string): OracleResponseBuilder {
    this.response.archetype = archetype;
    return this;
  }

  message(message: string): OracleResponseBuilder {
    this.response.message = message;
    return this;
  }

  confidence(confidence: number): OracleResponseBuilder {
    this.metadata.confidence = confidence;
    return this;
  }

  cached(isCached: boolean = true): OracleResponseBuilder {
    this.metadata.cached = isCached;
    return this;
  }

  userId(userId: string): OracleResponseBuilder {
    this.metadata.userId = userId;
    return this;
  }

  symbols(symbols: string[]): OracleResponseBuilder {
    this.metadata.symbols = symbols;
    return this;
  }

  phase(phase: string): OracleResponseBuilder {
    this.metadata.phase = phase;
    return this;
  }

  facet(facet: string): OracleResponseBuilder {
    this.metadata.facet = facet;
    return this;
  }

  resonance(resonance: "high" | "medium" | "low"): OracleResponseBuilder {
    this.metadata.resonance = resonance;
    return this;
  }

  processingTime(time: number): OracleResponseBuilder {
    this.metadata.processingTime = time;
    return this;
  }

  sessionId(sessionId: string): OracleResponseBuilder {
    this.metadata.sessionId = sessionId;
    return this;
  }

  provider(provider: string): OracleResponseBuilder {
    this.metadata.provider = provider;
    return this;
  }

  model(model: string): OracleResponseBuilder {
    this.metadata.model = model;
    return this;
  }

  warning(warning: string): OracleResponseBuilder {
    this.metadata.warning = warning;
    return this;
  }

  build(): OracleResponse {
    // Ensure required fields are present
    if (!this.response.element) {
      throw new Error("Oracle response must have an element");
    }
    if (!this.response.archetype) {
      throw new Error("Oracle response must have an archetype");
    }
    if (!this.response.message) {
      throw new Error("Oracle response must have a message");
    }

    // Set default metadata
    this.metadata.timestamp = new Date().toISOString();
    this.metadata.version = process.env.APP_VERSION || "1.0.0";

    return {
      element: this.response.element,
      archetype: this.response.archetype,
      message: this.response.message,
      metadata: this.metadata as OracleMetadata,
    };
  }
}

// Error response builder
export class OracleErrorResponseBuilder {
  private error: Partial<OracleErrorResponse["error"]> = {};
  private metadata: Partial<OracleErrorResponse["metadata"]> = {};

  static create(): OracleErrorResponseBuilder {
    return new OracleErrorResponseBuilder();
  }

  code(code: string): OracleErrorResponseBuilder {
    this.error.code = code;
    return this;
  }

  message(message: string): OracleErrorResponseBuilder {
    this.error.message = message;
    return this;
  }

  details(details: Record<string, any>): OracleErrorResponseBuilder {
    this.error.details = details;
    return this;
  }

  requestId(requestId: string): OracleErrorResponseBuilder {
    this.metadata.requestId = requestId;
    return this;
  }

  path(path: string): OracleErrorResponseBuilder {
    this.metadata.path = path;
    return this;
  }

  method(method: string): OracleErrorResponseBuilder {
    this.metadata.method = method;
    return this;
  }

  build(): OracleErrorResponse {
    if (!this.error.code) {
      throw new Error("Error response must have a code");
    }
    if (!this.error.message) {
      throw new Error("Error response must have a message");
    }

    this.metadata.timestamp = new Date().toISOString();

    return {
      error: this.error as OracleErrorResponse["error"],
      metadata: this.metadata as OracleErrorResponse["metadata"],
    };
  }
}
