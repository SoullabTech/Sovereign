## window.json sha256 cfdf5a2197316e88a25265a2bce7820c0c510ffe416a318c8d9f1fd0505515e3 · bytes 46227392
## decoded one JSON value ending at char 46226429 · residue 143 chars recorded verbatim (window-s1-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 38872
## event types: [('logEvent', 35825), ('activityCreateEvent', 3035), ('stateEvent', 12)]
## top processes: [('CommCenter', 4410), ('SpringBoard', 3319), ('mDNSResponder', 1481), ('YouTube', 1399), ('mediaplaybackd', 1390), ('VoiceKernelHarness', 1352), ('pkd', 1095), ('bluetoothd', 1065), ('spotlightknowledged.updater', 1008), ('locationd', 956), ('dasd', 886), ('corespeechd', 842), ('sharingd', 760), ('wifid', 653), ('SharingUIService', 650)]
## top subsystems: [('com.apple.CommCenter', 4079), ('', 3676), ('com.apple.xpc', 1723), ('com.apple.network', 1694), ('com.apple.coreaudio', 1684), ('com.apple.runningboard', 1445), ('com.apple.PlugInKit', 1332), ('com.apple.bluetooth', 992), ('com.apple.coremedia', 976), ('com.apple.dt.xctest', 925), ('com.apple.SpringBoard', 871), ('com.apple.mdns', 851), ('com.apple.UIKit', 769), ('com.apple.chrono', 660), ('com.apple.spotlightknowledge', 645)]
## first timestamp: 2026-09-14 10:15:18.149670-0400 · last: 2026-09-14 10:15:50.953913-0400
## audio-related entries kept (window-s1-audio.jsonl): 5891 · per process: [('SpringBoard', 3319), ('VoiceKernelHarness', 1352), ('bluetoothd', 1065), ('audioaccessoryd', 139), ('audioclocksyncd', 16)]
## mediaserverd: NOT PRESENT IN THE S1-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S1-LEVEL WINDOW
## harness-process entries: 1352 · first: 2026-09-14 10:15:24.127419-0400 · last: 2026-09-14 10:15:46.866825-0400
## harness pids in window: 63959: 1352 entries 10:15:24.127…10:15:46.866
## sample pid = 63959 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 997352173, "start_begin": 997352324, "start_return": 997352469, "engine_configuration_changed": 997352604, "route_changed": 997352290, "first_input_callback": 997355972, "app_lifecycle": 997347519}
## log anchor session_activated: 2026-09-14 10:15:29.205891-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd9098f6
## log anchor start_begin: 2026-09-14 10:15:29.356588-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x105d72fc0: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:15:29.635468-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x105d72fc0: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:15:29.319604-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd9098f6 posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.033 s · agreement between them: 0 ms
   residual session_activated: log − journal = +0 ms
   residual start_begin: log − journal = -0 ms
   residual engine_configuration_changed: log − journal = -1 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -3 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:15:24.551
   session_activated: wall ≈ 10:15:29.205
   start_begin: wall ≈ 10:15:29.356
   start_return: wall ≈ 10:15:29.501
   engine_configuration_changed: wall ≈ 10:15:29.636
   first_input_callback: wall ≈ 10:15:33.004
