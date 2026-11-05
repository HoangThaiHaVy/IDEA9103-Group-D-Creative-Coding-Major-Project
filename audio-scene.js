// ========================================
// AUDIO MECHANIC – FINALE SCENE (Zicen)
// ========================================
// Connects the sound analysis (audio-mechanic.js) and the AudioDancer class
// (audio-dancer.js) to the shared story. Read in this order:
//   startStarGather()  – called by sketch.js when Emery's circle is ready
//   drawStarGathering() – the star rises and night falls (6.8 s)
//   startAudioDance()  – Emery's figures become Zicen's five dancers
//   drawAudioFinale()  – the soundtrack, then the visitor's own sound,
//                         drives the dancers until the page is closed
// Also owns the "Enable microphone" button, the sound panel (audio-hud.js),
// the star that stays in the sky and the handstand-wave easter egg.
//
// AI acknowledgement: developed with help from OpenAI Codex (scene handoff,
// easing curves, image-asset generation for the sun/cloud/campfire) and
// Claude (soundtrack → microphone handover, end-of-track prompt, star,
// handstand wave and human-tower ending). Zicen
// designed the story beat, the mappings and the timing, and tested every change.

let audioMechanic;
let audioData = createSilentSoundData();
let audioButton;
let audioStatus;
let soundHud;
let audioSunImage;
let audioCloudImage;
let audioCampfireImage;
let audioDancerImages = [];
let audioDancerPoseImages = [];
let audioDancers = [];
let audioSunReady = false;
let audioCloudReady = false;
let audioCampfireReady = false;
let audioDancersReady = false;
let audioAlternateDancersReady = false;
let audioCloudOffset = 0;
let starGatherStartedAt = 0;
let audioDanceStartedAt = 0;
let audioReducedMotion = false;
let audioStartsFromTimeCircle = false;
let timeCircleHandoff = [];

// Finale soundtrack: "Funky Drums Bass And Claps" by Emmraan (Pixabay Content
// License, https://pixabay.com/service/license-summary/). It plays once when the
// dancers appear, so the scene reacts to an audio track even before the
// visitor enables the microphone.
const FINALE_SOUNDTRACK_PATH = 'assets/audio/funky-drums-bass-and-claps.mp3';
const FINALE_SOUNDTRACK_VOLUME = 0.45;
let finaleSoundtrack;
let finaleSoundtrackStarted = false;
let finaleSoundtrackFinished = false;
let finaleSoundtrackFinishedAt = 0;

// The star lifted by the group stays above the dance; its glow follows the
// smoothed loudness of everyone's sound.
const SHARED_STAR_Y = 82;
let sharedStarEnergy = 0;

// Hand-drawn handstand poses (same colour order as AUDIO_DANCER_PATHS) and the
// human tower used for the final "reach the light" moment.
const AUDIO_HANDSTAND_PATHS = [
  'assets/audio/handstand-red.png',
  'assets/audio/handstand-yellow.png',
  'assets/audio/handstand-green.png',
  'assets/audio/handstand-blue.png',
  'assets/audio/handstand-pink.png'
];
let audioHandstandImages = [];
// The tower drawing is split into three layers (bottom pair, middle pair,
// top dancer) so it can be built one level at a time.
const TOWER_LAYER_PATHS = [
  'assets/audio/tower-level-1.png',
  'assets/audio/tower-level-2.png',
  'assets/audio/tower-level-3.png'
];
let towerLayerImages = [];
let towerLayersLoaded = 0;

// Human tower: drawn so the top dancer's raised hand meets the shared star.
// TOWER_HAND_* is the top hand's position inside each layer image (333 x 640 px).
const TOWER_DRAW_HEIGHT = 410;
const TOWER_HAND_X = 207;
const TOWER_HAND_Y = 80;
const TOWER_LAYER_DELAY = 0.3; // seconds between levels when it builds itself
const TOWER_LAYER_RISE = 0.5; // seconds for one level to climb into place
const TOWER_GATHER = TOWER_LAYER_DELAY * 2 + TOWER_LAYER_RISE; // all three levels
const TOWER_HOLD = 4.6; // the star flares while the tower holds it
const TOWER_RELEASE = 0.9; // the tower fades back into the row
const TOWER_TOTAL = TOWER_GATHER + TOWER_HOLD + TOWER_RELEASE;
let towerStartedAt = -Infinity;

// During the soundtrack, drum hits make random dancers flip into a short
// handstand, so the group keeps tumbling to the music (random() + chance).
const SOLO_FLIP_CHANCE = 0.85; // chance per detected beat (beats are ≥ 1 s apart)
const SOLO_FLIP_HOLD = 0.9; // seconds upside down for a solo flip

