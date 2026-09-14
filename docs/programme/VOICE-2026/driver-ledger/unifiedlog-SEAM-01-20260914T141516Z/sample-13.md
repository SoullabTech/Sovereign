## window.json sha256 4f4c3177c72e32a89152bf123badde738f4b816ab84390742bfe74119423143c · bytes 33944705
## decoded one JSON value ending at char 33943926 · residue 143 chars recorded verbatim (window-s13-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 28712
## event types: [('logEvent', 26865), ('activityCreateEvent', 1840), ('stateEvent', 7)]
## top processes: [('CommCenter', 4383), ('SpringBoard', 2493), ('VoiceKernelHarness', 1184), ('pkd', 1095), ('bluetoothd', 787), ('sharingd', 754), ('locationd', 748), ('mediaplaybackd', 725), ('appleh16camerad', 713), ('powerexperienced', 706), ('SharingUIService', 660), ('testmanagerd', 629), ('wifid', 556), ('corespeechd', 490), ('coreduetd', 442)]
## top subsystems: [('com.apple.CommCenter', 4110), ('', 2425), ('com.apple.xpc', 1531), ('com.apple.PlugInKit', 1331), ('com.apple.coreaudio', 1084), ('com.apple.dt.xctest', 923), ('com.apple.runningboard', 781), ('com.apple.network', 775), ('com.apple.bluetooth', 721), ('com.apple.powerexperienced', 680), ('com.apple.ShareSheet', 637), ('com.apple.launchservices', 577), ('com.apple.SpringBoard', 560), ('com.apple.UIKit', 552), ('com.apple.coremedia', 531)]
## first timestamp: 2026-09-14 10:23:38.031145-0400 · last: 2026-09-14 10:24:09.959905-0400
## audio-related entries kept (window-s13-audio.jsonl): 4518 · per process: [('SpringBoard', 2493), ('VoiceKernelHarness', 1184), ('bluetoothd', 787), ('audioaccessoryd', 54)]
## mediaserverd: NOT PRESENT IN THE S13-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S13-LEVEL WINDOW
## harness-process entries: 1184 · first: 2026-09-14 10:23:43.464761-0400 · last: 2026-09-14 10:24:06.196500-0400
## harness pids in window: 64016: 1184 entries 10:23:43.464…10:24:06.196
## sample pid = 64016 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 997851475, "start_begin": 997851632, "start_return": 997851782, "engine_configuration_changed": 997851791, "route_changed": 997851598, "first_input_callback": 997851879, "app_lifecycle": 997846875}
## log anchor session_activated: 2026-09-14 10:23:48.507736-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd909926
## log anchor start_begin: 2026-09-14 10:23:48.664735-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x1055b70d0: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:23:48.767384-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x1055b70d0: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:23:48.626752-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909926 posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.033 s · agreement between them: 0 ms
   residual session_activated: log − journal = +0 ms
   residual start_begin: log − journal = -0 ms
   residual engine_configuration_changed: log − journal = -56 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -4 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:23:43.907
   session_activated: wall ≈ 10:23:48.507
   start_begin: wall ≈ 10:23:48.664
   start_return: wall ≈ 10:23:48.814
   engine_configuration_changed: wall ≈ 10:23:48.823
   first_input_callback: wall ≈ 10:23:48.911
