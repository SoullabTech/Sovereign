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
//   K00_SUBJECT p5b0 | phase-a | vpio-01 | vpio-02   (default p5b0) — VPIO-01B / VPIO-02B (founder rulings 2026-09-14): selects which
//              installed bundle the DRIVER addresses and which Home Screen label it looks for. The subject
//              configures the driver only; the app under test still receives no launch arguments, no launch
//              environment, no hooks — the harness never learns the subject. An unknown value is a
//              DRIVER/INFRASTRUCTURE FAILURE before any launch; it never falls through to the K00 bundle.
//   K00_CANCEL_AT_MS · K00_SETTLE_S — K00-05/06 output act only (founder ruling 2026-09-14, Option C): the batch forwards
//              them solely under `--act output`; testOutputSample reads them with the ruled defaults 1000 / 2. They configure
//              the DRIVER's taps and sleeps; the harness still receives nothing. The driver's sleeps are never evidence —
//              every K00-05/06 reading comes from the journal (k00-output-ledger.py).
final class K00DriverTests: XCTestCase {

    /// The explicit subject table (VPIO-01B). Historical p5b0 / phase-a share the K00 bundle and label.
    struct Subject { let key: String; let bundleID: String; let iconLabel: String }
    static let subjects: [String: Subject] = [
        "p5b0":    Subject(key: "p5b0",    bundleID: "life.soullab.voicekernel.k00",    iconLabel: "VoiceKernel K00"),
        "phase-a": Subject(key: "phase-a", bundleID: "life.soullab.voicekernel.k00",    iconLabel: "VoiceKernel K00"),
        "vpio-01": Subject(key: "vpio-01", bundleID: "life.soullab.voicekernel.vpio01", iconLabel: "VoiceKernel VPIO-01"),
        "vpio-02": Subject(key: "vpio-02", bundleID: "life.soullab.voicekernel.vpio02", iconLabel: "VoiceKernel VPIO-02"),
    ]
    static let springboardBundleID = "com.apple.springboard"
    /// C-D20 (founder ruling 2026-09-14/15, after the K00-0506 first witness returned ten `'Play 3 s tone' not found after
    /// Enter` rows): the Output section may sit below the fold of the harness List after Enter. The driver may reveal it by at
    /// most this many upward swipes, checking the exact label after each; never an unbounded search. A reveal or a hierarchy
    /// dump is never an audio outcome. The causal explanation is unproven; the bound is the ruling.
    static let revealSwipeLimit = 4
    struct DriverError: Error, CustomStringConvertible { let description: String }

    private var subject: Subject!
    private var harness: XCUIApplication { XCUIApplication(bundleIdentifier: subject.bundleID) }
    private var springboard: XCUIApplication { XCUIApplication(bundleIdentifier: Self.springboardBundleID) }

    private var env: [String: String] { ProcessInfo.processInfo.environment }
    private var mode: String { env["K00_MODE"] ?? "I" }
    private var vpOn: Bool { (env["K00_VP"] ?? "on").lowercased() != "off" }
    private var holdSeconds: TimeInterval { TimeInterval(env["K00_HOLD_S"] ?? "15") ?? 15 }
    private var w4TargetMs: Int { Int(env["K00_W4_MS"] ?? "500") ?? 500 }
    private var cancelAtMs: Int { Int(env["K00_CANCEL_AT_MS"] ?? "1000") ?? 1000 }
    private var settleSeconds: TimeInterval { TimeInterval(env["K00_SETTLE_S"] ?? "2") ?? 2 }

