## window.json sha256 945f886b68fc1fd9408253af2e8fc2e3f62882e793290d53f9fc6e785cd2453f · bytes 64258813
## decoded one JSON value ending at char 64257683 · residue 143 chars recorded verbatim (window-s25-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 53644
## event types: [('logEvent', 49889), ('activityCreateEvent', 3738), ('stateEvent', 17)]
## top processes: [('SpringBoard', 5895), ('CommCenter', 4609), ('duetexpertd', 3347), ('mediaplaybackd', 2266), ('locationd', 2184), ('corespeechd', 2032), ('VoiceKernelHarness', 1654), ('Gmail', 1342), ('powerexperienced', 1308), ('bluetoothd', 1244), ('wifid', 1147), ('pkd', 1108), ('com.apple.WebKit.Networking', 943), ('mDNSResponder', 923), ('sharingd', 842)]
## top subsystems: [('', 4477), ('com.apple.CommCenter', 4160), ('com.apple.coreaudio', 3048), ('com.apple.network', 2605), ('com.apple.xpc', 2509), ('com.apple.duetexpertd.atx', 2185), ('com.apple.runningboard', 1754), ('com.apple.coremedia', 1580), ('com.apple.corespeech', 1467), ('com.apple.PlugInKit', 1362), ('com.apple.UserNotifications', 1332), ('com.apple.powerexperienced', 1260), ('com.apple.bluetooth', 1115), ('com.apple.locationd.Core', 992), ('com.apple.dt.xctest', 990)]
## first timestamp: 2026-09-14 10:32:44.108240-0400 · last: 2026-09-14 10:33:16.979892-0400
## audio-related entries kept (window-s25-audio.jsonl): 9015 · per process: [('SpringBoard', 5895), ('VoiceKernelHarness', 1654), ('bluetoothd', 1244), ('audioaccessoryd', 222)]
## mediaserverd: NOT PRESENT IN THE S25-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S25-LEVEL WINDOW
## harness-process entries: 1654 · first: 2026-09-14 10:32:50.130377-0400 · last: 2026-09-14 10:33:12.902254-0400
## harness pids in window: 64073: 1654 entries 10:32:50.130…10:33:12.902
## sample pid = 64073 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 998398220, "start_begin": 998398362, "start_return": 998398511, "engine_configuration_changed": 998398524, "route_changed": 998398328, "first_input_callback": 998407752, "app_lifecycle": 998393517}
## log anchor session_activated: 2026-09-14 10:32:55.252123-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd909957
## log anchor start_begin: 2026-09-14 10:32:55.394891-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x105176f80: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:32:55.500922-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x105176f80: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:32:55.337358-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909957 posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.033 s · agreement between them: 1 ms
   residual session_activated: log − journal = -0 ms
   residual start_begin: log − journal = +0 ms
   residual engine_configuration_changed: log − journal = -56 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -23 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:32:50.549
   session_activated: wall ≈ 10:32:55.252
   start_begin: wall ≈ 10:32:55.394
   start_return: wall ≈ 10:32:55.543
   engine_configuration_changed: wall ≈ 10:32:55.556
   first_input_callback: wall ≈ 10:33:04.784
