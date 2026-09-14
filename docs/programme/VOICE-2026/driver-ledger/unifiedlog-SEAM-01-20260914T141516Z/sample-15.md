## window.json sha256 fd83df74bc4dbfa44a1ebc396a21515a0060c390123548bf1f8cc738c2563828 · bytes 51112592
## decoded one JSON value ending at char 51111706 · residue 143 chars recorded verbatim (window-s15-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 43082
## event types: [('logEvent', 40691), ('activityCreateEvent', 2378), ('stateEvent', 13)]
## top processes: [('SpringBoard', 5987), ('CommCenter', 4440), ('mediaplaybackd', 2578), ('corespeechd', 2494), ('powerexperienced', 1796), ('VoiceKernelHarness', 1751), ('bluetoothd', 1161), ('pkd', 1102), ('sharingd', 890), ('locationd', 864), ('testmanagerd', 716), ('appleh16camerad', 713), ('WirelessRadioManagerd', 675), ('SharingUIService', 660), ('wifid', 631)]
## top subsystems: [('com.apple.CommCenter', 4023), ('com.apple.coreaudio', 3648), ('', 3103), ('com.apple.xpc', 1883), ('com.apple.corespeech', 1819), ('com.apple.coremedia', 1782), ('com.apple.powerexperienced', 1730), ('com.apple.PlugInKit', 1355), ('com.apple.UserNotifications', 1150), ('com.apple.runningboard', 1118), ('com.apple.bluetooth', 1001), ('com.apple.dt.xctest', 977), ('com.apple.BulletinBoard', 783), ('com.apple.network', 780), ('com.apple.SpringBoard', 766)]
## first timestamp: 2026-09-14 10:25:05.009013-0400 · last: 2026-09-14 10:25:37.978688-0400
## audio-related entries kept (window-s15-audio.jsonl): 9158 · per process: [('SpringBoard', 5987), ('VoiceKernelHarness', 1751), ('bluetoothd', 1161), ('audioaccessoryd', 243), ('audioclocksyncd', 16)]
## mediaserverd: NOT PRESENT IN THE S15-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S15-LEVEL WINDOW
## harness-process entries: 1751 · first: 2026-09-14 10:25:11.011854-0400 · last: 2026-09-14 10:25:33.755033-0400
## harness pids in window: 64025: 1751 entries 10:25:11.011…10:25:33.755
## sample pid = 64025 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 997939067, "start_begin": 997939218, "start_return": 997939370, "engine_configuration_changed": 997939404, "route_changed": 997939183, "first_input_callback": null, "app_lifecycle": 997934411}
## log anchor session_activated: 2026-09-14 10:25:16.099154-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd90992e
## log anchor start_begin: 2026-09-14 10:25:16.250771-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x107da6fa0: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:25:16.351972-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x107da6fa0: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:25:16.213459-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd90992e posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.032 s · agreement between them: 1 ms
   residual session_activated: log − journal = -0 ms
   residual start_begin: log − journal = +0 ms
   residual engine_configuration_changed: log − journal = -84 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -2 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:25:11.443
   session_activated: wall ≈ 10:25:16.099
   start_begin: wall ≈ 10:25:16.250
   start_return: wall ≈ 10:25:16.402
   engine_configuration_changed: wall ≈ 10:25:16.436
## entries inside engine.start() [10:25:16.250 … 10:25:16.402] (152 ms): 215 · per process: [["SpringBoard", 142], ["bluetoothd", 42], ["VoiceKernelHarness", 20], ["audioaccessoryd", 11]]
   10:25:16.250 +   0 ms VoiceKernelHarness com.apple.avfaudio AVAudioEngine.mm:1182  Engine@0x107da6fa0: start, was running 0
   10:25:16.250 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x107ef5200] Created node rio-outclient with nodeID 3 - reporting period = 10.000000
   10:25:16.250 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x107ef5200] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:25:16.250 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10c249528] AudioConverterNew wasn't needed since incoming an
   10:25:16.250 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10c248aa8] AudioConverterNew wasn't needed since incoming an
   10:25:16.250 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x107ef5200] initialized with error = 0
   10:25:16.250 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x10c416840)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:25:16.251 +   1 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xe803
   10:25:16.251 +   1 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262246404.
   10:25:16.251 +   1 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:25:16.251 +   1 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:25:16.251 +   1 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when the main run loop is idle
   10:25:16.251 +   1 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier run loop observer fired
   10:25:16.251 +   1 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier finished setting up run loop observer
   10:25:16.251 +   1 ms VoiceKernelHarness com.apple.dt.xctest Sending main run loop idle reply
   10:25:16.252 +   2 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x789234360
   10:25:16.252 +   2 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:25:16.252 +   2 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:25:16.252 +   2 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:25:16.252 +   2 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:25:16.252 +   2 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:25:16.252 +   2 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:25:16.252 +   2 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:25:16.252 +   2 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when animations are idle
   10:25:16.252 +   2 ms VoiceKernelHarness com.apple.dt.xctest Sending animations idle reply with error: (null)
   10:25:16.253 +   3 ms SpringBoard  observedProcessStatesDidChange
   10:25:16.253 +   3 ms SpringBoard com.apple.runningboard Received state update for 64025 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:25:16.254 +   4 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:25:16.254 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:25:16.254 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:25:16.254 +   5 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:25:16.254 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:25:16.254 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:25:16.254 +   5 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:25:16.254 +   5 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:25:16.254 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:25:16.254 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:25:16.254 +   5 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:25:16.255 +   5 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:25:16.255 +   5 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:25:16.255 +   5 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:25:16.255 +   5 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:25:16.255 +   5 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:25:16.259 +   9 ms VoiceKernelHarness  observedProcessStatesDidChange
   10:25:16.259 +   9 ms VoiceKernelHarness com.apple.runningboard Received state update for 64025 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, unknown-NotVis
   10:25:16.262 +  12 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:25:16.262 +  12 ms audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:25:16.262 +  12 ms audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:25:16.262 +  12 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:25:16.262 +  12 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:25:16.262 +  12 ms audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:25:16.262 +  12 ms audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:25:16.263 +  13 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Active camera/microphone activity changed:
{(
    <SBSensorActivityAttribution: 0x795b10000; displ
   10:25:16.263 +  13 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Turning on...
   10:25:16.263 +  13 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Registering SystemAperture element
   10:25:16.263 +  13 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element dwell time satisfied changed: NO; oldValue: YES
   10:25:16.263 +  13 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element MOT changed: NO; oldValue: YES
   10:25:16.263 +  13 ms SpringBoard com.apple.SystemAperture Asked to register element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SBRecordingIndica
   10:25:16.263 +  13 ms SpringBoard com.apple.SystemAperture Attempt to uniquely identify element that already has a unique identifier – ignoring: element: <SBRecordingIndicatorSyst
   10:25:16.263 +  13 ms SpringBoard com.apple.SystemAperture Created assertion (<SAUIElementAssertion: 0x786e17a40>) for element: <SBRecordingIndicatorSystemApertureElement: 0x789ed
