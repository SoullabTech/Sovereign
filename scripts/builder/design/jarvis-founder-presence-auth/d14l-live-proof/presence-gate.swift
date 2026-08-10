// JARVIS Desktop D-14L — Live Founder Presence Proof (TEST-ONLY substrate)
//
// REVISED after a live finding: an unsigned/ad-hoc-compiled CLI binary on
// this Mac (macOS 15.7.8) cannot create ANY permanent Keychain SecKey item
// with an access-control policy (kSecAttrAccessControl) — SecKeyCreateRandomKey
// fails with OSStatus -34018 (missing entitlement) whether or not the key is
// Secure-Enclave-backed. This is a property of code-signing/entitlements on
// this OS version, not evidence about D-14's architecture — a properly signed
// and provisioned Electron app bundle is a different code-signing posture
// than a bare `swiftc` output, and this finding is reported precisely as that
// scope boundary (see the D-14L record, §4/§5).
//
// What THIS binary tests instead, which needs no Keychain entitlement at all:
// LAContext.evaluatePolicy — candidate A from the D-14L mandate's §4 — gating
// a signing act. Each invocation is a fresh OS process with a fresh LAContext,
// so there is no long-lived process here that could cache authorization
// across signings (part of what "no cached authority" means, §11).
//
// Build:  xcrun swiftc presence-gate.swift -o presence-gate
// Usage:  ./presence-gate probe                    -- checks policy availability, no prompt
//         ./presence-gate authenticate "<reason>"  -- ONE interactive presence event

import Foundation
import LocalAuthentication

func jsonOut(_ dict: [String: Any]) {
    if let data = try? JSONSerialization.data(withJSONObject: dict, options: []),
       let str = String(data: data, encoding: .utf8) {
        print(str)
        fflush(stdout)
    } else {
        print("{\"ok\":false,\"error\":\"json_serialize_failed\"}")
    }
}

func probe() {
    let context = LAContext()
    var error: NSError?
    let canBiometrics = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
    let bioErr = error
    error = nil
    let canDeviceOwner = context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error)
    jsonOut([
        "ok": true, "step": "probe",
        "can_evaluate_biometrics": canBiometrics,
        "biometrics_error": bioErr == nil ? NSNull() : String(describing: bioErr!),
        "can_evaluate_device_owner": canDeviceOwner,
        "device_owner_error": error == nil ? NSNull() : String(describing: error!),
        "biometry_type": context.biometryType.rawValue,
    ])
}

// Blocking, synchronous wrapper around the async evaluatePolicy API — this is
// a fresh LAContext, so nothing here can be satisfied by a PRIOR invocation's
// success; each process run is its own presence event, requested fresh.
func authenticate(reason: String) {
    let context = LAContext()
    // No touchIDAuthenticationAllowableReuseDuration is set — it defaults to 0
    // (no reuse window). This is the exact property §3/§11 of the mandate asks
    // to establish: a second act must re-establish presence, not ride a grace
    // period. Left at the default deliberately, not tuned to make a test pass.
    let sem = DispatchSemaphore(value: 0)
    var resultOk = false
    var resultError: String? = nil
    context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: reason) { success, error in
        resultOk = success
        if let error = error { resultError = String(describing: error) }
        sem.signal()
    }
    sem.wait()
    jsonOut(["ok": resultOk, "step": "authenticate", "error": resultError ?? NSNull(),
             "biometry_type": context.biometryType.rawValue])
    exit(resultOk ? 0 : 1)
}

let args = CommandLine.arguments
guard args.count >= 2 else {
    jsonOut(["ok": false, "error": "usage: probe | authenticate <reason>"])
    exit(2)
}
switch args[1] {
case "probe": probe()
case "authenticate":
    let reason = args.count >= 3 ? args[2] : "D-14L proof: authorize a synthetic founder-presence signing act"
    authenticate(reason: reason)
default: jsonOut(["ok": false, "error": "unknown command '\(args[1])'"]); exit(2)
}
