// JARVIS Desktop D-14P — CLEAN RETEST (v2), built from clean source per the
// 2026-08-10 EXPERIMENT INVALIDATED ruling on the v1 substrate.
//
// Two hypotheses the v1 run never discriminated, tested here BEFORE any
// signing/provisioning escalation:
//
//   H1: kSecUseDataProtectionKeychain was never set. Per Apple TN3137, macOS
//       has two keychain implementations (legacy file-based, and the
//       data-protection keychain shared with iOS); SecAccessControl-gated
//       items are a data-protection-keychain feature and are NOT
//       automatically targeted without this key. If -34018 was actually
//       "wrong keychain," not "missing entitlement," this is a pure code
//       fix, no signing or provisioning required at all.
//
//   H2 (only if H1 alone doesn't clear it): the effective Team ID must be
//       read from the certificate's own X.509 Subject OU field, not
//       inferred from codesign's formatted display text or the certificate
//       label's parenthetical. Independently re-derived via `openssl x509`
//       in this retest: OU=ZVK2X646Z2 — matches what v1 eventually used
//       after self-correcting, now confirmed by a second, more
//       authoritative method rather than trusted on the first attempt.
//
// This file is a fresh, standalone artifact — never opened by `codesign
// --force` against the v1 bundle, so no residual-state contamination
// between attempts is possible. Compiled fresh into a fresh bundle each run.

import Foundation
import LocalAuthentication
import Security

let KEY_TAG = "com.soullab.jarvis.d14p-v2-test.clean-retest".data(using: .utf8)!

func jsonOut(_ dict: [String: Any]) {
    if let data = try? JSONSerialization.data(withJSONObject: dict, options: []),
       let str = String(data: data, encoding: .utf8) {
        print(str); fflush(stdout)
    } else {
        print("{\"ok\":false,\"error\":\"json_serialize_failed\"}")
    }
}

func makeAccess(secureEnclave: Bool) -> (SecAccessControl?, CFError?) {
    var err: Unmanaged<CFError>?
    let flags: SecAccessControlCreateFlags = secureEnclave ? [.privateKeyUsage, .userPresence] : [.userPresence]
    let a = SecAccessControlCreateWithFlags(kCFAllocatorDefault, kSecAttrAccessibleWhenUnlockedThisDeviceOnly, flags, &err)
    return (a, err?.takeRetainedValue())
}

/// H1: kSecUseDataProtectionKeychain is now set on EVERY Security-framework
/// call in this file — generate, delete, sign, and export-attempt alike.
/// This is the single change under test in the first pass below.
func makeAttrs(secureEnclave: Bool, access: SecAccessControl) -> [String: Any] {
    var a: [String: Any] = [
        kSecUseDataProtectionKeychain as String: true,
        kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
        kSecAttrKeySizeInBits as String: 256,
        kSecPrivateKeyAttrs as String: [
            kSecAttrIsPermanent as String: true,
            kSecAttrApplicationTag as String: KEY_TAG,
            kSecAttrAccessControl as String: access,
        ] as [String: Any],
    ]
    if secureEnclave { a[kSecAttrTokenID as String] = kSecAttrTokenIDSecureEnclave }
    return a
}

func deleteQuery() -> [String: Any] {
    [kSecUseDataProtectionKeychain as String: true, kSecClass as String: kSecClassKey,
     kSecAttrApplicationTag as String: KEY_TAG]
}

