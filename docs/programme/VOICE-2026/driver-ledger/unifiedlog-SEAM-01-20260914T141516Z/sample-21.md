## window.json sha256 b631b47abc197a38538103b87694e4cded601fd2cccd6db9d7a13c6e93c427e8 · bytes 42265543
## decoded one JSON value ending at char 42264457 · residue 143 chars recorded verbatim (window-s21-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 36133
## event types: [('logEvent', 33684), ('activityCreateEvent', 2442), ('stateEvent', 7)]
## top processes: [('CommCenter', 4267), ('dasd', 2523), ('SpringBoard', 2469), ('VoiceKernelHarness', 1187), ('locationd', 1180), ('pkd', 1095), ('bluetoothd', 1020), ('nsurlsessiond', 962), ('suggestd', 864), ('appleh16camerad', 775), ('sharingd', 751), ('mediaplaybackd', 721), ('powerexperienced', 706), ('SharingUIService', 658), ('testmanagerd', 635)]
## top subsystems: [('com.apple.CommCenter', 4018), ('', 3066), ('com.apple.duetactivityscheduler', 2408), ('com.apple.xpc', 2054), ('com.apple.network', 1443), ('com.apple.PlugInKit', 1331), ('com.apple.contacts', 1171), ('com.apple.coreaudio', 1110), ('com.apple.bluetooth', 967), ('com.apple.dt.xctest', 927), ('com.apple.runningboard', 710), ('com.apple.powerexperienced', 680), ('com.apple.ShareSheet', 635), ('com.apple.SpringBoard', 572), ('com.apple.launchservices', 570)]
## first timestamp: 2026-09-14 10:29:35.019317-0400 · last: 2026-09-14 10:30:07.933640-0400
## audio-related entries kept (window-s21-audio.jsonl): 4782 · per process: [('SpringBoard', 2469), ('VoiceKernelHarness', 1187), ('bluetoothd', 1020), ('audioaccessoryd', 106)]
## mediaserverd: NOT PRESENT IN THE S21-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S21-LEVEL WINDOW
## harness-process entries: 1187 · first: 2026-09-14 10:29:41.148079-0400 · last: 2026-09-14 10:30:04.078821-0400
## harness pids in window: 64050: 1187 entries 10:29:41.148…10:30:04.078
## sample pid = 64050 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 998209246, "start_begin": 998209385, "start_return": 998209530, "engine_configuration_changed": 998209536, "route_changed": 998209353, "first_input_callback": 998209628, "app_lifecycle": 998204551}
## log anchor session_activated: 2026-09-14 10:29:46.278482-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd909946
## log anchor start_begin: 2026-09-14 10:29:46.417535-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x107192fc0: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:29:46.521081-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x107192fc0: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:29:46.382479-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909946 posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.033 s · agreement between them: 0 ms
   residual session_activated: log − journal = -0 ms
   residual start_begin: log − journal = +0 ms
   residual engine_configuration_changed: log − journal = -47 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -3 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:29:41.583
   session_activated: wall ≈ 10:29:46.278
   start_begin: wall ≈ 10:29:46.417
   start_return: wall ≈ 10:29:46.562
   engine_configuration_changed: wall ≈ 10:29:46.568
   first_input_callback: wall ≈ 10:29:46.660
