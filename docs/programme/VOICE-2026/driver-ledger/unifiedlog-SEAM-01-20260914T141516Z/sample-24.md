## window.json sha256 4e44d32cb18620e6f11252adb5eeac2a5f8cc23691da557670e766cf7a1dd75e · bytes 99445458
## decoded one JSON value ending at char 99443270 · residue 143 chars recorded verbatim (window-s24-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 86405
## event types: [('logEvent', 68606), ('activityCreateEvent', 17792), ('stateEvent', 7)]
## top processes: [('tccd', 8358), ('duetexpertd', 6239), ('sensorkitd', 4692), ('CommCenter', 4663), ('SpringBoard', 3521), ('locationd', 2993), ('CloudTelemetryService', 2979), ('corespeechd', 2656), ('mediaplaybackd', 2584), ('VoiceKernelHarness', 1751), ('mDNSResponder', 1622), ('powerexperienced', 1580), ('dataaccessd', 1475), ('homed', 1460), ('bluetoothd', 1412)]
## top subsystems: [('', 19120), ('com.apple.xpc', 10303), ('com.apple.TCC', 4411), ('com.apple.duetexpertd.atx', 4357), ('com.apple.network', 4141), ('com.apple.CommCenter', 4014), ('com.apple.cloudkit', 3801), ('com.apple.coreaudio', 3639), ('com.apple.coremedia', 1802), ('com.apple.corespeech', 1791), ('com.apple.powerexperienced', 1522), ('com.apple.PlugInKit', 1331), ('contextualengine', 1302), ('com.apple.runningboard', 1133), ('com.apple.SensorKit', 1088)]
## first timestamp: 2026-09-14 10:31:56.151454-0400 · last: 2026-09-14 10:32:28.945187-0400
## audio-related entries kept (window-s24-audio.jsonl): 7246 · per process: [('SpringBoard', 3521), ('VoiceKernelHarness', 1751), ('bluetoothd', 1412), ('audioaccessoryd', 546), ('audioclocksyncd', 16)]
## mediaserverd: NOT PRESENT IN THE S24-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S24-LEVEL WINDOW
## harness-process entries: 1751 · first: 2026-09-14 10:32:01.943554-0400 · last: 2026-09-14 10:32:24.923302-0400
## harness pids in window: 64065: 1751 entries 10:32:01.943…10:32:24.923
## sample pid = 64065 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 998350211, "start_begin": 998350366, "start_return": 998350518, "engine_configuration_changed": 998350553, "route_changed": 998350334, "first_input_callback": 998356753, "app_lifecycle": 998345337}
## log anchor session_activated: 2026-09-14 10:32:07.243125-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd909952
## log anchor start_begin: 2026-09-14 10:32:07.398676-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x13016b590: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:32:07.504869-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x13016b590: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:32:07.363622-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909952 posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.032 s · agreement between them: 1 ms
   residual session_activated: log − journal = -0 ms
   residual start_begin: log − journal = +0 ms
   residual engine_configuration_changed: log − journal = -81 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -3 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:32:02.369
   session_activated: wall ≈ 10:32:07.243
   start_begin: wall ≈ 10:32:07.398
   start_return: wall ≈ 10:32:07.550
   engine_configuration_changed: wall ≈ 10:32:07.585
   first_input_callback: wall ≈ 10:32:13.785
