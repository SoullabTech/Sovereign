/**
 * 📡⌚ Watch Connectivity Manager for MAIA
 * Handles real-time communication between Apple Watch and iPhone
 * Sends consciousness data and biometrics for cloud synchronization
 */

import Foundation
import WatchConnectivity
import os.log

// MARK: - Connectivity Data Structures

struct WatchMessage {
    let messageType: MessageType
    let data: [String: Any]
    let timestamp: Date

    enum MessageType: String, CaseIterable {
        case consciousnessUpdate = "consciousness_update"
        case biometricsUpdate = "biometrics_update"
        case sessionStatus = "session_status"
        case healthPermission = "health_permission"
    }

    func toDictionary() -> [String: Any] {
        return [
            "type": messageType.rawValue,
            "data": data,
            "timestamp": timestamp.timeIntervalSince1970
        ]
    }
}

// MARK: - Watch Connectivity Manager

class WatchConnectivityManager: NSObject, ObservableObject {
    private let logger = Logger(subsystem: "com.soullab.maia", category: "WatchConnectivity")

    // Published properties for SwiftUI
    @Published var isConnected = false
    @Published var isReachable = false
    @Published var lastSyncTime: Date?
    @Published var connectionError: String?

    // Message queue for offline scenarios
    private var messageQueue: [WatchMessage] = []
    private let maxQueueSize = 50

    override init() {
        super.init()
        setupSession()
    }

    // MARK: - Session Setup

    func setupSession() {
        guard WCSession.isSupported() else {
            connectionError = "WatchConnectivity not supported"
            logger.error("WatchConnectivity not supported on this device")
            return
        }

        let session = WCSession.default
        session.delegate = self
        session.activate()

        logger.info("WatchConnectivity session setup initiated")
    }

    // MARK: - Consciousness Data Transmission

    func sendConsciousnessData(_ consciousnessState: ConsciousnessState) {
        let message = WatchMessage(
            messageType: .consciousnessUpdate,
            data: [
                "elementalBalance": [
                    "fire": consciousnessState.elementalBalance.fire,
                    "water": consciousnessState.elementalBalance.water,
                    "earth": consciousnessState.elementalBalance.earth,
                    "air": consciousnessState.elementalBalance.air,
                    "aether": consciousnessState.elementalBalance.aether
                ],
                "presenceMode": consciousnessState.presenceMode,
                "coherenceScore": consciousnessState.coherenceScore,
                "insights": consciousnessState.insights.map { insight in
                    [
                        "category": insight.category,
                        "message": insight.message,
                        "confidence": insight.confidence
                    ]
                },
                "recommendations": consciousnessState.recommendations.map { rec in
                    [
                        "type": rec.type,
                        "action": rec.action,
                        "priority": rec.priority.rawValue,
                        "duration": rec.estimatedDuration
                    ]
                }
            ],
            timestamp: Date()
        )

        sendMessage(message)
        logger.info("Consciousness data sent to iPhone: coherence=\(consciousnessState.coherenceScore), mode=\(consciousnessState.presenceMode)")
    }

    func sendBiometricData(_ biometrics: BiometricData) {
        let message = WatchMessage(
            messageType: .biometricsUpdate,
            data: [
                "heartRate": biometrics.heartRate,
                "heartRateVariability": biometrics.heartRateVariability as Any,
                "respiratoryRate": biometrics.respiratoryRate as Any,
                "oxygenSaturation": biometrics.oxygenSaturation as Any,
                "coherenceLevel": biometrics.coherenceLevel,
                "presenceState": biometrics.presenceState,
                "workoutActive": biometrics.workoutState != nil
            ],
            timestamp: biometrics.timestamp
        )

        sendMessage(message)
        logger.info("Biometric data sent to iPhone: HR=\(biometrics.heartRate), HRV=\(biometrics.heartRateVariability ?? 0)")
    }

    func sendSessionStatus(status: SessionStatus) {
        let message = WatchMessage(
            messageType: .sessionStatus,
            data: [
                "status": status.rawValue,
                "duration": status == .active ? Date().timeIntervalSince(lastSyncTime ?? Date()) : 0
            ],
            timestamp: Date()
        )

        sendMessage(message)
    }

    enum SessionStatus: String {
        case started = "started"
        case active = "active"
        case paused = "paused"
        case ended = "ended"
    }

    // MARK: - Message Management

    private func sendMessage(_ message: WatchMessage) {
        let session = WCSession.default
        let messageDict = message.toDictionary()

        if session.isReachable {
            // Send immediately
            session.sendMessage(messageDict, replyHandler: { [weak self] reply in
                DispatchQueue.main.async {
                    self?.handleMessageReply(reply)
                }
            }, errorHandler: { [weak self] error in
                DispatchQueue.main.async {
                    self?.handleMessageError(error, message: message)
                }
            })

        } else {
            // Queue for later or use application context for background transfer
            queueMessage(message)

            // Try to send via application context for non-urgent data
            if message.messageType != .sessionStatus {
                do {
                    try session.updateApplicationContext(messageDict)
                    logger.info("Message queued via application context: \(message.messageType.rawValue)")
                } catch {
                    logger.error("Failed to update application context: \(error.localizedDescription)")
                }
            }
        }
    }

