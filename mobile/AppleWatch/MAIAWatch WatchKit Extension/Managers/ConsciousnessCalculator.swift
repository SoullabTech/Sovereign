/**
 * 🌟🧠 SPiralogic Consciousness Calculator for Apple Watch
 * Real-time transformation of biometric data into elemental consciousness insights
 * Implements the five-element consciousness mapping system locally on Watch
 */

import Foundation
import os.log

// MARK: - Consciousness Data Structures

struct ElementalBalance {
    let fire: Double    // Energy, vitality, passion (0-100)
    let water: Double   // Flow, emotion, intuition (0-100)
    let earth: Double   // Grounding, stability, presence (0-100)
    let air: Double     // Clarity, communication, breath (0-100)
    let aether: Double  // Integration, transcendence, unity (0-100)

    var dominant: Element {
        let elements = [
            (Element.fire, fire),
            (Element.water, water),
            (Element.earth, earth),
            (Element.air, air),
            (Element.aether, aether)
        ]
        return elements.max(by: { $0.1 < $1.1 })?.0 ?? .fire
    }

    var harmony: Double {
        let values = [fire, water, earth, air, aether]
        let mean = values.reduce(0, +) / Double(values.count)
        let variance = values.map { pow($0 - mean, 2) }.reduce(0, +) / Double(values.count)
        return max(0, 100 - variance)
    }
}

enum Element: String, CaseIterable {
    case fire = "fire"
    case water = "water"
    case earth = "earth"
    case air = "air"
    case aether = "aether"

    var emoji: String {
        switch self {
        case .fire: return "🔥"
        case .water: return "🌊"
        case .earth: return "🌍"
        case .air: return "💨"
        case .aether: return "✨"
        }
    }

    var color: String {
        switch self {
        case .fire: return "#FF6B35"
        case .water: return "#4ECDC4"
        case .earth: return "#8B4513"
        case .air: return "#87CEEB"
        case .aether: return "#DDA0DD"
        }
    }
}

enum PresenceMode: String, CaseIterable {
    case dialogue = "dialogue"  // Active engagement, support needed
    case patient = "patient"    // Receptive exploration, inner work
    case scribe = "scribe"      // Witnessing consciousness, meditation

    var description: String {
        switch self {
        case .dialogue: return "Active engagement and collaboration"
        case .patient: return "Receptive exploration and inner work"
        case .scribe: return "Witnessing consciousness and meditation"
        }
    }
}

struct ConsciousnessState {
    let elementalBalance: ElementalBalance
    let coherenceLevel: Double // 0-1
    let presenceMode: PresenceMode
    let timestamp: Date

    // Autonomic nervous system indicators
    let sympatheticActivation: Double // 0-100
    let parasympatheticActivation: Double // 0-100

    // Consciousness depth metrics
    let depth: Double // 0-100 - depth of awareness
    let clarity: Double // 0-100 - mental clarity
    let integration: Double // 0-100 - mind-body integration

    // Maya insights
    let insights: [String]
    let recommendations: [String]
}

// MARK: - Consciousness Calculator

class ConsciousnessCalculator: ObservableObject {
    private let logger = Logger(subsystem: "com.soullab.maia", category: "Consciousness")

    @Published var currentState: ConsciousnessState?
    @Published var isCalculating = false

    // Historical data for trend analysis
    private var biometricHistory: [BiometricData] = []
    private var consciousnessHistory: [ConsciousnessState] = []

    private let maxHistorySize = 50

    // MARK: - Main Calculation Method

