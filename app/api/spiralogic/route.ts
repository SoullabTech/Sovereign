import { NextRequest, NextResponse } from 'next/server';
import SpiralogicEngine from '@/lib/spiralogic/core/spiralogic-engine';
import { logServerError } from '@/lib/logger';

// Create simple logger interface
const logger = {
  info: (context: string, action: string, data?: any) => {
    console.log(`[${context}] ${action}:`, data || '');
  },
  error: (context: string, action: string, data?: any) => {
    console.error(`[${context}] ${action}:`, data || '');
    if (data?.error) {
      logServerError(new Error(data.error), `${context}.${action}`, data);
    }
  },
  warn: (context: string, action: string, data?: any) => {
    console.warn(`[${context}] ${action}:`, data || '');
  },
  debug: (context: string, action: string, data?: any) => {
    if (process.env.SPIRALOGIC_DEBUG === 'true') {
      console.debug(`[${context}] ${action}:`, data || '');
    }
  }
};

/**
 * SPIRALOGIC SPIRAL PROGRESSION API
 *
 * Direct access to spiral consciousness development system.
 * Provides spiral entry, progression tracking, and integration discovery.
 *
 * Browser Compatibility: All modern browsers
 * Mobile Support: Optimized for iOS Safari, Chrome Mobile
 * Real-time Updates: WebSocket compatible for live progression
 */

// Configuration
const SPIRALOGIC_CONFIG = {
  timeout: 8000, // 8 seconds for spiral processing
  cache_duration: 60000, // 1 minute cache for spiral states
  max_progression_per_hour: 3, // Prevent spiral rushing
  integration_window: 15000, // 15 second window for integration detection
  browser_safe_mode: true
};

// Cross-browser headers
const SPIRAL_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'X-Spiral-API': 'v1.0'
};

// Global Spiralogic engine instance
let spiralogicEngine: SpiralogicEngine | null = null;

// Cache for user spiral states
const spiralCache = new Map<string, any>();
const progressionTracker = new Map<string, number[]>(); // Track progression times

interface SpiralRequest {
  action: 'enter_spiral' | 'get_state' | 'check_integrations' | 'get_visualization' | 'process_quest';
  userId: string;
  element?: string;
  sessionId?: string;
  questResponse?: any;
  browserInfo?: {
    name: string;
    platform: string;
    mobile: boolean;
  };
}

interface SpiralResponse {
  success: boolean;
  data?: any;
  spiral?: any;
  integrations?: string[];
  visualization?: any;
  error?: string;
  metadata: {
    action: string;
    timestamp: string;
    processing_time: number;
    source: 'spiralogic-engine';
    browser_compatible: boolean;
    cache_used: boolean;
  };
}

// Disable Vercel caching for real-time spiral data
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * OPTIONS: Handle CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: SPIRAL_HEADERS
  });
}

