## window.json sha256 ddd3d9950bb58d6942abd0e1b53873d3f44720f46727f04c17527b69b730bd4e · bytes 38735857
## decoded one JSON value ending at char 38734395 · residue 143 chars recorded verbatim (window-s27-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 32873
## event types: [('logEvent', 30399), ('activityCreateEvent', 2467), ('stateEvent', 7)]
## top processes: [('CommCenter', 4244), ('SpringBoard', 2426), ('VoiceKernelHarness', 1187), ('bluetoothd', 1119), ('pkd', 1095), ('cloudd', 1053), ('appleh16camerad', 1023), ('powerexperienced', 922), ('locationd', 919), ('sharingd', 749), ('mediaplaybackd', 715), ('tccd', 689), ('SharingUIService', 648), ('testmanagerd', 645), ('wifid', 582)]
## top subsystems: [('com.apple.CommCenter', 4014), ('', 3203), ('com.apple.xpc', 2236), ('com.apple.PlugInKit', 1331), ('com.apple.coreaudio', 1214), ('com.apple.network', 1196), ('com.apple.bluetooth', 1100), ('com.apple.dt.xctest', 937), ('com.apple.powerexperienced', 888), ('com.apple.runningboard', 817), ('com.apple.ShareSheet', 625), ('com.apple.UIKit', 563), ('com.apple.SpringBoard', 560), ('com.apple.launchservices', 539), ('com.apple.coremedia', 533)]
## first timestamp: 2026-09-14 10:35:00.037044-0400 · last: 2026-09-14 10:35:32.995343-0400
## audio-related entries kept (window-s27-audio.jsonl): 4861 · per process: [('SpringBoard', 2426), ('VoiceKernelHarness', 1187), ('bluetoothd', 1119), ('audioaccessoryd', 113), ('audioclocksyncd', 16)]
## mediaserverd: NOT PRESENT IN THE S27-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S27-LEVEL WINDOW
## harness-process entries: 1187 · first: 2026-09-14 10:35:06.370403-0400 · last: 2026-09-14 10:35:29.098786-0400
## harness pids in window: 64105: 1187 entries 10:35:06.370…10:35:29.098
## sample pid = 64105 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 998534403, "start_begin": 998534598, "start_return": 998534747, "engine_configuration_changed": 998534751, "route_changed": 998534515, "first_input_callback": 998534847, "app_lifecycle": 998529778}
## log anchor session_activated: 2026-09-14 10:35:11.435570-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd909960
## log anchor start_begin: 2026-09-14 10:35:11.630751-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x1079930d0: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:35:11.737409-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x1079930d0: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:35:11.545279-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909960 posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.033 s · agreement between them: 0 ms
   residual session_activated: log − journal = -0 ms
   residual start_begin: log − journal = +0 ms
   residual engine_configuration_changed: log − journal = -46 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -2 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:35:06.810
   session_activated: wall ≈ 10:35:11.435
   start_begin: wall ≈ 10:35:11.630
   start_return: wall ≈ 10:35:11.779
   engine_configuration_changed: wall ≈ 10:35:11.783
   first_input_callback: wall ≈ 10:35:11.879
