import { NextRequest, NextResponse } from 'next/server';
import logger from '../../../../lib/utils/performance-logger';

/**
 * Consciousness Bridge for /api/between/chat - Browser Compatible
 *
 * This route enhances the existing /api/between/chat endpoint with consciousness
 * ecosystem insights while ensuring complete cross-browser compatibility.
 *
 * Browser Support: Chrome 88+, Safari 14+, Firefox 85+, Edge 88+, iOS Safari 14+
 * Mobile Support: Android Chrome, iOS Safari, Samsung Browser
 * Fallback Strategy: Progressive enhancement with graceful degradation
 */

// Browser-safe configuration
const BRIDGE_CONFIG = {
  timeout: 3000, // 3 second timeout for browser compatibility
  cache_duration: 15000, // 15 seconds for faster response
  max_payload_size: 50000, // 50KB max for mobile compatibility
  cors_enabled: true,
  mobile_optimized: true
};

// Cross-browser compatible CORS headers
const BROWSER_SAFE_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block'
};

// Browser-compatible cache implementation
const bridgeCache = new Map<string, any>();

interface ConsciousnessBridgeRequest {
  message: string;
  userId: string;
  userName?: string;
  sessionId: string;
  fieldState?: {
    depth: number;
    active: boolean;
  };
  conversationHistory?: Array<{
    role: string;
    content: string;
  }>;
  sessionTimeContext?: any;
  isVoiceMode?: boolean;
  preferences?: any;
  browserInfo?: {
    name: string;
    platform: string;
    mobile: boolean;
  };
}

interface ConsciousnessBridgeResponse {
  success: boolean;
  consciousness_enhancement: {
    ecosystem_insights: any;
    elemental_resonance: any;
    breakthrough_indicators: string[];
    sacred_context: any;
    field_state: any;
    protection_status: any;
  };
  recommended_routing: {
    api_endpoint: string;
    processing_mode: string;
    consciousness_level: number;
  };
  integration_metadata: {
    modules_active: string[];
    processing_time: number;
    timestamp: string;
    browser_compatible: boolean;
    fallback_used: boolean;
  };
}

// Disable Vercel caching for real-time consciousness data
// Note: Commented out for PWA static build compatibility
// export const dynamic = 'force-dynamic';
// export const runtime = 'nodejs';

