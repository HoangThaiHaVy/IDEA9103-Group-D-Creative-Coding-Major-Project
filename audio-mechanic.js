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
  tripleClap: false,
  humming: false,
  humProgress: 0,
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
const MIN_SPREAD = 0.4; // tight huddle (1 = full width of the row)
const MAX_SPREAD = 1;

// TONE BALANCE (bass / mid / treble). p5.FFT gives absolute, decibel-scaled
// values, so a quiet microphone made treble read almost 0 and every sound
// looked "bassy". Instead the mechanic measures the *balance* of the sound,
// which does not depend on how loud it is:
//   treble = spectral centroid (the frequency where the energy is centred,
//            on a log scale) mapped from 250 Hz (dark) to 2000 Hz (bright);
//   bass   = share of energy below 250 Hz;  mid = share from 250 Hz to 2 kHz.
// Measured centroids: funky drum track ≈ 140 Hz, standby song 225–805 Hz,
// soprano ≈ 1250 Hz, whistle ≈ 2500 Hz (the same at 1/10 of the volume).
// Reference (spectral centroid): https://en.wikipedia.org/wiki/Spectral_centroid
const BALANCE_SETTINGS = {
  darkCentroid: 250,
  brightCentroid: 2000,
  bassShareRange: [0.15, 0.85],
  midShareRange: [0.1, 0.7],
  smoothing: 0.3
};
const TRIPLE_CLAP_WINDOW = 1500; // ms in which three short sounds count as a combo