    @MainActor
    func updateWithBiometrics(_ biometrics: BiometricData) async {
        isCalculating = true

        logger.info("Calculating consciousness from biometrics: HR=\(biometrics.heartRate), HRV=\(biometrics.heartRateVariability ?? 0)")

        // Store biometric data
        addToHistory(biometrics)

        // Calculate elemental balance
        let elementalBalance = calculateElementalBalance(from: biometrics)

        // Calculate overall coherence
        let coherenceLevel = calculateCoherence(from: biometrics, elemental: elementalBalance)

        // Determine presence mode
        let presenceMode = determinePresenceMode(coherence: coherenceLevel, elemental: elementalBalance, biometrics: biometrics)

        // Calculate autonomic balance
        let (sympathetic, parasympathetic) = calculateAutonomicBalance(from: biometrics)

        // Calculate consciousness metrics
        let (depth, clarity, integration) = calculateConsciousnessMetrics(
            elemental: elementalBalance,
            coherence: coherenceLevel,
            sympathetic: sympathetic,
            parasympathetic: parasympathetic
        )

        // Generate insights and recommendations
        let insights = generateInsights(elemental: elementalBalance, coherence: coherenceLevel, biometrics: biometrics)
        let recommendations = generateRecommendations(presenceMode: presenceMode, elemental: elementalBalance)

        // Create new consciousness state
        let newState = ConsciousnessState(
            elementalBalance: elementalBalance,
            coherenceLevel: coherenceLevel,
            presenceMode: presenceMode,
            timestamp: Date(),
            sympatheticActivation: sympathetic,
            parasympatheticActivation: parasympathetic,
            depth: depth,
            clarity: clarity,
            integration: integration,
            insights: insights,
            recommendations: recommendations
        )

        currentState = newState
        consciousnessHistory.append(newState)

        // Trim history if needed
        if consciousnessHistory.count > maxHistorySize {
            consciousnessHistory.removeFirst()
        }

        isCalculating = false

        logger.info("Consciousness calculated - Dominant: \(elementalBalance.dominant.rawValue), Coherence: \(coherenceLevel), Mode: \(presenceMode.rawValue)")
    }

    // MARK: - Elemental Balance Calculation

    private func calculateElementalBalance(from biometrics: BiometricData) -> ElementalBalance {
        let heartRate = biometrics.heartRate
        let hrv = biometrics.heartRateVariability ?? 30.0
        let respiratoryRate = biometrics.respiratoryRate ?? 12.0
        let oxygenSaturation = biometrics.oxygenSaturation ?? 98.0

        // FIRE 🔥 - Energy, vitality, metabolic activation
        let fireFromHR = heartRate > 70 ? min(100, (heartRate - 70) * 1.5) : heartRate * 0.8
        let fireFromActivation = biometrics.workoutState != nil ? 30.0 : 0.0
        let fire = min(100, max(0, (fireFromHR * 0.7) + (fireFromActivation * 0.3)))

        // WATER 🌊 - Parasympathetic flow, emotional regulation
        let waterFromHRV = min(100, (hrv / 60.0) * 100) // Healthy HRV ~40-60ms
        let waterFromStress = heartRate < 80 ? 20.0 : 0.0
        let water = min(100, max(0, (waterFromHRV * 0.8) + (waterFromStress * 0.2)))

        // EARTH 🌍 - Grounding, stability, physical presence
        let earthFromHRVStability = calculateHRVStability() * 60.0
        let earthFromBreathing = (respiratoryRate >= 6 && respiratoryRate <= 16) ? 40.0 : 20.0
        let earth = min(100, max(0, (earthFromHRVStability * 0.6) + (earthFromBreathing * 0.4)))

        // AIR 💨 - Mental clarity, communication, breath quality
        let airFromBreathing = (respiratoryRate >= 8 && respiratoryRate <= 14) ? 50.0 : 25.0
        let airFromOxygen = (oxygenSaturation / 100.0) * 35.0
        let airFromClarity = heartRate < 90 ? 15.0 : 5.0
        let air = min(100, max(0, airFromBreathing + airFromOxygen + airFromClarity))

        // AETHER ✨ - Integration, transcendence, unity consciousness
        let aetherFromCoherence = biometrics.coherenceLevel * 60.0
        let aetherFromHRV = hrv > 40 ? min(25.0, (hrv - 40) * 0.5) : 0.0
        let aetherFromBalance = calculateElementalHarmony(fire, water, earth, air) * 0.15
        let aether = min(100, max(0, aetherFromCoherence + aetherFromHRV + aetherFromBalance))

        return ElementalBalance(
            fire: fire,
            water: water,
            earth: earth,
            air: air,
            aether: aether
        )
    }

    // MARK: - Coherence Calculation

