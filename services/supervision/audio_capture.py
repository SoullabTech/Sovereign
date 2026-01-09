#!/usr/bin/env python3
"""
MAIA Clinical Supervision - Audio Capture Service

Captures system audio via BlackHole virtual audio device for HIPAA-compliant
clinical supervision. All processing happens locally.

Usage:
    python audio_capture.py --device "BlackHole 2ch" --ws-url ws://localhost:3001/supervision

Prerequisites:
    1. Install BlackHole: brew install blackhole-2ch
    2. Create Multi-Output Device in Audio MIDI Setup (System Audio + BlackHole)
    3. Set Multi-Output as system output
"""

import asyncio
import json
import logging
import os
import signal
import sys
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional

import numpy as np
import sounddevice as sd

try:
    import websockets
except ImportError:
    print("Install websockets: pip install websockets")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)

# Constants
SAMPLE_RATE = 16000  # 16kHz for Whisper
CHANNELS = 1         # Mono
CHUNK_DURATION = 30  # seconds per chunk
BUFFER_DURATION = 1  # seconds per buffer callback
DTYPE = np.float32


class SupervisionAudioCapture:
    """
    Captures system audio and streams to MAIA supervision backend.
    """

    def __init__(
        self,
        device_name: str = "BlackHole 2ch",
        ws_url: str = "ws://localhost:3001/supervision",
        storage_dir: str = "storage/supervision",
        session_id: Optional[str] = None
    ):
        self.device_name = device_name
        self.ws_url = ws_url
        self.storage_dir = Path(storage_dir)
        self.session_id = session_id or f"sup_{uuid.uuid4().hex[:12]}"

        # State
        self.is_recording = False
        self.websocket: Optional[websockets.WebSocketClientProtocol] = None
        self.audio_buffer = []
        self.chunk_index = 0
        self.session_start_time: Optional[float] = None

        # Find device
        self.device_id = self._find_device()

        # Create storage directory
        self.session_dir = self.storage_dir / self.session_id
        self.session_dir.mkdir(parents=True, exist_ok=True)

        logger.info(f"Session ID: {self.session_id}")
        logger.info(f"Storage: {self.session_dir}")

    def _find_device(self) -> int:
        """Find BlackHole device ID."""
        devices = sd.query_devices()

        for i, device in enumerate(devices):
            if self.device_name.lower() in device['name'].lower():
                if device['max_input_channels'] > 0:
                    logger.info(f"Found device: {device['name']} (ID: {i})")
                    return i

        # List available devices
        logger.error(f"Device '{self.device_name}' not found. Available input devices:")
        for i, device in enumerate(devices):
            if device['max_input_channels'] > 0:
                logger.error(f"  [{i}] {device['name']}")

        raise ValueError(f"Audio device '{self.device_name}' not found")

    def _audio_callback(self, indata: np.ndarray, frames: int, time_info, status):
        """Called for each audio buffer."""
        if status:
            logger.warning(f"Audio status: {status}")

        if self.is_recording:
            # Convert to mono if needed and append to buffer
            audio = indata[:, 0] if indata.ndim > 1 else indata.flatten()
            self.audio_buffer.append(audio.copy())

    async def _send_chunk(self, audio_data: np.ndarray, chunk_index: int):
        """Send audio chunk via WebSocket."""
        if not self.websocket:
            return

        try:
            # Calculate timing
            start_ms = chunk_index * CHUNK_DURATION * 1000
            end_ms = start_ms + len(audio_data) / SAMPLE_RATE * 1000

            # Save chunk locally (for backup/replay)
            chunk_path = self.session_dir / f"chunk_{chunk_index:04d}.raw"
            audio_data.tofile(chunk_path)

            # Prepare message
            message = {
                "type": "audio_chunk",
                "session_id": self.session_id,
                "chunk_index": chunk_index,
                "start_ms": int(start_ms),
                "end_ms": int(end_ms),
                "sample_rate": SAMPLE_RATE,
                "channels": CHANNELS,
                "samples": len(audio_data),
                "audio_base64": None,  # We'll send binary separately
                "timestamp": datetime.utcnow().isoformat()
            }

            # Send metadata
            await self.websocket.send(json.dumps(message))

            # Send binary audio data
            await self.websocket.send(audio_data.tobytes())

            logger.info(f"Sent chunk {chunk_index} ({len(audio_data)/SAMPLE_RATE:.1f}s)")

        except Exception as e:
            logger.error(f"Error sending chunk: {e}")

    async def _process_buffer(self):
        """Process accumulated audio buffer into chunks."""
        samples_per_chunk = int(SAMPLE_RATE * CHUNK_DURATION)

        while self.is_recording or len(self.audio_buffer) > 0:
            # Concatenate buffered audio
            if self.audio_buffer:
                total_samples = sum(len(b) for b in self.audio_buffer)

                if total_samples >= samples_per_chunk:
                    # Combine buffers
                    combined = np.concatenate(self.audio_buffer)

                    # Extract chunk
                    chunk = combined[:samples_per_chunk]

                    # Keep remainder
                    remainder = combined[samples_per_chunk:]
                    self.audio_buffer = [remainder] if len(remainder) > 0 else []

                    # Send chunk
                    await self._send_chunk(chunk, self.chunk_index)
                    self.chunk_index += 1

            await asyncio.sleep(0.5)

        # Send final partial chunk
        if self.audio_buffer:
            final_chunk = np.concatenate(self.audio_buffer)
            if len(final_chunk) > SAMPLE_RATE:  # At least 1 second
                await self._send_chunk(final_chunk, self.chunk_index)

    async def _connect_websocket(self):
        """Establish WebSocket connection."""
        try:
            self.websocket = await websockets.connect(
                self.ws_url,
                ping_interval=30,
                ping_timeout=10
            )

            # Send session start
            await self.websocket.send(json.dumps({
                "type": "session_start",
                "session_id": self.session_id,
                "sample_rate": SAMPLE_RATE,
                "channels": CHANNELS,
                "chunk_duration": CHUNK_DURATION,
                "timestamp": datetime.utcnow().isoformat()
            }))

            logger.info(f"Connected to {self.ws_url}")
            return True

        except Exception as e:
            logger.warning(f"WebSocket connection failed: {e}")
            logger.info("Continuing in offline mode (audio saved locally)")
            return False

    async def _receive_messages(self):
        """Handle incoming WebSocket messages (transcripts, insights)."""
        if not self.websocket:
            return

        try:
            async for message in self.websocket:
                data = json.loads(message)
                msg_type = data.get("type")

                if msg_type == "transcript":
                    speaker = data.get("speaker", "unknown")
                    text = data.get("text", "")
                    logger.info(f"[{speaker}] {text}")

                elif msg_type == "insight":
                    insight_type = data.get("insight_type")
                    content = data.get("content")
                    logger.info(f"💡 [{insight_type}] {content}")

                elif msg_type == "error":
                    logger.error(f"Server error: {data.get('message')}")

        except websockets.exceptions.ConnectionClosed:
            logger.info("WebSocket connection closed")
        except Exception as e:
            logger.error(f"Error receiving messages: {e}")

    async def start(self):
        """Start audio capture and streaming."""
        logger.info("Starting clinical supervision capture...")
        logger.info(f"Device: {self.device_name}")
        logger.info(f"Sample rate: {SAMPLE_RATE} Hz")
        logger.info(f"Chunk duration: {CHUNK_DURATION}s")

        # Connect to WebSocket (optional - continues offline if fails)
        await self._connect_websocket()

        # Start recording
        self.is_recording = True
        self.session_start_time = time.time()

        # Start audio stream
        stream = sd.InputStream(
            device=self.device_id,
            channels=CHANNELS,
            samplerate=SAMPLE_RATE,
            dtype=DTYPE,
            blocksize=int(SAMPLE_RATE * BUFFER_DURATION),
            callback=self._audio_callback
        )

        try:
            with stream:
                logger.info("🎙️  Recording... Press Ctrl+C to stop")

                # Run buffer processor and message receiver concurrently
                tasks = [
                    asyncio.create_task(self._process_buffer()),
                ]

                if self.websocket:
                    tasks.append(asyncio.create_task(self._receive_messages()))

                # Wait for interrupt
                await asyncio.gather(*tasks)

        except asyncio.CancelledError:
            pass
        finally:
            await self.stop()

    async def stop(self):
        """Stop capture and clean up."""
        logger.info("Stopping capture...")
        self.is_recording = False

        # Wait for buffer to flush
        await asyncio.sleep(1)

        # Send session end
        if self.websocket:
            try:
                duration_ms = int((time.time() - self.session_start_time) * 1000)
                await self.websocket.send(json.dumps({
                    "type": "session_end",
                    "session_id": self.session_id,
                    "total_chunks": self.chunk_index,
                    "duration_ms": duration_ms,
                    "timestamp": datetime.utcnow().isoformat()
                }))
                await self.websocket.close()
            except Exception as e:
                logger.error(f"Error closing WebSocket: {e}")

        # Save session metadata
        metadata_path = self.session_dir / "metadata.json"
        metadata = {
            "session_id": self.session_id,
            "device": self.device_name,
            "sample_rate": SAMPLE_RATE,
            "channels": CHANNELS,
            "chunk_duration": CHUNK_DURATION,
            "total_chunks": self.chunk_index,
            "duration_seconds": time.time() - self.session_start_time,
            "started_at": datetime.fromtimestamp(self.session_start_time).isoformat(),
            "ended_at": datetime.utcnow().isoformat()
        }

        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)

        logger.info(f"Session saved to {self.session_dir}")
        logger.info(f"Total duration: {metadata['duration_seconds']:.1f}s")
        logger.info(f"Total chunks: {self.chunk_index}")


