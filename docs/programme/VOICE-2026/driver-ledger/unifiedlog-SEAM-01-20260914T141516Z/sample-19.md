## window.json sha256 3f5646600c1b4837a8fb1d30be9d0e7127aa8108bd8b2973a75bfdb99461ffac · bytes 52229733
## decoded one JSON value ending at char 52229004 · residue 143 chars recorded verbatim (window-s19-trailer.txt): '==========\n/private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive\n==========\n'
## trailer names /private/tmp/voice-seam-01/docs/programme/VOICE-2026/driver-ledger/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · expected …/unifiedlog-SEAM-01-20260914T141516Z/device.logarchive · MATCH
## entries in window: 44072
## event types: [('logEvent', 41715), ('activityCreateEvent', 2350), ('stateEvent', 7)]
## top processes: [('duetexpertd', 4832), ('CommCenter', 4466), ('SpringBoard', 3812), ('mediaplaybackd', 2882), ('corespeechd', 2736), ('VoiceKernelHarness', 1837), ('locationd', 1298), ('bluetoothd', 1241), ('powerexperienced', 1123), ('pkd', 1095), ('sharingd', 909), ('WirelessRadioManagerd', 766), ('wifid', 765), ('testmanagerd', 659), ('SharingUIService', 655)]
## top subsystems: [('com.apple.CommCenter', 4048), ('com.apple.coreaudio', 3763), ('com.apple.duetexpertd.atx', 3168), ('', 2925), ('com.apple.coremedia', 1992), ('com.apple.corespeech', 1986), ('com.apple.xpc', 1792), ('com.apple.PlugInKit', 1331), ('contextualengine', 1302), ('com.apple.powerexperienced', 1082), ('com.apple.bluetooth', 1073), ('com.apple.runningboard', 1030), ('com.apple.dt.xctest', 929), ('com.apple.network', 782), ('com.apple.SpringBoard', 721)]
## first timestamp: 2026-09-14 10:28:03.161316-0400 · last: 2026-09-14 10:28:35.941449-0400
## audio-related entries kept (window-s19-audio.jsonl): 7181 · per process: [('SpringBoard', 3812), ('VoiceKernelHarness', 1837), ('bluetoothd', 1241), ('audioaccessoryd', 275), ('audioclocksyncd', 16)]
## mediaserverd: NOT PRESENT IN THE S19-LEVEL WINDOW
## coreaudiod: NOT PRESENT IN THE S19-LEVEL WINDOW
## harness-process entries: 1837 · first: 2026-09-14 10:28:08.950942-0400 · last: 2026-09-14 10:28:31.780447-0400
## harness pids in window: 64043: 1837 entries 10:28:08.950…10:28:31.780
## sample pid = 64043 (the last harness pid that activated an audio session); other harness pids are NOT the sample
## journal monotonic ms: {"session_activated": 998116985, "start_begin": 998117123, "start_return": 998117276, "engine_configuration_changed": 998117286, "route_changed": 998117087, "first_input_callback": null, "app_lifecycle": 998112348}
## log anchor session_activated: 2026-09-14 10:28:14.017828-0400 · com.apple.coreaudio · AVAudioSession_iOS.mm:996   Activated session 0xd90993e
## log anchor start_begin: 2026-09-14 10:28:14.155347-0400 · com.apple.avfaudio · AVAudioEngine.mm:1182  Engine@0x105d9efb0: start, was running 0
## log anchor engine_configuration_changed: 2026-09-14 10:28:14.259952-0400 · com.apple.avfaudio · AVAudioEngine.mm:1438  Engine@0x105d9efb0: iounit configuration changed > posting notification
## log anchor route_changed: 2026-09-14 10:28:14.097438-0400 · com.apple.coreaudio · SessionCore_iOS_NotificationHandlers.mm:475   Session 0xd90993e posting AVAudioSessionRouteChangeNotification.
## mono→wall offset from ['session_activated', 'start_begin']: 1788397977.033 s · agreement between them: 0 ms
   residual session_activated: log − journal = +0 ms
   residual start_begin: log − journal = -0 ms
   residual engine_configuration_changed: log − journal = -59 ms (posted before the kernel received it — expected sign)
   residual route_changed: log − journal = -22 ms (posted before the kernel received it — expected sign)
   app_lifecycle: wall ≈ 10:28:09.380
   session_activated: wall ≈ 10:28:14.017
   start_begin: wall ≈ 10:28:14.155
   start_return: wall ≈ 10:28:14.308
   engine_configuration_changed: wall ≈ 10:28:14.318
