## window.json sha256 0747b9f3ccfb49c913a4a664b7547861549470b18ccbabf12b5a282e8b255fe4 · bytes 47811061
## decoded one JSON value ending at char 47810316 · residue 143 chars recorded verbatim (window-s7-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 40279
## event types: [('logEvent', 38045), ('activityCreateEvent', 2227), ('stateEvent', 7)]
## top processes: [('CommCenter', 4451), ('SpringBoard', 3819), ('mediaplaybackd', 2903), ('corespeechd', 2797), ('VoiceKernelHarness', 1855), ('powerexperienced', 1420), ('pkd', 1095), ('bluetoothd', 983), ('sharingd', 919), ('locationd', 803), ('mDNSResponder', 765), ('cameracaptured', 745), ('WirelessRadioManagerd', 724), ('heard', 674), ('wifid', 670)]
## top subsystems: [('com.apple.CommCenter', 4023), ('com.apple.coreaudio', 3854), ('', 2807), ('com.apple.corespeech', 2027), ('com.apple.coremedia', 2010), ('com.apple.xpc', 1675), ('com.apple.powerexperienced', 1368), ('com.apple.PlugInKit', 1330), ('com.apple.network', 1057), ('com.apple.runningboard', 1036), ('com.apple.dt.xctest', 929), ('com.apple.bluetooth', 759), ('com.apple.avfaudio', 726), ('com.apple.SpringBoard', 723), ('com.apple.ShareSheet', 634)]
## first timestamp: 2026-09-14 10:19:21.064245-0400 · last: 2026-09-14 10:19:53.985173-0400
## audio-related entries kept (window-s7-audio.jsonl): 6891 · per process: [('SpringBoard', 3819), ('VoiceKernelHarness', 1855), ('bluetoothd', 983), ('audioaccessoryd', 218), ('audioclocksyncd', 16)]
## mediaserverd: NOT PRESENT IN THE S7-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S7-LEVEL WINDOW
## harness-process entries: 1855 · first: 2026-09-14 10:19:27.328994-0400 · last: 2026-09-14 10:19:50.438201-0400
## harness pids in window: 63986: 1855 entries 10:19:27.328…10:19:50.438
## sample pid = 63986 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 997595358, "start_begin": 997595501, "start_return": 997595651, "engine_configuration_changed": 997595789, "route_changed": 997595467, "first_input_callback": 997605195, "app_lifecycle": 997590726}
## log anchor session_activated: 2026-09-14 10:19:32.390068-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd90990e
## log anchor start_begin: 2026-09-14 10:19:32.533203-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x1075730e0: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:19:32.820503-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x1075730e0: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:19:32.497674-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd90990e posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.032 s · agreement between them: 0 ms
   residual session_activated: log − journal = -0 ms
   residual start_begin: log − journal = +0 ms
   residual engine_configuration_changed: log − journal = -1 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -1 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:19:27.758
   session_activated: wall ≈ 10:19:32.390
   start_begin: wall ≈ 10:19:32.533
   start_return: wall ≈ 10:19:32.683
   engine_configuration_changed: wall ≈ 10:19:32.821
   first_input_callback: wall ≈ 10:19:42.227
