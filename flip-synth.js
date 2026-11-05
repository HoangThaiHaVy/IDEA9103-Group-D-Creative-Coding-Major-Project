// ========================================
// AUDIO MECHANIC – FLIP SOUNDS (Zicen)
// ========================================
// Sounds for the handstands, synthesised live in the browser with p5.sound –
// no audio files:
//   • every dancer owns one note of the C-major pentatonic scale, so a
//     handstand wave plays a rising xylophone run (C D E G A) from left to right,
//     and random solo flips during the song add single notes;
//   • when the whole row is upside down, a "Ta-da!" chord (short G major,
//     then a held C major) celebrates the curtain call.
// A xylophone bar sounds like a sine wave plus a quieter overtone about four
// times higher that dies away faster, so each note uses two oscillators with
// two envelopes.
// References: https://p5js.org/reference/p5.sound/p5.Oscillator/
//             https://p5js.org/reference/p5.sound/p5.Envelope/
// AI acknowledgement: written with help from Claude; Zicen chose the scale,
// the chord and when they play.

// C-major pentatonic, one note per dancer (red, yellow, green, blue, pink).
const FLIP_NOTES = [523.25, 587.33, 659.25, 783.99, 880.0];
const XYLOPHONE_OVERTONE = 3.93; // ratio of a wooden bar's first overtone
const XYLOPHONE_VOLUME = 0.28;
const TA_CHORD = [392.0, 493.88, 587.33]; // G major (G4 B4 D5)
const DA_CHORD = [523.25, 659.25, 783.99, 1046.5]; // C major (C5 E5 G5 C6)
const CHORD_VOLUME = 0.09; // per oscillator, four play at once

class FlipSynth {
  constructor() {
    this.voices = [];
    this.nextVoice = 0;
    this.chordVoices = [];
    this.ready = false;
  }

  // Oscillators can only start once the browser allows audio, so they are
  // created on the first sound instead of in setup().
  prepare() {
    if (this.ready) return true;
    if (getAudioContext().state !== 'running') return false;
    // A small pool of xylophone voices lets quick notes overlap.
    for (let i = 0; i < 6; i += 1) {
      this.voices.push({
        body: this.createOscillator('sine'),
        overtone: this.createOscillator('sine'),
        bodyEnvelope: this.createEnvelope(0.002, 0.45, XYLOPHONE_VOLUME),
        overtoneEnvelope: this.createEnvelope(0.001, 0.08, XYLOPHONE_VOLUME * 0.35)
      });
    }
    for (let i = 0; i < DA_CHORD.length; i += 1) {
      this.chordVoices.push({
        oscillator: this.createOscillator('triangle'),
        envelope: new p5.Envelope()
      });
    }
    this.ready = true;
    return true;
  }

  createOscillator(type) {
    const oscillator = new p5.Oscillator(type);
    oscillator.amp(0);
    oscillator.start();
    return oscillator;
  }

  // Percussive envelope: quick attack, decay to silence, no sustain.
  createEnvelope(attack, decay, level) {
    const envelope = new p5.Envelope();
    envelope.setADSR(attack, decay, 0, 0.05);
    envelope.setRange(level, 0);
    return envelope;
  }

  playNote(dancerIndex) {
    if (!this.prepare()) return;
    const frequency = FLIP_NOTES[dancerIndex % FLIP_NOTES.length];
    const voice = this.voices[this.nextVoice];
    this.nextVoice = (this.nextVoice + 1) % this.voices.length;
    voice.body.freq(frequency);
    voice.overtone.freq(frequency * XYLOPHONE_OVERTONE);
    voice.bodyEnvelope.play(voice.body);
    voice.overtoneEnvelope.play(voice.overtone);
  }

  // "Ta" (short) then "Da" (held, a little louder).
  playTaDa() {
    if (!this.prepare()) return;
    this.playChord(TA_CHORD, 0.08, CHORD_VOLUME * 0.8);
    setTimeout(() => this.playChord(DA_CHORD, 0.9, CHORD_VOLUME), 170);
  }

  playChord(frequencies, holdSeconds, level) {
    this.chordVoices.forEach((voice, index) => {
      if (index >= frequencies.length) return;
      voice.oscillator.freq(frequencies[index]);
      voice.envelope.setADSR(0.01, 0.12, 0.7, 0.6);
      voice.envelope.setRange(level, 0);
      // play(unit, startDelay, sustainTime)
      voice.envelope.play(voice.oscillator, 0, holdSeconds);
    });
  }
}
