/**
 * 🧠 Navigator API - Real-time Consciousness Analysis
 *
 * Node.js implementation of Spiralogic consciousness computing
 * Provides HTTP API for consciousness pattern analysis
 */

const express = require('express');
const cors = require('cors');

class NavigatorAPI {
  constructor() {
    this.app = express();
    this.protocols = new Map();

    this.setupMiddleware();
    this.initializeProtocols();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());

    // Sacred technology header
    this.app.use((req, res, next) => {
      res.setHeader('X-Consciousness-Computing', 'Navigator-Analysis');
      next();
    });
  }

  initializeProtocols() {
    this.protocols.set('fire-ignition', {
      name: 'Fire Ignition',
      intention: 'Activate creative fire and passion',
      duration: '15 minutes',
      steps: [
        'Deep breathing with visualization',
        'Creative energy movement',
        'Intention setting',
        'Sacred flame meditation'
      ]
    });

    this.protocols.set('water-flow', {
      name: 'Water Flow',
      intention: 'Emotional healing and intuitive flow',
      duration: '20 minutes',
      steps: [
        'Emotional body scan',
        'Water visualization',
        'Healing intention',
        'Intuitive guidance reception'
      ]
    });

    this.protocols.set('earth-grounding', {
      name: 'Earth Grounding',
      intention: 'Physical embodiment and stability',
      duration: '10 minutes',
      steps: [
        'Body awareness',
        'Root chakra activation',
        'Earth connection',
        'Stability affirmation'
      ]
    });

    this.protocols.set('air-clarity', {
      name: 'Air Clarity',
      intention: 'Mental clarity and communication',
      duration: '12 minutes',
      steps: [
        'Breathwork for mental clarity',
        'Thought observation',
        'Communication intention',
        'Wisdom integration'
      ]
    });

    this.protocols.set('aether-unity', {
      name: 'Aether Unity',
      intention: 'Spiritual transcendence and unity',
      duration: '25 minutes',
      steps: [
        'Sacred space creation',
        'Unity meditation',
        'Divine connection',
        'Transcendent integration'
      ]
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        service: 'Navigator API',
        status: 'operational',
        version: '1.0.0',
        consciousness_computing: 'active',
        protocols_loaded: this.protocols.size,
        timestamp: new Date().toISOString()
      });
    });

    // Main consciousness analysis endpoint
    this.app.post('/api/navigator/analyze', (req, res) => {
      try {
        const { message, userId, context } = req.body;

        if (!message) {
          return res.status(400).json({
            success: false,
            error: 'Message required for consciousness analysis'
          });
        }

        const analysis = this.analyzeConsciousnessState(message, context);

        console.log(`🧠 Consciousness analysis for user ${userId || 'anonymous'}: ${analysis.archetypalState.dominant}`);

        res.json({
          success: true,
          analysis,
          userId: userId || 'anonymous',
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('❌ Navigator analysis error:', error);
        res.status(500).json({
          success: false,
          error: 'Consciousness analysis failed',
          details: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Spiralogic reading endpoint
    this.app.post('/api/navigator/spiralogic', (req, res) => {
      try {
        const { userId, question } = req.body;

        const reading = this.performSpiralogicReading(
          userId || 'anonymous',
          question || 'What guidance do I need?'
        );

        console.log(`🔮 Spiralogic reading for user ${userId || 'anonymous'}: Hexagram ${reading.hexagram}`);

        res.json({
          success: true,
          reading,
          userId: userId || 'anonymous',
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('❌ Spiralogic reading error:', error);
        res.status(500).json({
          success: false,
          error: 'Spiralogic reading failed',
          details: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Get protocol details
    this.app.get('/api/navigator/protocol/:name', (req, res) => {
      try {
        const { name } = req.params;
        const protocol = this.protocols.get(name);

        if (!protocol) {
          return res.status(404).json({
            success: false,
            error: `Protocol '${name}' not found`
          });
        }

        res.json({
          success: true,
          protocol,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('❌ Protocol retrieval error:', error);
        res.status(500).json({
          success: false,
          error: 'Protocol retrieval failed',
          details: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // List all available protocols
    this.app.get('/api/navigator/protocols', (req, res) => {
      try {
        const protocolsList = Array.from(this.protocols.entries()).map(([key, protocol]) => ({
          key,
          ...protocol
        }));

        res.json({
          success: true,
          protocols: protocolsList,
          count: protocolsList.length,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('❌ Protocols list error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to retrieve protocols',
          details: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  analyzeConsciousnessState(message, context = {}) {
    const elementalBalance = this.detectElementalBalance(message);
    const archetypalState = this.detectArchetypalState(message, elementalBalance);
    const spiralPhase = this.detectSpiralPhase(message, elementalBalance);
    const patterns = this.identifyConsciousnessPatterns(message);
    const recommendations = this.generateRecommendations(patterns, elementalBalance, archetypalState);

    return {
      patterns,
      elementalBalance,
      archetypalState,
      spiralPhase,
      recommendations,
      timestamp: new Date().toISOString(),
      context
    };
  }

  detectElementalBalance(message) {
    const fireKeywords = ['passion', 'creative', 'energy', 'drive', 'motivation', 'inspiration', 'power', 'action'];
    const waterKeywords = ['emotion', 'feeling', 'flow', 'intuitive', 'healing', 'sensitive', 'depth', 'receptive'];
    const earthKeywords = ['grounded', 'practical', 'stable', 'embodied', 'physical', 'material', 'structure', 'foundation'];
    const airKeywords = ['thought', 'clarity', 'communication', 'mental', 'ideas', 'intellectual', 'wisdom', 'understanding'];
    const aetherKeywords = ['spiritual', 'transcendent', 'unity', 'divine', 'sacred', 'mystical', 'universal', 'consciousness'];

    const countKeywords = (keywords) => {
      return keywords.reduce((count, keyword) => {
        return count + (message.toLowerCase().includes(keyword) ? 1 : 0);
      }, 0) / keywords.length;
    };

    return {
      fire: Math.min(1.0, 0.3 + (0.7 * countKeywords(fireKeywords))),
      water: Math.min(1.0, 0.3 + (0.7 * countKeywords(waterKeywords))),
      earth: Math.min(1.0, 0.3 + (0.7 * countKeywords(earthKeywords))),
      air: Math.min(1.0, 0.3 + (0.7 * countKeywords(airKeywords))),
      aether: Math.min(1.0, 0.3 + (0.7 * countKeywords(aetherKeywords)))
    };
  }

  detectArchetypalState(message, elementalBalance) {
    const { fire, water, earth, air, aether } = elementalBalance;

    const mysticScore = (aether * 0.4) + (water * 0.3) + (air * 0.3);
    const healerScore = (water * 0.4) + (earth * 0.3) + (aether * 0.3);
    const creatorScore = (fire * 0.4) + (air * 0.3) + (earth * 0.3);
    const sageScore = (air * 0.4) + (aether * 0.3) + (earth * 0.3);
    const seekerScore = (fire * 0.3) + (water * 0.2) + (air * 0.2) + (aether * 0.3);

    const scores = { mystic: mysticScore, healer: healerScore, creator: creatorScore, sage: sageScore, seeker: seekerScore };
    const dominantArchetype = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);

    return {
      dominant: dominantArchetype,
      integrationLevel: scores[dominantArchetype],
      scores
    };
  }

  detectSpiralPhase(message, elementalBalance) {
    const challengeKeywords = ['problem', 'difficulty', 'struggle', 'stuck', 'confused', 'overwhelmed', 'challenge'];
    const descentKeywords = ['deep', 'inner', 'shadow', 'healing', 'processing', 'integration', 'transformation'];
    const emergenceKeywords = ['breakthrough', 'clarity', 'insight', 'understanding', 'growth', 'awakening'];
    const integrationKeywords = ['balance', 'harmony', 'wisdom', 'mastery', 'embodiment', 'unity'];

    const countMatches = (keywords) => {
      return keywords.reduce((count, keyword) => {
        return count + (message.toLowerCase().includes(keyword) ? 1 : 0);
      }, 0);
    };

    const challengeCount = countMatches(challengeKeywords);
    const descentCount = countMatches(descentKeywords);
    const emergenceCount = countMatches(emergenceKeywords);
    const integrationCount = countMatches(integrationKeywords);

    if (challengeCount > 0) return { phase: 'call', intensity: Math.min(1.0, challengeCount / 3) };
    if (descentCount > 0) return { phase: 'descent', intensity: Math.min(1.0, descentCount / 3) };
    if (emergenceCount > 0) return { phase: 'emergence', intensity: Math.min(1.0, emergenceCount / 3) };
    if (integrationCount > 0) return { phase: 'integration', intensity: Math.min(1.0, integrationCount / 3) };

    return { phase: 'call', intensity: 0.3 };
  }

  identifyConsciousnessPatterns(message) {
    const patterns = [];
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('consciousness')) patterns.push('consciousness-exploration-active');
    if (lowerMessage.includes('spiritual')) patterns.push('spiritual-development-focus');
    if (lowerMessage.includes('growth')) patterns.push('personal-growth-orientation');
    if (lowerMessage.includes('wisdom')) patterns.push('wisdom-seeking-behavior');
    if (lowerMessage.includes('meditation')) patterns.push('contemplative-practice-active');
    if (lowerMessage.includes('healing')) patterns.push('healing-focus-active');
    if (lowerMessage.includes('creative')) patterns.push('creative-expression-active');

    return patterns.length > 0 ? patterns : ['baseline-consciousness-state'];
  }

  generateRecommendations(patterns, elementalBalance, archetypalState) {
    const recommendations = [];

    // Find dominant element
    const dominantElement = Object.keys(elementalBalance).reduce((a, b) =>
      elementalBalance[a] > elementalBalance[b] ? a : b
    );

    // Element-based recommendations
    switch (dominantElement) {
      case 'fire':
        recommendations.push('Engage creative practices and passion projects');
        break;
      case 'water':
        recommendations.push('Focus on emotional healing and intuitive development');
        break;
      case 'earth':
        recommendations.push('Ground energy through physical practices and embodiment');
        break;
      case 'air':
        recommendations.push('Cultivate mental clarity and communication skills');
        break;
      case 'aether':
        recommendations.push('Deepen spiritual practice and sacred connection');
        break;
    }

    // Archetype-based recommendations
    switch (archetypalState.dominant) {
      case 'mystic':
        recommendations.push('Meditation and contemplative practices');
        break;
      case 'healer':
        recommendations.push('Energy healing and emotional support practices');
        break;
      case 'creator':
        recommendations.push('Creative expression and manifestation work');
        break;
      case 'sage':
        recommendations.push('Study wisdom teachings and share knowledge');
        break;
      case 'seeker':
        recommendations.push('Exploration and adventure-based growth');
        break;
    }

    return recommendations;
  }

  performSpiralogicReading(userId, question) {
    const hexagram = Math.floor(Math.random() * 64) + 1;
    const facets = ['fire-visibility', 'earth-grounding', 'water-depth', 'air-expansion', 'aether-transcendence'];
    const facet = facets[Math.floor(Math.random() * facets.length)];

    const interpretation = `Hexagram ${hexagram} guides you to explore ${facet.replace('-', ' ')} in response to: ${question}`;
    const protocols = this.recommendProtocolsForFacet(facet);

    return {
      hexagram,
      facet,
      interpretation,
      protocols,
      question,
      userId,
      timestamp: new Date().toISOString()
    };
  }

  recommendProtocolsForFacet(facet) {
    const protocolMap = {
      'fire-visibility': ['fire-ignition'],
      'earth-grounding': ['earth-grounding'],
      'water-depth': ['water-flow'],
      'air-expansion': ['air-clarity'],
      'aether-transcendence': ['aether-unity']
    };

    return protocolMap[facet] || ['earth-grounding'];
  }

  start(port = 7777) {
    this.app.listen(port, () => {
      console.log(`🧠 Navigator API running on port ${port}`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
      console.log(`🧠 Analysis endpoint: http://localhost:${port}/api/navigator/analyze`);
      console.log(`🔮 Spiralogic endpoint: http://localhost:${port}/api/navigator/spiralogic`);
      console.log(`⚡ Consciousness computing active`);
    });
  }
}

// Start the service
if (require.main === module) {
  const navigator = new NavigatorAPI();
  navigator.start();
}

module.exports = { NavigatorAPI };