// Easter egg: delay between neighbouring dancers in the handstand wave.
const HANDSTAND_WAVE_STAGGER = 0.14;
let handstandWaveStartedAt = -Infinity;

const AUDIO_DANCER_PATHS = [
  'assets/audio/classic-red.png',
  'assets/audio/classic-yellow.png',
  'assets/audio/classic-green.png',
  'assets/audio/classic-blue.png',
  'assets/audio/classic-pink.png'
];

const AUDIO_DANCER_POSE_PATHS = [
  ['assets/audio/dancer-red-alt.png?v=20261105-3'],
  [
    'assets/audio/dancer-yellow-alt.png?v=20261105-3',
    'assets/audio/dancer-yellow-alt-2.png?v=20261105-3'
  ],
  ['assets/audio/dancer-green-alt.png?v=20261105-3'],
  ['assets/audio/dancer-blue-alt.png?v=20261105-3'],
  ['assets/audio/dancer-pink-alt.png?v=20261105-3']
];

// Different phases and jump strengths stop the five dancers moving in perfect
// unison; colours match Emery's Character colours for the glow halo.
const AUDIO_DANCER_LAYOUT = [
  { x: 64, y: 458, height: 152, phase: 0, jumpStrength: 36, colour: '#FA4945' },
  { x: 230, y: 458, height: 146, phase: 0.65, jumpStrength: 39, colour: '#FFD02E' },
  { x: 400, y: 458, height: 150, phase: 1.3, jumpStrength: 42, colour: '#20CD0A' },
  { x: 570, y: 458, height: 146, phase: 1.95, jumpStrength: 45, colour: '#18A9EE' },
  { x: 736, y: 458, height: 152, phase: 2.6, jumpStrength: 48, colour: '#F00085' }
];

function preloadAudioAssets() {
  audioSunImage = loadImage(
    'assets/audio/sun-red.png',
    () => { audioSunReady = true; },
    () => { audioSunReady = false; }
  );
  audioCloudImage = loadImage(
    'assets/audio/cloud-cream.png',
    () => { audioCloudReady = true; },
    () => { audioCloudReady = false; }
  );

  audioCampfireImage = loadImage(
    'assets/audio/campfire.png',
    () => { audioCampfireReady = true; },
    () => { audioCampfireReady = false; }
  );
  let loadedDancers = 0;
  audioDancerImages = AUDIO_DANCER_PATHS.map((path) => loadImage(
    path,
    () => {
      loadedDancers += 1;
      audioDancersReady = loadedDancers === AUDIO_DANCER_PATHS.length;
    },
    () => { audioDancersReady = false; }
  ));
  let loadedAlternateDancers = 0;
  const alternateDancerCount = AUDIO_DANCER_POSE_PATHS
    .reduce((total, paths) => total + paths.length, 0);
  audioDancerPoseImages = AUDIO_DANCER_POSE_PATHS.map((paths) =>
    paths.map((path) => loadImage(
      path,
      () => {
        loadedAlternateDancers += 1;
        audioAlternateDancersReady =
          loadedAlternateDancers === alternateDancerCount;
      },
      () => { audioAlternateDancersReady = false; }
    ))
  );
  finaleSoundtrack = loadSound(FINALE_SOUNDTRACK_PATH);
  audioHandstandImages = AUDIO_HANDSTAND_PATHS.map((path) => loadImage(path));
  preloadStandbyMusic();
  towerLayerImages = TOWER_LAYER_PATHS.map((path) => loadImage(
    path,
    () => { towerLayersLoaded += 1; }
  ));
}

function setupAudio() {
  audioMechanic = new AudioMechanic();
  audioReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  audioDancers = audioDancerImages.map((imageAsset, index) =>
    new AudioDancer(
      imageAsset,
      audioDancerPoseImages[index],
      { ...AUDIO_DANCER_LAYOUT[index], handstandImage: audioHandstandImages[index] }
    )
  );

  // One panel under the canvas holds every audio control and live reading.
  soundHud = new SoundHud(document.querySelector('main'));

  audioButton = createButton('Enable microphone');
  audioButton.parent(soundHud.controls);
  audioButton.addClass('sound-hud__button');
  audioButton.mousePressed(enableAudioInput);

  audioStatus = createP('Audio is off');
  audioStatus.parent(soundHud.footer);
  audioStatus.addClass('sound-hud__status');

  if (finaleSoundtrack) finaleSoundtrack.onended(handleSoundtrackEnded);
  // Browsers keep audio paused until the first click or key press; this
  // resumes the AudioContext on that gesture (also needed for ?audioTest=dance).
  userStartAudio();
}

