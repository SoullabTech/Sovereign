// swift-tools-version: 5.9
//
// VOICE-2026 · KERNEL-00 — the physical conversational audio organism.
//
// Opened by founder act 2026-09-11 under the ratified acceptance law
// (docs/programme/VOICE-2026/ARCH-01/06_KERNEL-00_ACCEPTANCE_LAW.md).
//
// This package contains ONLY: VoiceKernel (actor), AudioSessionAuthority,
// the duplex native audio graph, HealthSupervisor, RecoveryPolicy,
// StateProjection, the flight recorder, replay, and fault injection.
// No STT. No TTS. No LLM. No Web audio. No canonical MAIA. No legacy voice
// components. No network egress. No dependencies.
//
// The pure-logic targets (HealthSupervisor, RecoveryPolicy, Replay,
// generation gating) are platform-neutral so `swift test` runs on macOS;
// AudioSessionAuthority is iOS-only by construction.
import PackageDescription

let package = Package(
    name: "VoiceKernel",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [
        .library(name: "VoiceKernel", targets: ["VoiceKernel"]),
    ],
    dependencies: [],
    targets: [
        .target(
            name: "VoiceKernel",
            dependencies: [],
            path: "Sources/VoiceKernel"
        ),
        .testTarget(
            name: "VoiceKernelTests",
            dependencies: ["VoiceKernel"],
            path: "Tests/VoiceKernelTests"
        ),
    ],
    swiftLanguageVersions: [.v5]
)
