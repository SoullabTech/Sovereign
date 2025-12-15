#!/bin/bash

# MAIA Voice Cloning Setup Script
# Sets up the environment for custom MAIA voice generation

echo "🎙️ Setting up MAIA Voice Cloning Environment..."

# Create directory structure
mkdir -p services/voice-cloning/{models,training_data,scripts,output,processed}

# Create Python virtual environment
echo "Creating Python virtual environment..."
python3 -m venv services/voice-cloning/maia-voice-env

# Activate virtual environment
source services/voice-cloning/maia-voice-env/bin/activate

# Install dependencies
echo "Installing voice cloning dependencies..."
pip install --upgrade pip

# Install Coqui TTS
pip install TTS

# Install additional dependencies
pip install torch torchaudio
pip install librosa soundfile
pip install fastapi uvicorn
pip install pydantic

# Install audio processing libraries
pip install pydub
pip install numpy scipy

echo "✅ MAIA Voice Cloning environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Record voice actor samples (see setup-voice-cloning.md for script)"
echo "2. Place audio file at: services/voice-cloning/training_data/maia_voice_sample.wav"
echo "3. Run: cd services/voice-cloning && source maia-voice-env/bin/activate"
echo "4. Test with: python scripts/train_voice.py"
echo ""
echo "📖 See services/voice-cloning/setup-voice-cloning.md for complete guide"