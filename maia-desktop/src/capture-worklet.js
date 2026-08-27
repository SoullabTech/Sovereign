// MAIA Desktop — AudioWorklet capture processor.
//
// MAIA-D01. Runs on the audio render thread and does exactly one thing: hand
// each block of mono PCM to the main thread. No recognition, no interpretation,
// no accumulation — it is the point at which the member's voice becomes OWNED
// AUDIO FRAMES, and nothing more.
//
// ⛔ There is no SpeechRecognition here and there cannot be: this context has no
// window and no access to the Web Speech API at all.
class MaiaCaptureProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (input && input[0] && input[0].length) {
      // Copy: the underlying buffer is reused by the audio thread on the next
      // block, so posting it directly would deliver silently-mutated frames.
      this.port.postMessage(Float32Array.from(input[0]));
    }
    return true;
  }
}
registerProcessor('maia-capture', MaiaCaptureProcessor);