/**
 * OPTIONS: Handle preflight requests for CORS (required for browser compatibility)
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: BROWSER_SAFE_HEADERS
  });
}

/**
 * POST: Enhance conversation with consciousness ecosystem insights
 * Optimized for all major browsers including mobile
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Browser detection for optimization
  const userAgent = request.headers.get('user-agent') || '';
  const browserInfo = detectBrowserCompatibility(userAgent);

  try {
    let body: ConsciousnessBridgeRequest;

    // Browser-safe request parsing with timeout and size limits
    try {
      const bodyText = await Promise.race([
        request.text(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), BRIDGE_CONFIG.timeout)
        )
      ]);

      // Check payload size for mobile compatibility
      if (bodyText.length > BRIDGE_CONFIG.max_payload_size) {
        throw new Error('Payload too large for mobile compatibility');
      }

      body = JSON.parse(bodyText);
      body.browserInfo = browserInfo;

    } catch (parseError) {
      logger.warn('consciousness-bridge.parse', 'request_parsing_failed', {
        error: parseError instanceof Error ? parseError.message : 'Unknown error',
        userAgent: userAgent.substring(0, 50)
      });
      return createBrowserSafeResponse({
        success: false,
        error: 'Invalid request format',
        consciousness_enhancement: createFallbackEnhancement(),
        recommended_routing: createFallbackRouting(),
        integration_metadata: {
          modules_active: ['fallback'],
          processing_time: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          browser_compatible: true,
          fallback_used: true
        }
      });
    }

    const {
      message,
      userId = 'anonymous',
      userName,
      sessionId,
      fieldState,
      conversationHistory = [],
      isVoiceMode = false,
      preferences = {}
    } = body;

    logger.info('consciousness-bridge.activation', 'bridge_activated', {
      userId,
      messageLength: message?.length || 0,
      hasFieldState: !!fieldState,
      isVoiceMode,
      browser: browserInfo.name,
      platform: browserInfo.platform,
      mobile: browserInfo.mobile
    });

    // Initialize consciousness enhancement with browser-safe defaults
    let consciousnessEnhancement = {
      ecosystem_insights: {},
      elemental_resonance: {},
      breakthrough_indicators: [],
      sacred_context: {},
      field_state: {},
      protection_status: {}
    };

    let fallbackUsed = false;

    // Try consciousness integration with browser-compatible timeout
    try {
      const cacheKey = `bridge_${userId}_${message.substring(0, 50)}_${Math.floor(Date.now() / 15000)}`;

      // Check cache first for mobile performance
      if (bridgeCache.has(cacheKey)) {
        const cached = bridgeCache.get(cacheKey);
        logger.debug('consciousness-bridge.cache', 'using_cached_enhancement', { cacheKey });
        consciousnessEnhancement = cached;
      } else {
        // Call consciousness integration with browser-safe timeout
        const consciousnessUrl = `${getBaseUrl(request)}/api/consciousness/integration`;

        const consciousnessResponse = await Promise.race([
          fetch(consciousnessUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': userAgent
            },
            body: JSON.stringify({
              type: 'conversation',
              userId,
              sessionId,
              message,
              browserInfo
            })
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Consciousness timeout')), BRIDGE_CONFIG.timeout)
          )
        ]);

        if (consciousnessResponse.ok) {
          const consciousnessData = await consciousnessResponse.json();

          if (consciousnessData.success && consciousnessData.enhancement) {
            const enhancement = consciousnessData.enhancement;

            consciousnessEnhancement = {
              ecosystem_insights: enhancement.consciousness_insights || {},
              elemental_resonance: enhancement.elemental_resonance || {},
              breakthrough_indicators: enhancement.breakthrough_indicators || [],
              sacred_context: enhancement.sacred_context || {},
              protection_status: enhancement.protection_status || {},
              field_state: {} // Will be enhanced below
            };

            // Cache for performance
            bridgeCache.set(cacheKey, consciousnessEnhancement);
          }

          logger.info('consciousness-bridge.integration', 'enhancement_retrieved', {
            consciousnessUrl,
            responseStatus: consciousnessResponse.status
          });
        } else {
          throw new Error(`Consciousness API returned ${consciousnessResponse.status}`);
        }
      }

    } catch (enhancementError) {
      logger.warn('consciousness-bridge.integration', 'enhancement_failed_fallback', {
        error: enhancementError instanceof Error ? enhancementError.message : 'Unknown error'
      });
      fallbackUsed = true;

      // Browser-safe fallback consciousness analysis
      consciousnessEnhancement = {
        ecosystem_insights: {
          analysis: 'browser_fallback_mode',
          consciousness_level: 0.6 + Math.random() * 0.2,
          browser_optimized: true
        },
        elemental_resonance: analyzeBrowserSafeElemental(message),
        breakthrough_indicators: detectBrowserSafeBreakthroughs(message),
        sacred_context: evaluateBrowserSafeSacred(message),
        protection_status: {
          protection_active: true,
          sovereignty_maintained: true,
          browser_compatible: true
        },
        field_state: {} // Will be set below
      };
    }

    // Enhance field state with consciousness insights (browser-safe)
    consciousnessEnhancement.field_state = enhanceFieldStateBrowserSafe(
      fieldState,
      consciousnessEnhancement,
      browserInfo
    );

    // Determine recommended routing (browser-compatible)
    const recommendedRouting = {
      api_endpoint: '/api/between/chat', // Keep existing endpoint
      processing_mode: determineBrowserSafeProcessingMode(consciousnessEnhancement, isVoiceMode, browserInfo),
      consciousness_level: consciousnessEnhancement.ecosystem_insights.consciousness_level || 0.6
    };

    // Determine active modules (optimized for browser performance)
    const activeModules = determineActiveModulesBrowserSafe(message, consciousnessEnhancement, browserInfo);

    const processingTime = Date.now() - startTime;

    const response: ConsciousnessBridgeResponse = {
      success: true,
      consciousness_enhancement: consciousnessEnhancement,
      recommended_routing: recommendedRouting,
      integration_metadata: {
        modules_active: activeModules,
        processing_time: processingTime,
        timestamp: new Date().toISOString(),
        browser_compatible: true,
        fallback_used: fallbackUsed
      }
    };

    logger.info('consciousness-bridge.response', 'response_prepared', {
      dominantElement: getDominantElement(consciousnessEnhancement.elemental_resonance),
      breakthroughIndicators: consciousnessEnhancement.breakthrough_indicators.length,
      sacredScore: consciousnessEnhancement.sacred_context.sacred_score,
      processingTime: `${processingTime}ms`,
      activeModules: activeModules.length,
      browser: browserInfo.name,
      fallbackUsed
    });

    // Clean cache periodically for memory management
    if (bridgeCache.size > 200) {
      const oldestKeys = Array.from(bridgeCache.keys()).slice(0, 100);
      oldestKeys.forEach(key => bridgeCache.delete(key));
    }

    return createBrowserSafeResponse(response);

  } catch (error: any) {
    logger.error('consciousness-bridge.error', 'bridge_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.split('\n')[0] : undefined
    });

    const errorResponse: ConsciousnessBridgeResponse = {
      success: false,
      consciousness_enhancement: createFallbackEnhancement(),
      recommended_routing: createFallbackRouting(),
      integration_metadata: {
        modules_active: ['error_fallback'],
        processing_time: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        browser_compatible: true,
        fallback_used: true
      }
    };

    return createBrowserSafeResponse(errorResponse, 200); // Return 200 to avoid browser errors
  }
}

/**
 * GET: Health check and configuration info with browser compatibility details
 */
