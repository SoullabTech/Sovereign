## window.json sha256 55e3b3bb70cc7323a8d1de52365ce5e771a8f2c331c0e9f36a74ca8480779a74 · bytes 53017252
## decoded one JSON value ending at char 53016334 · residue 143 chars recorded verbatim (window-s29-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 44643
## event types: [('logEvent', 42075), ('activityCreateEvent', 2561), ('stateEvent', 7)]
## top processes: [('SpringBoard', 5842), ('CommCenter', 4453), ('mediaplaybackd', 2599), ('corespeechd', 2146), ('duetexpertd', 2115), ('VoiceKernelHarness', 1749), ('pkd', 1611), ('bluetoothd', 1294), ('suggestd', 974), ('powerexperienced', 932), ('locationd', 888), ('sharingd', 866), ('testmanagerd', 660), ('SharingUIService', 654), ('WirelessRadioManagerd', 647)]
## top subsystems: [('com.apple.CommCenter', 4042), ('com.apple.coreaudio', 3346), ('', 3190), ('com.apple.PlugInKit', 1975), ('com.apple.coremedia', 1809), ('com.apple.xpc', 1715), ('com.apple.corespeech', 1544), ('com.apple.duetexpertd.atx', 1455), ('com.apple.UserNotifications', 1304), ('com.apple.bluetooth', 1154), ('com.apple.runningboard', 958), ('com.apple.network', 936), ('com.apple.dt.xctest', 932), ('com.apple.powerexperienced', 898), ('com.apple.SpringBoard', 740)]
## first timestamp: 2026-09-14 10:36:38.314012-0400 · last: 2026-09-14 10:37:10.998608-0400
## audio-related entries kept (window-s29-audio.jsonl): 9132 · per process: [('SpringBoard', 5842), ('VoiceKernelHarness', 1749), ('bluetoothd', 1294), ('audioaccessoryd', 247)]
## mediaserverd: NOT PRESENT IN THE S29-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S29-LEVEL WINDOW
## harness-process entries: 1749 · first: 2026-09-14 10:36:44.195340-0400 · last: 2026-09-14 10:37:06.945617-0400
## harness pids in window: 64116: 1749 entries 10:36:44.195…10:37:06.945
## sample pid = 64116 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 998632227, "start_begin": 998632370, "start_return": 998632521, "engine_configuration_changed": 998632656, "route_changed": 998632335, "first_input_callback": 998639239, "app_lifecycle": 998627600}
## log anchor session_activated: 2026-09-14 10:36:49.259651-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd909968
## log anchor start_begin: 2026-09-14 10:36:49.402967-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x1161a3010: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:36:49.687620-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x1161a3010: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:36:49.365558-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909968 posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.033 s · agreement between them: 0 ms
   residual session_activated: log − journal = -0 ms
   residual start_begin: log − journal = +0 ms
   residual engine_configuration_changed: log − journal = -1 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -2 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:36:44.632
   session_activated: wall ≈ 10:36:49.259
   start_begin: wall ≈ 10:36:49.402
   start_return: wall ≈ 10:36:49.553
   engine_configuration_changed: wall ≈ 10:36:49.688
   first_input_callback: wall ≈ 10:36:56.271
