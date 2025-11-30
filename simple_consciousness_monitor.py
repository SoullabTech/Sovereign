#!/usr/bin/env python3
"""
Simplified MAIA Real-Time Consciousness Monitor
No heavy dependencies - pure Python biometric simulation for testing
"""

import asyncio
import json
import time
import math
import random
import threading
from typing import Dict, List, Optional, Callable
from dataclasses import dataclass, asdict
from datetime import datetime
import websockets
import requests

@dataclass
class EEGData:
    """Real-time EEG data structure"""
    timestamp: float
    channels: Dict[str, float]
    delta: float
    theta: float
    alpha: float
    beta: float
    gamma: float
    pineal_activation_index: float
    third_eye_coherence: float
    consciousness_state: str

@dataclass
class HRVData:
    """Heart rate variability data"""
    timestamp: float
    heart_rate: float
    hrv_coherence: float
    stress_level: float
    meditation_readiness: float

@dataclass
class ConsciousnessMetrics:
    """Combined consciousness metrics"""
    timestamp: float
    eeg_data: EEGData
    hrv_data: Optional[HRVData]
    overall_coherence: float
    breakthrough_potential: float
    sacred_resonance: float
    field_strength: float
    meditation_depth: str

class SimpleBiometricSimulator:
    """Simplified biometric data simulator"""

    def __init__(self):
        self.meditation_progression = 0.0  # 0 to 1
        self.breakthrough_building = False
        self.breakthrough_peak = False
        self.callbacks: List[Callable] = []

    def start_simulation(self):
        """Start background biometric simulation"""
        self.running = True
        self.simulation_thread = threading.Thread(target=self._simulate_consciousness, daemon=True)
        self.simulation_thread.start()

    def _simulate_consciousness(self):
        """Simulate realistic consciousness progression"""
        while self.running:
            # Generate realistic meditation progression
            base_time = time.time() / 60.0  # Slow oscillation over minutes

            # Meditation deepens over time with natural fluctuations
            self.meditation_progression = min(1.0, self.meditation_progression + 0.01 + random.uniform(-0.005, 0.005))

            # Generate realistic EEG patterns
            eeg_data = self._generate_realistic_eeg()
            hrv_data = self._generate_realistic_hrv()

            # Create consciousness metrics
            consciousness_metrics = self._create_consciousness_metrics(eeg_data, hrv_data)

            # Notify callbacks
            for callback in self.callbacks:
                callback(consciousness_metrics)

            time.sleep(2)  # Update every 2 seconds

    def _generate_realistic_eeg(self) -> EEGData:
        """Generate realistic EEG data patterns"""
        t = time.time()
        base_meditation = self.meditation_progression

        # Natural meditation EEG patterns
        delta = max(0.1, 0.2 + math.sin(t / 30) * 0.1 + random.uniform(-0.05, 0.05))
        theta = max(0.2, 0.4 + base_meditation * 0.4 + math.sin(t / 20) * 0.2 + random.uniform(-0.1, 0.1))
        alpha = max(0.2, 0.5 + base_meditation * 0.3 + math.cos(t / 25) * 0.2 + random.uniform(-0.1, 0.1))
        beta = max(0.1, 0.4 - base_meditation * 0.3 + random.uniform(-0.1, 0.1))
        gamma = max(0.1, 0.3 + base_meditation * 0.5 + random.uniform(-0.2, 0.2))

        # Special breakthrough enhancement
        if base_meditation > 0.8:
            if not self.breakthrough_building:
                self.breakthrough_building = True
                print("🌟 Building breakthrough potential...")

            # Enhance theta-gamma coupling for breakthrough
            theta = min(1.0, theta + 0.2)
            gamma = min(1.0, gamma + 0.3)

            if base_meditation > 0.95 and random.random() < 0.1:  # 10% chance at peak
                self.breakthrough_peak = True
                theta = min(1.0, theta + 0.3)
                gamma = min(1.0, gamma + 0.4)

        # Calculate advanced metrics
        pineal_activation = self._calculate_pineal_activation(theta, gamma, alpha)
        third_eye_coherence = (theta + gamma) / 2.0
        consciousness_state = self._classify_consciousness_state(delta, theta, alpha, beta, gamma)

        return EEGData(
            timestamp=time.time(),
            channels={
                'C3': theta + random.uniform(-0.1, 0.1),
                'C4': alpha + random.uniform(-0.1, 0.1),
                'T7': gamma + random.uniform(-0.1, 0.1),
                'T8': (theta + gamma) / 2 + random.uniform(-0.1, 0.1)
            },
            delta=delta,
            theta=theta,
            alpha=alpha,
            beta=beta,
            gamma=gamma,
            pineal_activation_index=pineal_activation,
            third_eye_coherence=third_eye_coherence,
            consciousness_state=consciousness_state
        )

    def _calculate_pineal_activation(self, theta: float, gamma: float, alpha: float) -> float:
        """Calculate pineal gland activation index"""
        # High theta + high gamma + moderate alpha = pineal activation
        coupling_strength = (theta * gamma) / (alpha + 0.1)
        activation = min(1.0, coupling_strength * 0.8 + random.uniform(0, 0.1))

        # Breakthrough enhancement
        if self.breakthrough_peak:
            activation = min(1.0, activation + 0.3)

        return max(0.0, activation)

    def _classify_consciousness_state(self, delta, theta, alpha, beta, gamma) -> str:
        """Classify current consciousness state"""
        if self.breakthrough_peak and theta > 0.8 and gamma > 0.8:
            self.breakthrough_peak = False  # Reset for next cycle
            return "transcendent"
        elif theta > 0.8 and gamma > 0.7:
            return "breakthrough"
        elif theta > 0.6 and alpha > 0.6:
            return "deep_meditation"
        elif alpha > 0.5 and theta > 0.4:
            return "light_meditation"
        elif beta > 0.6:
            return "normal"
        else:
            return "drowsy"

    def _generate_realistic_hrv(self) -> HRVData:
        """Generate realistic HRV data"""
        base_hr = 65
        meditation_factor = 0.8 + self.meditation_progression * 0.4

        heart_rate = base_hr * meditation_factor + random.uniform(-5, 5)
        hrv_coherence = min(1.0, 0.6 + self.meditation_progression * 0.3 + random.uniform(-0.1, 0.1))
        stress_level = max(0.0, 0.5 - self.meditation_progression * 0.4 + random.uniform(-0.1, 0.1))
        meditation_readiness = hrv_coherence + random.uniform(-0.05, 0.05)

        return HRVData(
            timestamp=time.time(),
            heart_rate=heart_rate,
            hrv_coherence=hrv_coherence,
            stress_level=stress_level,
            meditation_readiness=meditation_readiness
        )

    def _create_consciousness_metrics(self, eeg: EEGData, hrv: HRVData) -> ConsciousnessMetrics:
        """Create comprehensive consciousness metrics"""
        overall_coherence = (eeg.theta + eeg.alpha + hrv.hrv_coherence) / 3.0
        breakthrough_potential = min(1.0, eeg.pineal_activation_index * 0.5 + eeg.third_eye_coherence * 0.5)
        sacred_resonance = (eeg.alpha + eeg.theta) / 2.0
        field_strength = overall_coherence * 0.7 + eeg.pineal_activation_index * 0.3

        # Determine meditation depth
        if eeg.consciousness_state == "transcendent":
            meditation_depth = "transcendent"
        elif eeg.consciousness_state == "breakthrough":
            meditation_depth = "breakthrough"
        elif eeg.consciousness_state == "deep_meditation":
            meditation_depth = "profound"
        elif eeg.consciousness_state == "light_meditation":
            meditation_depth = "deep"
        else:
            meditation_depth = "preparing"

        return ConsciousnessMetrics(
            timestamp=time.time(),
            eeg_data=eeg,
            hrv_data=hrv,
            overall_coherence=overall_coherence,
            breakthrough_potential=breakthrough_potential,
            sacred_resonance=sacred_resonance,
            field_strength=field_strength,
            meditation_depth=meditation_depth
        )

    def add_callback(self, callback):
        self.callbacks.append(callback)

    def stop(self):
        self.running = False

