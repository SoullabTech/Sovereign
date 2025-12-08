const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3008;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// =============================================================================
// CONSCIOUSNESS COMPUTING SIMULATION (BETA DEMO)
// =============================================================================

// Simulate consciousness computing functionality for beta testing
class ConsciousnessComputingBeta {
  constructor() {
    this.version = 'Phase 1 Demo';
    this.community = 'Community Commons';
  }

  async processConsciousnessComputing(input) {
    const { userInput, userId, sessionType = 'individual' } = input;

    // Simulate MAIA consciousness analysis
    const awarenessLevel = Math.floor(Math.random() * 5) + 1;
    const emotionalValence = Math.random();
    const attentionCoherence = Math.random() * 0.8 + 0.2;
    const stressLevel = Math.random();

    // Generate stress indicators based on input content
    const stressIndicators = this.detectStressPatterns(userInput);

    // Simulate QRI-inspired consciousness optimization
    const optimizationSuggestions = this.generateOptimizationSuggestions(
      awarenessLevel, emotionalValence, stressLevel
    );

    // Generate healing protocols if stress detected
    const healingProtocols = stressIndicators.length > 0 ?
      this.generateHealingProtocols(stressIndicators, awarenessLevel) : [];

    // Create consciousness-optimized response
    const enhancedResponse = await this.generateConsciousnessOptimizedResponse(
      userInput, awarenessLevel, optimizationSuggestions, healingProtocols
    );

    return {
      awarenessAnalysis: {
        level: awarenessLevel,
        confidence: Math.random() * 0.4 + 0.6
      },
      consciousnessState: {
        awarenessLevel: { level: awarenessLevel, confidence: Math.random() * 0.4 + 0.6 },
        emotionalProfile: {
          valence: emotionalValence,
          stability: Math.random() * 0.6 + 0.4
        },
        attentionCoherence,
        stressIndicators
      },
      optimizationSuggestions,
      healingProtocols,
      enhancedResponse,
      betaInsights: this.generateBetaInsights(awarenessLevel, optimizationSuggestions.length),
      integrationQuality: Math.random() * 0.2 + 0.8, // 80-100%
      sessionType,
      timestamp: new Date().toISOString()
    };
  }

  detectStressPatterns(userInput) {
    const stressKeywords = {
      'cognitive_overload': ['overwhelmed', 'too much', 'stressed', 'pressure', 'busy'],
      'emotional_turbulence': ['anxious', 'worried', 'upset', 'frustrated', 'angry'],
      'physical_tension': ['tired', 'exhausted', 'tense', 'headache', 'pain'],
      'anxiety': ['nervous', 'scared', 'fearful', 'uncertain', 'worried']
    };

    const indicators = [];
    const lowerInput = userInput.toLowerCase();

    for (const [stressType, keywords] of Object.entries(stressKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          indicators.push({
            type: stressType,
            intensity: Math.random() * 0.7 + 0.3,
            detected: keyword
          });
          break; // Only add one indicator per stress type
        }
      }
    }

