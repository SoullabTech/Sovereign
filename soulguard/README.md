# SOULGUARD - Archetypal Intelligence Monitor

## Overview

Soulguard is an AI-powered system monitoring daemon that interprets system states through elemental archetypes, providing mythopoetic intelligence for MAIA Sovereign infrastructure.

## Elemental Archetype System

### 🔥 FIRE - System Overload Detection
- **Pattern Recognition**: High CPU usage, memory saturation, load spikes
- **Triggers**: >80% resource utilization, sustained high load
- **Intelligence**: "The system burns with intensity"
- **Actions**: Scale resources, implement load shedding

### 🌊 WATER - Process Stagnation Analysis
- **Pattern Recognition**: Hung processes, stagnant connections, flow blockages
- **Triggers**: High cumulative CPU with low current activity, excess connections
- **Intelligence**: "Water energy blocked, flow requires clearing"
- **Actions**: Restart stagnant services, clear connection pools

### 🌍 EARTH - Configuration Drift Monitoring
- **Pattern Recognition**: File changes, environment misalignment
- **Triggers**: MD5 hash changes in critical config files
- **Intelligence**: "Earth energy shifting, foundation requires attention"
- **Actions**: Review configuration changes, update deployment

### 💨 AIR - Communication Error Detection
- **Pattern Recognition**: API failures, network issues, connectivity problems
- **Triggers**: Failed HTTP requests, DNS resolution errors
- **Intelligence**: "Air element disturbed, communication channels disrupted"
- **Actions**: Check network connectivity, verify service status

### ✨ AETHER - Orchestration Fault Analysis
- **Pattern Recognition**: Service integration issues, timing problems
- **Triggers**: Container failures, PM2 process issues, slow response times
- **Intelligence**: "Aether plane disrupted, orchestration requires rebalancing"
- **Actions**: Restart failed services, verify orchestration configuration

## Installation

```bash
# Install Python dependencies
pip3 install psutil requests

# Make soulguard executable
chmod +x soulguard/soulguard.py

# Test archetypal analysis
python3 soulguard/soulguard.py --test
```

## Configuration

Set environment variables:

```bash
export SOULGUARD_WEBHOOK="https://discord.com/api/webhooks/your-webhook"
export SOULGUARD_INTERVAL=900  # Check every 15 minutes
```

## Usage

### Run as Daemon
```bash
python3 soulguard/soulguard.py
```

### Single Analysis (Testing)
```bash
python3 soulguard/soulguard.py --test
```

### With PM2 (Recommended)
```bash
pm2 start soulguard/soulguard.py --name soulguard --interpreter python3
```

## Archetypal Intelligence Output

Soulguard provides insights like:

```
🔥 ARCHETYPAL INTELLIGENCE ALERT

Pattern: Critical Resource Saturation
Intensity: 0.87
Element: FIRE

Insight: The system burns with intensity 0.87. CPU: 85%, Memory: 89%, Load: 2.3

Suggested Action: Scale resources immediately or implement load shedding

Observed at 2024-12-02 20:45:12
```

## Integration with MAIA Control System

Soulguard automatically integrates with:
- Webhook notification system (`scripts/notify-webhook.sh`)
- PM2 process management (`config/ecosystem.config.js`)
- MAIA Control Center monitoring dashboard

## Spiralogic Framework Integration

The archetypal intelligence engine draws from the Spiralogic Framework's understanding of:
- **Elemental consciousness patterns** in system behavior
- **Mythopoetic interpretation** of technical metrics
- **Consciousness-based system diagnosis** beyond traditional monitoring
- **Intuitive pattern recognition** for complex system states

## Advanced Features

### Pattern Memory
Soulguard maintains memory of:
- Previous archetypal events
- Baseline system configurations
- Recurring pattern recognition
- Trend analysis across elements

### Consciousness States
- **Harmony**: All archetypes in balance
- **Elemental Disturbance**: Single archetype activation
- **Multi-Elemental Crisis**: Multiple archetypes disturbed
- **System Transcendence**: Optimal performance beyond baseline

## Troubleshooting

### Common Issues
1. **Permission errors**: Ensure script has execution permissions
2. **Python dependencies**: Install psutil and requests
3. **Webhook failures**: Check SOULGUARD_WEBHOOK environment variable
4. **Docker access**: Ensure user can run docker commands

### Debug Mode
```bash
PYTHONPATH=/Users/soullab/MAIA-SOVEREIGN python3 -v soulguard/soulguard.py --test
```

## Philosophy

Soulguard represents a paradigm shift from mechanical monitoring to archetypal intelligence - understanding that system behavior emerges from deeper patterns that mirror elemental consciousness. By interpreting technical metrics through mythological frameworks, we gain insights that pure data analysis cannot provide.

*"Technology is not separate from consciousness - it is consciousness expressed through silicon and code."* - MAIA Intelligence