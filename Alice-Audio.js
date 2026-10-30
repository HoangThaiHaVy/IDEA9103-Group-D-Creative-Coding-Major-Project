// Zicen's audio-driven mechanic for the shared scene.
// Developed with assistance from OpenAI Codex. The assistance was used to
// connect p5.sound microphone analysis to the independently drawn sun and
// cloud assets. Zicen selected the mapping and visual behaviour.

let audioMechanic;
let audioData = { intensity: 0, bass: 0, treble: 0 };
let audioButton;
let audioStatus;
let audioSunImage;
let audioCloudImage;
let audioPsychedelicCaveImage;
let audioCampfireImage;
let audioDancerImages = [];
let audioSunReady = false;
let audioCloudReady = false;
let audioPsychedelicCaveReady = false;
let audioCampfireReady = false;
let audioDancersReady = false;
let audioCloudOffset = 0;
let caveTransitionStartedAt = 0;
let audioCaveStartedAt = 0;
let audioDanceStartedAt = 0;
let audioReducedMotion = false;

const AUDIO_DANCER_PATHS = [
  'assets/audio/classic-red.png',
  'assets/audio/classic-yellow.png',
  'assets/audio/classic-green.png',
  'assets/audio/classic-blue.png',
  'assets/audio/classic-pink.png'
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

  audioPsychedelicCaveImage = loadImage(
    'assets/audio/psychedelic-cave.png',
    () => { audioPsychedelicCaveReady = true; },
    () => { audioPsychedelicCaveReady = false; }
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
}

function setupAudio() {
  audioMechanic = new AudioMechanic();
  audioReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  audioButton = createButton('Enable microphone');
  audioButton.parent(document.querySelector('main'));
  audioButton.mousePressed(enableAudioInput);

  audioStatus = createP('Audio is off');
  audioStatus.parent(document.querySelector('main'));
  audioStatus.style('font-family', 'Arial, sans-serif');
  audioStatus.style('font-size', '13px');
  audioStatus.style('margin', '4px 0 0');
}

function enableAudioInput() {
  if (audioMechanic.started) return;

  audioStatus.html('Waiting for microphone permission...');
  audioMechanic.startAudio(
    () => {
      audioButton.html('Microphone active');
      audioButton.attribute('disabled', '');
      const inFinale = ['caveTransition', 'audioCave', 'audioDance'].includes(storyStage);
      audioStatus.html(inFinale
        ? 'Speak, clap, or play music to control the dance.'
        : 'Speak, clap, or play music to move the sky.');
    },
    () => {
      audioStatus.html('Microphone unavailable. Check browser permission.');
    }
  );
}

function setupAudioTestMode() {
  const params = new URLSearchParams(window.location.search);
  const testMode = params.get('audioTest');
  if (testMode === 'entry') startCaveTransition();
  else if (testMode === 'dance') startAudioDance();
  else if (params.has('audioTest')) startAudioCave();
}

function isAudioFinaleStage() {
  return ['caveTransition', 'audioCave', 'audioDance'].includes(storyStage);
}

function startCaveTransition() {
  storyStage = 'caveTransition';
  caveTransitionStartedAt = millis() / 1000;
  if (audioStatus) audioStatus.html('Follow the character into the cave...');
}

function startAudioCave() {
  storyStage = 'audioCave';
  audioCaveStartedAt = millis() / 1000;
  audioDanceStartedAt = 0;
  if (audioStatus) audioStatus.html('The firelight is revealing someone...');
}

function startAudioDance() {
  storyStage = 'audioDance';
  audioDanceStartedAt = millis() / 1000;
  if (audioStatus) {
    audioStatus.html(audioMechanic && audioMechanic.started
      ? 'Your sound now controls the dancers.'
      : 'Enable the microphone, then make some sound to control the dancers.');
  }
}

function handleAudioSceneClick() {
  if (storyStage === 'caveEntered' && clickOnCave()) {
    startCaveTransition();
    return true;
  }
  if (storyStage === 'audioCave' && audioDiscoveryComplete() && clickOnAudioCampfire()) {
    startAudioDance();
    return true;
  }
  return false;
}

function clickOnAudioCampfire() {
  return dist(mouseX, mouseY, width / 2, height * 0.64) < 105;
}

function updateAudio() {
  audioData = audioMechanic
    ? audioMechanic.getSoundData()
    : { intensity: 0, bass: 0, treble: 0 };

  const seconds = min(deltaTime, 50) / 1000;
  const cloudSpeed = 10 + audioData.intensity * 65 + audioData.treble * 45;
  audioCloudOffset = (audioCloudOffset + cloudSpeed * seconds) % (width + 220);
}

function drawAudioSky(time) {
  const sunPulse = 1 + audioData.intensity * 0.28 + audioData.bass * 0.14;
  const sunSize = 86 * sunPulse;
  const sunY = 78 - audioData.bass * 10;

  push();
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
  if (storyStage === 'caveTransition') {
    drawCaveEntryTransition(time);
    return;
  }

  const transitionDuration = audioReducedMotion ? 0.2 : 2.5;
  const elapsed = audioDanceStartedAt > 0 ? time - audioDanceStartedAt : 0;
  const rawProgress = storyStage === 'audioDance'
    ? constrain(elapsed / transitionDuration, 0, 1)
    : 0;
  const revealProgress = strongEaseOut(rawProgress);

  drawDarkAudioCave(time, 1 - revealProgress);

  if (storyStage === 'audioDance') {
    drawPsychedelicCave(revealProgress);
    drawAudioDancers(time, elapsed, revealProgress);
  } else {
    drawDiscoveredDancers(time);
    drawAudioCavePrompt(time);
  }
}

function drawCaveEntryTransition(time) {
  const duration = audioReducedMotion ? 0.35 : 1.65;
  const progress = constrain((time - caveTransitionStartedAt) / duration, 0, 1);
  const movement = strongEaseInOut(progress);

  drawBackground(time, false);
  drawRain(time, true);
  drawCave(1);

  const startX = characterX;
  const targetX = width * 0.17;
  const startY = GROUND_Y - 98;
  const targetY = GROUND_Y - 70;
  const x = lerp(startX, targetX, movement);
  const y = lerp(startY, targetY, movement);
  const characterScale = lerp(1, 0.24, movement);

  if (pointingForwardImageReady) {
    push();
    imageMode(CENTER);
    tint(92, 255, 119, 255 * (1 - max(0, progress - 0.78) / 0.22));
    const imageHeight = 220 * characterScale;
    const imageWidth = imageHeight * pointingForwardImage.width / pointingForwardImage.height;
    image(pointingForwardImage, x, y, imageWidth, imageHeight);
    noTint();
    pop();
  }

  push();
  noStroke();
  fill(23, 20, 38, 255 * strongEaseOut(constrain((progress - 0.68) / 0.32, 0, 1)));
  rect(0, 0, width, height);
  pop();

  if (progress >= 1) startAudioCave();
}

function drawDarkAudioCave(time, fireOpacity) {
  background('#171426');

  // Layered arches create depth without using pure black.
  push();
  noFill();
  strokeCap(ROUND);
  const caveColours = ['#211B36', '#2B2344', '#352950'];
  for (let i = 0; i < caveColours.length; i += 1) {
    stroke(caveColours[i]);
    strokeWeight(58 - i * 13);
    arc(width / 2, height * 0.64, width * (1.1 - i * 0.12), height * (1.2 - i * 0.12), PI, TWO_PI);
  }

  noStroke();
  fill('#3C3158');
  const rockPositions = [[72, 92], [150, 55], [680, 68], [742, 130], [90, 408], [718, 420]];
  for (const rock of rockPositions) circle(rock[0], rock[1], 13);
  pop();

  drawAudioCampfire(time, fireOpacity);
}

function drawAudioCampfire(time, opacityAmount) {
  const idlePulse = audioReducedMotion ? 1 : 1 + sin(time * 3.2) * 0.018;
  const soundPulse = 1 + audioData.bass * 0.16 + audioData.intensity * 0.08;
  const fireSize = 190 * idlePulse * soundPulse;

  push();
  imageMode(CENTER);
  tint(255, 255 * constrain(opacityAmount, 0, 1));
  if (audioCampfireReady) {
    image(audioCampfireImage, width / 2, height * 0.64, fireSize, fireSize);
  } else {
    noStroke();
    fill(255, 101, 52, 255 * opacityAmount);
    triangle(width / 2, height * 0.45, width / 2 - 55, height * 0.7, width / 2 + 55, height * 0.7);
  }
  noTint();
  pop();
}

function audioDiscoveryComplete() {
  const revealDuration = audioReducedMotion ? 0.3 : 2.25;
  return audioCaveStartedAt > 0 && millis() / 1000 - audioCaveStartedAt >= revealDuration;
}

function drawDiscoveredDancers(time) {
  if (!audioDancersReady) return;

  const elapsed = max(0, time - audioCaveStartedAt);
  const positions = [
    [106, 385, 116], [238, 335, 110], [400, 312, 122],
    [562, 335, 110], [694, 385, 116]
  ];
  const stagger = audioReducedMotion ? 0 : 0.22;
  const duration = audioReducedMotion ? 0.2 : 0.55;

  for (let i = 0; i < audioDancerImages.length; i += 1) {
    const reveal = strongEaseOut(constrain((elapsed - 0.28 - i * stagger) / duration, 0, 1));
    if (reveal <= 0) continue;
    const asset = audioDancerImages[i];
    const targetHeight = positions[i][2];
    const targetWidth = targetHeight * asset.width / asset.height;
    const fireFlicker = audioReducedMotion ? 1 : 0.96 + sin(time * 3.1 + i) * 0.04;

    push();
    imageMode(CENTER);
    translate(positions[i][0], positions[i][1]);
    scale((0.86 + reveal * 0.14) * fireFlicker);
    tint(255, 255 * reveal);
    image(asset, 0, -targetHeight / 2, targetWidth, targetHeight);
    noTint();
    pop();
  }
}

function drawAudioCavePrompt(time) {
  const complete = audioDiscoveryComplete();
  push();
  textAlign(CENTER, CENTER);
  textSize(18);
  textStyle(BOLD);
  fill('#FFF1CF');
  noStroke();
  text(complete ? 'You are not alone — click the fire' : 'Shapes emerge from the firelight...', width / 2, height - 48);
  pop();

  if (complete && audioStatus) audioStatus.html('You found the others. Click the campfire to begin.');
}

function drawPsychedelicCave(progress) {
  if (!audioPsychedelicCaveReady) return;

  push();
  imageMode(CORNER);
  tint(255, 255 * progress);
  image(audioPsychedelicCaveImage, 0, 0, width, height);
  noTint();
  pop();
}

function drawAudioDancers(time, elapsed, backgroundProgress) {
  if (!audioDancersReady) return;

  const xPositions = [88, 238, 400, 562, 712];
  const baseYPositions = [458, 442, 454, 442, 458];
  const targetHeights = [190, 158, 174, 158, 190];
  const entranceDuration = audioReducedMotion ? 0.2 : 0.5;
  const staggerSeconds = audioReducedMotion ? 0 : 0.06;

  for (let i = 0; i < audioDancerImages.length; i += 1) {
    const imageAsset = audioDancerImages[i];
    const dancerElapsed = elapsed - 0.45 - i * staggerSeconds;
    const entrance = strongEaseOut(constrain(dancerElapsed / entranceDuration, 0, 1));
    if (entrance <= 0 || backgroundProgress < 0.12) continue;

    const idleSway = audioReducedMotion ? 0 : sin(time * 2.1 + i * 0.8) * 3;
    const audioSway = audioReducedMotion ? 0 : sin(time * (3.2 + audioData.treble * 4) + i) * audioData.treble * 16;
    const jump = audioReducedMotion ? 0 : audioData.bass * (30 + i * 3);
    const bounce = audioReducedMotion ? 0 : abs(sin(time * 3.4 + i * 0.65)) * audioData.intensity * 18;
    const rotation = audioReducedMotion ? 0 : sin(time * 2.7 + i) * audioData.treble * 0.16;
    const soundScale = 1 + audioData.intensity * 0.16;
    const entranceScale = 0.95 + entrance * 0.05;

    const targetHeight = targetHeights[i];
    const targetWidth = targetHeight * imageAsset.width / imageAsset.height;

    push();
    translate(xPositions[i] + idleSway + audioSway, baseYPositions[i] - jump - bounce);
    rotate(rotation);
    scale(entranceScale * soundScale);
    imageMode(CENTER);
    tint(255, 255 * entrance * backgroundProgress);
    image(imageAsset, 0, -targetHeight / 2, targetWidth, targetHeight);
    noTint();
    pop();
  }
}

// Evaluates the exact cubic-bezier(0.23, 1, 0.32, 1) ease-out curve used
// for the rare, explanatory transition from the dark cave to the finale.
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

// Exact cubic-bezier(0.77, 0, 0.175, 1) for the deliberate journey into the cave.
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

function drawAudio() {
  if (!audioMechanic || !audioMechanic.started) return;

  // A compact level meter makes the sound response legible without covering
  // the story. Bass raises the bars; treble changes their colour intensity.
  push();
  noStroke();
  const meterX = width - 68;
  const meterBottom = height - 18;
  for (let i = 0; i < 4; i += 1) {
    const barHeight = 5 + audioData.intensity * (10 + i * 7) + audioData.bass * 8;
    fill(220 + audioData.treble * 35, 48, 45, 190);
    rect(meterX + i * 11, meterBottom - barHeight, 7, barHeight, 3);
  }
  pop();
}

function resetAudio() {
  if (audioMechanic) audioMechanic.stopAudio();
  audioData = { intensity: 0, bass: 0, treble: 0 };
  audioCloudOffset = 0;
  caveTransitionStartedAt = 0;
  audioCaveStartedAt = 0;
  audioDanceStartedAt = 0;

  if (audioButton) {
    audioButton.removeAttribute('disabled');
    audioButton.html('Enable microphone');
  }
  if (audioStatus) audioStatus.html('Audio is off');
}
