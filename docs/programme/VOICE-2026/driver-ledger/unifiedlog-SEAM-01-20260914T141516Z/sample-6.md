## window.json sha256 6e59ec195aa75d1a7dcbee27b4a12992ec9b017207f915ccf5271fb99347d448 · bytes 34356198
## decoded one JSON value ending at char 34355398 · residue 143 chars recorded verbatim (window-s6-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 29026
## event types: [('logEvent', 27162), ('activityCreateEvent', 1857), ('stateEvent', 7)]
## top processes: [('CommCenter', 4232), ('SpringBoard', 2478), ('VoiceKernelHarness', 1187), ('pkd', 1095), ('locationd', 1061), ('bluetoothd', 915), ('appleh16camerad', 868), ('sharingd', 736), ('mediaplaybackd', 725), ('SharingUIService', 661), ('powerexperienced', 652), ('testmanagerd', 629), ('wifid', 565), ('corespeechd', 490), ('coreduetd', 445)]
## top subsystems: [('com.apple.CommCenter', 4012), ('', 2447), ('com.apple.xpc', 1534), ('com.apple.PlugInKit', 1331), ('com.apple.coreaudio', 1149), ('com.apple.dt.xctest', 923), ('com.apple.bluetooth', 817), ('com.apple.runningboard', 774), ('com.apple.network', 774), ('com.apple.ShareSheet', 636), ('com.apple.powerexperienced', 628), ('com.apple.SpringBoard', 561), ('com.apple.locationd.Core', 557), ('com.apple.UIKit', 555), ('com.apple.coremedia', 535)]
## first timestamp: 2026-09-14 10:18:41.042383-0400 · last: 2026-09-14 10:19:12.992796-0400
## audio-related entries kept (window-s6-audio.jsonl): 4634 · per process: [('SpringBoard', 2478), ('VoiceKernelHarness', 1187), ('bluetoothd', 915), ('audioaccessoryd', 54)]
## mediaserverd: NOT PRESENT IN THE S6-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S6-LEVEL WINDOW
## harness-process entries: 1187 · first: 2026-09-14 10:18:46.151817-0400 · last: 2026-09-14 10:19:08.929959-0400
## harness pids in window: 63983: 1187 entries 10:18:46.151…10:19:08.929
## sample pid = 63983 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 997554225, "start_begin": 997554421, "start_return": 997554570, "engine_configuration_changed": 997554574, "route_changed": 997554385, "first_input_callback": 997554668, "app_lifecycle": 997549563}
## log anchor session_activated: 2026-09-14 10:18:51.257721-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd90990a
## log anchor start_begin: 2026-09-14 10:18:51.453306-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x10758b160: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:18:51.558308-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x10758b160: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:18:51.392297-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd90990a posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.033 s · agreement between them: 0 ms
   residual session_activated: log − journal = +0 ms
   residual start_begin: log − journal = -0 ms
   residual engine_configuration_changed: log − journal = -48 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -25 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:18:46.595
   session_activated: wall ≈ 10:18:51.257
   start_begin: wall ≈ 10:18:51.453
   start_return: wall ≈ 10:18:51.602
   engine_configuration_changed: wall ≈ 10:18:51.606
   first_input_callback: wall ≈ 10:18:51.700