// HUM DETECTION (builds the human tower). Music is also continuous, so a hum
// is recognised by three things music rarely has at the same time:
//   1. one steady pitch – the loudest frequency stays in the same FFT bin;
//   2. a concentrated spectrum – most energy sits in a few bins (a voice's
//      note and its harmonics) instead of being spread by many instruments;
//   3. no beat – nothing percussive has been heard for a short moment.
// The thresholds were measured with a synthetic hum, the two soundtracks,
// Emery's song and Vy's rain: a hum kept a steady pitch for over 1 s in 81%
// of frames, the background song and Emery's song in 0%.
const HUM_SETTINGS = {
  minIntensity: 0.1,
  minConcentration: 0.9, // share of energy in the 12 strongest bins
  minSteadyPitch: 0.25, // seconds the loudest bin must stay put
  quietAfterBeat: 0.45, // seconds since the last percussive onset
  secondsToBuild: 3, // holding the hum this long completes the tower
  decayRate: 1.2 // how fast progress falls back when the hum stops
};

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
    this.recentShortSounds = []; // timestamps used for the triple-clap combo
    this.previousMid = 0;
    this.previousHighMid = 0;
    this.voiceSustain = 0;
    this.lastAnalysisAt = null;
    this.spreadAmount = SILENT_SOUND_DATA.spread;
    this.balance = { bass: 0, mid: 0, treble: 0 };
    this.averageTilt = 0; // slow average of (treble − bass) for the spread
    // Hum detection memory.
    this.lastOnsetAt = -Infinity;
    this.dominantBin = -1;
    this.pitchSteadySince = 0;
    this.humHold = 0; // seconds of hum collected towards the tower
    // Only the visitor's microphone may build the tower; tests can allow the
    // track source so a recorded hum can be checked automatically.
    this.allowHumFromTrack = false;
  }

  // 1024 bins (about 21 Hz each) are fine enough to follow the pitch of a hum.
  createAnalyserPair() {
    return {
      amplitude: new p5.Amplitude(0.85),
      fft: new p5.FFT(0.8, 1024)
    };
  }

  resetHum() {
    this.humHold = 0;
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

  // Volume-independent tone balance of one FFT frame (see BALANCE_SETTINGS).
  measureBalance(spectrum) {
    const nyquist = sampleRate() / 2;
    let total = 0;
    let weightedLogFrequency = 0;
    let low = 0;
    let middle = 0;
    for (let i = 1; i < spectrum.length; i += 1) {
      const frequency = i * nyquist / spectrum.length;
      if (frequency < 40 || frequency > 8000) continue;
      // Decibel-like byte → linear energy (minus the silent floor of 1).
      const energy = pow(10, spectrum[i] * 0.0275) - 1;
      total += energy;
      weightedLogFrequency += energy * Math.log2(frequency);
      if (frequency < 250) low += energy;
      else if (frequency < 2000) middle += energy;
    }
    if (total <= 0) return { bass: 0, mid: 0, treble: 0 };
    const centroid = pow(2, weightedLogFrequency / total);
    const { darkCentroid, brightCentroid, bassShareRange, midShareRange } = BALANCE_SETTINGS;
    return {
      treble: constrain(map(Math.log2(centroid), Math.log2(darkCentroid), Math.log2(brightCentroid), 0, 1), 0, 1),
      bass: constrain(map(low / total, bassShareRange[0], bassShareRange[1], 0, 1), 0, 1),
      mid: constrain(map(middle / total, midShareRange[0], midShareRange[1], 0, 1), 0, 1)
    };
  }

  // Returns true while the spectrum looks like one held, steady note.
  detectHum(spectrum, intensity, now) {
    const nyquist = sampleRate() / 2;
    const binFor = (frequency) => round(frequency / nyquist * spectrum.length);

    // Loudest bin between 80 Hz and 1 kHz = the pitch of the hum.
    let loudestValue = -1;
    let loudestBin = 0;
    for (let i = binFor(80); i <= binFor(1000); i += 1) {
      if (spectrum[i] > loudestValue) {
        loudestValue = spectrum[i];
        loudestBin = i;
      }
    }
    // Allow one bin of wobble (natural vibrato) before counting a new pitch.
    if (abs(loudestBin - this.dominantBin) > 1) {
      this.dominantBin = loudestBin;
      this.pitchSteadySince = now;
    }

    // p5.FFT returns decibel-like values 0–255; pow(10, v * 0.0275) turns them
    // back into linear energy (about 70 dB range) so the shares are meaningful.
    const energies = [];
    for (let i = binFor(80); i <= binFor(4000); i += 1) {
      energies.push(pow(10, spectrum[i] * 0.0275));
    }
    const totalEnergy = energies.reduce((sum, value) => sum + value, 0);
    const strongestEnergy = [...energies].sort((a, b) => b - a)
      .slice(0, 12)
      .reduce((sum, value) => sum + value, 0);
    const concentration = totalEnergy > 0 ? strongestEnergy / totalEnergy : 0;

    return intensity > HUM_SETTINGS.minIntensity &&
      concentration > HUM_SETTINGS.minConcentration &&
      (now - this.pitchSteadySince) / 1000 > HUM_SETTINGS.minSteadyPitch &&
      (now - this.lastOnsetAt) / 1000 > HUM_SETTINGS.quietAfterBeat;
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

    const spectrum = fft.analyze();
    const rawVolume = amplitude.getLevel();
    // Raw band energies are still used for clap detection (a sharp jump in
    // high frequencies), which was tuned with them.
    const highMid = fft.getEnergy('highMid') / 255;
    const rawTreble = fft.getEnergy('treble') / 255;
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
    const clapEnergy = intensity * 0.45 + highMid * 0.35 + rawTreble * 0.2;

    // Tone balance (volume independent), only updated while there is sound.
    if (intensity > 0.05) {
      const measured = this.measureBalance(spectrum);
      for (const key of ['bass', 'mid', 'treble']) {
        this.balance[key] = lerp(this.balance[key], measured[key], BALANCE_SETTINGS.smoothing);
      }
    } else {
      for (const key of ['bass', 'mid', 'treble']) {
        this.balance[key] = lerp(this.balance[key], 0, 0.1);
      }
    }
    const { bass, mid, treble } = this.balance;
    const onset = clapEnergy - this.previousClapEnergy > 0.07 && clapEnergy > 0.16;
    if (onset) this.lastOnsetAt = now; // every percussive hit, for hum detection
    const shortSound = onset && now - this.lastClapAt > levelRange.shortSoundCooldown;
    this.previousClapEnergy = lerp(this.previousClapEnergy, clapEnergy, 0.38);
    if (shortSound) this.lastClapAt = now;

    // TRIPLE CLAP (easter egg): three short sounds inside 1.5 s. Only the
    // microphone can do this – the soundtrack's 1 s cooldown is too slow.
    let tripleClap = false;
    if (shortSound) {
      this.recentShortSounds.push(now);
      this.recentShortSounds = this.recentShortSounds
        .filter((time) => now - time < TRIPLE_CLAP_WINDOW);
      if (this.recentShortSounds.length >= 3) {
        tripleClap = true;
        this.recentShortSounds = [];
      }
    }

    // LONG SOUND: humming or a held note keeps a steady mid-range spectrum,
    // while speech and drums change it quickly. "voiceSustain" fills up while
    // the spectrum is steady and drains when it changes. This is a simple
    // hand-made classifier, not speech recognition.
    const spectralChange = abs(mid - this.previousMid) +
      abs(treble - this.previousHighMid);
    this.previousMid = mid;
    this.previousHighMid = treble;
    const voiceActive = intensity > 0.07;

    if (voiceActive && spectralChange < 0.13 && !shortSound) {
      this.voiceSustain = min(this.voiceSustain + deltaSeconds, 1);
    } else {
      this.voiceSustain = max(this.voiceSustain - deltaSeconds * 1.8, 0);
    }
    const longSound = voiceActive && this.voiceSustain > 0.42 && !shortSound;

    // SPREAD: bright sounds throw the row wide open, dark / bass-heavy sounds
    // pull the dancers into a tight huddle. Two parts:
    //   • the overall tone (treble − bass), so a whistle and a bass hum differ;
    //   • how much brighter or darker it is than the last ~4 s, so the row
    //     keeps opening and closing inside one song as well.
    const tilt = treble - bass;
    this.averageTilt = lerp(this.averageTilt, tilt, constrain(deltaSeconds / 4, 0, 1));
    const tiltScore = tilt * 0.3 + (tilt - this.averageTilt) * 1.6;
    const spreadTarget = voiceActive
      ? constrain(map(tiltScore, -0.35, 0.35, MIN_SPREAD, MAX_SPREAD), MIN_SPREAD, MAX_SPREAD)
      : SILENT_SOUND_DATA.spread;
    this.spreadAmount = lerp(this.spreadAmount, spreadTarget, 0.15);

    const humming = this.detectHum(spectrum, intensity, now) &&
      (this.source === 'mic' || this.allowHumFromTrack);
    this.humHold = humming
      ? min(this.humHold + deltaSeconds, HUM_SETTINGS.secondsToBuild)
      : max(this.humHold - deltaSeconds * HUM_SETTINGS.decayRate, 0);

    return {
      intensity,
      bass,
      mid,
      treble,
      longSound,
      shortSound,
      tripleClap,
      humming,
      humProgress: this.humHold / HUM_SETTINGS.secondsToBuild,
      sustain: this.voiceSustain,
      spread: this.spreadAmount
    };
  }
}
