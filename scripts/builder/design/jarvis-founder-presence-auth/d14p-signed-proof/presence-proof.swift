// JARVIS Desktop D-14P — Signed Presence Proof (TEST-ONLY substrate)
//
// The mechanism D-14L could not reach: a Keychain-protected private key,
// access-controlled to require .userPresence on EVERY private-key operation,
// tested from inside a properly (ad-hoc) signed & bundled .app rather than a
// bare unsigned CLI binary. D-14L's finding was that SecKeyCreateRandomKey
// with kSecAttrAccessControl fails (-34018, errSecMissingEntitlement) for an
// unsigned binary regardless of Secure-Enclave backing — this harness exists
// solely to determine whether a signed bundle with an explicit
// keychain-access-groups entitlement clears that blocker, and if so, whether
// the resulting key's access-control policy genuinely requires a fresh
// interactive presence event on each use (not merely on creation).
//
// TEST-ONLY: application-tag scoped to this proof; deleted by `cleanup`.
// Carries no production authority; never referenced by runtime/Desktop code.

import Foundation
import LocalAuthentication
import Security

let KEY_TAG = "com.soullab.jarvis.d14p-test.signed-presence-proof".data(using: .utf8)!

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

func makeAttrs(secureEnclave: Bool, access: SecAccessControl) -> [String: Any] {
    var a: [String: Any] = [
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

/** §1 of the D-14P mandate: create a protected signing key with the intended policy. */
func generateKey() {
    SecItemDelete([kSecClass as String: kSecClassKey, kSecAttrApplicationTag as String: KEY_TAG] as CFDictionary)

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
        jsonOut(["ok": false, "step": "generate", "key_creation": "FAIL",
                 "se_attempt_error": seFailure ?? NSNull(),
                 "sw_attempt_error": String(describing: error!.takeRetainedValue())])
        return
    }
    guard let pub = SecKeyCopyPublicKey(key), let pubData = SecKeyCopyExternalRepresentation(pub, &error) as Data? else {
        jsonOut(["ok": false, "step": "generate", "key_creation": "FAIL", "error": "could not export public key"])
        return
    }
    jsonOut(["ok": true, "step": "generate", "key_creation": "PASS",
             "key_type": usedSecureEnclave ? "SecureEnclave-P256" : "SoftwareKeychain-P256",
             "se_attempt_error": seFailure ?? NSNull(),
             "access_control": "userPresence" + (usedSecureEnclave ? "+privateKeyUsage" : ""),
             "public_key_b64": pubData.base64EncodedString()])
}

/** §2/§3 — attempt a signature; the access-control policy itself is what gates this call. */
func sign(label: String, message: String) {
    let context = LAContext() // fresh per invocation, no reuse duration set
    let query: [String: Any] = [
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

/** §7 — the private key must never be exportable as raw material via a normal query. */
func attemptExport() {
    let query: [String: Any] = [
        kSecClass as String: kSecClassKey,
        kSecAttrApplicationTag as String: KEY_TAG,
        kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
        kSecReturnData as String: true, // asking for raw key bytes, not a SecKeyRef
    ]
    var item: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &item)
    jsonOut(["ok": true, "step": "attempt_export", "export_succeeded": status == errSecSuccess, "osstatus": Int(status)])
}

func cleanup() {
    let status = SecItemDelete([kSecClass as String: kSecClassKey, kSecAttrApplicationTag as String: KEY_TAG] as CFDictionary)
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
