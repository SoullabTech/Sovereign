/**
 * ⌚ MAIA Apple Watch Consciousness Interface
 * Real-time biometric monitoring and elemental consciousness display
 */

import SwiftUI
import HealthKit
import WatchConnectivity

struct ContentView: View {
    @StateObject private var viewModel = MAIAWatchViewModel()
    @State private var isMonitoring = false

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 16) {
                    // MAIA Logo & Status
                    MAIAHeaderView(
                        isMonitoring: $isMonitoring,
                        presenceState: viewModel.presenceState
                    )

                    // Real-time Metrics
                    BiometricDisplayView(
                        heartRate: viewModel.currentHeartRate,
                        hrv: viewModel.currentHRV,
                        coherenceLevel: viewModel.coherenceLevel
                    )

                    // Elemental Balance Visualization
                    ElementalVisualization(
                        elementalState: viewModel.elementalBalance
                    )

                    // Presence Mode Indicator
                    PresenceModeView(
                        mode: viewModel.presenceState,
                        coherenceLevel: viewModel.coherenceLevel
                    )

                    // Control Buttons
                    HStack(spacing: 12) {
                        Button(action: {
                            if isMonitoring {
                                viewModel.stopMonitoring()
                            } else {
                                viewModel.startMonitoring()
                            }
                            isMonitoring.toggle()
                        }) {
                            Image(systemName: isMonitoring ? "stop.circle.fill" : "play.circle.fill")
                                .foregroundColor(isMonitoring ? .red : .green)
                                .font(.title2)
                        }
                        .buttonStyle(PlainButtonStyle())

                        Button(action: {
                            viewModel.sendBreathingSync()
                        }) {
                            Image(systemName: "lungs.fill")
                                .foregroundColor(.blue)
                                .font(.title3)
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                }
                .padding()
            }
            .navigationTitle("MAIA")
            .navigationBarTitleDisplayMode(.inline)
        }
        .onAppear {
            viewModel.setup()
        }
    }
}

// MARK: - MAIA Header View

struct MAIAHeaderView: View {
    @Binding var isMonitoring: Bool
    let presenceState: PresenceState

    var body: some View {
        VStack(spacing: 8) {
            // MAIA Logo with pulsing animation
            Text("🌟")
                .font(.largeTitle)
                .scaleEffect(isMonitoring ? 1.2 : 1.0)
                .animation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true), value: isMonitoring)

            Text("MAIA")
                .font(.headline.bold())
                .foregroundColor(.primary)

            // Status indicator
            HStack {
                Circle()
                    .fill(isMonitoring ? Color.green : Color.gray)
                    .frame(width: 8, height: 8)

                Text(isMonitoring ? "Active" : "Inactive")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            // Presence mode badge
            Text(presenceState.displayName.uppercased())
                .font(.caption2.bold())
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(presenceState.color.opacity(0.3))
                .foregroundColor(presenceState.color)
                .cornerRadius(8)
        }
    }
}

// MARK: - Biometric Display View

struct BiometricDisplayView: View {
    let heartRate: Double
    let hrv: Double
    let coherenceLevel: Double

