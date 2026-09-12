import SwiftUI

// DRIVER-01 placeholder host. It exists only because a UI-test bundle must be hosted by an
// application target. It does nothing, links nothing, and is never the app under test.
@main
struct DriverHostApp: App {
    var body: some Scene {
        WindowGroup {
            VStack(spacing: 8) {
                Text("K00 Driver Host").font(.headline)
                Text("Placeholder host for the DRIVER-01 XCUITest bundle. Not the app under test.")
                    .font(.caption).multilineTextAlignment(.center).padding()
            }
        }
    }
}
