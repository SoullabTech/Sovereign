#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(NativeAudioRecorderPlugin, "NativeAudioRecorder",
    CAP_PLUGIN_METHOD(checkAudioPermissions, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(requestAudioPermissions, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(startRecording, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stopRecording, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(isRecording, CAPPluginReturnPromise);
)