    var body: some View {
        VStack(spacing: 12) {
            HStack {
                // Heart Rate
                VStack {
                    Image(systemName: "heart.fill")
                        .foregroundColor(.red)
                        .font(.title3)

                    Text("\(Int(heartRate))")
                        .font(.title2.bold())

                    Text("BPM")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }

                Spacer()

                // HRV
                VStack {
                    Image(systemName: "waveform.path.ecg")
                        .foregroundColor(.blue)
                        .font(.title3)

                    Text("\(Int(hrv))")
                        .font(.title2.bold())

                    Text("HRV")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }

            // Coherence Level
            VStack(spacing: 4) {
                Text("Coherence")
                    .font(.caption.bold())
                    .foregroundColor(.secondary)

                ZStack {
                    // Background circle
                    Circle()
                        .stroke(Color.gray.opacity(0.3), lineWidth: 6)
                        .frame(width: 60, height: 60)

                    // Progress circle
                    Circle()
                        .trim(from: 0, to: coherenceLevel)
                        .stroke(
                            coherenceLevel > 0.7 ? Color.green :
                            coherenceLevel > 0.4 ? Color.orange : Color.red,
                            style: StrokeStyle(lineWidth: 6, lineCap: .round)
                        )
                        .frame(width: 60, height: 60)
                        .rotationEffect(.degrees(-90))
                        .animation(.easeInOut(duration: 0.5), value: coherenceLevel)

                    // Percentage text
                    Text("\(Int(coherenceLevel * 100))%")
                        .font(.caption.bold())
                        .foregroundColor(.primary)
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

// MARK: - Elemental Visualization

struct ElementalVisualization: View {
    let elementalState: ElementalBalance

    var body: some View {
        VStack(spacing: 8) {
            Text("Elemental Balance")
                .font(.caption.bold())
                .foregroundColor(.secondary)

            HStack(spacing: 8) {
                ElementIndicator(element: .fire, level: elementalState.fire)
                ElementIndicator(element: .water, level: elementalState.water)
                ElementIndicator(element: .earth, level: elementalState.earth)
                ElementIndicator(element: .air, level: elementalState.air)
                ElementIndicator(element: .aether, level: elementalState.aether)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct ElementIndicator: View {
    let element: Element
    let level: Double

    var body: some View {
        VStack(spacing: 2) {
            Text(element.symbol)
                .font(.caption)

            ZStack {
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 20, height: 40)

                VStack {
                    Spacer()
                    Rectangle()
                        .fill(element.color)
                        .frame(width: 20, height: 40 * level)
                }
            }
            .cornerRadius(4)

            Text("\(Int(level * 100))")
                .font(.caption2)
                .foregroundColor(.secondary)
        }
    }
}

// MARK: - Presence Mode View

struct PresenceModeView: View {
    let mode: PresenceState
    let coherenceLevel: Double

    var body: some View {
        VStack(spacing: 8) {
            Text("Presence Mode")
                .font(.caption.bold())
                .foregroundColor(.secondary)

            HStack {
                Image(systemName: mode.iconName)
                    .foregroundColor(mode.color)
                    .font(.title2)

                VStack(alignment: .leading, spacing: 2) {
                    Text(mode.displayName)
                        .font(.headline.bold())
                        .foregroundColor(mode.color)

                    Text(mode.description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.leading)
                }

                Spacer()

                // Breathing guidance
                BreathingIndicator(mode: mode)
            }
        }
        .padding()
        .background(mode.color.opacity(0.1))
        .cornerRadius(12)
    }
}

struct BreathingIndicator: View {
    let mode: PresenceState
    @State private var breathingScale: CGFloat = 1.0

    var body: some View {
        ZStack {
            Circle()
                .fill(mode.color.opacity(0.3))
                .frame(width: 30, height: 30)
                .scaleEffect(breathingScale)

            Text("∞")
                .font(.title3)
                .foregroundColor(mode.color)
        }
        .onAppear {
            startBreathingAnimation()
        }
    }

    private func startBreathingAnimation() {
        let breathingCycle = mode.breathingCycle

        withAnimation(
            .easeInOut(duration: breathingCycle / 2)
            .repeatForever(autoreverses: true)
        ) {
            breathingScale = 1.3
        }
    }
}

// MARK: - Supporting Types

enum Element: CaseIterable {
    case fire, water, earth, air, aether

    var symbol: String {
        switch self {
        case .fire: return "🔥"
        case .water: return "🌊"
        case .earth: return "🌍"
        case .air: return "💨"
        case .aether: return "✨"
        }
    }

    var color: Color {
        switch self {
        case .fire: return .orange
        case .water: return .blue
        case .earth: return .brown
        case .air: return .gray
        case .aether: return .purple
        }
    }
}

enum PresenceState {
    case dialogue, patient, scribe

    var displayName: String {
        switch self {
        case .dialogue: return "Dialogue"
        case .patient: return "Patient"
        case .scribe: return "Scribe"
        }
    }

    var description: String {
        switch self {
        case .dialogue: return "Active support"
        case .patient: return "Deep exploration"
        case .scribe: return "Witnessing space"
        }
    }

    var color: Color {
        switch self {
        case .dialogue: return .green
        case .patient: return .orange
        case .scribe: return .purple
        }
    }

    var iconName: String {
        switch self {
        case .dialogue: return "message.circle.fill"
        case .patient: return "heart.circle.fill"
        case .scribe: return "eye.circle.fill"
        }
    }

    var breathingCycle: Double {
        switch self {
        case .dialogue: return 8.0  // 4s in, 4s out
        case .patient: return 12.0  // 6s in, 6s out
        case .scribe: return 18.0   // 9s in, 9s out
        }
    }
}

struct ElementalBalance {
    let fire: Double
    let water: Double
    let earth: Double
    let air: Double
    let aether: Double
}

// MARK: - Preview

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}