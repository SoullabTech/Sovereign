import XCTest

// DRIVER-01 — external witness instrument for the KERNEL-00 harness.
//
// Constraints (founder, 2026-09-12), each enforced here or by the source gate:
//  1. External control only: launch/terminate, read state, read labels, tap the visible
//     buttons. No VoiceKernel API, no internal state, no UserDefaults, no faults, no hooks.
//  2. No debugger, no launch arguments, no launch environment on the app under test.
//  3. Cold process demonstrated: `state == .notRunning` asserted before launch (the Mac
//     additionally verifies process absence with devicectl before every invocation).
//  A failed DRIVER operation is not an audio sample: such failures are reported with the
//  prefix "DRIVER/INFRASTRUCTURE FAILURE" and a precondition miss with "PRECONDITION-FAILED";
//  the Mac orchestrator ledgers them as driver rows, never as VoiceKernel classes.
//
// Configuration reaches the TEST RUNNER (never the harness) through the runner's own
// environment, which `xcodebuild` populates from TEST_RUNNER_*-prefixed variables:
//   K00_MODE   I (SpringBoard icon tap, primary) | L (XCUIApplication.launch, fallback)
//   K00_VP     on | off        (the harness's own visible toggle; default on)
//   K00_HOLD_S seconds to hold in conversation before Export (default 15)
//   K00_W4_MS  W4 target: milliseconds between Enter and Leave (default 500)
final class K00DriverTests: XCTestCase {

    static let harnessBundleID = "life.soullab.voicekernel.k00"
    static let harnessIconLabel = "VoiceKernel K00"   // CFBundleDisplayName of the harness
    static let springboardBundleID = "com.apple.springboard"

    private var harness: XCUIApplication { XCUIApplication(bundleIdentifier: Self.harnessBundleID) }
    private var springboard: XCUIApplication { XCUIApplication(bundleIdentifier: Self.springboardBundleID) }

    private var env: [String: String] { ProcessInfo.processInfo.environment }
    private var mode: String { env["K00_MODE"] ?? "I" }
    private var vpOn: Bool { (env["K00_VP"] ?? "on").lowercased() != "off" }
    private var holdSeconds: TimeInterval { TimeInterval(env["K00_HOLD_S"] ?? "15") ?? 15 }
    private var w4TargetMs: Int { Int(env["K00_W4_MS"] ?? "500") ?? 500 }

    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    // MARK: - Samples

    /// One cold sample: precondition → launch → set VP → Enter → hold → Export → terminate.
    func testOneSample() throws {
        try requireCold()
        try launchCold()
        try setVoiceProcessing(on: vpOn)
        try tap("Enter conversation", timeout: 5)
        Thread.sleep(forTimeInterval: holdSeconds)
        try exportAndTerminate()
    }

    /// W4 in-flight exit: precondition → launch → VP → Enter → (target ms) → Leave → 3 s → Export.
    /// The driver's sleep is NOT evidence; the ledger judges Enter→Leave from the journal.
    func testW4Sample() throws {
        try requireCold()
        try launchCold()
        try setVoiceProcessing(on: vpOn)
        let enter = harness.buttons["Enter conversation"]
        guard enter.waitForExistence(timeout: 5) else { return driverFail("Enter conversation button not found") }
        enter.tap()
        Thread.sleep(forTimeInterval: TimeInterval(w4TargetMs) / 1000.0)
        let leave = harness.buttons["Leave"]
        guard leave.waitForExistence(timeout: 2) else { return driverFail("Leave button not found after Enter") }
        leave.tap()
        Thread.sleep(forTimeInterval: 3)
        try exportAndTerminate()
    }

    /// Terminate-only: used by the orchestrator when a harness process is found lingering.
    func testTerminateOnly() throws {
        let app = harness
        if app.state != .notRunning {
            app.terminate()
            guard app.wait(for: .notRunning, timeout: 10) else { return driverFail("harness did not terminate") }
        }
    }

