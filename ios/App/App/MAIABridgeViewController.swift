import UIKit
import Capacitor

/// MAIA's bridge view controller.
///
/// Its single job is to register the in-app Capacitor plugins that
/// `cap sync` cannot see. The CLI regenerates `packageClassList` in the
/// bundled `capacitor.config.json` from installed npm plugins only
/// (`@capacitor/cli/dist/util/iosplugin.js`), so any in-app
/// `CAPBridgedPlugin` declared in `capacitor.config.ts` is dropped on every
/// sync and never instantiated by `CapacitorBridge` (which registers exactly
/// the classes in that list). `AudioSessionManager` was compiled into every
/// build since its introduction and never loaded — see
/// `docs/programme/IOS-CONVERSATION-RUNTIME-01_LANE.md` E2/E3.
///
/// This subclass is the supported native registration path and is immune to
/// `cap sync`, which does not touch Swift sources or the storyboard.
///
/// Scope (founder ruling 2026-09-11, RUNTIME-01 E5): register
/// `AudioSessionManager` only. `VoiceController` is deliberately NOT
/// registered here; that belongs to the recognition lane.
class MAIABridgeViewController: CAPBridgeViewController {

    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(AudioSessionManager())
        NSLog("[MAIABridgeViewController] registered in-app plugin: AudioSessionManager")
    }
}
