/**
 * 🌟⌚ MAIA Consciousness Watch Interface
 * Beautiful real-time visualization of consciousness state and biometrics
 * Optimized for Apple Watch screen with intuitive interactions
 */

import SwiftUI
import HealthKit

struct ContentView: View {
    @EnvironmentObject var healthKitManager: HealthKitManager
    @EnvironmentObject var connectivityManager: WatchConnectivityManager
    @EnvironmentObject var consciousnessCalculator: ConsciousnessCalculator

    @State private var selectedTab = 0
    @State private var showingPermissionAlert = false
    @State private var sessionActive = false

    var body: some View {
        TabView(selection: $selectedTab) {
            // Main Consciousness View
            ConsciousnessView()
                .tag(0)

            // Biometrics View
            BiometricsView()
                .tag(1)

            // Session Control View
            SessionView(sessionActive: $sessionActive)
                .tag(2)

            // Connection Status View
            ConnectionView()
                .tag(3)
        }
        .tabViewStyle(PageTabViewStyle())
        .indexViewStyle(PageIndexViewStyle(backgroundDisplayMode: .always))
        .onAppear {
            setupInitialState()
        }
        .alert("Health Access Required", isPresented: $showingPermissionAlert) {
            Button("Open Settings") {
                // This will be handled by the iPhone app
                connectivityManager.requestiPhoneHealthPermissions()
            }
            Button("Cancel", role: .cancel) { }
        } message: {
            Text("MAIA needs access to your health data to provide consciousness insights. Please grant access in the Health app.")
        }
    }

    private func setupInitialState() {
        if !healthKitManager.isAuthorized {
            showingPermissionAlert = true
        }
    }
}

// MARK: - Main Consciousness Visualization

struct ConsciousnessView: View {
    @EnvironmentObject var consciousnessCalculator: ConsciousnessCalculator
    @EnvironmentObject var healthKitManager: HealthKitManager

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                // Header with current mode
                HStack {
                    Image(systemName: presenceModeIcon)
                        .foregroundColor(presenceModeColor)
                        .font(.title2)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("MAIA")
                            .font(.headline)
                            .foregroundColor(.primary)
                        Text(consciousnessCalculator.currentState.presenceMode.capitalized)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    Spacer()
                }

                // Coherence Score Ring
                CoherenceRingView(score: consciousnessCalculator.currentState.coherenceScore)

                // Elemental Balance Visualization
                ElementalBalanceView(balance: consciousnessCalculator.currentState.elementalBalance)

                // Latest Insight
                if let insight = consciousnessCalculator.currentState.insights.first {
                    InsightCardView(insight: insight)
                }
            }
            .padding(.horizontal, 8)
        }
        .navigationTitle("Consciousness")
    }

    private var presenceModeIcon: String {
        switch consciousnessCalculator.currentState.presenceMode {
        case "scribe": return "pencil.circle.fill"
        case "patient": return "heart.circle.fill"
        case "dialogue": return "bubble.left.and.bubble.right.fill"
        default: return "circle.fill"
        }
    }

    private var presenceModeColor: Color {
        switch consciousnessCalculator.currentState.presenceMode {
        case "scribe": return .blue
        case "patient": return .green
        case "dialogue": return .orange
        default: return .gray
        }
    }
}

// MARK: - Coherence Ring Visualization

struct CoherenceRingView: View {
    let score: Double
    @State private var animatedScore: Double = 0

