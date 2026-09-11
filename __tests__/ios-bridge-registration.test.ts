/**
 * IOS-CONVERSATION-RUNTIME-01 · gate for the one authorized repair
 * (founder ruling 2026-09-11, lane doc E5).
 *
 * Finding (E2/E3): `cap sync` regenerates `packageClassList` from npm
 * plugins only, so the in-app `AudioSessionManager` plugin declared in
 * `capacitor.config.ts` was compiled into every build and never registered
 * with the Capacitor bridge. `/maia` never reached `AudioSessionManager.swift`.
 *
 * Repair: a `CAPBridgeViewController` subclass registers the plugin in
 * `capacitorDidLoad()` and the storyboard instantiates that subclass. Both
 * files are outside `cap sync`'s reach, so the registration survives it.
 *
 * Boundary: `VoiceController` is NOT registered by this act.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const root = join(__dirname, '..');
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');

describe('iOS bridge registration — AudioSessionManager reaches the runtime', () => {
  const vc = read('ios/App/App/MAIABridgeViewController.swift');
  const storyboard = read('ios/App/App/Base.lproj/Main.storyboard');
  const pbxproj = read('ios/App/App.xcodeproj/project.pbxproj');

  it('subclasses CAPBridgeViewController and registers AudioSessionManager in capacitorDidLoad', () => {
    expect(vc).toMatch(/class MAIABridgeViewController\s*:\s*CAPBridgeViewController/);
    expect(vc).toMatch(/override open func capacitorDidLoad\(\)/);
    expect(vc).toMatch(/bridge\?\.registerPluginInstance\(AudioSessionManager\(\)\)/);
  });

  it('does NOT register VoiceController in the same act (ruling boundary)', () => {
    expect(vc).not.toMatch(/registerPlugin(Instance|Type)\(VoiceController/);
  });

  it('storyboard instantiates the subclass from the app module', () => {
    expect(storyboard).toMatch(/customClass="MAIABridgeViewController"/);
    expect(storyboard).toMatch(/customModule="App" customModuleProvider="target"/);
    expect(storyboard).not.toMatch(/customClass="CAPBridgeViewController"/);
  });

  it('the subclass is in the Xcode Sources phase (compiles into the app)', () => {
    expect(pbxproj).toMatch(/MAIABridgeViewController\.swift in Sources \*\/ = \{isa = PBXBuildFile;/);
    expect(pbxproj).toMatch(/path = MAIABridgeViewController\.swift;/);
    const sources = pbxproj.slice(
      pbxproj.indexOf('/* Begin PBXSourcesBuildPhase section */'),
      pbxproj.indexOf('/* End PBXSourcesBuildPhase section */'),
    );
    expect(sources).toMatch(/MAIABridgeViewController\.swift in Sources/);
    expect(sources).toMatch(/AudioSessionManager\.swift in Sources/);
  });

  it('the plugin the subclass registers is the one the web layer binds by name', () => {
    const swift = read('ios/App/App/AudioSessionManager.swift');
    const web = read('lib/voice/AudioSessionManager.ts');
    expect(swift).toMatch(/public let jsName = "AudioSessionManager"/);
    expect(web).toMatch(/registerPlugin<AudioSessionManagerPlugin>\(\s*'AudioSessionManager'/);
  });
});
