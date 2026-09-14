## window.json sha256 e71fa68d25a2f5eac44c46d79d3974706c99ff7218649382c4b2642ea00e9534 · bytes 68974977
## decoded one JSON value ending at char 68974163 · residue 143 chars recorded verbatim (window-s16-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 58500
## event types: [('logEvent', 56111), ('activityCreateEvent', 2382), ('stateEvent', 7)]
## top processes: [('CommCenter', 11886), ('SpringBoard', 3876), ('locationd', 3074), ('mediaplaybackd', 2897), ('corespeechd', 2847), ('powerexperienced', 1906), ('VoiceKernelHarness', 1840), ('networkserviceproxy', 1483), ('pkd', 1269), ('bluetoothd', 1244), ('WirelessRadioManagerd', 1098), ('mDNSResponder', 993), ('sharingd', 935), ('wifid', 921), ('appleh16camerad', 828)]
## top subsystems: [('com.apple.CommCenter', 10350), ('com.apple.coreaudio', 4119), ('', 3114), ('com.apple.IDS', 2225), ('com.apple.corespeech', 2075), ('com.apple.coremedia', 2017), ('com.apple.xpc', 1936), ('com.apple.powerexperienced', 1836), ('com.apple.PersistentConnection', 1708), ('com.apple.network', 1564), ('com.apple.PlugInKit', 1512), ('com.apple.networkserviceproxy', 1229), ('com.apple.bluetooth', 1088), ('com.apple.locationd.Position', 1068), ('com.apple.dt.xctest', 929)]
## first timestamp: 2026-09-14 10:25:49.000000-0400 · last: 2026-09-14 10:26:21.991730-0400
## audio-related entries kept (window-s16-audio.jsonl): 7233 · per process: [('SpringBoard', 3876), ('VoiceKernelHarness', 1840), ('bluetoothd', 1244), ('audioaccessoryd', 273)]
## mediaserverd: NOT PRESENT IN THE S16-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S16-LEVEL WINDOW
## harness-process entries: 1840 · first: 2026-09-14 10:25:54.660448-0400 · last: 2026-09-14 10:26:17.784141-0400
## harness pids in window: 64028: 1840 entries 10:25:54.660…10:26:17.784
## sample pid = 64028 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 997982661, "start_begin": 997982809, "start_return": 997982953, "engine_configuration_changed": 997982987, "route_changed": 997982777, "first_input_callback": null, "app_lifecycle": 997978055}
## log anchor session_activated: 2026-09-14 10:25:59.693164-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd909932
## log anchor start_begin: 2026-09-14 10:25:59.841361-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x107992fd0: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:25:59.947618-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x107992fd0: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:25:59.807443-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909932 posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.032 s · agreement between them: 0 ms
   residual session_activated: log − journal = -0 ms
   residual start_begin: log − journal = +0 ms
   residual engine_configuration_changed: log − journal = -72 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -2 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:25:55.087
   session_activated: wall ≈ 10:25:59.693
   start_begin: wall ≈ 10:25:59.841
   start_return: wall ≈ 10:25:59.985
   engine_configuration_changed: wall ≈ 10:26:00.019