function enableAudioInput() {
  if (audioMechanic.micReady) return;

  audioStatus.html('Waiting for microphone permission...');
  audioMechanic.startMicrophone(
    () => {
      audioButton.html('Microphone active');
      audioButton.attribute('disabled', '');
      audioStatus.html(isAudioFinaleStage()
        ? 'Loudness makes them jump; hold a sound to move; clap to change pose.'
        : 'Microphone active. Continue to the final dance scene.');
    },
    () => {
      audioStatus.html('Microphone unavailable. Check browser permission.');
    }
  );
}

// Testing shortcuts, so the audio chapter can be checked without replaying
// the whole story. Add one of these to the page address:
//   ?audioTest=handoff – the last 3 s of Emery's circle, then the real handoff
//   ?audioTest=star    – the rising star and nightfall
//   ?audioTest=dance   – the soundtrack dance (click once to allow audio)
//   ?audioTest=ending  – the dance, then skip to the end of the song
//                        (handstand wave, human tower, "your turn")
let audioTestSkipToEnding = false;

function setupAudioTestMode() {
  const params = new URLSearchParams(window.location.search);
  const testMode = params.get('audioTest');
  if (testMode === 'time') startTimeBased();
  else if (testMode === 'handoff' || testMode === 'timeHandoff') {
    startTimeBased();
    timeStartedAt -= TIME_END - 3;
  }
  else if (testMode === 'entry' || testMode === 'star' || testMode === '1') startStarGather();
  else if (testMode === 'dance') startAudioDance();
  else if (testMode === 'ending') {
    startAudioDance();
    audioTestSkipToEnding = true;
  }
}

// ?audioTest=ending: once the row has formed, jump to the last half second
// of the song so its normal "ended" event starts the real ending.
function updateTestSkipToEnding(danceElapsed) {
  if (!audioTestSkipToEnding || !finaleSoundtrackStarted || danceElapsed < 6.5) return;
  audioTestSkipToEnding = false;
  finaleSoundtrack.jump(finaleSoundtrack.duration() - 0.5);
}

function isAudioFinaleStage() {
  return ['starGather', 'audioDance'].includes(storyStage);
}

function startStarGather() {
  // Preserve Emery's actual final character arrangement for the handoff.
  audioStartsFromTimeCircle = storyStage === 'timeBased' &&
    typeof timeFigures !== 'undefined' && timeFigures.length > 0;
  storyStage = 'starGather';
  starGatherStartedAt = millis() / 1000;
  audioDanceStartedAt = 0;
  if (audioStatus) audioStatus.html('A star is rising between the dancers...');
}

function startAudioDance() {
  if (audioStartsFromTimeCircle && timeFigures.length >= 5) {
    // Match each image colour to Emery's Character colour order so every
    // sticker grows from its own figure instead of appearing like a page cut.
    audioDancers.forEach((dancer, index) => {
      // The vector figure reaches this row position before its matching image
      // fades in, so the identity changes without a second travel path.
      const target = AUDIO_DANCER_LAYOUT[index];
      dancer.setEntranceOrigin(target.x, target.y);
    });
    // Preserve Emery's exact linked-hand pose. These Character drawings move
    // into a row before they crossfade into Zicen's image-based dancers.
    timeCircleHandoff = timeFigures.map((figure) => ({
      x: figure.x,
      y: figure.y,
      stand: figure.stand,
      sway: figure.sway,
      step: figure.step,
      knee: figure.knee,
      bounce: figure.bounce,
      open: figure.open,
      reach: figure.reach,
      scale: figure.scale,
      facing: figure.facing,
      pose: cloneCharacterPose(figure.pose)
    }));
  }
  storyStage = 'audioDance';
  audioDanceStartedAt = millis() / 1000;
  if (audioStatus) {
    audioStatus.html(audioMechanic && audioMechanic.micReady
      ? 'Your sound now controls the dancers.'
      : 'The music is moving the dancers. Enable the microphone to take over with your own sound.');
  }
}

// Starts the soundtrack once, on the first frame of the dance where the browser
// allows audio. Until the microphone is enabled, the dancers follow the track.
function updateFinaleSoundtrack() {
  if (storyStage !== 'audioDance' || finaleSoundtrackStarted) return;
  if (!finaleSoundtrack || !finaleSoundtrack.isLoaded()) return;
  if (getAudioContext().state !== 'running') return;

  finaleSoundtrack.setLoop(false);
  finaleSoundtrack.setVolume(FINALE_SOUNDTRACK_VOLUME);
  finaleSoundtrack.play();
  finaleSoundtrackStarted = true;
  if (!audioMechanic.micReady) audioMechanic.useTrack(finaleSoundtrack);
}

