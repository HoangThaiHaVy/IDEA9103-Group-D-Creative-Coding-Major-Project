// ========================================
// AUDIO MECHANIC – SOUND ANALYSIS (Zicen)
// ========================================
// Reads either the finale soundtrack or the live microphone and turns it into a
// small set of normalised (0–1), smoothed values that the rest of the scene can
// use without knowing anything about p5.sound.
//
// p5.Amplitude measures overall loudness and p5.FFT splits the signal into
// frequency bands (bass / mid / highMid / treble).
// Reference: https://p5js.org/reference/p5.sound/p5.FFT/
//            https://p5js.org/reference/p5.sound/p5.Amplitude/
//
// AI acknowledgement: this module was developed with help from OpenAI Codex
// (first microphone version) and Claude (final review: separate analysers for
// the soundtrack and the microphone, shared silent data). Zicen chose every
// sound-to-movement mapping and tuned the thresholds by testing.

// Values used whenever nothing is being analysed. Every consumer receives the
// same shape of object, so no drawing code has to check for "audio is off".
const SILENT_SOUND_DATA = Object.freeze({
  intensity: 0,
  bass: 0,
  mid: 0,
  treble: 0,
  longSound: false,
  shortSound: false,
  sustain: 0,
  spread: 0.92
});

function createSilentSoundData() {
  return { ...SILENT_SOUND_DATA };
}

// A microphone signal is much quieter than a decoded music file, so each
// source has its own loudness range that is mapped to intensity 0–1.
// Short-sound cooldowns also differ: a clap from the visitor should answer
// immediately, while the soundtrack hits a drum on almost every beat, so it
// only changes pose about once per bar to avoid flickering.
const SOURCE_LEVEL_RANGE = {
  mic: { quiet: 0.002, loud: 0.035, shortSoundCooldown: 320 },
  track: { quiet: 0.02, loud: 0.2, shortSoundCooldown: 1000 }
};
const MIN_SPREAD = 0.72; // closest the row may gather (1 = full width)

class AudioMechanic {
  constructor() {
    this.mic = new p5.AudioIn();
    this.micReady = false;

    // p5.Amplitude/p5.FFT keep every input they were ever connected to, so a
    // separate analyser pair per source stops the track and the microphone
    // from being mixed together after a switch.
    this.analysers = {
      track: this.createAnalyserPair(),
      mic: this.createAnalyserPair()
    };
    this.source = null; // 'track', 'mic' or null (silent)
    this.connectedTrack = null;

    // Memory used to detect changes between frames.
    this.previousClapEnergy = 0;
    this.lastClapAt = -Infinity;
    this.previousMid = 0;
    this.previousHighMid = 0;
    this.voiceSustain = 0;
    this.lastAnalysisAt = null;
    this.spreadAmount = SILENT_SOUND_DATA.spread;
  }

  createAnalyserPair() {
    return {
      amplitude: new p5.Amplitude(0.85),
      fft: new p5.FFT(0.8, 64)
    };
  }

  // True whenever some source is currently driving the dancers.
  get started() {
    return this.source !== null;
  }

  useTrack(soundFile) {
    if (!soundFile) return;
    if (this.connectedTrack !== soundFile) {
      this.analysers.track.amplitude.setInput(soundFile);
      this.analysers.track.fft.setInput(soundFile);
      this.connectedTrack = soundFile;
    }
    this.source = 'track';
  }

  // Asks the browser for microphone permission. Once granted the microphone
  // becomes the active source; onReady/onError update the on-page status text.
  startMicrophone(onReady, onError) {
    userStartAudio();
    this.mic.start(
      () => {
        this.analysers.mic.amplitude.setInput(this.mic);
        this.analysers.mic.fft.setInput(this.mic);
        this.micReady = true;
        this.source = 'mic';
        if (onReady) onReady();
      },
      () => {
        if (onError) onError();
      }
    );
  }

  useMicrophone() {
    if (!this.micReady) return false;
    this.source = 'mic';
    return true;
  }

  stopAudio() {
    if (this.micReady) this.mic.stop();
    this.micReady = false;
    this.source = null;
  }

  getSoundData() {
    if (!this.started) return createSilentSoundData();

    const { amplitude, fft } = this.analysers[this.source];
    const levelRange = SOURCE_LEVEL_RANGE[this.source];

    fft.analyze();
    const rawVolume = amplitude.getLevel();
    const bass = fft.getEnergy('bass') / 255;
    const mid = fft.getEnergy('mid') / 255;
    const highMid = fft.getEnergy('highMid') / 255;
    const treble = fft.getEnergy('treble') / 255;
    const intensity = constrain(
      map(rawVolume, levelRange.quiet, levelRange.loud, 0, 1),
      0,
      1
    );

    const now = millis();
    const deltaSeconds = this.lastAnalysisAt === null
      ? 0
      : constrain((now - this.lastAnalysisAt) / 1000, 0, 0.1);
    this.lastAnalysisAt = now;

    // SHORT SOUND: a clap or drum hit is a sudden broadband jump, not simply a
    // loud sound. The cooldown stops one hit from counting twice.
    const clapEnergy = intensity * 0.45 + highMid * 0.35 + treble * 0.2;
    const shortSound = clapEnergy - this.previousClapEnergy > 0.07 &&
      clapEnergy > 0.16 && now - this.lastClapAt > levelRange.shortSoundCooldown;
    this.previousClapEnergy = lerp(this.previousClapEnergy, clapEnergy, 0.38);
    if (shortSound) this.lastClapAt = now;

    // LONG SOUND: humming or a held note keeps a steady mid-range spectrum,
    // while speech and drums change it quickly. "voiceSustain" fills up while
    // the spectrum is steady and drains when it changes. This is a simple
    // hand-made classifier, not speech recognition.
    const spectralChange = abs(mid - this.previousMid) +
      abs(highMid - this.previousHighMid);
    this.previousMid = mid;
    this.previousHighMid = highMid;
    const voiceActive = intensity > 0.07 && mid + highMid > 0.14;

    if (voiceActive && spectralChange < 0.13 && !shortSound) {
      this.voiceSustain = min(this.voiceSustain + deltaSeconds, 1);
    } else {
      this.voiceSustain = max(this.voiceSustain - deltaSeconds * 1.8, 0);
    }
    const longSound = voiceActive && this.voiceSustain > 0.42 && !shortSound;

    // SPREAD: bright sounds open the row of dancers; bass-heavy sounds pull
    // them closer together. The range MIN_SPREAD–1 keeps them inside the
    // canvas, lets their hands overlap only slightly and keeps the campfire visible.
    const spectralTotal = bass + mid + highMid + treble + 0.08;
    const brightness = (highMid + treble + 0.04) / spectralTotal;
    const spreadTarget = voiceActive
      ? constrain(map(brightness, 0.28, 0.58, MIN_SPREAD, 1), MIN_SPREAD, 1)
      : SILENT_SOUND_DATA.spread;
    this.spreadAmount = lerp(this.spreadAmount, spreadTarget, 0.12);

    return {
      intensity,
      bass,
      mid,
      treble,
      longSound,
      shortSound,
      sustain: this.voiceSustain,
      spread: this.spreadAmount
    };
  }
}
