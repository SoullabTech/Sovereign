/**
 * 🏃‍♀️ Apple Watch + iPhone Real-Time Biometric Bridge
 * Provides live streaming of HRV, heart rate, and consciousness metrics to MAIA
 */

import Foundation
import HealthKit
import WatchConnectivity
import WorkoutKit

@objc(AppleWatchBridge)
class AppleWatchBridge: NSObject, ObservableObject {

    // MARK: - Properties
    private let healthStore = HKHealthStore()
    private var workoutSession: HKWorkoutSession?
    private var workoutBuilder: HKLiveWorkoutBuilder?
    private var wcSession: WCSession?

    // Real-time data streams
    @Published var currentHRV: Double = 0
    @Published var currentHeartRate: Double = 0
    @Published var currentRespiratoryRate: Double = 0
    @Published var coherenceLevel: Double = 0
    @Published var presenceState: String = "dialogue" // dialogue, patient, scribe

    // Callbacks for React Native
    private var onBiometricUpdate: ((NSDictionary) -> Void)?
    private var onCoherenceChange: ((String) -> Void)?

    // MARK: - Initialization
    override init() {
        super.init()
        setupWatchConnectivity()
        requestHealthPermissions()
    }

    // MARK: - React Native Bridge Methods

    @objc func startRealTimeMonitoring(
        _ callback: @escaping RCTResponseSenderBlock
    ) {
        guard HKHealthStore.isHealthDataAvailable() else {
            callback([["error": "HealthKit not available"]])
            return
        }

        startWorkoutSession()
        startHRVStreaming()
        startWatchCommunication()

        callback([["success": true, "message": "Real-time monitoring started"]])
    }

    @objc func stopRealTimeMonitoring(
        _ callback: @escaping RCTResponseSenderBlock
    ) {
        stopWorkoutSession()
        stopWatchCommunication()

        callback([["success": true, "message": "Monitoring stopped"]])
    }

    @objc func setPresenceMode(_ mode: String) {
        presenceState = mode
        sendToAppleWatch(["presenceMode": mode])

        // Adjust data collection frequency based on mode
        switch mode {
        case "dialogue":
            // High frequency for real-time feedback
            startHighFrequencyCollection()
        case "patient":
            // Medium frequency for exploration
            startMediumFrequencyCollection()
        case "scribe":
            // Low frequency for witnessing
            startLowFrequencyCollection()
        default:
            break
        }
    }

    @objc func addListener(_ eventName: String, callback: @escaping RCTResponseSenderBlock) {
        switch eventName {
        case "biometricUpdate":
            self.onBiometricUpdate = { data in
                callback([data])
            }
        case "coherenceChange":
            self.onCoherenceChange = { state in
                callback([["state": state]])
            }
        default:
            break
        }
    }

    // MARK: - HealthKit Setup

    private func requestHealthPermissions() {
        let typesToRead: Set<HKSampleType> = [
            HKQuantityType.quantityType(forIdentifier: .heartRate)!,
            HKQuantityType.quantityType(forIdentifier: .heartRateVariabilitySDNN)!,
            HKQuantityType.quantityType(forIdentifier: .respiratoryRate)!,
            HKQuantityType.quantityType(forIdentifier: .restingHeartRate)!,
            HKCategoryType.categoryType(forIdentifier: .sleepAnalysis)!,
            HKQuantityType.quantityType(forIdentifier: .oxygenSaturation)!,
            HKCategoryType.categoryType(forIdentifier: .mindfulSession)!
        ]

        healthStore.requestAuthorization(toShare: nil, read: typesToRead) { success, error in
            if success {
                print("✅ HealthKit permissions granted")
                self.setupHealthDataObservers()
            } else {
                print("❌ HealthKit permissions denied: \(error?.localizedDescription ?? "")")
            }
        }
    }

    private func setupHealthDataObservers() {
        // Set up real-time observers for each metric
        setupHRVObserver()
        setupHeartRateObserver()
        setupRespiratoryRateObserver()
    }

    // MARK: - HRV Real-Time Streaming

    private func setupHRVObserver() {
        guard let hrvType = HKQuantityType.quantityType(forIdentifier: .heartRateVariabilitySDNN) else { return }

        let query = HKAnchoredObjectQuery(
            type: hrvType,
            predicate: nil,
            anchor: nil,
            limit: HKObjectQueryNoLimit
        ) { [weak self] (query, samples, deletedObjects, anchor, error) in
            self?.processHRVSamples(samples)
        }

        // Enable real-time updates (iOS 14+)
        query.updateHandler = { [weak self] (query, samples, deletedObjects, anchor, error) in
            self?.processHRVSamples(samples)
        }

        healthStore.execute(query)
    }

    private func processHRVSamples(_ samples: [HKSample]?) {
        guard let hrvSamples = samples as? [HKQuantitySample] else { return }

        for sample in hrvSamples {
            let hrvValue = sample.quantity.doubleValue(for: HKUnit.secondUnit(with: .milli))

            DispatchQueue.main.async {
                self.currentHRV = hrvValue
                self.calculateCoherence()
                self.sendBiometricUpdate()
            }
        }
    }

