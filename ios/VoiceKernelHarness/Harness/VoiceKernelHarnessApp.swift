// KERNEL-00 · harness app. Not MAIA. No STT, no TTS, no LLM, no Web, no network.
// Tap Start · Play tone · Cancel · inject faults · watch the organism · export
// the flight recorder for the witness record.
import SwiftUI

@main
struct VoiceKernelHarnessApp: App {
    var body: some Scene {
        WindowGroup {
            HarnessView()
        }
    }
}
