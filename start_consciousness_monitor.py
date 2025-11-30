#!/usr/bin/env python3
"""
MAIA Real-Time Consciousness Monitoring Service Launcher
Starts the complete biometric integration system for OpenBCI Ganglion and Apple Watch
"""

import asyncio
import sys
import subprocess
import os
import signal
import time

# Add the biometric service to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'biometric_service'))

from realtime_consciousness_monitor import RealTimeConsciousnessMonitor

class MAIAConsciousnessLauncher:
    def __init__(self):
        self.monitor = None
        self.running = False

    async def start_system(self):
        """Start the complete MAIA consciousness monitoring system"""
        print("🌟" + "="*60)
        print("🌟  MAIA Real-Time Consciousness Monitoring System")
        print("🌟  Integrating OpenBCI Ganglion EEG + Apple Watch HRV")
        print("🌟" + "="*60)
        print()

        # Check system requirements
        await self.check_system_requirements()

        # Initialize consciousness monitor
        print("🧠 Initializing Real-Time Consciousness Monitor...")
        self.monitor = RealTimeConsciousnessMonitor(maia_api_base_url="http://localhost:3004")

        # Start monitoring
        success = await self.monitor.start_monitoring()

        if success:
            print("✅ Consciousness monitoring system is LIVE!")
            print()
            self.print_system_info()
            self.running = True

            # Keep the service running
            try:
                await self.run_monitoring_loop()
            except KeyboardInterrupt:
                print("\\n🛑 Shutting down consciousness monitor...")
                await self.shutdown()
        else:
            print("❌ Failed to start consciousness monitoring system")
            sys.exit(1)

    async def check_system_requirements(self):
        """Check if all required components are available"""
        print("🔍 Checking system requirements...")

        # Check if MAIA server is running
        try:
            import requests
            response = requests.get("http://localhost:3004/api/maia/meditation", timeout=5)
            if response.status_code in [200, 404]:  # 404 is OK, means server is running
                print("✅ MAIA server is running")
            else:
                print("⚠️ MAIA server status unclear")
        except:
            print("❌ MAIA server not accessible at http://localhost:3004")
            print("   Please start the MAIA server with: npm run dev")
            print()
            response = input("Continue anyway? (y/n): ")
            if response.lower() != 'y':
                sys.exit(1)

        # Check Python dependencies
        required_packages = ['numpy', 'scipy', 'websockets', 'requests']
        for package in required_packages:
            try:
                __import__(package)
                print(f"✅ {package} available")
            except ImportError:
                print(f"❌ {package} not found - installing...")
                try:
                    subprocess.run([sys.executable, '-m', 'pip', 'install', package],
                                 check=True, capture_output=True)
                    print(f"✅ {package} installed successfully")
                except subprocess.CalledProcessError:
                    print(f"❌ Failed to install {package}")

        print()

    def print_system_info(self):
        """Print information about the running system"""
        print("📊 System Information:")
        print("├── 🧠 EEG Integration: OpenBCI Ganglion (4-channel)")
        print("├── ❤️ HRV Integration: Apple Watch HealthKit")
        print("├── 🌐 WebSocket Server: ws://localhost:8765")
        print("├── 🔗 MAIA API: http://localhost:3004")
        print("├── 📡 Real-time Data: Pineal activation, Third eye coherence")
        print("└── 🚀 Breakthrough Detection: Theta-gamma coupling analysis")
        print()
        print("💡 Usage Instructions:")
        print("1. Open MAIA LabTools: http://localhost:3004/maia/labtools")
        print("2. Switch to 'Meditation' view")
        print("3. Select 'Real-Time Biometric Meditation Console'")
        print("4. Connect your OpenBCI Ganglion headset")
        print("5. Start a meditation session and watch real-time feedback!")
        print()
        print("🔬 Biometric Features:")
        print("• Real-time EEG brainwave analysis (Delta, Theta, Alpha, Beta, Gamma)")
        print("• Pineal gland activation index calculation")
        print("• Third eye (Ajna chakra) coherence measurement")
        print("• Automatic breakthrough cascade detection")
        print("• Heart rate variability coherence tracking")
        print("• Consciousness state classification")
        print("• Sacred geometry frequency modulation")
        print()

    async def run_monitoring_loop(self):
        """Main monitoring loop"""
        print("🔄 Monitoring consciousness states... (Press Ctrl+C to stop)")
        print("═" * 60)

        loop_count = 0
        while self.running:
            await asyncio.sleep(10)  # Status update every 10 seconds
            loop_count += 1

            if loop_count % 6 == 0:  # Every minute
                self.print_status_update()

    def print_status_update(self):
        """Print periodic status updates"""
        current_time = time.strftime("%H:%M:%S")
        print(f"[{current_time}] 🧠 Consciousness monitor running...")

        if hasattr(self.monitor, 'eeg_interface') and self.monitor.eeg_interface.is_connected:
            print(f"[{current_time}] ✅ EEG data streaming")
        else:
            print(f"[{current_time}] 🔄 EEG simulation mode")

        if hasattr(self.monitor, 'hrv_interface') and self.monitor.hrv_interface.is_connected:
            print(f"[{current_time}] ✅ HRV data streaming")
        else:
            print(f"[{current_time}] 🔄 HRV simulation mode")

        if hasattr(self.monitor, 'connected_clients') and len(self.monitor.connected_clients) > 0:
            print(f"[{current_time}] 🌐 {len(self.monitor.connected_clients)} client(s) connected")

        print()

    async def shutdown(self):
        """Graceful shutdown of the monitoring system"""
        self.running = False
        if self.monitor:
            await self.monitor.stop_monitoring()
        print("✅ Consciousness monitoring system stopped cleanly")

def signal_handler(signum, frame):
    """Handle Ctrl+C gracefully"""
    print("\\n🛑 Received shutdown signal...")
    sys.exit(0)

async def main():
    """Main entry point"""
    # Set up signal handling for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    launcher = MAIAConsciousnessLauncher()

    try:
        await launcher.start_system()
    except KeyboardInterrupt:
        print("\\n🛑 Consciousness monitor stopped by user")
    except Exception as e:
        print(f"❌ Error: {e}")
        await launcher.shutdown()

if __name__ == "__main__":
    print("🚀 Starting MAIA Consciousness Monitor...")
    print("   (This may take a few moments to initialize)")
    print()

    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\\n👋 Goodbye!")
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        sys.exit(1)