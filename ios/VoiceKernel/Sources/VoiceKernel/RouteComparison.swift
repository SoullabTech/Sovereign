// KERNEL-00 / VPIO-01 · RouteComparison — pure port identity.
//
// Founder ruling 2026-09-14 (VPIO-01 plan §11 item 3): the one useful pure
// operation from the retired engine classifier, and nothing else. Two routes
// are the same route iff their output port and input port match. The input
// DATA SOURCE (Bottom / Front …) is evidence, never identity (PRE-WITNESS-04
// amendment 1). No session reads, timers, recovery knowledge or substrate
// knowledge live here.
import Foundation

public enum RouteComparison {
    public static func samePorts(_ a: RouteState?, _ b: RouteState?) -> Bool {
        guard let a = a, let b = b else { return false }
        return a.output == b.output && a.input == b.input
    }
}