// When the track finishes, the dance continues with the visitor's own sound.
function handleSoundtrackEnded() {
  if (!finaleSoundtrackStarted || finaleSoundtrackFinished) return;
  finaleSoundtrackFinished = true;
  finaleSoundtrackFinishedAt = millis() / 1000;
  // Ending: the group bows with a handstand wave, then climbs into a human
  // tower to touch the star they lifted together. Then it is the visitor's turn.
  startHandstandWave(finaleSoundtrackFinishedAt);
  towerStartedAt = finaleSoundtrackFinishedAt + HANDSTAND_TOTAL +
    HANDSTAND_WAVE_STAGGER * 4 + 0.3;
  const micTakesOver = audioMechanic.useMicrophone();
  if (!micTakesOver) audioMechanic.source = null;
  if (audioStatus) {
    audioStatus.html(micTakesOver
      ? 'Play your favourite music, or clap, hum and sing to make them dance!'
      : 'The song has ended. Enable the microphone to keep the dance going.');
  }
}

function handleAudioSceneClick() {
  // Formal handoff from Emery's final circle: once the time-based sequence
  // reports that the five characters are in place, a click begins the star.
  if (storyStage === 'timeBased' && timeCircleReady) {
    startStarGather();
    return true;
  }
  if (storyStage === 'caveEntered') {
    startStarGather();
    return true;
  }
  return false;
}

function updateAudio() {
  audioData = audioMechanic
    ? audioMechanic.getSoundData()
    : createSilentSoundData();
  updateStandbyMusic(min(deltaTime, 50) / 1000);

  const seconds = min(deltaTime, 50) / 1000;
  const cloudSpeed = 10 + audioData.intensity * 65 + audioData.treble * 45;
  audioCloudOffset = (audioCloudOffset + cloudSpeed * seconds) % (width + 220);
}

function drawAudioSky(time, opacityAmount = 1) {
  if (opacityAmount <= 0) return;
  const sunPulse = 1 + audioData.intensity * 0.28 + audioData.bass * 0.14;
  const sunSize = 86 * sunPulse;
  const sunY = 78 - audioData.bass * 10;

  push();
  drawingContext.globalAlpha *= opacityAmount;
  imageMode(CENTER);
  if (audioSunReady) {
    image(audioSunImage, 98, sunY, sunSize, sunSize);
  } else {
    drawSun(98, sunY, sunSize / 2);
  }

  const driftRange = width + 220;
  const cloudX = ((255 + audioCloudOffset) % driftRange) - 110;
  const secondCloudX = ((610 + audioCloudOffset * 0.72) % driftRange) - 110;
  const cloudBob = sin(time * 1.3) * (2 + audioData.treble * 8);

  if (audioCloudReady) {
    image(audioCloudImage, cloudX, 91 + cloudBob, 164, 82);
    image(audioCloudImage, secondCloudX, 132 - cloudBob * 0.5, 126, 63);
  } else {
    drawCloud(cloudX, 91 + cloudBob, 1);
    drawCloud(secondCloudX, 132 - cloudBob * 0.5, 0.78);
  }
  pop();
}

