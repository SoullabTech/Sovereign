## window.json sha256 9cb149ecbaf7c2579fcbf8b6c514104fbdd2c0859216c99e66100be1303fc05e · bytes 34642574
## decoded one JSON value ending at char 34641783 · residue 143 chars recorded verbatim (window-s20-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 29333
## event types: [('logEvent', 27464), ('activityCreateEvent', 1862), ('stateEvent', 7)]
## top processes: [('CommCenter', 4197), ('SpringBoard', 2423), ('duetexpertd', 1854), ('VoiceKernelHarness', 1187), ('pkd', 1094), ('bluetoothd', 983), ('sharingd', 762), ('locationd', 745), ('SharingUIService', 660), ('testmanagerd', 631), ('wifid', 574), ('mediaplaybackd', 565), ('appleh16camerad', 473), ('cameracaptured', 444), ('coreduetd', 441)]
## top subsystems: [('com.apple.CommCenter', 4001), ('', 2388), ('com.apple.xpc', 1423), ('com.apple.PlugInKit', 1331), ('com.apple.duetexpertd.atx', 1221), ('com.apple.bluetooth', 981), ('com.apple.dt.xctest', 923), ('com.apple.network', 818), ('com.apple.coreaudio', 804), ('com.apple.runningboard', 727), ('com.apple.ShareSheet', 635), ('com.apple.SpringBoard', 567), ('com.apple.UIKit', 555), ('com.apple.BackBoard', 531), ('com.apple.launchservices', 479)]
## first timestamp: 2026-09-14 10:28:49.177405-0400 · last: 2026-09-14 10:29:21.911828-0400
## audio-related entries kept (window-s20-audio.jsonl): 4694 · per process: [('SpringBoard', 2423), ('VoiceKernelHarness', 1187), ('bluetoothd', 983), ('audioaccessoryd', 101)]
## mediaserverd: NOT PRESENT IN THE S20-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S20-LEVEL WINDOW
## harness-process entries: 1187 · first: 2026-09-14 10:28:55.258363-0400 · last: 2026-09-14 10:29:18.158397-0400
## harness pids in window: 64047: 1187 entries 10:28:55.258…10:29:18.158
## sample pid = 64047 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 998163324, "start_begin": 998163461, "start_return": 998163607, "engine_configuration_changed": 998163612, "route_changed": 998163437, "first_input_callback": 998163707, "app_lifecycle": 998158654}
## log anchor session_activated: 2026-09-14 10:29:00.356138-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd909942
## log anchor start_begin: 2026-09-14 10:29:00.493703-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x1181a30c0: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:29:00.596061-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x1181a30c0: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:29:00.462954-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909942 posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.032 s · agreement between them: 1 ms
   residual session_activated: log − journal = -0 ms
   residual start_begin: log − journal = +0 ms
   residual engine_configuration_changed: log − journal = -48 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -6 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:28:55.686
   session_activated: wall ≈ 10:29:00.356
   start_begin: wall ≈ 10:29:00.493
   start_return: wall ≈ 10:29:00.639
   engine_configuration_changed: wall ≈ 10:29:00.644
   first_input_callback: wall ≈ 10:29:00.739
