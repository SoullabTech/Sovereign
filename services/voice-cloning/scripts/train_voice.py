#!/usr/bin/env python3
"""
MAIA Voice Training Script
Sets up and tests custom MAIA voice using XTTS v2
"""

import os
import sys
import torch
from pathlib import Path

def check_dependencies():
    """Check if all required dependencies are installed"""
    try:
        from TTS.api import TTS
        import librosa
        import soundfile as sf
        print("✅ All dependencies installed successfully")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Run: pip install TTS librosa soundfile")
        return False

def setup_directories():
    """Create necessary directories"""
    base_path = Path(__file__).parent.parent

    directories = [
        "models/xtts_v2",
        "models/custom_maia",
        "training_data/processed",
        "output"
    ]

    for dir_name in directories:
        dir_path = base_path / dir_name
        dir_path.mkdir(parents=True, exist_ok=True)
        print(f"📁 Created directory: {dir_path}")

def validate_audio_sample(audio_path):
    """Validate the voice actor audio sample"""
    if not os.path.exists(audio_path):
        print(f"❌ Audio sample not found: {audio_path}")
        print("Please place your voice actor recording at:")
        print("  services/voice-cloning/training_data/maia_voice_sample.wav")
        return False

    try:
        import librosa

        # Load audio to check properties
        y, sr = librosa.load(audio_path)
        duration = len(y) / sr

        print(f"✅ Audio sample found: {audio_path}")
        print(f"   Duration: {duration:.2f} seconds")
        print(f"   Sample rate: {sr} Hz")

        if duration < 10:
            print("⚠️  Warning: Audio sample is quite short. 30+ seconds recommended.")

        return True

    except Exception as e:
        print(f"❌ Error validating audio: {e}")
        return False

def setup_maia_voice():
    """Setup and test MAIA voice cloning"""
    print("\n🎙️ Initializing MAIA Voice Cloning...")

    # Check dependencies
    if not check_dependencies():
        return False

    # Setup directories
    setup_directories()

    # Check for voice sample
    base_path = Path(__file__).parent.parent
    speaker_wav = base_path / "training_data" / "maia_voice_sample.wav"

    if not validate_audio_sample(speaker_wav):
        return False

    try:
        from TTS.api import TTS

        print("\n🤖 Loading XTTS v2 model...")
        tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
        print("✅ Model loaded successfully")

        # Test phrases for MAIA
        test_phrases = [
            "Hello, I'm MAIA, your consciousness computing partner.",
            "I'm here to support your inner development and sacred work.",
            "Let's explore the depths of awareness together.",
            "Your journey is unique, and I'm honored to accompany you."
        ]

        print(f"\n🎵 Generating test samples with MAIA voice...")

        output_dir = base_path / "output"

        for i, text in enumerate(test_phrases):
            output_file = output_dir / f"maia_test_{i+1}.wav"

            print(f"   Generating: {text[:50]}...")

            tts.tts_to_file(
                text=text,
                speaker_wav=str(speaker_wav),
                language="en",
                file_path=str(output_file)
            )

            print(f"   ✅ Generated: {output_file}")

        print(f"\n🎉 MAIA voice setup complete!")
        print(f"   Test files saved to: {output_dir}")
        print(f"   Listen to the samples to verify voice quality")

        return True

    except Exception as e:
        print(f"❌ Error setting up MAIA voice: {e}")
        return False

def main():
    """Main setup function"""
    print("=" * 60)
    print("🌟 MAIA Voice Cloning Setup")
    print("=" * 60)

    success = setup_maia_voice()

    if success:
        print("\n✨ Next steps:")
        print("1. Listen to generated test samples in output/ directory")
        print("2. If quality is good, start the voice API server:")
        print("   python scripts/voice_api.py")
        print("3. Test the API with: curl http://localhost:8001/health")
        print("4. Integrate with MAIA platform using maia-voice-client.ts")
    else:
        print("\n❌ Setup failed. Please check the errors above.")

    print("\n📖 See setup-voice-cloning.md for detailed documentation")

if __name__ == "__main__":
    main()