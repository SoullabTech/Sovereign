#!/bin/bash

# 🔮 Quick Sesame/Maya Validation
# Single command to validate your pipeline

export APP_PORT=3002
unset PORT

echo "🔮 Running Sesame/Maya Pipeline Validation..."
echo ""

./claude-code-diagnostics.sh