## entries inside engine.start() [10:29:46.417 … 10:29:46.562] (145 ms): 175 · per process: [["SpringBoard", 143], ["VoiceKernelHarness", 20], ["audioaccessoryd", 10], ["bluetoothd", 2]]
   10:29:46.417 +   0 ms VoiceKernelHarness com.apple.avfaudio AVAudioEngine.mm:1182  Engine@0x107192fc0: start, was running 0
   10:29:46.417 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x10b2c4f00] Created node rio-outclient with nodeID 3 - reporting period = 10.000000
   10:29:46.417 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x10b2c4f00] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:29:46.417 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10b256a28] AudioConverterNew wasn't needed since incoming an
   10:29:46.417 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10b255c28] AudioConverterNew wasn't needed since incoming an
   10:29:46.417 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x10b2c4f00] initialized with error = 0
   10:29:46.417 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x10ba28040)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:29:46.417 +   0 ms SpringBoard com.apple.Hearing Posting pickableAudioRoutesDidChange notification
   10:29:46.417 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xef07
   10:29:46.417 +   0 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262348804.
   10:29:46.417 +   0 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:29:46.417 +   0 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:29:46.418 +   1 ms bluetoothd com.apple.bluetooth GetDevices: flags 0x0 < >, total 28
   10:29:46.419 +   2 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x789230100
   10:29:46.419 +   2 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:29:46.419 +   2 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:29:46.419 +   2 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:29:46.419 +   2 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:29:46.419 +   2 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:29:46.419 +   2 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:29:46.419 +   2 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:29:46.419 +   2 ms SpringBoard  observedProcessStatesDidChange
   10:29:46.419 +   2 ms SpringBoard com.apple.runningboard Received state update for 64050 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:29:46.421 +   4 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:29:46.421 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:29:46.421 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:29:46.421 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:29:46.421 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:29:46.421 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:29:46.421 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:29:46.421 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:29:46.421 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:29:46.421 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:29:46.421 +   4 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:29:46.421 +   4 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:29:46.421 +   4 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:29:46.422 +   4 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:29:46.422 +   5 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:29:46.422 +   5 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:29:46.432 +  14 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when the main run loop is idle
   10:29:46.432 +  15 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier finished setting up run loop observer
   10:29:46.432 +  15 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier run loop observer fired
   10:29:46.432 +  15 ms VoiceKernelHarness com.apple.dt.xctest Sending main run loop idle reply
   10:29:46.432 +  15 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when animations are idle
   10:29:46.432 +  15 ms VoiceKernelHarness com.apple.dt.xctest Sending animations idle reply with error: (null)
   10:29:46.433 +  16 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Active camera/microphone activity changed:
{(
    <SBSensorActivityAttribution: 0x792e427c0; displ
   10:29:46.433 +  16 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Turning on...
   10:29:46.433 +  16 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Registering SystemAperture element
   10:29:46.433 +  16 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element dwell time satisfied changed: NO; oldValue: YES
   10:29:46.433 +  16 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element MOT changed: NO; oldValue: YES
   10:29:46.433 +  16 ms SpringBoard com.apple.SystemAperture Asked to register element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SBRecordingIndica
   10:29:46.433 +  16 ms SpringBoard com.apple.SystemAperture Attempt to uniquely identify element that already has a unique identifier – ignoring: element: <SBRecordingIndicatorSyst
   10:29:46.433 +  16 ms SpringBoard com.apple.SystemAperture Created assertion (<SAUIElementAssertion: 0x7875d8ec0>) for element: <SBRecordingIndicatorSystemApertureElement: 0x789ed
   10:29:46.433 +  16 ms SpringBoard com.apple.SystemAperture Asked to add view controller for element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SB
   10:29:46.433 +  16 ms SpringBoard com.apple.SpringBoard <BSCompoundAssertion:0x7898bb200> (SBSecureIndicatorBacklightCoordinator) acquire for reason:SBRecordingIndicatorViewCon
   10:29:46.433 +  16 ms SpringBoard com.apple.SpringBoard [Recording Indicator] updating live rendering assertion... hasSecureIndicator: YES, isActive: YES, windowScene: <private
   10:29:46.434 +  17 ms SpringBoard com.apple.BacklightServices 0x78b2ac7e0 will acquire assertion:<BLSAssertion: 0x7972ccd20; state: requestAcquire; requested: 37565507248358 approx:1
   10:29:46.439 +  22 ms VoiceKernelHarness  observedProcessStatesDidChange
   10:29:46.439 +  22 ms VoiceKernelHarness com.apple.runningboard Received state update for 64050 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, unknown-NotVis
   10:29:46.441 +  24 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
## audio-DAEMON entries (audiomxd/audioaccessoryd/…; not the harness) from activation−150 ms to first callback+50 ms: 26
## audiomxd entries in that interval: 0 · per process: [["audioaccessoryd", 26]]
   10:29:46.284 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:29:46.301 audioaccessoryd com.apple.bluetooth Received Call State changed yes
   10:29:46.301 audioaccessoryd com.apple.SmartRouting onDemandEventStarted yes event Call
   10:29:46.301 audioaccessoryd com.apple.SmartRouting OnDemandEventTimer: Start. Will reset it in 8s
   10:29:46.301 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:29:46.301 audioaccessoryd com.apple.AudioAccessory Mute Control: call state changed, isCallActive: yes, isCallHighPriority: no
   10:29:46.301 audioaccessoryd com.apple.AudioAccessory Mute Control: shouldSuppressBanner: no, shouldSuppressChime: no
   10:29:46.311 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:29:46.318 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:29:46.318 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:29:46.375 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:29:46.390 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:29:46.393 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:29:46.402 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:29:46.406 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:29:46.406 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:29:46.441 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:29:46.441 audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:29:46.441 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:29:46.441 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:29:46.441 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:29:46.441 audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:29:46.441 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:29:46.442 audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:29:46.442 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 7, current score is 2 (Low)
   10:29:46.442 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: activity evaluation ALDS 27s, AL 7
