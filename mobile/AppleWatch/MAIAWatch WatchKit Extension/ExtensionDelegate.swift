/**
 * 🔧⌚ MAIA Watch Extension Delegate
 * Manages app lifecycle, background tasks, and system events for Apple Watch
 * Handles background health data synchronization
 */

import WatchKit
import Foundation
import HealthKit

class ExtensionDelegate: NSObject, WKExtensionDelegate {

    private var healthKitManager: HealthKitManager?
    private var backgroundTaskIdentifier: WKExtendedRuntimeSessionInvalidationReason?

    override init() {
        super.init()
        setupExtension()
    }

    private func setupExtension() {
        // Initialize health monitoring for background operation
        healthKitManager = HealthKitManager()

        print("🌟 MAIA Watch Extension initialized")
    }

    // MARK: - App Lifecycle

    func applicationDidFinishLaunching() {
        print("🚀 MAIA Watch App launched")

        // Request health permissions if not already granted
        healthKitManager?.requestAuthorization()
    }

    func applicationDidBecomeActive() {
        print("👁️ MAIA Watch App became active")

        // Resume real-time monitoring
        if let healthManager = healthKitManager, healthManager.isAuthorized {
            // Health monitoring should already be running via the HealthKitManager
            print("💓 Health monitoring active")
        }
    }

    func applicationWillResignActive() {
        print("😴 MAIA Watch App will resign active")

        // Prepare for background operation
        scheduleBackgroundTasks()
    }

    // MARK: - Background Tasks

    private func scheduleBackgroundTasks() {
        // Schedule background app refresh for consciousness data sync
        let identifier = "com.soullab.maia.watchkit.background-sync"

        WKExtension.shared().scheduleBackgroundRefresh(
            withPreferredDate: Date().addingTimeInterval(15 * 60), // 15 minutes
            userInfo: ["task": "consciousness-sync"] as NSObject,
            scheduledCompletion: { error in
                if let error = error {
                    print("⚠️ Failed to schedule background refresh: \(error.localizedDescription)")
                } else {
                    print("⏰ Background refresh scheduled successfully")
                }
            }
        )
    }

    func handle(_ backgroundTasks: Set<WKRefreshBackgroundTask>) {
        for task in backgroundTasks {
            switch task {
            case let backgroundRefreshTask as WKApplicationRefreshBackgroundTask:
                print("🔄 Handling background refresh task")
                handleBackgroundRefresh(backgroundRefreshTask)

            case let snapshotTask as WKSnapshotRefreshBackgroundTask:
                print("📸 Handling snapshot refresh task")
                handleSnapshotRefresh(snapshotTask)

            case let connectivityTask as WKWatchConnectivityRefreshBackgroundTask:
                print("📡 Handling connectivity refresh task")
                handleConnectivityRefresh(connectivityTask)

            case let urlSessionTask as WKURLSessionRefreshBackgroundTask:
                print("🌐 Handling URL session refresh task")
                handleURLSessionRefresh(urlSessionTask)

            default:
                print("❓ Unknown background task type")
                task.setTaskCompletedWithSnapshot(false)
            }
        }
    }

    // MARK: - Background Task Handlers

    private func handleBackgroundRefresh(_ task: WKApplicationRefreshBackgroundTask) {
        // Sync consciousness data in background
        if let userInfo = task.userInfo as? [String: String],
           userInfo["task"] == "consciousness-sync" {

            // Perform background consciousness calculation
            Task {
                await performBackgroundConsciousnessSync()

                // Schedule next refresh
                scheduleBackgroundTasks()

                task.setTaskCompletedWithSnapshot(false)
            }
        } else {
            task.setTaskCompletedWithSnapshot(false)
        }
    }

    private func handleSnapshotRefresh(_ task: WKSnapshotRefreshBackgroundTask) {
        // Update the app's snapshot for quick launch
        task.setTaskCompleted(restoredDefaultState: true, estimatedSnapshotExpiration: Date().addingTimeInterval(4 * 60 * 60), userInfo: nil)
    }

    private func handleConnectivityRefresh(_ task: WKWatchConnectivityRefreshBackgroundTask) {
        // Handle iPhone connectivity updates
        task.setTaskCompletedWithSnapshot(false)
    }

    private func handleURLSessionRefresh(_ task: WKURLSessionRefreshBackgroundTask) {
        // Handle network requests (if any)
        task.setTaskCompletedWithSnapshot(false)
    }

    // MARK: - Background Processing

    private func performBackgroundConsciousnessSync() async {
        print("🧠 Performing background consciousness sync")

        // Get latest biometric data
        guard let healthManager = healthKitManager,
              let currentBiometrics = healthManager.currentBiometrics else {
            print("⚠️ No biometric data available for background sync")
            return
        }

        // Create a consciousness calculator instance for background processing
        let calculator = ConsciousnessCalculator()

        // Update with current biometrics
        await calculator.updateWithBiometrics(currentBiometrics)

        // Send to iPhone if connected (this would normally happen via WatchConnectivity)
        print("📊 Background consciousness calculation complete")
        print("   Coherence: \(calculator.currentState.coherenceScore)")
        print("   Presence: \(calculator.currentState.presenceMode)")
    }

    // MARK: - Health Permissions

    func handleHealthKitAuthorization() {
        healthKitManager?.requestAuthorization()
    }

    // MARK: - Memory Management

    func applicationWillTerminate() {
        print("🛑 MAIA Watch Extension terminating")

        // Clean up resources
        healthKitManager = nil
    }

    // MARK: - Error Handling

    func handle(_ error: Error) {
        print("⚠️ MAIA Watch Extension error: \(error.localizedDescription)")

        // Log error for debugging
        if let healthError = error as? HKError {
            switch healthError.code {
            case .errorAuthorizationDenied:
                print("❌ Health authorization denied")
            case .errorAuthorizationNotDetermined:
                print("❓ Health authorization not determined")
            default:
                print("🏥 Other health error: \(healthError.localizedDescription)")
            }
        }
    }
}

// MARK: - Background Session Management

extension ExtensionDelegate {
    func startBackgroundSession() {
        // For extended background processing during consciousness sessions
        print("🌙 Starting background session for consciousness monitoring")
    }

    func stopBackgroundSession() {
        print("☀️ Stopping background session")
    }
}