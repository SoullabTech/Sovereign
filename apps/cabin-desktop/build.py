"""Build a local, ad-hoc-signed Cabin launcher from an already available Electron.app."""
import argparse
import json
from pathlib import Path
import plistlib
import shutil
import subprocess

parser = argparse.ArgumentParser()
parser.add_argument("--electron-app", required=True, type=Path)
parser.add_argument("--output", required=True, type=Path)
args = parser.parse_args()
source = args.electron_app.resolve()
target = args.output.expanduser().absolute()
if target.exists():
    raise SystemExit("Refusing to replace an existing application: " + str(target))
if not (source / "Contents/MacOS/Electron").is_file():
    raise SystemExit("Expected an existing Electron.app")
root = Path(__file__).resolve().parents[2]
shutil.copytree(source, target, symlinks=True)
application = target / "Contents/Resources/app"
application.mkdir()
for name in ("main.cjs", "preload.cjs", "index.html", "renderer.js"):
    shutil.copy2(Path(__file__).parent / name, application / name)
shutil.copy2(root / "jarvis-desktop/src/cabin-flow.js", application / "cabin-flow.js")
(application / "package.json").write_text(json.dumps({
    "name": "soullab-cabin-launcher", "version": "0.1.0", "main": "main.cjs"
}))
info_path = target / "Contents/Info.plist"
with info_path.open("rb") as stream:
    info = plistlib.load(stream)
info.update(CFBundleName="Cabin", CFBundleDisplayName="Cabin",
            CFBundleIdentifier="life.soullab.cabin.launcher",
            CFBundleShortVersionString="0.1.0", CFBundleVersion="1")
with info_path.open("wb") as stream:
    plistlib.dump(info, stream)
subprocess.run(["codesign", "--force", "--deep", "--sign", "-", str(target)], check=True)
subprocess.run(["codesign", "--verify", "--deep", "--strict", str(target)], check=True)
print(target)
