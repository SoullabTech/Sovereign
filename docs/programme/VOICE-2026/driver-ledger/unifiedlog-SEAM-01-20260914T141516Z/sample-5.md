## window.json sha256 2bfd00a8e79fe835c9b1ceb50c756dd71ac9955e67ab957a9d949f11cb2727c8 · bytes 53585628
## decoded one JSON value ending at char 53584853 · residue 143 chars recorded verbatim (window-s5-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 45404
## event types: [('logEvent', 43243), ('activityCreateEvent', 2146), ('stateEvent', 15)]
## top processes: [('CommCenter', 7965), ('SpringBoard', 3424), ('mediaplaybackd', 2540), ('corespeechd', 2529), ('locationd', 2067), ('VoiceKernelHarness', 1752), ('powerexperienced', 1634), ('pkd', 1095), ('bluetoothd', 983), ('sharingd', 855), ('WirelessRadioManagerd', 836), ('wifid', 740), ('cameracaptured', 705), ('SharingUIService', 657), ('testmanagerd', 651)]
## top subsystems: [('com.apple.CommCenter', 7063), ('com.apple.coreaudio', 3586), ('', 2830), ('com.apple.corespeech', 1854), ('com.apple.coremedia', 1773), ('com.apple.xpc', 1673), ('com.apple.powerexperienced', 1574), ('com.apple.PlugInKit', 1331), ('com.apple.IDS', 1216), ('com.apple.dt.xctest', 923), ('com.apple.PersistentConnection', 917), ('com.apple.runningboard', 834), ('com.apple.bluetooth', 799), ('com.apple.network', 775), ('com.apple.SpringBoard', 674)]
## first timestamp: 2026-09-14 10:18:00.022711-0400 · last: 2026-09-14 10:18:31.960294-0400
## audio-related entries kept (window-s5-audio.jsonl): 6368 · per process: [('SpringBoard', 3424), ('VoiceKernelHarness', 1752), ('bluetoothd', 983), ('audioaccessoryd', 193), ('audioclocksyncd', 16)]
## mediaserverd: NOT PRESENT IN THE S5-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S5-LEVEL WINDOW
## harness-process entries: 1752 · first: 2026-09-14 10:18:05.524216-0400 · last: 2026-09-14 10:18:28.241581-0400
## harness pids in window: 63979: 1752 entries 10:18:05.524…10:18:28.241
## sample pid = 63979 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 997513531, "start_begin": 997513664, "start_return": 997513812, "engine_configuration_changed": 997513823, "route_changed": 997513634, "first_input_callback": 997525869, "app_lifecycle": 997508924}
## log anchor session_activated: 2026-09-14 10:18:10.563418-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd909906
## log anchor start_begin: 2026-09-14 10:18:10.696682-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x1071b6fb0: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:18:10.803102-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x1071b6fb0: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:18:10.665539-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909906 posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.033 s · agreement between them: 0 ms
   residual session_activated: log − journal = -0 ms
   residual start_begin: log − journal = +0 ms
   residual engine_configuration_changed: log − journal = -52 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -1 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:18:05.956
   session_activated: wall ≈ 10:18:10.563
   start_begin: wall ≈ 10:18:10.696
   start_return: wall ≈ 10:18:10.844
   engine_configuration_changed: wall ≈ 10:18:10.855
   first_input_callback: wall ≈ 10:18:22.901
