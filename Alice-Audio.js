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
let audioCaveStartedAt = 0;
let audioDanceStartedAt = 0;
let audioReducedMotion = false;

const AUDIO_DANCER_PATHS = [
  'assets/audio/dancer-red.png',
  'assets/audio/dancer-blue.png',
  'assets/audio/dancer-green.png',
  'assets/audio/dancer-pink.png',
  'assets/audio/dancer-orange.png'
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
      const inFinale = storyStage === 'audioCave' || storyStage === 'audioDance';
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
  if (params.has('audioTest')) startAudioCave();
}

function isAudioFinaleStage() {
  return storyStage === 'audioCave' || storyStage === 'audioDance';
}

function startAudioCave() {
  storyStage = 'audioCave';
  audioCaveStartedAt = millis() / 1000;
  audioDanceStartedAt = 0;
  if (audioStatus) audioStatus.html('Click the campfire to awaken the cave.');
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
    startAudioCave();
    return true;
  }
  if (storyStage === 'audioCave' && clickOnAudioCampfire()) {
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
    drawAudioCavePrompt();
  }
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

function drawAudioCavePrompt() {
  push();
  textAlign(CENTER, CENTER);
  textSize(18);
  textStyle(BOLD);
  fill('#FFF1CF');
  noStroke();
  text('Click the fire to awaken the cave', width / 2, height - 48);
  pop();
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

  const xPositions = [92, 238, 400, 562, 708];
  const baseYPositions = [446, 432, 452, 432, 446];
  const targetHeights = [154, 164, 142, 164, 148];
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
  audioCaveStartedAt = 0;
  audioDanceStartedAt = 0;

  if (audioButton) {
    audioButton.removeAttribute('disabled');
    audioButton.html('Enable microphone');
  }
  if (audioStatus) audioStatus.html('Audio is off');
}
