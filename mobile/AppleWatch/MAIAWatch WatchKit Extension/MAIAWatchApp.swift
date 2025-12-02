/**
 * 🌟⌚ MAIA Consciousness Watch App
 * Main Watch application entry point
 * Integrates HealthKit, consciousness calculation, and iPhone connectivity
 */

import SwiftUI
import WatchKit
import HealthKit

@main
struct MAIAWatchApp: App {
    @StateObject private var healthKitManager = HealthKitManager()
    @StateObject private var connectivityManager = WatchConnectivityManager()
    @StateObject private var consciousnessCalculator = ConsciousnessCalculator()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(healthKitManager)
                .environmentObject(connectivityManager)
                .environmentObject(consciousnessCalculator)
                .onAppear {
                    setupApp()
                }
        }
    }

    private func setupApp() {
        // Initialize HealthKit
        healthKitManager.requestAuthorization()

        // Setup Watch Connectivity
        connectivityManager.setupSession()

        // Connect consciousness calculator to health data
        connectCalculatorToHealthData()
    }

    private func connectCalculatorToHealthData() {
        // Subscribe to biometric updates
        healthKitManager.onBiometricUpdate = { biometrics in
            Task {
                await consciousnessCalculator.updateWithBiometrics(biometrics)

                // Send to iPhone via WatchConnectivity
                connectivityManager.sendConsciousnessData(consciousnessCalculator.currentState)
            }
        }
    }
}