## entries inside engine.start() [10:32:55.394 … 10:32:55.543] (149 ms): 220 · per process: [["SpringBoard", 146], ["bluetoothd", 42], ["VoiceKernelHarness", 21], ["audioaccessoryd", 11]]
   10:32:55.394 +   0 ms audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:32:55.394 +   0 ms VoiceKernelHarness com.apple.avfaudio AVAudioEngine.mm:1182  Engine@0x105176f80: start, was running 0
   10:32:55.394 +   0 ms bluetoothd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd90900c posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:32:55.395 +   1 ms VoiceKernelHarness com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909957 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:32:55.395 +   1 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x109578000] Created node rio-outclient with nodeID 3 - reporting period = 10.000000
   10:32:55.395 +   1 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x109578000] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:32:55.395 +   1 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x1092358a8] AudioConverterNew wasn't needed since incoming an
   10:32:55.395 +   1 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x1092348e8] AudioConverterNew wasn't needed since incoming an
   10:32:55.395 +   1 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x109578000] initialized with error = 0
   10:32:55.395 +   1 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x10940e840)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:32:55.395 +   1 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xbf03
   10:32:55.395 +   1 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262443012.
   10:32:55.395 +   1 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:32:55.395 +   1 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:32:55.397 +   3 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x7889f3560
   10:32:55.397 +   3 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:32:55.397 +   3 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:32:55.397 +   3 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:32:55.397 +   3 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:32:55.397 +   3 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:32:55.397 +   3 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:32:55.397 +   3 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:32:55.399 +   5 ms SpringBoard  observedProcessStatesDidChange
   10:32:55.399 +   5 ms SpringBoard com.apple.runningboard Received state update for 64073 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:32:55.400 +   6 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:32:55.400 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:32:55.400 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:32:55.400 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:32:55.400 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:32:55.400 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:32:55.400 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:32:55.400 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:32:55.400 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:32:55.400 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:32:55.400 +   6 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:32:55.400 +   6 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:32:55.400 +   6 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:32:55.400 +   6 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:32:55.401 +   7 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:32:55.401 +   7 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:32:55.403 +   9 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Active camera/microphone activity changed:
{(
    <SBSensorActivityAttribution: 0x78b8fd230; displ
   10:32:55.403 +   9 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Turning on...
   10:32:55.403 +   9 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Registering SystemAperture element
   10:32:55.403 +   9 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element dwell time satisfied changed: NO; oldValue: YES
   10:32:55.403 +   9 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element MOT changed: NO; oldValue: YES
   10:32:55.403 +   9 ms SpringBoard com.apple.SystemAperture Asked to register element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SBRecordingIndica
   10:32:55.403 +   9 ms SpringBoard com.apple.SystemAperture Attempt to uniquely identify element that already has a unique identifier – ignoring: element: <SBRecordingIndicatorSyst
   10:32:55.403 +   9 ms SpringBoard com.apple.SystemAperture Created assertion (<SAUIElementAssertion: 0x788ed1600>) for element: <SBRecordingIndicatorSystemApertureElement: 0x789ed
   10:32:55.403 +   9 ms SpringBoard com.apple.SystemAperture Asked to add view controller for element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SB
   10:32:55.403 +   9 ms SpringBoard com.apple.SpringBoard <BSCompoundAssertion:0x7898bb200> (SBSecureIndicatorBacklightCoordinator) acquire for reason:SBRecordingIndicatorViewCon
   10:32:55.403 +   9 ms SpringBoard com.apple.SpringBoard [Recording Indicator] updating live rendering assertion... hasSecureIndicator: YES, isActive: YES, windowScene: <private
   10:32:55.403 +   9 ms SpringBoard com.apple.BacklightServices 0x78b2ac7e0 will acquire assertion:<BLSAssertion: 0x797273aa0; state: requestAcquire; requested: 37570042515424 approx:1
   10:32:55.404 +  10 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when the main run loop is idle
   10:32:55.404 +  10 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier run loop observer fired
   10:32:55.404 +  10 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier finished setting up run loop observer
   10:32:55.404 +  10 ms VoiceKernelHarness com.apple.dt.xctest Sending main run loop idle reply
   10:32:55.404 +  10 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when animations are idle
   10:32:55.404 +  10 ms VoiceKernelHarness com.apple.dt.xctest Sending animations idle reply with error: (null)
   10:32:55.405 +  11 ms SpringBoard com.apple.UIKit sceneOfRecord: sceneID: SuperHighLevelSystemAperture  persistentID: SuperHighLevelSystemAperture
   10:32:55.406 +  12 ms SpringBoard com.apple.PaperBoardUI [lock] Poster last extant update changed 4013
## audio-DAEMON entries (audiomxd/audioaccessoryd/…; not the harness) from activation−150 ms to first callback+50 ms: 188
## audiomxd entries in that interval: 0 · per process: [["audioaccessoryd", 188]]
   10:32:55.258 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:32:55.277 audioaccessoryd com.apple.bluetooth Received Call State changed yes
   10:32:55.277 audioaccessoryd com.apple.SmartRouting onDemandEventStarted yes event Call
   10:32:55.277 audioaccessoryd com.apple.SmartRouting OnDemandEventTimer: Start. Will reset it in 8s
   10:32:55.277 audioaccessoryd com.apple.AudioAccessory Mute Control: call state changed, isCallActive: yes, isCallHighPriority: no
   10:32:55.277 audioaccessoryd com.apple.AudioAccessory Mute Control: shouldSuppressBanner: no, shouldSuppressChime: no
   10:32:55.277 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:32:55.296 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:32:55.297 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:32:55.297 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:32:55.336 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:32:55.359 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:32:55.376 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:32:55.383 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:32:55.383 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:32:55.394 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:32:55.408 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:32:55.408 audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:32:55.408 audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:32:55.408 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:32:55.408 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:32:55.408 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:32:55.408 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:32:55.409 audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:32:55.409 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 7, current score is 2 (Low)
   10:32:55.409 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: activity evaluation ALDS 26s, AL 7
   10:32:55.554 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=Unknown isPlaying=100
   10:32:55.554 audioaccessoryd com.apple.bluetooth Updating local audio category 501 -> 100 app Unknown
   10:32:55.554 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 501 to 100
   10:32:55.554 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 100 for all discovered 3P devices