function drawAudioFinale(time) {
  updateFinaleSoundtrack();
  if (storyStage === 'starGather') {
    drawStarGathering(time);
    return;
  }

  const elapsed = audioDanceStartedAt > 0 ? time - audioDanceStartedAt : 0;
  updateTestSkipToEnding(elapsed);
  const rowStart = audioReducedMotion ? 0 : 0.35;
  const rowDuration = audioReducedMotion ? 0.2 : 5.2;
  const rowProgress = constrain(
    (elapsed - rowStart) / rowDuration,
    0,
    1
  );
  const peopleTransition = strongEaseInOut(rowProgress);
  // The campfire waits until the row transformation has fully settled.
  const fireProgress = strongEaseOut(constrain(
    (elapsed - (audioReducedMotion ? 0 : rowStart + rowDuration + 0.6)) /
      (audioReducedMotion ? 0.2 : 1.15),
    0,
    1
  ));

  // The finale stays in the same code-drawn outdoor night landscape. Emery's
  // completed circle hands directly into the star and night sequence.
  drawNightLandscape(time, 1);
  // Fire is drawn first, so it remains behind both generations of characters.
  drawCampfire(time, fireProgress, 1);
  // First form the row, then hold Emery's figures long enough for them to make
  // a dance pose. Only the final 22% crossfades to Zicen's image artwork.
  const hasTimeHandoff = audioStartsFromTimeCircle && timeCircleHandoff.length >= 5;
  const oldCharacterOpacity = hasTimeHandoff
    ? 1 - strongEaseOut(constrain((rowProgress - 0.78) / 0.22, 0, 1))
    : 0;
  const imageCharacterProgress = hasTimeHandoff
    ? strongEaseOut(constrain((rowProgress - 0.78) / 0.22, 0, 1))
    : peopleTransition;
  drawTimeCharactersToRow(rowProgress, oldCharacterOpacity);
  // The star from the previous scene keeps shining above the dancers.
  const tower = towerProgress(time, rowProgress);
  // A hum held for 3 s completes the tower: play the same "reach the light"
  // moment as the song ending, starting from the already-built tower.
  if (tower.building && audioData.humProgress >= 1) {
    towerStartedAt = time - TOWER_GATHER;
    audioMechanic.resetHum();
  }
  drawSharedStar(time, peopleTransition, tower.flare);
  if (audioData.tripleClap && rowProgress >= 1 && tower.cover === 0) {
    startHandstandWave(time);
    soundHud.revealSecret();
  }
  const waveBusy = time - handstandWaveStartedAt < HANDSTAND_TOTAL + 1;
  if (audioMechanic.source === 'track' && audioData.shortSound && rowProgress >= 1 &&
      tower.cover === 0 && !waveBusy) {
    startSoloFlip(time);
  }
  // The row fades out while the tower is visible, and fades back afterwards.
  drawAudioDancers(time, imageCharacterProgress, 1 - tower.cover);
  drawHumanTower(tower);
  drawHandstandCaption(time);
  if (tower.cover === 0) drawSoundtrackFinishedPrompt(time);
}

// Describes the human tower for this frame:
//   cover    – how much the dancing row fades out (0–1)
//   layers   – how far each of the three levels has climbed in (0–1)
//   flare    – how strongly the star flares when it is touched (0–1)
//   caption  – opacity of the caption
//   building – true while a hum (not the song ending) is building it
function towerProgress(time, rowProgress) {
  const none = { cover: 0, layers: [0, 0, 0], flare: 0, caption: 0, building: false };
  if (audioReducedMotion) return none;

  // 1. The full sequence: after the song, or once a hum completes the tower.
  const elapsed = time - towerStartedAt;
  if (elapsed >= 0 && elapsed <= TOWER_TOTAL) {
    audioMechanic.resetHum(); // humming during the sequence does not count
    const release = strongEaseInOut(constrain(
      (elapsed - TOWER_GATHER - TOWER_HOLD) / TOWER_RELEASE, 0, 1
    ));
    const layers = [0, 1, 2].map((level) => strongEaseInOut(constrain(
      (elapsed - level * TOWER_LAYER_DELAY) / TOWER_LAYER_RISE, 0, 1
    )) * (1 - release));
    const holdTime = elapsed - TOWER_GATHER;
    return {
      cover: constrain(elapsed / 0.4, 0, 1) * (1 - release),
      layers,
      flare: holdTime > 0 && holdTime < TOWER_HOLD ? sin(PI * holdTime / TOWER_HOLD) : 0,
      caption: min(1, max(0, holdTime) / 0.4) * (1 - release),
      building: false
    };
  }

  // 2. Building with a hum: each third of the hum adds one level.
  const build = audioData.humProgress || 0;
  const handstandBusy = time - handstandWaveStartedAt < HANDSTAND_TOTAL + 1;
  if (build <= 0 || rowProgress < 1 || handstandBusy) return none;
  return {
    cover: constrain(build * 4, 0, 1),
    layers: [0, 1, 2].map((level) => strongEaseOut(constrain(build * 3 - level, 0, 1))),
    flare: 0,
    caption: constrain(build * 4, 0, 1),
    building: true
  };
}

function drawHumanTower(tower) {
  if (towerLayersLoaded < TOWER_LAYER_PATHS.length || tower.cover <= 0) return;
  const towerScale = TOWER_DRAW_HEIGHT / towerLayerImages[0].height;
  const towerWidth = towerLayerImages[0].width * towerScale;
  // Place the images so the raised hand sits just below-left of the star.
  const left = width / 2 - TOWER_HAND_X * towerScale - 6;
  const settledTop = SHARED_STAR_Y + 18 - TOWER_HAND_Y * towerScale;

  push();
  towerLayerImages.forEach((layerImage, level) => {
    const amount = tower.layers[level];
    if (amount <= 0) return;
    tint(255, 255 * amount);
    // Each level climbs up 30 px into place while it fades in.
    image(layerImage, left, settledTop + (1 - amount) * 30, towerWidth, TOWER_DRAW_HEIGHT);
  });
  noTint();
  pop();

  if (tower.caption > 0) {
    const levelsBuilt = tower.layers.filter((amount) => amount >= 0.99).length;
    const caption = tower.building
      ? `Keep humming together… ${levelsBuilt} / 3`
      : 'Together, they reach the light';
    push();
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(20);
    stroke('#171722');
    strokeWeight(5);
    drawingContext.globalAlpha *= tower.caption;
    fill('#FFF4B7');
    text(caption, width / 2, height - 22);
    pop();
  }
}

