#!/bin/bash

# MAIA LabTools + IPP Desktop Launcher
echo "🚀 Launching MAIA LabTools + IPP Desktop App..."
echo ""
echo "📍 Project: MAIA-SOVEREIGN"
echo "🛡️ Features: Guardian Protocol + IPP Clinical Assessment"
echo "📋 Testing: Complete IPP documentation included"
echo ""

# Set development environment
export NODE_ENV=development

# Change to project directory
cd "$(dirname "$0")"

# Launch the desktop app
npm run desktop:dev