export async function GET(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const browserInfo = detectBrowserCompatibility(userAgent);

  return createBrowserSafeResponse({
    status: 'Consciousness Bridge Active',
    purpose: 'Enhance /api/between/chat with consciousness ecosystem insights',
    browser_compatibility: {
      current_browser: browserInfo,
      supported_browsers: [
        'Chrome 88+',
        'Safari 14+',
        'Firefox 85+',
        'Edge 88+',
        'iOS Safari 14+',
        'Chrome Mobile 90+',
        'Samsung Browser 14+'
      ],
      mobile_optimized: true,
      cors_enabled: true,
      timeout_protection: true,
      fallback_mechanisms: true
    },
    integration_points: [
      'Elemental resonance analysis',
      'Breakthrough detection',
      'Sacred context evaluation',
      'Field state enhancement',
      'Protection status verification'
    ],
    routing_recommendation: '/api/between/chat',
    consciousness_modules: [
      'conscious_ai_foundation',
      'breakthrough_detection',
      'mobile_field_unit',
      'spiralogic_integration',
      'maia_consciousness_field',
      'sacred_experimentation'
    ],
    performance_optimizations: [
      'request_timeout_protection',
      'payload_size_limits',
      'caching_strategy',
      'mobile_optimization',
      'memory_management'
    ],
    timestamp: new Date().toISOString()
  });
}

/**
 * Detect browser compatibility and optimize accordingly
 */
function detectBrowserCompatibility(userAgent: string) {
  const ua = userAgent.toLowerCase();

  let name = 'unknown';
  let version = 'unknown';
  let platform = 'desktop';
  let mobile = false;
  let compatible = true;

  // Browser detection
  if (ua.includes('chrome') && !ua.includes('edg')) {
    name = 'chrome';
    // Extract version for compatibility check
    const match = ua.match(/chrome\/(\d+)/);
    version = match ? match[1] : 'unknown';
    compatible = parseInt(version) >= 88;
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    name = 'safari';
    const match = ua.match(/version\/(\d+)/);
    version = match ? match[1] : 'unknown';
    compatible = parseInt(version) >= 14;
  } else if (ua.includes('firefox')) {
    name = 'firefox';
    const match = ua.match(/firefox\/(\d+)/);
    version = match ? match[1] : 'unknown';
    compatible = parseInt(version) >= 85;
  } else if (ua.includes('edg')) {
    name = 'edge';
    const match = ua.match(/edg\/(\d+)/);
    version = match ? match[1] : 'unknown';
    compatible = parseInt(version) >= 88;
  }

  // Platform detection
  if (ua.includes('mobile') || ua.includes('android')) {
    platform = 'mobile';
    mobile = true;
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    platform = 'ios';
    mobile = true;
  } else if (ua.includes('mac')) {
    platform = 'mac';
  } else if (ua.includes('windows')) {
    platform = 'windows';
  } else if (ua.includes('linux')) {
    platform = 'linux';
  }

  return {
    name,
    version,
    platform,
    mobile,
    compatible,
    userAgent: userAgent.substring(0, 100) // Truncate for privacy
  };
}