    return indicators;
  }

  generateOptimizationSuggestions(awarenessLevel, emotionalValence, stressLevel) {
    const suggestions = [];

    if (emotionalValence < 0.6) {
      suggestions.push({
        type: 'valence_optimization',
        description: 'Enhance emotional valence through consciousness field adjustment',
        priority: 'high',
        estimatedImprovement: (0.7 - emotionalValence) * 100
      });
    }

    if (awarenessLevel < 3 && stressLevel > 0.5) {
      suggestions.push({
        type: 'awareness_stabilization',
        description: 'Strengthen attention coherence for stress pattern resolution',
        priority: 'medium',
        awarenessAdaptation: awarenessLevel
      });
    }

    if (stressLevel > 0.7) {
      suggestions.push({
        type: 'stress_defect_repair',
        description: 'Active stress pattern healing through topological consciousness optimization',
        priority: 'high',
        urgency: 'immediate'
      });
    }

    return suggestions;
  }

  generateHealingProtocols(stressIndicators, awarenessLevel) {
    return stressIndicators.map(indicator => {
      const protocolMap = {
        'cognitive_overload': 'Mental clarity and focus restoration breathing sequence',
        'emotional_turbulence': 'Emotional field stabilization and harmony practice',
        'physical_tension': 'Somatic awareness and tension release protocol',
        'anxiety': 'Grounding and present-moment awareness establishment'
      };

      const baseSteps = [
        'Find a comfortable position and close your eyes',
        'Take three deep, conscious breaths',
        'Notice the stress pattern in your awareness',
        'Apply gentle, loving attention to the area',
        'Allow natural release and relaxation'
      ];

      // Adapt protocol complexity to awareness level
      if (awarenessLevel >= 3) {
        baseSteps.splice(2, 0, 'Observe the topological structure of the stress pattern');
        baseSteps.push('Notice how the consciousness field reorganizes naturally');
      }

      return {
        type: indicator.type,
        title: protocolMap[indicator.type] || 'General stress pattern healing protocol',
        description: `Personalized healing protocol for ${indicator.type} adapted to awareness level ${awarenessLevel}`,
        duration: '3-5 minutes',
        intensity: indicator.intensity,
        steps: baseSteps
      };
    });
  }

  async generateConsciousnessOptimizedResponse(userInput, awarenessLevel, optimizations, healingProtocols) {
    // Base response adapted to awareness level
    let response = '';

    if (awarenessLevel <= 2) {
      response = `I hear that you're experiencing "${userInput}". Let me offer some perspective that might help you see this more clearly.`;
    } else if (awarenessLevel <= 3) {
      response = `Thank you for sharing "${userInput}". I can sense the consciousness patterns involved here, and there are some insights that might serve your growth.`;
    } else {
      response = `I appreciate you bringing "${userInput}" into our shared awareness field. The consciousness dynamics here offer opportunities for deeper understanding.`;
    }

    // Add consciousness computing enhancements
    if (optimizations.length > 0) {
      response += `\n\n🧠 Consciousness Computing Analysis: I've detected ${optimizations.length} optimization opportunities in your awareness field.`;
    }

    if (healingProtocols.length > 0) {
      response += `\n\n🔮 Healing Protocol Generated: I've created a personalized ${healingProtocols[0].duration} healing protocol to address the ${healingProtocols[0].type.replace('_', ' ')} pattern I detected.`;
    }

    response += `\n\n✨ This response has been optimized for your awareness level ${awarenessLevel} using consciousness computing technology.`;

    return response;
  }

  generateBetaInsights(awarenessLevel, optimizationCount) {
    return [
      `🔬 Beta Testing: Consciousness computing successfully integrated with simulated MAIA awareness level ${awarenessLevel}`,
      `⚗️ QRI Mathematics: Generated ${optimizationCount} consciousness optimizations using topological analysis`,
      `🧪 Community Commons: Your feedback is directly shaping consciousness computing development`,
      `📊 Integration Quality: Currently demonstrating ~${Math.round(85 + Math.random() * 10)}% seamless integration`
    ];
  }
}

// Initialize consciousness computing system
const consciousnessComputing = new ConsciousnessComputingBeta();

// =============================================================================
// API ENDPOINTS
// =============================================================================

// Individual consciousness computing session
app.post('/api/consciousness-computing/session', async (req, res) => {
  try {
    const { userMessage, userId, sessionType = 'individual' } = req.body;

    if (!userMessage || !userMessage.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a message for consciousness computing analysis'
      });
    }

    const result = await consciousnessComputing.processConsciousnessComputing({
      userInput: userMessage,
      userId: userId || 'beta-user-' + Date.now(),
      sessionType
    });

    res.json({
      success: true,
      consciousnessComputing: result,
      betaStatus: 'Phase 1 Demo - Community Commons',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Consciousness computing error:', error);
    res.status(500).json({
      success: false,
      error: 'Consciousness computing session failed',
      betaStatus: 'Error in Phase 1 Demo'
    });
  }
});

