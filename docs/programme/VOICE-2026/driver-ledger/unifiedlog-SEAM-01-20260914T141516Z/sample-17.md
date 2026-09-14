## window.json sha256 f6ed5a6458a0f6c2392f12576f7a9470f4bd344a5382c14d876423e1d147bc6b · bytes 45047889
## decoded one JSON value ending at char 45046683 · residue 143 chars recorded verbatim (window-s17-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 38164
## event types: [('logEvent', 35683), ('activityCreateEvent', 2470), ('stateEvent', 11)]
## top processes: [('CommCenter', 4233), ('duetexpertd', 3965), ('SpringBoard', 2678), ('VoiceKernelHarness', 1187), ('pkd', 1101), ('appleh16camerad', 1062), ('powerexperienced', 1030), ('bluetoothd', 943), ('locationd', 823), ('sharingd', 741), ('mediaplaybackd', 723), ('SharingUIService', 657), ('mDNSResponder', 634), ('testmanagerd', 631), ('wifid', 560)]
## top subsystems: [('com.apple.CommCenter', 4002), ('', 3276), ('com.apple.duetexpertd.atx', 2436), ('com.apple.xpc', 2310), ('com.apple.network', 1549), ('com.apple.PlugInKit', 1339), ('com.apple.coreaudio', 1227), ('com.apple.powerexperienced', 992), ('com.apple.bluetooth', 927), ('com.apple.dt.xctest', 925), ('com.apple.runningboard', 747), ('com.apple.xpc.activity', 725), ('com.apple.ShareSheet', 636), ('com.apple.isp', 620), ('com.apple.SpringBoard', 593)]
## first timestamp: 2026-09-14 10:26:33.063240-0400 · last: 2026-09-14 10:27:05.993029-0400
## audio-related entries kept (window-s17-audio.jsonl): 4913 · per process: [('SpringBoard', 2678), ('VoiceKernelHarness', 1187), ('bluetoothd', 943), ('audioaccessoryd', 105)]
## mediaserverd: NOT PRESENT IN THE S17-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S17-LEVEL WINDOW
## harness-process entries: 1187 · first: 2026-09-14 10:26:39.314606-0400 · last: 2026-09-14 10:27:02.079087-0400
## harness pids in window: 64037: 1187 entries 10:26:39.314…10:27:02.079
## sample pid = 64037 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 998027396, "start_begin": 998027564, "start_return": 998027715, "engine_configuration_changed": 998027721, "route_changed": 998027528, "first_input_callback": 998027813, "app_lifecycle": 998022716}
## log anchor session_activated: 2026-09-14 10:26:44.428227-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd909936
## log anchor start_begin: 2026-09-14 10:26:44.596091-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x109dbb0a0: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:26:44.701723-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x109dbb0a0: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:26:44.535885-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909936 posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.032 s · agreement between them: 0 ms
   residual session_activated: log − journal = +0 ms
   residual start_begin: log − journal = -0 ms
   residual engine_configuration_changed: log − journal = -51 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -24 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:26:39.748
   session_activated: wall ≈ 10:26:44.428
   start_begin: wall ≈ 10:26:44.596
   start_return: wall ≈ 10:26:44.747
   engine_configuration_changed: wall ≈ 10:26:44.753
   first_input_callback: wall ≈ 10:26:44.845
