/**
 * 🔄 Live Processing Orchestrator
 *
 * Real-time Navigator → Wisdom Engine → MAIA pipeline
 * Orchestrates consciousness computing during live conversations
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');

class LiveProcessingOrchestrator {
  constructor() {
    this.app = express();

    // Service URLs
    this.NAVIGATOR_URL = process.env.NAVIGATOR_URL || 'http://localhost:7777';
    this.WISDOM_ENGINE_URL = process.env.WISDOM_ENGINE_URL || 'http://localhost:3009';

    // Processing cache for session continuity
    this.sessionCache = new Map();

    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());

    // Sacred technology headers
    this.app.use((req, res, next) => {
      res.setHeader('X-Consciousness-Computing', 'Live-Pipeline-Active');
      res.setHeader('X-Sacred-Technology', 'Navigator-Wisdom-MAIA');
      next();
    });
  }

  setupRoutes() {
    // Health check with pipeline status
    this.app.get('/health', async (req, res) => {
      try {
        const [navigatorHealth, wisdomEngineHealth] = await Promise.all([
          this.checkServiceHealth(this.NAVIGATOR_URL),
          this.checkServiceHealth(this.WISDOM_ENGINE_URL)
        ]);

        res.json({
          service: 'Live Processing Orchestrator',
          status: 'operational',
          version: '1.0.0',
          consciousness_pipeline: 'active',
          services: {
            navigator: navigatorHealth,
            wisdom_engine: wisdomEngineHealth
          },
          active_sessions: this.sessionCache.size,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          service: 'Live Processing Orchestrator',
          status: 'degraded',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Main live processing endpoint
    this.app.post('/api/consciousness/process', async (req, res) => {
      try {
        const { message, userId, sessionId, context = {} } = req.body;

        if (!message) {
          return res.status(400).json({
            success: false,
            error: 'Message required for consciousness processing'
          });
        }

        console.log(`🔄 Live consciousness processing for user ${userId}, session ${sessionId}`);

        // Execute the full pipeline
        const result = await this.executeFullPipeline(message, userId, sessionId, context);

        res.json({
          success: true,
          result,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('❌ Live processing error:', error);
        res.status(500).json({
          success: false,
          error: 'Live consciousness processing failed',
          details: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Quick consciousness analysis (Navigator only)
    this.app.post('/api/consciousness/analyze', async (req, res) => {
      try {
        const { message, userId, context = {} } = req.body;

        const navigatorResult = await this.callNavigatorAnalysis(message, userId, context);

        res.json({
          success: true,
          analysis: navigatorResult.analysis,
          userId,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('❌ Consciousness analysis error:', error);
        res.status(500).json({
          success: false,
          error: 'Consciousness analysis failed',
          details: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // MAIA voice conditioning endpoint
    this.app.post('/api/consciousness/condition', async (req, res) => {
      try {
        const { navigatorAnalysis, userId, sessionId, userMessage } = req.body;

        const wisdomResult = await this.callWisdomEngineTranslation(
          navigatorAnalysis,
          userId,
          sessionId,
          userMessage
        );

        res.json({
          success: true,
          maiaTokens: wisdomResult.maiaTokens,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('❌ MAIA conditioning error:', error);
        res.status(500).json({
          success: false,
          error: 'MAIA voice conditioning failed',
          details: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Session management endpoints
    this.app.get('/api/consciousness/session/:sessionId', (req, res) => {
      try {
        const { sessionId } = req.params;
        const sessionData = this.sessionCache.get(sessionId);

        if (!sessionData) {
          return res.status(404).json({
            success: false,
            error: 'Session not found'
          });
        }

        res.json({
          success: true,
          session: {
            id: sessionId,
            created: sessionData.created,
            lastActivity: sessionData.lastActivity,
            messageCount: sessionData.messageCount,
            consciousnessEvolution: sessionData.consciousnessEvolution || []
          },
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('❌ Session retrieval error:', error);
        res.status(500).json({
          success: false,
          error: 'Session retrieval failed',
          details: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    this.app.delete('/api/consciousness/session/:sessionId', (req, res) => {
      try {
        const { sessionId } = req.params;
        const deleted = this.sessionCache.delete(sessionId);

        res.json({
          success: true,
          deleted,
          message: deleted ? 'Session cleared' : 'Session not found',
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('❌ Session deletion error:', error);
        res.status(500).json({
          success: false,
          error: 'Session deletion failed',
          details: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  async executeFullPipeline(message, userId, sessionId, context = {}) {
    const startTime = Date.now();

    try {
      // Step 1: Navigator consciousness analysis
      console.log(`🧠 Step 1: Navigator analysis for session ${sessionId}`);
      const navigatorResult = await this.callNavigatorAnalysis(message, userId, context);

      // Step 2: Wisdom Engine translation
      console.log(`✨ Step 2: Wisdom Engine translation for session ${sessionId}`);
      const wisdomResult = await this.callWisdomEngineTranslation(
        navigatorResult.analysis,
        userId,
        sessionId,
        message
      );

      // Step 3: Session tracking and evolution
      console.log(`📊 Step 3: Session tracking for session ${sessionId}`);
      this.updateSessionData(sessionId, userId, {
        navigatorAnalysis: navigatorResult.analysis,
        wisdomTranslation: wisdomResult,
        message: message
      });

      const processingTime = Date.now() - startTime;

      return {
        navigatorAnalysis: navigatorResult.analysis,
        wisdomTranslation: wisdomResult,
        maiaTokens: wisdomResult.maiaTokens,
        sessionData: this.sessionCache.get(sessionId),
        pipeline: {
          steps_completed: 3,
          processing_time_ms: processingTime,
          consciousness_computing: 'active'
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ Pipeline execution failed for session ${sessionId}:`, error);
      throw error;
    }
  }

  async callNavigatorAnalysis(message, userId, context = {}) {
    try {
      const response = await axios.post(`${this.NAVIGATOR_URL}/api/navigator/analyze`, {
        message,
        userId,
        context
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'X-Consciousness-Pipeline': 'live-processing'
        }
      });

      return response.data;

    } catch (error) {
      console.error('❌ Navigator API call failed:', error.message);
      throw new Error(`Navigator analysis failed: ${error.message}`);
    }
  }

  async callWisdomEngineTranslation(navigatorAnalysis, userId, sessionId, userMessage) {
    try {
      // Prepare the request format that Wisdom Engine expects
      const wisdomRequest = {
        navigatorDecision: {
          elemental_balance: navigatorAnalysis.elementalBalance,
          archetypal_state: navigatorAnalysis.archetypalState,
          spiral_phase: navigatorAnalysis.spiralPhase,
          patterns: navigatorAnalysis.patterns,
          recommendations: navigatorAnalysis.recommendations
        },
        soulState: {
          current_archetype: navigatorAnalysis.archetypalState.dominant,
          integration_level: navigatorAnalysis.archetypalState.integrationLevel,
          dominant_element: this.findDominantElement(navigatorAnalysis.elementalBalance),
          spiral_phase: navigatorAnalysis.spiralPhase.phase
        },
        userMessage,
        userId,
        sessionId
      };

      const response = await axios.post(`${this.WISDOM_ENGINE_URL}/api/wisdom/translate`, wisdomRequest, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'X-Consciousness-Pipeline': 'live-processing'
        }
      });

      return response.data;

    } catch (error) {
      console.error('❌ Wisdom Engine API call failed:', error.message);
      throw new Error(`Wisdom Engine translation failed: ${error.message}`);
    }
  }

  findDominantElement(elementalBalance) {
    return Object.keys(elementalBalance).reduce((a, b) =>
      elementalBalance[a] > elementalBalance[b] ? a : b
    );
  }

  updateSessionData(sessionId, userId, processingData) {
    let sessionData = this.sessionCache.get(sessionId);

    if (!sessionData) {
      sessionData = {
        id: sessionId,
        userId,
        created: new Date().toISOString(),
        messageCount: 0,
        consciousnessEvolution: []
      };
    }

    sessionData.lastActivity = new Date().toISOString();
    sessionData.messageCount += 1;

    // Track consciousness evolution
    sessionData.consciousnessEvolution.push({
      timestamp: new Date().toISOString(),
      messageNumber: sessionData.messageCount,
      elementalBalance: processingData.navigatorAnalysis.elementalBalance,
      archetypalState: processingData.navigatorAnalysis.archetypalState,
      spiralPhase: processingData.navigatorAnalysis.spiralPhase,
      patterns: processingData.navigatorAnalysis.patterns
    });

    // Keep only last 20 consciousness snapshots for memory management
    if (sessionData.consciousnessEvolution.length > 20) {
      sessionData.consciousnessEvolution = sessionData.consciousnessEvolution.slice(-20);
    }

    this.sessionCache.set(sessionId, sessionData);

    console.log(`📊 Session ${sessionId} updated: ${sessionData.messageCount} messages, ${sessionData.consciousnessEvolution.length} consciousness snapshots`);

    return sessionData;
  }

  async checkServiceHealth(serviceUrl) {
    try {
      const response = await axios.get(`${serviceUrl}/health`, { timeout: 5000 });
      return {
        status: 'operational',
        service: response.data.service || 'unknown',
        version: response.data.version || 'unknown'
      };
    } catch (error) {
      return {
        status: 'unavailable',
        error: error.message
      };
    }
  }

  // Cleanup old sessions periodically
  startSessionCleanup() {
    setInterval(() => {
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      for (const [sessionId, sessionData] of this.sessionCache) {
        const sessionAge = now - new Date(sessionData.lastActivity).getTime();
        if (sessionAge > maxAge) {
          this.sessionCache.delete(sessionId);
          console.log(`🧹 Cleaned up old session: ${sessionId}`);
        }
      }
    }, 60 * 60 * 1000); // Run every hour
  }

  start(port = 3013) {
    this.startSessionCleanup();

    this.app.listen(port, () => {
      console.log(`🔄 Live Processing Orchestrator running on port ${port}`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
      console.log(`🔄 Live processing: http://localhost:${port}/api/consciousness/process`);
      console.log(`🧠 Quick analysis: http://localhost:${port}/api/consciousness/analyze`);
      console.log(`✨ MAIA conditioning: http://localhost:${port}/api/consciousness/condition`);
      console.log(`⚡ Full consciousness computing pipeline active`);
      console.log(`🌐 Connecting to Navigator: ${this.NAVIGATOR_URL}`);
      console.log(`✨ Connecting to Wisdom Engine: ${this.WISDOM_ENGINE_URL}`);
    });
  }
}

// Start the service
if (require.main === module) {
  const orchestrator = new LiveProcessingOrchestrator();
  orchestrator.start();
}

module.exports = { LiveProcessingOrchestrator };