    // MARK: - Steps

    private func requireCold() throws {
        let app = harness
        if app.state != .notRunning {
            XCTFail("PRECONDITION-FAILED: harness process present before launch (state=\(app.state.rawValue))")
        }
    }

    private func launchCold() throws {
        let app = harness
        switch mode {
        case "L":
            // Fallback mode: testmanagerd launches the process. No arguments, no environment.
            app.launch()
        default:
            // Primary mode: SpringBoard icon tap — the nearest reproduction of the manual act.
            // Two Home presses: the first leaves whatever is in front, the second returns SpringBoard to
            // its first page. Mode I is still one SpringBoard icon tap; this only makes the page determinate.
            XCUIDevice.shared.press(.home)
            Thread.sleep(forTimeInterval: 0.5)
            XCUIDevice.shared.press(.home)
            let sb = springboard
            sb.activate()
            let matches = sb.icons.matching(NSPredicate(format: "label == %@", Self.harnessIconLabel))
            guard matches.firstMatch.waitForExistence(timeout: 5) else {
                return driverFail("icon '\(Self.harnessIconLabel)' not found on the current Home Screen page")
            }
            // CALIBRATION-01/-03: SpringBoard can expose several elements with this label (a page icon, the
            // App Library entry, a Spotlight suggestion); the first match had a zero frame and tap() refused it.
            // Take the one that is actually on screen; if none is, name the state — the driver does not go looking.
            let all = matches.allElementsBoundByIndex
            guard let icon = all.first(where: { $0.isHittable }) else {
                let frames = all.map { "\($0.frame)" }.joined(separator: " · ")
                return driverFail("icon '\(Self.harnessIconLabel)' present \(all.count)× but none hittable (frames \(frames)) — not on the visible Home Screen page")
            }
            icon.tap()
        }
        guard app.wait(for: .runningForeground, timeout: 15) else {
            return driverFail("harness did not reach foreground after launch (mode \(mode))")
        }
        // The harness must be idle at a cold start; its own controls tell us.
        guard harness.buttons["Enter conversation"].waitForExistence(timeout: 10) else {
            return driverFail("harness foreground but 'Enter conversation' not visible (not idle, or UI changed)")
        }
    }

    private func setVoiceProcessing(on: Bool) throws {
        let onLabel = "Voice processing: ON (default)"
        let offLabel = "Voice processing: OFF (control run)"
        let app = harness
        let isOn = app.buttons[onLabel].exists
        let isOff = app.buttons[offLabel].exists
        guard isOn || isOff else { return driverFail("voice processing control not visible") }
        if on && isOff { app.buttons[offLabel].tap() }
        if !on && isOn { app.buttons[onLabel].tap() }
        Thread.sleep(forTimeInterval: 0.3)
        let want = on ? onLabel : offLabel
        guard app.buttons[want].waitForExistence(timeout: 3) else { return driverFail("voice processing did not reach '\(want)'") }
    }

    private func tap(_ label: String, timeout: TimeInterval) throws {
        let b = harness.buttons[label]
        guard b.waitForExistence(timeout: timeout) else { return driverFail("button '\(label)' not found") }
        b.tap()
    }

    /// Export writes kernel00-<session>-<epoch>.jsonl into the app container's tmp/ BEFORE the
    /// share sheet is presented; the Mac pulls it from there. The sheet is not used: the sample
    /// ends by terminating the harness, which is also the next sample's cold precondition.
    private func exportAndTerminate() throws {
        try tap("Export journal", timeout: 5)
        Thread.sleep(forTimeInterval: 1.5)   // let the file write land before the process ends
        let app = harness
        app.terminate()
        guard app.wait(for: .notRunning, timeout: 10) else { return driverFail("harness did not terminate after export") }
    }

    private func driverFail(_ why: String) {
        XCTFail("DRIVER/INFRASTRUCTURE FAILURE: \(why)")
    }
}
