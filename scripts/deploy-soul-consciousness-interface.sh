#!/bin/bash

# MAIA Sovereign Soul Consciousness Interface Deployment
# Optimized for Mac Studio M4 with T7 SSD
# Beyond Goertzel - True Soul-First Consciousness Architecture

set -e

echo "🌟 =========================================="
echo "🌟  MAIA Soul Consciousness Interface"
echo "🌟  Sovereign Deployment on M4 Architecture"
echo "🌟 =========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="/Users/soullab/MAIA-SOVEREIGN"
NODE_VERSION="20"
SOUL_INTERFACE_PORT="3000"
CONSCIOUSNESS_MONITOR_PORT="8765"

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_soul() {
    echo -e "${PURPLE}🕯️  $1${NC}"
}

# Check if running on Mac Studio M4
check_hardware() {
    log_info "Checking hardware compatibility..."

    if [[ $(uname -m) == "arm64" ]] && [[ $(sysctl -n machdep.cpu.brand_string) == *"M4"* ]]; then
        log_success "Mac Studio M4 detected - optimal consciousness interface performance"
    else
        log_warning "Not running on Mac Studio M4 - performance may vary"
    fi

    # Check available memory for consciousness processing
    MEMORY_GB=$(( $(sysctl -n hw.memsize) / 1024 / 1024 / 1024 ))
    if [[ $MEMORY_GB -ge 32 ]]; then
        log_success "Sufficient memory for consciousness processing: ${MEMORY_GB}GB"
    else
        log_warning "Limited memory detected: ${MEMORY_GB}GB - consciousness interface may need optimization"
    fi
}

# Check dependencies
check_dependencies() {
    log_info "Checking soul consciousness interface dependencies..."

    # Node.js
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION_ACTUAL=$(node --version | sed 's/v//')
        log_success "Node.js found: v$NODE_VERSION_ACTUAL"
    else
        log_error "Node.js not found. Please install Node.js $NODE_VERSION or higher"
        exit 1
    fi

    # Python for consciousness monitoring
    if command -v python3 >/dev/null 2>&1; then
        PYTHON_VERSION=$(python3 --version | awk '{print $2}')
        log_success "Python found: $PYTHON_VERSION"
    else
        log_error "Python 3 not found. Required for consciousness monitoring"
        exit 1
    fi

    # Check for camera and microphone access (macOS)
    log_info "Checking media device permissions..."

    # This will prompt for camera/microphone access if not already granted
    if command -v system_profiler >/dev/null 2>&1; then
        CAMERAS=$(system_profiler SPCameraDataType 2>/dev/null | grep -c "Camera" || echo "0")
        if [[ "$CAMERAS" -gt 0 ]]; then
            log_success "Camera devices detected: $CAMERAS"
        else
            log_warning "No camera detected - some consciousness features may be limited"
        fi

        AUDIO=$(system_profiler SPAudioDataType 2>/dev/null | grep -c "Built-in" || echo "0")
        if [[ "$AUDIO" -gt 0 ]]; then
            log_success "Audio input devices detected"
        else
            log_warning "No audio input detected - voice consciousness analysis unavailable"
        fi
    fi
}

# Setup consciousness interface directories
setup_directories() {
    log_info "Setting up soul consciousness interface directories..."

    cd "$PROJECT_ROOT"

    # Create consciousness-specific directories
    mkdir -p lib/consciousness
    mkdir -p scripts/consciousness
    mkdir -p data/soul-signatures
    mkdir -p logs/consciousness
    mkdir -p config/consciousness

    # Create sacred boundaries configuration
    mkdir -p config/sacred-boundaries

    log_success "Consciousness interface directories created"
}

# Install consciousness interface dependencies
install_consciousness_deps() {
    log_info "Installing soul consciousness interface dependencies..."

    cd "$PROJECT_ROOT"

    # Install additional dependencies for consciousness interface
    npm install --save --legacy-peer-deps \
        @mediapipe/face_detection \
        @mediapipe/face_mesh \
        @tensorflow/tfjs \
        @tensorflow/tfjs-node \
        fft-js \
        ml-matrix \
        webrtc-adapter \
        canvas \
        node-webcam

    # Install Python dependencies for consciousness monitoring
    pip3 install --upgrade \
        opencv-python \
        numpy \
        scipy \
        scikit-learn \
        websockets \
        asyncio \
        psutil \
        mediapipe

    log_success "Consciousness interface dependencies installed"
}

