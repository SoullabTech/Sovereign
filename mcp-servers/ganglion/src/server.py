#!/usr/bin/env python3
"""
Ganglion/OpenBCI MCP Server for MAIA-SOVEREIGN

Provides EEG data access via MCP protocol using BrainFlow library.
Supports OpenBCI Ganglion (4-channel) and Cyton (8/16-channel) boards.

Tools:
- ganglion_connect: Connect to EEG device
- ganglion_disconnect: Disconnect from device
- ganglion_stream_start: Start data streaming
- ganglion_stream_stop: Stop data streaming
- ganglion_get_reading: Get current EEG reading
- ganglion_get_metrics: Get computed consciousness metrics

Resources:
- ganglion://status: Device connection status
- ganglion://metrics: Current consciousness metrics
"""

import json
import asyncio
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, asdict

try:
    from brainflow.board_shim import BoardShim, BrainFlowInputParams, BoardIds
    from brainflow.data_filter import DataFilter
    BRAINFLOW_AVAILABLE = True
except ImportError:
    BRAINFLOW_AVAILABLE = False
    logging.warning("BrainFlow not installed - running in simulation mode")

import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class EEGReading:
    """Single EEG reading with channel data."""
    timestamp: str
    channels: List[float]  # 4 channels for Ganglion
    accelerometer: Optional[Dict[str, float]] = None


@dataclass
class ConsciousnessMetrics:
    """Computed consciousness metrics from EEG data."""
    focus_score: float       # 0-100
    meditation_score: float  # 0-100
    alpha_power: float       # Alpha band power (8-12 Hz)
    beta_power: float        # Beta band power (12-30 Hz)
    theta_power: float       # Theta band power (4-8 Hz)
    delta_power: float       # Delta band power (0.5-4 Hz)
    gamma_power: float       # Gamma band power (30-100 Hz)
    coherence: float         # Inter-channel coherence
    timestamp: str