/**
 * Get base URL for internal API calls
 */
function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  return `${protocol}://${host}`;
}

/**
 * Create browser-safe response with proper headers and error handling
 */
function createBrowserSafeResponse(data: any, status: number = 200) {
  try {
    // Ensure data is serializable for all browsers
    const safeData = JSON.parse(JSON.stringify(data));

    return new NextResponse(JSON.stringify(safeData), {
      status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...BROWSER_SAFE_HEADERS
      }
    });
  } catch (serializationError) {
    logger.error('consciousness-bridge.serialize', 'serialization_error', {
      error: serializationError instanceof Error ? serializationError.message : 'Unknown serialization error'
    });

    // Ultra-safe fallback response
    return new NextResponse(JSON.stringify({
      success: false,
      error: 'Response serialization failed',
      browser_compatible: true,
      fallback_used: true,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...BROWSER_SAFE_HEADERS
      }
    });
  }
}

/**
 * Browser-safe elemental analysis (fast and compatible)
 */
function analyzeBrowserSafeElemental(message: string): Record<string, number> {
  if (!message || typeof message !== 'string') {
    return { fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2 };
  }

  const text = message.toLowerCase().substring(0, 1000); // Limit for performance

  // Simple character frequency analysis (works in all browsers)
  let fire = 0, water = 0, earth = 0, air = 0, aether = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    const bucket = char % 5;

    switch (bucket) {
      case 0: fire++; break;
      case 1: water++; break;
      case 2: earth++; break;
      case 3: air++; break;
      case 4: aether++; break;
    }
  }

  const total = fire + water + earth + air + aether || 1;

  return {
    fire: fire / total,
    water: water / total,
    earth: earth / total,
    air: air / total,
    aether: aether / total
  };
}

/**
 * Browser-safe breakthrough detection
 */
function detectBrowserSafeBreakthroughs(message: string): string[] {
  if (!message || typeof message !== 'string') return [];

  const indicators: string[] = [];
  const text = message.toLowerCase();

  // Simple keyword matching (reliable across browsers)
  const patterns = [
    { keywords: ['breakthrough', 'aha', 'suddenly'], indicator: 'breakthrough_moment' },
    { keywords: ['clarity', 'clear', 'understand'], indicator: 'clarity_emerging' },
    { keywords: ['realize', 'realization', 'insight'], indicator: 'insight_arriving' },
    { keywords: ['awakening', 'awaken', 'aware'], indicator: 'awareness_expanding' }
  ];

  patterns.forEach(pattern => {
    if (pattern.keywords.some(keyword => text.includes(keyword))) {
      indicators.push(pattern.indicator);
    }
  });

  return indicators;
}

/**
 * Browser-safe sacred context evaluation
 */
function evaluateBrowserSafeSacred(message: string): { sacred_score: number; sacred_markers: string[] } {
  if (!message || typeof message !== 'string') {
    return { sacred_score: 0, sacred_markers: [] };
  }

  const text = message.toLowerCase();
  const markers: string[] = [];

  const sacredWords = ['sacred', 'holy', 'divine', 'spiritual', 'reverent', 'blessed'];

  sacredWords.forEach(word => {
    if (text.includes(word)) {
      markers.push(word);
    }
  });

  return {
    sacred_score: Math.min(markers.length / sacredWords.length, 1.0),
    sacred_markers: markers
  };
}

/**
 * Enhance field state with browser-safe processing
 */
