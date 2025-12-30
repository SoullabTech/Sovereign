#!/bin/bash

# Get the actual backend port from the .port file
# Falls back to 3002 if file doesn't exist

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT_FILE="$SCRIPT_DIR/../.port"
DEFAULT_PORT=3002

if [ -f "$PORT_FILE" ]; then
    cat "$PORT_FILE"
else
    echo "$DEFAULT_PORT"
fi