class GanglionDevice:
    """Manages connection to Ganglion/OpenBCI device."""

    def __init__(self):
        self.board: Optional[BoardShim] = None
        self.connected = False
        self.streaming = False
        self.board_id = BoardIds.GANGLION_BOARD.value
        self.serial_port = ""
        self.sample_rate = 200  # Ganglion default
        self._data_buffer: List[np.ndarray] = []

    def connect(self, serial_port: str = "/dev/tty.usbserial",
                board_type: str = "ganglion") -> Dict[str, Any]:
        """Connect to EEG device."""
        if self.connected:
            return {"success": True, "message": "Already connected"}

        if not BRAINFLOW_AVAILABLE:
            # Simulation mode
            self.connected = True
            self.serial_port = serial_port
            return {"success": True, "message": "Connected in simulation mode"}

        try:
            # Set board ID based on type
            if board_type == "ganglion":
                self.board_id = BoardIds.GANGLION_BOARD.value
            elif board_type == "cyton":
                self.board_id = BoardIds.CYTON_BOARD.value
            elif board_type == "synthetic":
                self.board_id = BoardIds.SYNTHETIC_BOARD.value

            params = BrainFlowInputParams()
            params.serial_port = serial_port

            self.board = BoardShim(self.board_id, params)
            self.board.prepare_session()
            self.connected = True
            self.serial_port = serial_port
            self.sample_rate = BoardShim.get_sampling_rate(self.board_id)

            return {
                "success": True,
                "message": f"Connected to {board_type}",
                "sample_rate": self.sample_rate
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def disconnect(self) -> Dict[str, Any]:
        """Disconnect from device."""
        if not self.connected:
            return {"success": True, "message": "Not connected"}

        if self.streaming:
            self.stop_stream()

        if self.board and BRAINFLOW_AVAILABLE:
            try:
                self.board.release_session()
            except Exception as e:
                logger.warning(f"Error releasing session: {e}")

        self.connected = False
        self.board = None
        return {"success": True, "message": "Disconnected"}

    def start_stream(self) -> Dict[str, Any]:
        """Start data streaming."""
        if not self.connected:
            return {"success": False, "error": "Not connected"}

        if self.streaming:
            return {"success": True, "message": "Already streaming"}

        if self.board and BRAINFLOW_AVAILABLE:
            try:
                self.board.start_stream()
            except Exception as e:
                return {"success": False, "error": str(e)}

        self.streaming = True
        return {"success": True, "message": "Streaming started"}

    def stop_stream(self) -> Dict[str, Any]:
        """Stop data streaming."""
        if not self.streaming:
            return {"success": True, "message": "Not streaming"}

        if self.board and BRAINFLOW_AVAILABLE:
            try:
                self.board.stop_stream()
            except Exception as e:
                logger.warning(f"Error stopping stream: {e}")

        self.streaming = False
        return {"success": True, "message": "Streaming stopped"}

    def get_reading(self) -> EEGReading:
        """Get current EEG reading."""
        timestamp = datetime.now().isoformat()

        if not self.connected or not self.streaming:
            # Return zeros if not streaming
            return EEGReading(
                timestamp=timestamp,
                channels=[0.0, 0.0, 0.0, 0.0]
            )

        if not BRAINFLOW_AVAILABLE:
            # Simulation: return random data
            channels = list(np.random.randn(4) * 10)  # Simulated microvolts
            return EEGReading(
                timestamp=timestamp,
                channels=channels,
                accelerometer={"x": 0.0, "y": 0.0, "z": 1.0}
            )

        try:
            # Get real data from board
            data = self.board.get_current_board_data(256)  # Last 256 samples
            eeg_channels = BoardShim.get_eeg_channels(self.board_id)

            # Get latest values for each channel
            channels = []
            for ch in eeg_channels[:4]:  # Limit to 4 channels
                if ch < data.shape[0] and data.shape[1] > 0:
                    channels.append(float(data[ch, -1]))
                else:
                    channels.append(0.0)

            # Try to get accelerometer data
            accel = None
            try:
                accel_channels = BoardShim.get_accel_channels(self.board_id)
                if len(accel_channels) >= 3:
                    accel = {
                        "x": float(data[accel_channels[0], -1]),
                        "y": float(data[accel_channels[1], -1]),
                        "z": float(data[accel_channels[2], -1])
                    }
            except Exception:
                pass

            return EEGReading(
                timestamp=timestamp,
                channels=channels,
                accelerometer=accel
            )
        except Exception as e:
            logger.error(f"Error getting reading: {e}")
            return EEGReading(
                timestamp=timestamp,
                channels=[0.0, 0.0, 0.0, 0.0]
            )

    def compute_metrics(self) -> ConsciousnessMetrics:
        """Compute consciousness metrics from EEG data."""
        timestamp = datetime.now().isoformat()

        if not self.connected or not self.streaming:
            return ConsciousnessMetrics(
                focus_score=50.0,
                meditation_score=50.0,
                alpha_power=0.0,
                beta_power=0.0,
                theta_power=0.0,
                delta_power=0.0,
                gamma_power=0.0,
                coherence=0.0,
                timestamp=timestamp
            )

        if not BRAINFLOW_AVAILABLE:
            # Simulation: return varied but realistic values
            return ConsciousnessMetrics(
                focus_score=50 + np.random.randn() * 15,
                meditation_score=50 + np.random.randn() * 15,
                alpha_power=10 + np.random.randn() * 3,
                beta_power=8 + np.random.randn() * 2,
                theta_power=6 + np.random.randn() * 2,
                delta_power=4 + np.random.randn() * 1,
                gamma_power=3 + np.random.randn() * 1,
                coherence=0.5 + np.random.randn() * 0.2,
                timestamp=timestamp
            )

        try:
            # Get 2 seconds of data for analysis
            data = self.board.get_current_board_data(self.sample_rate * 2)
            eeg_channels = BoardShim.get_eeg_channels(self.board_id)

            # Compute band powers for first channel
            if len(eeg_channels) > 0 and data.shape[1] > 0:
                ch_data = data[eeg_channels[0], :]

                # Compute band powers using BrainFlow
                delta = DataFilter.get_band_power(
                    DataFilter.get_psd(ch_data, self.sample_rate, 1)[0],
                    DataFilter.get_psd(ch_data, self.sample_rate, 1)[1],
                    0.5, 4.0
                )
                theta = DataFilter.get_band_power(
                    DataFilter.get_psd(ch_data, self.sample_rate, 1)[0],
                    DataFilter.get_psd(ch_data, self.sample_rate, 1)[1],
                    4.0, 8.0
                )
                alpha = DataFilter.get_band_power(
                    DataFilter.get_psd(ch_data, self.sample_rate, 1)[0],
                    DataFilter.get_psd(ch_data, self.sample_rate, 1)[1],
                    8.0, 12.0
                )
                beta = DataFilter.get_band_power(
                    DataFilter.get_psd(ch_data, self.sample_rate, 1)[0],
                    DataFilter.get_psd(ch_data, self.sample_rate, 1)[1],
                    12.0, 30.0
                )
                gamma = DataFilter.get_band_power(
                    DataFilter.get_psd(ch_data, self.sample_rate, 1)[0],
                    DataFilter.get_psd(ch_data, self.sample_rate, 1)[1],
                    30.0, 100.0
                )

                # Compute focus score (beta/theta ratio)
                focus_score = min(100, max(0, 50 + (beta - theta) * 10))

                # Compute meditation score (alpha/beta ratio)
                meditation_score = min(100, max(0, 50 + (alpha - beta) * 10))

                # Compute coherence (simplified - would need multi-channel)
                coherence = min(1.0, max(0.0, alpha / (alpha + beta + theta + 0.001)))

                return ConsciousnessMetrics(
                    focus_score=float(focus_score),
                    meditation_score=float(meditation_score),
                    alpha_power=float(alpha),
                    beta_power=float(beta),
                    theta_power=float(theta),
                    delta_power=float(delta),
                    gamma_power=float(gamma),
                    coherence=float(coherence),
                    timestamp=timestamp
                )
            else:
                raise ValueError("No valid EEG data")

        except Exception as e:
            logger.error(f"Error computing metrics: {e}")
            return ConsciousnessMetrics(
                focus_score=50.0,
                meditation_score=50.0,
                alpha_power=0.0,
                beta_power=0.0,
                theta_power=0.0,
                delta_power=0.0,
                gamma_power=0.0,
                coherence=0.0,
                timestamp=timestamp
            )

    def get_status(self) -> Dict[str, Any]:
        """Get device status."""
        return {
            "connected": self.connected,
            "streaming": self.streaming,
            "board_type": "ganglion" if self.board_id == BoardIds.GANGLION_BOARD.value else "cyton",
            "serial_port": self.serial_port,
            "sample_rate": self.sample_rate,
            "brainflow_available": BRAINFLOW_AVAILABLE
        }


# Global device instance
device = GanglionDevice()


# MCP Server Implementation
async def handle_tool_call(name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Handle MCP tool calls."""

    if name == "ganglion_connect":
        return device.connect(
            serial_port=arguments.get("serial_port", "/dev/tty.usbserial"),
            board_type=arguments.get("board_type", "ganglion")
        )

    elif name == "ganglion_disconnect":
        return device.disconnect()

    elif name == "ganglion_stream_start":
        return device.start_stream()

    elif name == "ganglion_stream_stop":
        return device.stop_stream()

    elif name == "ganglion_get_reading":
        reading = device.get_reading()
        return asdict(reading)

    elif name == "ganglion_get_metrics":
        metrics = device.compute_metrics()
        return asdict(metrics)

    elif name == "ganglion_status":
        return device.get_status()

    else:
        return {"error": f"Unknown tool: {name}"}


async def handle_resource(uri: str) -> Dict[str, Any]:
    """Handle MCP resource requests."""

    if uri == "ganglion://status":
        return device.get_status()

    elif uri == "ganglion://metrics":
        metrics = device.compute_metrics()
        return asdict(metrics)

    else:
        return {"error": f"Unknown resource: {uri}"}


def get_tools() -> List[Dict[str, Any]]:
    """Return list of available tools."""
    return [
        {
            "name": "ganglion_connect",
            "description": "Connect to Ganglion/OpenBCI EEG device",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "serial_port": {
                        "type": "string",
                        "description": "Serial port path (e.g., /dev/tty.usbserial)"
                    },
                    "board_type": {
                        "type": "string",
                        "enum": ["ganglion", "cyton", "synthetic"],
                        "description": "Type of OpenBCI board"
                    }
                }
            }
        },
        {
            "name": "ganglion_disconnect",
            "description": "Disconnect from EEG device",
            "inputSchema": {"type": "object", "properties": {}}
        },
        {
            "name": "ganglion_stream_start",
            "description": "Start EEG data streaming",
            "inputSchema": {"type": "object", "properties": {}}
        },
        {
            "name": "ganglion_stream_stop",
            "description": "Stop EEG data streaming",
            "inputSchema": {"type": "object", "properties": {}}
        },
        {
            "name": "ganglion_get_reading",
            "description": "Get current EEG channel readings",
            "inputSchema": {"type": "object", "properties": {}}
        },
        {
            "name": "ganglion_get_metrics",
            "description": "Get computed consciousness metrics (focus, meditation, band powers)",
            "inputSchema": {"type": "object", "properties": {}}
        },
        {
            "name": "ganglion_status",
            "description": "Get device connection status",
            "inputSchema": {"type": "object", "properties": {}}
        }
    ]


def get_resources() -> List[Dict[str, Any]]:
    """Return list of available resources."""
    return [
        {
            "uri": "ganglion://status",
            "name": "Device Status",
            "description": "Current device connection status",
            "mimeType": "application/json"
        },
        {
            "uri": "ganglion://metrics",
            "name": "Consciousness Metrics",
            "description": "Current computed consciousness metrics",
            "mimeType": "application/json"
        }
    ]


# Simple stdio-based MCP server
async def main():
    """Run MCP server on stdio."""
    import sys

    logger.info("Ganglion MCP server starting...")

    while True:
        try:
            line = await asyncio.get_event_loop().run_in_executor(
                None, sys.stdin.readline
            )

            if not line:
                break

            request = json.loads(line.strip())
            method = request.get("method", "")
            params = request.get("params", {})
            req_id = request.get("id")

            response = {"jsonrpc": "2.0", "id": req_id}

            if method == "initialize":
                response["result"] = {
                    "protocolVersion": "2024-11-05",
                    "serverInfo": {"name": "ganglion-mcp", "version": "1.0.0"},
                    "capabilities": {"tools": {}, "resources": {}}
                }

            elif method == "tools/list":
                response["result"] = {"tools": get_tools()}

            elif method == "tools/call":
                tool_name = params.get("name", "")
                arguments = params.get("arguments", {})
                result = await handle_tool_call(tool_name, arguments)
                response["result"] = {
                    "content": [{"type": "text", "text": json.dumps(result)}]
                }

            elif method == "resources/list":
                response["result"] = {"resources": get_resources()}

            elif method == "resources/read":
                uri = params.get("uri", "")
                result = await handle_resource(uri)
                response["result"] = {
                    "contents": [{
                        "uri": uri,
                        "mimeType": "application/json",
                        "text": json.dumps(result)
                    }]
                }

            else:
                response["error"] = {"code": -32601, "message": f"Unknown method: {method}"}

            print(json.dumps(response), flush=True)

        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
        except Exception as e:
            logger.error(f"Error processing request: {e}")


if __name__ == "__main__":
    asyncio.run(main())
