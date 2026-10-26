// Audio mechanic module.
// Reads microphone input and exposes normalised values to the shared scene.

class AudioMechanic {
  constructor() {
    this.mic = new p5.AudioIn();
    this.amplitude = new p5.Amplitude(0.85);
    this.fft = new p5.FFT(0.8, 64);
    this.started = false;
    this.error = false;
  }

  startAudio(onReady, onError) {
    userStartAudio();
    this.mic.start(
      () => {
        this.amplitude.setInput(this.mic);
        this.fft.setInput(this.mic);
        this.started = true;
        this.error = false;
        if (onReady) onReady();
      },
      () => {
        this.error = true;
        if (onError) onError();
      }
    );
  }

  getSoundData() {
    if (!this.started) {
      return { intensity: 0, bass: 0, treble: 0 };
    }

    this.fft.analyze();
    const rawVolume = this.amplitude.getLevel();

    return {
      intensity: constrain(map(rawVolume, 0.002, 0.035, 0, 1), 0, 1),
      bass: this.fft.getEnergy('bass') / 255,
      treble: this.fft.getEnergy('treble') / 255
    };
  }

  stopAudio() {
    if (this.started) this.mic.stop();
    this.started = false;
  }
}
