## window.json sha256 32cf0b2e117ea3054249f00e2e6540f7d8a6300fe627a598b5434d2fa37c71b5 · bytes 41709326
## decoded one JSON value ending at char 41708555 · residue 143 chars recorded verbatim (window-s18-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 35383
## event types: [('logEvent', 33276), ('activityCreateEvent', 2100), ('stateEvent', 7)]
## top processes: [('duetexpertd', 5750), ('CommCenter', 4250), ('SpringBoard', 2551), ('locationd', 1308), ('VoiceKernelHarness', 1185), ('pkd', 1095), ('bluetoothd', 965), ('powerexperienced', 841), ('sharingd', 785), ('mediaplaybackd', 741), ('appleh16camerad', 713), ('SharingUIService', 658), ('testmanagerd', 629), ('wifid', 567), ('coreduetd', 443)]
## top subsystems: [('com.apple.CommCenter', 4025), ('com.apple.duetexpertd.atx', 3870), ('', 2676), ('com.apple.xpc', 1859), ('contextualengine', 1519), ('com.apple.PlugInKit', 1330), ('com.apple.coreaudio', 1080), ('com.apple.bluetooth', 927), ('com.apple.dt.xctest', 923), ('com.apple.runningboard', 900), ('com.apple.powerexperienced', 810), ('com.apple.network', 788), ('com.apple.ShareSheet', 634), ('com.apple.SpringBoard', 559), ('com.apple.UIKit', 556)]
## first timestamp: 2026-09-14 10:27:18.002477-0400 · last: 2026-09-14 10:27:50.890353-0400
## audio-related entries kept (window-s18-audio.jsonl): 4821 · per process: [('SpringBoard', 2551), ('VoiceKernelHarness', 1185), ('bluetoothd', 965), ('audioaccessoryd', 104), ('audioclocksyncd', 16)]
## mediaserverd: NOT PRESENT IN THE S18-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S18-LEVEL WINDOW
## harness-process entries: 1185 · first: 2026-09-14 10:27:24.096977-0400 · last: 2026-09-14 10:27:46.880499-0400
## harness pids in window: 64040: 1185 entries 10:27:24.096…10:27:46.880
## sample pid = 64040 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 998072182, "start_begin": 998072344, "start_return": 998072508, "engine_configuration_changed": 998072513, "route_changed": 998072317, "first_input_callback": 998072607, "app_lifecycle": 998067507}
## log anchor session_activated: 2026-09-14 10:27:29.214345-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd90993a
## log anchor start_begin: 2026-09-14 10:27:29.376911-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x10999f390: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:27:29.480852-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x10999f390: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:27:29.343626-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd90993a posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.033 s · agreement between them: 1 ms
   residual session_activated: log − journal = -0 ms
   residual start_begin: log − journal = +0 ms
   residual engine_configuration_changed: log − journal = -65 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -6 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:27:24.539
   session_activated: wall ≈ 10:27:29.214
   start_begin: wall ≈ 10:27:29.376
   start_return: wall ≈ 10:27:29.540
   engine_configuration_changed: wall ≈ 10:27:29.545
   first_input_callback: wall ≈ 10:27:29.639