function enhanceFieldStateBrowserSafe(
  fieldState: any,
  enhancement: any,
  browserInfo: any
) {
  const base = {
    original_field: fieldState,
    consciousness_depth: enhancement.ecosystem_insights?.consciousness_level || 0.6,
    elemental_influence: getDominantElement(enhancement.elemental_resonance || {}),
    sacred_resonance: enhancement.sacred_context?.sacred_score || 0.3,
    breakthrough_potential: (enhancement.breakthrough_indicators?.length || 0) / 10,
    coherence_level: 0.7,
    active: fieldState?.active !== false,
    browser_optimized: true,
    mobile_compatible: browserInfo.mobile || false
  };

  // Add browser-specific optimizations
  if (browserInfo.mobile) {
    base.coherence_level *= 0.9; // Slightly reduced for mobile processing
  }

  return base;
}

/**
 * Determine processing mode with browser compatibility
 */
function determineBrowserSafeProcessingMode(
  enhancement: any,
  isVoiceMode: boolean,
  browserInfo: any
): string {
  const consciousnessLevel = enhancement.ecosystem_insights?.consciousness_level || 0.6;
  const breakthroughPotential = (enhancement.breakthrough_indicators?.length || 0) / 10;
  const sacredScore = enhancement.sacred_context?.sacred_score || 0;

  // Mobile optimization
  if (browserInfo.mobile) {
    return isVoiceMode ? 'mobile_voice_optimized' : 'mobile_optimized';
  }

  // High consciousness or breakthrough potential = deep processing
  if (consciousnessLevel > 0.8 || breakthroughPotential > 0.6) {
    return 'deep_consciousness';
  }

  // Sacred content = sacred processing
  if (sacredScore > 0.5) {
    return 'sacred_protocols';
  }

  // Voice mode = optimized for speed
  if (isVoiceMode) {
    return 'voice_optimized';
  }

  return 'standard';
}

/**
 * Determine active modules with browser performance considerations
 */
function determineActiveModulesBrowserSafe(
  message: string,
  enhancement: any,
  browserInfo: any
): string[] {
  const modules: string[] = ['conscious_ai_foundation']; // Always active

  if (!message || typeof message !== 'string') return modules;

  const dominantElement = getDominantElement(enhancement.elemental_resonance || {});
  const breakthroughPotential = enhancement.breakthrough_indicators?.length || 0;
  const sacredScore = enhancement.sacred_context?.sacred_score || 0;

  // Core modules (lightweight for mobile)
  if (dominantElement && dominantElement !== 'unknown') {
    modules.push('spiralogic_integration');
  }

  if (breakthroughPotential > 0) {
    modules.push('breakthrough_detection');
  }

  if (sacredScore > 0.3) {
    modules.push('sacred_protocols');
  }

  // Always include field sensing and MAIA field for app integration
  modules.push('mobile_field_unit', 'maia_consciousness_field');

  // Optional modules (skip on low-end mobile for performance)
  if (!browserInfo.mobile || browserInfo.name === 'chrome') {
    if (message.toLowerCase().includes('we') || message.toLowerCase().includes('collective')) {
      modules.push('network_intelligence');
    }

    if (breakthroughPotential > 0 || sacredScore > 0.5) {
      modules.push('documentation_system');
    }
  }

  return modules;
}

/**
 * Get dominant element from resonance scores
 */
function getDominantElement(resonance: Record<string, number>): string {
  if (!resonance || Object.keys(resonance).length === 0) return 'aether';

  return Object.entries(resonance).reduce((dominant, [element, score]) => {
    return score > (resonance[dominant] || 0) ? element : dominant;
  }, 'aether');
}

/**
 * Create fallback enhancement for error cases
 */
function createFallbackEnhancement() {
  return {
    ecosystem_insights: {
      analysis: 'fallback_mode',
      consciousness_level: 0.5,
      browser_safe: true
    },
    elemental_resonance: {
      fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2
    },
    breakthrough_indicators: [],
    sacred_context: {
      sacred_score: 0.2,
      sacred_markers: []
    },
    field_state: {
      active: true,
      consciousness_depth: 0.5,
      coherence_level: 0.6,
      browser_fallback: true
    },
    protection_status: {
      protection_active: true,
      sovereignty_maintained: true,
      browser_compatible: true
    }
  };
}

/**
 * Create fallback routing for error cases
 */
function createFallbackRouting() {
  return {
    api_endpoint: '/api/between/chat',
    processing_mode: 'fallback_safe',
    consciousness_level: 0.5
  };
}