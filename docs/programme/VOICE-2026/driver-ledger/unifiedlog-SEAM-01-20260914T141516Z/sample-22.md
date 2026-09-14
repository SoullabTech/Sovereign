## window.json sha256 69c3f2364e14f6f807fe581e2e58e7cfa65d6ca9bae7f02fbd3b55598c62797f · bytes 44281864
## decoded one JSON value ending at char 44281024 · residue 143 chars recorded verbatim (window-s22-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 37312
## event types: [('logEvent', 35181), ('activityCreateEvent', 2124), ('stateEvent', 7)]
## top processes: [('CommCenter', 4334), ('SpringBoard', 3535), ('mediaplaybackd', 1925), ('duetexpertd', 1901), ('corespeechd', 1660), ('VoiceKernelHarness', 1558), ('bluetoothd', 1179), ('pkd', 1095), ('locationd', 956), ('powerexperienced', 847), ('sharingd', 826), ('wifid', 736), ('SharingUIService', 665), ('testmanagerd', 644), ('WidgetRenderer_Default', 599)]
## top subsystems: [('com.apple.CommCenter', 4003), ('', 2655), ('com.apple.coreaudio', 2521), ('com.apple.xpc', 1604), ('com.apple.coremedia', 1345), ('com.apple.PlugInKit', 1332), ('com.apple.duetexpertd.atx', 1273), ('com.apple.corespeech', 1195), ('com.apple.bluetooth', 1073), ('com.apple.dt.xctest', 923), ('com.apple.network', 908), ('com.apple.runningboard', 896), ('com.apple.chrono', 874), ('com.apple.powerexperienced', 816), ('com.apple.SpringBoard', 807)]
## first timestamp: 2026-09-14 10:30:22.002840-0400 · last: 2026-09-14 10:30:54.997969-0400
## audio-related entries kept (window-s22-audio.jsonl): 6482 · per process: [('SpringBoard', 3535), ('VoiceKernelHarness', 1558), ('bluetoothd', 1179), ('audioaccessoryd', 194), ('audioclocksyncd', 16)]
## mediaserverd: NOT PRESENT IN THE S22-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S22-LEVEL WINDOW
## harness-process entries: 1558 · first: 2026-09-14 10:30:27.619207-0400 · last: 2026-09-14 10:30:50.481590-0400
## harness pids in window: 64056: 1558 entries 10:30:27.619…10:30:50.481
## sample pid = 64056 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 998255668, "start_begin": 998255819, "start_return": 998255967, "engine_configuration_changed": 998255997, "route_changed": 998255786, "first_input_callback": 998262392, "app_lifecycle": 998251025}
## log anchor session_activated: 2026-09-14 10:30:32.700701-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd90994a
## log anchor start_begin: 2026-09-14 10:30:32.852001-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x105db6fa0: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:30:32.955440-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x105db6fa0: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:30:32.815848-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd90994a posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.033 s · agreement between them: 0 ms
   residual session_activated: log − journal = -0 ms
   residual start_begin: log − journal = +0 ms
   residual engine_configuration_changed: log − journal = -74 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -3 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:30:28.057
   session_activated: wall ≈ 10:30:32.700
   start_begin: wall ≈ 10:30:32.851
   start_return: wall ≈ 10:30:32.999
   engine_configuration_changed: wall ≈ 10:30:33.029
   first_input_callback: wall ≈ 10:30:39.424
