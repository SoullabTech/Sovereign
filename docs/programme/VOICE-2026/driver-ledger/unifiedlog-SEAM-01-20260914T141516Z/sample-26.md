## window.json sha256 9d5ecd54f8498d606310df84e064d2bc34f1dbbbbf93e34e71af156ede432ebe · bytes 67446115
## decoded one JSON value ending at char 67445159 · residue 143 chars recorded verbatim (window-s26-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 56969
## event types: [('logEvent', 53684), ('activityCreateEvent', 3278), ('stateEvent', 7)]
## top processes: [('SpringBoard', 6625), ('CommCenter', 5350), ('duetexpertd', 4759), ('mediaplaybackd', 2876), ('corespeechd', 2859), ('powerexperienced', 2095), ('locationd', 1973), ('VoiceKernelHarness', 1851), ('bluetoothd', 1448), ('pkd', 1224), ('appleh16camerad', 1001), ('identityservicesd', 919), ('sharingd', 861), ('biomed', 777), ('WirelessRadioManagerd', 756)]
## top subsystems: [('com.apple.CommCenter', 4906), ('', 4165), ('com.apple.coreaudio', 4102), ('com.apple.duetexpertd.atx', 3099), ('com.apple.xpc', 2411), ('com.apple.corespeech', 2089), ('com.apple.powerexperienced', 2018), ('com.apple.coremedia', 2008), ('com.apple.PlugInKit', 1491), ('com.apple.runningboard', 1303), ('contextualengine', 1302), ('com.apple.bluetooth', 1265), ('com.apple.UserNotifications', 958), ('com.apple.IDS', 954), ('com.apple.dt.xctest', 926)]
## first timestamp: 2026-09-14 10:34:13.116790-0400 · last: 2026-09-14 10:34:44.995112-0400
## audio-related entries kept (window-s26-audio.jsonl): 10189 · per process: [('SpringBoard', 6625), ('VoiceKernelHarness', 1851), ('bluetoothd', 1448), ('audioaccessoryd', 249), ('audioclocksyncd', 16)]
## mediaserverd: NOT PRESENT IN THE S26-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S26-LEVEL WINDOW
## harness-process entries: 1851 · first: 2026-09-14 10:34:18.543939-0400 · last: 2026-09-14 10:34:41.629787-0400
## harness pids in window: 64101: 1851 entries 10:34:18.543…10:34:41.629
## sample pid = 64101 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 998486631, "start_begin": 998486802, "start_return": 998486957, "engine_configuration_changed": 998487103, "route_changed": 998486777, "first_input_callback": 998496345, "app_lifecycle": 998481936}
## log anchor session_activated: 2026-09-14 10:34:23.663364-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd90995c
## log anchor start_begin: 2026-09-14 10:34:23.835068-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x10519f0d0: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:34:24.134078-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x10519f0d0: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:34:23.799989-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd90995c posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.033 s · agreement between them: 1 ms
   residual session_activated: log − journal = -0 ms
   residual start_begin: log − journal = +0 ms
   residual engine_configuration_changed: log − journal = -2 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -10 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:34:18.968
   session_activated: wall ≈ 10:34:23.663
   start_begin: wall ≈ 10:34:23.834
   start_return: wall ≈ 10:34:23.989
   engine_configuration_changed: wall ≈ 10:34:24.135
   first_input_callback: wall ≈ 10:34:33.377