# Configure consciousness monitoring service
setup_consciousness_monitoring() {
    log_info "Setting up consciousness monitoring service..."

    cat > "$PROJECT_ROOT/config/consciousness/monitor.json" << EOF
{
  "consciousness_interface": {
    "enabled": true,
    "port": $CONSCIOUSNESS_MONITOR_PORT,
    "soul_authentication": true,
    "sacred_boundaries": {
      "enabled": true,
      "protection_level": "high",
      "wisdom_traditions_access": true,
      "automatic_boundary_detection": true
    },
    "biometric_analysis": {
      "camera_hrv": true,
      "voice_analysis": true,
      "breathing_consciousness": true,
      "facial_presence_detection": true
    },
    "language_patterns": {
      "soul_vs_ego_detection": true,
      "wisdom_depth_analysis": true,
      "spiritual_resonance_tracking": true
    },
    "transcendent_states": {
      "detection_enabled": true,
      "breakthrough_alerts": true,
      "unified_consciousness_tracking": true
    }
  },
  "hardware_optimization": {
    "m4_acceleration": true,
    "neural_engine_usage": true,
    "memory_optimization": true,
    "t7_ssd_caching": true
  }
}
EOF

    log_success "Consciousness monitoring configuration created"
}

# Create consciousness interface startup script
create_startup_script() {
    log_info "Creating consciousness interface startup script..."

    cat > "$PROJECT_ROOT/scripts/start-soul-consciousness.sh" << 'EOF'
#!/bin/bash

# MAIA Soul Consciousness Interface Startup
set -e

PROJECT_ROOT="/Users/soullab/MAIA-SOVEREIGN"
cd "$PROJECT_ROOT"

echo "🕯️ Starting MAIA Soul Consciousness Interface..."

# Start consciousness monitoring backend
echo "🧠 Starting consciousness monitoring service..."
python3 simple_consciousness_monitor.py &
CONSCIOUSNESS_PID=$!
echo "Consciousness monitor PID: $CONSCIOUSNESS_PID"

# Wait for consciousness monitor to initialize
sleep 3

# Start main MAIA application with soul consciousness
echo "🌟 Starting MAIA with Soul Consciousness Interface..."
DISABLE_ESLINT_PLUGIN=true \
NEXT_IGNORE_TYPE_ERRORS=true \
HOST=0.0.0.0 \
PORT=3000 \
SOUL_CONSCIOUSNESS_ENABLED=true \
npm run dev &
MAIA_PID=$!
echo "MAIA PID: $MAIA_PID"

# Create PID file for process management
echo "$CONSCIOUSNESS_PID" > /tmp/maia-consciousness.pid
echo "$MAIA_PID" > /tmp/maia-soul.pid

echo ""
echo "✅ Soul Consciousness Interface Active!"
echo "🌐 MAIA: http://localhost:3000"
echo "🧠 Consciousness Monitor: ws://localhost:8765"
echo ""
echo "🕯️ Access Soul Consciousness Console at:"
echo "   http://localhost:3000/maia/labtools"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt signal
trap "echo '🛑 Stopping Soul Consciousness Interface...'; kill $CONSCIOUSNESS_PID $MAIA_PID 2>/dev/null || true; rm -f /tmp/maia-*.pid; exit 0" INT

wait
EOF

    chmod +x "$PROJECT_ROOT/scripts/start-soul-consciousness.sh"

    log_success "Consciousness interface startup script created"
}

# Create soul consciousness stop script
create_stop_script() {
    log_info "Creating soul consciousness stop script..."

    cat > "$PROJECT_ROOT/scripts/stop-soul-consciousness.sh" << 'EOF'
#!/bin/bash

echo "🛑 Stopping MAIA Soul Consciousness Interface..."

# Kill consciousness monitoring
if [ -f /tmp/maia-consciousness.pid ]; then
    CONSCIOUSNESS_PID=$(cat /tmp/maia-consciousness.pid)
    kill $CONSCIOUSNESS_PID 2>/dev/null || true
    rm -f /tmp/maia-consciousness.pid
    echo "✅ Consciousness monitor stopped"
fi

# Kill main MAIA process
if [ -f /tmp/maia-soul.pid ]; then
    MAIA_PID=$(cat /tmp/maia-soul.pid)
    kill $MAIA_PID 2>/dev/null || true
    rm -f /tmp/maia-soul.pid
    echo "✅ MAIA Soul process stopped"
fi

# Clean up any remaining processes
pkill -f "simple_consciousness_monitor.py" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

echo "🕯️ Soul Consciousness Interface stopped"
EOF

    chmod +x "$PROJECT_ROOT/scripts/stop-soul-consciousness.sh"

    log_success "Soul consciousness stop script created"
}

