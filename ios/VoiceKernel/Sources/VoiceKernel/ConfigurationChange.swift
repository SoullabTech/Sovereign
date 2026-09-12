// PRE-WITNESS-04 §2.1 (founder amendment 1) — classification of an
// AVAudioEngineConfigurationChange notification, pure and one-shot.
//
// Run 3 (2026-09-12) established, on this device/runtime, that a
// voice-processing-enabled graph start is followed by exactly such a
// notification while the physical route stays put, and that with voice
// processing off it never arrives. The classifier names that ONE expected
// event per generation and nothing else: a later same-route change is not
// taught to the kernel as VP-caused merely because VP is on.
//
// Route identity for the comparison is the port pair (output/input). The
// input data source is deliberately NOT part of the identity: runs 2 and 3
// show it alternating `-` ↔ `Bottom` as part of the reconfiguration itself,
// so it is recorded as evidence, never compared.
import Foundation

public enum ConfigurationChangeClass: String, Sendable, Equatable {
    /// The one expected notification following a VP-enabled start on an unchanged route.
    case voiceProcessingReconfiguration = "voice_processing_reconfiguration"
    /// Everything else: the route actually changed, VP is off, the expectation is
    /// already consumed or retired, or an interruption/reset is in progress.
    case routeConfigurationChange = "route_configuration_change"
}

public struct ConfigurationChangeClassifier: Sendable {
    public struct Input: Sendable, Equatable {
        public var voiceProcessing: Bool
        public var expectationPending: Bool       // set at a VP-enabled graph_started; consumed on match; retired on healthy
        public var ordinalInGeneration: Int       // 1 = first change since this generation's start
        public var routeAtStart: RouteState?
        public var routeNow: RouteState?
        public var suspended: Bool                // interruption / media-services reset in progress
        public init(voiceProcessing: Bool, expectationPending: Bool, ordinalInGeneration: Int,
                    routeAtStart: RouteState?, routeNow: RouteState?, suspended: Bool) {
            self.voiceProcessing = voiceProcessing; self.expectationPending = expectationPending
            self.ordinalInGeneration = ordinalInGeneration; self.routeAtStart = routeAtStart
            self.routeNow = routeNow; self.suspended = suspended
        }
    }

    public static func samePorts(_ a: RouteState?, _ b: RouteState?) -> Bool {
        guard let a = a, let b = b else { return false }
        return a.output == b.output && a.input == b.input
    }

    public static func classify(_ i: Input) -> ConfigurationChangeClass {
        guard i.voiceProcessing, i.expectationPending, i.ordinalInGeneration == 1, !i.suspended,
              samePorts(i.routeAtStart, i.routeNow) else { return .routeConfigurationChange }
        return .voiceProcessingReconfiguration
    }
}