    var body: some View {
        ZStack {
            // Background ring
            Circle()
                .stroke(Color.gray.opacity(0.3), lineWidth: 8)
                .frame(width: 100, height: 100)

            // Progress ring
            Circle()
                .trim(from: 0, to: animatedScore)
                .stroke(
                    LinearGradient(
                        gradient: Gradient(colors: [.red, .orange, .yellow, .green, .blue]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    style: StrokeStyle(lineWidth: 8, lineCap: .round)
                )
                .frame(width: 100, height: 100)
                .rotationEffect(.degrees(-90))

            // Center text
            VStack(spacing: 2) {
                Text("\(Int(score * 100))")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                Text("coherence")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 1.5)) {
                animatedScore = score
            }
        }
        .onChange(of: score) { newScore in
            withAnimation(.easeInOut(duration: 0.5)) {
                animatedScore = newScore
            }
        }
    }
}

// MARK: - Elemental Balance Visualization

struct ElementalBalanceView: View {
    let balance: ElementalBalance

    private let elements: [(String, String, KeyPath<ElementalBalance, Double>)] = [
        ("🔥", "Fire", \ElementalBalance.fire),
        ("💧", "Water", \ElementalBalance.water),
        ("🌍", "Earth", \ElementalBalance.earth),
        ("💨", "Air", \ElementalBalance.air),
        ("✨", "Aether", \ElementalBalance.aether)
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Elemental Balance")
                .font(.headline)
                .foregroundColor(.primary)

            ForEach(elements, id: \.1) { emoji, name, keyPath in
                ElementRowView(
                    emoji: emoji,
                    name: name,
                    value: balance[keyPath: keyPath]
                )
            }
        }
        .padding(.vertical, 8)
    }
}

struct ElementRowView: View {
    let emoji: String
    let name: String
    let value: Double

    var body: some View {
        HStack(spacing: 8) {
            Text(emoji)
                .font(.title3)

            Text(name)
                .font(.caption)
                .foregroundColor(.primary)
                .frame(width: 40, alignment: .leading)

            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                        .frame(height: 4)

                    Rectangle()
                        .fill(elementColor)
                        .frame(width: geometry.size.width * (value / 100), height: 4)
                }
            }
            .frame(height: 4)

            Text("\(Int(value))")
                .font(.caption2)
                .foregroundColor(.secondary)
                .frame(width: 20, alignment: .trailing)
        }
    }

    private var elementColor: Color {
        switch name {
        case "Fire": return .red
        case "Water": return .blue
        case "Earth": return .brown
        case "Air": return .gray
        case "Aether": return .purple
        default: return .gray
        }
    }
}

// MARK: - Insight Card

struct InsightCardView: View {
    let insight: ConsciousnessInsight

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(insight.category.uppercased())
                    .font(.caption2)
                    .fontWeight(.semibold)
                    .foregroundColor(.secondary)

                Spacer()

                Text("\(Int(insight.confidence * 100))%")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }

            Text(insight.message)
                .font(.caption)
                .foregroundColor(.primary)
                .multilineTextAlignment(.leading)
        }
        .padding(8)
        .background(Color.gray.opacity(0.1))
        .cornerRadius(8)
    }
}

// MARK: - Biometrics View

struct BiometricsView: View {
    @EnvironmentObject var healthKitManager: HealthKitManager

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                Text("Biometrics")
                    .font(.headline)
                    .foregroundColor(.primary)

                if let biometrics = healthKitManager.currentBiometrics {
                    VStack(spacing: 8) {
                        BiometricRowView(
                            icon: "heart.fill",
                            label: "Heart Rate",
                            value: "\(Int(biometrics.heartRate)) BPM",
                            color: .red
                        )

                        if let hrv = biometrics.heartRateVariability {
                            BiometricRowView(
                                icon: "waveform.path.ecg",
                                label: "HRV",
                                value: "\(Int(hrv)) ms",
                                color: .green
                            )
                        }

                        if let respRate = biometrics.respiratoryRate {
                            BiometricRowView(
                                icon: "lungs.fill",
                                label: "Breathing",
                                value: "\(Int(respRate))/min",
                                color: .blue
                            )
                        }

                        if let oxygen = biometrics.oxygenSaturation {
                            BiometricRowView(
                                icon: "drop.fill",
                                label: "SpO2",
                                value: "\(Int(oxygen))%",
                                color: .purple
                            )
                        }

                        BiometricRowView(
                            icon: "brain.head.profile",
                            label: "Coherence",
                            value: "\(Int(biometrics.coherenceLevel * 100))%",
                            color: .orange
                        )
                    }
                } else {
                    Text("No biometric data available")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .padding()
                }
            }
            .padding(.horizontal, 8)
        }
        .navigationTitle("Biometrics")
    }
}

