import Foundation
import Vision
import Capacitor
import UIKit

/// HandwritingOCR - On-device text recognition using iOS Vision framework
///
/// Provides sovereignty-first OCR: all processing happens locally on device,
/// no data leaves the phone. Optimized for handwritten journal pages.
@objc(HandwritingOCR)
public class HandwritingOCR: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "HandwritingOCR"
    public let jsName = "HandwritingOCR"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "recognize", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise)
    ]

    // MARK: - Plugin Methods

    /// Check if Vision OCR is available on this device
    @objc func isAvailable(_ call: CAPPluginCall) {
        // Vision framework requires iOS 13+, always available on modern devices
        call.resolve([
            "available": true,
            "platform": "ios",
            "provider": "vision"
        ])
    }

    /// Recognize text from a base64-encoded image
    /// Options:
    ///   - base64: The image data (with or without data URL prefix)
    ///   - languages: Array of language codes (default: ["en-US"])
    @objc func recognize(_ call: CAPPluginCall) {
        guard let base64 = call.getString("base64"), !base64.isEmpty else {
            call.reject("base64 image data is required")
            return
        }

        let languages = call.getArray("languages", String.self) ?? ["en-US"]

        guard let image = Self.imageFromBase64(base64) else {
            call.reject("Invalid base64 image data")
            return
        }

        guard let cgImage = image.cgImage else {
            call.reject("Could not read image pixels")
            return
        }

        NSLog("[HandwritingOCR] Starting recognition with languages: \(languages)")

        // Create text recognition request
        let request = VNRecognizeTextRequest { [weak self] request, error in
            if let error = error {
                NSLog("[HandwritingOCR] Recognition failed: \(error.localizedDescription)")
                call.reject("OCR failed: \(error.localizedDescription)")
                return
            }

            guard let observations = request.results as? [VNRecognizedTextObservation] else {
                call.resolve([
                    "text": "",
                    "confidence": 0.0,
                    "lineCount": 0
                ])
                return
            }

            var lines: [String] = []
            var confidences: [Float] = []
            var blocks: [[String: Any]] = []

            for observation in observations {
                guard let topCandidate = observation.topCandidates(1).first else { continue }

                lines.append(topCandidate.string)
                confidences.append(topCandidate.confidence)

                // Build bounding box info
                let boundingBox = observation.boundingBox
                blocks.append([
                    "text": topCandidate.string,
                    "confidence": topCandidate.confidence,
                    "boundingBox": [
                        "x": boundingBox.origin.x,
                        "y": boundingBox.origin.y,
                        "width": boundingBox.width,
                        "height": boundingBox.height
                    ]
                ])
            }

            // Join lines with newlines, preserving paragraph structure
            let text = lines.joined(separator: "\n").trimmingCharacters(in: .whitespacesAndNewlines)

            // Calculate mean confidence
            let meanConfidence: Double = confidences.isEmpty
                ? 0.0
                : Double(confidences.reduce(0, +)) / Double(confidences.count)

            NSLog("[HandwritingOCR] Recognized \(lines.count) lines, mean confidence: \(meanConfidence)")

            call.resolve([
                "text": text,
                "confidence": meanConfidence,
                "lineCount": lines.count,
                "blocks": blocks
            ])
        }

        // Configure for handwriting recognition
        request.recognitionLevel = .accurate
        request.usesLanguageCorrection = true
        request.recognitionLanguages = languages

        // iOS 16+ supports revision 3 with better handwriting
        if #available(iOS 16.0, *) {
            request.revision = VNRecognizeTextRequestRevision3
        }

        // Process on background queue
        DispatchQueue.global(qos: .userInitiated).async {
            let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
            do {
                try handler.perform([request])
            } catch {
                NSLog("[HandwritingOCR] Handler error: \(error.localizedDescription)")
                call.reject("OCR handler error: \(error.localizedDescription)")
            }
        }
    }

    // MARK: - Private Helpers

    /// Convert base64 string (with optional data URL prefix) to UIImage
    private static func imageFromBase64(_ base64: String) -> UIImage? {
        // Strip data URL prefix if present (e.g., "data:image/jpeg;base64,")
        let cleaned: String
        if let commaIndex = base64.firstIndex(of: ",") {
            cleaned = String(base64[base64.index(after: commaIndex)...])
        } else {
            cleaned = base64
        }

        guard let data = Data(base64Encoded: cleaned, options: .ignoreUnknownCharacters) else {
            NSLog("[HandwritingOCR] Failed to decode base64 data")
            return nil
        }

        return UIImage(data: data)
    }
}
