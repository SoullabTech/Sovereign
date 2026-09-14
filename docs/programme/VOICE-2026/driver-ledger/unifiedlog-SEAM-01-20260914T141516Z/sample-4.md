## window.json sha256 621e8cd1e00b73c85a71da36e66d95cc5a05a08a45f4e64b00258989c08d258a · bytes 33572974
## decoded one JSON value ending at char 33572169 · residue 143 chars recorded verbatim (window-s4-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 28215
## event types: [('logEvent', 26263), ('activityCreateEvent', 1933), ('stateEvent', 19)]
## top processes: [('CommCenter', 4329), ('SpringBoard', 2519), ('locationd', 1215), ('VoiceKernelHarness', 1182), ('pkd', 1095), ('bluetoothd', 1087), ('sharingd', 757), ('mediaplaybackd', 731), ('SharingUIService', 656), ('testmanagerd', 634), ('wifid', 579), ('coreduetd', 442), ('corespeechd', 411), ('biomed', 382), ('dmd', 376)]
## top subsystems: [('com.apple.CommCenter', 4071), ('', 2398), ('com.apple.PlugInKit', 1330), ('com.apple.xpc', 1309), ('com.apple.bluetooth', 1014), ('com.apple.dt.xctest', 925), ('com.apple.runningboard', 813), ('com.apple.coreaudio', 781), ('com.apple.network', 772), ('com.apple.ShareSheet', 632), ('com.apple.locationd.Core', 566), ('com.apple.SpringBoard', 557), ('com.apple.UIKit', 552), ('com.apple.coremedia', 531), ('com.apple.BackBoard', 531)]
## first timestamp: 2026-09-14 10:17:19.045020-0400 · last: 2026-09-14 10:17:51.986327-0400
## audio-related entries kept (window-s4-audio.jsonl): 4858 · per process: [('SpringBoard', 2519), ('VoiceKernelHarness', 1182), ('bluetoothd', 1087), ('audioaccessoryd', 54), ('audioclocksyncd', 16)]
## mediaserverd: NOT PRESENT IN THE S4-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S4-LEVEL WINDOW
## harness-process entries: 1182 · first: 2026-09-14 10:17:25.001224-0400 · last: 2026-09-14 10:17:47.756712-0400
## harness pids in window: 63973: 1182 entries 10:17:25.001…10:17:47.756
## sample pid = 63973 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 997473061, "start_begin": 997473216, "start_return": 997473366, "engine_configuration_changed": 997473372, "route_changed": 997473177, "first_input_callback": 997473463, "app_lifecycle": 997468404}
## log anchor session_activated: 2026-09-14 10:17:30.093703-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd909902
## log anchor start_begin: 2026-09-14 10:17:30.248305-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x11818efb0: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:17:30.349342-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x11818efb0: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:17:30.184507-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909902 posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.033 s · agreement between them: 0 ms
   residual session_activated: log − journal = +0 ms
   residual start_begin: log − journal = -0 ms
   residual engine_configuration_changed: log − journal = -55 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -25 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:17:25.436
   session_activated: wall ≈ 10:17:30.093
   start_begin: wall ≈ 10:17:30.248
   start_return: wall ≈ 10:17:30.398
   engine_configuration_changed: wall ≈ 10:17:30.404
   first_input_callback: wall ≈ 10:17:30.495