// The rising star's final position, now reacting to the music: louder sound
// makes it bigger with a wider halo, and bass sends out short rays.
function drawSharedStar(time, settleProgress, flare = 0) {
  sharedStarEnergy = lerp(sharedStarEnergy, audioData.intensity, 0.1);
  // When the tower touches the star, it flares as if the music peaked.
  const energy = max(sharedStarEnergy * settleProgress, flare);
  const rayAmount = audioData.bass * energy;

  push();
  translate(width / 2, SHARED_STAR_Y);
  blendMode(ADD);
  noStroke();
  fill(255, 236, 120, 38 * energy);
  circle(0, 0, 150 + energy * 90);
  stroke(255, 240, 150, 170 * rayAmount);
  strokeWeight(3);
  for (let ray = 0; ray < 12; ray += 1) {
    const angle = ray * TWO_PI / 12 + time * 0.3;
    const inner = 48 + energy * 12;
    const outer = inner + 12 + rayAmount * 30;
    line(cos(angle) * inner, sin(angle) * inner, cos(angle) * outer, sin(angle) * outer);
  }
  blendMode(BLEND);
  pop();

  drawRisingStar(time, width / 2, SHARED_STAR_Y, 1, 1 + energy * 0.35);
}

// One random dancer that is not already upside down flips on this beat.
function startSoloFlip(time) {
  if (audioReducedMotion || random() > SOLO_FLIP_CHANCE) return;
  const readyDancers = audioDancers.filter((dancer) => !dancer.isInHandstand(time));
  if (readyDancers.length > 0) random(readyDancers).startHandstand(time, SOLO_FLIP_HOLD);
}

// Easter egg: the five dancers flip into handstands one after another.
function startHandstandWave(time) {
  if (audioReducedMotion || time - handstandWaveStartedAt < HANDSTAND_TOTAL) return;
  handstandWaveStartedAt = time;
  audioDancers.forEach((dancer, index) => {
    dancer.startHandstand(time + index * HANDSTAND_WAVE_STAGGER);
  });
}

function drawHandstandCaption(time) {
  const elapsed = time - handstandWaveStartedAt;
  const duration = HANDSTAND_TOTAL + HANDSTAND_WAVE_STAGGER * 4;
  if (elapsed < 0 || elapsed > duration) return;
  const fade = min(1, elapsed / 0.3, (duration - elapsed) / 0.4);

  push();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(20);
  stroke('#171722');
  strokeWeight(5);
  fill(255, 244, 183, 255 * fade);
  drawingContext.globalAlpha *= fade;
  text('Handstand wave!', width / 2, height - 28);
  pop();
}

// After the soundtrack ends, a banner invites the visitor to keep the dance
// going with their own music, claps, humming or singing.
function drawSoundtrackFinishedPrompt(time) {
  if (!finaleSoundtrackFinished || storyStage !== 'audioDance') return;

  const fadeDuration = audioReducedMotion ? 0.2 : 0.8;
  // Fade in once the ending (handstand wave + tower) has finished.
  const promptStart = max(finaleSoundtrackFinishedAt, towerStartedAt + TOWER_TOTAL);
  const opacityAmount = strongEaseOut(constrain(
    (time - promptStart) / fadeDuration,
    0,
    1
  ));
  const message = audioMechanic.micReady
    ? 'Now play your favourite music — or clap, hum and sing — to make them dance!'
    : 'Enable the microphone below, then clap, hum or sing to make them dance!';

  push();
  drawingContext.globalAlpha *= opacityAmount;
  rectMode(CENTER);
  stroke('#171722');
  strokeWeight(3);
  fill('#FFF7D6');
  rect(width / 2, 35, 650, 48, 12);
  noStroke();
  fill('#171722');
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(15);
  text(message, width / 2, 35);
  pop();
}