## entries inside engine.start() [10:30:32.851 … 10:30:32.999] (148 ms): 170 · per process: [["SpringBoard", 143], ["VoiceKernelHarness", 14], ["audioaccessoryd", 10], ["bluetoothd", 3]]
   10:30:32.852 +   0 ms VoiceKernelHarness com.apple.avfaudio AVAudioEngine.mm:1182  Engine@0x105db6fa0: start, was running 0
   10:30:32.852 +   0 ms SpringBoard com.apple.Hearing Posting pickableAudioRoutesDidChange notification
   10:30:32.852 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x10a2bcf00] Created node rio-outclient with nodeID 3 - reporting period = 10.000000
   10:30:32.852 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x10a2bcf00] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:30:32.852 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10a246328] AudioConverterNew wasn't needed since incoming an
   10:30:32.852 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10a246168] AudioConverterNew wasn't needed since incoming an
   10:30:32.852 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x10a2bcf00] initialized with error = 0
   10:30:32.852 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x10a549e40)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:30:32.852 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xe803
   10:30:32.852 +   0 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262373380.
   10:30:32.852 +   0 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:30:32.852 +   1 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:30:32.852 +   1 ms bluetoothd com.apple.bluetooth GetDevices: flags 0x0 < >, total 28
   10:30:32.853 +   1 ms bluetoothd com.apple.bluetooth GetDevices: flags 0x0 < >, total 28
   10:30:32.853 +   2 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x7889f1460
   10:30:32.853 +   2 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:30:32.853 +   2 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:30:32.853 +   2 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:30:32.853 +   2 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:30:32.853 +   2 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:30:32.853 +   2 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:30:32.853 +   2 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:30:32.854 +   2 ms SpringBoard  observedProcessStatesDidChange
   10:30:32.854 +   3 ms SpringBoard com.apple.runningboard Received state update for 64056 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:30:32.854 +   3 ms VoiceKernelHarness  observedProcessStatesDidChange
   10:30:32.855 +   3 ms VoiceKernelHarness com.apple.runningboard Received state update for 64056 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, unknown-NotVis
   10:30:32.855 +   4 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:30:32.855 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:30:32.855 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:30:32.855 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:30:32.855 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:30:32.855 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:30:32.855 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:30:32.855 +   4 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:30:32.855 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:30:32.855 +   4 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:30:32.855 +   4 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:30:32.855 +   4 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:30:32.855 +   4 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:30:32.856 +   4 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:30:32.856 +   5 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:30:32.856 +   5 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:30:32.859 +   8 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:30:32.859 +   8 ms audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:30:32.859 +   8 ms audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:30:32.859 +   8 ms audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:30:32.859 +   8 ms audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:30:32.859 +   8 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:30:32.859 +   8 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:30:32.861 +   9 ms audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:30:32.861 +   9 ms audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 7, current score is 2 (Low)
   10:30:32.862 +  10 ms audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: activity evaluation ALDS 29s, AL 7
   10:30:32.865 +  14 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Active camera/microphone activity changed:
{(
    <SBSensorActivityAttribution: 0x78b2e3870; displ
   10:30:32.866 +  14 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Turning on...
   10:30:32.866 +  14 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Registering SystemAperture element
   10:30:32.866 +  14 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element dwell time satisfied changed: NO; oldValue: YES
   10:30:32.866 +  14 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element MOT changed: NO; oldValue: YES
   10:30:32.866 +  14 ms SpringBoard com.apple.SystemAperture Asked to register element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SBRecordingIndica
   10:30:32.866 +  14 ms SpringBoard com.apple.SystemAperture Attempt to uniquely identify element that already has a unique identifier – ignoring: element: <SBRecordingIndicatorSyst
   10:30:32.866 +  14 ms SpringBoard com.apple.SystemAperture Created assertion (<SAUIElementAssertion: 0x787db0000>) for element: <SBRecordingIndicatorSystemApertureElement: 0x789ed
## audio-DAEMON entries (audiomxd/audioaccessoryd/…; not the harness) from activation−150 ms to first callback+50 ms: 159
## audiomxd entries in that interval: 0 · per process: [["audioaccessoryd", 159]]
   10:30:32.707 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:30:32.725 audioaccessoryd com.apple.bluetooth Received Call State changed yes
   10:30:32.725 audioaccessoryd com.apple.SmartRouting onDemandEventStarted yes event Call
   10:30:32.725 audioaccessoryd com.apple.SmartRouting OnDemandEventTimer: Start. Will reset it in 8s
   10:30:32.725 audioaccessoryd com.apple.AudioAccessory Mute Control: call state changed, isCallActive: yes, isCallHighPriority: no
   10:30:32.725 audioaccessoryd com.apple.AudioAccessory Mute Control: shouldSuppressBanner: no, shouldSuppressChime: no
   10:30:32.725 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:30:32.736 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:30:32.745 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:30:32.745 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:30:32.809 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:30:32.821 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:30:32.825 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:30:32.834 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:30:32.847 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:30:32.847 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:30:32.859 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:30:32.859 audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:30:32.859 audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:30:32.859 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:30:32.859 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:30:32.859 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:30:32.859 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:30:32.861 audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:30:32.861 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 7, current score is 2 (Low)
   10:30:32.862 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: activity evaluation ALDS 29s, AL 7
   10:30:33.033 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=Unknown isPlaying=100
   10:30:33.033 audioaccessoryd com.apple.bluetooth Updating local audio category 501 -> 100 app Unknown
   10:30:33.033 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 501 to 100
   10:30:33.033 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 100 for all discovered 3P devices