## entries inside engine.start() [10:27:29.376 … 10:27:29.540] (164 ms): 168 · per process: [["SpringBoard", 142], ["VoiceKernelHarness", 14], ["audioaccessoryd", 10], ["bluetoothd", 2]]
   10:27:29.376 +   0 ms VoiceKernelHarness com.apple.avfaudio AVAudioEngine.mm:1182  Engine@0x10999f390: start, was running 0
   10:27:29.377 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x10d8a9500] Created node rio-outclient with nodeID 3 - reporting period = 10.000000
   10:27:29.377 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x10d8a9500] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:27:29.377 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10da4aa28] AudioConverterNew wasn't needed since incoming an
   10:27:29.377 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10da4a868] AudioConverterNew wasn't needed since incoming an
   10:27:29.377 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x10d8a9500] initialized with error = 0
   10:27:29.377 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x10e131e40)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:27:29.377 +   1 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xc033
   10:27:29.377 +   1 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262307844.
   10:27:29.377 +   1 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:27:29.377 +   1 ms bluetoothd com.apple.bluetooth GetDevices: flags 0x0 < >, total 28
   10:27:29.378 +   2 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:27:29.380 +   4 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x7893e65c0
   10:27:29.380 +   4 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:27:29.380 +   4 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:27:29.381 +   4 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:27:29.381 +   4 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:27:29.381 +   4 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:27:29.381 +   4 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:27:29.381 +   4 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:27:29.381 +   5 ms SpringBoard  observedProcessStatesDidChange
   10:27:29.381 +   5 ms SpringBoard com.apple.runningboard Received state update for 64040 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:27:29.383 +   7 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:27:29.383 +   7 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:27:29.383 +   7 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:27:29.383 +   7 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:27:29.383 +   7 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:27:29.383 +   7 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:27:29.383 +   7 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:27:29.383 +   7 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:27:29.383 +   7 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:27:29.383 +   7 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:27:29.383 +   7 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:27:29.383 +   7 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:27:29.383 +   7 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:27:29.383 +   7 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:27:29.383 +   7 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:27:29.383 +   7 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:27:29.384 +   8 ms VoiceKernelHarness  observedProcessStatesDidChange
   10:27:29.384 +   8 ms VoiceKernelHarness com.apple.runningboard Received state update for 64040 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, unknown-NotVis
   10:27:29.386 +  10 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:27:29.386 +  10 ms audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:27:29.386 +  10 ms audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:27:29.386 +  10 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:27:29.386 +  10 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:27:29.386 +  10 ms audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:27:29.386 +  10 ms audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:27:29.386 +  10 ms audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:27:29.387 +  10 ms audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 7, current score is 2 (Low)
   10:27:29.387 +  10 ms audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: activity evaluation ALDS 27s, AL 7
   10:27:29.394 +  17 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Active camera/microphone activity changed:
{(
    <SBSensorActivityAttribution: 0x79887efd0; displ
   10:27:29.394 +  17 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Turning on...
   10:27:29.394 +  17 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Registering SystemAperture element
   10:27:29.394 +  17 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element dwell time satisfied changed: NO; oldValue: YES
   10:27:29.394 +  17 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element MOT changed: NO; oldValue: YES
   10:27:29.394 +  18 ms SpringBoard com.apple.SystemAperture Asked to register element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SBRecordingIndica
   10:27:29.394 +  18 ms SpringBoard com.apple.SystemAperture Attempt to uniquely identify element that already has a unique identifier – ignoring: element: <SBRecordingIndicatorSyst
   10:27:29.394 +  18 ms SpringBoard com.apple.SystemAperture Created assertion (<SAUIElementAssertion: 0x7887a30c0>) for element: <SBRecordingIndicatorSystemApertureElement: 0x789ed
   10:27:29.394 +  18 ms SpringBoard com.apple.SystemAperture Asked to add view controller for element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SB
   10:27:29.394 +  18 ms SpringBoard com.apple.SpringBoard <BSCompoundAssertion:0x7898bb200> (SBSecureIndicatorBacklightCoordinator) acquire for reason:SBRecordingIndicatorViewCon
## audio-DAEMON entries (audiomxd/audioaccessoryd/…; not the harness) from activation−150 ms to first callback+50 ms: 26
## audiomxd entries in that interval: 0 · per process: [["audioaccessoryd", 26]]
   10:27:29.220 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:27:29.237 audioaccessoryd com.apple.bluetooth Received Call State changed yes
   10:27:29.237 audioaccessoryd com.apple.SmartRouting onDemandEventStarted yes event Call
   10:27:29.237 audioaccessoryd com.apple.SmartRouting OnDemandEventTimer: Start. Will reset it in 8s
   10:27:29.237 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:27:29.237 audioaccessoryd com.apple.AudioAccessory Mute Control: call state changed, isCallActive: yes, isCallHighPriority: no
   10:27:29.237 audioaccessoryd com.apple.AudioAccessory Mute Control: shouldSuppressBanner: no, shouldSuppressChime: no
   10:27:29.248 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:27:29.253 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:27:29.253 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:27:29.315 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:27:29.344 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:27:29.350 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:27:29.361 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:27:29.361 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:27:29.361 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:27:29.386 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:27:29.386 audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:27:29.386 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:27:29.386 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:27:29.386 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:27:29.386 audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:27:29.386 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:27:29.386 audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:27:29.387 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 7, current score is 2 (Low)
   10:27:29.387 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: activity evaluation ALDS 27s, AL 7