## entries inside engine.start() [10:18:10.696 … 10:18:10.844] (148 ms): 231 · per process: [["SpringBoard", 142], ["bluetoothd", 59], ["VoiceKernelHarness", 20], ["audioaccessoryd", 10]]
   10:18:10.696 +   0 ms VoiceKernelHarness com.apple.avfaudio AVAudioEngine.mm:1182  Engine@0x1071b6fb0: start, was running 0
   10:18:10.697 +   1 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x10b6b0f00] Created node rio-outclient with nodeID 3 - reporting period = 10.000000
   10:18:10.697 +   1 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x10b6b0f00] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:18:10.697 +   1 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10b63eda8] AudioConverterNew wasn't needed since incoming an
   10:18:10.697 +   1 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10b63ebe8] AudioConverterNew wasn't needed since incoming an
   10:18:10.697 +   1 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x10b6b0f00] initialized with error = 0
   10:18:10.697 +   1 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x10b93de40)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:18:10.697 +   1 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xc403
   10:18:10.697 +   1 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262057988.
   10:18:10.697 +   1 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:18:10.697 +   1 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:18:10.697 +   1 ms bluetoothd com.apple.bluetooth GetDevices: flags 0x0 < >, total 28
   10:18:10.698 +   2 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x788b4afa0
   10:18:10.698 +   2 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:18:10.698 +   2 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:18:10.698 +   2 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:18:10.698 +   2 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:18:10.698 +   2 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:18:10.698 +   2 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:18:10.698 +   2 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:18:10.699 +   3 ms SpringBoard  observedProcessStatesDidChange
   10:18:10.699 +   3 ms SpringBoard com.apple.runningboard Received state update for 63979 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:18:10.700 +   4 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:18:10.700 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:18:10.700 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:18:10.700 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:18:10.700 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:18:10.700 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:18:10.700 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:18:10.700 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:18:10.700 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:18:10.700 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:18:10.700 +   4 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:18:10.700 +   4 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:18:10.700 +   4 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:18:10.701 +   5 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:18:10.701 +   5 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:18:10.701 +   5 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:18:10.713 +  17 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Active camera/microphone activity changed:
{(
    <SBSensorActivityAttribution: 0x798b2d680; displ
   10:18:10.713 +  17 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Turning on...
   10:18:10.713 +  17 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Registering SystemAperture element
   10:18:10.713 +  17 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element dwell time satisfied changed: NO; oldValue: YES
   10:18:10.713 +  17 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element MOT changed: NO; oldValue: YES
   10:18:10.713 +  17 ms SpringBoard com.apple.SystemAperture Asked to register element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SBRecordingIndica
   10:18:10.713 +  17 ms SpringBoard com.apple.SystemAperture Attempt to uniquely identify element that already has a unique identifier – ignoring: element: <SBRecordingIndicatorSyst
   10:18:10.713 +  17 ms SpringBoard com.apple.SystemAperture Created assertion (<SAUIElementAssertion: 0x78967cc80>) for element: <SBRecordingIndicatorSystemApertureElement: 0x789ed
   10:18:10.714 +  17 ms SpringBoard com.apple.SystemAperture Asked to add view controller for element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SB
   10:18:10.714 +  18 ms SpringBoard com.apple.SpringBoard <BSCompoundAssertion:0x7898bb200> (SBSecureIndicatorBacklightCoordinator) acquire for reason:SBRecordingIndicatorViewCon
   10:18:10.714 +  18 ms SpringBoard com.apple.SpringBoard [Recording Indicator] updating live rendering assertion... hasSecureIndicator: YES, isActive: YES, windowScene: <private
   10:18:10.714 +  18 ms SpringBoard com.apple.BacklightServices 0x78b2ac7e0 will acquire assertion:<BLSAssertion: 0x797543e20; state: requestAcquire; requested: 37548809979956 approx:1
   10:18:10.716 +  20 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when the main run loop is idle
   10:18:10.716 +  20 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier finished setting up run loop observer
   10:18:10.716 +  20 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier run loop observer fired
   10:18:10.716 +  20 ms VoiceKernelHarness com.apple.dt.xctest Sending main run loop idle reply
   10:18:10.716 +  20 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when animations are idle
   10:18:10.716 +  20 ms VoiceKernelHarness com.apple.dt.xctest Sending animations idle reply with error: (null)
   10:18:10.726 +  30 ms SpringBoard com.apple.UIKit sceneOfRecord: sceneID: SuperHighLevelSystemAperture  persistentID: SuperHighLevelSystemAperture
   10:18:10.726 +  30 ms SpringBoard com.apple.PaperBoardUI [lock] Poster last extant update changed 3805
   10:18:10.726 +  30 ms SpringBoard com.apple.PaperBoardUI [home] Poster last extant update changed 3805
   10:18:10.726 +  30 ms VoiceKernelHarness  observedProcessStatesDidChange
## audio-DAEMON entries (audiomxd/audioaccessoryd/…; not the harness) from activation−150 ms to first callback+50 ms: 193
## audiomxd entries in that interval: 0 · per process: [["audioaccessoryd", 177], ["audioclocksyncd", 16]]
   10:18:10.569 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:18:10.587 audioaccessoryd com.apple.bluetooth Received Call State changed yes
   10:18:10.587 audioaccessoryd com.apple.SmartRouting onDemandEventStarted yes event Call
   10:18:10.587 audioaccessoryd com.apple.SmartRouting OnDemandEventTimer: Start. Will reset it in 8s
   10:18:10.587 audioaccessoryd com.apple.AudioAccessory Mute Control: call state changed, isCallActive: yes, isCallHighPriority: no
   10:18:10.587 audioaccessoryd com.apple.AudioAccessory Mute Control: shouldSuppressBanner: no, shouldSuppressChime: no
   10:18:10.587 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:18:10.596 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:18:10.602 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:18:10.602 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:18:10.659 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:18:10.660 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:18:10.680 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:18:10.687 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:18:10.687 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:18:10.695 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:18:10.729 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:18:10.729 audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:18:10.729 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:18:10.729 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:18:10.729 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:18:10.729 audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:18:10.729 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:18:10.729 audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:18:10.729 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 11, current score is 6 (High)
   10:18:10.729 audioaccessoryd  Sharing/SFDeviceDiscovery/deviceDiscoveryUpdate
   10:18:10.869 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=Unknown isPlaying=100
   10:18:10.869 audioaccessoryd com.apple.bluetooth Updating local audio category 501 -> 100 app Unknown
   10:18:10.869 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 501 to 100
   10:18:10.869 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 100 for all discovered 3P devices