## entries inside engine.start() [10:29:00.493 … 10:29:00.639] (146 ms): 174 · per process: [["SpringBoard", 142], ["VoiceKernelHarness", 20], ["audioaccessoryd", 10], ["bluetoothd", 2]]
   10:29:00.493 +   0 ms VoiceKernelHarness com.apple.avfaudio AVAudioEngine.mm:1182  Engine@0x1181a30c0: start, was running 0
   10:29:00.493 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x1192b8f00] Created node rio-outclient with nodeID 3 - reporting period = 10.000000
   10:29:00.493 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x1192b8f00] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:29:00.493 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x1191011a8] AudioConverterNew wasn't needed since incoming an
   10:29:00.493 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x1191bd1a8] AudioConverterNew wasn't needed since incoming an
   10:29:00.493 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x1192b8f00] initialized with error = 0
   10:29:00.493 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x119634040)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:29:00.493 +   1 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xc20b
   10:29:00.494 +   1 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262336516.
   10:29:00.494 +   1 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:29:00.494 +   1 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:29:00.494 +   1 ms bluetoothd com.apple.bluetooth GetDevices: flags 0x0 < >, total 28
   10:29:00.495 +   2 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x789c52c00
   10:29:00.495 +   2 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:29:00.495 +   2 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:29:00.495 +   2 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:29:00.495 +   2 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:29:00.495 +   2 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:29:00.495 +   2 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:29:00.495 +   2 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:29:00.495 +   2 ms SpringBoard  observedProcessStatesDidChange
   10:29:00.495 +   3 ms SpringBoard com.apple.runningboard Received state update for 64047 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:29:00.497 +   4 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:29:00.497 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:29:00.497 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:29:00.497 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:29:00.497 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:29:00.497 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:29:00.497 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:29:00.497 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:29:00.497 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:29:00.497 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:29:00.497 +   4 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:29:00.497 +   4 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:29:00.497 +   4 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:29:00.497 +   4 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:29:00.498 +   5 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:29:00.498 +   5 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:29:00.498 +   5 ms VoiceKernelHarness  observedProcessStatesDidChange
   10:29:00.498 +   5 ms VoiceKernelHarness com.apple.runningboard Received state update for 64047 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, unknown-NotVis
   10:29:00.508 +  15 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Active camera/microphone activity changed:
{(
    <SBSensorActivityAttribution: 0x798b2c120; displ
   10:29:00.508 +  15 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Turning on...
   10:29:00.508 +  15 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Registering SystemAperture element
   10:29:00.508 +  15 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element dwell time satisfied changed: NO; oldValue: YES
   10:29:00.508 +  15 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element MOT changed: NO; oldValue: YES
   10:29:00.508 +  16 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when the main run loop is idle
   10:29:00.508 +  16 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier finished setting up run loop observer
   10:29:00.508 +  16 ms SpringBoard com.apple.SystemAperture Asked to register element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SBRecordingIndica
   10:29:00.508 +  16 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier run loop observer fired
   10:29:00.508 +  16 ms VoiceKernelHarness com.apple.dt.xctest Sending main run loop idle reply
   10:29:00.509 +  16 ms SpringBoard com.apple.SystemAperture Attempt to uniquely identify element that already has a unique identifier – ignoring: element: <SBRecordingIndicatorSyst
   10:29:00.509 +  16 ms SpringBoard com.apple.SystemAperture Created assertion (<SAUIElementAssertion: 0x78967e980>) for element: <SBRecordingIndicatorSystemApertureElement: 0x789ed
   10:29:00.509 +  16 ms SpringBoard com.apple.SystemAperture Asked to add view controller for element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SB
   10:29:00.509 +  16 ms SpringBoard com.apple.SpringBoard <BSCompoundAssertion:0x7898bb200> (SBSecureIndicatorBacklightCoordinator) acquire for reason:SBRecordingIndicatorViewCon
   10:29:00.509 +  16 ms SpringBoard com.apple.SpringBoard [Recording Indicator] updating live rendering assertion... hasSecureIndicator: YES, isActive: YES, windowScene: <private
   10:29:00.509 +  16 ms SpringBoard com.apple.BacklightServices 0x78b2ac7e0 will acquire assertion:<BLSAssertion: 0x795710a80; state: requestAcquire; requested: 37564405056965 approx:1
   10:29:00.510 +  17 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when animations are idle
   10:29:00.510 +  17 ms VoiceKernelHarness com.apple.dt.xctest Sending animations idle reply with error: (null)
   10:29:00.515 +  22 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:29:00.515 +  22 ms audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
## audio-DAEMON entries (audiomxd/audioaccessoryd/…; not the harness) from activation−150 ms to first callback+50 ms: 26
## audiomxd entries in that interval: 0 · per process: [["audioaccessoryd", 26]]
   10:29:00.363 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:29:00.379 audioaccessoryd com.apple.bluetooth Received Call State changed yes
   10:29:00.379 audioaccessoryd com.apple.SmartRouting onDemandEventStarted yes event Call
   10:29:00.379 audioaccessoryd com.apple.AudioAccessory Mute Control: call state changed, isCallActive: yes, isCallHighPriority: no
   10:29:00.379 audioaccessoryd com.apple.AudioAccessory Mute Control: shouldSuppressBanner: no, shouldSuppressChime: no
   10:29:00.379 audioaccessoryd com.apple.SmartRouting OnDemandEventTimer: Start. Will reset it in 8s
   10:29:00.379 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:29:00.390 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:29:00.395 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:29:00.395 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:29:00.452 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:29:00.465 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:29:00.468 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:29:00.478 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:29:00.487 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:29:00.487 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:29:00.515 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:29:00.515 audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:29:00.515 audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:29:00.515 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:29:00.515 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:29:00.515 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:29:00.515 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:29:00.525 audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:29:00.525 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 7, current score is 2 (Low)
   10:29:00.525 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: activity evaluation ALDS 26s, AL 7