struct BiometricRowView: View {
    let icon: String
    let label: String
    let value: String
    let color: Color

    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(color)
                .frame(width: 20)

            Text(label)
                .font(.caption)
                .foregroundColor(.primary)

            Spacer()

            Text(value)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(.primary)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color.gray.opacity(0.1))
        .cornerRadius(8)
    }
}

// MARK: - Session Control View

struct SessionView: View {
    @Binding var sessionActive: Bool
    @EnvironmentObject var healthKitManager: HealthKitManager
    @EnvironmentObject var connectivityManager: WatchConnectivityManager

    var body: some View {
        VStack(spacing: 16) {
            Text("Session")
                .font(.headline)
                .foregroundColor(.primary)

            // Session status
            VStack(spacing: 8) {
                Image(systemName: sessionActive ? "record.circle.fill" : "play.circle")
                    .font(.largeTitle)
                    .foregroundColor(sessionActive ? .red : .green)

                Text(sessionActive ? "Recording" : "Ready")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            // Session control button
            Button(action: toggleSession) {
                Text(sessionActive ? "Stop Session" : "Start Session")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(sessionActive ? Color.red : Color.green)
                    .cornerRadius(12)
            }

            // Connection status
            HStack {
                Image(systemName: connectivityManager.isConnected ? "iphone" : "iphone.slash")
                    .foregroundColor(connectivityManager.isConnected ? .green : .red)

                Text(connectivityManager.connectionStatusDescription)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.horizontal, 16)
    }

    private func toggleSession() {
        if sessionActive {
            healthKitManager.stopConsciousnessSession()
            connectivityManager.sendSessionStatus(status: .ended)
            sessionActive = false
        } else {
            healthKitManager.startConsciousnessSession()
            connectivityManager.sendSessionStatus(status: .started)
            sessionActive = true
        }
    }
}

// MARK: - Connection Status View

struct ConnectionView: View {
    @EnvironmentObject var connectivityManager: WatchConnectivityManager

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                Text("Connection")
                    .font(.headline)
                    .foregroundColor(.primary)

                // Connection status card
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Image(systemName: connectivityManager.isConnected ? "checkmark.circle.fill" : "xmark.circle.fill")
                            .foregroundColor(connectivityManager.isConnected ? .green : .red)

                        Text("iPhone Connection")
                            .font(.caption)
                            .fontWeight(.medium)
                    }

                    Text(connectivityManager.connectionStatusDescription)
                        .font(.caption2)
                        .foregroundColor(.secondary)

                    if let lastSync = connectivityManager.lastSyncTime {
                        Text("Last sync: \(lastSync, style: .time)")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(12)
                .background(Color.gray.opacity(0.1))
                .cornerRadius(8)

                // Manual sync button
                Button("Force Sync") {
                    connectivityManager.forceSyncAttempt()
                }
                .font(.caption)
                .foregroundColor(.blue)
                .padding(8)
                .background(Color.blue.opacity(0.1))
                .cornerRadius(6)

                // Error display
                if let error = connectivityManager.connectionError {
                    Text(error)
                        .font(.caption2)
                        .foregroundColor(.red)
                        .multilineTextAlignment(.center)
                        .padding(8)
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(6)
                }
            }
            .padding(.horizontal, 8)
        }
        .navigationTitle("Connection")
    }
}

// MARK: - Preview

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(HealthKitManager())
            .environmentObject(WatchConnectivityManager())
            .environmentObject(ConsciousnessCalculator())
    }
}