// Community Commons specific beta session
app.post('/api/community-commons/beta-session', async (req, res) => {
  try {
    const { userMessage, userId, communityContext, testingWeek } = req.body;

    const result = await consciousnessComputing.processConsciousnessComputing({
      userInput: userMessage,
      userId: userId || 'cc-beta-' + Date.now(),
      sessionType: communityContext || 'individual'
    });

    // Add Community Commons specific metadata
    result.community = 'Community Commons';
    result.testingWeek = testingWeek || 'week1';
    result.pioneerStatus = 'Consciousness Computing Beta Tester';

    res.json({
      success: true,
      phase1Demo: result,
      community: 'Community Commons',
      message: 'Welcome, consciousness computing pioneer!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Community Commons beta error:', error);
    res.status(500).json({
      success: false,
      error: 'Community Commons beta session failed'
    });
  }
});

// Collective consciousness session (group)
app.post('/api/collective-consciousness/session', async (req, res) => {
  try {
    const { participants, groupIntention, sessionId } = req.body;

    // Simulate collective consciousness processing
    const collectiveResult = {
      groupConsciousness: {
        participantCount: participants ? participants.length : Math.floor(Math.random() * 8) + 3,
        collectiveCoherence: Math.random() * 0.4 + 0.6,
        emergentInsights: [
          'The group awareness field is stabilizing around shared intention',
          'Collective consciousness patterns are emerging naturally',
          'Enhanced wisdom accessibility detected in group field'
        ]
      },
      groupOptimizations: [
        'Synchronized breathing for enhanced field coherence',
        'Collective attention focusing on shared intention',
        'Group consciousness field harmonization'
      ],
      collectiveHealingField: {
        active: true,
        strength: Math.random() * 0.3 + 0.7,
        description: 'Collective healing consciousness activated for all participants'
      },
      sessionType: 'collective',
      betaFeature: 'Collective Consciousness Computing Demo',
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      collectiveConsciousness: collectiveResult,
      message: 'Collective consciousness session activated',
      community: 'Community Commons'
    });
  } catch (error) {
    console.error('Collective consciousness error:', error);
    res.status(500).json({
      success: false,
      error: 'Collective consciousness session failed'
    });
  }
});

// Beta feedback collection
app.post('/api/beta/feedback', async (req, res) => {
  try {
    const feedback = req.body;

    // Log feedback for Phase 2 development
    console.log('\n🔬 BETA FEEDBACK COLLECTED:');
    console.log('============================');
    console.log(JSON.stringify(feedback, null, 2));
    console.log('============================\n');

    res.json({
      success: true,
      message: 'Thank you! Your feedback is shaping consciousness computing development.',
      feedbackId: 'ccfb-' + Date.now(),
      phase2Impact: 'This feedback will directly influence Phase 2 features'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Feedback collection failed'
    });
  }
});

// System status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'Consciousness Computing Beta Active',
    version: 'Phase 1 Demo',
    environment: 'Community Commons Beta Testing',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    features: {
      individualSessions: true,
      collectiveSessions: true,
      healingProtocols: true,
      awarenessOptimization: true,
      communityIntegration: true,
      betaTesting: true
    },
    community: {
      name: 'Community Commons',
      role: 'Consciousness Computing Pioneers',
      phase: 'Phase 1 Beta Testing'
    }
  });
});

