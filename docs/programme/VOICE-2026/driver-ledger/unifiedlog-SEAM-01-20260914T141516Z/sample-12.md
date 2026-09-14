## window.json sha256 0ab78d84d527e8d5fc6299930a4a8e8546ca33850684a6d677262d68af89c476 · bytes 42862960
## decoded one JSON value ending at char 42862153 · residue 143 chars recorded verbatim (window-s12-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 36220
## event types: [('logEvent', 33750), ('activityCreateEvent', 2463), ('stateEvent', 7)]
## top processes: [('CommCenter', 4665), ('SpringBoard', 2645), ('wifid', 2055), ('mDNSResponder', 1525), ('VoiceKernelHarness', 1186), ('pkd', 1094), ('bluetoothd', 1051), ('Docs', 938), ('locationd', 875), ('appleh16camerad', 825), ('sharingd', 756), ('SharingUIService', 659), ('dasd', 652), ('testmanagerd', 651), ('symptomsd', 643)]
## top subsystems: [('com.apple.CommCenter', 4413), ('', 3187), ('com.apple.network', 1865), ('com.apple.xpc', 1818), ('com.apple.PlugInKit', 1332), ('com.apple.runningboard', 1238), ('com.apple.WiFiPolicy', 1056), ('com.apple.bluetooth', 1036), ('com.apple.coreaudio', 953), ('com.apple.dt.xctest', 944), ('com.apple.UIKit', 754), ('com.apple.mdns', 753), ('com.apple.WiFiManager', 706), ('com.apple.mDNSResponder', 690), ('com.apple.ShareSheet', 636)]
## first timestamp: 2026-09-14 10:22:55.046108-0400 · last: 2026-09-14 10:23:27.997057-0400
## audio-related entries kept (window-s12-audio.jsonl): 4998 · per process: [('SpringBoard', 2645), ('VoiceKernelHarness', 1186), ('bluetoothd', 1051), ('audioaccessoryd', 100), ('audioclocksyncd', 16)]
## mediaserverd: NOT PRESENT IN THE S12-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S12-LEVEL WINDOW
## harness-process entries: 1186 · first: 2026-09-14 10:23:00.642877-0400 · last: 2026-09-14 10:23:23.369390-0400
## harness pids in window: 64012: 1186 entries 10:23:00.642…10:23:23.369
## sample pid = 64012 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 997808656, "start_begin": 997808881, "start_return": 997809029, "engine_configuration_changed": 997809031, "route_changed": 997808790, "first_input_callback": 997809130, "app_lifecycle": 997804055}
## log anchor session_activated: 2026-09-14 10:23:05.688773-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd909922
## log anchor start_begin: 2026-09-14 10:23:05.913209-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x109d9efa0: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:23:06.014966-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x109d9efa0: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:23:05.820908-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909922 posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.032 s · agreement between them: 1 ms
   residual session_activated: log − journal = +0 ms
   residual start_begin: log − journal = -0 ms
   residual engine_configuration_changed: log − journal = -49 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -2 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:23:01.087
   session_activated: wall ≈ 10:23:05.688
   start_begin: wall ≈ 10:23:05.913
   start_return: wall ≈ 10:23:06.061
   engine_configuration_changed: wall ≈ 10:23:06.063
   first_input_callback: wall ≈ 10:23:06.162
## entries inside engine.start() [10:23:05.913 … 10:23:06.061] (148 ms): 190 · per process: [["SpringBoard", 142], ["bluetoothd", 24], ["VoiceKernelHarness", 13], ["audioaccessoryd", 11]]
   10:23:05.913 +   0 ms audioaccessoryd com.apple.bluetooth anySmartRouting yes _powerMonitor.firstUnlocked yes _sleeping no, _powerMonitor.screenOn yes, _powerMonitor.screenState 
   10:23:05.913 +   0 ms audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:23:05.913 +   0 ms bluetoothd com.apple.bluetooth GetDevices: flags 0x0 < >, total 28
   10:23:05.914 +   1 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x10e2c4f00] Created node rio-outclient with nodeID 3 - reporting period = 10.000000
   10:23:05.914 +   1 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:154   rtaid::Detector:0x10e2c4f00] Created node rio-inclient with nodeID 4 - reporting period = 10.000000,
   10:23:05.914 +   1 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10e251528] AudioConverterNew wasn't needed since incoming an
   10:23:05.914 +   1 ms VoiceKernelHarness com.apple.coreaudio [NodeFormatConverter.cpp:81    rtaid::NodeFormatConverter:0x10e250728] AudioConverterNew wasn't needed since incoming an
   10:23:05.914 +   1 ms VoiceKernelHarness com.apple.coreaudio [Detector.cpp:56    rtaid::Detector:0x10e2c4f00] initialized with error = 0
   10:23:05.914 +   1 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1666  Starting AURemoteIO(0x10e569e40)
