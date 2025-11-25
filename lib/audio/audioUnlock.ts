/**
 * Unlocks audio context for mobile browsers
 * Mobile browsers require user interaction to play audio
 */
export async function unlockAudioContext() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();

    // Create a silent buffer
    const buffer = audioContext.createBuffer(1, 1, 22050);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);

    // Play the silent buffer
    if (source.start) {
      source.start(0);
    } else if ((source as any).noteOn) {
      (source as any).noteOn(0);
    }

    // Resume if suspended
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    return audioContext;
  } catch (error) {
    console.error('Failed to unlock audio context:', error);
    return null;
  }
}