## entries inside engine.start() [10:18:51.453 … 10:18:51.602] (149 ms): 268 · per process: [["SpringBoard", 144], ["bluetoothd", 99], ["VoiceKernelHarness", 14], ["audioaccessoryd", 11]]
   10:18:51.454 +   1 ms SpringBoard com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd9095d5 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:18:51.454 +   1 ms audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:18:51.454 +   1 ms bluetoothd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd90900c posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:18:51.454 +   1 ms VoiceKernelHarness com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd90990a posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:18:51.454 +   1 ms SpringBoard com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd9095dd posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:18:51.455 +   2 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x10b8b5500] Created node rio-outclient with nodeID 3 - reporting period = 10.000000
   10:18:51.455 +   2 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x10b8b5500] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:18:51.455 +   2 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10be38028] AudioConverterNew wasn't needed since incoming an
   10:18:51.455 +   2 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10b9cef68] AudioConverterNew wasn't needed since incoming an
   10:18:51.455 +   2 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x10b8b5500] initialized with error = 0
   10:18:51.455 +   2 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x10bd6de40)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:18:51.455 +   2 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xe91b
   10:18:51.455 +   2 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262074372.
   10:18:51.455 +   2 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:18:51.455 +   2 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:18:51.456 +   3 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x78a853340
   10:18:51.456 +   3 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:18:51.456 +   3 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:18:51.457 +   4 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:18:51.457 +   4 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:18:51.457 +   4 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:18:51.457 +   4 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:18:51.457 +   4 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:18:51.457 +   4 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:18:51.457 +   4 ms audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:18:51.457 +   4 ms audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:18:51.457 +   4 ms audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:18:51.457 +   4 ms audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 11, current score is 6 (High)
   10:18:51.457 +   4 ms audioaccessoryd  Sharing/SFDeviceDiscovery/deviceDiscoveryUpdate
   10:18:51.457 +   4 ms audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:18:51.457 +   4 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:18:51.457 +   4 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:18:51.457 +   4 ms audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:18:51.457 +   4 ms SpringBoard  observedProcessStatesDidChange
   10:18:51.457 +   4 ms SpringBoard com.apple.runningboard Received state update for 63983 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth Start scanning for process sharingd (60330) with scan request of type 7, blob: {length = 0, bytes = 0x}, mask {length = 
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth Adding scan request called
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth Adding scan request scan request of type 7, blob: {length = 22, bytes = 0x00000000000000000000000000000000000000000000},
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth Passively scanning for devices of types: 7 12 15 16 (Window: 30/Interval: 60)
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth About to scan for type: 16 - rssi: -75 - range: 0 - payload: {length = 22, bytes = 0x00000000000000000000000000000000000
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth About to scan for type: 15 - rssi: -80 - range: 0 - payload: {length = 22, bytes = 0x00000000000000000000000000000000000
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth About to scan for type: 7 - rssi: -70 - range: 0 - payload: {length = 22, bytes = 0x000000000000000000000000000000000000
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth About to scan for type: 12 - rssi: -90 - range: 0 - payload: {length = 22, bytes = 0x00000000000000000000000000000000000
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth Scan options changed: 1
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth Received XPC message "CBMsgIdScan" from session "com.apple.bluetoothd-central-97-5"
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth Setting client list to <private>
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth Session com.apple.bluetoothd-central-97-5(Wiprox) Unspecified already scanning, stopping first
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth Received 'stop scan' request from session "com.apple.bluetoothd-central-97-5" (Wiprox) updateScanParams:NO shouldUpdateS
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth Not updating state
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth fShouldRetainDupsNextUpdate 0, screen? 1, retaindup? 0, EN scans? 0, created[EN]=0
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth EN is not active - new retain dups value 0
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth Received 'start Unspecified scan' request  , with duplicates, duration:unlimited, on 1M PHY scan timing 30/60  scanLevel
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth ShouldScan=1 AnyValidScanRequests=1 anyValidScanRequestInPaused=0 fObserverState=Active ClientScanPowerAssertRequired=0 
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth bomEnabled:1 chipset:25 usecase:FindMyNotOptedIn fScreenState:1
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth bomEnabled:1 chipset:25 usecase:FindMyNotOptedInBeepOnMoveWaking fScreenState:1
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth bomEnabled:1 chipset:25 usecase:FindMyNotOptedIn fScreenState:1
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth ObjectDiscovery Client (com.apple.locationd-central-59041-9339) HWADVBufferIntervalMs:300.000000 HWADVBufferWindowMs:30.
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth ObjectDiscovery Client (com.apple.locationd-central-59041-9335) HWADVBufferIntervalMs:300.000000 HWADVBufferWindowMs:30.
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth ObjectDiscovery Client (com.apple.locationd-central-59041-9338) HWADVBufferIntervalMs:300.000000 HWADVBufferWindowMs:30.
   10:18:51.458 +   5 ms bluetoothd com.apple.bluetooth ObjectDiscovery Client (com.apple.locationd-central-59041-9337) HWADVBufferIntervalMs:300.000000 HWADVBufferWindowMs:30.
## audio-DAEMON entries (audiomxd/audioaccessoryd/…; not the harness) from activation−150 ms to first callback+50 ms: 26
## audiomxd entries in that interval: 0 · per process: [["audioaccessoryd", 26]]
   10:18:51.264 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:18:51.276 audioaccessoryd com.apple.bluetooth Received Call State changed yes
   10:18:51.276 audioaccessoryd com.apple.SmartRouting onDemandEventStarted yes event Call
   10:18:51.276 audioaccessoryd com.apple.SmartRouting OnDemandEventTimer: Start. Will reset it in 8s
   10:18:51.276 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:18:51.276 audioaccessoryd com.apple.AudioAccessory Mute Control: call state changed, isCallActive: yes, isCallHighPriority: no
   10:18:51.276 audioaccessoryd com.apple.AudioAccessory Mute Control: shouldSuppressBanner: no, shouldSuppressChime: no
   10:18:51.285 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:18:51.288 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:18:51.288 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:18:51.332 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:18:51.429 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:18:51.436 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:18:51.436 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:18:51.449 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:18:51.454 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:323   Session 0xd909015 posting AVAudioSessionAudioHardwareFormatChangeNotificat
   10:18:51.457 audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:18:51.457 audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:18:51.457 audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:18:51.457 audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:18:51.457 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 11, current score is 6 (High)
   10:18:51.457 audioaccessoryd  Sharing/SFDeviceDiscovery/deviceDiscoveryUpdate
   10:18:51.457 audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:18:51.457 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:18:51.457 audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:18:51.457 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
