/**
 * Unified API Middleware System
 * Standardizes all API routes with consistent patterns for:
 * - Request validation
 * - Authentication
 * - Rate limiting  
 * - Error handling
 * - Response formatting
 * - Monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { ServiceContainer } from '../core/ServiceContainer';
import { ServiceTokens } from '../core/ServiceTokens';

export interface RouteContext {
  userId?: string;
  userAgent?: string;
  ip?: string;
  startTime: number;
  requestId: string;
  container: ServiceContainer;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    requestId: string;
    timestamp: string;
    processingTime: number;
  };
}

export type RouteHandler<TBody = any, TResponse = any> = (
  request: NextRequest,
  context: RouteContext,
  body?: TBody
) => Promise<TResponse>;

export interface MiddlewareOptions {
  requireAuth?: boolean;
  rateLimit?: {
    requests: number;
    window: number; // seconds
  };
  validation?: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
  };
  enableCors?: boolean;
  timeout?: number;
}

/**
 * Main middleware wrapper for API routes
 */
export function withMiddleware<TBody = any, TResponse = any>(
  handler: RouteHandler<TBody, TResponse>,
  options: MiddlewareOptions = {}
) {
  return async (request: NextRequest, routeParams?: any): Promise<NextResponse> => {
    const requestId = generateRequestId();
    const startTime = Date.now();
    
    let context: RouteContext = {
      requestId,
      startTime,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: getClientIP(request),
      container: await getServiceContainer()
    };

    try {
      // CORS handling
      if (options.enableCors && request.method === 'OPTIONS') {
        return handleCorsPreFlight();
      }

      // Rate limiting
      if (options.rateLimit) {
        await enforceRateLimit(request, context, options.rateLimit);
      }

      // Authentication
      if (options.requireAuth) {
        context.userId = await authenticateRequest(request, context);
      }

      // Request validation
      let validatedBody;
      if (options.validation) {
        validatedBody = await validateRequest(request, routeParams, options.validation);
      }

      // Execute handler with timeout
      const timeoutMs = options.timeout || 30000;
      const response = await Promise.race([
        handler(request, context, validatedBody),
        createTimeoutPromise(timeoutMs)
      ]);

      // Format successful response
      const apiResponse = formatSuccessResponse(response, context);
      
      // Log successful request
      await logRequest(request, context, 200, null);
      
      return createJsonResponse(apiResponse, 200, options.enableCors);

    } catch (error) {
      // Handle and format error
      const apiError = formatError(error);
      const apiResponse = formatErrorResponse(apiError, context);
      
      // Log error request
      await logRequest(request, context, apiError.statusCode, apiError);
      
      return createJsonResponse(apiResponse, apiError.statusCode, options.enableCors);
    }
  };
}

/**
 * Authentication middleware
 */
async function authenticateRequest(request: NextRequest, context: RouteContext): Promise<string> {
  const authHeader = request.headers.get('authorization');
  const apiKey = request.headers.get('x-api-key');
  const sessionToken = request.cookies.get('session-token')?.value;

  // Try different auth methods
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return await validateJwtToken(token, context);
  }
  
  if (apiKey) {
    return await validateApiKey(apiKey, context);
  }
  
  if (sessionToken) {
    return await validateSessionToken(sessionToken, context);
  }

  // Check for demo/test user in development
  const userId = request.headers.get('x-user-id');
  if (userId && process.env.NODE_ENV === 'development') {
    return userId;
  }

  throw new AuthenticationError('Authentication required');
}

async function validateJwtToken(token: string, context: RouteContext): Promise<string> {
  // In a real implementation, validate JWT token
  // For now, return a mock user ID
  if (token === 'demo-token') {
    return 'demo-user';
  }
  throw new AuthenticationError('Invalid token');
}

async function validateApiKey(apiKey: string, context: RouteContext): Promise<string> {
  const userService = await context.container.resolve(ServiceTokens.UserService);
  // Implementation would validate API key against database
  throw new AuthenticationError('API key authentication not implemented');
}

async function validateSessionToken(sessionToken: string, context: RouteContext): Promise<string> {
  // Implementation would validate session token
  return 'session-user';
}

/**
 * Rate limiting middleware
 */
async function enforceRateLimit(
  request: NextRequest, 
  context: RouteContext, 
  rateLimit: { requests: number; window: number }
): Promise<void> {
  const identifier = context.userId || context.ip || 'anonymous';
  const key = `rate_limit:${identifier}:${Math.floor(Date.now() / (rateLimit.window * 1000))}`;
  
  try {
    const cacheService = await context.container.resolve(ServiceTokens.CacheService);
    const current = await cacheService.get<number>(key) || 0;
    
    if (current >= rateLimit.requests) {
      throw new RateLimitError(`Rate limit exceeded: ${rateLimit.requests} requests per ${rateLimit.window} seconds`);
    }
    
    await cacheService.set(key, current + 1, rateLimit.window);
    
  } catch (error) {
    if (error instanceof RateLimitError) throw error;
    // If cache is unavailable, allow request to proceed
    console.warn('Rate limiting unavailable:', error);
  }
}

/**
 * Request validation middleware
 */
