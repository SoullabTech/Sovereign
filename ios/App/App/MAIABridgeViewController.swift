import UIKit
import Capacitor

/**
 * MAIABridgeViewController
 *
 * Thin subclass of CAPBridgeViewController that forces
 * WKWebView.isInspectable = true on iOS 16.4+.
 *
 * Capacitor reads webContentsDebuggingEnabled from capacitor.config.json,
 * but the flag silently fails on some iOS/Capacitor version combinations.
 * This override guarantees the WebView is always inspectable in DEBUG builds,
 * which is essential for Safari Web Inspector access during development.
 *
 * Set in Main.storyboard — customClass="MAIABridgeViewController" (no module).
 */
class MAIABridgeViewController: CAPBridgeViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        forceWebViewInspectable()
    }

    private func forceWebViewInspectable() {
        #if DEBUG
        if #available(iOS 16.4, *) {
            webView?.isInspectable = true
            print("[MAIA] ✅ WKWebView.isInspectable = true (iOS 16.4+)")
        } else {
            // Pre-16.4: inspection is controlled at the scheme level (debug builds
            // are always inspectable when developer mode is on — nothing to do here).
            print("[MAIA] ℹ️ iOS < 16.4: WebView inspection handled by scheme")
        }
        #endif
    }
}
