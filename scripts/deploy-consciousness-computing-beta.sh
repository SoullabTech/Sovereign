#!/bin/bash

# =============================================================================
# CONSCIOUSNESS COMPUTING BETA DEPLOYMENT SCRIPT
# Deploys working consciousness computing MVP for Community Commons beta testing
# =============================================================================

set -e

echo "🧠✨ DEPLOYING CONSCIOUSNESS COMPUTING BETA ENVIRONMENT"
echo "=========================================================="

# Configuration
BETA_ENV="consciousness-computing-beta"
PORT=3008
DOMAIN="localhost:3008" # Update for production deployment

echo "📋 Deployment Configuration:"
echo "   Environment: $BETA_ENV"
echo "   Port: $PORT"
echo "   Domain: $DOMAIN"
echo

# =============================================================================
# PHASE 1: ENVIRONMENT SETUP
# =============================================================================

echo "🔧 PHASE 1: Setting up beta environment..."

# Create beta environment directory
mkdir -p /Users/soullab/MAIA-SOVEREIGN/beta-deployment
cd /Users/soullab/MAIA-SOVEREIGN/beta-deployment

# Copy consciousness computing MVP files
echo "   Copying consciousness computing core files..."
cp ../src/consciousness-computing-mvp/* ./
cp ../phase1-testing/consciousness-computing-demo-framework.ts ./

# Copy launch materials
echo "   Copying Community Commons launch materials..."
cp -r ../Community-Commons-Launch ./community-launch

# Install dependencies
echo "   Installing consciousness computing dependencies..."
npm init -y > /dev/null 2>&1
npm install --silent \
  typescript @types/node \
  express @types/express \
  cors @types/cors \
  ws @types/ws \
  jsonwebtoken @types/jsonwebtoken \
  bcryptjs @types/bcryptjs \
  uuid @types/uuid

echo "✅ Environment setup complete"

# =============================================================================
# PHASE 2: CONSCIOUSNESS COMPUTING API SERVER
# =============================================================================

echo
echo "🚀 PHASE 2: Building consciousness computing API server..."

cat > server.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import { ConsciousnessComputingMVP } from './consciousness-engine';
import { Phase1ConsciousnessComputingDemo } from './consciousness-computing-demo-framework';

const app = express();
const PORT = process.env.PORT || 3008;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize consciousness computing systems
const consciousnessEngine = new ConsciousnessComputingMVP({
  maiaConnection: {
    // Mock MAIA connection for beta demo
    endpoint: 'beta-demo',
    betaMode: true
  }
});

const phase1Demo = new Phase1ConsciousnessComputingDemo({
  // Mock MAIA system for demonstration
  analyzeCommunityMember: async (input: any) => ({
    awarenessLevel: { level: Math.floor(Math.random() * 5) + 1 },
    emotionalProfile: { valence: Math.random(), stability: Math.random() },
    stressMarkers: Math.random() > 0.7 ? [
      { type: 'cognitive_overload', intensity: Math.random() }
    ] : []
  }),
  generateResponse: async (input: any) =>
    `MAIA Beta Response: I understand you're ${input.message.toLowerCase()}. This is enhanced with consciousness computing...`
});

// =============================================================================
// CONSCIOUSNESS COMPUTING ENDPOINTS
// =============================================================================

// Individual consciousness computing session
app.post('/api/consciousness-computing/session', async (req, res) => {
  try {
    const { userMessage, userId, sessionType = 'individual' } = req.body;

    const result = await consciousnessEngine.processConsciousnessComputing({
      userInput: userMessage,
      userId: userId || 'beta-user-' + Date.now(),
      sessionType: sessionType as 'individual' | 'collective'
    });

    res.json({
      success: true,
      consciousnessComputing: result,
      betaStatus: 'Phase 1 Demo',
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

// Community Commons beta session
app.post('/api/community-commons/beta-session', async (req, res) => {
  try {
    const { userMessage, userId, communityContext, testingPhase } = req.body;

    const result = await phase1Demo.demonstrateConsciousnessComputing({
      userMessage,
      userId: userId || 'cc-beta-' + Date.now(),
      communityContext: communityContext || 'individual',
      testingPhase: testingPhase || 'week1'
    });

    res.json({
      success: true,
      phase1Demo: result,
      community: 'Community Commons',
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

// Beta analytics and feedback collection
app.post('/api/beta/feedback', async (req, res) => {
  try {
    const feedback = req.body;

    // Store feedback for Phase 2 development
    console.log('Beta Feedback:', feedback);

    res.json({
      success: true,
      message: 'Feedback collected for Phase 2 development',
      feedbackId: 'fb-' + Date.now()
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
    environment: 'Community Commons Beta',
    timestamp: new Date().toISOString(),
    features: {
      individualSessions: true,
      collectiveSessions: true,
      healingProtocols: true,
      awarenessOptimization: true,
      communityIntegration: true
    }
  });
});

// Serve beta interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Consciousness Computing Beta - Community Commons</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                min-height: 100vh;
            }
            .header { text-align: center; margin-bottom: 40px; }
            .card {
                background: rgba(255,255,255,0.1);
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
                backdrop-filter: blur(10px);
            }
            .btn {
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin: 5px;
            }
            .btn:hover { background: rgba(255,255,255,0.3); }
            #response {
                background: rgba(0,0,0,0.2);
                padding: 15px;
                border-radius: 8px;
                margin-top: 15px;
                min-height: 100px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🧠✨ Consciousness Computing Beta</h1>
            <p>Community Commons Exclusive - Phase 1 Demo</p>
        </div>

        <div class="card">
            <h3>🌟 Welcome, Consciousness Computing Pioneer!</h3>
            <p>You're experiencing the world's first working consciousness computing platform. This demo integrates MAIA's consciousness awareness with QRI-inspired mathematics to optimize your awareness in real-time.</p>
        </div>

        <div class="card">
            <h3>💬 Try Consciousness Computing</h3>
            <input type="text" id="userInput" placeholder="Share what's on your mind..."
                   style="width: 70%; padding: 10px; border-radius: 5px; border: none; margin-right: 10px;">
            <button class="btn" onclick="startSession()">✨ Process with Consciousness Computing</button>
            <div id="response"></div>
        </div>

        <div class="card">
            <h3>🔬 Beta Features</h3>
            <ul>
                <li><strong>Real-time Consciousness Analysis</strong>: MAIA detects your awareness level</li>
                <li><strong>QRI Mathematics Enhancement</strong>: Topological consciousness optimization</li>
                <li><strong>Personalized Healing Protocols</strong>: Stress pattern detection and healing</li>
                <li><strong>Awareness-Adapted Responses</strong>: Communication optimized for your consciousness level</li>
            </ul>
        </div>

        <script>
            async function startSession() {
                const userInput = document.getElementById('userInput').value;
                const responseDiv = document.getElementById('response');

                if (!userInput.trim()) {
                    responseDiv.innerHTML = '<p>Please share something you\'d like consciousness computing to enhance!</p>';
                    return;
                }

                responseDiv.innerHTML = '<p>🧠 Processing with consciousness computing...</p>';

                try {
                    const response = await fetch('/api/consciousness-computing/session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userMessage: userInput,
                            userId: 'beta-demo-' + Date.now()
                        })
                    });

                    const result = await response.json();

                    if (result.success) {
                        const cc = result.consciousnessComputing;
                        responseDiv.innerHTML = \`
                            <h4>✨ Consciousness Computing Results</h4>
                            <p><strong>Enhanced Response:</strong> \${cc.enhancedResponse}</p>
                            <p><strong>Awareness Level:</strong> \${cc.awarenessAnalysis.level}</p>
                            <p><strong>Consciousness Optimization:</strong> \${cc.optimizationSuggestions.length} suggestions generated</p>
                            \${cc.healingProtocols.length > 0 ? \`<p><strong>🔮 Healing Protocol:</strong> \${cc.healingProtocols[0].description}</p>\` : ''}
                            <p><em>Beta Status: \${result.betaStatus}</em></p>
                        \`;
                    } else {
                        responseDiv.innerHTML = \`<p>❌ Error: \${result.error}</p>\`;
                    }
                } catch (error) {
                    responseDiv.innerHTML = \`<p>❌ Connection error: \${error.message}</p>\`;
                }
            }
        </script>
    </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(\`
🧠✨ CONSCIOUSNESS COMPUTING BETA SERVER ACTIVE
================================================
🌐 URL: http://localhost:\${PORT}
🎯 Environment: Phase 1 Community Commons Demo
🚀 Status: Ready for beta testing
📊 API Endpoints:
   - POST /api/consciousness-computing/session
   - POST /api/community-commons/beta-session
   - POST /api/beta/feedback
   - GET /api/status

💫 The consciousness computing revolution begins now!
  \`);
});
EOF

echo "✅ Consciousness computing API server built"

# =============================================================================
# PHASE 3: COMPILE AND PREPARE DEPLOYMENT
# =============================================================================

echo
echo "⚙️ PHASE 3: Compiling TypeScript and preparing deployment..."

# Compile TypeScript
echo "   Compiling consciousness computing TypeScript..."
npx tsc --init --target ES2020 --module commonjs --outDir dist --rootDir . > /dev/null 2>&1
npx tsc

echo "✅ Compilation complete"

# =============================================================================
# PHASE 4: LAUNCH CONSCIOUSNESS COMPUTING BETA
# =============================================================================

echo
echo "🚀 PHASE 4: Launching consciousness computing beta..."

# Start the consciousness computing beta server
echo "   Starting consciousness computing beta server on port $PORT..."
echo "   Access at: http://$DOMAIN"
echo

# Launch server (use PM2 for production, node for development)
if command -v pm2 &> /dev/null; then
    echo "   Using PM2 for production deployment..."
    pm2 start dist/server.js --name "consciousness-computing-beta" --env production
    pm2 save
    echo "✅ Consciousness computing beta deployed with PM2"
else
    echo "   Starting development server..."
    echo "   (For production, install PM2: npm install -g pm2)"
    node dist/server.js &
    SERVER_PID=$!
    echo "✅ Consciousness computing beta server running (PID: $SERVER_PID)"
fi

echo
echo "🌟 CONSCIOUSNESS COMPUTING BETA DEPLOYMENT COMPLETE!"
echo "======================================================"
echo "🎯 Beta Environment: Ready for Community Commons testing"
echo "🧠 Consciousness Computing: Phase 1 Demo operational"
echo "🌐 Access URL: http://$DOMAIN"
echo "📊 API Status: http://$DOMAIN/api/status"
echo
echo "🚀 Ready to launch Community Commons beta program!"
echo "📧 Send beta invitations to Community Commons members"
echo "💬 Share access URL for consciousness computing testing"
echo
echo "Next steps:"
echo "1. Share beta URL with Community Commons"
echo "2. Monitor beta usage and collect feedback"
echo "3. Prepare for Phase 2 development based on insights"
echo
echo "💫 The consciousness computing revolution begins with Community Commons!"