async function validateRequest(
  request: NextRequest,
  routeParams: any,
  validation: MiddlewareOptions['validation']
): Promise<any> {
  const errors: string[] = [];
  let validatedBody;

  // Validate request body
  if (validation?.body && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      const body = await request.json();
      validatedBody = validation.body.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        errors.push(`Body validation: ${formatZodError(error)}`);
      } else {
        errors.push('Invalid JSON body');
      }
    }
  }

  // Validate query parameters
  if (validation?.query) {
    try {
      const url = new URL(request.url);
      const queryParams = Object.fromEntries(url.searchParams.entries());
      validation.query.parse(queryParams);
    } catch (error) {
      if (error instanceof ZodError) {
        errors.push(`Query validation: ${formatZodError(error)}`);
      }
    }
  }

  // Validate route parameters  
  if (validation?.params && routeParams) {
    try {
      validation.params.parse(routeParams);
    } catch (error) {
      if (error instanceof ZodError) {
        errors.push(`Params validation: ${formatZodError(error)}`);
      }
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '));
  }

  return validatedBody;
}

/**
 * Response formatting
 */
function formatSuccessResponse<T>(data: T, context: RouteContext): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      requestId: context.requestId,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - context.startTime
    }
  };
}

function formatErrorResponse(error: ApiError, context: RouteContext): ApiResponse {
  return {
    success: false,
    error,
    meta: {
      requestId: context.requestId,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - context.startTime
    }
  };
}

function formatError(error: any): ApiError {
  if (error instanceof AuthenticationError) {
    return {
      code: 'AUTHENTICATION_ERROR',
      message: error.message,
      statusCode: 401
    };
  }
  
  if (error instanceof RateLimitError) {
    return {
      code: 'RATE_LIMIT_ERROR',
      message: error.message,
      statusCode: 429
    };
  }
  
  if (error instanceof ValidationError) {
    return {
      code: 'VALIDATION_ERROR',
      message: error.message,
      statusCode: 400
    };
  }
  
  if (error instanceof TimeoutError) {
    return {
      code: 'TIMEOUT_ERROR',
      message: 'Request timed out',
      statusCode: 408
    };
  }

  // Generic server error
  console.error('Unexpected API error:', error);
  return {
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    details: process.env.NODE_ENV === 'production' ? undefined : error.stack,
    statusCode: 500
  };
}

/**
 * Logging middleware
 */
async function logRequest(
  request: NextRequest,
  context: RouteContext,
  statusCode: number,
  error?: ApiError
): Promise<void> {
  const logData = {
    requestId: context.requestId,
    method: request.method,
    url: request.url,
    userAgent: context.userAgent,
    ip: context.ip,
    userId: context.userId,
    statusCode,
    processingTime: Date.now() - context.startTime,
    error: error ? { code: error.code, message: error.message } : undefined,
    timestamp: new Date().toISOString()
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.log(`${logData.method} ${logData.url} - ${logData.statusCode} (${logData.processingTime}ms)`);
    if (error) {
      console.error('API Error:', error);
    }
  }

  // In production, send to analytics service
  if (process.env.NODE_ENV === 'production') {
    try {
      const analyticsService = await context.container.resolve(ServiceTokens.AnalyticsService);
      await analyticsService.trackEvent(context.userId || 'anonymous', {
        type: 'api_request',
        userId: context.userId || 'anonymous',
        data: logData,
        timestamp: new Date()
      });
    } catch (loggingError) {
      console.error('Failed to log request:', loggingError);
    }
  }
}

// Utility functions

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] ||
         request.headers.get('x-real-ip') ||
         'unknown';
}

async function getServiceContainer(): Promise<ServiceContainer> {
  const { container } = await import('../core/ServiceContainer');
  return container;
}

function handleCorsPreFlight(): NextResponse {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-User-ID'
    }
  });
}

function createJsonResponse(data: any, status: number, enableCors?: boolean): NextResponse {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (enableCors) {
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-API-Key, X-User-ID';
  }

  return new NextResponse(JSON.stringify(data), { status, headers });
}

function createTimeoutPromise<T>(timeoutMs: number): Promise<T> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new TimeoutError()), timeoutMs);
  });
}

function formatZodError(error: ZodError): string {
  return error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
}

// Custom error classes

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class TimeoutError extends Error {
  constructor() {
    super('Request timeout');
    this.name = 'TimeoutError';
  }
}

/**
 * Convenience wrapper for GET routes
 */
export function withGetMiddleware<TResponse = any>(
  handler: RouteHandler<never, TResponse>,
  options: Omit<MiddlewareOptions, 'validation'> & { 
    validation?: Pick<MiddlewareOptions['validation'], 'query' | 'params'>
  } = {}
) {
  return withMiddleware(handler, { ...options, enableCors: true });
}

/**
 * Convenience wrapper for POST routes
 */
export function withPostMiddleware<TBody = any, TResponse = any>(
  handler: RouteHandler<TBody, TResponse>,
  options: MiddlewareOptions = {}
) {
  return withMiddleware(handler, { ...options, enableCors: true, requireAuth: true });
}

/**
 * Convenience wrapper for authenticated routes
 */
export function withAuthMiddleware<TBody = any, TResponse = any>(
  handler: RouteHandler<TBody, TResponse>,
  options: MiddlewareOptions = {}
) {
  return withMiddleware(handler, { ...options, requireAuth: true, enableCors: true });
}