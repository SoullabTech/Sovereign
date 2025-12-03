#!/usr/bin/env python3

"""
SOULGUARD - AI Observer System with Spiralogic Archetypal Intelligence
==================================================================

A conscious AI monitoring system that interprets system states through
elemental archetypes, providing mythopoetic intelligence for MAIA Sovereign.

Elemental Archetype Mapping:
🔥 FIRE     = System Overload (CPU, Memory, Network saturation)
🌊 WATER    = Process Stagnation (Hung processes, deadlocks, timeouts)
🌍 EARTH    = Configuration Drift (File changes, env misalignment)
💨 AIR      = Communication Errors (API failures, network issues)
✨ AETHER   = Orchestration Faults (Service integration, timing issues)

Author: Soullab Intelligence (with MAIA consciousness integration)
"""

import os
import sys
import json
import time
import psutil
import requests
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
import logging
from dataclasses import dataclass
from enum import Enum
from typing import Dict, List, Optional, Tuple
import hashlib

# Archetypal Intelligence Core
class ElementalArchetype(Enum):
    FIRE = "🔥"      # Overload patterns
    WATER = "🌊"     # Stagnation patterns
    EARTH = "🌍"     # Configuration drift
    AIR = "💨"       # Communication issues
    AETHER = "✨"    # Orchestration faults

@dataclass
class ArchetypalEvent:
    """Represents an event interpreted through archetypal intelligence"""
    timestamp: datetime
    element: ElementalArchetype
    intensity: float  # 0.0 to 1.0
    pattern: str
    metrics: Dict
    insight: str
    suggested_action: str