## entries inside engine.start() [10:25:59.841 … 10:25:59.985] (144 ms): 210 · per process: [["SpringBoard", 142], ["bluetoothd", 41], ["VoiceKernelHarness", 14], ["audioaccessoryd", 13]]
   10:25:59.841 +   0 ms VoiceKernelHarness com.apple.avfaudio AVAudioEngine.mm:1182  Engine@0x107992fd0: start, was running 0
   10:25:59.841 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x10b8bb900] Created node rio-outclient with nodeID 3 - reporting period = 10.000000
   10:25:59.841 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x10b8bb900] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:25:59.841 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10abd39e8] AudioConverterNew wasn't needed since incoming an
   10:25:59.841 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10b9e34a8] AudioConverterNew wasn't needed since incoming an
   10:25:59.841 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x10b8bb900] initialized with error = 0
   10:25:59.841 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x10c13de40)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:25:59.841 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xe303
   10:25:59.841 +   0 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262258692.
   10:25:59.841 +   0 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:25:59.841 +   0 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:25:59.842 +   1 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x788ba09a0
   10:25:59.842 +   1 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:25:59.842 +   1 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:25:59.842 +   2 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:25:59.842 +   2 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:25:59.842 +   2 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:25:59.842 +   2 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:25:59.842 +   2 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:25:59.843 +   3 ms SpringBoard  observedProcessStatesDidChange
   10:25:59.843 +   3 ms SpringBoard com.apple.runningboard Received state update for 64028 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:25:59.845 +   4 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:25:59.845 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:25:59.845 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:25:59.845 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:25:59.845 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:25:59.845 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:25:59.845 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:25:59.845 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:25:59.845 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:25:59.845 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:25:59.845 +   4 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:25:59.845 +   4 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:25:59.845 +   4 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:25:59.845 +   4 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:25:59.847 +   6 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:25:59.847 +   6 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:25:59.849 +   9 ms VoiceKernelHarness  observedProcessStatesDidChange
   10:25:59.850 +   9 ms VoiceKernelHarness com.apple.runningboard Received state update for 64028 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, unknown-NotVis
   10:25:59.858 +  17 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Active camera/microphone activity changed:
{(
    <SBSensorActivityAttribution: 0x794e7e340; displ
   10:25:59.858 +  17 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Turning on...
   10:25:59.858 +  17 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Registering SystemAperture element
   10:25:59.858 +  17 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element dwell time satisfied changed: NO; oldValue: YES
   10:25:59.858 +  17 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element MOT changed: NO; oldValue: YES
   10:25:59.858 +  17 ms SpringBoard com.apple.SystemAperture Asked to register element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SBRecordingIndica
   10:25:59.858 +  17 ms SpringBoard com.apple.SystemAperture Attempt to uniquely identify element that already has a unique identifier – ignoring: element: <SBRecordingIndicatorSyst
   10:25:59.858 +  17 ms SpringBoard com.apple.SystemAperture Created assertion (<SAUIElementAssertion: 0x78732ce80>) for element: <SBRecordingIndicatorSystemApertureElement: 0x789ed
   10:25:59.858 +  17 ms SpringBoard com.apple.SystemAperture Asked to add view controller for element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SB
   10:25:59.858 +  18 ms SpringBoard com.apple.SpringBoard <BSCompoundAssertion:0x7898bb200> (SBSecureIndicatorBacklightCoordinator) acquire for reason:SBRecordingIndicatorViewCon
   10:25:59.858 +  18 ms SpringBoard com.apple.SpringBoard [Recording Indicator] updating live rendering assertion... hasSecureIndicator: YES, isActive: YES, windowScene: <private
   10:25:59.859 +  18 ms SpringBoard com.apple.BacklightServices 0x78b2ac7e0 will acquire assertion:<BLSAssertion: 0x78c1de840; state: requestAcquire; requested: 37560069451670 approx:1
   10:25:59.861 +  21 ms audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:25:59.861 +  21 ms audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:25:59.861 +  21 ms audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:25:59.870 +  29 ms SpringBoard com.apple.UIKit sceneOfRecord: sceneID: SuperHighLevelSystemAperture  persistentID: SuperHighLevelSystemAperture
   10:25:59.870 +  29 ms SpringBoard com.apple.PaperBoardUI [lock] Poster last extant update changed 3919
   10:25:59.870 +  30 ms SpringBoard com.apple.PaperBoardUI [home] Poster last extant update changed 3919
   10:25:59.871 +  30 ms SpringBoard  <private> cannot generate notifications yet
   10:25:59.871 +  30 ms SpringBoard  <private> is static and will never generate a notification
   10:25:59.871 +  30 ms SpringBoard  <private> is static and will never generate a notification