/**
 * GET: Spiral system status and user state
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const check = url.searchParams.get('check');

  try {
    // System status check
    if (check === 'status') {
      return createSpiralResponse({
        success: true,
        data: {
          status: 'Spiralogic Engine Active',
          version: '1.0.0',
          elements: ['fire', 'water', 'earth', 'air', 'aether', 'shadow'],
          max_depth: 3,
          integration_patterns: [
            'steam-rising', 'grounded-fire', 'flowing-earth',
            'sacred-breath', 'quintessence', 'great-work'
          ],
          progression_rules: {
            balance_requirement: true,
            shadow_gating: true,
            integration_time: true,
            skip_prevention: true
          },
          browser_support: [
            'Chrome 88+', 'Safari 14+', 'Firefox 85+',
            'Edge 88+', 'iOS Safari 14+', 'Mobile Chrome'
          ]
        },
        metadata: {
          action: 'status_check',
          timestamp: new Date().toISOString(),
          processing_time: Date.now() - startTime,
          source: 'spiralogic-engine',
          browser_compatible: true,
          cache_used: false
        }
      });
    }

    // User state check
    if (userId) {
      const engine = await getSpiralogicEngine();
      const userState = await engine.getUserState(userId);

      if (!userState) {
        return createSpiralResponse({
          success: true,
          data: {
            message: 'No spiral journey started yet',
            suggestions: [
              'Begin with fire element to ignite your journey',
              'Explore water element to sense your emotions',
              'Ground with earth element for stability'
            ]
          },
          metadata: {
            action: 'user_state_check',
            timestamp: new Date().toISOString(),
            processing_time: Date.now() - startTime,
            source: 'spiralogic-engine',
            browser_compatible: true,
            cache_used: false
          }
        });
      }

      // Create visualization from user state
      const visualization = {
        elements: ['fire', 'water', 'earth', 'air', 'aether', 'shadow'].map(element => {
          const depth = userState.elementDepths[element] || 0;
          return {
            element,
            current: depth,
            max: 3,
            progress: Array(3).fill(0).map((_, i) => {
              if (i < depth) return '●';
              if (i === depth && userState.position.element === element) return '◐';
              return '○';
            }).join('→'),
            mastered: depth === 3
          };
        }),
        spiralCompletion: `${((Object.values(userState.elementDepths).reduce((a: number, b: number) => a + b, 0) / 21) * 100).toFixed(1)}%`,
        integrations: userState.integrations,
        currentPosition: userState.position
      };

      return createSpiralResponse({
        success: true,
        data: userState,
        visualization,
        metadata: {
          action: 'user_state_retrieved',
          timestamp: new Date().toISOString(),
          processing_time: Date.now() - startTime,
          source: 'spiralogic-engine',
          browser_compatible: true,
          cache_used: spiralCache.has(userId)
        }
      });
    }

    // Default info response
    return createSpiralResponse({
      success: true,
      data: {
        message: 'Spiralogic Spiral Progression API',
        description: 'Consciousness development through elemental spiral progression',
        usage: {
          'POST /': 'Interact with spiral progression system',
          'GET /?userId=X': 'Get user spiral state',
          'GET /?check=status': 'System status'
        },
        elements: {
          fire: 'Will & Transformation',
          water: 'Emotion & Flow',
          earth: 'Manifestation & Body',
          air: 'Mind & Clarity',
          aether: 'Spirit & Unity',
          shadow: 'Hidden & Integration'
        }
      },
      metadata: {
        action: 'api_info',
        timestamp: new Date().toISOString(),
        processing_time: Date.now() - startTime,
        source: 'spiralogic-engine',
        browser_compatible: true,
        cache_used: false
      }
    });

  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error occurred';

    logger.error('spiralogic.get', 'get_request_failed', {
      error: errorMessage,
      userId
    });

    return createSpiralResponse({
      success: false,
      error: errorMessage || 'Spiral system unavailable',
      metadata: {
        action: 'error_response',
        timestamp: new Date().toISOString(),
        processing_time: Date.now() - startTime,
        source: 'spiralogic-engine',
        browser_compatible: true,
        cache_used: false
      }
    }, 500);
  }
}

/**
 * POST: Spiral progression and quest processing
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse request with timeout
    const body: SpiralRequest = await Promise.race([
      request.json(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), SPIRALOGIC_CONFIG.timeout)
      )
    ]);

    const { action, userId, element, questResponse, browserInfo } = body;

    if (!userId) {
      return createSpiralResponse({
        success: false,
        error: 'userId is required',
        metadata: {
          action: 'validation_error',
          timestamp: new Date().toISOString(),
          processing_time: Date.now() - startTime,
          source: 'spiralogic-engine',
          browser_compatible: true,
          cache_used: false
        }
      }, 400);
    }

    logger.info('spiralogic.post', 'spiral_action_requested', {
      action,
      userId,
      element,
      browser: browserInfo?.name || 'unknown'
    });

    const engine = await getSpiralogicEngine();
    let result: any = {};
    let cacheUsed = false;

    // Check progression rate limiting
    if (action === 'enter_spiral' && !checkProgressionRate(userId)) {
      return createSpiralResponse({
        success: false,
        error: 'Progression rate limit reached. Integration time is sacred.',
        data: {
          suggestion: 'Allow time for integration before continuing your spiral journey',
          next_allowed: getNextAllowedProgression(userId)
        },
        metadata: {
          action: 'rate_limited',
          timestamp: new Date().toISOString(),
          processing_time: Date.now() - startTime,
          source: 'spiralogic-engine',
          browser_compatible: true,
          cache_used: false
        }
      }, 429);
    }

    // Process spiral actions
    switch (action) {
      case 'enter_spiral':
        if (!element) {
          return createSpiralResponse({
            success: false,
            error: 'element is required for spiral entry',
            metadata: {
              action: 'validation_error',
              timestamp: new Date().toISOString(),
              processing_time: Date.now() - startTime,
              source: 'spiralogic-engine',
              browser_compatible: true,
              cache_used: false
            }
          }, 400);
        }

        result = await engine.enterSpiral(userId, element);

        // Track progression
        trackProgression(userId);

        // Clear relevant caches
        spiralCache.delete(userId);

        break;

      case 'get_state':
        const cacheKey = `state_${userId}`;
        if (spiralCache.has(cacheKey)) {
          result = spiralCache.get(cacheKey);
          cacheUsed = true;
        } else {
          result = await engine.getUserState(userId);
          if (result) {
            spiralCache.set(cacheKey, result);
          }
        }
        break;

      case 'check_integrations':
        result = {
          integrations: await engine.checkUserIntegrations(userId),
          position: await engine.getUserSpiralPosition(userId)
        };
        break;

      case 'get_visualization':
        const userState = await engine.getUserState(userId);
        if (userState) {
          const visualization = {
            elements: ['fire', 'water', 'earth', 'air', 'aether', 'shadow'].map(element => {
              const depth = userState.elementDepths[element] || 0;
              return {
                element,
                current: depth,
                max: 3,
                progress: Array(3).fill(0).map((_, i) => {
                  if (i < depth) return '●';
                  if (i === depth && userState.position.element === element) return '◐';
                  return '○';
                }).join('→'),
                mastered: depth === 3
              };
            }),
            spiralCompletion: `${((Object.values(userState.elementDepths).reduce((a: number, b: number) => a + b, 0) / 21) * 100).toFixed(1)}%`,
            integrations: userState.integrations,
            currentPosition: userState.position
          };

          result = {
            visualization,
            current_position: userState.position,
            integrations: userState.integrations
          };
        } else {
          result = { message: 'No spiral journey found' };
        }
        break;

      case 'process_quest':
        result = await engine.processQuestAction(userId, element || 'fire', questResponse);
        break;

      default:
        return createSpiralResponse({
          success: false,
          error: `Unknown action: ${action}`,
          metadata: {
            action: 'unknown_action',
            timestamp: new Date().toISOString(),
            processing_time: Date.now() - startTime,
            source: 'spiralogic-engine',
            browser_compatible: true,
            cache_used: false
          }
        }, 400);
    }

    const response: SpiralResponse = {
      success: true,
      data: result,
      metadata: {
        action,
        timestamp: new Date().toISOString(),
        processing_time: Date.now() - startTime,
        source: 'spiralogic-engine',
        browser_compatible: true,
        cache_used: cacheUsed
      }
    };

    // Add specific fields for different actions
    if (action === 'enter_spiral' && result.success) {
      response.spiral = {
        element: result.element,
        depth: result.depth,
        content: result.content
      };
      response.integrations = result.integrations;
      response.visualization = result.visualization;
    }

    logger.info('spiralogic.post', 'spiral_action_completed', {
      action,
      userId,
      element,
      success: result.success || true,
      processingTime: Date.now() - startTime
    });

    return createSpiralResponse(response);

  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error occurred';
    const errorStack = error?.stack?.split('\n')[0] || 'No stack trace';

    logger.error('spiralogic.post', 'spiral_processing_error', {
      error: errorMessage,
      stack: errorStack
    });

    return createSpiralResponse({
      success: false,
      error: errorMessage,
      metadata: {
        action: 'error',
        timestamp: new Date().toISOString(),
        processing_time: Date.now() - startTime,
        source: 'spiralogic-engine',
        browser_compatible: true,
        cache_used: false
      }
    }, 500);
  }
}

/**
 * Get or initialize Spiralogic engine
 */
