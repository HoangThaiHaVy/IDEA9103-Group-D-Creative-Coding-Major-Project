// ========================================
// AUDIO MECHANIC – SOUND PANEL (Zicen)
// ========================================
// A small HTML panel under the canvas that shows the audience exactly what the
// audio mechanic is listening for and what each sound feature controls. It is
// built once with p5's DOM functions (createDiv, createSpan, createButton) and
// then only bar widths and class names change each frame, which is cheaper
// than rebuilding the HTML.
// Styles live in style.css under "Zicen: sound panel".
// Reference: https://p5js.org/reference/p5/createDiv/
//
// AI acknowledgement: structure and styling written with help from Claude;
// Zicen chose which features to show and the wording of each mapping.

// Each meter: which sound value it reads, its colour (one dancer each) and
// the visual reaction it drives.
const SOUND_METERS = [
  { key: 'intensity', label: 'Volume', colour: '#FA4945', effect: 'jump height + tempo' },
  { key: 'bass', label: 'Bass', colour: '#18A9EE', effect: 'knee squash + star rays' },
  { key: 'mid', label: 'Mid', colour: '#FFD02E', effect: 'campfire flame height' },
  { key: 'treble', label: 'Treble', colour: '#F00085', effect: 'colour glow + tilt' }
];

// Event chips light up while that kind of sound is detected.
const SOUND_EVENTS = [
  { id: 'short', text: 'Clap / beat → new pose' },
  { id: 'long', text: 'Hum / held note → drift' },
  { id: 'spread', text: 'Bright sound → spread out' },
  { id: 'gather', text: 'Deep sound → gather in' },
  { id: 'secret', text: '??? → clap 3 times fast', revealedText: 'Triple clap → handstand wave!' }
];

class SoundHud {
  constructor(parentElement) {
    this.panel = createDiv();
    this.panel.parent(parentElement);
    this.panel.addClass('sound-hud');

    const header = createDiv();
    header.parent(this.panel);
    header.addClass('sound-hud__header');
    this.title = createSpan('What the audio mechanic hears');
    this.title.parent(header);
    this.title.addClass('sound-hud__title');
    this.sourceBadge = createSpan('Waiting for the final dance');
    this.sourceBadge.parent(header);
    this.sourceBadge.addClass('sound-hud__source');

    // The microphone button and status line are placed inside the panel so
    // every audio control sits in one place.
    this.controls = createDiv();
    this.controls.parent(this.panel);
    this.controls.addClass('sound-hud__controls');

    const meterGrid = createDiv();
    meterGrid.parent(this.panel);
    meterGrid.addClass('sound-hud__meters');
    this.meterFills = SOUND_METERS.map((meter) => this.createMeter(meterGrid, meter));

    const eventRow = createDiv();
    eventRow.parent(this.panel);
    eventRow.addClass('sound-hud__events');
    this.eventChips = {};
    for (const event of SOUND_EVENTS) {
      const chip = createSpan(event.text);
      chip.parent(eventRow);
      chip.addClass('sound-hud__chip');
      this.eventChips[event.id] = chip;
    }
    this.secretRevealed = false;
  }

  createMeter(parentElement, meter) {
    const row = createDiv();
    row.parent(parentElement);
    row.addClass('sound-hud__meter');
    const label = createSpan(meter.label);
    label.parent(row);
    label.addClass('sound-hud__label');
    const track = createDiv();
    track.parent(row);
    track.addClass('sound-hud__track');
    const fill = createDiv();
    fill.parent(track);
    fill.addClass('sound-hud__fill');
    fill.style('background', meter.colour);
    const effect = createSpan('→ ' + meter.effect);
    effect.parent(row);
    effect.addClass('sound-hud__effect');
    return fill;
  }

  // sourceName: 'track', 'mic' or null.
  update(sound, sourceName) {
    const sourceText = sourceName === 'mic'
      ? 'Listening to: your microphone'
      : sourceName === 'track'
        ? 'Listening to: the soundtrack'
        : 'Listening to: nothing yet';
    if (this.sourceBadge.html() !== sourceText) this.sourceBadge.html(sourceText);
    if (sourceName) this.panel.addClass('is-live');
    else this.panel.removeClass('is-live');

    SOUND_METERS.forEach((meter, index) => {
      const percent = Math.round(constrain(sound[meter.key] || 0, 0, 1) * 100);
      this.meterFills[index].style('width', percent + '%');
    });

    this.setChip('short', sound.shortSound);
    this.setChip('long', sound.longSound);
    this.setChip('spread', sourceName && sound.spread > 0.9);
    this.setChip('gather', sourceName && sound.spread < 0.84);
    this.setChip('secret', sound.tripleClap);
  }

  revealSecret() {
    if (this.secretRevealed) return;
    this.secretRevealed = true;
    const secret = SOUND_EVENTS.find((event) => event.id === 'secret');
    this.eventChips.secret.html(secret.revealedText);
    this.eventChips.secret.addClass('is-revealed');
  }

  // Chips stay lit for a moment so a single clap is still readable.
  setChip(id, active) {
    const chip = this.eventChips[id];
    if (active) {
      chip.addClass('is-active');
      chip.elt.dataset.activeUntil = String(millis() + 260);
    } else if (millis() > Number(chip.elt.dataset.activeUntil || 0)) {
      chip.removeClass('is-active');
    }
  }
}