    override func setUpWithError() throws {
        continueAfterFailure = false
        let key = env["K00_SUBJECT"] ?? "p5b0"
        guard let s = Self.subjects[key] else {
            throw DriverError(description: "DRIVER/INFRASTRUCTURE FAILURE: unknown subject '\(key)' (p5b0 | phase-a | vpio-01 | vpio-02); no launch attempted")
        }
        subject = s
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

    /// K00-05/06 output act (founder ruling 2026-09-14, Option C): precondition → launch → VP → Enter →
    /// wait until the harness itself enables "Play 3 s tone" (it does so only at floor == listening with output
    /// enabled; ≤ 5 s, else the row is ENTRY-NOT-REACHED and the journal is still exported) → settle →
    /// Play → (cancel-at ms) → "Cancel active" if the harness offers it (else NOT-A-CANCEL marker) →
    /// 1 s (the P5 measurement is due at 300 ms) → second Play left to complete → 4.5 s → Export → terminate.
    /// The driver taps only the harness's existing visible buttons; it never fails a sample on an audio
    /// outcome — markers prefixed "K00-OUTPUT:" name what the driver could not do, and the ledger decides.
    func testOutputSample() throws {
        try requireCold()
        try launchCold()
        try setVoiceProcessing(on: vpOn)
        try tap("Enter conversation", timeout: 5)
        let play = harness.buttons["Play 3 s tone"]
        if !play.waitForExistence(timeout: 5) {
            var revealed = false
            for i in 1...Self.revealSwipeLimit {
                harness.swipeUp()
                Thread.sleep(forTimeInterval: 0.5)
                revealed = harness.buttons["Play 3 s tone"].exists
                note("K00-OUTPUT: reveal swipe \(i)/\(Self.revealSwipeLimit) — 'Play 3 s tone' exists: \(revealed)")
                if revealed { break }
            }
            if !revealed {
                for line in harness.debugDescription.split(separator: "\n", omittingEmptySubsequences: true) { note("K00-HIERARCHY: \(line)") }
                return driverFail("'Play 3 s tone' not found after Enter (absent after \(Self.revealSwipeLimit) reveal swipes; hierarchy written under K00-HIERARCHY:)")
            }
        }
        guard waitEnabled(play, timeout: 5) else {
            note("K00-OUTPUT: entry not reached — 'Play 3 s tone' not enabled within 5 s; no Play tapped (ENTRY-NOT-REACHED)")
            try exportAndTerminate(); return
        }
        Thread.sleep(forTimeInterval: settleSeconds)
        play.tap()
        note("K00-OUTPUT: Play 1 tapped")
        Thread.sleep(forTimeInterval: TimeInterval(cancelAtMs) / 1000.0)
        let cancel = harness.buttons["Cancel active"]
        if cancel.exists && cancel.isEnabled {
            cancel.tap()
            note("K00-OUTPUT: Cancel active tapped at ≈\(cancelAtMs) ms after Play 1")
        } else {
            note("K00-OUTPUT: Cancel active not enabled at ≈\(cancelAtMs) ms after Play 1 (NOT-A-CANCEL-ROW)")
        }
        Thread.sleep(forTimeInterval: 1.0)
        if waitEnabled(play, timeout: 3) {
            play.tap()
            note("K00-OUTPUT: Play 2 tapped (left to complete)")
        } else {
            note("K00-OUTPUT: 'Play 3 s tone' not enabled for Play 2 within 3 s; second stream not scheduled")
        }
        Thread.sleep(forTimeInterval: 4.5)
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
            let matches = sb.icons.matching(NSPredicate(format: "label == %@", subject.iconLabel))
            guard matches.firstMatch.waitForExistence(timeout: 5) else {
                return driverFail("icon '\(subject.iconLabel)' not found on the current Home Screen page")
            }
            // CALIBRATION-01/-03: SpringBoard can expose several elements with this label (a page icon, the
            // App Library entry, a Spotlight suggestion); the first match had a zero frame and tap() refused it.
            // Take the one that is actually on screen; if none is, name the state — the driver does not go looking.
            let all = matches.allElementsBoundByIndex
            guard let icon = all.first(where: { $0.isHittable }) else {
                let frames = all.map { "\($0.frame)" }.joined(separator: " · ")
                return driverFail("icon '\(subject.iconLabel)' present \(all.count)× but none hittable (frames \(frames)) — not on the visible Home Screen page")
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

    /// Poll the harness's own enabled state for a button (it is the harness's projection of kernel
    /// state, e.g. Play is enabled only at floor == listening). Read only; never a wait on an audio outcome.
    private func waitEnabled(_ b: XCUIElement, timeout: TimeInterval) -> Bool {
        let deadline = Date().addingTimeInterval(timeout)
        while Date() < deadline {
            if b.exists && b.isEnabled { return true }
            Thread.sleep(forTimeInterval: 0.1)
        }
        return b.exists && b.isEnabled
    }

    /// A driver marker in the xcodebuild log (never an XCTFail): the ledger reads the journal, the marker only
    /// records what the driver did or could not do.
    private func note(_ line: String) {
        NSLog("%@", line)
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