async function getSpiralogicEngine(): Promise<SpiralogicEngine> {
  if (!spiralogicEngine) {
    spiralogicEngine = new SpiralogicEngine();
    await spiralogicEngine.initialize();
    logger.info('spiralogic.engine', 'engine_initialized', {
      timestamp: new Date().toISOString()
    });
  }
  return spiralogicEngine;
}

/**
 * Check progression rate limiting
 */
function checkProgressionRate(userId: string): boolean {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  if (!progressionTracker.has(userId)) {
    return true;
  }

  const progressions = progressionTracker.get(userId) || [];
  const recentProgressions = progressions.filter(time => now - time < oneHour);

  return recentProgressions.length < SPIRALOGIC_CONFIG.max_progression_per_hour;
}

/**
 * Track progression for rate limiting
 */
function trackProgression(userId: string) {
  const now = Date.now();
  const progressions = progressionTracker.get(userId) || [];

  progressions.push(now);

  // Keep only last 24 hours
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  const filteredProgressions = progressions.filter(time => time > oneDayAgo);

  progressionTracker.set(userId, filteredProgressions);
}

/**
 * Get next allowed progression time
 */
function getNextAllowedProgression(userId: string): string {
  const progressions = progressionTracker.get(userId) || [];
  if (progressions.length === 0) return 'Now';

  const oldestRecent = progressions[0];
  const oneHour = 60 * 60 * 1000;
  const nextAllowed = new Date(oldestRecent + oneHour);

  return nextAllowed.toISOString();
}

/**
 * Create standardized spiral response
 */
function createSpiralResponse(data: any, status: number = 200) {
  try {
    // Ensure browser-safe JSON
    const safeData = JSON.parse(JSON.stringify(data));

    return new NextResponse(JSON.stringify(safeData), {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...SPIRAL_HEADERS
      }
    });
  } catch (error) {
    logger.error('spiralogic.response', 'response_serialization_error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return new NextResponse(JSON.stringify({
      success: false,
      error: 'Response serialization failed',
      metadata: {
        action: 'serialization_error',
        timestamp: new Date().toISOString(),
        processing_time: 0,
        source: 'spiralogic-engine',
        browser_compatible: true,
        cache_used: false
      }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...SPIRAL_HEADERS
      }
    });
  }
}

// Periodic cache cleanup
setInterval(() => {
  if (spiralCache.size > 100) {
    const oldestKeys = Array.from(spiralCache.keys()).slice(0, 50);
    oldestKeys.forEach(key => spiralCache.delete(key));
  }

  if (progressionTracker.size > 200) {
    const oldestKeys = Array.from(progressionTracker.keys()).slice(0, 100);
    oldestKeys.forEach(key => progressionTracker.delete(key));
  }
}, 60000); // Every minute