    private func calculateCoherence(from biometrics: BiometricData, elemental: ElementalBalance) -> Double {
        // HRV coherence (primary factor)
        let hrvCoherence = min(1.0, (biometrics.heartRateVariability ?? 30.0) / 60.0)

        // Heart rate stability
        let hrStability = (biometrics.heartRate >= 50 && biometrics.heartRate <= 100) ? 0.2 : 0.0

        // Elemental harmony contribution
        let elementalHarmony = elemental.harmony / 100.0 * 0.15

        // Breathing coherence
        let breathingCoherence = calculateBreathingCoherence(biometrics.respiratoryRate ?? 12.0)

        // Combined coherence
        let totalCoherence = (hrvCoherence * 0.5) + (hrStability * 0.2) + (elementalHarmony * 0.15) + (breathingCoherence * 0.15)

        return min(1.0, max(0.0, totalCoherence))
    }

    private func calculateBreathingCoherence(_ respiratoryRate: Double) -> Double {
        // Optimal breathing for coherence: 5-8 breaths per minute
        if respiratoryRate >= 5 && respiratoryRate <= 8 {
            return 0.9
        } else if respiratoryRate >= 8 && respiratoryRate <= 12 {
            return 0.7
        } else if respiratoryRate >= 12 && respiratoryRate <= 16 {
            return 0.5
        } else {
            return 0.3
        }
    }

    // MARK: - Presence Mode Determination

    private func determinePresenceMode(coherence: Double, elemental: ElementalBalance, biometrics: BiometricData) -> PresenceMode {
        // SCRIBE MODE: High coherence + integration
        if coherence > 0.75 && elemental.aether > 70 {
            return .scribe
        }

        // PATIENT MODE: Receptive state, exploration readiness
        if (coherence > 0.4 && elemental.water > 60) ||
           (elemental.earth > 65 && biometrics.heartRate < 80) {
            return .patient
        }

        // DIALOGUE MODE: Active engagement, support needed
        return .dialogue
    }

    // MARK: - Autonomic Balance Calculation

    private func calculateAutonomicBalance(from biometrics: BiometricData) -> (sympathetic: Double, parasympathetic: Double) {
        // Sympathetic indicators
        let sympatheticFromHR = biometrics.heartRate > 80 ? (biometrics.heartRate - 80) * 1.5 : 0.0
        let sympatheticFromHRV = (biometrics.heartRateVariability ?? 30) < 25 ? 30.0 : 0.0
        let sympathetic = min(100, max(0, sympatheticFromHR + sympatheticFromHRV))

        // Parasympathetic indicators
        let parasympatheticFromHRV = min(60, max(0, ((biometrics.heartRateVariability ?? 30) - 20) * 2))
        let parasympatheticFromHR = biometrics.heartRate < 70 ? (70 - biometrics.heartRate) * 0.8 : 0.0
        let parasympathetic = min(100, max(0, parasympatheticFromHRV + parasympatheticFromHR))

        return (sympathetic, parasympathetic)
    }

    // MARK: - Consciousness Metrics Calculation

    private func calculateConsciousnessMetrics(
        elemental: ElementalBalance,
        coherence: Double,
        sympathetic: Double,
        parasympathetic: Double
    ) -> (depth: Double, clarity: Double, integration: Double) {

        // Depth - how deep into consciousness we're accessing
        let depth = min(100, (coherence * 70) + (elemental.aether * 0.3))

        // Clarity - mental clarity and communication
        let clarity = min(100, (elemental.air * 0.6) + (elemental.fire * 0.4))

        // Integration - mind-body unity
        let autonomicBalance = abs(parasympathetic - sympathetic) / 100.0
        let elementalIntegration = elemental.harmony
        let integration = min(100, ((1.0 - autonomicBalance) * 50) + (elementalIntegration * 0.5))

        return (depth, clarity, integration)
    }

    // MARK: - Insights Generation

    private func generateInsights(elemental: ElementalBalance, coherence: Double, biometrics: BiometricData) -> [String] {
        var insights: [String] = []

        // Dominant element insight
        let dominant = elemental.dominant
        insights.append("Your \(dominant.emoji) \(dominant.rawValue) element is leading (\(Int(getValue(for: dominant, from: elemental)))%)")

        // Coherence insights
        if coherence > 0.8 {
            insights.append("✨ Exceptional coherence - unified consciousness active")
        } else if coherence > 0.6 {
            insights.append("🌟 Good coherence - balanced awareness flowing")
        } else if coherence < 0.4 {
            insights.append("🌀 Lower coherence - integration opportunity present")
        }

        // Elemental specific insights
        if elemental.fire > 80 {
            insights.append("🔥 High vitality - powerful life force energy")
        }
        if elemental.water > 75 {
            insights.append("🌊 Deep flow state - emotional wisdom accessible")
        }
        if elemental.earth > 70 {
            insights.append("🌍 Strong grounding - embodied presence stable")
        }
        if elemental.air > 75 {
            insights.append("💨 Clear mental state - communication flowing")
        }
        if elemental.aether > 70 {
            insights.append("✨ High integration - transcendent awareness")
        }

        // HRV insights
        if let hrv = biometrics.heartRateVariability {
            if hrv > 60 {
                insights.append("💓 Excellent HRV - strong resilience")
            } else if hrv < 25 {
                insights.append("💓 Low HRV - rest and recovery needed")
            }
        }

        return insights
    }