## entries inside engine.start() [10:28:14.155 … 10:28:14.308] (153 ms): 167 · per process: [["SpringBoard", 142], ["VoiceKernelHarness", 13], ["audioaccessoryd", 11], ["bluetoothd", 1]]
   10:28:14.155 +   0 ms VoiceKernelHarness com.apple.coreaudio AURemoteIO.cpp:1727  workgroup port 0xeb03
   10:28:14.155 +   0 ms VoiceKernelHarness  AUOOPWorkgroups.mm:30    AUOOPWorkgroupManager: AddRemoteIOWorkgroup called with token 262320132.
   10:28:14.155 +   0 ms VoiceKernelHarness  AUOOPWorkgroups.mm:66    AUOOPWorkgroupManager: mutating workgroups.
   10:28:14.155 +   0 ms VoiceKernelHarness com.apple.coreaudio ATAudioSessionPropertyManager.mm:60    GetProperty 1920166244 from AVAudioSession
   10:28:14.159 +   4 ms SpringBoard com.apple.SpringBoard _effectiveVolumeChanged for 'PhoneCall' for reason: RouteChange/0x78810ac00
   10:28:14.159 +   4 ms SpringBoard com.apple.SpringBoard Caching newEffectiveVolume: 0.625000 from AVSystemController
   10:28:14.159 +   4 ms SpringBoard com.apple.amp.mediaplayer <MPVolumeControllerSystemDataSource: 0x789c8df80> AVSystemController volume changed to: 0.625000 | category: PhoneCall |
   10:28:14.159 +   4 ms audioaccessoryd com.apple.bluetooth [Hijackv2] Received audio category changed: app=life.soullab.voicekernel.k00 isPlaying=501
   10:28:14.159 +   4 ms audioaccessoryd com.apple.bluetooth Updating local audio category 100 -> 501 app life.soullab.voicekernel.k00
   10:28:14.159 +   4 ms SpringBoard com.apple.SpringBoard Ignoring notification 'SomeSessionIsPlayingDidChange' from sender: <__NSCFType:0x78b3bffc0>; data provider: <AVSystemCon
   10:28:14.159 +   4 ms SpringBoard com.apple.SpringBoard Updated audioSessionPlaying to true
   10:28:14.159 +   4 ms audioaccessoryd com.apple.bluetooth Running preemptive evaluator for onDemand Connect for transition from idle to media playing!
   10:28:14.159 +   4 ms audioaccessoryd com.apple.SmartRouting EvaluateNearbyDevicesForConnection paired 28 connectedWx 0 nearbyWx 0 srDisDeviceCount 4 nearbySource 0 btState PoweredO
   10:28:14.159 +   4 ms SpringBoard com.apple.SpringBoard -[SBDisplayManager cache:didUpdateAudioSessionPlaying:] audioSessionPlaying 1
   10:28:14.159 +   4 ms SpringBoard com.apple.SpringBoard.buttons Re-evaluating overrides with audioSessionPlaying: YES
   10:28:14.159 +   4 ms SpringBoard com.apple.SpringBoard.buttons Physical button scene targets: (null)
   10:28:14.159 +   4 ms audioaccessoryd com.apple.AudioAccessory LocalAudioCategoryChanged: Audio category changed from 100 to 501
   10:28:14.159 +   4 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: Processing audio category 501 for all discovered 3P devices
   10:28:14.159 +   4 ms audioaccessoryd com.apple.AudioAccessory NotifyOtherTipiDeviceAudioCategoryChanged: No discovered 3P devices found
   10:28:14.160 +   5 ms audioaccessoryd com.apple.bluetooth Audio is playing on the system
   10:28:14.160 +   5 ms audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: AL 7, current score is 2 (Low)
   10:28:14.160 +   5 ms audioaccessoryd com.apple.bluetooth NearbyInfoActivityChanged: activity evaluation ALDS 25s, AL 7
   10:28:14.160 +   5 ms audioaccessoryd com.apple.bluetooth Check activity in 480s
   10:28:14.160 +   5 ms SpringBoard  observedProcessStatesDidChange
   10:28:14.160 +   5 ms SpringBoard com.apple.runningboard Received state update for 64043 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, running-active
   10:28:14.161 +   6 ms SpringBoard com.apple.ControlCenter Updated sensor activity data provider
   10:28:14.161 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for CAMERA matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:28:14.161 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: called for bundleID: life.so
   10:28:14.161 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterVideoEffectsModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00
   10:28:14.161 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says video module should be shown: YES
   10:28:14.161 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] Looking for MICROPHONE matching sensor types, bundleIdentifier: life.soullab.voicekernel.k00
   10:28:14.161 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: called for bundleID: life.soul
   10:28:14.161 +   6 ms SpringBoard com.apple.cameracapture <<<< AVControlCenterModules >>>> AVControlCenterMicrophoneModuleShouldBeShownForBundleID: life.soullab.voicekernel.k00 a
   10:28:14.161 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] AVFoundation says audio module should be shown: YES
   10:28:14.161 +   6 ms SpringBoard com.apple.ControlCenter [AV Modules] Setting visibility of AV modules (audio: YES for VoiceKernel K00, video: NO for (null))
   10:28:14.161 +   6 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:28:14.161 +   6 ms SpringBoard  com.apple.ControlCenter.RemoteServiceConnection.setVisibility
   10:28:14.161 +   6 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:28:14.161 +   6 ms SpringBoard com.apple.ControlCenter Setting visibility YES for module with identifier 'com.apple.replaykit.AudioConferenceControlCenterModule'
   10:28:14.162 +   7 ms SpringBoard com.apple.ControlCenter Requesting setting of visibility NO for module with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule'
   10:28:14.162 +   7 ms SpringBoard com.apple.ControlCenter Cannot set visibility with identifier 'com.apple.replaykit.VideoConferenceControlCenterModule' as it's already NO
   10:28:14.164 +   9 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Active camera/microphone activity changed:
{(
    <SBSensorActivityAttribution: 0x798885290; displ
   10:28:14.164 +   9 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Turning on...
   10:28:14.164 +   9 ms SpringBoard com.apple.SpringBoard [Recording Indicator] Registering SystemAperture element
   10:28:14.164 +   9 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element dwell time satisfied changed: NO; oldValue: YES
   10:28:14.164 +   9 ms SpringBoard com.apple.SpringBoard [Recording Indicator] element MOT changed: NO; oldValue: YES
   10:28:14.164 +   9 ms SpringBoard com.apple.SystemAperture Asked to register element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SBRecordingIndica
   10:28:14.164 +   9 ms SpringBoard com.apple.SystemAperture Attempt to uniquely identify element that already has a unique identifier – ignoring: element: <SBRecordingIndicatorSyst
   10:28:14.164 +   9 ms SpringBoard com.apple.SystemAperture Created assertion (<SAUIElementAssertion: 0x786cd4ac0>) for element: <SBRecordingIndicatorSystemApertureElement: 0x789ed
   10:28:14.164 +   9 ms SpringBoard com.apple.SystemAperture Asked to add view controller for element: <SBRecordingIndicatorSystemApertureElement: 0x789edf7e0; elementIdentifier: SB
   10:28:14.164 +   9 ms SpringBoard com.apple.SpringBoard <BSCompoundAssertion:0x7898bb200> (SBSecureIndicatorBacklightCoordinator) acquire for reason:SBRecordingIndicatorViewCon
   10:28:14.164 +   9 ms SpringBoard com.apple.SpringBoard [Recording Indicator] updating live rendering assertion... hasSecureIndicator: YES, isActive: YES, windowScene: <private
   10:28:14.164 +   9 ms SpringBoard com.apple.BacklightServices 0x78b2ac7e0 will acquire assertion:<BLSAssertion: 0x798b02990; state: requestAcquire; requested: 37563292780595 approx:1
   10:28:14.165 +  10 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when the main run loop is idle
   10:28:14.165 +  10 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier run loop observer fired
   10:28:14.165 +  10 ms VoiceKernelHarness com.apple.dt.xctest Idle notifier finished setting up run loop observer
   10:28:14.165 +  10 ms VoiceKernelHarness com.apple.dt.xctest Sending main run loop idle reply
   10:28:14.165 +  10 ms VoiceKernelHarness  observedProcessStatesDidChange
   10:28:14.166 +  10 ms VoiceKernelHarness com.apple.runningboard Received state update for 64043 (app<life.soullab.voicekernel.k00(A0AFFB49-C4EB-406C-8DBC-CA2571CA2C52)>, unknown-NotVis
   10:28:14.166 +  11 ms VoiceKernelHarness com.apple.dt.xctest Received request to notify when animations are idle
