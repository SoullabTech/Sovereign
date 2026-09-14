## window.json sha256 00663e274f7c0d51cc802aecf9972ac5e65995f867bf8508e07b4afc645d4c94 · bytes 35684993
## decoded one JSON value ending at char 35684159 · residue 143 chars recorded verbatim (window-s11-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 30170
## event types: [('logEvent', 28303), ('activityCreateEvent', 1860), ('stateEvent', 7)]
## top processes: [('CommCenter', 5246), ('SpringBoard', 2514), ('VoiceKernelHarness', 1187), ('pkd', 1094), ('wifid', 925), ('locationd', 847), ('bluetoothd', 838), ('powerexperienced', 787), ('appleh16camerad', 744), ('sharingd', 744), ('SharingUIService', 658), ('testmanagerd', 629), ('mediaplaybackd', 583), ('coreduetd', 443), ('searchd', 382)]
## top subsystems: [('com.apple.CommCenter', 4986), ('', 2470), ('com.apple.xpc', 1621), ('com.apple.PlugInKit', 1331), ('com.apple.dt.xctest', 923), ('com.apple.coreaudio', 921), ('com.apple.network', 869), ('com.apple.runningboard', 810), ('com.apple.bluetooth', 778), ('com.apple.powerexperienced', 758), ('com.apple.ShareSheet', 637), ('com.apple.WiFiPolicy', 573), ('com.apple.SpringBoard', 559), ('com.apple.UIKit', 554), ('com.apple.BackBoard', 531)]
## first timestamp: 2026-09-14 10:22:11.119087-0400 · last: 2026-09-14 10:22:43.869658-0400
## audio-related entries kept (window-s11-audio.jsonl): 4604 · per process: [('SpringBoard', 2514), ('VoiceKernelHarness', 1187), ('bluetoothd', 838), ('audioaccessoryd', 49), ('audioclocksyncd', 16)]
## mediaserverd: NOT PRESENT IN THE S11-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S11-LEVEL WINDOW
## harness-process entries: 1187 · first: 2026-09-14 10:22:17.287999-0400 · last: 2026-09-14 10:22:40.162778-0400
## harness pids in window: 64009: 1187 entries 10:22:17.287…10:22:40.162
## sample pid = 64009 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 997765431, "start_begin": 997765623, "start_return": 997765781, "engine_configuration_changed": 997765784, "route_changed": 997765571, "first_input_callback": 997765879, "app_lifecycle": 997760702}
## log anchor session_activated: 2026-09-14 10:22:22.463998-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd90991e
## log anchor start_begin: 2026-09-14 10:22:22.655869-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x10758b570: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:22:22.761226-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x10758b570: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:22:22.600224-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd90991e posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.033 s · agreement between them: 0 ms
   residual session_activated: log − journal = +0 ms
   residual start_begin: log − journal = -0 ms
   residual engine_configuration_changed: log − journal = -56 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -4 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:22:17.734
   session_activated: wall ≈ 10:22:22.463
   start_begin: wall ≈ 10:22:22.655
   start_return: wall ≈ 10:22:22.813
   engine_configuration_changed: wall ≈ 10:22:22.816
   first_input_callback: wall ≈ 10:22:22.911
