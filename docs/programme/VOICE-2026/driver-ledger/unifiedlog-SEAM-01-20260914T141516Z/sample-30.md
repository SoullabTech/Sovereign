## window.json sha256 4c5b56e0203d58b86bc71e0a0b6ab14130c0d4d53809d3afcb685aceb0a55505 · bytes 41982011
## decoded one JSON value ending at char 41981209 · residue 143 chars recorded verbatim (window-s30-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 35503
## event types: [('logEvent', 33418), ('activityCreateEvent', 2078), ('stateEvent', 7)]
## top processes: [('duetexpertd', 4748), ('CommCenter', 4517), ('SpringBoard', 2511), ('wifid', 1368), ('bluetoothd', 1312), ('locationd', 1219), ('VoiceKernelHarness', 1187), ('pkd', 1095), ('sharingd', 821), ('mediaplaybackd', 735), ('corespeechd', 667), ('SharingUIService', 659), ('testmanagerd', 631), ('mDNSResponder', 517), ('coreduetd', 417)]
## top subsystems: [('com.apple.CommCenter', 4225), ('com.apple.duetexpertd.atx', 3100), ('', 2624), ('com.apple.xpc', 1741), ('com.apple.PlugInKit', 1330), ('contextualengine', 1302), ('com.apple.bluetooth', 1287), ('com.apple.network', 958), ('com.apple.dt.xctest', 925), ('com.apple.coreaudio', 896), ('com.apple.runningboard', 805), ('com.apple.WiFiPolicy', 728), ('com.apple.ShareSheet', 638), ('com.apple.UIKit', 563), ('com.apple.SpringBoard', 561)]
## first timestamp: 2026-09-14 10:37:28.001062-0400 · last: 2026-09-14 10:37:59.988950-0400
## audio-related entries kept (window-s30-audio.jsonl): 5116 · per process: [('SpringBoard', 2511), ('bluetoothd', 1312), ('VoiceKernelHarness', 1187), ('audioaccessoryd', 106)]
## mediaserverd: NOT PRESENT IN THE S30-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S30-LEVEL WINDOW
## harness-process entries: 1187 · first: 2026-09-14 10:37:33.217159-0400 · last: 2026-09-14 10:37:56.142869-0400
## harness pids in window: 64119: 1187 entries 10:37:33.217…10:37:56.142
## sample pid = 64119 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 998681288, "start_begin": 998681425, "start_return": 998681577, "engine_configuration_changed": 998681586, "route_changed": 998681394, "first_input_callback": 998681675, "app_lifecycle": 998676619}
## log anchor session_activated: 2026-09-14 10:37:38.320627-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd90996c
## log anchor start_begin: 2026-09-14 10:37:38.457103-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x12418f040: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:37:38.561758-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x12418f040: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:37:38.424580-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd90996c posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.032 s · agreement between them: 1 ms
   residual session_activated: log − journal = +0 ms
   residual start_begin: log − journal = -0 ms
   residual engine_configuration_changed: log − journal = -57 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -2 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:37:33.651
   session_activated: wall ≈ 10:37:38.320
   start_begin: wall ≈ 10:37:38.457
   start_return: wall ≈ 10:37:38.609
   engine_configuration_changed: wall ≈ 10:37:38.618
   first_input_callback: wall ≈ 10:37:38.707