## entries inside engine.start() [10:34:23.834 … 10:34:23.989] (155 ms): 170 · per process: [["SpringBoard", 142], ["VoiceKernelHarness", 17], ["audioaccessoryd", 9], ["bluetoothd", 2]]
   10:34:23.835 +   0 ms VoiceKernelHarness com.apple.avfaudio AVAudioEngine.mm:1182  Engine@0x10519f0d0: start, was running 0
   10:34:23.835 +   0 ms bluetoothd com.apple.bluetooth GetDevices: flags 0x0 < >, total 28
   10:34:23.836 +   1 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x1052fcc00] Created node rio-outclient with nodeID 3 - reporting period = 10.000000
   10:34:23.836 +   1 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x1052fcc00] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:34:23.836 +   1 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x1092072e8] AudioConverterNew wasn't needed since incoming an
   10:34:23.836 +   1 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x109207128] AudioConverterNew wasn't needed since incoming an
   10:34:23.836 +   1 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x1052fcc00] initialized with error = 0
   10:34:23.836 +   1 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x10993de40)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:34:23.836 +   2 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xec0b
   10:34:23.836 +   2 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262557700.
   10:34:23.836 +   2 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:34:23.836 +   2 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:34:23.839 +   4 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x78872daa0
   10:34:23.839 +   4 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:34:23.839 +   4 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:34:23.839 +   5 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:34:23.839 +   5 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:34:23.839 +   5 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:34:23.839 +   5 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:34:23.839 +   5 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:34:23.839 +   5 ms SpringBoard  observedProcessStatesDidChange
   10:34:23.840 +   5 ms SpringBoard com.apple.runningboard Received state update for 64101 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:34:23.841 +   7 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:34:23.841 +   7 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:34:23.841 +   7 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:34:23.841 +   7 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:34:23.841 +   7 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:34:23.841 +   7 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:34:23.841 +   7 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:34:23.841 +   7 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:34:23.841 +   7 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:34:23.841 +   7 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:34:23.841 +   7 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:34:23.841 +   7 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:34:23.841 +   7 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:34:23.841 +   7 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:34:23.842 +   8 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:34:23.842 +   8 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:34:23.843 +   9 ms VoiceKernelHarness  observedProcessStatesDidChange
   10:34:23.843 +   9 ms VoiceKernelHarness com.apple.runningboard Received state update for 64101 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, unknown-NotVis
   10:34:23.846 +  11 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:34:23.846 +  11 ms audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:34:23.846 +  11 ms audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:34:23.846 +  12 ms audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:34:23.846 +  12 ms audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:34:23.846 +  12 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:34:23.846 +  12 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:34:23.846 +  12 ms audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:34:23.846 +  12 ms audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 11, current score is 7 (Max)
   10:34:23.852 +  18 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Active camera/microphone activity changed:
{(
    <SBSensorActivityAttribution: 0x798ad3210; displ
   10:34:23.852 +  18 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Turning on...
   10:34:23.852 +  18 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Registering SystemAperture element
   10:34:23.852 +  18 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element dwell time satisfied changed: NO; oldValue: YES
   10:34:23.852 +  18 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element MOT changed: NO; oldValue: YES
   10:34:23.852 +  18 ms SpringBoard com.apple.SystemAperture Asked to register element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SBRecordingIndica
   10:34:23.852 +  18 ms SpringBoard com.apple.SystemAperture Attempt to uniquely identify element that already has a unique identifier – ignoring: element: <SBRecordingIndicatorSyst
   10:34:23.852 +  18 ms SpringBoard com.apple.SystemAperture Created assertion (<SAUIElementAssertion: 0x787de4840>) for element: <SBRecordingIndicatorSystemApertureElement: 0x789ed
   10:34:23.852 +  18 ms SpringBoard com.apple.SystemAperture Asked to add view controller for element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SB
   10:34:23.852 +  18 ms SpringBoard com.apple.SpringBoard <BSCompoundAssertion:0x7898bb200> (SBSecureIndicatorBacklightCoordinator) acquire for reason:SBRecordingIndicatorViewCon
   10:34:23.852 +  18 ms SpringBoard com.apple.SpringBoard [Recording Indicator] updating live rendering assertion... hasSecureIndicator: YES, isActive: YES, windowScene: <private
## audio-DAEMON entries (audiomxd/audioaccessoryd/…; not the harness) from activation−150 ms to first callback+50 ms: 181
## audiomxd entries in that interval: 0 · per process: [["audioaccessoryd", 181]]
   10:34:23.622 audioaccessoryd com.apple.bluetooth Activity level changed 7 (Screen) -> 11 (User)
   10:34:23.624 audioaccessoryd com.apple.bluetooth Activity critical timer start: 5 seconds
   10:34:23.624 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 11, current score is 2 (Low)
   10:34:23.624 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: activity evaluation ALDS 1m 10s, AL 11
   10:34:23.624 audioaccessoryd  Sharing/SFDeviceDiscovery/deviceDiscoveryUpdate
   10:34:23.624 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: audio routing score has changed 2 (Low) -> 7 (Max)
   10:34:23.624 audioaccessoryd com.apple.bluetooth NearbyInfo set audio routing score: 7
   10:34:23.624 audioaccessoryd  Sharing/SFClient/setAudioRoutingScore
   10:34:23.625 audioaccessoryd com.apple.xpc [0x848a08c80] activating connection: mach=true listener=false peer=false name=com.apple.SharingServices
   10:34:23.627 audioaccessoryd com.apple.sharing Invalidating
   10:34:23.627 audioaccessoryd com.apple.xpc [0x848a08c80] invalidated because the current process cancelled the connection by calling xpc_connection_cancel()
   10:34:23.628 audioaccessoryd com.apple.bluetooth Airpods fw version is 6F25, pairing record CBDevice 6A0757F7-6D22-4F55-34A0-564749352560, BDA <private>, Nm <private> , 
   10:34:23.629 audioaccessoryd com.apple.bluetooth Airpods fw version is 8B41, pairing record CBDevice 1CB3204D-52D8-873E-0DF8-362B5DCA50FF, BDA <private>, Nm <private> , 
   10:34:23.629 audioaccessoryd com.apple.bluetooth Airpods fw version is 0.0.0, pairing record CBDevice 8B6EAEA4-BAD1-4F69-47C3-DD07E62A925F, BDA <private>, Nm <private> ,
   10:34:23.629 audioaccessoryd com.apple.bluetooth Airpods fw version is NULL, pairing record CBDevice 1FD45D20-ADAE-80B9-26B5-4F9BB9079938, BDA <private>, Nm <private> , 
   10:34:23.631 audioaccessoryd com.apple.bluetooth SendTipiScoreToWx: 90:9C:4A:E5:E1:6A score SRDisable srMode Unknown USB no byte 02000308 result BT_ERROR_NOT_CONNECTED '
   10:34:23.631 audioaccessoryd com.apple.bluetooth SendTipiScoreToWx: 6C:12:70:13:75:13 score SRDisable srMode Unknown USB no byte 02000308 result BT_ERROR_NOT_CONNECTED '
   10:34:23.674 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:34:23.692 audioaccessoryd com.apple.bluetooth Received Call State changed yes
   10:34:23.695 audioaccessoryd com.apple.AudioAccessory Mute Control: call state changed, isCallActive: yes, isCallHighPriority: no
   10:34:23.695 audioaccessoryd com.apple.AudioAccessory Mute Control: shouldSuppressBanner: no, shouldSuppressChime: no
   10:34:23.695 audioaccessoryd com.apple.SmartRouting onDemandEventStarted yes event Call
   10:34:23.695 audioaccessoryd com.apple.SmartRouting OnDemandEventTimer: Start. Will reset it in 8s
   10:34:23.695 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:34:23.695 audioaccessoryd com.apple.bluetooth anySmartRouting yes _powerMonitor.firstUnlocked yes _sleeping no, _powerMonitor.screenOn yes, _powerMonitor.screenState 
   10:34:23.695 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:34:23.703 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:34:23.708 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:34:23.708 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:34:23.778 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
