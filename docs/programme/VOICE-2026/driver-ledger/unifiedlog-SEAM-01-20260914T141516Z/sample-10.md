## window.json sha256 d08bc71426a099e9cee909990431f9d1284f73e798157bb771bc1061efa93ad3 · bytes 65190587
## decoded one JSON value ending at char 65189735 · residue 143 chars recorded verbatim (window-s10-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 53906
## event types: [('logEvent', 44823), ('activityCreateEvent', 9075), ('stateEvent', 8)]
## top processes: [('CommCenter', 7960), ('assetsubscriptiond', 4742), ('securityd', 4518), ('TrustedPeersHelper', 3566), ('SpringBoard', 2609), ('locationd', 2476), ('mobileassetd', 2043), ('VoiceKernelHarness', 1180), ('pkd', 1094), ('bluetoothd', 910), ('appleh16camerad', 868), ('powerexperienced', 868), ('sharingd', 781), ('mediaplaybackd', 719), ('wifid', 669)]
## top subsystems: [('', 9739), ('com.apple.CommCenter', 7204), ('com.apple.MobileAsset', 3274), ('com.apple.xpc', 2091), ('com.apple.network', 1613), ('com.apple.mobileassetd', 1389), ('com.apple.UnifiedAssetFramework', 1352), ('com.apple.PlugInKit', 1331), ('com.apple.coreaudio', 1149), ('com.apple.IDS', 1091), ('com.apple.dt.xctest', 929), ('com.apple.PersistentConnection', 911), ('com.apple.bluetooth', 896), ('com.apple.security.ckks', 844), ('com.apple.powerexperienced', 836)]
## first timestamp: 2026-09-14 10:21:28.000779-0400 · last: 2026-09-14 10:22:00.998976-0400
## audio-related entries kept (window-s10-audio.jsonl): 4804 · per process: [('SpringBoard', 2609), ('VoiceKernelHarness', 1180), ('bluetoothd', 910), ('audioaccessoryd', 105)]
## mediaserverd: NOT PRESENT IN THE S10-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S10-LEVEL WINDOW
## harness-process entries: 1180 · first: 2026-09-14 10:21:34.178164-0400 · last: 2026-09-14 10:21:57.030409-0400
## harness pids in window: 64003: 1180 entries 10:21:34.178…10:21:57.030
## sample pid = 64003 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 997722340, "start_begin": 997722484, "start_return": 997722632, "engine_configuration_changed": 997722636, "route_changed": 997722449, "first_input_callback": 997722730, "app_lifecycle": 997717582}
## log anchor session_activated: 2026-09-14 10:21:39.372499-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd90991a
## log anchor start_begin: 2026-09-14 10:21:39.516528-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x10559efb0: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:21:39.622267-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x10559efb0: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:21:39.479424-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd90991a posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.033 s · agreement between them: 0 ms
   residual session_activated: log − journal = -0 ms
   residual start_begin: log − journal = +0 ms
   residual engine_configuration_changed: log − journal = -46 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -2 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:21:34.614
   session_activated: wall ≈ 10:21:39.372
   start_begin: wall ≈ 10:21:39.516
   start_return: wall ≈ 10:21:39.664
   engine_configuration_changed: wall ≈ 10:21:39.668
   first_input_callback: wall ≈ 10:21:39.762
