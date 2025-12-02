/**
 * 💓⌚ HealthKit Manager for MAIA Consciousness Integration
 * Handles real-time biometric data collection from Apple Watch
 * Integrates with WorkoutKit for live streaming during sessions
 */

import Foundation
import HealthKit
import WorkoutKit
import os.log

// MARK: - Biometric Data Structures

struct BiometricData {
    let heartRate: Double
    let heartRateVariability: Double?
    let respiratoryRate: Double?
    let oxygenSaturation: Double?
    let workoutState: HKWorkoutSessionState?
    let timestamp: Date

    // Calculated consciousness metrics
    var coherenceLevel: Double {
        // Calculate coherence from HRV and heart rate stability
        guard let hrv = heartRateVariability else { return 0.5 }
        let baseCoherence = min(1.0, hrv / 60.0) // Normalize HRV to coherence
        let hrStability = heartRate > 40 && heartRate < 120 ? 0.2 : 0.0
        return min(1.0, max(0.0, baseCoherence + hrStability))
    }

    var presenceState: String {
        // Determine presence mode based on biometrics
        if coherenceLevel > 0.75 {
            return "scribe"
        } else if coherenceLevel > 0.4 || (heartRateVariability ?? 0) > 40 {
            return "patient"
        } else {
            return "dialogue"
        }
    }
}

// MARK: - HealthKit Manager

class HealthKitManager: NSObject, ObservableObject {
    private let healthStore = HKHealthStore()
    private let logger = Logger(subsystem: "com.soullab.maia", category: "HealthKit")

    // Published properties for SwiftUI
    @Published var isAuthorized = false
    @Published var currentBiometrics: BiometricData?
    @Published var error: String?

    // Workout session for live streaming
    private var workoutSession: HKWorkoutSession?
    private var builder: HKLiveWorkoutBuilder?

    // Data queries
    private var heartRateQuery: HKQuery?
    private var hrvQuery: HKQuery?
    private var respiratoryQuery: HKQuery?
    private var oxygenQuery: HKQuery?

    // Callback for biometric updates
    var onBiometricUpdate: ((BiometricData) -> Void)?

    // MARK: - HealthKit Authorization

    func requestAuthorization() {
        guard HKHealthStore.isHealthDataAvailable() else {
            error = "HealthKit not available on this device"
            logger.error("HealthKit not available")
            return
        }

        let typesToRead: Set<HKObjectType> = [
            HKQuantityType.quantityType(forIdentifier: .heartRate)!,
            HKQuantityType.quantityType(forIdentifier: .heartRateVariabilitySDNN)!,
            HKQuantityType.quantityType(forIdentifier: .respiratoryRate)!,
            HKQuantityType.quantityType(forIdentifier: .oxygenSaturation)!,
            HKObjectType.workoutType()
        ]

        healthStore.requestAuthorization(toShare: nil, read: typesToRead) { [weak self] success, error in
            DispatchQueue.main.async {
                if success {
                    self?.isAuthorized = true
                    self?.logger.info("HealthKit authorization granted")
                    self?.startRealTimeMonitoring()
                } else {
                    self?.error = error?.localizedDescription ?? "Authorization failed"
                    self?.logger.error("HealthKit authorization failed: \(error?.localizedDescription ?? "unknown")")
                }
            }
        }
    }

    // MARK: - Real-time Monitoring

    private func startRealTimeMonitoring() {
        logger.info("Starting real-time biometric monitoring")

        // Start continuous heart rate monitoring
        startHeartRateStreaming()

        // Query for latest HRV, respiratory rate, and oxygen saturation
        queryLatestHRV()
        queryLatestRespiratoryRate()
        queryLatestOxygenSaturation()

        // Set up periodic updates every 5 seconds
        Timer.scheduledTimer(withTimeInterval: 5.0, repeats: true) { [weak self] _ in
            self?.updateBiometrics()
        }
    }

    private func startHeartRateStreaming() {
        guard let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate) else { return }

        let streamingQuery = HKAnchoredObjectQuery(
            type: heartRateType,
            predicate: HKQuery.predicateForSamples(withStart: Date(), end: nil, options: .strictEndDate),
            anchor: nil,
            limit: HKObjectQueryNoLimit
        ) { [weak self] query, samples, deletedObjects, anchor, error in

            if let error = error {
                self?.logger.error("Heart rate streaming error: \(error.localizedDescription)")
                return
            }

            guard let samples = samples as? [HKQuantitySample] else { return }

            DispatchQueue.main.async {
                for sample in samples {
                    self?.processNewHeartRateSample(sample)
                }
            }
        }