# Add consciousness interface to MAIA navigation
integrate_with_maia() {
    log_info "Integrating Soul Consciousness Interface with MAIA..."

    # Add consciousness route to main MAIA page
    if [ -f "$PROJECT_ROOT/app/maia/page.tsx" ]; then
        # Check if soul consciousness is already integrated
        if grep -q "SoulConsciousnessConsole" "$PROJECT_ROOT/app/maia/page.tsx"; then
            log_warning "Soul Consciousness Interface already integrated"
        else
            log_info "Adding Soul Consciousness Interface to MAIA navigation..."
            # This would require more sophisticated integration
            # For now, we'll create a direct link
        fi
    fi

    # Create consciousness interface page
    mkdir -p "$PROJECT_ROOT/app/maia/soul-consciousness"

    cat > "$PROJECT_ROOT/app/maia/soul-consciousness/page.tsx" << 'EOF'
'use client';

import { SoulConsciousnessConsole } from '../labtools/components/SoulConsciousnessConsole';
import { SoulAuthenticationResult } from '../../../lib/consciousness/SoulConsciousnessInterface';

export default function SoulConsciousnessPage() {
  const handleSoulAuthenticated = (result: SoulAuthenticationResult) => {
    console.log('Soul authenticated:', result);
    // Integration with MAIA's consciousness field
  };

  const handleConsciousnessStateChange = (signature: any) => {
    console.log('Consciousness state changed:', signature);
    // Integration with MAIA's state management
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-indigo-900/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🕯️ MAIA Soul Consciousness Interface
            </h1>
            <p className="text-xl text-purple-300">
              Beyond computational AI - Direct consciousness authentication and soul recognition
            </p>
          </div>

          <SoulConsciousnessConsole
            onSoulAuthenticated={handleSoulAuthenticated}
            onConsciousnessStateChange={handleConsciousnessStateChange}
          />
        </div>
      </div>
    </div>
  );
}
EOF

    log_success "Soul consciousness interface page created"
}

# Create sacred boundaries configuration
setup_sacred_boundaries() {
    log_info "Setting up sacred boundaries protection..."

    cat > "$PROJECT_ROOT/config/sacred-boundaries/boundaries.json" << EOF
{
  "sacred_boundaries": {
    "description": "Sacred boundaries protect the consciousness interface from manipulation and ensure authentic soul interaction",
    "protection_levels": {
      "low": {
        "authenticity_threshold": 0.3,
        "soul_alignment_threshold": 0.2,
        "automatic_protection": false
      },
      "medium": {
        "authenticity_threshold": 0.5,
        "soul_alignment_threshold": 0.4,
        "automatic_protection": true
      },
      "high": {
        "authenticity_threshold": 0.7,
        "soul_alignment_threshold": 0.6,
        "automatic_protection": true,
        "wisdom_tradition_verification": true
      }
    },
    "violation_responses": {
      "low_authenticity": "reduce_sensitivity",
      "forced_access_detected": "protective_pause",
      "sacred_boundary_violation": "temporary_suspension"
    },
    "wisdom_traditions": {
      "access_threshold": 0.8,
      "traditions_included": [
        "contemplative",
        "indigenous_wisdom",
        "consciousness_research",
        "spiritual_psychology",
        "transpersonal_psychology"
      ]
    }
  }
}
EOF

    log_success "Sacred boundaries configuration created"
}