function drawStarGathering(time) {
  const elapsed = max(0, time - starGatherStartedAt);
  const totalDuration = audioReducedMotion ? 1.2 : 6.8;
  const riseStart = audioReducedMotion ? 0.1 : 0.9;
  const riseDuration = audioReducedMotion ? 0.5 : 3.35;
  const rise = strongEaseInOut(constrain((elapsed - riseStart) / riseDuration, 0, 1));
  const nightStart = audioReducedMotion ? 0.5 : 4.35;
  const nightDuration = audioReducedMotion ? 0.5 : 2.15;
  const nightProgress = strongEaseInOut(constrain((elapsed - nightStart) / nightDuration, 0, 1));

  drawLandscape();
  // The sun and clouds disappear as the night overlay arrives.
  drawAudioSky(time, 1 - nightProgress);
  drawNightLandscape(time, nightProgress);
  drawGatheredCharacters(time, 1);
  const starY = audioReducedMotion ? 82 : lerp(318, 82, rise);
  const starScale = lerp(0.72, 1.08, strongEaseOut(rise));
  drawRisingStar(time, width / 2, starY, 1, starScale);

  push();
  textAlign(CENTER, CENTER);
  textSize(17);
  textStyle(BOLD);
  fill(lerpColor(color('#241A4A'), color('#FFF4B7'), nightProgress));
  noStroke();
  const caption = rise < 0.9
    ? 'Together, they lift a light into the sky'
    : nightProgress < 0.9
      ? 'Night falls around their shared light...'
      : 'The world begins to change...';
  text(caption, width / 2, height - 30);
  pop();

  if (elapsed >= totalDuration) startAudioDance();
}

function drawGatheredCharacters(time, opacityAmount) {
  if (opacityAmount <= 0) return;

  if (audioStartsFromTimeCircle) {
    // drawTimeBased() reuses the same Character instances, positions and
    // hand links from Emery's final frame instead of replacing them with art.
    push();
    drawingContext.globalAlpha *= opacityAmount;
    drawTimeBased();
    pop();
  }
}

function cloneCharacterPose(pose) {
  if (!pose) return null;
  const copy = {};
  for (const [name, point] of Object.entries(pose)) {
    copy[name] = { x: point.x, y: point.y };
  }
  return copy;
}

function drawTimeCharactersToRow(progress, opacityAmount) {
  if (!audioStartsFromTimeCircle || timeCircleHandoff.length < 5 || opacityAmount <= 0) return;

  // 0–52%: release hands and settle into the row.
  // 52–60%: visibly hold the completed row.
  // 60–78%: stay in place while the arms form a readable dance pose.
  // 78–100%: the caller crossfades this drawing into the image artwork.
  const move = strongEaseInOut(constrain(progress / 0.52, 0, 1));
  const poseChange = strongEaseInOut(constrain((progress - 0.6) / 0.18, 0, 1));
  const layoutByFigure = [2, 4, 0, 3, 1];
  const danceOpen = [0.72, 0.58, 0.8, 0.64, 0.75];
  const danceSway = [-0.42, 0.34, -0.3, 0.4, -0.36];
  const danceStep = [0.28, -0.32, 0.24, -0.27, 0.3];

  for (let figureIndex = 0; figureIndex < timeFigures.length; figureIndex += 1) {
    const figure = timeFigures[figureIndex];
    const start = timeCircleHandoff[figureIndex];
    const layoutIndex = layoutByFigure.indexOf(figureIndex);
    const target = AUDIO_DANCER_LAYOUT[layoutIndex];

    figure.update({
      x: lerp(start.x, target.x, move),
      y: lerp(start.y, target.y, move),
      stand: lerp(start.stand, 1, move),
      sway: lerp(lerp(start.sway, 0, move), danceSway[figureIndex], poseChange),
      step: lerp(lerp(start.step, 0, move), danceStep[figureIndex], poseChange),
      knee: lerp(lerp(start.knee, 0, move), 12, poseChange),
      bounce: lerp(start.bounce, 0, move),
      open: lerp(lerp(start.open, 0.16, move), danceOpen[figureIndex], poseChange),
      reach: lerp(lerp(start.reach, 0, move), 18, poseChange),
      scale: lerp(start.scale, 0.72, move),
      facing: 1
    });

    // Blend the linked skeleton itself into the new pose. The shared hand
    // points therefore separate gradually instead of snapping apart.
    if (start.pose) {
      for (const [name, targetPoint] of Object.entries(figure.pose)) {
        figure.pose[name] = timeBlendPoint(start.pose[name], targetPoint, move);
      }
    }
  }

  for (const person of [...timeFigures].sort((a, b) => a.y - b.y)) {
    person.display(opacityAmount);
  }
}

