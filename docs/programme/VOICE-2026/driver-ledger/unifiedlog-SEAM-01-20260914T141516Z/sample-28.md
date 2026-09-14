## window.json sha256 c5f94736571e654eebb44869da7b5d16f14bc93c61ceb8ab93a954be722b4d1d · bytes 69246361
## decoded one JSON value ending at char 69244811 · residue 143 chars recorded verbatim (window-s28-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 58698
## event types: [('logEvent', 55267), ('activityCreateEvent', 3424), ('stateEvent', 7)]
## top processes: [('duetexpertd', 7926), ('SpringBoard', 7081), ('CommCenter', 4466), ('mediaplaybackd', 2627), ('corespeechd', 2495), ('powerexperienced', 1850), ('VoiceKernelHarness', 1738), ('pkd', 1610), ('bluetoothd', 1161), ('locationd', 1113), ('appleh16camerad', 1111), ('peopled', 880), ('sharingd', 836), ('tccd', 778), ('suggestd', 715)]
## top subsystems: [('com.apple.duetexpertd.atx', 5189), ('', 4312), ('com.apple.CommCenter', 4039), ('com.apple.coreaudio', 3758), ('com.apple.xpc', 3080), ('contextualengine', 2170), ('com.apple.PlugInKit', 1976), ('com.apple.coremedia', 1815), ('com.apple.corespeech', 1811), ('com.apple.UserNotifications', 1805), ('com.apple.powerexperienced', 1782), ('com.apple.runningboard', 1244), ('com.apple.BulletinBoard', 1200), ('com.apple.bluetooth', 983), ('com.apple.dt.xctest', 937)]
## first timestamp: 2026-09-14 10:35:49.000443-0400 · last: 2026-09-14 10:36:21.984145-0400
## audio-related entries kept (window-s28-audio.jsonl): 10234 · per process: [('SpringBoard', 7081), ('VoiceKernelHarness', 1738), ('bluetoothd', 1161), ('audioaccessoryd', 254)]
## mediaserverd: NOT PRESENT IN THE S28-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S28-LEVEL WINDOW
## harness-process entries: 1738 · first: 2026-09-14 10:35:55.071308-0400 · last: 2026-09-14 10:36:17.821488-0400
## harness pids in window: 64111: 1738 entries 10:35:55.071…10:36:17.821
## sample pid = 64111 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 998583123, "start_begin": 998583260, "start_return": 998583411, "engine_configuration_changed": 998583563, "route_changed": 998583127, "first_input_callback": 998597101, "app_lifecycle": 998578483}
## log anchor session_activated: 2026-09-14 10:36:00.155544-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd909964
## log anchor start_begin: 2026-09-14 10:36:00.292466-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x105d8f140: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:36:00.594379-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x105d8f140: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:36:00.158351-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909964 posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.033 s · agreement between them: 0 ms
   residual session_activated: log − journal = +0 ms
   residual start_begin: log − journal = -0 ms
   residual engine_configuration_changed: log − journal = -1 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -1 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:35:55.515
   session_activated: wall ≈ 10:36:00.155
   start_begin: wall ≈ 10:36:00.292
   start_return: wall ≈ 10:36:00.443
   engine_configuration_changed: wall ≈ 10:36:00.595
   first_input_callback: wall ≈ 10:36:14.133