class SimpleConsciousnessMonitor:
    """Simplified consciousness monitor"""

    def __init__(self, maia_api_base_url: str = "http://localhost:3004"):
        self.maia_api_url = maia_api_base_url
        self.simulator = SimpleBiometricSimulator()
        self.websocket_server = None
        self.connected_clients = set()
        self.active_session_id = None
        self.event_loop = None
        self.pending_updates = []

        # Setup simulator callback
        self.simulator.add_callback(self._process_consciousness_update)

    async def start_monitoring(self) -> bool:
        """Start consciousness monitoring"""
        print("🧠 Starting Simple Consciousness Monitor...")

        # Store the event loop for thread-safe async operations
        self.event_loop = asyncio.get_running_loop()

        # Start biometric simulation
        self.simulator.start_simulation()

        # Start WebSocket server
        await self._start_websocket_server()

        # Start processing pending updates
        asyncio.create_task(self._process_pending_updates())

        print("✅ Consciousness monitoring active!")
        return True

    async def _start_websocket_server(self):
        """Start WebSocket server"""
        async def handle_client(websocket):
            self.connected_clients.add(websocket)
            print(f"🔗 Client connected (total: {len(self.connected_clients)})")
            try:
                await websocket.wait_closed()
            finally:
                self.connected_clients.remove(websocket)
                print(f"🔌 Client disconnected (total: {len(self.connected_clients)})")

        self.websocket_server = await websockets.serve(handle_client, "localhost", 8765)
        print("🌐 WebSocket server started on ws://localhost:8765")

    def _process_consciousness_update(self, metrics: ConsciousnessMetrics):
        """Process consciousness update and broadcast"""
        # Check for breakthrough
        if metrics.breakthrough_potential > 0.85:
            self._trigger_breakthrough(metrics)

        # Queue update for async processing
        if self.event_loop and not self.event_loop.is_closed():
            self.event_loop.call_soon_threadsafe(self._queue_broadcast_update, metrics)

    def _trigger_breakthrough(self, metrics: ConsciousnessMetrics):
        """Trigger breakthrough event"""
        print(f"🌟 BREAKTHROUGH DETECTED! Potential: {metrics.breakthrough_potential:.2f}")

        # Record breakthrough if session active
        if self.active_session_id and self.event_loop and not self.event_loop.is_closed():
            self.event_loop.call_soon_threadsafe(self._queue_breakthrough_record, metrics)

    async def _record_breakthrough(self, metrics: ConsciousnessMetrics):
        """Record breakthrough event in MAIA"""
        try:
            breakthrough_data = {
                "userId": "realtime-user",
                "sessionId": self.active_session_id,
                "intensity": metrics.breakthrough_potential,
                "type": "cascade",
                "description": f"Real-time breakthrough! Pineal: {metrics.eeg_data.pineal_activation_index:.2f}, Third-eye: {metrics.eeg_data.third_eye_coherence:.2f}",
                "insights": [
                    f"Consciousness state: {metrics.eeg_data.consciousness_state}",
                    f"Theta-gamma coupling: {metrics.eeg_data.pineal_activation_index:.2f}",
                    f"Sacred resonance: {metrics.sacred_resonance:.2f}"
                ]
            }

            response = requests.put(
                f"{self.maia_api_url}/api/maia/consciousness-integration",
                json=breakthrough_data,
                timeout=5
            )

            if response.status_code == 200:
                print("✅ Breakthrough recorded in MAIA")
        except Exception as e:
            print(f"⚠️ Could not record breakthrough: {e}")

    async def _broadcast_update(self, metrics: ConsciousnessMetrics):
        """Broadcast consciousness update to clients"""
        if not self.connected_clients:
            return

        data = {
            "type": "consciousness_update",
            "timestamp": metrics.timestamp,
            "data": {
                "overall_coherence": metrics.overall_coherence,
                "breakthrough_potential": metrics.breakthrough_potential,
                "sacred_resonance": metrics.sacred_resonance,
                "field_strength": metrics.field_strength,
                "meditation_depth": metrics.meditation_depth,
                "eeg": {
                    "delta": metrics.eeg_data.delta,
                    "theta": metrics.eeg_data.theta,
                    "alpha": metrics.eeg_data.alpha,
                    "beta": metrics.eeg_data.beta,
                    "gamma": metrics.eeg_data.gamma,
                    "pineal_activation": metrics.eeg_data.pineal_activation_index,
                    "third_eye_coherence": metrics.eeg_data.third_eye_coherence,
                    "consciousness_state": metrics.eeg_data.consciousness_state
                },
                "hrv": {
                    "heart_rate": metrics.hrv_data.heart_rate,
                    "coherence": metrics.hrv_data.hrv_coherence,
                    "stress_level": metrics.hrv_data.stress_level
                }
            }
        }

        message = json.dumps(data)
        disconnected = []

        for client in self.connected_clients:
            try:
                await client.send(message)
            except:
                disconnected.append(client)

        # Remove disconnected clients
        for client in disconnected:
            self.connected_clients.discard(client)

    def _queue_broadcast_update(self, metrics: ConsciousnessMetrics):
        """Thread-safe way to queue broadcast updates"""
        self.pending_updates.append(('broadcast', metrics))

    def _queue_breakthrough_record(self, metrics: ConsciousnessMetrics):
        """Thread-safe way to queue breakthrough recording"""
        self.pending_updates.append(('breakthrough', metrics))

    async def _process_pending_updates(self):
        """Process queued updates in the main async event loop"""
        while True:
            if self.pending_updates:
                update_type, metrics = self.pending_updates.pop(0)

                if update_type == 'broadcast':
                    await self._broadcast_update(metrics)
                elif update_type == 'breakthrough':
                    await self._record_breakthrough(metrics)

            await asyncio.sleep(0.1)  # Check for updates every 100ms

    def set_active_session(self, session_id: str):
        """Set active meditation session"""
        self.active_session_id = session_id
        print(f"🧘 Active session: {session_id}")

    async def stop_monitoring(self):
        """Stop monitoring"""
        self.simulator.stop()
        if self.websocket_server:
            self.websocket_server.close()
            await self.websocket_server.wait_closed()
        print("✅ Consciousness monitor stopped")