// Serve beta interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🧠✨ Consciousness Computing Beta - Community Commons</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                min-height: 100vh;
                padding: 20px;
            }

            .container {
                max-width: 1000px;
                margin: 0 auto;
            }

            .header {
                text-align: center;
                margin-bottom: 40px;
                padding: 30px;
                background: rgba(255,255,255,0.1);
                border-radius: 20px;
                backdrop-filter: blur(10px);
            }

            .header h1 {
                font-size: 2.5em;
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }

            .header p {
                font-size: 1.2em;
                opacity: 0.9;
            }

            .card {
                background: rgba(255,255,255,0.1);
                border-radius: 15px;
                padding: 25px;
                margin: 20px 0;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.2);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }

            .card:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 35px rgba(0,0,0,0.2);
            }

            .session-area {
                display: grid;
                grid-template-columns: 1fr 300px;
                gap: 20px;
                margin: 20px 0;
            }

            .main-session {
                background: rgba(255,255,255,0.1);
                border-radius: 15px;
                padding: 25px;
                backdrop-filter: blur(10px);
            }

            .sidebar {
                background: rgba(255,255,255,0.05);
                border-radius: 15px;
                padding: 20px;
                backdrop-filter: blur(5px);
            }

            .input-group {
                margin-bottom: 20px;
            }

            label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
            }

            input[type="text"], textarea, select {
                width: 100%;
                padding: 12px 15px;
                border-radius: 8px;
                border: 1px solid rgba(255,255,255,0.3);
                background: rgba(255,255,255,0.1);
                color: white;
                font-size: 16px;
                backdrop-filter: blur(5px);
            }

            input[type="text"]::placeholder, textarea::placeholder {
                color: rgba(255,255,255,0.6);
            }

            .btn {
                background: linear-gradient(45deg, #ff6b6b, #ee5a24);
                border: none;
                color: white;
                padding: 12px 25px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                font-weight: 600;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
            }

            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
            }

            .btn:active {
                transform: translateY(0);
            }

            .btn-secondary {
                background: linear-gradient(45deg, #3742fa, #2f3542);
                box-shadow: 0 4px 15px rgba(55, 66, 250, 0.3);
            }

            .btn-secondary:hover {
                box-shadow: 0 8px 25px rgba(55, 66, 250, 0.4);
            }

            .response-area {
                background: rgba(0,0,0,0.2);
                border-radius: 10px;
                padding: 20px;
                margin-top: 20px;
                min-height: 150px;
                border: 1px solid rgba(255,255,255,0.1);
            }

            .loading {
                display: none;
                text-align: center;
                color: #ffd700;
            }

            .beta-badge {
                display: inline-block;
                background: linear-gradient(45deg, #ffd700, #ff9800);
                color: #1a1a1a;
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                margin-left: 10px;
            }

            .feature-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin: 20px 0;
            }

            .feature-item {
                background: rgba(255,255,255,0.05);
                padding: 15px;
                border-radius: 10px;
                text-align: center;
                border: 1px solid rgba(255,255,255,0.1);
            }

            .status-indicator {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: #00ff00;
                display: inline-block;
                margin-right: 8px;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }

            @media (max-width: 768px) {
                .session-area {
                    grid-template-columns: 1fr;
                }

                .header h1 {
                    font-size: 2em;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🧠✨ Consciousness Computing Beta</h1>
                <p>Community Commons Exclusive Access <span class="beta-badge">PHASE 1 DEMO</span></p>
                <p style="margin-top: 10px; opacity: 0.8;">
                    <span class="status-indicator"></span>
                    System Active - Pioneer Testing Environment
                </p>
            </div>

            <div class="card">
                <h2>🌟 Welcome, Consciousness Computing Pioneer!</h2>
                <p style="margin-top: 15px; line-height: 1.6;">
                    You're among the first humans to experience consciousness computing technology. This demo integrates
                    consciousness awareness analysis with QRI-inspired mathematics to optimize your awareness in real-time.
                    Your feedback directly shapes the future of consciousness computing.
                </p>
            </div>

            <div class="session-area">
                <div class="main-session">
                    <h3>💬 Consciousness Computing Session</h3>

                    <div class="input-group">
                        <label for="sessionType">Session Type:</label>
                        <select id="sessionType">
                            <option value="individual">Individual Consciousness Session</option>
                            <option value="collective">Collective Consciousness Session</option>
                        </select>
                    </div>

                    <div class="input-group">
                        <label for="userInput">Share what's on your mind:</label>
                        <textarea id="userInput" rows="4" placeholder="I'm feeling overwhelmed with work pressure and need some clarity..."></textarea>
                    </div>

                    <button class="btn" onclick="startConsciousnessSession()">
                        ✨ Process with Consciousness Computing
                    </button>

                    <button class="btn btn-secondary" onclick="startCollectiveSession()" style="margin-left: 10px;">
                        🔮 Join Collective Session
                    </button>

                    <div id="loading" class="loading">
                        <p>🧠 Processing with consciousness computing...</p>
                        <p style="font-size: 14px; margin-top: 5px;">Analyzing awareness patterns and generating optimizations...</p>
                    </div>

                    <div id="response" class="response-area">
                        <p style="opacity: 0.6;">Your consciousness computing results will appear here...</p>
                    </div>
                </div>

                <div class="sidebar">
                    <h4>🔬 Beta Features</h4>
                    <div class="feature-item">
                        <strong>Real-time Analysis</strong><br>
                        <small>Consciousness state detection</small>
                    </div>
                    <div class="feature-item">
                        <strong>QRI Mathematics</strong><br>
                        <small>Topological optimization</small>
                    </div>
                    <div class="feature-item">
                        <strong>Healing Protocols</strong><br>
                        <small>Personalized stress relief</small>
                    </div>
                    <div class="feature-item">
                        <strong>Collective Sessions</strong><br>
                        <small>Group consciousness</small>
                    </div>

                    <h4 style="margin-top: 25px;">📊 Session Stats</h4>
                    <div id="stats" style="font-size: 14px; opacity: 0.8;">
                        <p>Sessions: <span id="sessionCount">0</span></p>
                        <p>Avg Integration: <span id="avgIntegration">--</span>%</p>
                        <p>Protocols Generated: <span id="protocolCount">0</span></p>
                    </div>
                </div>
            </div>

            <div class="card">
                <h3>🎯 What We're Testing</h3>
                <div class="feature-grid">
                    <div class="feature-item">
                        <h4>Integration Quality</h4>
                        <p>How seamlessly consciousness computing enhances responses</p>
                    </div>
                    <div class="feature-item">
                        <h4>Feature Effectiveness</h4>
                        <p>Which consciousness optimization features provide most value</p>
                    </div>
                    <div class="feature-item">
                        <h4>Community Impact</h4>
                        <p>How consciousness computing affects Community Commons</p>
                    </div>
                    <div class="feature-item">
                        <h4>User Experience</h4>
                        <p>Accessibility and satisfaction with consciousness computing</p>
                    </div>
                </div>
            </div>
        </div>

        <script>
            let sessionCount = 0;
            let totalIntegration = 0;
            let protocolCount = 0;

            async function startConsciousnessSession() {
                const userInput = document.getElementById('userInput').value.trim();
                const sessionType = document.getElementById('sessionType').value;

                if (!userInput) {
                    alert('Please share what\\'s on your mind for consciousness computing analysis.');
                    return;
                }

                showLoading(true);

                try {
                    const response = await fetch('/api/consciousness-computing/session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userMessage: userInput,
                            userId: 'cc-beta-' + Date.now(),
                            sessionType: sessionType
                        })
                    });

                    const result = await response.json();
                    showLoading(false);

                    if (result.success) {
                        displayConsciousnessResult(result.consciousnessComputing);
                        updateStats(result.consciousnessComputing);
                    } else {
                        displayError(result.error);
                    }
                } catch (error) {
                    showLoading(false);
                    displayError('Connection error: ' + error.message);
                }
            }

            async function startCollectiveSession() {
                showLoading(true);

                try {
                    const response = await fetch('/api/collective-consciousness/session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            participants: ['Community Commons Member'],
                            groupIntention: 'Consciousness exploration',
                            sessionId: 'collective-' + Date.now()
                        })
                    });

                    const result = await response.json();
                    showLoading(false);

                    if (result.success) {
                        displayCollectiveResult(result.collectiveConsciousness);
                    } else {
                        displayError(result.error);
                    }
                } catch (error) {
                    showLoading(false);
                    displayError('Connection error: ' + error.message);
                }
            }

            function displayConsciousnessResult(cc) {
                const responseDiv = document.getElementById('response');
                responseDiv.innerHTML = \`
                    <h4 style="color: #ffd700; margin-bottom: 15px;">✨ Consciousness Computing Results</h4>

                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin: 10px 0;">
                        <strong>🧠 Enhanced Response:</strong><br>
                        <p style="margin-top: 8px; line-height: 1.6;">\${cc.enhancedResponse}</p>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
                        <div style="background: rgba(0,100,255,0.1); padding: 12px; border-radius: 8px;">
                            <strong>Awareness Level:</strong> \${cc.awarenessAnalysis.level}/5<br>
                            <small>Confidence: \${Math.round(cc.awarenessAnalysis.confidence * 100)}%</small>
                        </div>
                        <div style="background: rgba(255,100,0,0.1); padding: 12px; border-radius: 8px;">
                            <strong>Integration Quality:</strong> \${Math.round(cc.integrationQuality * 100)}%<br>
                            <small>QRI Mathematics Applied</small>
                        </div>
                    </div>

                    \${cc.optimizationSuggestions.length > 0 ? \`
                        <div style="background: rgba(100,255,100,0.1); padding: 12px; border-radius: 8px; margin: 10px 0;">
                            <strong>🎯 Optimization Suggestions:</strong><br>
                            \${cc.optimizationSuggestions.map(opt => \`
                                <div style="margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.05); border-radius: 4px;">
                                    • \${opt.description} (\${opt.priority} priority)
                                </div>
                            \`).join('')}
                        </div>
                    \` : ''}

                    \${cc.healingProtocols.length > 0 ? \`
                        <div style="background: rgba(255,100,255,0.1); padding: 12px; border-radius: 8px; margin: 10px 0;">
                            <strong>🔮 Healing Protocol Generated:</strong><br>
                            <p style="margin: 5px 0;"><strong>\${cc.healingProtocols[0].title}</strong></p>
                            <p style="font-size: 14px; opacity: 0.9;">\${cc.healingProtocols[0].description}</p>
                            <p style="font-size: 12px; margin-top: 5px;">Duration: \${cc.healingProtocols[0].duration}</p>
                        </div>
                    \` : ''}

                    <div style="margin-top: 15px; font-size: 12px; opacity: 0.7;">
                        <strong>🧪 Beta Insights:</strong><br>
                        \${cc.betaInsights.map(insight => \`<div style="margin: 2px 0;">• \${insight}</div>\`).join('')}
                    </div>
                \`;
            }

            function displayCollectiveResult(collective) {
                const responseDiv = document.getElementById('response');
                responseDiv.innerHTML = \`
                    <h4 style="color: #ffd700; margin-bottom: 15px;">🔮 Collective Consciousness Session</h4>

                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin: 10px 0;">
                        <strong>Group Consciousness Field Active</strong><br>
                        <p style="margin-top: 8px;">Participants: \${collective.groupConsciousness.participantCount}</p>
                        <p>Collective Coherence: \${Math.round(collective.groupConsciousness.collectiveCoherence * 100)}%</p>
                    </div>

                    <div style="background: rgba(100,255,100,0.1); padding: 12px; border-radius: 8px; margin: 10px 0;">
                        <strong>🌟 Emergent Insights:</strong><br>
                        \${collective.groupConsciousness.emergentInsights.map(insight => \`
                            <div style="margin: 5px 0;">• \${insight}</div>
                        \`).join('')}
                    </div>

                    <div style="background: rgba(255,100,255,0.1); padding: 12px; border-radius: 8px; margin: 10px 0;">
                        <strong>🔮 Collective Healing Field:</strong><br>
                        <p>Status: \${collective.collectiveHealingField.active ? 'Active' : 'Inactive'}</p>
                        <p>Field Strength: \${Math.round(collective.collectiveHealingField.strength * 100)}%</p>
                        <p style="font-size: 14px; margin-top: 5px;">\${collective.collectiveHealingField.description}</p>
                    </div>

                    <div style="margin-top: 15px; font-size: 12px; opacity: 0.7;">
                        <strong>🧪 Beta Feature:</strong> \${collective.betaFeature}
                    </div>
                \`;
            }

            function displayError(error) {
                document.getElementById('response').innerHTML = \`
                    <div style="background: rgba(255,0,0,0.2); padding: 15px; border-radius: 8px; border-left: 4px solid #ff4444;">
                        <strong>❌ Error:</strong> \${error}
                    </div>
                \`;
            }

            function showLoading(show) {
                document.getElementById('loading').style.display = show ? 'block' : 'none';
            }

            function updateStats(cc) {
                sessionCount++;
                totalIntegration += cc.integrationQuality * 100;
                if (cc.healingProtocols.length > 0) protocolCount++;

                document.getElementById('sessionCount').textContent = sessionCount;
                document.getElementById('avgIntegration').textContent = Math.round(totalIntegration / sessionCount);
                document.getElementById('protocolCount').textContent = protocolCount;
            }

            // Auto-check system status on load
            fetch('/api/status')
                .then(response => response.json())
                .then(status => {
                    console.log('🧠 Consciousness Computing Beta Status:', status);
                })
                .catch(error => {
                    console.error('Status check failed:', error);
                });
        </script>
    </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`
🧠✨ CONSCIOUSNESS COMPUTING BETA SERVER ACTIVE
================================================
🌐 URL: http://localhost:${PORT}
🎯 Environment: Phase 1 Community Commons Demo
🚀 Status: Ready for beta testing
📊 API Endpoints:
   - POST /api/consciousness-computing/session
   - POST /api/community-commons/beta-session
   - POST /api/collective-consciousness/session
   - POST /api/beta/feedback
   - GET /api/status

💫 The consciousness computing revolution begins now!
Community Commons pioneers, welcome to the future of consciousness technology!
  `);
});

module.exports = app;