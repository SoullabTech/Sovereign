// Developer API Routes - Frontend Step 3 Implementation
// API key management and usage tracking for third-party developers

import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import {
  StandardAPIResponse,
  successResponse,
  errorResponse,
} from "../../utils/sharedUtilities";
import { logger } from "../../utils/logger";

const router = express.Router();

// Rate limiting for developer management endpoints
const developerRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit to 50 requests per window per IP
  message: "Too many requests to developer endpoints",
  standardHeaders: true,
  legacyHeaders: false,
});

// Mock database for API keys (in production, use actual database)
interface APIKeyRecord {
  id: string;
  developerId: string;
  key: string;
  name: string;
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
  usage: {
    currentPeriod: number;
    totalRequests: number;
    rateLimit: number;
    rateLimitRemaining: number;
  };
}

// In-memory store for demo (replace with database in production)
const apiKeys: Map<string, APIKeyRecord> = new Map();
const developerUsage: Map<string, { requests: number; lastReset: number }> =
  new Map();

// Initialize with demo data
const initializeDemoData = () => {
  const demoKey: APIKeyRecord = {
    id: "key_demo_123",
    developerId: "dev_demo_user",
    key: "demo_key_123",
    name: "Demo Application",
    createdAt: new Date().toISOString(),
    lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isActive: true,
    usage: {
      currentPeriod: 45,
      totalRequests: 1247,
      rateLimit: 100,
      rateLimitRemaining: 55,
    },
  };
  apiKeys.set(demoKey.id, demoKey);
  developerUsage.set(demoKey.developerId, {
    requests: 45,
    lastReset: Date.now(),
  });
};

initializeDemoData();

// Authentication middleware for developer endpoints
interface AuthenticatedDeveloperRequest extends Request {
  developerId?: string;
}

const authenticateDeveloper = async (
  req: AuthenticatedDeveloperRequest,
  res: Response,
  next: Function,
) => {
  try {
    const token = req.headers["authorization"]?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json(errorResponse(["Authentication token required"]));
    }

    // In production, validate JWT token and extract developer ID
    // For demo, accept any token and use demo developer ID
    req.developerId = "dev_demo_user";

    next();
  } catch (error) {
    logger.error("Developer authentication failed", { error });
    res.status(500).json(errorResponse(["Authentication error"]));
  }
};

// Validation schemas
const createAPIKeySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