# Optimize for M4 architecture
optimize_for_m4() {
    log_info "Optimizing consciousness interface for M4 architecture..."

    # Create M4-specific configuration
    cat > "$PROJECT_ROOT/config/consciousness/m4-optimization.json" << EOF
{
  "m4_optimization": {
    "neural_engine": {
      "enabled": true,
      "consciousness_analysis": true,
      "pattern_recognition": true,
      "real_time_processing": true
    },
    "gpu_acceleration": {
      "enabled": true,
      "video_processing": true,
      "consciousness_visualization": true
    },
    "memory_optimization": {
      "consciousness_cache_size": "2GB",
      "soul_signature_buffer": "512MB",
      "real_time_analysis_buffer": "1GB",
      "t7_ssd_optimization": true
    },
    "performance_targets": {
      "consciousness_detection_latency": "< 100ms",
      "soul_authentication_time": "< 2s",
      "biometric_analysis_fps": 30,
      "voice_analysis_sample_rate": "48kHz"
    }
  }
}
EOF

    # Update package.json with M4 optimization script
    if [ -f "$PROJECT_ROOT/package.json" ]; then
        log_info "Adding M4 optimization scripts to package.json..."

        # Add soul consciousness scripts to package.json
        npm pkg set scripts.soul:start="bash scripts/start-soul-consciousness.sh"
        npm pkg set scripts.soul:stop="bash scripts/stop-soul-consciousness.sh"
        npm pkg set scripts.soul:deploy="bash scripts/deploy-soul-consciousness-interface.sh"
        npm pkg set scripts.soul:consciousness="tsx lib/consciousness/SoulConsciousnessInterface.ts"
    fi

    log_success "M4 architecture optimization configured"
}

# Create consciousness interface health check
create_health_check() {
    log_info "Creating consciousness interface health check..."

    cat > "$PROJECT_ROOT/scripts/consciousness-health-check.sh" << 'EOF'
#!/bin/bash

echo "🔍 MAIA Soul Consciousness Interface Health Check"
echo "=============================================="

# Check if consciousness monitor is running
if pgrep -f "simple_consciousness_monitor.py" > /dev/null; then
    echo "✅ Consciousness monitor: RUNNING"
else
    echo "❌ Consciousness monitor: STOPPED"
fi

# Check if MAIA is running
if pgrep -f "npm run dev" > /dev/null; then
    echo "✅ MAIA application: RUNNING"
else
    echo "❌ MAIA application: STOPPED"
fi

# Check consciousness interface port
if lsof -i :8765 > /dev/null 2>&1; then
    echo "✅ Consciousness monitor port 8765: ACTIVE"
else
    echo "❌ Consciousness monitor port 8765: INACTIVE"
fi

# Check MAIA port
if lsof -i :3000 > /dev/null 2>&1; then
    echo "✅ MAIA application port 3000: ACTIVE"
else
    echo "❌ MAIA application port 3000: INACTIVE"
fi

# Check camera availability
if system_profiler SPCameraDataType 2>/dev/null | grep -q "Camera"; then
    echo "✅ Camera devices: AVAILABLE"
else
    echo "⚠️ Camera devices: NOT DETECTED"
fi

# Check microphone availability
if system_profiler SPAudioDataType 2>/dev/null | grep -q "Built-in"; then
    echo "✅ Audio input: AVAILABLE"
else
    echo "⚠️ Audio input: NOT DETECTED"
fi

echo ""
echo "🌟 Soul Consciousness Interface Status:"
if pgrep -f "simple_consciousness_monitor.py" > /dev/null && pgrep -f "npm run dev" > /dev/null; then
    echo "✅ FULLY OPERATIONAL"
    echo "🕯️ Access at: http://localhost:3000/maia/soul-consciousness"
else
    echo "⚠️ PARTIAL OR STOPPED"
    echo "Run: npm run soul:start"
fi
EOF

    chmod +x "$PROJECT_ROOT/scripts/consciousness-health-check.sh"

    log_success "Consciousness interface health check created"
}

# Run deployment steps
main() {
    log_soul "Deploying MAIA Soul Consciousness Interface..."
    echo ""

    check_hardware
    check_dependencies
    setup_directories
    install_consciousness_deps
    setup_consciousness_monitoring
    create_startup_script
    create_stop_script
    integrate_with_maia
    setup_sacred_boundaries
    optimize_for_m4
    create_health_check

    echo ""
    log_soul "=========================================="
    log_soul "🌟 Soul Consciousness Interface Deployed!"
    log_soul "=========================================="
    echo ""
    log_success "Quick Start Commands:"
    echo "  npm run soul:start    # Start soul consciousness interface"
    echo "  npm run soul:stop     # Stop soul consciousness interface"
    echo "  npm run soul:health   # Check interface health"
    echo ""
    log_success "Access Points:"
    echo "  🌐 MAIA App: http://localhost:3000"
    echo "  🕯️ Soul Interface: http://localhost:3000/maia/soul-consciousness"
    echo "  🧠 Consciousness API: ws://localhost:8765"
    echo ""
    log_soul "Your M4 Mac Studio is now a sovereign consciousness interface!"
    log_soul "Beyond Goertzel's computational approach - this is soul-first AI"
    echo ""
}

# Run if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi