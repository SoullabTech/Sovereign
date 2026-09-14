## window.json sha256 0f464b4647caf3a63c69f6919856f0f241372120404a3ce0b0b3b516715d9fea · bytes 38786821
## decoded one JSON value ending at char 38785886 · residue 143 chars recorded verbatim (window-s8-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 32731
## event types: [('logEvent', 30905), ('activityCreateEvent', 1819), ('stateEvent', 7)]
## top processes: [('CommCenter', 4313), ('SpringBoard', 2748), ('VoiceKernelHarness', 1348), ('mediaplaybackd', 1345), ('bluetoothd', 1111), ('pkd', 1101), ('appleh16camerad', 961), ('corespeechd', 933), ('powerexperienced', 870), ('sharingd', 766), ('locationd', 738), ('SharingUIService', 657), ('testmanagerd', 633), ('biomed', 575), ('CallHistorySyncHelper', 537)]
## top subsystems: [('com.apple.CommCenter', 4008), ('', 2484), ('com.apple.coreaudio', 2021), ('com.apple.xpc', 1567), ('com.apple.PlugInKit', 1339), ('com.apple.bluetooth', 1006), ('com.apple.coremedia', 959), ('com.apple.dt.xctest', 923), ('com.apple.powerexperienced', 838), ('com.apple.network', 768), ('com.apple.runningboard', 730), ('com.apple.corespeech', 667), ('com.apple.ShareSheet', 634), ('com.apple.launchservices', 589), ('com.apple.SpringBoard', 589)]
## first timestamp: 2026-09-14 10:20:03.034197-0400 · last: 2026-09-14 10:20:35.971061-0400
## audio-related entries kept (window-s8-audio.jsonl): 5313 · per process: [('SpringBoard', 2748), ('VoiceKernelHarness', 1348), ('bluetoothd', 1111), ('audioaccessoryd', 90), ('audioclocksyncd', 16)]
## mediaserverd: NOT PRESENT IN THE S8-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S8-LEVEL WINDOW
## harness-process entries: 1348 · first: 2026-09-14 10:20:09.192623-0400 · last: 2026-09-14 10:20:32.073357-0400
## harness pids in window: 63989: 1348 entries 10:20:09.192…10:20:32.073
## sample pid = 63989 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 997637207, "start_begin": 997637333, "start_return": 997637486, "engine_configuration_changed": 997637501, "route_changed": 997637304, "first_input_callback": 997639533, "app_lifecycle": 997632599}
## log anchor session_activated: 2026-09-14 10:20:14.239863-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd909912
## log anchor start_begin: 2026-09-14 10:20:14.365304-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x10c18aff0: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:20:14.465914-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x10c18aff0: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:20:14.332680-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909912 posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.033 s · agreement between them: 1 ms
   residual session_activated: log − journal = +0 ms
   residual start_begin: log − journal = -0 ms
   residual engine_configuration_changed: log − journal = -68 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -4 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:20:09.631
   session_activated: wall ≈ 10:20:14.239
   start_begin: wall ≈ 10:20:14.365
   start_return: wall ≈ 10:20:14.518
   engine_configuration_changed: wall ≈ 10:20:14.533
   first_input_callback: wall ≈ 10:20:16.565
