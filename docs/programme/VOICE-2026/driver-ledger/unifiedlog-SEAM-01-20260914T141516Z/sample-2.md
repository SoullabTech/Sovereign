## window.json sha256 bd6855263a94f5d86733f73c3ebe6bb9f3d2a37919ea9d8a74844eb08c442910 · bytes 47930200
## decoded one JSON value ending at char 47929315 · residue 143 chars recorded verbatim (window-s2-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 40206
## event types: [('logEvent', 38051), ('activityCreateEvent', 2148), ('stateEvent', 7)]
## top processes: [('SpringBoard', 5948), ('CommCenter', 4799), ('mediaplaybackd', 2596), ('corespeechd', 2336), ('VoiceKernelHarness', 1754), ('pkd', 1108), ('bluetoothd', 1049), ('powerexperienced', 986), ('locationd', 936), ('sharingd', 800), ('wifid', 795), ('testmanagerd', 714), ('WirelessRadioManagerd', 675), ('SharingUIService', 661), ('heard', 635)]
## top subsystems: [('com.apple.CommCenter', 4205), ('com.apple.coreaudio', 3352), ('', 2742), ('com.apple.coremedia', 1817), ('com.apple.corespeech', 1673), ('com.apple.xpc', 1413), ('com.apple.PlugInKit', 1360), ('com.apple.UserNotifications', 1128), ('com.apple.dt.xctest', 1037), ('com.apple.powerexperienced', 950), ('com.apple.runningboard', 935), ('com.apple.bluetooth', 863), ('com.apple.BulletinBoard', 763), ('com.apple.network', 758), ('com.apple.SpringBoard', 751)]
## first timestamp: 2026-09-14 10:15:58.148729-0400 · last: 2026-09-14 10:16:30.743406-0400
## audio-related entries kept (window-s2-audio.jsonl): 8960 · per process: [('SpringBoard', 5948), ('VoiceKernelHarness', 1754), ('bluetoothd', 1049), ('audioaccessoryd', 193), ('audioclocksyncd', 16)]
## mediaserverd: NOT PRESENT IN THE S2-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S2-LEVEL WINDOW
## harness-process entries: 1754 · first: 2026-09-14 10:16:03.897930-0400 · last: 2026-09-14 10:16:26.767608-0400
## harness pids in window: 63967: 1754 entries 10:16:03.897…10:16:26.767
## sample pid = 63967 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 997392090, "start_begin": 997392234, "start_return": 997392387, "engine_configuration_changed": 997392423, "route_changed": 997392210, "first_input_callback": null, "app_lifecycle": 997387292}
## log anchor session_activated: 2026-09-14 10:16:09.123038-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd9098fa
## log anchor start_begin: 2026-09-14 10:16:09.267029-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x10997b080: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:16:09.368414-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x10997b080: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:16:09.214736-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd9098fa posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.033 s · agreement between them: 0 ms
   residual session_activated: log − journal = +0 ms
   residual start_begin: log − journal = -0 ms
   residual engine_configuration_changed: log − journal = -88 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -28 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:16:04.325
   session_activated: wall ≈ 10:16:09.123
   start_begin: wall ≈ 10:16:09.267
   start_return: wall ≈ 10:16:09.420
   engine_configuration_changed: wall ≈ 10:16:09.456
