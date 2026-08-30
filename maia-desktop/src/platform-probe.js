'use strict';
// The negative proof. If either request SUCCEEDS, the wall is broken and the
// Companion may not proceed — a platform surface that can open the microphone
// has taken voice authority away from main, which is prohibition P1.
async function probe(kind, constraints, el) {
  const node = document.getElementById(el);
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    stream.getTracks().forEach((t) => t.stop());
    node.textContent = kind + ': GRANTED — ⛔ WALL BROKEN';
    node.className = 'r fail';
    return { kind, granted: true };
  } catch (err) {
    node.textContent = kind + ': DENIED (' + (err && err.name) + ') — wall holds';
    node.className = 'r pass';
    return { kind, granted: false, error: String(err && err.name || err) };
  }
}
(async () => {
  const mic = await probe('microphone', { audio: true }, 'mic');
  const cam = await probe('camera', { video: true }, 'cam');
  const verdict = { mic, cam, wallHolds: !mic.granted && !cam.granted };
  if (window.maiaPlatform) window.maiaPlatform.reportProbe(verdict);
})();