output client:  2 ch,  44100 Hz, Float32, deinterleaved, output HW
   10:23:05.914 +   1 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xc233
   10:23:05.914 +   1 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262193156.
   10:23:05.914 +   1 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:23:05.914 +   1 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:23:05.915 +   2 ms bluetoothd com.apple.bluetooth GetDevices: flags 0x0 < >, total 28
   10:23:05.915 +   2 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x788f5aa80
   10:23:05.915 +   2 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:23:05.915 +   2 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:23:05.915 +   2 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:23:05.915 +   2 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:23:05.915 +   2 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:23:05.915 +   2 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:23:05.915 +   2 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:23:05.916 +   3 ms SpringBoard  observedProcessStatesDidChange
   10:23:05.916 +   3 ms SpringBoard com.apple.runningboard Received state update for 64012 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:23:05.916 +   3 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:23:05.916 +   3 ms audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:23:05.917 +   4 ms audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:23:05.918 +   5 ms bluetoothd com.apple.bluetooth Scanning started successfully
   10:23:05.918 +   5 ms bluetoothd com.apple.bluetooth Scan state change:  Starting(2) --> Scanning(3)
   10:23:05.918 +   5 ms bluetoothd com.apple.bluetooth ShouldScan=1 AnyValidScanRequests=1 anyValidScanRequestInPaused=0 fObserverState=Active ClientScanPowerAssertRequired=0 
   10:23:05.918 +   5 ms bluetoothd com.apple.bluetooth bomEnabled:1 chipset:25 usecase:FindMyNotOptedIn fScreenState:1
   10:23:05.918 +   5 ms bluetoothd com.apple.bluetooth bomEnabled:1 chipset:25 usecase:FindMyNotOptedInBeepOnMoveWaking fScreenState:1
   10:23:05.918 +   5 ms bluetoothd com.apple.bluetooth bomEnabled:1 chipset:25 usecase:FindMyNotOptedIn fScreenState:1
   10:23:05.918 +   5 ms bluetoothd com.apple.bluetooth ObjectDiscovery Client (com.apple.locationd-central-59041-9339) HWADVBufferIntervalMs:300.000000 HWADVBufferWindowMs:30.
   10:23:05.918 +   5 ms bluetoothd com.apple.bluetooth ObjectDiscovery Client (com.apple.locationd-central-59041-9335) HWADVBufferIntervalMs:300.000000 HWADVBufferWindowMs:30.
   10:23:05.918 +   5 ms bluetoothd com.apple.bluetooth ObjectDiscovery Client (com.apple.locationd-central-59041-9338) HWADVBufferIntervalMs:300.000000 HWADVBufferWindowMs:30.
   10:23:05.918 +   5 ms bluetoothd com.apple.bluetooth ObjectDiscovery Client (com.apple.locationd-central-59041-9337) HWADVBufferIntervalMs:300.000000 HWADVBufferWindowMs:30.
   10:23:05.918 +   5 ms bluetoothd com.apple.bluetooth ObjectDiscovery Client (com.apple.locationd-central-59041-9340) HWADVBufferIntervalMs:300.000000 HWADVBufferWindowMs:30.
   10:23:05.918 +   5 ms bluetoothd com.apple.bluetooth ObjectDiscovery Client (com.apple.locationd-central-59041-9622) HWADVBufferIntervalMs:300.000000 HWADVBufferWindowMs:30.
   10:23:05.918 +   5 ms bluetoothd com.apple.bluetooth ScanParams: numScanAgents 11, combined params AD:1 RD:0 AS:0 PHYS:1 MSL:4 (30/60) PSV:0 Rg:0 Cri:0 pBT:0 pWiFi:0 pCfg:0 
   10:23:05.918 +   5 ms bluetoothd com.apple.bluetooth ScanParams: [com.apple.bluetoothd-central-97-5] AP:0 AD:1(30/60) AS:0 RAS:0 DMN:1 FG:0 ADVBF:0(0/0) Rg:0 Cri:0 pBT:0 pwr
   10:23:05.918 +   5 ms bluetoothd com.apple.bluetooth ScanParams: [com.apple.locationd-central-59041-9338] AP:0 AD:1(0/0) AS:0 RAS:0 DMN:1 FG:0 ADVBF:1(30/300) Rg:0 Cri:0 pBT
   10:23:05.918 +   5 ms bluetoothd com.apple.bluetooth ScanParams: [com.apple.locationd-central-59041-9622] AP:0 AD:1(0/0) AS:0 RAS:0 DMN:1 FG:0 ADVBF:1(30/300) Rg:0 Cri:0 pBT
   10:23:05.918 +   5 ms bluetoothd com.apple.bluetooth ScanParams: [com.ihoment.GoVeeSensor-central-56365-8929] AP:0 AD:0(0/0) AS:0 RAS:0 DMN:0 FG:0 ADVBF:0(0/0) Rg:0 Cri:0 pB
   10:23:05.918 +   5 ms bluetoothd com.apple.bluetooth Returning scan parameters: Main:30.00ms/60.00ms LP:0.00ms/60.00ms(supported) SC:0.00ms/0.00ms/non-concurrent(supported) 
   10:23:05.918 +   5 ms bluetoothd com.apple.bluetooth needToRestart=0
   10:23:05.919 +   6 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:23:05.919 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:23:05.919 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:23:05.919 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:23:05.919 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:23:05.919 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:23:05.919 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:23:05.919 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:23:05.919 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:23:05.919 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:23:05.919 +   6 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:23:05.919 +   6 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:23:05.919 +   6 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:23:05.919 +   6 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