## entries inside engine.start() [10:37:38.457 … 10:37:38.609] (152 ms): 206 · per process: [["SpringBoard", 144], ["audioaccessoryd", 21], ["bluetoothd", 21], ["VoiceKernelHarness", 20]]
   10:37:38.457 +   0 ms audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:37:38.457 +   0 ms VoiceKernelHarness com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd90996c posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:37:38.457 +   0 ms SpringBoard com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd9095dd posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:37:38.458 +   1 ms bluetoothd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd90900c posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:37:38.459 +   2 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x124301200] Created node rio-outclient with nodeID 3 - reporting period = 10.000000
   10:37:38.459 +   2 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x124301200] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:37:38.459 +   2 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x1252298a8] AudioConverterNew wasn't needed since incoming an
   10:37:38.459 +   2 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x125228e28] AudioConverterNew wasn't needed since incoming an
   10:37:38.459 +   2 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x124301200] initialized with error = 0
   10:37:38.459 +   2 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x12561c040)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:37:38.459 +   2 ms SpringBoard com.apple.Hearing Posting pickableAudioRoutesDidChange notification
   10:37:38.459 +   2 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xc213
   10:37:38.459 +   2 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262631428.
   10:37:38.459 +   2 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:37:38.459 +   2 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:37:38.461 +   4 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x78863a060
   10:37:38.461 +   4 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:37:38.461 +   4 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:37:38.462 +   5 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:37:38.462 +   5 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:37:38.462 +   5 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:37:38.462 +   5 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:37:38.462 +   5 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:37:38.462 +   5 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when the main run loop is idle
   10:37:38.462 +   5 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier run loop observer fired
   10:37:38.462 +   5 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier finished setting up run loop observer
   10:37:38.462 +   5 ms VoiceKernelHarness com.apple.dt.xctest Sending main run loop idle reply
   10:37:38.462 +   5 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when animations are idle
   10:37:38.462 +   5 ms VoiceKernelHarness com.apple.dt.xctest Sending animations idle reply with error: (null)
   10:37:38.463 +   6 ms SpringBoard  observedProcessStatesDidChange
   10:37:38.463 +   7 ms SpringBoard com.apple.runningboard Received state update for 64119 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:37:38.464 +   7 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:37:38.464 +   7 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:37:38.464 +   7 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:37:38.464 +   7 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:37:38.464 +   7 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:37:38.464 +   7 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:37:38.464 +   7 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:37:38.464 +   7 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:37:38.464 +   7 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:37:38.464 +   7 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:37:38.464 +   7 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:37:38.464 +   7 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:37:38.464 +   8 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:37:38.464 +   8 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:37:38.465 +   8 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:37:38.465 +   8 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:37:38.467 +  10 ms VoiceKernelHarness  observedProcessStatesDidChange
   10:37:38.467 +  10 ms VoiceKernelHarness com.apple.runningboard Received state update for 64119 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, unknown-NotVis
   10:37:38.473 +  16 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:37:38.473 +  16 ms audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:37:38.473 +  16 ms audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:37:38.473 +  16 ms audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:37:38.473 +  16 ms audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:37:38.473 +  16 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:37:38.473 +  16 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:37:38.474 +  17 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Active camera/microphone activity changed:
{(
    <SBSensorActivityAttribution: 0x78c35f840; displ
   10:37:38.474 +  18 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Turning on...
   10:37:38.474 +  18 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Registering SystemAperture element
   10:37:38.474 +  18 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element dwell time satisfied changed: NO; oldValue: YES
## audio-DAEMON entries (audiomxd/audioaccessoryd/…; not the harness) from activation−150 ms to first callback+50 ms: 43
## audiomxd entries in that interval: 0 · per process: [["audioaccessoryd", 43]]
   10:37:38.327 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:37:38.347 audioaccessoryd com.apple.bluetooth Received Call State changed yes
   10:37:38.348 audioaccessoryd com.apple.SmartRouting onDemandEventStarted yes event Call
   10:37:38.348 audioaccessoryd com.apple.SmartRouting OnDemandEventTimer: Start. Will reset it in 8s
   10:37:38.348 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:37:38.348 audioaccessoryd com.apple.AudioAccessory Mute Control: call state changed, isCallActive: yes, isCallHighPriority: no
   10:37:38.348 audioaccessoryd com.apple.AudioAccessory Mute Control: shouldSuppressBanner: no, shouldSuppressChime: no
   10:37:38.355 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:37:38.361 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:37:38.361 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:37:38.423 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:37:38.442 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:37:38.445 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:37:38.445 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:37:38.454 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:37:38.457 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:37:38.473 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:37:38.473 audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:37:38.473 audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:37:38.473 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:37:38.473 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:37:38.473 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:37:38.473 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:37:38.479 audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:37:38.479 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 7, current score is 2 (Low)
   10:37:38.479 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: activity evaluation ALDS 30s, AL 7
   10:37:38.607 audioaccessoryd com.apple.bluetooth Activity level changed 7 (Screen) -> 11 (User)
   10:37:38.607 audioaccessoryd com.apple.bluetooth Activity critical timer start: 5 seconds
   10:37:38.607 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 11, current score is 2 (Low)
   10:37:38.607 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: activity evaluation ALDS 35s, AL 11