## entries inside engine.start() [10:35:11.630 … 10:35:11.779] (149 ms): 169 · per process: [["SpringBoard", 142], ["VoiceKernelHarness", 14], ["audioaccessoryd", 10], ["bluetoothd", 3]]
   10:35:11.630 +   0 ms VoiceKernelHarness com.apple.avfaudio AVAudioEngine.mm:1182  Engine@0x1079930d0: start, was running 0
   10:35:11.630 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x10b8b5500] Created node rio-outclient with nodeID 3 - reporting period = 10.000000
   10:35:11.630 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x10b8b5500] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:35:11.630 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10c1f01e8] AudioConverterNew wasn't needed since incoming an
   10:35:11.631 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10c1f0028] AudioConverterNew wasn't needed since incoming an
   10:35:11.631 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x10b8b5500] initialized with error = 0
   10:35:11.631 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x10c22c040)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:35:11.631 +   0 ms bluetoothd com.apple.bluetooth GetDevices: flags 0x0 < >, total 28
   10:35:11.631 +   1 ms bluetoothd com.apple.bluetooth GetDevices: flags 0x0 < >, total 28
   10:35:11.632 +   2 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xef1b
   10:35:11.632 +   2 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262574084.
   10:35:11.632 +   2 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:35:11.633 +   3 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:35:11.634 +   4 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x78878c2a0
   10:35:11.634 +   4 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:35:11.634 +   4 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:35:11.634 +   4 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:35:11.634 +   4 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:35:11.634 +   4 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:35:11.634 +   4 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:35:11.634 +   4 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:35:11.634 +   4 ms SpringBoard  observedProcessStatesDidChange
   10:35:11.634 +   4 ms SpringBoard com.apple.runningboard Received state update for 64105 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:35:11.636 +   6 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:35:11.636 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:35:11.636 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:35:11.636 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:35:11.636 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:35:11.636 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:35:11.636 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:35:11.636 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:35:11.636 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:35:11.636 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:35:11.636 +   6 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:35:11.636 +   6 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:35:11.636 +   6 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:35:11.636 +   6 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:35:11.637 +   6 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:35:11.637 +   6 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:35:11.638 +   8 ms VoiceKernelHarness  observedProcessStatesDidChange
   10:35:11.638 +   8 ms VoiceKernelHarness com.apple.runningboard Received state update for 64105 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, unknown-NotVis
   10:35:11.640 +  10 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:35:11.640 +  10 ms audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:35:11.640 +  10 ms audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:35:11.640 +  10 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:35:11.640 +  10 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:35:11.641 +  10 ms audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:35:11.641 +  10 ms audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:35:11.641 +  11 ms audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:35:11.641 +  11 ms audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 7, current score is 2 (Low)
   10:35:11.641 +  11 ms audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: activity evaluation ALDS 28s, AL 7
   10:35:11.646 +  16 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Active camera/microphone activity changed:
{(
    <SBSensorActivityAttribution: 0x794ef1530; displ
   10:35:11.646 +  16 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Turning on...
   10:35:11.646 +  16 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Registering SystemAperture element
   10:35:11.646 +  16 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element dwell time satisfied changed: NO; oldValue: YES
   10:35:11.646 +  16 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element MOT changed: NO; oldValue: YES
   10:35:11.646 +  16 ms SpringBoard com.apple.SystemAperture Asked to register element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SBRecordingIndica
   10:35:11.646 +  16 ms SpringBoard com.apple.SystemAperture Attempt to uniquely identify element that already has a unique identifier – ignoring: element: <SBRecordingIndicatorSyst
   10:35:11.646 +  16 ms SpringBoard com.apple.SystemAperture Created assertion (<SAUIElementAssertion: 0x786ce2440>) for element: <SBRecordingIndicatorSystemApertureElement: 0x789ed
   10:35:11.646 +  16 ms SpringBoard com.apple.SystemAperture Asked to add view controller for element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SB
## audio-DAEMON entries (audiomxd/audioaccessoryd/…; not the harness) from activation−150 ms to first callback+50 ms: 26
## audiomxd entries in that interval: 0 · per process: [["audioaccessoryd", 26]]
   10:35:11.443 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:35:11.458 audioaccessoryd com.apple.bluetooth Received Call State changed yes
   10:35:11.458 audioaccessoryd com.apple.SmartRouting onDemandEventStarted yes event Call
   10:35:11.458 audioaccessoryd com.apple.SmartRouting OnDemandEventTimer: Start. Will reset it in 8s
   10:35:11.458 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:35:11.459 audioaccessoryd com.apple.AudioAccessory Mute Control: call state changed, isCallActive: yes, isCallHighPriority: no
   10:35:11.459 audioaccessoryd com.apple.AudioAccessory Mute Control: shouldSuppressBanner: no, shouldSuppressChime: no
   10:35:11.468 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:35:11.474 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:35:11.474 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:35:11.539 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:35:11.540 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:35:11.554 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:35:11.560 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:35:11.560 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:35:11.605 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:35:11.640 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:35:11.640 audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:35:11.640 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:35:11.640 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:35:11.640 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:35:11.641 audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:35:11.641 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:35:11.641 audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:35:11.641 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 7, current score is 2 (Low)
   10:35:11.641 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: activity evaluation ALDS 28s, AL 7