## entries inside engine.start() [10:36:49.402 … 10:36:49.553] (151 ms): 174 · per process: [["SpringBoard", 143], ["VoiceKernelHarness", 19], ["audioaccessoryd", 10], ["bluetoothd", 2]]
   10:36:49.402 +   0 ms SpringBoard com.apple.Hearing Posting pickableAudioRoutesDidChange notification
   10:36:49.402 +   0 ms VoiceKernelHarness com.apple.avfaudio AVAudioEngine.mm:1182  Engine@0x1161a3010: start, was running 0
   10:36:49.403 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x1170ad500] Created node rio-outclient with nodeID 3 - reporting period = 10.000000
   10:36:49.403 +   1 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x1170ad500] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:36:49.403 +   1 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x1172598a8] AudioConverterNew wasn't needed since incoming an
   10:36:49.403 +   1 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x1172588e8] AudioConverterNew wasn't needed since incoming an
   10:36:49.403 +   1 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x1170ad500] initialized with error = 0
   10:36:49.403 +   1 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x117545e40)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:36:49.403 +   1 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xba07
   10:36:49.403 +   1 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262619140.
   10:36:49.403 +   1 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:36:49.403 +   1 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:36:49.403 +   1 ms bluetoothd com.apple.bluetooth GetDevices: flags 0x0 < >, total 28
   10:36:49.405 +   3 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x7887c2920
   10:36:49.405 +   3 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:36:49.405 +   3 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:36:49.406 +   3 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:36:49.406 +   3 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:36:49.406 +   3 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:36:49.406 +   3 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:36:49.406 +   3 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:36:49.406 +   4 ms SpringBoard  observedProcessStatesDidChange
   10:36:49.406 +   4 ms SpringBoard com.apple.runningboard Received state update for 64116 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:36:49.408 +   6 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:36:49.408 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:36:49.408 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:36:49.408 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:36:49.408 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:36:49.408 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:36:49.408 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:36:49.408 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:36:49.408 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:36:49.408 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:36:49.408 +   6 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:36:49.408 +   6 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:36:49.408 +   6 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:36:49.408 +   6 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:36:49.409 +   7 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:36:49.409 +   7 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:36:49.417 +  15 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when the main run loop is idle
   10:36:49.417 +  15 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier finished setting up run loop observer
   10:36:49.417 +  15 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier run loop observer fired
   10:36:49.417 +  15 ms VoiceKernelHarness com.apple.dt.xctest Sending main run loop idle reply
   10:36:49.419 +  17 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when animations are idle
   10:36:49.419 +  17 ms VoiceKernelHarness com.apple.dt.xctest Sending animations idle reply with error: (null)
   10:36:49.421 +  19 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Active camera/microphone activity changed:
{(
    <SBSensorActivityAttribution: 0x7960e4a50; displ
   10:36:49.421 +  19 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Turning on...
   10:36:49.421 +  19 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Registering SystemAperture element
   10:36:49.421 +  19 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element dwell time satisfied changed: NO; oldValue: YES
   10:36:49.421 +  19 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element MOT changed: NO; oldValue: YES
   10:36:49.421 +  19 ms SpringBoard com.apple.SystemAperture Asked to register element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SBRecordingIndica
   10:36:49.421 +  19 ms SpringBoard com.apple.SystemAperture Attempt to uniquely identify element that already has a unique identifier – ignoring: element: <SBRecordingIndicatorSyst
   10:36:49.421 +  19 ms SpringBoard com.apple.SystemAperture Created assertion (<SAUIElementAssertion: 0x787db0b40>) for element: <SBRecordingIndicatorSystemApertureElement: 0x789ed
   10:36:49.421 +  19 ms SpringBoard com.apple.SystemAperture Asked to add view controller for element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SB
   10:36:49.422 +  19 ms SpringBoard com.apple.SpringBoard <BSCompoundAssertion:0x7898bb200> (SBSecureIndicatorBacklightCoordinator) acquire for reason:SBRecordingIndicatorViewCon
   10:36:49.422 +  19 ms SpringBoard com.apple.SpringBoard [Recording Indicator] updating live rendering assertion... hasSecureIndicator: YES, isActive: YES, windowScene: <private
   10:36:49.422 +  20 ms SpringBoard com.apple.BacklightServices 0x78b2ac7e0 will acquire assertion:<BLSAssertion: 0x797146a00; state: requestAcquire; requested: 37575658967038 approx:1
   10:36:49.435 +  32 ms VoiceKernelHarness  observedProcessStatesDidChange
   10:36:49.435 +  32 ms SpringBoard com.apple.UIKit sceneOfRecord: sceneID: SuperHighLevelSystemAperture  persistentID: SuperHighLevelSystemAperture
   10:36:49.435 +  32 ms VoiceKernelHarness com.apple.runningboard Received state update for 64116 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, unknown-NotVis
## audio-DAEMON entries (audiomxd/audioaccessoryd/…; not the harness) from activation−150 ms to first callback+50 ms: 119
## audiomxd entries in that interval: 0 · per process: [["audioaccessoryd", 119]]
   10:36:49.265 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:36:49.284 audioaccessoryd com.apple.AudioAccessory Mute Control: call state changed, isCallActive: yes, isCallHighPriority: no
   10:36:49.284 audioaccessoryd com.apple.AudioAccessory Mute Control: shouldSuppressBanner: no, shouldSuppressChime: no
   10:36:49.285 audioaccessoryd com.apple.bluetooth Received Call State changed yes
   10:36:49.285 audioaccessoryd com.apple.SmartRouting onDemandEventStarted yes event Call
   10:36:49.285 audioaccessoryd com.apple.SmartRouting OnDemandEventTimer: Start. Will reset it in 8s
   10:36:49.285 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:36:49.293 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:36:49.298 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:36:49.299 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:36:49.337 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:36:49.371 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:36:49.375 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:36:49.386 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:36:49.391 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:36:49.391 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:36:49.435 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:36:49.435 audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:36:49.435 audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:36:49.436 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:36:49.436 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:36:49.436 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:36:49.436 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:36:49.436 audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:36:49.436 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 7, current score is 2 (Low)
   10:36:49.436 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: activity evaluation ALDS 31s, AL 7
   10:36:49.580 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=Unknown isPlaying=100
   10:36:49.580 audioaccessoryd com.apple.bluetooth Updating local audio category 501 -> 100 app Unknown
   10:36:49.580 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 501 to 100
   10:36:49.580 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 100 for all discovered 3P devices