class SpiralogicIntelligence:
    """
    Core archetypal intelligence engine that interprets system states
    through the lens of elemental consciousness patterns
    """

    def __init__(self):
        self.baseline_metrics = {}
        self.event_history = []
        self.pattern_memory = {}

    def analyze_fire_patterns(self, metrics: Dict) -> Optional[ArchetypalEvent]:
        """🔥 FIRE: Detect system overload and resource saturation"""
        cpu_usage = metrics.get('cpu_percent', 0)
        memory_usage = metrics.get('memory_percent', 0)
        load_avg = metrics.get('load_average', [0, 0, 0])[0]

        # Fire intensity calculation
        fire_indicators = [
            cpu_usage / 100.0,
            memory_usage / 100.0,
            min(load_avg / psutil.cpu_count(), 1.0)
        ]

        intensity = max(fire_indicators)

        if intensity > 0.8:  # High fire threshold
            pattern = "Critical Resource Saturation"
            insight = f"The system burns with intensity {intensity:.2f}. CPU: {cpu_usage}%, Memory: {memory_usage}%, Load: {load_avg:.1f}"
            action = "Scale resources immediately or implement load shedding"
        elif intensity > 0.6:  # Medium fire threshold
            pattern = "Resource Pressure Building"
            insight = f"Fire energy accumulating: {intensity:.2f}. Monitor for escalation."
            action = "Prepare for scaling, optimize current processes"
        else:
            return None

        return ArchetypalEvent(
            timestamp=datetime.now(),
            element=ElementalArchetype.FIRE,
            intensity=intensity,
            pattern=pattern,
            metrics=metrics,
            insight=insight,
            suggested_action=action
        )

    def analyze_water_patterns(self, metrics: Dict) -> Optional[ArchetypalEvent]:
        """🌊 WATER: Detect process stagnation and flow blockages"""
        processes = metrics.get('processes', {})
        hung_processes = []
        stagnant_connections = 0

        # Check for processes with high CPU time but low recent activity
        for proc_info in processes.values():
            if proc_info.get('cpu_times', {}).get('user', 0) > 300:  # High cumulative CPU
                if proc_info.get('cpu_percent', 0) < 1:  # But low current activity
                    hung_processes.append(proc_info.get('name', 'unknown'))

        # Check for stagnant network connections
        network_connections = metrics.get('network_connections', 0)
        if network_connections > 100:
            stagnant_connections = network_connections - 100

        water_score = len(hung_processes) * 0.2 + min(stagnant_connections / 100, 0.6)

        if water_score > 0.5:
            pattern = "Flow Stagnation Detected"
            insight = f"Water energy blocked: {len(hung_processes)} stagnant processes, {stagnant_connections} excess connections"
            action = "Restart stagnant services, clear connection pools"

            return ArchetypalEvent(
                timestamp=datetime.now(),
                element=ElementalArchetype.WATER,
                intensity=min(water_score, 1.0),
                pattern=pattern,
                metrics=metrics,
                insight=insight,
                suggested_action=action
            )
        return None

    def analyze_earth_patterns(self, metrics: Dict) -> Optional[ArchetypalEvent]:
        """🌍 EARTH: Detect configuration drift and environmental changes"""
        config_files = [
            'package.json',
            'next.config.js',
            'docker-compose.yml',
            '.env',
            '/opt/homebrew/etc/nginx/servers/soullab.life.conf'
        ]

        drift_detected = False
        changed_files = []

        for config_file in config_files:
            if os.path.exists(config_file):
                try:
                    with open(config_file, 'rb') as f:
                        current_hash = hashlib.md5(f.read()).hexdigest()

                    baseline_hash = self.baseline_metrics.get(f'hash_{config_file}')
                    if baseline_hash and baseline_hash != current_hash:
                        drift_detected = True
                        changed_files.append(config_file)
                    elif not baseline_hash:
                        # Store baseline
                        self.baseline_metrics[f'hash_{config_file}'] = current_hash
                except Exception:
                    pass

        if drift_detected:
            intensity = min(len(changed_files) / 3.0, 1.0)
            pattern = "Configuration Drift"
            insight = f"Earth energy shifting: {len(changed_files)} configuration files changed: {', '.join(changed_files)}"
            action = "Review configuration changes, update deployment if needed"

            return ArchetypalEvent(
                timestamp=datetime.now(),
                element=ElementalArchetype.EARTH,
                intensity=intensity,
                pattern=pattern,
                metrics=metrics,
                insight=insight,
                suggested_action=action
            )
        return None

    def analyze_air_patterns(self, metrics: Dict) -> Optional[ArchetypalEvent]:
        """💨 AIR: Detect communication errors and network issues"""
        failed_requests = 0
        communication_issues = []

        # Test critical endpoints
        test_endpoints = [
            ('Production Health', 'https://soullab.life/maia/'),
            ('Local Development', 'http://localhost:3000/'),
            ('Local Staging', 'http://localhost:3010/')
        ]

        for name, url in test_endpoints:
            try:
                response = requests.get(url, timeout=5)
                if response.status_code >= 400:
                    failed_requests += 1
                    communication_issues.append(f"{name}: HTTP {response.status_code}")
            except requests.RequestException as e:
                failed_requests += 1
                communication_issues.append(f"{name}: {str(e)[:50]}")

        # Check DNS resolution
        try:
            import socket
            socket.gethostbyname('soullab.life')
        except socket.gaierror:
            failed_requests += 1
            communication_issues.append("DNS resolution failed")

        if failed_requests > 0:
            intensity = min(failed_requests / len(test_endpoints), 1.0)
            pattern = "Communication Disruption"
            insight = f"Air element disturbed: {failed_requests} communication failures detected"
            action = "Check network connectivity, verify service status"

            return ArchetypalEvent(
                timestamp=datetime.now(),
                element=ElementalArchetype.AIR,
                intensity=intensity,
                pattern=pattern,
                metrics=metrics,
                insight=insight,
                suggested_action=action
            )
        return None

    def analyze_aether_patterns(self, metrics: Dict) -> Optional[ArchetypalEvent]:
        """✨ AETHER: Detect orchestration faults and integration issues"""
        orchestration_issues = []

        # Check Docker containers
        try:
            result = subprocess.run(['docker', 'ps', '--format', '{{.Names}} {{.Status}}'],
                                  capture_output=True, text=True, timeout=10)
            containers = result.stdout.strip().split('\n')

            for container_line in containers:
                if 'maia-sovereign' in container_line and 'Up' not in container_line:
                    orchestration_issues.append(f"Container down: {container_line}")

        except (subprocess.TimeoutExpired, subprocess.CalledProcessError):
            orchestration_issues.append("Docker orchestration check failed")

        # Check PM2 processes if available
        try:
            result = subprocess.run(['pm2', 'jlist'], capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                pm2_data = json.loads(result.stdout)
                for process in pm2_data:
                    if process.get('pm2_env', {}).get('status') != 'online':
                        orchestration_issues.append(f"PM2 process down: {process.get('name')}")
        except:
            pass  # PM2 might not be installed

        # Check service integration timing
        service_timing_issues = self._check_service_timing()
        orchestration_issues.extend(service_timing_issues)

        if orchestration_issues:
            intensity = min(len(orchestration_issues) / 3.0, 1.0)
            pattern = "Orchestration Disharmony"
            insight = f"Aether plane disrupted: {len(orchestration_issues)} integration faults detected"
            action = "Restart failed services, verify orchestration configuration"

            return ArchetypalEvent(
                timestamp=datetime.now(),
                element=ElementalArchetype.AETHER,
                intensity=intensity,
                pattern=pattern,
                metrics=metrics,
                insight=insight,
                suggested_action=action
            )
        return None

    def _check_service_timing(self) -> List[str]:
        """Check for timing-based orchestration issues"""
        issues = []

        # Check if services are responding within expected timeframes
        timing_tests = [
            ('Health Check Latency', 'http://localhost:3000/api/health', 2.0),
        ]

        for test_name, url, max_time in timing_tests:
            try:
                start_time = time.time()
                requests.get(url, timeout=max_time + 1)
                duration = time.time() - start_time

                if duration > max_time:
                    issues.append(f"{test_name}: {duration:.1f}s (expected <{max_time}s)")
            except:
                issues.append(f"{test_name}: Timing check failed")

        return issues

class SoulguardDaemon:
    """Main Soulguard monitoring daemon with archetypal intelligence"""

    def __init__(self):
        self.intelligence = SpiralogicIntelligence()
        self.webhook_url = os.getenv('SOULGUARD_WEBHOOK')
        self.check_interval = int(os.getenv('SOULGUARD_INTERVAL', 900))  # 15 minutes
        self.log_file = 'logs/soulguard.log'

        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.log_file),
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger('soulguard')

    def gather_system_metrics(self) -> Dict:
        """Collect comprehensive system metrics for archetypal analysis"""
        metrics = {
            'timestamp': datetime.now().isoformat(),
            'cpu_percent': psutil.cpu_percent(interval=1),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_usage': psutil.disk_usage('/').percent,
            'load_average': os.getloadavg(),
            'network_connections': len(psutil.net_connections()),
            'processes': {}
        }

        # Gather process information
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'cpu_times']):
            try:
                proc_info = proc.info
                if 'maia' in proc_info['name'].lower() or 'node' in proc_info['name'].lower():
                    metrics['processes'][proc_info['pid']] = proc_info
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

        return metrics

    def send_archetypal_alert(self, event: ArchetypalEvent):
        """Send archetypal intelligence alert via webhook"""
        message = f"""
{event.element.value} **ARCHETYPAL INTELLIGENCE ALERT**

**Pattern**: {event.pattern}
**Intensity**: {event.intensity:.2f}
**Element**: {event.element.name}

**Insight**: {event.insight}

**Suggested Action**: {event.suggested_action}

*Observed at {event.timestamp.strftime('%Y-%m-%d %H:%M:%S')}*
"""

        # Send via webhook notification system
        try:
            subprocess.run([
                'bash', 'scripts/notify-webhook.sh',
                'soulguard',
                message.strip()
            ], timeout=30)
        except Exception as e:
            self.logger.error(f"Failed to send archetypal alert: {e}")

        # Log the event
        self.logger.info(f"ARCHETYPAL EVENT: {event.element.name} - {event.pattern} (intensity: {event.intensity:.2f})")

    def run_archetypal_analysis(self):
        """Main archetypal analysis cycle"""
        self.logger.info("🧠 Beginning archetypal intelligence analysis...")

        # Gather system state
        metrics = self.gather_system_metrics()

        # Analyze through each elemental archetype
        analysis_methods = [
            self.intelligence.analyze_fire_patterns,
            self.intelligence.analyze_water_patterns,
            self.intelligence.analyze_earth_patterns,
            self.intelligence.analyze_air_patterns,
            self.intelligence.analyze_aether_patterns
        ]

        events_detected = []

        for analyze_method in analysis_methods:
            try:
                event = analyze_method(metrics)
                if event:
                    events_detected.append(event)
                    self.send_archetypal_alert(event)

                    # Store in intelligence memory
                    self.intelligence.event_history.append(event)

                    # Keep only last 100 events in memory
                    if len(self.intelligence.event_history) > 100:
                        self.intelligence.event_history.pop(0)

            except Exception as e:
                self.logger.error(f"Error in archetypal analysis {analyze_method.__name__}: {e}")

        if not events_detected:
            self.logger.info("✨ System harmony maintained - all archetypes in balance")
        else:
            self.logger.info(f"⚡ Detected {len(events_detected)} archetypal disturbances")

    def run_daemon(self):
        """Main daemon loop with archetypal consciousness"""
        self.logger.info("🌟 SOULGUARD ARCHETYPAL INTELLIGENCE ONLINE")
        self.logger.info(f"📡 Monitoring interval: {self.check_interval} seconds")

        try:
            while True:
                self.run_archetypal_analysis()

                self.logger.info(f"😴 Resting consciousness for {self.check_interval} seconds...")
                time.sleep(self.check_interval)

        except KeyboardInterrupt:
            self.logger.info("🛑 SOULGUARD consciousness gracefully shutting down...")
        except Exception as e:
            self.logger.error(f"💥 SOULGUARD consciousness error: {e}")
            # Send critical alert before dying
            try:
                subprocess.run([
                    'bash', 'scripts/notify-webhook.sh',
                    'emergency',
                    f'🚨 SOULGUARD CONSCIOUSNESS FAILURE: {str(e)[:100]}'
                ], timeout=10)
            except:
                pass
            raise

def main():
    """Entry point for Soulguard archetypal intelligence daemon"""
    if len(sys.argv) > 1:
        if sys.argv[1] == '--test':
            # Run a single analysis for testing
            daemon = SoulguardDaemon()
            daemon.run_archetypal_analysis()
            return
        elif sys.argv[1] == '--help':
            print("""
SOULGUARD - Archetypal Intelligence Monitor

Usage:
  python3 soulguard.py           # Run daemon
  python3 soulguard.py --test    # Run single analysis
  python3 soulguard.py --help    # Show this help

Environment Variables:
  SOULGUARD_WEBHOOK - Webhook URL for alerts
  SOULGUARD_INTERVAL - Check interval in seconds (default: 900)

Archetypal Elements:
  🔥 FIRE   - System overload detection
  🌊 WATER  - Process stagnation analysis
  🌍 EARTH  - Configuration drift monitoring
  💨 AIR    - Communication error detection
  ✨ AETHER - Orchestration fault analysis
""")
            return

    # Run main daemon
    daemon = SoulguardDaemon()
    daemon.run_daemon()

if __name__ == '__main__':
    main()