def list_devices():
    """List available audio input devices."""
    print("\nAvailable audio input devices:\n")
    devices = sd.query_devices()

    for i, device in enumerate(devices):
        if device['max_input_channels'] > 0:
            default = " (default)" if device == sd.query_devices(kind='input') else ""
            print(f"  [{i}] {device['name']}{default}")
            print(f"      Channels: {device['max_input_channels']}, "
                  f"Sample Rate: {device['default_samplerate']}")
    print()


async def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description="MAIA Clinical Supervision Audio Capture",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    # List available devices
    python audio_capture.py --list-devices

    # Start capture with BlackHole
    python audio_capture.py --device "BlackHole 2ch"

    # Start with custom WebSocket URL
    python audio_capture.py --ws-url ws://localhost:3001/supervision

    # Offline mode (just save audio locally)
    python audio_capture.py --offline
        """
    )

    parser.add_argument(
        "--device", "-d",
        default="BlackHole 2ch",
        help="Audio input device name (default: BlackHole 2ch)"
    )
    parser.add_argument(
        "--ws-url", "-w",
        default="ws://localhost:3001/supervision",
        help="WebSocket URL for streaming (default: ws://localhost:3001/supervision)"
    )
    parser.add_argument(
        "--storage", "-s",
        default="storage/supervision",
        help="Storage directory for recordings (default: storage/supervision)"
    )
    parser.add_argument(
        "--session-id",
        help="Custom session ID (default: auto-generated)"
    )
    parser.add_argument(
        "--list-devices", "-l",
        action="store_true",
        help="List available audio devices and exit"
    )
    parser.add_argument(
        "--offline",
        action="store_true",
        help="Run in offline mode (no WebSocket, just save locally)"
    )

    args = parser.parse_args()

    if args.list_devices:
        list_devices()
        return

    # Handle Ctrl+C gracefully
    capture = SupervisionAudioCapture(
        device_name=args.device,
        ws_url="" if args.offline else args.ws_url,
        storage_dir=args.storage,
        session_id=args.session_id
    )

    loop = asyncio.get_event_loop()

    def signal_handler():
        logger.info("\nReceived interrupt signal...")
        capture.is_recording = False

    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, signal_handler)

    await capture.start()


if __name__ == "__main__":
    asyncio.run(main())
