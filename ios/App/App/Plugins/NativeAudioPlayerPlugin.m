#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(NativeAudioPlayerPlugin, "NativeAudioPlayer",
  CAP_PLUGIN_METHOD(playBase64, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(stop, CAPPluginReturnPromise);
)