## entries inside engine.start() [10:21:39.516 … 10:21:39.664] (148 ms): 170 · per process: [["SpringBoard", 142], ["VoiceKernelHarness", 14], ["audioaccessoryd", 11], ["bluetoothd", 3]]
   10:21:39.516 +   0 ms VoiceKernelHarness com.apple.avfaudio AVAudioEngine.mm:1182  Engine@0x10559efb0: start, was running 0
   10:21:39.516 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x1096c4f00] Created node rio-outclient with nodeID 3 - reporting period = 10.000000
   10:21:39.516 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x1096c4f00] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:21:39.516 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x109656f68] AudioConverterNew wasn't needed since incoming an
   10:21:39.516 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x109656168] AudioConverterNew wasn't needed since incoming an
   10:21:39.516 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x1096c4f00] initialized with error = 0
   10:21:39.516 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x109d65e40)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:21:39.516 +   0 ms bluetoothd com.apple.bluetooth GetDevices: flags 0x0 < >, total 28
   10:21:39.516 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xf33
   10:21:39.516 +   0 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262156292.
   10:21:39.516 +   0 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:21:39.516 +   0 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:21:39.517 +   1 ms bluetoothd com.apple.bluetooth GetDevices: flags 0x0 < >, total 28
   10:21:39.518 +   1 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x78816e900
   10:21:39.518 +   1 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:21:39.518 +   2 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:21:39.518 +   2 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:21:39.518 +   2 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:21:39.518 +   2 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:21:39.518 +   2 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:21:39.518 +   2 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:21:39.518 +   2 ms SpringBoard  observedProcessStatesDidChange
   10:21:39.518 +   2 ms SpringBoard com.apple.runningboard Received state update for 64003 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:21:39.519 +   3 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:21:39.519 +   3 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:21:39.519 +   3 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:21:39.519 +   3 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:21:39.519 +   3 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:21:39.519 +   3 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:21:39.519 +   3 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:21:39.519 +   3 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:21:39.519 +   3 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:21:39.519 +   3 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:21:39.519 +   3 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:21:39.519 +   3 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:21:39.520 +   4 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:21:39.520 +   4 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:21:39.520 +   4 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:21:39.520 +   4 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:21:39.522 +   6 ms VoiceKernelHarness  observedProcessStatesDidChange
   10:21:39.522 +   6 ms VoiceKernelHarness com.apple.runningboard Received state update for 64003 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, unknown-NotVis
   10:21:39.532 +  16 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Active camera/microphone activity changed:
{(
    <SBSensorActivityAttribution: 0x798ae1da0; displ
   10:21:39.533 +  17 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Turning on...
   10:21:39.533 +  17 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Registering SystemAperture element
   10:21:39.533 +  17 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element dwell time satisfied changed: NO; oldValue: YES
   10:21:39.533 +  17 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element MOT changed: NO; oldValue: YES
   10:21:39.533 +  17 ms SpringBoard com.apple.SystemAperture Asked to register element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SBRecordingIndica
   10:21:39.533 +  17 ms SpringBoard com.apple.SystemAperture Attempt to uniquely identify element that already has a unique identifier – ignoring: element: <SBRecordingIndicatorSyst
   10:21:39.533 +  17 ms SpringBoard com.apple.SystemAperture Created assertion (<SAUIElementAssertion: 0x78778d200>) for element: <SBRecordingIndicatorSystemApertureElement: 0x789ed
   10:21:39.533 +  17 ms SpringBoard com.apple.SystemAperture Asked to add view controller for element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SB
   10:21:39.533 +  17 ms SpringBoard com.apple.SpringBoard <BSCompoundAssertion:0x7898bb200> (SBSecureIndicatorBacklightCoordinator) acquire for reason:SBRecordingIndicatorViewCon
   10:21:39.533 +  17 ms SpringBoard com.apple.SpringBoard [Recording Indicator] updating live rendering assertion... hasSecureIndicator: YES, isActive: YES, windowScene: <private
   10:21:39.533 +  17 ms SpringBoard com.apple.BacklightServices 0x78b2ac7e0 will acquire assertion:<BLSAssertion: 0x7989b4e70; state: requestAcquire; requested: 37553821638826 approx:1
   10:21:39.535 +  19 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:21:39.535 +  19 ms audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:21:39.535 +  19 ms audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:21:39.535 +  19 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:21:39.535 +  19 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:21:39.535 +  19 ms audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:21:39.535 +  19 ms audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
## audio-DAEMON entries (audiomxd/audioaccessoryd/…; not the harness) from activation−150 ms to first callback+50 ms: 27
## audiomxd entries in that interval: 0 · per process: [["audioaccessoryd", 27]]
   10:21:39.380 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:21:39.399 audioaccessoryd com.apple.bluetooth Received Call State changed yes
   10:21:39.399 audioaccessoryd com.apple.SmartRouting onDemandEventStarted yes event Call
   10:21:39.399 audioaccessoryd com.apple.SmartRouting OnDemandEventTimer: Start. Will reset it in 8s
   10:21:39.399 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:21:39.399 audioaccessoryd com.apple.AudioAccessory Mute Control: call state changed, isCallActive: yes, isCallHighPriority: no
   10:21:39.399 audioaccessoryd com.apple.AudioAccessory Mute Control: shouldSuppressBanner: no, shouldSuppressChime: no
   10:21:39.407 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:21:39.412 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:21:39.412 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:21:39.478 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:21:39.486 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:21:39.498 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:21:39.505 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:21:39.505 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:21:39.513 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:21:39.535 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:21:39.535 audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:21:39.535 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:21:39.535 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:21:39.535 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:21:39.535 audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:21:39.535 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:21:39.535 audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:21:39.535 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 7, current score is 2 (Low)
   10:21:39.535 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: activity evaluation ALDS 25s, AL 7
   10:21:39.535 audioaccessoryd com.apple.bluetooth Check activity in 480s
