#!/usr/bin/env python3
"""Bundle R40 fictional UI into one offline file, with no real backend.

Only owns the one named R40 review HTML artifact. No production manifest,
member Source, deployment route, network request, credentials or build change.
"""
from __future__ import annotations
import hashlib
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ASSET = ROOT / "scripts/ops/fixtures/r40"
OUTPUT = Path(
 "/Volumes/T7 Shield/ws-beta-release-r11-build-20261016/"
 "R40_FICTIONAL_WRITER_ROOM_PREVIEW_20261016.html")
CSP = ('<meta http-equiv="Content-Security-Policy" '
       'content="default-src \'none\'; script-src \'unsafe-inline\'; '
       'style-src \'unsafe-inline\'; connect-src \'none\'; '
       'img-src \'none\'; font-src \'none\'; frame-src \'none\'; '
       'form-action \'none\'; base-uri \'none\';">')


def main() -> int:
    if os.environ.get("R40_OFFLINE_BUNDLE_FIXTURE") != "fictional-only":
        raise RuntimeError("R40_FICTIONAL_ONLY_BUNDLE_REFUSED")
    html = (ASSET / "Studio.html").read_text(encoding="utf8")
    css = (ASSET / "studio.css").read_text(encoding="utf8")
    js = (ASSET / "studio.js").read_text(encoding="utf8")
    if ("R40 fictional UI rehearsal" not in html
        or "No server writing" not in html
        or "ws-r35" in js
        or any(name in js for name in
               ("fetch(", "XMLHttpRequest", "WebSocket(", "sendBeacon("))):
        raise RuntimeError("R40_UI_FIXTURE_CANNOT_CALL_REMOTE_SERVICE")
    assert html.count('<link rel="stylesheet" href="/r40.css">') == 1
    assert html.count('<script src="/r40.js"></script>') == 1
    html = html.replace('<link rel="stylesheet" href="/r40.css">',
                        CSP + "\n<style>\n" + css + "\n</style>")
    html = html.replace('<script src="/r40.js"></script>',
                        '<script>\n' + js + '\n</script>')
    if any(link in html for link in (
        'src="http', 'href="http', 'src="/r40', 'href="/r40')):
        raise RuntimeError("R40_OFFLINE_BUNDLE_HAS_EXTERNAL_ASSET")
    OUTPUT.write_text(html, encoding="utf8")
    OUTPUT.chmod(0o600)
    print("R40_OFFLINE_REVIEW_READY", OUTPUT.name)
    print("SHA256", hashlib.sha256(OUTPUT.read_bytes()).hexdigest())
    print("BYTES", OUTPUT.stat().st_size)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
