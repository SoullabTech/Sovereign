## window.json sha256 c8dea821dbcdb6be8542bd3b56890cf39af84b3c41bdd930c29857743707c55e · bytes 41486035
## decoded one JSON value ending at char 41485250 · residue 143 chars recorded verbatim (window-s23-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 35257
## event types: [('logEvent', 33192), ('activityCreateEvent', 2058), ('stateEvent', 7)]
## top processes: [('duetexpertd', 4784), ('CommCenter', 4675), ('SpringBoard', 2499), ('locationd', 1243), ('VoiceKernelHarness', 1186), ('pkd', 1095), ('bluetoothd', 983), ('appleh16camerad', 972), ('powerexperienced', 841), ('sharingd', 764), ('SharingUIService', 657), ('testmanagerd', 631), ('mediaplaybackd', 596), ('mDNSResponder', 527), ('wifid', 520)]
## top subsystems: [('com.apple.CommCenter', 4214), ('com.apple.duetexpertd.atx', 3137), ('', 2687), ('com.apple.xpc', 1851), ('com.apple.PlugInKit', 1332), ('contextualengine', 1302), ('com.apple.coreaudio', 1036), ('com.apple.bluetooth', 967), ('com.apple.dt.xctest', 925), ('com.apple.network', 880), ('com.apple.runningboard', 874), ('com.apple.powerexperienced', 810), ('com.apple.ShareSheet', 636), ('com.apple.UIKit', 580), ('com.apple.SpringBoard', 570)]
## first timestamp: 2026-09-14 10:31:09.049848-0400 · last: 2026-09-14 10:31:40.962378-0400
## audio-related entries kept (window-s23-audio.jsonl): 4783 · per process: [('SpringBoard', 2499), ('VoiceKernelHarness', 1186), ('bluetoothd', 983), ('audioaccessoryd', 99), ('audioclocksyncd', 16)]
## mediaserverd: NOT PRESENT IN THE S23-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S23-LEVEL WINDOW
## harness-process entries: 1186 · first: 2026-09-14 10:31:14.565615-0400 · last: 2026-09-14 10:31:37.279544-0400
## harness pids in window: 64060: 1186 entries 10:31:14.565…10:31:37.279
## sample pid = 64060 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 998302608, "start_begin": 998302752, "start_return": 998302902, "engine_configuration_changed": 998302907, "route_changed": 998302719, "first_input_callback": 998302999, "app_lifecycle": 998297959}
## log anchor session_activated: 2026-09-14 10:31:19.640591-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd90994e
## log anchor start_begin: 2026-09-14 10:31:19.784434-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x105992f80: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:31:19.885344-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x105992f80: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:31:19.745891-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd90994e posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.033 s · agreement between them: 0 ms
   residual session_activated: log − journal = +0 ms
   residual start_begin: log − journal = -0 ms
   residual engine_configuration_changed: log − journal = -54 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -6 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:31:14.991
   session_activated: wall ≈ 10:31:19.640
   start_begin: wall ≈ 10:31:19.784
   start_return: wall ≈ 10:31:19.934
   engine_configuration_changed: wall ≈ 10:31:19.939
   first_input_callback: wall ≈ 10:31:20.031