    private func queueMessage(_ message: WatchMessage) {
        messageQueue.append(message)

        // Limit queue size
        if messageQueue.count > maxQueueSize {
            messageQueue.removeFirst(messageQueue.count - maxQueueSize)
            logger.warning("Message queue full, removing oldest messages")
        }

        logger.info("Message queued: \(message.messageType.rawValue), queue size: \(messageQueue.count)")
    }

    private func flushMessageQueue() {
        guard WCSession.default.isReachable && !messageQueue.isEmpty else { return }

        logger.info("Flushing message queue: \(messageQueue.count) messages")

        let messagesToSend = Array(messageQueue.suffix(10)) // Send last 10 messages
        messageQueue.removeAll()

        for message in messagesToSend {
            sendMessage(message)
        }
    }

    // MARK: - Message Handling

    private func handleMessageReply(_ reply: [String: Any]) {
        lastSyncTime = Date()

        if let status = reply["status"] as? String, status == "success" {
            logger.info("Message successfully received by iPhone")
        } else if let error = reply["error"] as? String {
            connectionError = "iPhone sync error: \(error)"
            logger.error("iPhone replied with error: \(error)")
        }
    }

    private func handleMessageError(_ error: Error, message: WatchMessage) {
        connectionError = "Failed to send message: \(error.localizedDescription)"
        logger.error("Message send failed: \(error.localizedDescription)")

        // Re-queue the failed message for retry
        queueMessage(message)
    }

    // MARK: - Health Permission Management

    func requestiPhoneHealthPermissions() {
        let message = WatchMessage(
            messageType: .healthPermission,
            data: ["action": "request_permissions"],
            timestamp: Date()
        )

        sendMessage(message)
        logger.info("Requesting iPhone to prompt for health permissions")
    }

    // MARK: - Utilities

    var connectionStatusDescription: String {
        if isConnected && isReachable {
            return "Connected & Reachable"
        } else if isConnected {
            return "Connected (Background)"
        } else {
            return "Disconnected"
        }
    }

    func forceSyncAttempt() {
        if WCSession.default.isReachable {
            flushMessageQueue()

            // Send a ping message
            let pingMessage = WatchMessage(
                messageType: .sessionStatus,
                data: ["ping": true],
                timestamp: Date()
            )
            sendMessage(pingMessage)
        }
    }
}

// MARK: - WCSession Delegate

extension WatchConnectivityManager: WCSessionDelegate {
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        DispatchQueue.main.async {
            self.isConnected = (activationState == .activated)

            if let error = error {
                self.connectionError = "Session activation failed: \(error.localizedDescription)"
                self.logger.error("WCSession activation failed: \(error.localizedDescription)")
            } else {
                self.logger.info("WCSession activated successfully")
                self.connectionError = nil

                // Flush any queued messages
                self.flushMessageQueue()
            }
        }
    }

    func sessionReachabilityDidChange(_ session: WCSession) {
        DispatchQueue.main.async {
            self.isReachable = session.isReachable
            self.logger.info("iPhone reachability changed: \(session.isReachable)")

            if session.isReachable {
                // iPhone became reachable, flush queued messages
                self.flushMessageQueue()
            }
        }
    }

    func session(_ session: WCSession, didReceiveMessage message: [String : Any], replyHandler: @escaping ([String : Any]) -> Void) {
        // Handle messages from iPhone (e.g., configuration updates, commands)
        DispatchQueue.main.async {
            self.processIncomingMessage(message, replyHandler: replyHandler)
        }
    }

    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String : Any]) {
        // Handle background context updates from iPhone
        DispatchQueue.main.async {
            self.processApplicationContext(applicationContext)
        }
    }

    private func processIncomingMessage(_ message: [String: Any], replyHandler: @escaping ([String: Any]) -> Void) {
        guard let messageType = message["type"] as? String else {
            replyHandler(["status": "error", "error": "Invalid message format"])
            return
        }

        logger.info("Received message from iPhone: \(messageType)")

        switch messageType {
        case "configuration_update":
            // Handle configuration updates from iPhone
            if let config = message["data"] as? [String: Any] {
                // Update local configuration
                logger.info("Configuration updated from iPhone")
            }

        case "start_session":
            // Handle session start command from iPhone
            logger.info("Session start requested from iPhone")

        case "stop_session":
            // Handle session stop command from iPhone
            logger.info("Session stop requested from iPhone")

        default:
            logger.warning("Unknown message type received: \(messageType)")
        }

        replyHandler(["status": "success"])
    }

    private func processApplicationContext(_ context: [String: Any]) {
        logger.info("Received application context update from iPhone")

        // Process background configuration updates
        if let config = context["configuration"] as? [String: Any] {
            // Update app configuration based on iPhone settings
            logger.info("Background configuration updated")
        }
    }
}