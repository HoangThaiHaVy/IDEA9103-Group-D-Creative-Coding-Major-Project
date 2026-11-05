// ========================================
// AUDIO MECHANIC – SOUND PANEL (Zicen)
// ========================================
// A compact control strip under the canvas that shows the audience what the
// audio mechanic is listening to. Row 1: microphone button, live source and
// five mini meters. Row 2: status text and event chips. The "What does each
// sound do?" button opens a pop-over listing every mapping, so the strip stays
// short and the canvas can fill the window without page scrolling.
// Built once with p5 DOM functions (createDiv, createSpan, createButton);
// each frame only bar widths and CSS classes change.
// Styles live in style.css under "Zicen: sound panel".
// Reference: https://p5js.org/reference/p5/createDiv/
//
// AI acknowledgement: structure and styling written with help from Claude;
// Zicen chose which features to show and the wording of each mapping.

// Each meter: which sound value it reads, its colour (one dancer each) and
// the visual reaction it drives.
const SOUND_METERS = [
  { key: 'intensity', label: 'Volume', colour: '#FA4945', effect: 'jump height and tempo, star size' },
  { key: 'bass', label: 'Bass', colour: '#18A9EE', effect: 'knee squash on landing, star rays' },
  { key: 'mid', label: 'Mid', colour: '#FFD02E', effect: 'campfire flame height' },
  { key: 'treble', label: 'Treble', colour: '#F00085', effect: 'colour glow halo and tilt' },
  { key: 'humProgress', label: 'Hum', colour: '#20CD0A', effect: 'one steady note, no beat (microphone): builds the human tower – 3 s reaches the star' }
];

// Event chips light up while that kind of sound is detected.
const SOUND_EVENTS = [
  { id: 'short', text: 'Clap', effect: 'every dancer changes pose with a burst' },
  { id: 'long', text: 'Held sound', effect: 'dancers drift smoothly (Perlin noise)' },
  { id: 'hum', text: 'Humming', effect: 'the tower grows one level per second' },
  { id: 'spread', text: 'Bright', effect: 'bright sounds spread the row out' },
  { id: 'gather', text: 'Deep', effect: 'deep sounds gather the row in' },
  { id: 'secret', text: '???', revealedText: 'Triple clap', effect: 'clap 3 times fast… (a secret move)', revealedEffect: 'handstand wave' }
];

class SoundHud {
  constructor(parentElement) {
    this.panel = createDiv();
    this.panel.parent(parentElement);
    this.panel.addClass('sound-hud');

    // Row 1: controls, source and meters.
    const bar = this.createPart(this.panel, 'sound-hud__bar');
    this.controls = this.createPart(bar, 'sound-hud__controls');
    this.sourceBadge = createSpan('Not listening yet');
    this.sourceBadge.parent(bar);
    this.sourceBadge.addClass('sound-hud__source');
    const meterRow = this.createPart(bar, 'sound-hud__meters');
    this.meterFills = SOUND_METERS.map((meter) => this.createMeter(meterRow, meter));
    this.infoButton = createButton('ⓘ What does each sound do?');
    this.infoButton.parent(bar);
    this.infoButton.addClass('sound-hud__info');
    this.infoButton.mousePressed(() => this.panel.toggleClass('is-open'));

    // Row 2: status line (filled by audio-scene.js) and event chips.
    this.footer = this.createPart(this.panel, 'sound-hud__footer');
    const eventRow = this.createPart(this.footer, 'sound-hud__events');
    this.eventChips = {};
    for (const event of SOUND_EVENTS) {
      const chip = createSpan(event.text);
      chip.parent(eventRow);
      chip.addClass('sound-hud__chip');
      this.eventChips[event.id] = chip;
    }

    this.details = this.createDetails();
    this.secretRevealed = false;
  }

  createPart(parentElement, className) {
    const part = createDiv();
    part.parent(parentElement);
    part.addClass(className);
    return part;
  }

  createMeter(parentElement, meter) {
    const row = this.createPart(parentElement, 'sound-hud__meter');
    row.attribute('title', meter.label + ' → ' + meter.effect);
    const label = createSpan(meter.label);
    label.parent(row);
    label.addClass('sound-hud__label');
    const track = this.createPart(row, 'sound-hud__track');
    const fill = this.createPart(track, 'sound-hud__fill');
    fill.style('background', meter.colour);
    return fill;
  }

  // Pop-over listing every mapping (opened with the ⓘ button).
  createDetails() {
    const details = this.createPart(this.panel, 'sound-hud__details');
    const title = createP('What the audio mechanic listens for');
    title.parent(details);
    title.addClass('sound-hud__details-title');
    const list = createElement('ul');
    list.parent(details);
    for (const meter of SOUND_METERS) {
      const item = createElement('li', `<b style="color:${meter.colour}">■</b> <b>${meter.label}</b> → ${meter.effect}`);
      item.parent(list);
    }
    this.secretItem = null;
    for (const event of SOUND_EVENTS) {
      const item = createElement('li', `<b>${event.text}</b> → ${event.effect}`);
      item.parent(list);
      if (event.id === 'secret') this.secretItem = item;
    }
    return details;
  }

  // sourceName: 'track', 'mic' or null.
  update(sound, sourceName) {
    const sourceText = sourceName === 'mic'
      ? '● Your microphone'
      : sourceName === 'track'
        ? '● Soundtrack'
        : 'Not listening yet';
    if (this.sourceBadge.html() !== sourceText) this.sourceBadge.html(sourceText);
    if (sourceName) this.panel.addClass('is-live');
    else this.panel.removeClass('is-live');

    SOUND_METERS.forEach((meter, index) => {
      const percent = Math.round(constrain(sound[meter.key] || 0, 0, 1) * 100);
      this.meterFills[index].style('width', percent + '%');
    });

    this.setChip('short', sound.shortSound);
    this.setChip('long', sound.longSound);
    this.setChip('hum', sound.humming);
    this.setChip('spread', sourceName && sound.spread > 0.85);
    this.setChip('gather', sourceName && sound.spread < 0.6);
    this.setChip('secret', sound.tripleClap);
  }

  revealSecret() {
    if (this.secretRevealed) return;
    this.secretRevealed = true;
    const secret = SOUND_EVENTS.find((event) => event.id === 'secret');
    this.eventChips.secret.html(secret.revealedText);
    this.eventChips.secret.addClass('is-revealed');
    this.secretItem.html(`<b>${secret.revealedText}</b> → ${secret.revealedEffect}`);
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