        streamingQuery.updateHandler = { [weak self] query, samples, deletedObjects, anchor, error in
            if let error = error {
                self?.logger.error("Heart rate update error: \(error.localizedDescription)")
                return
            }

            guard let samples = samples as? [HKQuantitySample] else { return }

            DispatchQueue.main.async {
                for sample in samples {
                    self?.processNewHeartRateSample(sample)
                }
            }
        }

        healthStore.execute(streamingQuery)
        heartRateQuery = streamingQuery

        logger.info("Heart rate streaming started")
    }

    private func processNewHeartRateSample(_ sample: HKQuantitySample) {
        let heartRate = sample.quantity.doubleValue(for: HKUnit(from: "count/min"))

        // Update current biometrics
        updateCurrentBiometrics(heartRate: heartRate)

        logger.info("New heart rate: \(heartRate) BPM")
    }

    // MARK: - HRV Monitoring

    private func queryLatestHRV() {
        guard let hrvType = HKQuantityType.quantityType(forIdentifier: .heartRateVariabilitySDNN) else { return }

        let query = HKSampleQuery(
            sampleType: hrvType,
            predicate: HKQuery.predicateForSamples(withStart: Calendar.current.date(byAdding: .hour, value: -1, to: Date()), end: Date(), options: .strictEndDate),
            limit: 1,
            sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)]
        ) { [weak self] query, samples, error in

            if let error = error {
                self?.logger.error("HRV query error: \(error.localizedDescription)")
                return
            }

            guard let sample = samples?.first as? HKQuantitySample else { return }

            let hrv = sample.quantity.doubleValue(for: HKUnit.secondUnit(with: .milli))

            DispatchQueue.main.async {
                self?.updateCurrentBiometrics(heartRateVariability: hrv)
                self?.logger.info("Latest HRV: \(hrv) ms")
            }
        }

        healthStore.execute(query)

        // Set up periodic HRV updates every 30 seconds
        Timer.scheduledTimer(withTimeInterval: 30.0, repeats: true) { [weak self] _ in
            self?.queryLatestHRV()
        }
    }

    private func queryLatestRespiratoryRate() {
        guard let respType = HKQuantityType.quantityType(forIdentifier: .respiratoryRate) else { return }

        let query = HKSampleQuery(
            sampleType: respType,
            predicate: HKQuery.predicateForSamples(withStart: Calendar.current.date(byAdding: .hour, value: -2, to: Date()), end: Date(), options: .strictEndDate),
            limit: 1,
            sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)]
        ) { [weak self] query, samples, error in

            if let sample = samples?.first as? HKQuantitySample {
                let respiratoryRate = sample.quantity.doubleValue(for: HKUnit(from: "count/min"))

                DispatchQueue.main.async {
                    self?.updateCurrentBiometrics(respiratoryRate: respiratoryRate)
                    self?.logger.info("Latest respiratory rate: \(respiratoryRate) breaths/min")
                }
            }
        }

        healthStore.execute(query)
    }

    private func queryLatestOxygenSaturation() {
        guard let oxygenType = HKQuantityType.quantityType(forIdentifier: .oxygenSaturation) else { return }

        let query = HKSampleQuery(
            sampleType: oxygenType,
            predicate: HKQuery.predicateForSamples(withStart: Calendar.current.date(byAdding: .hour, value: -1, to: Date()), end: Date(), options: .strictEndDate),
            limit: 1,
            sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)]
        ) { [weak self] query, samples, error in

            if let sample = samples?.first as? HKQuantitySample {
                let oxygenSaturation = sample.quantity.doubleValue(for: HKUnit.percent()) * 100

                DispatchQueue.main.async {
                    self?.updateCurrentBiometrics(oxygenSaturation: oxygenSaturation)
                    self?.logger.info("Latest oxygen saturation: \(oxygenSaturation)%")
                }
            }
        }

        healthStore.execute(query)
    }

    // MARK: - Workout Integration for Live Streaming

    func startConsciousnessSession() {
        guard isAuthorized else {
            error = "HealthKit not authorized"
            return
        }

        // Create a custom workout for consciousness monitoring
        let workoutConfiguration = HKWorkoutConfiguration()
        workoutConfiguration.activityType = .mindAndBody
        workoutConfiguration.locationType = .indoor

        do {
            workoutSession = try HKWorkoutSession(healthStore: healthStore, configuration: workoutConfiguration)
            workoutSession?.delegate = self

            builder = workoutSession?.associatedWorkoutBuilder()
            builder?.delegate = self

            // Start the session
            workoutSession?.startActivity(with: Date())
            builder?.beginCollection(withStart: Date()) { success, error in
                if let error = error {
                    self.logger.error("Failed to start workout builder: \(error.localizedDescription)")
                    self.error = "Failed to start consciousness session"
                } else {
                    self.logger.info("Consciousness session started successfully")
                }
            }

        } catch {
            self.error = "Failed to create consciousness session: \(error.localizedDescription)"
            logger.error("Workout session creation failed: \(error.localizedDescription)")
        }
    }

    func stopConsciousnessSession() {
        workoutSession?.end()
        builder?.endCollection(withEnd: Date()) { success, error in
            if let error = error {
                self.logger.error("Failed to end workout builder: \(error.localizedDescription)")
            } else {
                self.logger.info("Consciousness session ended successfully")
            }
        }
    }

    // MARK: - Biometric Data Management

    private func updateCurrentBiometrics(
        heartRate: Double? = nil,
        heartRateVariability: Double? = nil,
        respiratoryRate: Double? = nil,
        oxygenSaturation: Double? = nil
    ) {
        // Preserve existing values if not updating
        let currentHeartRate = heartRate ?? currentBiometrics?.heartRate ?? 70.0
        let currentHRV = heartRateVariability ?? currentBiometrics?.heartRateVariability
        let currentRespRate = respiratoryRate ?? currentBiometrics?.respiratoryRate
        let currentOxygen = oxygenSaturation ?? currentBiometrics?.oxygenSaturation

        let newBiometrics = BiometricData(
            heartRate: currentHeartRate,
            heartRateVariability: currentHRV,
            respiratoryRate: currentRespRate,
            oxygenSaturation: currentOxygen,
            workoutState: workoutSession?.state,
            timestamp: Date()
        )

        currentBiometrics = newBiometrics

        // Trigger callback for consciousness calculation
        onBiometricUpdate?(newBiometrics)
    }

    private func updateBiometrics() {
        // Trigger an update with current values to refresh calculations
        updateCurrentBiometrics()
    }

    // MARK: - Cleanup

    deinit {
        if let query = heartRateQuery {
            healthStore.stop(query)
        }
        stopConsciousnessSession()
        logger.info("HealthKitManager deallocated")
    }
}

