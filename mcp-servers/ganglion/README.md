# Ganglion/OpenBCI MCP Server

MCP server for EEG data from OpenBCI Ganglion (4-channel) and Cyton (8/16-channel) boards.
Uses BrainFlow library for device communication and signal processing.

## Tools

| Tool | Description |
|------|-------------|
| `ganglion_connect` | Connect to EEG device |
| `ganglion_disconnect` | Disconnect from device |
| `ganglion_stream_start` | Start data streaming |
| `ganglion_stream_stop` | Stop streaming |
| `ganglion_get_reading` | Get current channel readings |
| `ganglion_get_metrics` | Get consciousness metrics |
| `ganglion_status` | Get device status |

## Consciousness Metrics

Computed from EEG band powers:
- **Focus Score** (0-100): Beta/theta ratio indicator
- **Meditation Score** (0-100): Alpha/beta ratio indicator
- **Band Powers**: Delta, Theta, Alpha, Beta, Gamma
- **Coherence**: Inter-channel phase correlation

## Setup

```bash
cd mcp-servers/ganglion
pip install -r requirements.txt
```

## Usage

Add to MCP config:

```json
{
  "mcpServers": {
    "ganglion": {
      "command": "python3",
      "args": ["/path/to/mcp-servers/ganglion/src/server.py"]
    }
  }
}
```

## Hardware

Tested with:
- OpenBCI Ganglion (4-channel, Bluetooth)
- OpenBCI Cyton (8-channel, USB dongle)

Also supports `synthetic` board type for testing without hardware.

## Simulation Mode

If BrainFlow is not installed, server runs in simulation mode with randomized data.