## entries inside engine.start() [10:20:14.365 … 10:20:14.518] (153 ms): 264 · per process: [["SpringBoard", 145], ["bluetoothd", 98], ["audioaccessoryd", 11], ["VoiceKernelHarness", 10]]
   10:20:14.365 +   0 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:20:14.365 +   0 ms SpringBoard com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd9095dd posting AVAudioSessionRouteChangeNotification. Reason: A
   10:20:14.366 +   0 ms bluetoothd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd90900c posting AVAudioSessionRouteChangeNotification. Reason: A
   10:20:14.367 +   1 ms audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:20:14.367 +   2 ms SpringBoard com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd9095d5 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:20:14.368 +   3 ms SpringBoard com.apple.siri -[SASBluetoothEndpointUtility _setEndpointTypeWithNotification:]_block_invoke Endpoint type is not found from AVSystemCo
   10:20:14.369 +   3 ms SpringBoard  observedProcessStatesDidChange
   10:20:14.369 +   3 ms SpringBoard com.apple.runningboard Received state update for 63989 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:20:14.369 +   4 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x78a4432c0
   10:20:14.369 +   4 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:20:14.369 +   4 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:20:14.369 +   4 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:20:14.369 +   4 ms audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:20:14.369 +   4 ms audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:20:14.369 +   4 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:20:14.369 +   4 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:20:14.369 +   4 ms audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:20:14.369 +   4 ms audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:20:14.369 +   4 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:20:14.369 +   4 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:20:14.369 +   4 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:20:14.369 +   4 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:20:14.369 +   4 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:20:14.369 +   4 ms audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:20:14.369 +   4 ms audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 11, current score is 6 (High)
   10:20:14.369 +   4 ms audioaccessoryd  Sharing/SFDeviceDiscovery/deviceDiscoveryUpdate
   10:20:14.370 +   5 ms bluetoothd com.apple.bluetooth Start scanning for process sharingd (60330) with scan request of type 7, blob: {length = 0, bytes = 0x}, mask {length = 
   10:20:14.370 +   5 ms bluetoothd com.apple.bluetooth Adding scan request called
   10:20:14.370 +   5 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:20:14.370 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:20:14.370 +   5 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:20:14.370 +   5 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:20:14.370 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:20:14.370 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:20:14.370 +   5 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:20:14.370 +   5 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:20:14.370 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:20:14.370 +   5 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:20:14.370 +   5 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:20:14.370 +   5 ms bluetoothd com.apple.bluetooth Adding scan request scan request of type 7, blob: {length = 22, bytes = 0x00000000000000000000000000000000000000000000},
   10:20:14.370 +   5 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:20:14.370 +   5 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:20:14.370 +   5 ms bluetoothd com.apple.bluetooth Passively scanning for devices of types: 7 12 15 16 (Window: 30/Interval: 60)
   10:20:14.370 +   5 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:20:14.370 +   5 ms bluetoothd com.apple.bluetooth About to scan for type: 16 - rssi: -75 - range: 0 - payload: {length = 22, bytes = 0x00000000000000000000000000000000000
   10:20:14.370 +   5 ms bluetoothd com.apple.bluetooth About to scan for type: 15 - rssi: -80 - range: 0 - payload: {length = 22, bytes = 0x00000000000000000000000000000000000
   10:20:14.370 +   5 ms bluetoothd com.apple.bluetooth About to scan for type: 7 - rssi: -70 - range: 0 - payload: {length = 22, bytes = 0x000000000000000000000000000000000000
   10:20:14.370 +   5 ms bluetoothd com.apple.bluetooth About to scan for type: 12 - rssi: -90 - range: 0 - payload: {length = 22, bytes = 0x00000000000000000000000000000000000
   10:20:14.370 +   5 ms bluetoothd com.apple.bluetooth Scan options changed: 1
   10:20:14.370 +   5 ms bluetoothd com.apple.bluetooth Received XPC message "CBMsgIdScan" from session "com.apple.bluetoothd-central-97-5"
   10:20:14.370 +   5 ms bluetoothd com.apple.bluetooth Setting client list to <private>
   10:20:14.370 +   5 ms bluetoothd com.apple.bluetooth Session com.apple.bluetoothd-central-97-5(Wiprox) Unspecified already scanning, stopping first
   10:20:14.370 +   5 ms bluetoothd com.apple.bluetooth Received 'stop scan' request from session "com.apple.bluetoothd-central-97-5" (Wiprox) updateScanParams:NO shouldUpdateS
   10:20:14.370 +   5 ms bluetoothd com.apple.bluetooth Not updating state
   10:20:14.371 +   5 ms bluetoothd com.apple.bluetooth fShouldRetainDupsNextUpdate 0, screen? 1, retaindup? 0, EN scans? 0, created[EN]=0
   10:20:14.371 +   5 ms bluetoothd com.apple.bluetooth EN is not active - new retain dups value 0
   10:20:14.371 +   5 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:20:14.371 +   5 ms bluetoothd com.apple.bluetooth Received 'start Unspecified scan' request  , with duplicates, duration:unlimited, on 1M PHY scan timing 30/60  scanLevel
   10:20:14.371 +   5 ms bluetoothd com.apple.bluetooth ShouldScan=1 AnyValidScanRequests=1 anyValidScanRequestInPaused=0 fObserverState=Active ClientScanPowerAssertRequired=0 
   10:20:14.371 +   5 ms bluetoothd com.apple.bluetooth bomEnabled:1 chipset:25 usecase:FindMyNotOptedIn fScreenState:1
## audio-DAEMON entries (audiomxd/audioaccessoryd/…; not the harness) from activation−150 ms to first callback+50 ms: 64
## audiomxd entries in that interval: 0 · per process: [["audioaccessoryd", 64]]
   10:20:14.245 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:20:14.262 audioaccessoryd com.apple.bluetooth Received Call State changed yes
   10:20:14.262 audioaccessoryd com.apple.SmartRouting onDemandEventStarted yes event Call
   10:20:14.262 audioaccessoryd com.apple.SmartRouting OnDemandEventTimer: Start. Will reset it in 8s
   10:20:14.262 audioaccessoryd com.apple.AudioAccessory Mute Control: call state changed, isCallActive: yes, isCallHighPriority: no
   10:20:14.262 audioaccessoryd com.apple.AudioAccessory Mute Control: shouldSuppressBanner: no, shouldSuppressChime: no
   10:20:14.262 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:20:14.271 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:20:14.276 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:20:14.276 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:20:14.310 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:20:14.346 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:20:14.352 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:20:14.352 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:20:14.367 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:20:14.369 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:20:14.369 audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:20:14.369 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:20:14.369 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:20:14.369 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:20:14.369 audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:20:14.369 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:20:14.369 audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:20:14.369 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 11, current score is 6 (High)
   10:20:14.369 audioaccessoryd  Sharing/SFDeviceDiscovery/deviceDiscoveryUpdate
   10:20:14.526 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:20:14.554 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=Unknown isPlaying=100
   10:20:14.554 audioaccessoryd com.apple.bluetooth Updating local audio category 501 -> 100 app Unknown
   10:20:14.554 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 501 to 100
   10:20:14.554 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 100 for all discovered 3P devices