## entries inside engine.start() [10:31:19.784 … 10:31:19.934] (150 ms): 171 · per process: [["SpringBoard", 142], ["VoiceKernelHarness", 18], ["audioaccessoryd", 10], ["bluetoothd", 1]]
   10:31:19.784 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x105af4c00] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:31:19.784 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x109a3d528] AudioConverterNew wasn't needed since incoming an
   10:31:19.784 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x109a3caa8] AudioConverterNew wasn't needed since incoming an
   10:31:19.784 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x105af4c00] initialized with error = 0
   10:31:19.784 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x109d69e40)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:31:19.784 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xbf07
   10:31:19.784 +   0 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262389764.
   10:31:19.784 +   0 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:31:19.784 +   0 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:31:19.785 +   1 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x78abc60a0
   10:31:19.785 +   1 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:31:19.785 +   1 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:31:19.786 +   2 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:31:19.786 +   2 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:31:19.786 +   2 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:31:19.786 +   2 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:31:19.786 +   2 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:31:19.786 +   2 ms SpringBoard  observedProcessStatesDidChange
   10:31:19.786 +   2 ms SpringBoard com.apple.runningboard Received state update for 64060 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:31:19.788 +   4 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:31:19.788 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:31:19.788 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:31:19.788 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:31:19.788 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:31:19.788 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:31:19.788 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:31:19.788 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:31:19.788 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:31:19.788 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:31:19.788 +   4 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:31:19.788 +   4 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:31:19.788 +   4 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:31:19.788 +   4 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:31:19.789 +   5 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:31:19.789 +   5 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:31:19.790 +   6 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when the main run loop is idle
   10:31:19.790 +   6 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier finished setting up run loop observer
   10:31:19.790 +   6 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier run loop observer fired
   10:31:19.790 +   6 ms VoiceKernelHarness com.apple.dt.xctest Sending main run loop idle reply
   10:31:19.791 +   7 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when animations are idle
   10:31:19.791 +   7 ms VoiceKernelHarness com.apple.dt.xctest Sending animations idle reply with error: (null)
   10:31:19.791 +   7 ms VoiceKernelHarness  observedProcessStatesDidChange
   10:31:19.792 +   8 ms VoiceKernelHarness com.apple.runningboard Received state update for 64060 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, unknown-NotVis
   10:31:19.798 +  14 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Active camera/microphone activity changed:
{(
    <SBSensorActivityAttribution: 0x7946b6d00; displ
   10:31:19.798 +  14 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Turning on...
   10:31:19.798 +  14 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Registering SystemAperture element
   10:31:19.798 +  14 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element dwell time satisfied changed: NO; oldValue: YES
   10:31:19.798 +  14 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element MOT changed: NO; oldValue: YES
   10:31:19.798 +  14 ms SpringBoard com.apple.SystemAperture Asked to register element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SBRecordingIndica
   10:31:19.798 +  14 ms SpringBoard com.apple.SystemAperture Attempt to uniquely identify element that already has a unique identifier – ignoring: element: <SBRecordingIndicatorSyst
   10:31:19.798 +  14 ms SpringBoard com.apple.SystemAperture Created assertion (<SAUIElementAssertion: 0x78778e100>) for element: <SBRecordingIndicatorSystemApertureElement: 0x789ed
   10:31:19.798 +  14 ms SpringBoard com.apple.SystemAperture Asked to add view controller for element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SB
   10:31:19.798 +  14 ms SpringBoard com.apple.SpringBoard <BSCompoundAssertion:0x7898bb200> (SBSecureIndicatorBacklightCoordinator) acquire for reason:SBRecordingIndicatorViewCon
   10:31:19.798 +  14 ms SpringBoard com.apple.SpringBoard [Recording Indicator] updating live rendering assertion... hasSecureIndicator: YES, isActive: YES, windowScene: <private
   10:31:19.798 +  14 ms SpringBoard com.apple.BacklightServices 0x78b2ac7e0 will acquire assertion:<BLSAssertion: 0x7989b7f70; state: requestAcquire; requested: 37567747996461 approx:1
   10:31:19.800 +  16 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:31:19.800 +  16 ms audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:31:19.800 +  16 ms audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:31:19.800 +  16 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:31:19.800 +  16 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
## audio-DAEMON entries (audiomxd/audioaccessoryd/…; not the harness) from activation−150 ms to first callback+50 ms: 26
## audiomxd entries in that interval: 0 · per process: [["audioaccessoryd", 26]]
   10:31:19.647 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:31:19.664 audioaccessoryd com.apple.bluetooth Received Call State changed yes
   10:31:19.664 audioaccessoryd com.apple.SmartRouting onDemandEventStarted yes event Call
   10:31:19.664 audioaccessoryd com.apple.SmartRouting OnDemandEventTimer: Start. Will reset it in 8s
   10:31:19.664 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:31:19.665 audioaccessoryd com.apple.AudioAccessory Mute Control: call state changed, isCallActive: yes, isCallHighPriority: no
   10:31:19.665 audioaccessoryd com.apple.AudioAccessory Mute Control: shouldSuppressBanner: no, shouldSuppressChime: no
   10:31:19.684 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:31:19.686 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:31:19.686 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:31:19.720 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:31:19.758 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:31:19.766 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:31:19.771 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:31:19.771 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:31:19.782 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:31:19.800 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:31:19.800 audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:31:19.800 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:31:19.800 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:31:19.800 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:31:19.800 audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:31:19.800 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:31:19.801 audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:31:19.801 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 7, current score is 2 (Low)
   10:31:19.801 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: activity evaluation ALDS 26s, AL 7
