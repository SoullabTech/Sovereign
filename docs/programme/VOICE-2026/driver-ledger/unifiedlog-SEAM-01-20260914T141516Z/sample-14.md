## window.json sha256 800845db6874855a08e8bf49493f8a6ec8b22d43303b16968290010a3150d50e · bytes 49490600
## decoded one JSON value ending at char 49489602 · residue 143 chars recorded verbatim (window-s14-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 41576
## event types: [('logEvent', 39215), ('activityCreateEvent', 2354), ('stateEvent', 7)]
## top processes: [('CommCenter', 4441), ('SpringBoard', 3586), ('mediaplaybackd', 2583), ('corespeechd', 2412), ('VoiceKernelHarness', 1754), ('powerexperienced', 1418), ('locationd', 1416), ('pkd', 1101), ('remindd', 1024), ('bluetoothd', 967), ('sharingd', 842), ('cameracaptured', 703), ('WirelessRadioManagerd', 682), ('SharingUIService', 662), ('testmanagerd', 655)]
## top subsystems: [('com.apple.CommCenter', 4034), ('com.apple.coreaudio', 3523), ('', 3023), ('com.apple.xpc', 1997), ('com.apple.coremedia', 1798), ('com.apple.corespeech', 1745), ('com.apple.powerexperienced', 1366), ('com.apple.PlugInKit', 1339), ('com.apple.runningboard', 983), ('com.apple.dt.xctest', 927), ('com.apple.network', 835), ('com.apple.bluetooth', 769), ('com.apple.SpringBoard', 707), ('com.apple.ShareSheet', 639), ('com.apple.avfaudio', 632)]
## first timestamp: 2026-09-14 10:24:21.012049-0400 · last: 2026-09-14 10:24:53.951538-0400
## audio-related entries kept (window-s14-audio.jsonl): 6515 · per process: [('SpringBoard', 3586), ('VoiceKernelHarness', 1754), ('bluetoothd', 967), ('audioaccessoryd', 192), ('audioclocksyncd', 16)]
## mediaserverd: NOT PRESENT IN THE S14-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S14-LEVEL WINDOW
## harness-process entries: 1754 · first: 2026-09-14 10:24:26.860445-0400 · last: 2026-09-14 10:24:49.672819-0400
## harness pids in window: 64020: 1754 entries 10:24:26.860…10:24:49.672
## sample pid = 64020 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 997894954, "start_begin": 997895095, "start_return": 997895241, "engine_configuration_changed": 997895284, "route_changed": 997895062, "first_input_callback": null, "app_lifecycle": 997890256}
## log anchor session_activated: 2026-09-14 10:24:31.986986-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd90992a
## log anchor start_begin: 2026-09-14 10:24:32.127943-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x13019f130: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:24:32.231243-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x13019f130: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:24:32.090691-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd90992a posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.033 s · agreement between them: 0 ms
   residual session_activated: log − journal = +0 ms
   residual start_begin: log − journal = -0 ms
   residual engine_configuration_changed: log − journal = -86 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -4 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:24:27.288
   session_activated: wall ≈ 10:24:31.986
   start_begin: wall ≈ 10:24:32.127
   start_return: wall ≈ 10:24:32.273
   engine_configuration_changed: wall ≈ 10:24:32.316
## entries inside engine.start() [10:24:32.127 … 10:24:32.273] (146 ms): 244 · per process: [["SpringBoard", 142], ["bluetoothd", 73], ["VoiceKernelHarness", 19], ["audioaccessoryd", 10]]
   10:24:32.128 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x1302f4c00] Created node rio-outclient with nodeID 3 - reporting period = 10.000000
   10:24:32.128 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x1302f4c00] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:24:32.128 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x13121ef68] AudioConverterNew wasn't needed since incoming an
   10:24:32.128 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x13121eda8] AudioConverterNew wasn't needed since incoming an
   10:24:32.128 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x1302f4c00] initialized with error = 0
   10:24:32.128 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x131569e40)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:24:32.128 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xe703
   10:24:32.128 +   0 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262225924.
   10:24:32.128 +   0 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:24:32.128 +   1 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:24:32.130 +   2 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x7887c3020
   10:24:32.130 +   2 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:24:32.130 +   2 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:24:32.130 +   2 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:24:32.130 +   2 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:24:32.130 +   2 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:24:32.130 +   2 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:24:32.130 +   2 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:24:32.130 +   2 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when the main run loop is idle
   10:24:32.130 +   2 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier finished setting up run loop observer
   10:24:32.130 +   3 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier run loop observer fired
   10:24:32.130 +   3 ms VoiceKernelHarness com.apple.dt.xctest Sending main run loop idle reply
   10:24:32.130 +   3 ms SpringBoard  observedProcessStatesDidChange
   10:24:32.130 +   3 ms SpringBoard com.apple.runningboard Received state update for 64020 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:24:32.135 +   8 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when animations are idle
   10:24:32.135 +   8 ms VoiceKernelHarness com.apple.dt.xctest Sending animations idle reply with error: (null)
   10:24:32.136 +   8 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:24:32.136 +   8 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:24:32.136 +   8 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:24:32.136 +   8 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:24:32.136 +   8 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:24:32.136 +   8 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:24:32.136 +   8 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:24:32.136 +   8 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:24:32.136 +   8 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:24:32.136 +   8 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:24:32.136 +   8 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:24:32.136 +   8 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:24:32.136 +   8 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:24:32.136 +   9 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:24:32.137 +   9 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:24:32.137 +   9 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:24:32.141 +  13 ms VoiceKernelHarness  observedProcessStatesDidChange
   10:24:32.141 +  14 ms VoiceKernelHarness com.apple.runningboard Received state update for 64020 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, unknown-NotVis
   10:24:32.145 +  18 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Active camera/microphone activity changed:
{(
    <SBSensorActivityAttribution: 0x7989ab060; displ
   10:24:32.145 +  18 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Turning on...
   10:24:32.145 +  18 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Registering SystemAperture element
   10:24:32.145 +  18 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element dwell time satisfied changed: NO; oldValue: YES
   10:24:32.145 +  18 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element MOT changed: NO; oldValue: YES
   10:24:32.145 +  18 ms SpringBoard com.apple.SystemAperture Asked to register element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SBRecordingIndica
   10:24:32.145 +  18 ms SpringBoard com.apple.SystemAperture Attempt to uniquely identify element that already has a unique identifier – ignoring: element: <SBRecordingIndicatorSyst
   10:24:32.145 +  18 ms SpringBoard com.apple.SystemAperture Created assertion (<SAUIElementAssertion: 0x787fcaf40>) for element: <SBRecordingIndicatorSystemApertureElement: 0x789ed
   10:24:32.145 +  18 ms SpringBoard com.apple.SystemAperture Asked to add view controller for element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SB
   10:24:32.145 +  18 ms SpringBoard com.apple.SpringBoard <BSCompoundAssertion:0x7898bb200> (SBSecureIndicatorBacklightCoordinator) acquire for reason:SBRecordingIndicatorViewCon
   10:24:32.145 +  18 ms SpringBoard com.apple.SpringBoard [Recording Indicator] updating live rendering assertion... hasSecureIndicator: YES, isActive: YES, windowScene: <private
   10:24:32.146 +  18 ms SpringBoard com.apple.BacklightServices 0x78b2ac7e0 will acquire assertion:<BLSAssertion: 0x792561490; state: requestAcquire; requested: 37557964336444 approx:1
   10:24:32.147 +  19 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:24:32.147 +  19 ms audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:24:32.147 +  19 ms audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:24:32.147 +  19 ms audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
