#!/usr/bin/env python3
"""
MAIA Clinical Supervision - Local Transcription Service

Uses faster-whisper for transcription and pyannote for speaker diarization.
All processing is LOCAL for HIPAA compliance - no audio leaves the machine.

Usage:
    python transcriber.py --audio chunk_0001.raw --sample-rate 16000
    python transcriber.py --realtime --ws-url ws://localhost:3001/transcribe
"""

import asyncio
import json
import logging
import os
import sys
import tempfile
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Generator, List, Optional, Tuple

import numpy as np

try:
    from faster_whisper import WhisperModel
except ImportError:
    print("Install faster-whisper: pip install faster-whisper")
    sys.exit(1)

try:
    import soundfile as sf
except ImportError:
    print("Install soundfile: pip install soundfile")
    sys.exit(1)

# Optional: pyannote for speaker diarization
try:
    from pyannote.audio import Pipeline as DiarizationPipeline
    DIARIZATION_AVAILABLE = True
except ImportError:
    DIARIZATION_AVAILABLE = False
    print("Warning: pyannote.audio not available. Speaker diarization disabled.")
    print("Install with: pip install pyannote.audio")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)


@dataclass
class TranscriptSegment:
    """A segment of transcribed speech."""
    speaker: str
    text: str
    start_ms: int
    end_ms: int
    confidence: float
    speaker_confidence: float = 1.0


class LocalTranscriber:
    """
    Local transcription using faster-whisper and pyannote.
    No audio data leaves the machine - fully HIPAA compliant.
    """

    def __init__(
        self,
        whisper_model: str = "base",
        device: str = "auto",
        compute_type: str = "auto",
        enable_diarization: bool = True,
        hf_token: Optional[str] = None
    ):
        """
        Initialize transcriber.

        Args:
            whisper_model: Whisper model size (tiny, base, small, medium, large-v3)
            device: Device to use (auto, cpu, cuda)
            compute_type: Compute type (auto, int8, float16, float32)
            enable_diarization: Whether to enable speaker diarization
            hf_token: HuggingFace token for pyannote (required for diarization)
        """
        self.whisper_model_name = whisper_model
        self.enable_diarization = enable_diarization and DIARIZATION_AVAILABLE

        # Resolve device
        if device == "auto":
            import torch
            device = "cuda" if torch.cuda.is_available() else "cpu"

        if compute_type == "auto":
            compute_type = "float16" if device == "cuda" else "int8"

        logger.info(f"Loading Whisper model '{whisper_model}' on {device} ({compute_type})...")
        self.whisper = WhisperModel(
            whisper_model,
            device=device,
            compute_type=compute_type
        )
        logger.info("Whisper model loaded")

        # Initialize diarization if available and enabled
        self.diarization = None
        if self.enable_diarization:
            if hf_token:
                logger.info("Loading pyannote diarization model...")
                try:
                    self.diarization = DiarizationPipeline.from_pretrained(
                        "pyannote/speaker-diarization-3.1",
                        use_auth_token=hf_token
                    )
                    if device == "cuda":
                        import torch
                        self.diarization.to(torch.device("cuda"))
                    logger.info("Diarization model loaded")
                except Exception as e:
                    logger.warning(f"Failed to load diarization model: {e}")
                    self.enable_diarization = False
            else:
                logger.warning("HuggingFace token required for diarization")
                logger.info("Set HUGGINGFACE_TOKEN env var or pass --hf-token")
                self.enable_diarization = False

    def transcribe_audio(
        self,
        audio: np.ndarray,
        sample_rate: int = 16000,
        language: str = "en"
    ) -> List[TranscriptSegment]:
        """
        Transcribe audio array to text with timestamps.

        Args:
            audio: Audio data as numpy array (float32, mono)
            sample_rate: Sample rate in Hz
            language: Language code

        Returns:
            List of TranscriptSegment with timestamps
        """
        # Resample if needed
        if sample_rate != 16000:
            import librosa
            audio = librosa.resample(audio, orig_sr=sample_rate, target_sr=16000)

        # Run Whisper transcription
        segments, info = self.whisper.transcribe(
            audio,
            language=language,
            word_timestamps=True,
            vad_filter=True
        )

        # Convert to our format
        transcript_segments = []
        for segment in segments:
            transcript_segments.append(TranscriptSegment(
                speaker="unknown",  # Will be filled by diarization
                text=segment.text.strip(),
                start_ms=int(segment.start * 1000),
                end_ms=int(segment.end * 1000),
                confidence=segment.avg_logprob if hasattr(segment, 'avg_logprob') else 0.9
            ))

        # Run diarization if available
        if self.diarization and transcript_segments:
            transcript_segments = self._apply_diarization(audio, transcript_segments)

        return transcript_segments

    def transcribe_file(
        self,
        file_path: str,
        language: str = "en"
    ) -> List[TranscriptSegment]:
        """
        Transcribe audio file.

        Args:
            file_path: Path to audio file (wav, mp3, raw, etc.)
            language: Language code

        Returns:
            List of TranscriptSegment
        """
        path = Path(file_path)

        if path.suffix == '.raw':
            # Assume 16-bit PCM at 16kHz mono
            audio = np.fromfile(file_path, dtype=np.float32)
            sample_rate = 16000
        else:
            audio, sample_rate = sf.read(file_path)

        # Convert to mono if stereo
        if audio.ndim > 1:
            audio = audio.mean(axis=1)

        # Ensure float32
        if audio.dtype != np.float32:
            audio = audio.astype(np.float32)

        return self.transcribe_audio(audio, sample_rate, language)

    def _apply_diarization(
        self,
        audio: np.ndarray,
        segments: List[TranscriptSegment]
    ) -> List[TranscriptSegment]:
        """
        Apply speaker diarization to transcript segments.
        """
        if not self.diarization:
            return segments

        try:
            # Save audio temporarily for pyannote
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
                temp_path = f.name
                sf.write(temp_path, audio, 16000)

            # Run diarization
            diarization = self.diarization(temp_path)

            # Create speaker timeline
            speaker_timeline = []
            for turn, _, speaker in diarization.itertracks(yield_label=True):
                speaker_timeline.append({
                    'speaker': speaker,
                    'start_ms': int(turn.start * 1000),
                    'end_ms': int(turn.end * 1000)
                })

            # Assign speakers to transcript segments
            for segment in segments:
                segment_mid = (segment.start_ms + segment.end_ms) / 2

                # Find overlapping speaker turn
                best_match = None
                best_overlap = 0

                for turn in speaker_timeline:
                    # Calculate overlap
                    overlap_start = max(segment.start_ms, turn['start_ms'])
                    overlap_end = min(segment.end_ms, turn['end_ms'])
                    overlap = max(0, overlap_end - overlap_start)

                    if overlap > best_overlap:
                        best_overlap = overlap
                        best_match = turn['speaker']

                if best_match:
                    segment.speaker = best_match
                    segment.speaker_confidence = best_overlap / (segment.end_ms - segment.start_ms)

            # Clean up
            os.unlink(temp_path)

        except Exception as e:
            logger.error(f"Diarization error: {e}")

        return segments

    def stream_transcribe(
        self,
        audio_chunks: Generator[np.ndarray, None, None],
        sample_rate: int = 16000,
        chunk_duration: float = 30.0
    ) -> Generator[TranscriptSegment, None, None]:
        """
        Stream transcription for real-time processing.

        Args:
            audio_chunks: Generator yielding audio chunks
            sample_rate: Sample rate in Hz
            chunk_duration: Duration of each chunk in seconds

        Yields:
            TranscriptSegment as they are transcribed
        """
        chunk_offset_ms = 0

        for chunk in audio_chunks:
            # Transcribe chunk
            segments = self.transcribe_audio(chunk, sample_rate)

            # Adjust timestamps for chunk offset
            for segment in segments:
                segment.start_ms += chunk_offset_ms
                segment.end_ms += chunk_offset_ms
                yield segment

            chunk_offset_ms += int(chunk_duration * 1000)