## entries inside engine.start() [10:26:44.596 … 10:26:44.747] (151 ms): 169 · per process: [["SpringBoard", 142], ["VoiceKernelHarness", 14], ["audioaccessoryd", 11], ["bluetoothd", 2]]
   10:26:44.596 +   0 ms VoiceKernelHarness com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909936 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:26:44.596 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x1101c3300] Created node rio-outclient with nodeID 3 - reporting period = 10.000000
   10:26:44.596 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x1101c3300] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:26:44.596 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x11026a6a8] AudioConverterNew wasn't needed since incoming an
   10:26:44.596 +   1 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x1102698a8] AudioConverterNew wasn't needed since incoming an
   10:26:44.596 +   1 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x1101c3300] initialized with error = 0
   10:26:44.596 +   1 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x110535e40)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:26:44.597 +   1 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xc633
   10:26:44.597 +   1 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262295556.
   10:26:44.597 +   1 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:26:44.597 +   1 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:26:44.598 +   3 ms bluetoothd com.apple.bluetooth GetDevices: flags 0x0 < >, total 28
   10:26:44.599 +   3 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x788872220
   10:26:44.599 +   3 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:26:44.599 +   3 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:26:44.599 +   3 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:26:44.599 +   3 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:26:44.599 +   3 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:26:44.599 +   3 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:26:44.599 +   3 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:26:44.599 +   4 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:26:44.599 +   4 ms audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:26:44.599 +   4 ms audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:26:44.599 +   4 ms audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:26:44.599 +   4 ms audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:26:44.599 +   4 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:26:44.599 +   4 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:26:44.600 +   4 ms audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:26:44.600 +   4 ms audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 7, current score is 2 (Low)
   10:26:44.600 +   4 ms audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: activity evaluation ALDS 25s, AL 7
   10:26:44.600 +   4 ms audioaccessoryd com.apple.bluetooth Check activity in 480s
   10:26:44.600 +   5 ms SpringBoard  observedProcessStatesDidChange
   10:26:44.600 +   5 ms SpringBoard com.apple.runningboard Received state update for 64037 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:26:44.601 +   5 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:26:44.601 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:26:44.601 +   5 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:26:44.601 +   5 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:26:44.601 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:26:44.601 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:26:44.601 +   5 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:26:44.601 +   5 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:26:44.601 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:26:44.601 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:26:44.601 +   5 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:26:44.601 +   5 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:26:44.601 +   5 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:26:44.601 +   6 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:26:44.602 +   6 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:26:44.602 +   6 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:26:44.603 +   8 ms VoiceKernelHarness  observedProcessStatesDidChange
   10:26:44.603 +   8 ms VoiceKernelHarness com.apple.runningboard Received state update for 64037 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, unknown-NotVis
   10:26:44.604 +   8 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Active camera/microphone activity changed:
{(
    <SBSensorActivityAttribution: 0x795543b10; displ
   10:26:44.604 +   8 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Turning on...
   10:26:44.604 +   8 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Registering SystemAperture element
   10:26:44.604 +   8 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element dwell time satisfied changed: NO; oldValue: YES
   10:26:44.604 +   8 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element MOT changed: NO; oldValue: YES
   10:26:44.604 +   8 ms SpringBoard com.apple.SystemAperture Asked to register element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SBRecordingIndica
   10:26:44.604 +   8 ms SpringBoard com.apple.SystemAperture Attempt to uniquely identify element that already has a unique identifier – ignoring: element: <SBRecordingIndicatorSyst
   10:26:44.604 +   8 ms SpringBoard com.apple.SystemAperture Created assertion (<SAUIElementAssertion: 0x787fcb480>) for element: <SBRecordingIndicatorSystemApertureElement: 0x789ed
   10:26:44.604 +   8 ms SpringBoard com.apple.SystemAperture Asked to add view controller for element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SB
## audio-DAEMON entries (audiomxd/audioaccessoryd/…; not the harness) from activation−150 ms to first callback+50 ms: 27
## audiomxd entries in that interval: 0 · per process: [["audioaccessoryd", 27]]
   10:26:44.434 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:26:44.446 audioaccessoryd com.apple.bluetooth Received Call State changed yes
   10:26:44.446 audioaccessoryd com.apple.SmartRouting onDemandEventStarted yes event Call
   10:26:44.446 audioaccessoryd com.apple.SmartRouting OnDemandEventTimer: Start. Will reset it in 8s
   10:26:44.446 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:26:44.446 audioaccessoryd com.apple.AudioAccessory Mute Control: call state changed, isCallActive: yes, isCallHighPriority: no
   10:26:44.446 audioaccessoryd com.apple.AudioAccessory Mute Control: shouldSuppressBanner: no, shouldSuppressChime: no
   10:26:44.459 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:26:44.467 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:26:44.476 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:26:44.476 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:26:44.580 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:26:44.580 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:26:44.580 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:26:44.591 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:26:44.595 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:26:44.599 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:26:44.599 audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:26:44.599 audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:26:44.599 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:26:44.599 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:26:44.599 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:26:44.599 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:26:44.600 audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:26:44.600 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 7, current score is 2 (Low)
   10:26:44.600 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: activity evaluation ALDS 25s, AL 7
   10:26:44.600 audioaccessoryd com.apple.bluetooth Check activity in 480s