## entries inside engine.start() [10:22:22.655 … 10:22:22.813] (158 ms): 272 · per process: [["SpringBoard", 146], ["bluetoothd", 100], ["VoiceKernelHarness", 14], ["audioaccessoryd", 12]]
   10:22:22.655 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x10bad0f00] Created node rio-outclient with nodeID 3 - reporting period = 10.000000
   10:22:22.655 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x10bad0f00] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:22:22.655 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10ba491a8] AudioConverterNew wasn't needed since incoming an
   10:22:22.656 +   0 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10ba48728] AudioConverterNew wasn't needed since incoming an
   10:22:22.656 +   0 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x10bad0f00] initialized with error = 0
   10:22:22.656 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x10c01e840)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:22:22.656 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xed13
   10:22:22.656 +   0 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262180868.
   10:22:22.656 +   0 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:22:22.657 +   2 ms bluetoothd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd90900c posting AVAudioSessionRouteChangeNotification. Reason: A
   10:22:22.657 +   2 ms audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:22:22.658 +   3 ms SpringBoard com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd9095dd posting AVAudioSessionRouteChangeNotification. Reason: A
   10:22:22.658 +   3 ms SpringBoard com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd9095d5 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:22:22.661 +   5 ms SpringBoard com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd9095dd posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:22:22.661 +   6 ms VoiceKernelHarness com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd90991e posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:22:22.661 +   6 ms SpringBoard com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd9095d5 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:22:22.662 +   6 ms bluetoothd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd90900c posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:22:22.662 +   6 ms audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:22:22.663 +   7 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:22:22.664 +   9 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x78addfe60
   10:22:22.664 +   9 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:22:22.664 +   9 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:22:22.664 +   9 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:22:22.664 +   9 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:22:22.664 +   9 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:22:22.664 +   9 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:22:22.665 +  10 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:22:22.666 +  10 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:22:22.666 +  10 ms audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:22:22.666 +  10 ms audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:22:22.666 +  10 ms audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:22:22.666 +  10 ms SpringBoard  observedProcessStatesDidChange
   10:22:22.666 +  10 ms SpringBoard com.apple.runningboard Received state update for 64009 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:22:22.666 +  10 ms audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:22:22.666 +  10 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:22:22.666 +  10 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:22:22.666 +  11 ms audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:22:22.666 +  11 ms audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 11, current score is 6 (High)
   10:22:22.666 +  11 ms audioaccessoryd  Sharing/SFDeviceDiscovery/deviceDiscoveryUpdate
   10:22:22.667 +  12 ms bluetoothd com.apple.bluetooth Start scanning for process sharingd (60330) with scan request of type 7, blob: {length = 0, bytes = 0x}, mask {length = 
   10:22:22.667 +  12 ms bluetoothd com.apple.bluetooth Adding scan request called
   10:22:22.667 +  12 ms bluetoothd com.apple.bluetooth Adding scan request scan request of type 7, blob: {length = 22, bytes = 0x00000000000000000000000000000000000000000000},
   10:22:22.667 +  12 ms bluetoothd com.apple.bluetooth Passively scanning for devices of types: 7 12 15 16 (Window: 30/Interval: 60)
   10:22:22.667 +  12 ms bluetoothd com.apple.bluetooth About to scan for type: 16 - rssi: -75 - range: 0 - payload: {length = 22, bytes = 0x00000000000000000000000000000000000
   10:22:22.667 +  12 ms bluetoothd com.apple.bluetooth About to scan for type: 15 - rssi: -80 - range: 0 - payload: {length = 22, bytes = 0x00000000000000000000000000000000000
   10:22:22.667 +  12 ms bluetoothd com.apple.bluetooth About to scan for type: 7 - rssi: -70 - range: 0 - payload: {length = 22, bytes = 0x000000000000000000000000000000000000
   10:22:22.667 +  12 ms bluetoothd com.apple.bluetooth About to scan for type: 12 - rssi: -90 - range: 0 - payload: {length = 22, bytes = 0x00000000000000000000000000000000000
   10:22:22.667 +  12 ms bluetoothd com.apple.bluetooth Scan options changed: 1
   10:22:22.667 +  12 ms bluetoothd com.apple.bluetooth Received XPC message "CBMsgIdScan" from session "com.apple.bluetoothd-central-97-5"
   10:22:22.667 +  12 ms bluetoothd com.apple.bluetooth Setting client list to <private>
   10:22:22.667 +  12 ms bluetoothd com.apple.bluetooth Session com.apple.bluetoothd-central-97-5(Wiprox) Unspecified already scanning, stopping first
   10:22:22.667 +  12 ms bluetoothd com.apple.bluetooth Received 'stop scan' request from session "com.apple.bluetoothd-central-97-5" (Wiprox) updateScanParams:NO shouldUpdateS
   10:22:22.667 +  12 ms bluetoothd com.apple.bluetooth Not updating state
   10:22:22.667 +  12 ms bluetoothd com.apple.bluetooth fShouldRetainDupsNextUpdate 0, screen? 1, retaindup? 0, EN scans? 0, created[EN]=0
   10:22:22.667 +  12 ms bluetoothd com.apple.bluetooth EN is not active - new retain dups value 0
   10:22:22.667 +  12 ms bluetoothd com.apple.bluetooth Received 'start Unspecified scan' request  , with duplicates, duration:unlimited, on 1M PHY scan timing 30/60  scanLevel
   10:22:22.667 +  12 ms bluetoothd com.apple.bluetooth ShouldScan=1 AnyValidScanRequests=1 anyValidScanRequestInPaused=0 fObserverState=Active ClientScanPowerAssertRequired=0 
   10:22:22.667 +  12 ms bluetoothd com.apple.bluetooth bomEnabled:1 chipset:25 usecase:FindMyNotOptedIn fScreenState:1
   10:22:22.667 +  12 ms bluetoothd com.apple.bluetooth bomEnabled:1 chipset:25 usecase:FindMyNotOptedInBeepOnMoveWaking fScreenState:1
   10:22:22.667 +  12 ms bluetoothd com.apple.bluetooth bomEnabled:1 chipset:25 usecase:FindMyNotOptedIn fScreenState:1
## audio-DAEMON entries (audiomxd/audioaccessoryd/…; not the harness) from activation−150 ms to first callback+50 ms: 26
## audiomxd entries in that interval: 0 · per process: [["audioaccessoryd", 26]]
   10:22:22.481 audioaccessoryd com.apple.bluetooth Received Call State changed yes
   10:22:22.481 audioaccessoryd com.apple.SmartRouting onDemandEventStarted yes event Call
   10:22:22.481 audioaccessoryd com.apple.SmartRouting OnDemandEventTimer: Start. Will reset it in 8s
   10:22:22.481 audioaccessoryd com.apple.AudioAccessory Mute Control: call state changed, isCallActive: yes, isCallHighPriority: no
   10:22:22.481 audioaccessoryd com.apple.AudioAccessory Mute Control: shouldSuppressBanner: no, shouldSuppressChime: no
   10:22:22.481 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:22:22.491 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:22:22.495 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:22:22.495 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:22:22.531 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:22:22.535 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:22:22.638 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:22:22.644 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:22:22.644 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:22:22.657 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:22:22.662 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:22:22.666 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:22:22.666 audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:22:22.666 audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:22:22.666 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:22:22.666 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:22:22.666 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:22:22.666 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:22:22.666 audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:22:22.666 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 11, current score is 6 (High)
   10:22:22.666 audioaccessoryd  Sharing/SFDeviceDiscovery/deviceDiscoveryUpdate