## entries inside engine.start() [10:23:48.664 … 10:23:48.814] (150 ms): 252 · per process: [["SpringBoard", 142], ["bluetoothd", 81], ["VoiceKernelHarness", 19], ["audioaccessoryd", 10]]
   10:23:48.664 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x1098b5500] Created node rio-outclient with nodeID 3 - reporting period = 10.000000
   10:23:48.664 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x1098b5500] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:23:48.664 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x108bcb9e8] AudioConverterNew wasn't needed since incoming an
   10:23:48.664 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x1099bf4a8] AudioConverterNew wasn't needed since incoming an
   10:23:48.664 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x1098b5500] initialized with error = 0
   10:23:48.664 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x109d41e40)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:23:48.664 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xc30b
   10:23:48.664 +   0 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262209540.
   10:23:48.664 +   0 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:23:48.665 +   0 ms bluetoothd com.apple.bluetooth GetDevices: flags 0x0 < >, total 28
   10:23:48.665 +   0 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:23:48.665 +   1 ms bluetoothd com.apple.bluetooth GetDevices: flags 0x0 < >, total 28
   10:23:48.667 +   2 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when the main run loop is idle
   10:23:48.667 +   2 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier run loop observer fired
   10:23:48.667 +   2 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier finished setting up run loop observer
   10:23:48.667 +   2 ms VoiceKernelHarness com.apple.dt.xctest Sending main run loop idle reply
   10:23:48.667 +   2 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x78addf420
   10:23:48.667 +   2 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:23:48.667 +   3 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:23:48.667 +   3 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:23:48.667 +   3 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:23:48.667 +   3 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:23:48.667 +   3 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:23:48.667 +   3 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:23:48.667 +   3 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when animations are idle
   10:23:48.667 +   3 ms VoiceKernelHarness com.apple.dt.xctest Sending animations idle reply with error: (null)
   10:23:48.668 +   3 ms SpringBoard  observedProcessStatesDidChange
   10:23:48.668 +   3 ms SpringBoard com.apple.runningboard Received state update for 64016 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:23:48.670 +   6 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:23:48.670 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:23:48.670 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:23:48.670 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:23:48.670 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:23:48.670 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:23:48.670 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:23:48.670 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:23:48.670 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:23:48.670 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:23:48.670 +   6 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:23:48.670 +   6 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:23:48.670 +   6 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:23:48.670 +   6 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:23:48.671 +   6 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:23:48.671 +   6 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:23:48.674 +  10 ms VoiceKernelHarness  observedProcessStatesDidChange
   10:23:48.674 +  10 ms VoiceKernelHarness com.apple.runningboard Received state update for 64016 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, unknown-NotVis
   10:23:48.678 +  14 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:23:48.678 +  14 ms audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:23:48.678 +  14 ms audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:23:48.678 +  14 ms audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:23:48.678 +  14 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:23:48.678 +  14 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:23:48.679 +  15 ms audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:23:48.679 +  15 ms audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:23:48.679 +  15 ms audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 11, current score is 6 (High)
   10:23:48.679 +  15 ms audioaccessoryd  Sharing/SFDeviceDiscovery/deviceDiscoveryUpdate
   10:23:48.679 +  15 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Active camera/microphone activity changed:
{(
    <SBSensorActivityAttribution: 0x798ac85a0; displ
   10:23:48.679 +  15 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Turning on...
   10:23:48.679 +  15 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Registering SystemAperture element
   10:23:48.679 +  15 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element dwell time satisfied changed: NO; oldValue: YES
## audio-DAEMON entries (audiomxd/audioaccessoryd/…; not the harness) from activation−150 ms to first callback+50 ms: 26
## audiomxd entries in that interval: 0 · per process: [["audioaccessoryd", 26]]
   10:23:48.513 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:23:48.531 audioaccessoryd com.apple.bluetooth Received Call State changed yes
   10:23:48.531 audioaccessoryd com.apple.SmartRouting onDemandEventStarted yes event Call
   10:23:48.531 audioaccessoryd com.apple.SmartRouting OnDemandEventTimer: Start. Will reset it in 8s
   10:23:48.531 audioaccessoryd com.apple.AudioAccessory Mute Control: call state changed, isCallActive: yes, isCallHighPriority: no
   10:23:48.531 audioaccessoryd com.apple.AudioAccessory Mute Control: shouldSuppressBanner: no, shouldSuppressChime: no
   10:23:48.531 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:23:48.540 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:23:48.545 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:23:48.545 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:23:48.599 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:23:48.627 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:23:48.635 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:23:48.641 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:23:48.643 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:23:48.643 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:23:48.678 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:23:48.678 audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:23:48.678 audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:23:48.678 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:23:48.678 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:23:48.678 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:23:48.679 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:23:48.679 audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:23:48.679 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 11, current score is 6 (High)
   10:23:48.679 audioaccessoryd  Sharing/SFDeviceDiscovery/deviceDiscoveryUpdate