    // MARK: - Heart Rate Real-Time Streaming

    private func setupHeartRateObserver() {
        guard let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate) else { return }

        let query = HKAnchoredObjectQuery(
            type: heartRateType,
            predicate: nil,
            anchor: nil,
            limit: HKObjectQueryNoLimit
        ) { [weak self] (query, samples, deletedObjects, anchor, error) in
            self?.processHeartRateSamples(samples)
        }

        query.updateHandler = { [weak self] (query, samples, deletedObjects, anchor, error) in
            self?.processHeartRateSamples(samples)
        }

        healthStore.execute(query)
    }

    private func processHeartRateSamples(_ samples: [HKSample]?) {
        guard let hrSamples = samples as? [HKQuantitySample] else { return }

        for sample in hrSamples {
            let heartRate = sample.quantity.doubleValue(for: HKUnit.count().unitDivided(by: .minute()))

            DispatchQueue.main.async {
                self.currentHeartRate = heartRate
                self.sendBiometricUpdate()
            }
        }
    }

    // MARK: - Workout Session for Real-Time HR

    private func startWorkoutSession() {
        let configuration = HKWorkoutConfiguration()
        configuration.activityType = .mindAndBody
        configuration.locationType = .unknown

        do {
            workoutSession = try HKWorkoutSession(healthStore: healthStore, configuration: configuration)
            workoutBuilder = workoutSession?.associatedWorkoutBuilder()

            workoutBuilder?.dataSource = HKLiveWorkoutDataSource(
                healthStore: healthStore,
                workoutConfiguration: configuration
            )

            workoutSession?.delegate = self
            workoutBuilder?.delegate = self

            let startDate = Date()
            workoutSession?.startActivity(with: startDate)
            workoutBuilder?.beginCollection(withStart: startDate) { (success, error) in
                if success {
                    print("✅ Workout session started for real-time monitoring")
                }
            }
        } catch {
            print("❌ Failed to start workout session: \(error)")
        }
    }

    private func stopWorkoutSession() {
        workoutSession?.end()
        workoutBuilder?.endCollection(withEnd: Date()) { (success, error) in
            if success {
                self.workoutBuilder?.finishWorkout { (workout, error) in
                    print("✅ Workout session ended")
                }
            }
        }
    }

    // MARK: - Respiratory Rate Monitoring

    private func setupRespiratoryRateObserver() {
        guard let respiratoryType = HKQuantityType.quantityType(forIdentifier: .respiratoryRate) else { return }

        let query = HKAnchoredObjectQuery(
            type: respiratoryType,
            predicate: nil,
            anchor: nil,
            limit: HKObjectQueryNoLimit
        ) { [weak self] (query, samples, deletedObjects, anchor, error) in
            self?.processRespiratoryRateSamples(samples)
        }

        query.updateHandler = { [weak self] (query, samples, deletedObjects, anchor, error) in
            self?.processRespiratoryRateSamples(samples)
        }

        healthStore.execute(query)
    }

    private func processRespiratoryRateSamples(_ samples: [HKSample]?) {
        guard let respiratorySamples = samples as? [HKQuantitySample] else { return }

        for sample in respiratorySamples {
            let respiratoryRate = sample.quantity.doubleValue(for: HKUnit.count().unitDivided(by: .minute()))

            DispatchQueue.main.async {
                self.currentRespiratoryRate = respiratoryRate
                self.sendBiometricUpdate()
            }
        }
    }

    // MARK: - Coherence Calculation

    private func calculateCoherence() {
        // SPiralogic coherence calculation based on HRV and breathing
        let hrvCoherence = min(100, (currentHRV / 80) * 100) / 100
        let breathCoherence = calculateBreathCoherence()

        coherenceLevel = (hrvCoherence + breathCoherence) / 2

        // Determine presence state based on coherence
        let newPresenceState = determinePresenceState()
        if newPresenceState != presenceState {
            presenceState = newPresenceState
            onCoherenceChange?(newPresenceState)
        }
    }

    private func calculateBreathCoherence() -> Double {
        // Ideal breathing rate for coherence: 6-12 breaths/min
        if currentRespiratoryRate >= 6 && currentRespiratoryRate <= 12 {
            return 0.9 // High coherence
        } else if currentRespiratoryRate >= 12 && currentRespiratoryRate <= 16 {
            return 0.6 // Medium coherence
        } else {
            return 0.3 // Low coherence
        }
    }

    private func determinePresenceState() -> String {
        if coherenceLevel > 0.7 {
            return "scribe" // High coherence → witnessing mode
        } else if coherenceLevel > 0.4 {
            return "patient" // Medium coherence → exploration mode
        } else {
            return "dialogue" // Low coherence → supportive mode
        }
    }

    // MARK: - Data Collection Frequency Management

    private func startHighFrequencyCollection() {
        // Every 2 seconds for dialogue mode
        Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { _ in
            self.sendBiometricUpdate()
        }
    }

    private func startMediumFrequencyCollection() {
        // Every 5 seconds for patient mode
        Timer.scheduledTimer(withTimeInterval: 5.0, repeats: true) { _ in
            self.sendBiometricUpdate()
        }
    }

    private func startLowFrequencyCollection() {
        // Every 10 seconds for scribe mode
        Timer.scheduledTimer(withTimeInterval: 10.0, repeats: true) { _ in
            self.sendBiometricUpdate()
        }
    }

    // MARK: - Watch Connectivity

    private func setupWatchConnectivity() {
        if WCSession.isSupported() {
            wcSession = WCSession.default
            wcSession?.delegate = self
            wcSession?.activate()
        }
    }

    private func startWatchCommunication() {
        sendToAppleWatch([
            "command": "startMonitoring",
            "presenceMode": presenceState
        ])
    }

    private func stopWatchCommunication() {
        sendToAppleWatch(["command": "stopMonitoring"])
    }

    private func sendToAppleWatch(_ message: [String: Any]) {
        guard let session = wcSession, session.isReachable else { return }

        session.sendMessage(message, replyHandler: nil) { error in
            print("Watch communication error: \(error.localizedDescription)")
        }
    }

    // MARK: - Data Broadcasting

    private func sendBiometricUpdate() {
        let biometricData: NSDictionary = [
            "hrv": currentHRV,
            "heartRate": currentHeartRate,
            "respiratoryRate": currentRespiratoryRate,
            "coherenceLevel": coherenceLevel,
            "presenceState": presenceState,
            "timestamp": Date().timeIntervalSince1970,
            "source": "apple_watch_iphone"
        ]

        onBiometricUpdate?(biometricData)

        // Also send to Apple Watch for display
        sendToAppleWatch([
            "biometricUpdate": [
                "hrv": currentHRV,
                "heartRate": currentHeartRate,
                "coherence": coherenceLevel,
                "presenceState": presenceState
            ]
        ])
    }
}

