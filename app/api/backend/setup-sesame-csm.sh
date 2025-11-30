#!/bin/bash

# setup-sesame-csm.sh - Setup script for Sesame CSM integration

echo "🌀 Setting up Sesame CSM for AIN Oracle Voice System"
echo "==================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the backend directory"
    exit 1
fi

# Create external directory if it doesn't exist
echo "📁 Creating external directory..."
mkdir -p external

# Check if CSM directory already exists
if [ -d "external/csm" ]; then
    echo "⚠️  CSM directory already exists. Updating..."
    cd external/csm
    git pull
    cd ../..
else
    echo "📦 Cloning Sesame CSM repository..."
    cd external
    git clone https://github.com/SesameAILabs/csm.git
    cd ..
fi

# Check Python version
echo "🐍 Checking Python version..."
python3 --version
if [ $? -ne 0 ]; then
    echo "❌ Python 3 not found. Please install Python 3.10+"
    exit 1
fi

# Check if pip is available
echo "📦 Checking pip..."
python3 -m pip --version
if [ $? -ne 0 ]; then
    echo "❌ pip not found. Please install pip"
    exit 1
fi

# Create and activate virtual environment
echo "📦 Setting up Python virtual environment..."
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
source .venv/bin/activate
echo "✅ Virtual environment activated"

# Install Python dependencies in virtual environment
echo "📦 Installing Python dependencies..."
python -m pip install torch torchaudio transformers

# Check for CUDA/MPS
echo "🔧 Checking device support..."
python -c "
import torch
print(f'CUDA available: {torch.cuda.is_available()}')
if hasattr(torch.backends, 'mps'):
    print(f'MPS available: {torch.backends.mps.is_available()}')
else:
    print('MPS not available (older PyTorch)')
"

# Check for ffmpeg
echo "🎵 Checking ffmpeg..."
ffmpeg -version > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "⚠️  ffmpeg not found. Installing..."

    # Try different package managers
    if command -v brew >/dev/null 2>&1; then
        echo "Installing ffmpeg via Homebrew..."
        brew install ffmpeg
    elif command -v apt-get >/dev/null 2>&1; then
        echo "Installing ffmpeg via apt..."
        sudo apt-get update && sudo apt-get install -y ffmpeg
    elif command -v yum >/dev/null 2>&1; then
        echo "Installing ffmpeg via yum..."
        sudo yum install -y ffmpeg
    else
        echo "❌ Could not install ffmpeg automatically. Please install manually."
        echo "Visit: https://ffmpeg.org/download.html"
    fi
else
    echo "✅ ffmpeg found"
fi

# Verify our voice wrapper exists
echo "🔧 Checking voice wrapper..."
if [ -f "external/csm/voiceWrapper.py" ]; then
    echo "✅ Voice wrapper found"
else
    echo "⚠️  Voice wrapper not found. It should have been created by Claude."
    echo "Please ensure external/csm/voiceWrapper.py exists."
fi

# Test the setup
echo "🧪 Testing basic setup..."
if [ -f "external/csm/voiceWrapper.py" ]; then
    echo "Testing Python imports..."
    python -c "
import torch
from transformers import AutoProcessor
print('✅ Basic imports successful')
print(f'PyTorch version: {torch.__version__}')
"

    if [ $? -eq 0 ]; then
        echo "✅ Setup appears successful!"
    else
        echo "❌ Import test failed. Check dependencies."
    fi
else
    echo "⚠️  Skipping test - voice wrapper not found"
fi

# Create test outputs directory
echo "📁 Creating test outputs directory..."
mkdir -p test_outputs

# Set environment variable reminder
echo ""
echo "🌟 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Set environment variable: export USE_SESAME=true"
echo "2. Test basic voices: node testElementalVoices.js --basic"
echo "3. Test Matrix Oracle: node testElementalVoices.js --matrix"
echo "4. Test everything: node testElementalVoices.js --all"
echo ""
echo "Voice profiles configured:"
echo "- Matrix Oracle (warm, wise, knowing)"
echo "- Fire Agent (energetic, passionate)"
echo "- Water Agent (deep, flowing)"
echo "- Earth Agent (grounded, stable)"
echo "- Air Agent (clear, insightful)"
echo "- Aether Agent (transcendent, unified)"
echo "- Shadow Agent (honest, penetrating)"
echo ""
echo "🎭 The Oracle awaits your voice!"