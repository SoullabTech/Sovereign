import Foundation
import Capacitor
import AVFoundation

@objc(NativeAudioRecorderPlugin)
public class NativeAudioRecorderPlugin: CAPPlugin {
    private var audioRecorder: AVAudioRecorder?
    private var audioFileURL: URL?
    private var recordingStartTime: Date?

    @objc func checkAudioPermissions(_ call: CAPPluginCall) {
        let status = AVAudioSession.sharedInstance().recordPermission
        call.resolve(["granted": status == .granted])
    }

    @objc func requestAudioPermissions(_ call: CAPPluginCall) {
        AVAudioSession.sharedInstance().requestRecordPermission { granted in
            call.resolve(["granted": granted])
        }
    }

    @objc func startRecording(_ call: CAPPluginCall) {
        // Configure audio session
        do {
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.record, mode: .default)
            try audioSession.setActive(true)
        } catch {
            call.reject("Failed to configure audio session: \(error.localizedDescription)")
            return
        }

        // Create temporary file for recording
        let tempDir = FileManager.default.temporaryDirectory
        audioFileURL = tempDir.appendingPathComponent("recording_\(UUID().uuidString).m4a")

        guard let url = audioFileURL else {
            call.reject("Failed to create audio file URL")
            return
        }

        // Configure recording settings for Whisper (16kHz mono)
        let settings: [String: Any] = [
            AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
            AVSampleRateKey: 16000.0,
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
        ]

        do {
            audioRecorder = try AVAudioRecorder(url: url, settings: settings)
            audioRecorder?.prepareToRecord()
            audioRecorder?.record()
            recordingStartTime = Date()
            call.resolve()
        } catch {
            call.reject("Failed to start recording: \(error.localizedDescription)")
        }
    }

    @objc func stopRecording(_ call: CAPPluginCall) {
        guard let recorder = audioRecorder, recorder.isRecording else {
            call.reject("No active recording")
            return
        }

        recorder.stop()

        // Calculate duration
        let duration = recordingStartTime.map { Int(Date().timeIntervalSince($0) * 1000) } ?? 0

        // Read audio file and convert to base64
        guard let url = audioFileURL else {
            call.reject("No audio file URL")
            return
        }

        do {
            let audioData = try Data(contentsOf: url)
            let base64String = audioData.base64EncodedString()

            // Clean up
            try? FileManager.default.removeItem(at: url)
            audioFileURL = nil
            audioRecorder = nil
            recordingStartTime = nil

            // Deactivate audio session
            try? AVAudioSession.sharedInstance().setActive(false)

            call.resolve([
                "base64Data": base64String,
                "mimeType": "audio/mp4",
                "duration": duration
            ])
        } catch {
            call.reject("Failed to read audio file: \(error.localizedDescription)")
        }
    }

    @objc func isRecording(_ call: CAPPluginCall) {
        let recording = audioRecorder?.isRecording ?? false
        call.resolve(["recording": recording])
    }
}