## audio-DAEMON entries (audiomxd/audioaccessoryd/…; not the harness) from activation−150 ms to first callback+50 ms: 61
## audiomxd entries in that interval: 0 · per process: [["audioaccessoryd", 61]]
   10:23:05.554 audioaccessoryd com.apple.bluetooth Activity level changed 11 (User) -> 7 (Screen)
   10:23:05.554 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 7, current score is 6 (High)
   10:23:05.554 audioaccessoryd com.apple.bluetooth Check activity in 480s
   10:23:05.554 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: audio routing score has changed 6 (High) -> 2 (Low)
   10:23:05.554 audioaccessoryd com.apple.bluetooth NearbyInfo set audio routing score: 2
   10:23:05.554 audioaccessoryd  Sharing/SFClient/setAudioRoutingScore
   10:23:05.559 audioaccessoryd com.apple.bluetooth Airpods fw version is 6F25, pairing record CBDevice 6A0757F7-6D22-4F55-34A0-564749352560, BDA <private>, Nm <private> , 
   10:23:05.561 audioaccessoryd com.apple.bluetooth Airpods fw version is 8B41, pairing record CBDevice 1CB3204D-52D8-873E-0DF8-362B5DCA50FF, BDA <private>, Nm <private> , 
   10:23:05.561 audioaccessoryd com.apple.bluetooth Airpods fw version is 0.0.0, pairing record CBDevice 8B6EAEA4-BAD1-4F69-47C3-DD07E62A925F, BDA <private>, Nm <private> ,
   10:23:05.561 audioaccessoryd com.apple.bluetooth Airpods fw version is NULL, pairing record CBDevice 1FD45D20-ADAE-80B9-26B5-4F9BB9079938, BDA <private>, Nm <private> , 
   10:23:05.562 audioaccessoryd com.apple.xpc [0x848a08c80] activating connection: mach=true listener=false peer=false name=com.apple.SharingServices
   10:23:05.563 audioaccessoryd com.apple.bluetooth SendTipiScoreToWx: 90:9C:4A:E5:E1:6A score SRDisable srMode Unknown USB no byte 02000308 result BT_ERROR_NOT_CONNECTED '
   10:23:05.563 audioaccessoryd com.apple.bluetooth SendTipiScoreToWx: 6C:12:70:13:75:13 score SRDisable srMode Unknown USB no byte 02000308 result BT_ERROR_NOT_CONNECTED '
   10:23:05.566 audioaccessoryd com.apple.sharing Invalidating
   10:23:05.566 audioaccessoryd com.apple.xpc [0x848a08c80] invalidated because the current process cancelled the connection by calling xpc_connection_cancel()
   10:23:05.693 audioaccessoryd com.apple.coreaudio SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd909015 posting AVAudioSessionRouteChangeNotification. Reason: A
   10:23:05.706 audioaccessoryd com.apple.bluetooth anySmartRouting yes _powerMonitor.firstUnlocked yes _sleeping no, _powerMonitor.screenOn yes, _powerMonitor.screenState 
   10:23:05.707 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:23:05.720 audioaccessoryd com.apple.bluetooth Received Call State changed yes
   10:23:05.720 audioaccessoryd com.apple.SmartRouting onDemandEventStarted yes event Call
   10:23:05.720 audioaccessoryd com.apple.SmartRouting OnDemandEventTimer: Start. Will reset it in 8s
   10:23:05.720 audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:23:05.720 audioaccessoryd com.apple.AudioAccessory Mute Control: call state changed, isCallActive: yes, isCallHighPriority: no
   10:23:05.720 audioaccessoryd com.apple.AudioAccessory Mute Control: shouldSuppressBanner: no, shouldSuppressChime: no
   10:23:05.732 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:342   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:23:05.736 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:311   Session 0xd909015 posting AVAudioSessionAvailableInputsChangeNotification
   10:23:05.736 audioaccessoryd com.apple.coreaudio SessionCore_iOS.mm:315   Session 0xd909015 posting AVAudioSessionAvailableOutputsChangeNotification
   10:23:05.771 audioaccessoryd com.apple.bluetooth Activity level changed 7 (Screen) -> 11 (User)
   10:23:05.771 audioaccessoryd com.apple.bluetooth Activity critical timer start: 5 seconds
   10:23:05.771 audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 11, current score is 2 (Low)