## entries inside engine.start() [10:17:30.248 … 10:17:30.398] (150 ms): 262 · per process: [["SpringBoard", 142], ["bluetoothd", 98], ["VoiceKernelHarness", 12], ["audioaccessoryd", 10]]
   10:17:30.248 +   0 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262033412.
   10:17:30.248 +   0 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:17:30.248 +   0 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:17:30.251 +   3 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x7892f6280
   10:17:30.251 +   3 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:17:30.251 +   3 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:17:30.251 +   3 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:17:30.251 +   3 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:17:30.251 +   3 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:17:30.251 +   3 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:17:30.251 +   3 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:17:30.252 +   4 ms SpringBoard  observedProcessStatesDidChange
   10:17:30.252 +   4 ms SpringBoard com.apple.runningboard Received state update for 63973 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:17:30.253 +   5 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:17:30.253 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:17:30.253 +   5 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:17:30.253 +   5 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:17:30.253 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:17:30.253 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:17:30.253 +   5 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:17:30.253 +   5 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:17:30.253 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:17:30.253 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:17:30.253 +   5 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:17:30.254 +   6 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:17:30.254 +   6 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:17:30.254 +   6 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:17:30.255 +   7 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:17:30.255 +   7 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:17:30.255 +   7 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when the main run loop is idle
   10:17:30.255 +   7 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier finished setting up run loop observer
   10:17:30.255 +   7 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier run loop observer fired
   10:17:30.255 +   7 ms VoiceKernelHarness com.apple.dt.xctest Sending main run loop idle reply
   10:17:30.255 +   7 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when animations are idle
   10:17:30.255 +   7 ms VoiceKernelHarness com.apple.dt.xctest Sending animations idle reply with error: (null)
   10:17:30.257 +   9 ms VoiceKernelHarness  observedProcessStatesDidChange
   10:17:30.258 +  10 ms VoiceKernelHarness com.apple.runningboard Received state update for 63973 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, unknown-NotVis
   10:17:30.263 +  15 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:17:30.263 +  15 ms audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:17:30.263 +  15 ms audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:17:30.263 +  15 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:17:30.263 +  15 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:17:30.263 +  15 ms audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:17:30.263 +  15 ms audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:17:30.264 +  16 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Active camera/microphone activity changed:
{(
    <SBSensorActivityAttribution: 0x798881800; displ
   10:17:30.264 +  16 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Turning on...
   10:17:30.264 +  16 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Registering SystemAperture element
   10:17:30.264 +  16 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element dwell time satisfied changed: NO; oldValue: YES
   10:17:30.264 +  16 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element MOT changed: NO; oldValue: YES
   10:17:30.264 +  16 ms SpringBoard com.apple.SystemAperture Asked to register element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SBRecordingIndica
   10:17:30.264 +  16 ms SpringBoard com.apple.SystemAperture Attempt to uniquely identify element that already has a unique identifier – ignoring: element: <SBRecordingIndicatorSyst
   10:17:30.264 +  16 ms SpringBoard com.apple.SystemAperture Created assertion (<SAUIElementAssertion: 0x7892579c0>) for element: <SBRecordingIndicatorSystemApertureElement: 0x789ed
   10:17:30.264 +  16 ms SpringBoard com.apple.SystemAperture Asked to add view controller for element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SB
   10:17:30.264 +  16 ms audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:17:30.264 +  16 ms audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 11, current score is 6 (High)
   10:17:30.264 +  16 ms audioaccessoryd  Sharing/SFDeviceDiscovery/deviceDiscoveryUpdate
   10:17:30.264 +  16 ms SpringBoard com.apple.SpringBoard <BSCompoundAssertion:0x7898bb200> (SBSecureIndicatorBacklightCoordinator) acquire for reason:SBRecordingIndicatorViewCon
   10:17:30.264 +  16 ms SpringBoard com.apple.SpringBoard [Recording Indicator] updating live rendering assertion... hasSecureIndicator: YES, isActive: YES, windowScene: <private
   10:17:30.265 +  17 ms SpringBoard com.apple.BacklightServices 0x78b2ac7e0 will acquire assertion:<BLSAssertion: 0x797145650; state: requestAcquire; requested: 37547839191194 approx:1
   10:17:30.265 +  17 ms bluetoothd com.apple.bluetooth Start scanning for process sharingd (60330) with scan request of type 7, blob: {length = 0, bytes = 0x}, mask {length = 
## audio-DAEMON entries (audiomxd/audioaccessoryd/…; not the harness) from activation−150 ms to first callback+50 ms: 26
## audiomxd entries in that interval: 0 · per process: [["audioaccessoryd", 26]]
   10:17:30.099 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:17:30.121 audioaccessoryd com.apple.AudioAccessory Mute Control: call state changed, isCallActive: yes, isCallHighPriority: no
   10:17:30.122 audioaccessoryd com.apple.AudioAccessory Mute Control: shouldSuppressBanner: no, shouldSuppressChime: no
   10:17:30.122 audioaccessoryd com.apple.bluetooth Received Call State changed yes
   10:17:30.126 audioaccessoryd com.apple.SmartRouting onDemandEventStarted yes event Call
   10:17:30.126 audioaccessoryd com.apple.SmartRouting OnDemandEventTimer: Start. Will reset it in 8s
   10:17:30.128 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:17:30.132 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:17:30.138 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:17:30.138 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:17:30.184 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:17:30.184 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:17:30.221 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:17:30.230 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:17:30.236 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:17:30.236 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:17:30.263 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:17:30.263 audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:17:30.263 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:17:30.263 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:17:30.263 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:17:30.263 audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:17:30.263 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:17:30.264 audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:17:30.264 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 11, current score is 6 (High)
   10:17:30.264 audioaccessoryd  Sharing/SFDeviceDiscovery/deviceDiscoveryUpdate