func generateKey() {
    SecItemDelete(deleteQuery() as CFDictionary)

    let seResult = makeAccess(secureEnclave: true)
    guard let seAccessOk = seResult.0 else {
        jsonOut(["ok": false, "step": "access_control_se", "error": String(describing: seResult.1)]); return
    }
    var error: Unmanaged<CFError>?
    var privateKey = SecKeyCreateRandomKey(makeAttrs(secureEnclave: true, access: seAccessOk) as CFDictionary, &error)
    var usedSecureEnclave = true
    var seFailure: String? = nil
    if privateKey == nil {
        seFailure = String(describing: error!.takeRetainedValue())
        error = nil
        let swResult = makeAccess(secureEnclave: false)
        guard let swAccessOk = swResult.0 else {
            jsonOut(["ok": false, "step": "access_control_sw", "error": String(describing: swResult.1)]); return
        }
        privateKey = SecKeyCreateRandomKey(makeAttrs(secureEnclave: false, access: swAccessOk) as CFDictionary, &error)
        usedSecureEnclave = false
    }
    guard let key = privateKey else {
        jsonOut(["ok": false, "step": "generate", "key_creation": "FAIL", "hypothesis_tested": "H1_dataProtectionKeychain",
                 "se_attempt_error": seFailure ?? NSNull(),
                 "sw_attempt_error": String(describing: error!.takeRetainedValue())])
        return
    }
    guard let pub = SecKeyCopyPublicKey(key), let pubData = SecKeyCopyExternalRepresentation(pub, &error) as Data? else {
        jsonOut(["ok": false, "step": "generate", "key_creation": "FAIL", "error": "could not export public key"])
        return
    }
    jsonOut(["ok": true, "step": "generate", "key_creation": "PASS", "hypothesis_tested": "H1_dataProtectionKeychain",
             "key_type": usedSecureEnclave ? "SecureEnclave-P256" : "SoftwareKeychain-P256",
             "se_attempt_error": seFailure ?? NSNull(),
             "access_control": "userPresence" + (usedSecureEnclave ? "+privateKeyUsage" : ""),
             "public_key_b64": pubData.base64EncodedString()])
}

func sign(label: String, message: String) {
    let context = LAContext()
    let query: [String: Any] = [
        kSecUseDataProtectionKeychain as String: true,
        kSecClass as String: kSecClassKey,
        kSecAttrApplicationTag as String: KEY_TAG,
        kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
        kSecReturnRef as String: true,
        kSecUseAuthenticationContext as String: context,
    ]
    var item: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &item)
    if status != errSecSuccess {
        let cancelled = (status == errSecUserCanceled) || (status == errSecAuthFailed)
        jsonOut(["ok": false, "label": label, "step": "load_key", "osstatus": Int(status), "cancelled": cancelled])
        exit(1)
    }
    let privateKey = item as! SecKey
    var error: Unmanaged<CFError>?
    guard let sig = SecKeyCreateSignature(privateKey, .ecdsaSignatureMessageX962SHA256,
        message.data(using: .utf8)! as CFData, &error) as Data? else {
        let e = error!.takeRetainedValue()
        let desc = String(describing: e)
        let cancelled = desc.contains("-25293") || desc.lowercased().contains("cancel") || desc.lowercased().contains("user")
        jsonOut(["ok": false, "label": label, "step": "sign", "error": desc, "cancelled": cancelled])
        exit(1)
    }
    jsonOut(["ok": true, "label": label, "step": "sign", "signature_b64": sig.base64EncodedString()])
}

func attemptExport() {
    let query: [String: Any] = [
        kSecUseDataProtectionKeychain as String: true,
        kSecClass as String: kSecClassKey,
        kSecAttrApplicationTag as String: KEY_TAG,
        kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
        kSecReturnData as String: true,
    ]
    var item: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &item)
    jsonOut(["ok": true, "step": "attempt_export", "export_succeeded": status == errSecSuccess, "osstatus": Int(status)])
}

func cleanup() {
    let status = SecItemDelete(deleteQuery() as CFDictionary)
    jsonOut(["ok": status == errSecSuccess || status == errSecItemNotFound, "step": "cleanup", "osstatus": Int(status)])
}

let args = CommandLine.arguments
guard args.count >= 2 else { jsonOut(["ok": false, "error": "usage: generate | sign <label> <message> | export | cleanup"]); exit(2) }
switch args[1] {
case "generate": generateKey()
case "sign":
    guard args.count >= 4 else { jsonOut(["ok": false, "error": "sign requires <label> <message>"]); exit(2) }
    sign(label: args[2], message: args[3])
case "export": attemptExport()
case "cleanup": cleanup()
default: jsonOut(["ok": false, "error": "unknown command"]); exit(2)
}