## entries inside engine.start() [10:32:07.398 … 10:32:07.550] (152 ms): 167 · per process: [["SpringBoard", 142], ["VoiceKernelHarness", 14], ["audioaccessoryd", 10], ["bluetoothd", 1]]
   10:32:07.398 +   0 ms VoiceKernelHarness com.apple.avfaudio AVAudioEngine.mm:1182  Engine@0x13016b590: start, was running 0
   10:32:07.398 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x1302f9200] Created node rio-outclient with nodeID 3 - reporting period = 10.000000
   10:32:07.398 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x1302f9200] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:32:07.398 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x131280fe8] AudioConverterNew wasn't needed since incoming an
   10:32:07.398 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x1312803a8] AudioConverterNew wasn't needed since incoming an
   10:32:07.398 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x1302f9200] initialized with error = 0
   10:32:07.398 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x1313da840)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:32:07.399 +   1 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0x9e1b
   10:32:07.399 +   1 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262410244.
   10:32:07.399 +   1 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:32:07.399 +   1 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:32:07.400 +   2 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x789002b00
   10:32:07.400 +   2 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:32:07.400 +   2 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:32:07.400 +   2 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:32:07.400 +   2 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:32:07.400 +   2 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:32:07.400 +   2 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:32:07.400 +   2 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:32:07.400 +   2 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:32:07.400 +   2 ms audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:32:07.400 +   2 ms audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:32:07.400 +   3 ms audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:32:07.400 +   3 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:32:07.400 +   3 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:32:07.401 +   3 ms audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:32:07.401 +   3 ms SpringBoard  observedProcessStatesDidChange
   10:32:07.401 +   3 ms SpringBoard com.apple.runningboard Received state update for 64065 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:32:07.402 +   4 ms VoiceKernelHarness  observedProcessStatesDidChange
   10:32:07.402 +   4 ms VoiceKernelHarness com.apple.runningboard Received state update for 64065 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, unknown-NotVis
   10:32:07.402 +   4 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:32:07.402 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:32:07.402 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:32:07.402 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:32:07.402 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:32:07.402 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:32:07.402 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:32:07.402 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:32:07.402 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:32:07.402 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:32:07.402 +   4 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:32:07.402 +   4 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:32:07.402 +   4 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:32:07.402 +   4 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:32:07.403 +   5 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:32:07.403 +   5 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:32:07.405 +   7 ms audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:32:07.405 +   7 ms audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 7, current score is 2 (Low)
   10:32:07.405 +   7 ms audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: activity evaluation ALDS 28s, AL 7
   10:32:07.413 +  15 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Active camera/microphone activity changed:
{(
    <SBSensorActivityAttribution: 0x78e36c0f0; displ
   10:32:07.413 +  15 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Turning on...
   10:32:07.413 +  15 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Registering SystemAperture element
   10:32:07.413 +  15 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element dwell time satisfied changed: NO; oldValue: YES
   10:32:07.413 +  15 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element MOT changed: NO; oldValue: YES
   10:32:07.413 +  15 ms SpringBoard com.apple.SystemAperture Asked to register element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SBRecordingIndica
   10:32:07.413 +  15 ms SpringBoard com.apple.SystemAperture Attempt to uniquely identify element that already has a unique identifier – ignoring: element: <SBRecordingIndicatorSyst
   10:32:07.413 +  15 ms SpringBoard com.apple.SystemAperture Created assertion (<SAUIElementAssertion: 0x7879d9b80>) for element: <SBRecordingIndicatorSystemApertureElement: 0x789ed
   10:32:07.413 +  15 ms SpringBoard com.apple.SystemAperture Asked to add view controller for element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SB
   10:32:07.413 +  15 ms SpringBoard com.apple.SpringBoard <BSCompoundAssertion:0x7898bb200> (SBSecureIndicatorBacklightCoordinator) acquire for reason:SBRecordingIndicatorViewCon
   10:32:07.413 +  15 ms SpringBoard com.apple.SpringBoard [Recording Indicator] updating live rendering assertion... hasSecureIndicator: YES, isActive: YES, windowScene: <private
## audio-DAEMON entries (audiomxd/audioaccessoryd/…; not the harness) from activation−150 ms to first callback+50 ms: 159
## audiomxd entries in that interval: 0 · per process: [["audioaccessoryd", 159]]
   10:32:07.249 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:32:07.272 audioaccessoryd com.apple.bluetooth Received Call State changed yes
   10:32:07.272 audioaccessoryd com.apple.SmartRouting onDemandEventStarted yes event Call
   10:32:07.272 audioaccessoryd com.apple.SmartRouting OnDemandEventTimer: Start. Will reset it in 8s
   10:32:07.272 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:32:07.272 audioaccessoryd com.apple.AudioAccessory Mute Control: call state changed, isCallActive: yes, isCallHighPriority: no
   10:32:07.272 audioaccessoryd com.apple.AudioAccessory Mute Control: shouldSuppressBanner: no, shouldSuppressChime: no
   10:32:07.286 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:32:07.291 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:32:07.291 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:32:07.360 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:32:07.372 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:32:07.382 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:32:07.387 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:32:07.387 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:32:07.395 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:32:07.400 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:32:07.400 audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:32:07.400 audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:32:07.400 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:32:07.400 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:32:07.400 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:32:07.401 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:32:07.405 audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:32:07.405 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 7, current score is 2 (Low)
   10:32:07.405 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: activity evaluation ALDS 28s, AL 7
   10:32:07.572 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=Unknown isPlaying=100
   10:32:07.572 audioaccessoryd com.apple.bluetooth Updating local audio category 501 -> 100 app Unknown
   10:32:07.572 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 501 to 100
   10:32:07.572 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 100 for all discovered 3P devices