## entries inside engine.start() [10:16:09.267 … 10:16:09.420] (153 ms): 265 · per process: [["SpringBoard", 144], ["bluetoothd", 98], ["VoiceKernelHarness", 13], ["audioaccessoryd", 10]]
   10:16:09.267 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x10deb0f00] Created node rio-outclient with nodeID 3 - reporting period = 10.000000
   10:16:09.267 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x10deb0f00] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:16:09.267 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10dcf3d68] AudioConverterNew wasn't needed since incoming an
   10:16:09.267 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10ddcbd68] AudioConverterNew wasn't needed since incoming an
   10:16:09.267 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x10deb0f00] initialized with error = 0
   10:16:09.267 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x10e541e40)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:16:09.267 +   1 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xe31b
   10:16:09.267 +   1 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262008836.
   10:16:09.267 +   1 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:16:09.268 +   1 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:16:09.272 +   5 ms SpringBoard com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd9095d5 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:16:09.272 +   5 ms SpringBoard com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd9095dd posting AVAudioSessionRouteChangeNotification. Reason: A
   10:16:09.273 +   7 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x7881098c0
   10:16:09.273 +   7 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:16:09.273 +   7 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:16:09.273 +   7 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:16:09.273 +   7 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:16:09.273 +   7 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:16:09.273 +   7 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:16:09.273 +   7 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:16:09.274 +   7 ms SpringBoard  observedProcessStatesDidChange
   10:16:09.274 +   7 ms SpringBoard com.apple.runningboard Received state update for 63967 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:16:09.274 +   8 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:16:09.274 +   8 ms audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:16:09.274 +   8 ms audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:16:09.274 +   8 ms audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:16:09.274 +   8 ms audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:16:09.274 +   8 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:16:09.274 +   8 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:16:09.275 +   8 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:16:09.275 +   8 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:16:09.275 +   8 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:16:09.275 +   8 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:16:09.275 +   8 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:16:09.275 +   8 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:16:09.275 +   8 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:16:09.275 +   8 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:16:09.275 +   8 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:16:09.275 +   8 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:16:09.275 +   8 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:16:09.275 +   8 ms audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:16:09.275 +   8 ms audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 11, current score is 6 (High)
   10:16:09.275 +   8 ms audioaccessoryd  Sharing/SFDeviceDiscovery/deviceDiscoveryUpdate
   10:16:09.275 +   8 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:16:09.275 +   8 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:16:09.275 +   8 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:16:09.276 +   9 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:16:09.276 +   9 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:16:09.276 +   9 ms bluetoothd com.apple.bluetooth Start scanning for process sharingd (60330) with scan request of type 7, blob: {length = 0, bytes = 0x}, mask {length = 
   10:16:09.276 +   9 ms bluetoothd com.apple.bluetooth Adding scan request called
   10:16:09.276 +   9 ms bluetoothd com.apple.bluetooth Adding scan request scan request of type 7, blob: {length = 22, bytes = 0x00000000000000000000000000000000000000000000},
   10:16:09.276 +   9 ms bluetoothd com.apple.bluetooth Passively scanning for devices of types: 7 12 15 16 (Window: 30/Interval: 60)
   10:16:09.276 +   9 ms bluetoothd com.apple.bluetooth About to scan for type: 16 - rssi: -75 - range: 0 - payload: {length = 22, bytes = 0x00000000000000000000000000000000000
   10:16:09.276 +   9 ms bluetoothd com.apple.bluetooth About to scan for type: 15 - rssi: -80 - range: 0 - payload: {length = 22, bytes = 0x00000000000000000000000000000000000
   10:16:09.276 +   9 ms bluetoothd com.apple.bluetooth About to scan for type: 7 - rssi: -70 - range: 0 - payload: {length = 22, bytes = 0x000000000000000000000000000000000000
   10:16:09.276 +   9 ms bluetoothd com.apple.bluetooth About to scan for type: 12 - rssi: -90 - range: 0 - payload: {length = 22, bytes = 0x00000000000000000000000000000000000
   10:16:09.276 +   9 ms bluetoothd com.apple.bluetooth Scan options changed: 1
   10:16:09.276 +   9 ms bluetoothd com.apple.bluetooth Received XPC message "CBMsgIdScan" from session "com.apple.bluetoothd-central-97-5"
   10:16:09.276 +   9 ms bluetoothd com.apple.bluetooth Setting client list to <private>
   10:16:09.276 +   9 ms bluetoothd com.apple.bluetooth Session com.apple.bluetoothd-central-97-5(Wiprox) Unspecified already scanning, stopping first
