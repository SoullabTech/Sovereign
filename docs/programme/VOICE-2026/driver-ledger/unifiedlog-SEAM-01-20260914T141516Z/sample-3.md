## window.json sha256 fcede20f22676e721da426182a5aa8a364e3fe4f0d4878d910d6e98915f39905 · bytes 53971059
## decoded one JSON value ending at char 53970097 · residue 143 chars recorded verbatim (window-s3-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 45433
## event types: [('logEvent', 42506), ('activityCreateEvent', 2919), ('stateEvent', 8)]
## top processes: [('CommCenter', 4848), ('SpringBoard', 4087), ('mediaplaybackd', 2912), ('corespeechd', 2884), ('VoiceKernelHarness', 1850), ('powerexperienced', 1420), ('symptomsd', 1235), ('pkd', 1101), ('locationd', 1067), ('bluetoothd', 1000), ('WirelessRadioManagerd', 931), ('sharingd', 858), ('cameracaptured', 740), ('swcd', 737), ('Authenticator', 715)]
## top subsystems: [('com.apple.CommCenter', 4113), ('com.apple.coreaudio', 3948), ('', 3554), ('com.apple.corespeech', 2105), ('com.apple.coremedia', 2015), ('com.apple.xpc', 1991), ('com.apple.powerexperienced', 1368), ('com.apple.PlugInKit', 1338), ('com.apple.runningboard', 1235), ('com.apple.network', 1225), ('com.apple.symptomsd', 1055), ('com.apple.dt.xctest', 944), ('com.apple.SpringBoard', 819), ('com.apple.bluetooth', 780), ('com.apple.avfaudio', 731)]
## first timestamp: 2026-09-14 10:16:38.172229-0400 · last: 2026-09-14 10:17:10.860939-0400
## audio-related entries kept (window-s3-audio.jsonl): 7155 · per process: [('SpringBoard', 4087), ('VoiceKernelHarness', 1850), ('bluetoothd', 1000), ('audioaccessoryd', 218)]
## mediaserverd: NOT PRESENT IN THE S3-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S3-LEVEL WINDOW
## harness-process entries: 1850 · first: 2026-09-14 10:16:44.169196-0400 · last: 2026-09-14 10:17:07.087657-0400
## harness pids in window: 63970: 1850 entries 10:16:44.169…10:17:07.087
## sample pid = 63970 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 997432397, "start_begin": 997432554, "start_return": 997432709, "engine_configuration_changed": 997432848, "route_changed": 997432431, "first_input_callback": null, "app_lifecycle": 997427566}
## log anchor session_activated: 2026-09-14 10:16:49.429690-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd9098fe
## log anchor start_begin: 2026-09-14 10:16:49.586447-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x10718f4c0: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:16:49.878983-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x10718f4c0: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:16:49.459275-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd9098fe posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.033 s · agreement between them: 0 ms
   residual session_activated: log − journal = +0 ms
   residual start_begin: log − journal = -0 ms
   residual engine_configuration_changed: log − journal = -2 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -4 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:16:44.598
   session_activated: wall ≈ 10:16:49.429
   start_begin: wall ≈ 10:16:49.586
   start_return: wall ≈ 10:16:49.741
   engine_configuration_changed: wall ≈ 10:16:49.880
## entries inside engine.start() [10:16:49.586 … 10:16:49.741] (155 ms): 267 · per process: [["SpringBoard", 147], ["bluetoothd", 99], ["audioaccessoryd", 11], ["VoiceKernelHarness", 10]]
   10:16:49.586 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10b4ff9e8] AudioConverterNew wasn't needed since incoming an
   10:16:49.586 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x1072f0f00] initialized with error = 0
   10:16:49.586 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x10ba4c040)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:16:49.586 +   0 ms SpringBoard com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd9095d5 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:16:49.587 +   1 ms SpringBoard com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd9095dd posting AVAudioSessionRouteChangeNotification. Reason: A
   10:16:49.589 +   3 ms audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:16:49.589 +   3 ms SpringBoard com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd9095d5 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:16:49.589 +   3 ms bluetoothd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd90900c posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:16:49.589 +   3 ms VoiceKernelHarness com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd9098fe posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:16:49.589 +   3 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xbc03
   10:16:49.589 +   3 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262021124.
   10:16:49.589 +   3 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:16:49.589 +   3 ms SpringBoard com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd9095dd posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:16:49.589 +   3 ms SpringBoard com.apple.siri -[SASBluetoothEndpointUtility _setEndpointTypeWithNotification:]_block_invoke Endpoint type is not found from AVSystemCo
   10:16:49.590 +   4 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:16:49.592 +   6 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x78872e160
   10:16:49.592 +   6 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:16:49.592 +   6 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:16:49.592 +   6 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:16:49.592 +   6 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:16:49.592 +   6 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:16:49.593 +   6 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:16:49.593 +   6 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:16:49.593 +   7 ms SpringBoard  observedProcessStatesDidChange
   10:16:49.593 +   7 ms SpringBoard com.apple.runningboard Received state update for 63970 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:16:49.594 +   8 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:16:49.595 +   8 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:16:49.595 +   8 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:16:49.595 +   8 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:16:49.595 +   8 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:16:49.595 +   8 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:16:49.595 +   8 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:16:49.595 +   8 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:16:49.595 +   8 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:16:49.595 +   8 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:16:49.595 +   8 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:16:49.595 +   8 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:16:49.595 +   9 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:16:49.595 +   9 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:16:49.595 +   9 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:16:49.595 +   9 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:16:49.597 +  11 ms VoiceKernelHarness  observedProcessStatesDidChange
   10:16:49.597 +  11 ms VoiceKernelHarness com.apple.runningboard Received state update for 63970 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, unknown-NotVis
   10:16:49.597 +  11 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Active camera/microphone activity changed:
{(
    <SBSensorActivityAttribution: 0x7954b22b0; displ
   10:16:49.597 +  11 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Turning on...
   10:16:49.597 +  11 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Registering SystemAperture element
   10:16:49.597 +  11 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element dwell time satisfied changed: NO; oldValue: YES
   10:16:49.597 +  11 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element MOT changed: NO; oldValue: YES
   10:16:49.597 +  11 ms SpringBoard com.apple.SystemAperture Asked to register element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SBRecordingIndica
   10:16:49.597 +  11 ms SpringBoard com.apple.SystemAperture Attempt to uniquely identify element that already has a unique identifier – ignoring: element: <SBRecordingIndicatorSyst
   10:16:49.597 +  11 ms SpringBoard com.apple.SystemAperture Created assertion (<SAUIElementAssertion: 0x7874aa700>) for element: <SBRecordingIndicatorSystemApertureElement: 0x789ed
   10:16:49.597 +  11 ms SpringBoard com.apple.SystemAperture Asked to add view controller for element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SB
   10:16:49.597 +  11 ms SpringBoard com.apple.SpringBoard <BSCompoundAssertion:0x7898bb200> (SBSecureIndicatorBacklightCoordinator) acquire for reason:SBRecordingIndicatorViewCon
   10:16:49.597 +  11 ms SpringBoard com.apple.SpringBoard [Recording Indicator] updating live rendering assertion... hasSecureIndicator: YES, isActive: YES, windowScene: <private
   10:16:49.597 +  11 ms SpringBoard com.apple.BacklightServices 0x78b2ac7e0 will acquire assertion:<BLSAssertion: 0x798b0f100; state: requestAcquire; requested: 37546863185439 approx:1
   10:16:49.598 +  11 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:16:49.598 +  11 ms audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:16:49.598 +  11 ms audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:16:49.598 +  11 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:16:49.598 +  11 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