def format_transcript(segments: List[TranscriptSegment]) -> str:
    """Format transcript segments for display."""
    lines = []
    current_speaker = None

    for segment in segments:
        # Format timestamp
        start_sec = segment.start_ms / 1000
        minutes = int(start_sec // 60)
        seconds = int(start_sec % 60)
        timestamp = f"[{minutes:02d}:{seconds:02d}]"

        # Add speaker label if changed
        if segment.speaker != current_speaker:
            current_speaker = segment.speaker
            lines.append(f"\n{timestamp} {segment.speaker.upper()}:")

        lines.append(f"  {segment.text}")

    return "\n".join(lines)


async def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description="MAIA Clinical Supervision - Local Transcription",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument(
        "--audio", "-a",
        help="Audio file to transcribe"
    )
    parser.add_argument(
        "--model", "-m",
        default="base",
        choices=["tiny", "base", "small", "medium", "large-v3"],
        help="Whisper model size (default: base)"
    )
    parser.add_argument(
        "--language", "-l",
        default="en",
        help="Language code (default: en)"
    )
    parser.add_argument(
        "--device",
        default="auto",
        choices=["auto", "cpu", "cuda"],
        help="Device to use (default: auto)"
    )
    parser.add_argument(
        "--hf-token",
        default=os.environ.get("HUGGINGFACE_TOKEN"),
        help="HuggingFace token for diarization (or set HUGGINGFACE_TOKEN env)"
    )
    parser.add_argument(
        "--no-diarization",
        action="store_true",
        help="Disable speaker diarization"
    )
    parser.add_argument(
        "--output", "-o",
        help="Output file for transcript JSON"
    )
    parser.add_argument(
        "--format",
        default="text",
        choices=["text", "json"],
        help="Output format (default: text)"
    )

    args = parser.parse_args()

    if not args.audio:
        parser.print_help()
        print("\nError: --audio is required")
        sys.exit(1)

    # Initialize transcriber
    transcriber = LocalTranscriber(
        whisper_model=args.model,
        device=args.device,
        enable_diarization=not args.no_diarization,
        hf_token=args.hf_token
    )

    # Transcribe
    logger.info(f"Transcribing: {args.audio}")
    start_time = time.time()

    segments = transcriber.transcribe_file(args.audio, args.language)

    elapsed = time.time() - start_time
    logger.info(f"Transcription complete in {elapsed:.1f}s")

    # Output
    if args.format == "json":
        output = json.dumps([{
            "speaker": s.speaker,
            "text": s.text,
            "start_ms": s.start_ms,
            "end_ms": s.end_ms,
            "confidence": s.confidence,
            "speaker_confidence": s.speaker_confidence
        } for s in segments], indent=2)
    else:
        output = format_transcript(segments)

    if args.output:
        with open(args.output, 'w') as f:
            f.write(output)
        logger.info(f"Saved to: {args.output}")
    else:
        print("\n" + "="*60)
        print("TRANSCRIPT")
        print("="*60)
        print(output)


if __name__ == "__main__":
    asyncio.run(main())
