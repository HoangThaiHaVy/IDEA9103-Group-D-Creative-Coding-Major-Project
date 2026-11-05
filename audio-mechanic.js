// Audio mechanic module.
// Reads microphone input and exposes normalised values to the shared scene.
// Developed with assistance from OpenAI Codex. p5.AudioIn, p5.Amplitude, and
// p5.FFT provide microphone level and frequency-band values used by the scene.

class AudioMechanic {
  constructor() {
    this.mic = new p5.AudioIn();
    this.amplitude = new p5.Amplitude(0.85);
    this.fft = new p5.FFT(0.8, 64);
    this.started = false;
    this.error = false;
    this.previousClapEnergy = 0;
    this.lastClapAt = -Infinity;
    this.previousMid = 0;
    this.previousHighMid = 0;
    this.voiceSustain = 0;
    this.lastAnalysisAt = null;
    this.spreadAmount = 0.88;
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
      return {
        intensity: 0,
        bass: 0,
        mid: 0,
        treble: 0,
        singing: false,
        speaking: false,
        longSound: false,
        shortSound: false,
        sustain: 0,
        spread: 0.88,
        clap: false
      };
    }

    this.fft.analyze();
    const rawVolume = this.amplitude.getLevel();
    const bass = this.fft.getEnergy('bass') / 255;
    const mid = this.fft.getEnergy('mid') / 255;
    const highMid = this.fft.getEnergy('highMid') / 255;
    const treble = this.fft.getEnergy('treble') / 255;
    const intensity = constrain(map(rawVolume, 0.002, 0.035, 0, 1), 0, 1);

    // A clap is a short, broadband transient rather than simply a loud sound.
    // The cooldown prevents one clap from changing poses across several frames.
    const clapEnergy = intensity * 0.45 + highMid * 0.35 + treble * 0.2;
    const now = millis();
    const clap = clapEnergy - this.previousClapEnergy > 0.07 &&
      clapEnergy > 0.16 && now - this.lastClapAt > 320;
    this.previousClapEnergy = lerp(this.previousClapEnergy, clapEnergy, 0.38);
    if (clap) this.lastClapAt = now;

    // Singing tends to hold a voiced spectrum steadily, while speech changes
    // its mid-frequency shape more quickly from syllable to syllable. This is
    // an intentionally simple live-microphone classifier, not speech AI.
    const deltaSeconds = this.lastAnalysisAt === null
      ? 0
      : constrain((now - this.lastAnalysisAt) / 1000, 0, 0.1);
    this.lastAnalysisAt = now;
    const spectralChange = abs(mid - this.previousMid) +
      abs(highMid - this.previousHighMid);
    this.previousMid = mid;
    this.previousHighMid = highMid;
    const voiceActive = intensity > 0.07 && mid + highMid > 0.14;

    if (voiceActive && spectralChange < 0.13 && !clap) {
      this.voiceSustain = min(this.voiceSustain + deltaSeconds, 1);
    } else {
      this.voiceSustain = max(this.voiceSustain - deltaSeconds * 1.8, 0);
    }

    const singing = voiceActive && this.voiceSustain > 0.28 && !clap;
    const speaking = voiceActive && !singing && !clap;
    const longSound = voiceActive && this.voiceSustain > 0.42 && !clap;
    const shortSound = clap;

    // Bright sounds spread the group; bass-heavy sounds gather it. The hard
    // lower bound preserves a readable gap between neighbouring characters.
    const spectralTotal = bass + mid + highMid + treble + 0.08;
    const brightness = (highMid + treble + 0.04) / spectralTotal;
    const spreadTarget = voiceActive
      ? constrain(map(brightness, 0.18, 0.72, 0.72, 1), 0.72, 1)
      : 0.88;
    this.spreadAmount = lerp(this.spreadAmount, spreadTarget, 0.055);

    return {
      intensity,
      bass,
      mid,
      treble,
      singing,
      speaking,
      longSound,
      shortSound,
      sustain: this.voiceSustain,
      spread: this.spreadAmount,
      clap
    };
  }

  stopAudio() {
    if (this.started) this.mic.stop();
    this.started = false;
  }
}
