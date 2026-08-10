// D-14Q throwaway provisioning vehicle. No application logic — this exists
// solely so `xcodebuild -allowProvisioningUpdates` has a real target whose
// build causes Apple to register the App ID and issue a provisioning
// profile authorizing the keychain-access-groups capability declared in
// project.yml / D14QPresenceProof.entitlements. The actual Security-
// framework test logic lives in the unchanged D-14P substrate
// (../d14p-signed-proof/presence-proof-v2.swift), tested separately once
// this profile exists.

import SwiftUI

@main
struct D14QPresenceProofApp: App {
    var body: some Scene {
        WindowGroup {
            EmptyView()
        }
    }
}