// Helper functions
const generateAPIKey = (): string => {
  return `sk_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
};

const updateUsageStats = (keyRecord: APIKeyRecord) => {
  const usage = developerUsage.get(keyRecord.developerId);
  if (usage) {
    // Reset usage if it's been more than 15 minutes (rate limit window)
    if (Date.now() - usage.lastReset > 15 * 60 * 1000) {
      usage.requests = 0;
      usage.lastReset = Date.now();
    }

    keyRecord.usage.currentPeriod = usage.requests;
    keyRecord.usage.rateLimitRemaining =
      keyRecord.usage.rateLimit - usage.requests;
  }
};

// Routes

/**
 * @route GET /api/v1/developer/keys
 * @desc Get all API keys for authenticated developer
 * @access Private (Developer token required)
 */
router.get(
  "/keys",
  developerRateLimiter,
  authenticateDeveloper,
  async (req: AuthenticatedDeveloperRequest, res: Response) => {
    try {
      const developerId = req.developerId!;

      logger.info("Developer API keys requested", { developerId });

      const developerKeys = Array.from(apiKeys.values())
        .filter((key) => key.developerId === developerId)
        .map((key) => {
          updateUsageStats(key);
          return {
            id: key.id,
            name: key.name,
            key: `${key.key.substring(0, 8)}...${key.key.substring(key.key.length - 4)}`, // Masked key
            createdAt: key.createdAt,
            lastUsed: key.lastUsed,
            isActive: key.isActive,
            usage: key.usage,
          };
        });

      res.json(successResponse(developerKeys));
    } catch (error) {
      logger.error("Failed to get developer API keys", {
        error: error instanceof Error ? error.message : "Unknown error",
        developerId: req.developerId,
      });
      res.status(500).json(errorResponse(["Failed to retrieve API keys"]));
    }
  },
);

/**
 * @route POST /api/v1/developer/keys
 * @desc Create new API key for authenticated developer
 * @access Private (Developer token required)
 */
router.post(
  "/keys",
  developerRateLimiter,
  authenticateDeveloper,
  async (req: AuthenticatedDeveloperRequest, res: Response) => {
    try {
      const developerId = req.developerId!;
      const validatedData = createAPIKeySchema.parse(req.body);

      logger.info("Creating new API key", {
        developerId,
        name: validatedData.name,
      });

      // Check if developer has too many keys (limit to 5)
      const existingKeys = Array.from(apiKeys.values()).filter(
        (key) => key.developerId === developerId && key.isActive,
      );

      if (existingKeys.length >= 5) {
        return res
          .status(400)
          .json(errorResponse(["Maximum of 5 API keys allowed per developer"]));
      }

      // Generate new API key
      const newKey: APIKeyRecord = {
        id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        developerId,
        key: generateAPIKey(),
        name: validatedData.name,
        createdAt: new Date().toISOString(),
        isActive: true,
        usage: {
          currentPeriod: 0,
          totalRequests: 0,
          rateLimit: 100,
          rateLimitRemaining: 100,
        },
      };

      apiKeys.set(newKey.id, newKey);

      // Return full key only on creation (for developer to copy)
      const responseData = {
        id: newKey.id,
        name: newKey.name,
        key: newKey.key, // Full key shown only once
        createdAt: newKey.createdAt,
        isActive: newKey.isActive,
        usage: newKey.usage,
      };

      logger.info("API key created successfully", {
        developerId,
        keyId: newKey.id,
        name: validatedData.name,
      });

      res.status(201).json(successResponse(responseData));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json(errorResponse(error.errors.map((e) => e.message)));
      }

      logger.error("Failed to create API key", {
        error: error instanceof Error ? error.message : "Unknown error",
        developerId: req.developerId,
      });
      res.status(500).json(errorResponse(["Failed to create API key"]));
    }
  },
);

/**
 * @route DELETE /api/v1/developer/keys/:id
 * @desc Revoke/delete API key
 * @access Private (Developer token required)
 */
router.delete(
  "/keys/:id",
  developerRateLimiter,
  authenticateDeveloper,
  async (req: AuthenticatedDeveloperRequest, res: Response) => {
    try {
      const developerId = req.developerId!;
      const keyId = req.params.id;

      logger.info("Revoking API key", { developerId, keyId });

      const keyRecord = apiKeys.get(keyId);

      if (!keyRecord) {
        return res.status(404).json(errorResponse(["API key not found"]));
      }

      if (keyRecord.developerId !== developerId) {
        return res
          .status(403)
          .json(errorResponse(["Not authorized to revoke this key"]));
      }

      // Soft delete - mark as inactive
      keyRecord.isActive = false;
      apiKeys.set(keyId, keyRecord);

      logger.info("API key revoked successfully", { developerId, keyId });

      res.json(
        successResponse({
          message: "API key revoked successfully",
          keyId: keyId,
        }),
      );
    } catch (error) {
      logger.error("Failed to revoke API key", {
        error: error instanceof Error ? error.message : "Unknown error",
        developerId: req.developerId,
        keyId: req.params.id,
      });
      res.status(500).json(errorResponse(["Failed to revoke API key"]));
    }
  },
);

/**
 * @route GET /api/v1/developer/usage
 * @desc Get usage statistics for authenticated developer
 * @access Private (Developer token required)
 */
router.get(
  "/usage",
  developerRateLimiter,
  authenticateDeveloper,
  async (req: AuthenticatedDeveloperRequest, res: Response) => {
    try {
      const developerId = req.developerId!;

      logger.info("Developer usage stats requested", { developerId });

      const developerKeys = Array.from(apiKeys.values()).filter(
        (key) => key.developerId === developerId && key.isActive,
      );

      const totalUsage = {
        totalKeys: developerKeys.length,
        activeKeys: developerKeys.filter((key) => key.isActive).length,
        currentPeriodRequests: developerKeys.reduce((sum, key) => {
          updateUsageStats(key);
          return sum + key.usage.currentPeriod;
        }, 0),
        totalRequests: developerKeys.reduce(
          (sum, key) => sum + key.usage.totalRequests,
          0,
        ),
        rateLimitRemaining: Math.min(
          ...developerKeys.map((key) => key.usage.rateLimitRemaining),
        ),
        rateLimit: 100, // Standard rate limit
        resetTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
        keyUsage: developerKeys.map((key) => ({
          keyId: key.id,
          keyName: key.name,
          currentPeriod: key.usage.currentPeriod,
          totalRequests: key.usage.totalRequests,
          lastUsed: key.lastUsed,
        })),
      };

      res.json(successResponse(totalUsage));
    } catch (error) {
      logger.error("Failed to get developer usage stats", {
        error: error instanceof Error ? error.message : "Unknown error",
        developerId: req.developerId,
      });
      res
        .status(500)
        .json(errorResponse(["Failed to retrieve usage statistics"]));
    }
  },
);

/**
 * @route GET /api/v1/developer/quickstart
 * @desc Get quick-start guides and code snippets
 * @access Private (Developer token required)
 */
router.get(
  "/quickstart",
  developerRateLimiter,
  authenticateDeveloper,
  async (req: AuthenticatedDeveloperRequest, res: Response) => {
    try {
      logger.info("Quick-start guides requested", {
        developerId: req.developerId,
      });

      const quickStartGuides = {
        nodejs: {
          title: "Node.js Integration",
          description: "Integrate AIN Engine into your Node.js application",
          code: `import { AINEngineClient } from 'ain-engine-sdk';

const client = new AINEngineClient({
  apiKey: 'your_api_key_here'
});

// Get collective insights
const insights = await client.getCollectiveInsights({
  limit: 5,
  confidenceThreshold: 0.7
});

console.log(insights);`,
        },
        wordpress: {
          title: "WordPress Plugin Hook",
          description: "Add spiritual intelligence to your WordPress site",
          code: `<?php
// Add to your theme's functions.php or custom plugin

function get_ain_engine_insights() {
    $api_key = 'your_api_key_here';
    $response = wp_remote_get('https://api.spiralogic.oracle/v1/ain-engine/collective-insights', [
        'headers' => [
            'X-API-Key' => $api_key
        ]
    ]);
    
    if (!is_wp_error($response)) {
        $data = json_decode(wp_remote_retrieve_body($response), true);
        return $data['data'];
    }
    return [];
}

// Use in template
$insights = get_ain_engine_insights();
foreach ($insights as $insight) {
    echo '<div class="spiritual-insight">';
    echo '<h3>' . esc_html($insight['title']) . '</h3>';
    echo '<p>' . esc_html($insight['guidance']) . '</p>';
    echo '</div>';
}
?>`,
        },
        reactNative: {
          title: "React Native Mobile App",
          description: "Bring archetypal wisdom to mobile applications",
          code: `import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';

const SpiritualInsights = () => {
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch(
          'https://api.spiralogic.oracle/v1/ain-engine/collective-insights',
          {
            headers: {
              'X-API-Key': 'your_api_key_here'
            }
          }
        );
        const data = await response.json();
        setInsights(data.data || []);
      } catch (error) {
        console.error('Failed to fetch insights:', error);
      }
    };

    fetchInsights();
  }, []);

  return (
    <ScrollView>
      {insights.map((insight) => (
        <View key={insight.id} style={{ padding: 16, margin: 8, backgroundColor: '#f5f5f5' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{insight.title}</Text>
          <Text style={{ fontSize: 14, marginTop: 8 }}>{insight.guidance}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

export default SpiritualInsights;`,
        },
      };

      const resources = {
        documentation: "https://docs.spiralogic.oracle/ain-engine",
        sdkRepository: "https://github.com/spiralogic/ain-engine-sdk",
        examples: "https://github.com/spiralogic/ain-engine-examples",
        support: "developers@spiralogic.oracle",
      };

      res.json(
        successResponse({
          guides: quickStartGuides,
          resources: resources,
        }),
      );
    } catch (error) {
      logger.error("Failed to get quick-start guides", {
        error: error instanceof Error ? error.message : "Unknown error",
        developerId: req.developerId,
      });
      res
        .status(500)
        .json(errorResponse(["Failed to retrieve quick-start guides"]));
    }
  },
);

export default router;