function drawRisingStar(time, x, y, opacityAmount, scaleAmount) {
  const pulse = audioReducedMotion ? 1 : 1 + sin(time * 2.4) * 0.045;
  push();
  translate(x, y);
  scale(scaleAmount * pulse);
  noStroke();
  fill(255, 239, 112, 42 * opacityAmount);
  circle(0, 0, 118);
  fill(255, 232, 74, 80 * opacityAmount);
  circle(0, 0, 78);
  stroke('#1A1438');
  strokeWeight(5);
  strokeJoin(ROUND);
  fill(255, 242, 89, 255 * opacityAmount);
  beginShape();
  for (let i = 0; i < 10; i += 1) {
    const angle = -HALF_PI + i * PI / 5;
    const radius = i % 2 === 0 ? 34 : 15;
    vertex(cos(angle) * radius, sin(angle) * radius);
  }
  endShape(CLOSE);
  pop();
}

function drawCampfire(time, progress, backgroundProgress) {
  if (!audioCampfireReady || progress <= 0) return;

  const soundPulse = 1 + audioData.intensity * 0.1 + audioData.bass * 0.08;
  const flicker = audioReducedMotion ? 1 : 1 + sin(time * 8) * 0.025;
  const campfireHeight = 158;
  const campfireWidth = campfireHeight *
    audioCampfireImage.width / audioCampfireImage.height;

  push();
  translate(width / 2, 412);
  noStroke();
  fill(255, 111, 45, 42 * progress * backgroundProgress);
  circle(0, -52, 190 * progress * soundPulse);
  fill(255, 215, 70, 55 * progress * backgroundProgress);
  circle(0, -48, 118 * progress * soundPulse);
  imageMode(CENTER);
  tint(255, 255 * progress * backgroundProgress);
  // Mid frequencies stretch the flame upwards (at most 18% taller).
  const flameLift = 1 + constrain(audioData.mid, 0, 1) * 0.18;
  scale(soundPulse * flicker, soundPulse * flicker * flameLift);
  image(audioCampfireImage, 0, -campfireHeight / 2, campfireWidth, campfireHeight);
  noTint();
  pop();
}

function drawAudioDancers(time, rowProgress, backgroundProgress) {
  if (!audioDancersReady || !audioAlternateDancersReady || audioDancers.length === 0) return;

  for (let i = 0; i < audioDancers.length; i += 1) {
    const dancer = audioDancers[i];
    const delay = audioReducedMotion ? 0 : i * 0.025;
    const entrance = strongEaseInOut(constrain(
      (rowProgress - delay) / (1 - delay),
      0,
      1
    ));
    dancer.update(time, audioData, audioReducedMotion);
    dancer.display(entrance, backgroundProgress, time);
  }
}

// Evaluates the exact cubic-bezier(0.23, 1, 0.32, 1) ease-out curve.
function strongEaseOut(progress) {
  const x1 = 0.23;
  const y1 = 1;
  const x2 = 0.32;
  const y2 = 1;
  let parameter = constrain(progress, 0, 1);

  for (let i = 0; i < 5; i += 1) {
    const inverse = 1 - parameter;
    const x = 3 * inverse * inverse * parameter * x1 +
      3 * inverse * parameter * parameter * x2 + parameter * parameter * parameter;
    const derivative = 3 * inverse * inverse * x1 +
      6 * inverse * parameter * (x2 - x1) +
      3 * parameter * parameter * (1 - x2);
    if (abs(derivative) < 0.0001) break;
    parameter -= (x - progress) / derivative;
    parameter = constrain(parameter, 0, 1);
  }

  const inverse = 1 - parameter;
  return 3 * inverse * inverse * parameter * y1 +
    3 * inverse * parameter * parameter * y2 + parameter * parameter * parameter;
}

// Exact cubic-bezier(0.77, 0, 0.175, 1) for the star's deliberate rise.
function strongEaseInOut(progress) {
  const x1 = 0.77;
  const y1 = 0;
  const x2 = 0.175;
  const y2 = 1;
  let parameter = constrain(progress, 0, 1);

  for (let i = 0; i < 6; i += 1) {
    const inverse = 1 - parameter;
    const x = 3 * inverse * inverse * parameter * x1 +
      3 * inverse * parameter * parameter * x2 + parameter * parameter * parameter;
    const derivative = 3 * inverse * inverse * x1 +
      6 * inverse * parameter * (x2 - x1) +
      3 * parameter * parameter * (1 - x2);
    if (abs(derivative) < 0.0001) break;
    parameter = constrain(parameter - (x - progress) / derivative, 0, 1);
  }

  const inverse = 1 - parameter;
  return 3 * inverse * inverse * parameter * y1 +
    3 * inverse * parameter * parameter * y2 + parameter * parameter * parameter;
}

// Called every frame from sketch.js: refreshes the sound panel under the canvas.
function drawAudio() {
  if (!soundHud || !audioMechanic) return;
  soundHud.update(audioData, audioMechanic.source);
}