    // MARK: - Recommendations Generation

    private func generateRecommendations(presenceMode: PresenceMode, elemental: ElementalBalance) -> [String] {
        var recommendations: [String] = []

        // Presence mode recommendations
        switch presenceMode {
        case .dialogue:
            recommendations.append("Perfect for active conversation and collaboration")
        case .patient:
            recommendations.append("Ideal time for inner exploration and receptive work")
        case .scribe:
            recommendations.append("Witnessing consciousness - excellent for meditation")
        }

        // Elemental balance recommendations
        if elemental.fire < 30 {
            recommendations.append("🔥 Boost energy with movement or energizing breath")
        }
        if elemental.water < 40 {
            recommendations.append("🌊 Enhance flow with relaxation or gentle movement")
        }
        if elemental.earth < 35 {
            recommendations.append("🌍 Strengthen grounding through nature connection")
        }
        if elemental.air < 40 {
            recommendations.append("💨 Support clarity with conscious breathing")
        }
        if elemental.aether < 30 {
            recommendations.append("✨ Cultivate integration through unified practices")
        }

        return recommendations
    }

    // MARK: - Helper Methods

    private func addToHistory(_ biometrics: BiometricData) {
        biometricHistory.append(biometrics)
        if biometricHistory.count > maxHistorySize {
            biometricHistory.removeFirst()
        }
    }

    private func calculateHRVStability() -> Double {
        guard biometricHistory.count >= 3 else { return 0.5 }

        let recentHRVs = biometricHistory.suffix(5).compactMap { $0.heartRateVariability }
        guard recentHRVs.count >= 2 else { return 0.5 }

        let mean = recentHRVs.reduce(0, +) / Double(recentHRVs.count)
        let variance = recentHRVs.map { pow($0 - mean, 2) }.reduce(0, +) / Double(recentHRVs.count)
        let stability = max(0, 1.0 - (variance / 100.0))

        return stability
    }

    private func calculateElementalHarmony(_ fire: Double, _ water: Double, _ earth: Double, _ air: Double) -> Double {
        let elements = [fire, water, earth, air]
        let mean = elements.reduce(0, +) / Double(elements.count)
        let variance = elements.map { pow($0 - mean, 2) }.reduce(0, +) / Double(elements.count)
        return max(0, 100 - variance)
    }

    private func getValue(for element: Element, from balance: ElementalBalance) -> Double {
        switch element {
        case .fire: return balance.fire
        case .water: return balance.water
        case .earth: return balance.earth
        case .air: return balance.air
        case .aether: return balance.aether
        }
    }

    // MARK: - Public Interface for Trends

    func getConsciousnessTrends() -> (coherenceTrend: String, dominantElementTrend: [String]) {
        guard consciousnessHistory.count >= 3 else {
            return ("stable", [])
        }

        // Coherence trend
        let recentCoherence = consciousnessHistory.suffix(5).map { $0.coherenceLevel }
        let earlierCoherence = consciousnessHistory.suffix(10).prefix(5).map { $0.coherenceLevel }

        let recentAvg = recentCoherence.reduce(0, +) / Double(recentCoherence.count)
        let earlierAvg = earlierCoherence.reduce(0, +) / Double(max(1, earlierCoherence.count))

        let change = (recentAvg - earlierAvg) / earlierAvg
        let coherenceTrend = change > 0.05 ? "rising" : (change < -0.05 ? "falling" : "stable")

        // Dominant element trend
        let dominantElements = consciousnessHistory.suffix(10).map { $0.elementalBalance.dominant.rawValue }

        return (coherenceTrend, dominantElements)
    }
}