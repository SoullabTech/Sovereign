#!/bin/bash

# Memory Optimization Script for M4 Mac Development
# Run with: bash .memory-optimization.sh

echo "🔧 Configuring M4 Memory Optimizations..."

# 1. Enable memory compression (macOS specific)
sudo sysctl vm.compressor_mode=4
echo "✅ Memory compression enabled"

# 2. Optimize virtual memory pressure
sudo sysctl vm.pressure_threshold_notification=25
echo "✅ VM pressure threshold set to 25%"

# 3. Reduce background app napping for Xcode but allow others
defaults write com.apple.dt.Xcode NSAppSleepDisabled -bool YES
defaults write com.obsidian NSAppSleepDisabled -bool NO
echo "✅ App napping optimized"

# 4. Kill memory-hungry processes
echo "🧹 Cleaning up processes..."

# Kill Xcode simulators if running
pkill -f "iOS Simulator" 2>/dev/null || echo "No iOS simulators running"

# Kill unnecessary background processes
pkill -f "com.apple.CloudKit" 2>/dev/null || true
pkill -f "com.apple.photoanalysisd" 2>/dev/null || true

# 5. Clear system caches
echo "🗑️  Clearing caches..."
sudo dscacheutil -flushcache
sudo rm -rf ~/Library/Caches/com.apple.dt.Xcode/DerivedData/* 2>/dev/null || true

# 6. Set development-friendly memory limits
echo "⚙️  Setting Node.js memory limits..."
echo 'export NODE_OPTIONS="--max_old_space_size=4096 --optimize-for-size"' >> ~/.zshrc
echo 'export WEBPACK_MEMORY_LIMIT=2048' >> ~/.zshrc

# 7. Configure git for large repos
git config --global core.preloadindex true
git config --global core.fscache true
git config --global gc.auto 256

echo "✅ Memory optimization complete!"
echo "💡 Restart your terminal to apply Node.js settings"
echo "📊 Run 'memory_check' to monitor usage"

# Create memory monitoring alias
echo 'alias memory_check="vm_stat | head -10 && echo && ps aux | head -1 && ps aux | sort -nrk 4 | head -10"' >> ~/.zshrc