// MARK: - Workout Session Delegate

extension HealthKitManager: HKWorkoutSessionDelegate {
    func workoutSession(_ workoutSession: HKWorkoutSession, didChangeTo toState: HKWorkoutSessionState, from fromState: HKWorkoutSessionState, date: Date) {
        logger.info("Workout session state changed from \(fromState.rawValue) to \(toState.rawValue)")

        DispatchQueue.main.async {
            // Update current biometrics with new workout state
            self.updateCurrentBiometrics()
        }
    }

    func workoutSession(_ workoutSession: HKWorkoutSession, didFailWithError error: Error) {
        logger.error("Workout session failed: \(error.localizedDescription)")
        DispatchQueue.main.async {
            self.error = "Consciousness session error: \(error.localizedDescription)"
        }
    }
}

// MARK: - Workout Builder Delegate

extension HealthKitManager: HKLiveWorkoutBuilderDelegate {
    func workoutBuilder(_ workoutBuilder: HKLiveWorkoutBuilder, didCollectDataOf collectedTypes: Set<HKSampleType>) {
        // Enhanced real-time data collection during workout
        for type in collectedTypes {
            switch type.identifier {
            case HKQuantityTypeIdentifier.heartRate.rawValue:
                // Heart rate is already handled by streaming query
                break
            case HKQuantityTypeIdentifier.heartRateVariabilitySDNN.rawValue:
                queryLatestHRV()
            default:
                break
            }
        }
    }

    func workoutBuilderDidCollectEvent(_ workoutBuilder: HKLiveWorkoutBuilder) {
        // Handle workout events if needed
        logger.info("Workout event collected")
    }
}