## entries inside engine.start() [10:36:00.292 … 10:36:00.443] (151 ms): 174 · per process: [["SpringBoard", 144], ["VoiceKernelHarness", 18], ["audioaccessoryd", 11], ["bluetoothd", 1]]
   10:36:00.292 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x105f03c00] Created node rio-outclient with nodeID 3 - reporting period = 10.000000
   10:36:00.292 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x105f03c00] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:36:00.292 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x109e3abe8] AudioConverterNew wasn't needed since incoming an
   10:36:00.292 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x109e3a168] AudioConverterNew wasn't needed since incoming an
   10:36:00.292 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x105f03c00] initialized with error = 0
   10:36:00.292 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x10a171e40)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:36:00.292 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xbe03
   10:36:00.292 +   0 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262598660.
   10:36:00.292 +   0 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:36:00.293 +   1 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:36:00.293 +   1 ms SpringBoard com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd9095dd posting AVAudioSessionRouteChangeNotification. Reason: A
   10:36:00.294 +   2 ms audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:36:00.294 +   2 ms bluetoothd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd90900c posting AVAudioSessionRouteChangeNotification. Reason: A
   10:36:00.295 +   3 ms SpringBoard com.apple.siri -[SASBluetoothEndpointUtility _setEndpointTypeWithNotification:]_block_invoke Endpoint type is not found from AVSystemCo
   10:36:00.296 +   4 ms SpringBoard  observedProcessStatesDidChange
   10:36:00.296 +   4 ms SpringBoard com.apple.runningboard Received state update for 64111 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:36:00.297 +   5 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x788103360
   10:36:00.297 +   5 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:36:00.297 +   5 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:36:00.297 +   5 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:36:00.297 +   5 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:36:00.297 +   5 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:36:00.297 +   5 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:36:00.297 +   5 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:36:00.298 +   6 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:36:00.298 +   6 ms audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:36:00.298 +   6 ms audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:36:00.298 +   6 ms audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:36:00.298 +   6 ms audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:36:00.298 +   6 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:36:00.298 +   6 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:36:00.298 +   6 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:36:00.298 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:36:00.298 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:36:00.298 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:36:00.298 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:36:00.298 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:36:00.298 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:36:00.298 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:36:00.298 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:36:00.298 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:36:00.298 +   6 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:36:00.298 +   6 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:36:00.298 +   6 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:36:00.298 +   6 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:36:00.298 +   6 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:36:00.298 +   6 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:36:00.298 +   6 ms audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:36:00.298 +   6 ms audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 7, current score is 2 (Low)
   10:36:00.298 +   6 ms audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: activity evaluation ALDS 26s, AL 7
   10:36:00.300 +   8 ms VoiceKernelHarness  observedProcessStatesDidChange
   10:36:00.300 +   8 ms VoiceKernelHarness com.apple.runningboard Received state update for 64111 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, unknown-NotVis
   10:36:00.301 +   9 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Active camera/microphone activity changed:
{(
    <SBSensorActivityAttribution: 0x795a75320; displ
   10:36:00.301 +   9 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Turning on...
   10:36:00.301 +   9 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Registering SystemAperture element
   10:36:00.301 +   9 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element dwell time satisfied changed: NO; oldValue: YES
   10:36:00.301 +   9 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element MOT changed: NO; oldValue: YES
   10:36:00.301 +   9 ms SpringBoard com.apple.SystemAperture Asked to register element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SBRecordingIndica
   10:36:00.301 +   9 ms SpringBoard com.apple.SystemAperture Attempt to uniquely identify element that already has a unique identifier – ignoring: element: <SBRecordingIndicatorSyst
   10:36:00.301 +   9 ms SpringBoard com.apple.SystemAperture Created assertion (<SAUIElementAssertion: 0x787f9b6c0>) for element: <SBRecordingIndicatorSystemApertureElement: 0x789ed
## audio-DAEMON entries (audiomxd/audioaccessoryd/…; not the harness) from activation−150 ms to first callback+50 ms: 214
## audiomxd entries in that interval: 0 · per process: [["audioaccessoryd", 214]]
   10:36:00.162 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:36:00.182 audioaccessoryd com.apple.bluetooth Received Call State changed yes
   10:36:00.182 audioaccessoryd com.apple.SmartRouting onDemandEventStarted yes event Call
   10:36:00.182 audioaccessoryd com.apple.SmartRouting OnDemandEventTimer: Start. Will reset it in 8s
   10:36:00.183 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:36:00.184 audioaccessoryd com.apple.AudioAccessory Mute Control: call state changed, isCallActive: yes, isCallHighPriority: no
   10:36:00.184 audioaccessoryd com.apple.AudioAccessory Mute Control: shouldSuppressBanner: no, shouldSuppressChime: no
   10:36:00.200 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:36:00.200 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:36:00.200 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:36:00.258 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:36:00.273 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:36:00.278 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:36:00.278 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:36:00.294 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:36:00.298 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:36:00.298 audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:36:00.298 audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:36:00.298 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:36:00.298 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:36:00.298 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:36:00.298 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:36:00.298 audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:36:00.298 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 7, current score is 2 (Low)
   10:36:00.298 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: activity evaluation ALDS 26s, AL 7
   10:36:00.457 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=Unknown isPlaying=100
   10:36:00.457 audioaccessoryd com.apple.bluetooth Updating local audio category 501 -> 100 app Unknown
   10:36:00.457 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 501 to 100
   10:36:00.457 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 100 for all discovered 3P devices
   10:36:00.457 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
