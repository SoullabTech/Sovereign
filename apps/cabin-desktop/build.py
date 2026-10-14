"""Package Cabin with a self-contained Node runtime and local workspace."""
import argparse, json, plistlib, shutil, subprocess
from pathlib import Path
parser=argparse.ArgumentParser()
parser.add_argument("--electron-app",required=True,type=Path)
parser.add_argument("--output",required=True,type=Path)
parser.add_argument("--node",required=True,type=Path)
args=parser.parse_args()
source=args.electron_app.resolve()
target=args.output.expanduser().absolute()
if target.exists(): raise SystemExit("Refusing to replace an existing application")
if not (source/"Contents/MacOS/Electron").is_file(): raise SystemExit("Expected Electron application")
root=Path(__file__).resolve().parents[2]
shutil.copytree(source,target,symlinks=True)
application=target/"Contents/Resources/app"
if application.exists(): shutil.rmtree(application)
application.mkdir()
for name in ("main.cjs","preload.cjs","workspace-preload.cjs","index.html","renderer.js"):
 shutil.copy2(Path(__file__).parent/name,application/name)
shutil.copy2(root/"jarvis-desktop/src/cabin-flow.js",application/"cabin-flow.js")
shutil.copy2(Path(__file__).parent/"assets/cabin-icon.png",application/"Cabin.png")
(application/"package.json").write_text(json.dumps({"name":"soullab-cabin","version":"0.2.1","main":"main.cjs"}))
runtime=application/"runtime"
runtime.mkdir()
shutil.copy2(args.node.resolve(),runtime/"node")
(runtime/"node").chmod(0o755)
subprocess.run([str(args.node),"-e",
 "require('esbuild').buildSync({entryPoints:['apps/cabin-desktop/runtime.ts'],bundle:true,platform:'node',format:'cjs',target:'node22',outfile:process.argv[1]})",
 str(runtime/"server.cjs")],cwd=root,check=True)
for name in ("workspace.html","workspace.js","workspace.css"):
 shutil.copy2(Path(__file__).parent/name,runtime/name)
shutil.copy2(Path(__file__).parent/"assets/cabin-icon.png",runtime/"Cabin.png")
info_path=target/"Contents/Info.plist"
with info_path.open("rb") as stream: info=plistlib.load(stream)
shutil.copy2(Path(__file__).parent/"assets/Cabin.icns",target/"Contents/Resources/Cabin.icns")
shutil.copy2(Path(__file__).parent/"assets/cabin-icon.png",target/"Contents/Resources/Cabin.png")
info.update(CFBundleIconFile="Cabin.icns",CFBundleName="Cabin",CFBundleDisplayName="Cabin",
 CFBundleIdentifier="life.soullab.cabin.launcher",CFBundleShortVersionString="0.2.1",CFBundleVersion="3")
with info_path.open("wb") as stream: plistlib.dump(info,stream)
subprocess.run(["codesign","--force","--sign","-",str(runtime/"node")],check=True)
subprocess.run(["codesign","--force","--deep","--sign","-",str(target)],check=True)
subprocess.run(["codesign","--verify","--deep","--strict",str(target)],check=True)
print(target)