## entries inside engine.start() [10:19:32.533 … 10:19:32.683] (150 ms): 293 · per process: [["SpringBoard", 161], ["bluetoothd", 103], ["VoiceKernelHarness", 19], ["audioaccessoryd", 10]]
   10:19:32.533 +   0 ms VoiceKernelHarness com.apple.avfaudio AVAudioEngine.mm:1182  Engine@0x1075730e0: start, was running 0
   10:19:32.533 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x10b5af300] Created node rio-outclient with nodeID 3 - reporting period = 10.000000
   10:19:32.533 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x10b5af300] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:19:32.533 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10a7bf4a8] AudioConverterNew wasn't needed since incoming an
   10:19:32.533 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10b5d3d68] AudioConverterNew wasn't needed since incoming an
   10:19:32.533 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x10b5af300] initialized with error = 0
   10:19:32.533 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x10be20040)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:19:32.533 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xe903
   10:19:32.533 +   1 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262086660.
   10:19:32.533 +   1 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:19:32.533 +   1 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:19:32.535 +   2 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x788688f00
   10:19:32.535 +   2 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:19:32.535 +   2 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:19:32.535 +   2 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:19:32.535 +   2 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:19:32.535 +   2 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:19:32.535 +   2 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:19:32.535 +   2 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:19:32.536 +   3 ms SpringBoard  observedProcessStatesDidChange
   10:19:32.536 +   3 ms SpringBoard com.apple.runningboard Received state update for 63986 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:19:32.537 +   4 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:19:32.537 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:19:32.537 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:19:32.537 +   5 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:19:32.537 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:19:32.537 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:19:32.537 +   5 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:19:32.537 +   5 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:19:32.537 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:19:32.537 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:19:32.537 +   5 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:19:32.537 +   5 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:19:32.537 +   5 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:19:32.537 +   5 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:19:32.538 +   5 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:19:32.538 +   5 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:19:32.538 +   6 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when the main run loop is idle
   10:19:32.539 +   6 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier run loop observer fired
   10:19:32.539 +   6 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier finished setting up run loop observer
   10:19:32.539 +   6 ms VoiceKernelHarness com.apple.dt.xctest Sending main run loop idle reply
   10:19:32.539 +   6 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when animations are idle
   10:19:32.539 +   6 ms VoiceKernelHarness com.apple.dt.xctest Sending animations idle reply with error: (null)
   10:19:32.540 +   7 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Active camera/microphone activity changed:
{(
    <SBSensorActivityAttribution: 0x78c03b930; displ
   10:19:32.540 +   7 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Turning on...
   10:19:32.540 +   7 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Registering SystemAperture element
   10:19:32.540 +   7 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element dwell time satisfied changed: NO; oldValue: YES
   10:19:32.540 +   7 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element MOT changed: NO; oldValue: YES
   10:19:32.540 +   7 ms SpringBoard com.apple.SystemAperture Asked to register element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SBRecordingIndica
   10:19:32.540 +   7 ms SpringBoard com.apple.SystemAperture Attempt to uniquely identify element that already has a unique identifier – ignoring: element: <SBRecordingIndicatorSyst
   10:19:32.540 +   7 ms SpringBoard com.apple.SystemAperture Created assertion (<SAUIElementAssertion: 0x786cd7f00>) for element: <SBRecordingIndicatorSystemApertureElement: 0x789ed
   10:19:32.540 +   7 ms SpringBoard com.apple.SystemAperture Asked to add view controller for element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SB
   10:19:32.540 +   7 ms SpringBoard com.apple.SpringBoard <BSCompoundAssertion:0x7898bb200> (SBSecureIndicatorBacklightCoordinator) acquire for reason:SBRecordingIndicatorViewCon
   10:19:32.540 +   7 ms SpringBoard com.apple.SpringBoard [Recording Indicator] updating live rendering assertion... hasSecureIndicator: YES, isActive: YES, windowScene: <private
   10:19:32.540 +   7 ms SpringBoard com.apple.BacklightServices 0x78b2ac7e0 will acquire assertion:<BLSAssertion: 0x798b00930; state: requestAcquire; requested: 37550773807307 approx:1
   10:19:32.541 +   8 ms VoiceKernelHarness  observedProcessStatesDidChange
   10:19:32.541 +   9 ms VoiceKernelHarness com.apple.runningboard Received state update for 63986 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, unknown-NotVis
   10:19:32.542 +   9 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:19:32.542 +   9 ms audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:19:32.542 +   9 ms audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
## audio-DAEMON entries (audiomxd/audioaccessoryd/…; not the harness) from activation−150 ms to first callback+50 ms: 151
## audiomxd entries in that interval: 0 · per process: [["audioaccessoryd", 151]]
   10:19:32.396 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:19:32.414 audioaccessoryd com.apple.bluetooth Received Call State changed yes
   10:19:32.414 audioaccessoryd com.apple.SmartRouting onDemandEventStarted yes event Call
   10:19:32.414 audioaccessoryd com.apple.SmartRouting OnDemandEventTimer: Start. Will reset it in 8s
   10:19:32.414 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:19:32.414 audioaccessoryd com.apple.AudioAccessory Mute Control: call state changed, isCallActive: yes, isCallHighPriority: no
   10:19:32.414 audioaccessoryd com.apple.AudioAccessory Mute Control: shouldSuppressBanner: no, shouldSuppressChime: no
   10:19:32.432 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:19:32.437 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:19:32.437 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:19:32.473 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:19:32.473 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:19:32.510 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:19:32.516 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:19:32.516 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:19:32.531 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:19:32.542 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:19:32.542 audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:19:32.542 audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:19:32.542 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:19:32.542 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:19:32.542 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:19:32.542 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:19:32.542 audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:19:32.542 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 11, current score is 6 (High)
   10:19:32.542 audioaccessoryd  Sharing/SFDeviceDiscovery/deviceDiscoveryUpdate
   10:19:32.707 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=Unknown isPlaying=100
   10:19:32.707 audioaccessoryd com.apple.bluetooth Updating local audio category 501 -> 100 app Unknown
   10:19:32.707 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 501 to 100
   10:19:32.707 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 100 for all discovered 3P devices