## entries inside engine.start() [10:15:29.356 … 10:15:29.501] (145 ms): 166 · per process: [["SpringBoard", 142], ["VoiceKernelHarness", 12], ["audioaccessoryd", 10], ["bluetoothd", 2]]
   10:15:29.356 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x105eef600] Created node rio-outclient with nodeID 3 - reporting period = 10.000000
   10:15:29.356 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x105eef600] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:15:29.356 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10a22a868] AudioConverterNew wasn't needed since incoming an
   10:15:29.356 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10a229a68] AudioConverterNew wasn't needed since incoming an
   10:15:29.356 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x105eef600] initialized with error = 0
   10:15:29.356 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x10a634040)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:15:29.357 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xee27
   10:15:29.357 +   0 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 261976068.
   10:15:29.357 +   0 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:15:29.357 +   1 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:15:29.357 +   1 ms bluetoothd com.apple.bluetooth GetDevices: flags 0x0 < >, total 28
   10:15:29.358 +   2 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x788d21640
   10:15:29.358 +   2 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:15:29.358 +   2 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:15:29.358 +   2 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:15:29.358 +   2 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:15:29.358 +   2 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:15:29.358 +   2 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:15:29.358 +   2 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:15:29.359 +   3 ms SpringBoard  observedProcessStatesDidChange
   10:15:29.359 +   3 ms SpringBoard com.apple.runningboard Received state update for 63959 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:15:29.361 +   5 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:15:29.361 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:15:29.361 +   5 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:15:29.361 +   5 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:15:29.361 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:15:29.361 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:15:29.361 +   5 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:15:29.361 +   5 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:15:29.361 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:15:29.361 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:15:29.361 +   5 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:15:29.361 +   5 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:15:29.361 +   5 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:15:29.361 +   5 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:15:29.362 +   5 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:15:29.362 +   5 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:15:29.362 +   6 ms VoiceKernelHarness  observedProcessStatesDidChange
   10:15:29.362 +   6 ms VoiceKernelHarness com.apple.runningboard Received state update for 63959 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, unknown-NotVis
   10:15:29.366 +  10 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:15:29.366 +  10 ms audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:15:29.366 +  10 ms audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:15:29.366 +  10 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:15:29.366 +  10 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:15:29.366 +  10 ms audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:15:29.366 +  10 ms audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:15:29.367 +  11 ms audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:15:29.367 +  11 ms audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 7, current score is 2 (Low)
   10:15:29.367 +  11 ms audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: activity evaluation ALDS 5m 30s, AL 7
   10:15:29.370 +  14 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Active camera/microphone activity changed:
{(
    <SBSensorActivityAttribution: 0x78f6d08a0; displ
   10:15:29.370 +  14 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Turning on...
   10:15:29.370 +  14 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Registering SystemAperture element
   10:15:29.370 +  14 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element dwell time satisfied changed: NO; oldValue: YES
   10:15:29.370 +  14 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element MOT changed: NO; oldValue: YES
   10:15:29.370 +  14 ms SpringBoard com.apple.SystemAperture Asked to register element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SBRecordingIndica
   10:15:29.370 +  14 ms SpringBoard com.apple.SystemAperture Attempt to uniquely identify element that already has a unique identifier – ignoring: element: <SBRecordingIndicatorSyst
   10:15:29.370 +  14 ms SpringBoard com.apple.SystemAperture Created assertion (<SAUIElementAssertion: 0x78802e940>) for element: <SBRecordingIndicatorSystemApertureElement: 0x789ed
   10:15:29.370 +  14 ms SpringBoard com.apple.SystemAperture Asked to add view controller for element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SB
   10:15:29.370 +  14 ms SpringBoard com.apple.SpringBoard <BSCompoundAssertion:0x7898bb200> (SBSecureIndicatorBacklightCoordinator) acquire for reason:SBRecordingIndicatorViewCon
   10:15:29.370 +  14 ms SpringBoard com.apple.SpringBoard [Recording Indicator] updating live rendering assertion... hasSecureIndicator: YES, isActive: YES, windowScene: <private
## audio-DAEMON entries (audiomxd/audioaccessoryd/…; not the harness) from activation−150 ms to first callback+50 ms: 100
## audiomxd entries in that interval: 0 · per process: [["audioaccessoryd", 100]]
   10:15:29.212 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:15:29.245 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:15:29.248 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:15:29.248 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:15:29.249 audioaccessoryd com.apple.AudioAccessory Mute Control: call state changed, isCallActive: yes, isCallHighPriority: no
   10:15:29.249 audioaccessoryd com.apple.AudioAccessory Mute Control: shouldSuppressBanner: no, shouldSuppressChime: no
   10:15:29.250 audioaccessoryd com.apple.bluetooth Received Call State changed yes
   10:15:29.252 audioaccessoryd com.apple.SmartRouting onDemandEventStarted yes event Call
   10:15:29.252 audioaccessoryd com.apple.SmartRouting OnDemandEventTimer: Start. Will reset it in 8s
   10:15:29.252 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:15:29.315 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:15:29.325 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:15:29.328 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:15:29.344 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:15:29.348 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:15:29.348 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:15:29.366 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:15:29.366 audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:15:29.366 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:15:29.366 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:15:29.366 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:15:29.366 audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:15:29.366 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:15:29.367 audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:15:29.367 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 7, current score is 2 (Low)
   10:15:29.367 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: activity evaluation ALDS 5m 30s, AL 7
   10:15:29.523 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=Unknown isPlaying=100
   10:15:29.523 audioaccessoryd com.apple.bluetooth Updating local audio category 501 -> 100 app Unknown
   10:15:29.523 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 501 to 100
   10:15:29.523 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 100 for all discovered 3P devices