// MARK: - HealthKit Workout Delegates

extension AppleWatchBridge: HKWorkoutSessionDelegate {
    func workoutSession(_ workoutSession: HKWorkoutSession, didChangeTo toState: HKWorkoutSessionState, from fromState: HKWorkoutSessionState, date: Date) {
        print("Workout session state changed: \(toState)")
    }

    func workoutSession(_ workoutSession: HKWorkoutSession, didFailWithError error: Error) {
        print("Workout session failed: \(error)")
    }
}

extension AppleWatchBridge: HKLiveWorkoutBuilderDelegate {
    func workoutBuilder(_ workoutBuilder: HKLiveWorkoutBuilder, didCollectDataOf collectedTypes: Set<HKSampleType>) {
        for type in collectedTypes {
            if let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate), type == heartRateType {
                // Get latest heart rate
                let statistics = workoutBuilder.statistics(for: heartRateType)
                if let averageRate = statistics?.mostRecentQuantity()?.doubleValue(for: .count().unitDivided(by: .minute())) {
                    DispatchQueue.main.async {
                        self.currentHeartRate = averageRate
                        self.sendBiometricUpdate()
                    }
                }
            }
        }
    }

    func workoutBuilderDidCollectEvent(_ workoutBuilder: HKLiveWorkoutBuilder) {
        // Handle workout events
    }
}

// MARK: - Watch Connectivity Delegate

extension AppleWatchBridge: WCSessionDelegate {
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        print("Watch session activation: \(activationState)")
    }

    func sessionDidBecomeInactive(_ session: WCSession) {
        print("Watch session became inactive")
    }

    func sessionDidDeactivate(_ session: WCSession) {
        print("Watch session deactivated")
    }

    func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
        // Handle messages from Apple Watch
        if let command = message["command"] as? String {
            switch command {
            case "heartRateUpdate":
                if let hr = message["heartRate"] as? Double {
                    DispatchQueue.main.async {
                        self.currentHeartRate = hr
                        self.sendBiometricUpdate()
                    }
                }
            case "workoutMetrics":
                // Handle comprehensive workout metrics from watch
                break
            default:
                break
            }
        }
    }
}

// MARK: - React Native Module Export

@objc(AppleWatchBridgeManager)
class AppleWatchBridgeManager: NSObject {

    private let bridge = AppleWatchBridge()

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc func startRealTimeMonitoring(_ callback: @escaping RCTResponseSenderBlock) {
        bridge.startRealTimeMonitoring(callback)
    }

    @objc func stopRealTimeMonitoring(_ callback: @escaping RCTResponseSenderBlock) {
        bridge.stopRealTimeMonitoring(callback)
    }

    @objc func setPresenceMode(_ mode: String) {
        bridge.setPresenceMode(mode)
    }

    @objc func addListener(_ eventName: String, callback: @escaping RCTResponseSenderBlock) {
        bridge.addListener(eventName, callback: callback)
    }
}