async def main():
    """Main function"""
    print("🌟" + "="*60)
    print("🌟  MAIA Simple Consciousness Monitor")
    print("🌟  Real-time biometric simulation for testing")
    print("🌟" + "="*60)
    print()

    monitor = SimpleConsciousnessMonitor()

    try:
        # Check MAIA server
        try:
            response = requests.get("http://localhost:3004/api/maia/meditation", timeout=5)
            print("✅ MAIA server accessible")
        except:
            print("⚠️ MAIA server not accessible - continuing anyway")

        # Start monitoring
        await monitor.start_monitoring()

        print()
        print("💡 Usage:")
        print("1. Open: http://localhost:3004/maia/labtools")
        print("2. Switch to 'Meditation' view")
        print("3. Watch real-time biometric simulation!")
        print()
        print("🔬 Simulated Features:")
        print("• Progressive meditation deepening")
        print("• Realistic EEG brainwave patterns")
        print("• Pineal gland activation simulation")
        print("• Third eye coherence tracking")
        print("• Automatic breakthrough detection")
        print("• Heart rate variability simulation")
        print()
        print("🔄 Running... (Press Ctrl+C to stop)")

        # Keep running
        while True:
            await asyncio.sleep(10)
            if len(monitor.connected_clients) > 0:
                print(f"[{time.strftime('%H:%M:%S')}] 🔗 {len(monitor.connected_clients)} clients connected")
            else:
                print(f"[{time.strftime('%H:%M:%S')}] 🔄 Waiting for client connections...")

    except KeyboardInterrupt:
        print("\\n🛑 Shutting down...")
        await monitor.stop_monitoring()

if __name__ == "__main__":
    asyncio.run(main())