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
let audioHoldingHandsImage;
let audioDancerImages = [];
let audioSunReady = false;
let audioCloudReady = false;
let audioPsychedelicCaveReady = false;
let audioHoldingHandsReady = false;
let audioDancersReady = false;
let audioCloudOffset = 0;
let starGatherStartedAt = 0;
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
  audioHoldingHandsImage = loadImage(
    'assets/audio/holding-hands-circle.png',
    () => { audioHoldingHandsReady = true; },
    () => { audioHoldingHandsReady = false; }
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
      const inFinale = ['starGather', 'audioDance'].includes(storyStage);
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
  if (testMode === 'entry' || testMode === 'star' || testMode === '1') startStarGather();
  else if (testMode === 'dance') startAudioDance();
}

function isAudioFinaleStage() {
  return ['starGather', 'audioDance'].includes(storyStage);
}

function startStarGather() {
  storyStage = 'starGather';
  starGatherStartedAt = millis() / 1000;
  audioDanceStartedAt = 0;
  if (audioStatus) audioStatus.html('A star is rising between the dancers...');
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
  if (storyStage === 'caveEntered') {
    startStarGather();
    return true;
  }
  return false;
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
  if (storyStage === 'starGather') {
    drawStarGathering(time);
    return;
  }

  const transitionDuration = audioReducedMotion ? 0.2 : 2.5;
  const elapsed = audioDanceStartedAt > 0 ? time - audioDanceStartedAt : 0;
  const rawProgress = storyStage === 'audioDance'
    ? constrain(elapsed / transitionDuration, 0, 1)
    : 0;
  const revealProgress = strongEaseOut(rawProgress);

  drawBackground(time, false);
  drawHoldingHandsGroup(time, 1 - revealProgress);
  drawNightfall(1);
  drawRisingStar(time, width / 2, 82, 1 - revealProgress, 1);
  drawPsychedelicCave(revealProgress);
  drawAudioDancers(time, elapsed, revealProgress);
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

  drawBackground(time, false);
  drawHoldingHandsGroup(time, 1);
  drawNightfall(nightProgress);
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

function drawHoldingHandsGroup(time, opacityAmount) {
  if (!audioHoldingHandsReady || opacityAmount <= 0) return;
  const elapsed = max(0, time - starGatherStartedAt);
  const entrance = strongEaseOut(constrain(elapsed / (audioReducedMotion ? 0.2 : 0.5), 0, 1));
  const sway = audioReducedMotion ? 0 : sin(time * 1.6) * radians(2);
  const targetHeight = 326;
  const targetWidth = targetHeight * audioHoldingHandsImage.width / audioHoldingHandsImage.height;

  push();
  translate(width / 2, 472);
  rotate(sway);
  scale(0.95 + entrance * 0.05);
  imageMode(CENTER);
  tint(255, 255 * opacityAmount * entrance);
  image(audioHoldingHandsImage, 0, -targetHeight / 2, targetWidth, targetHeight);
  noTint();
  pop();
}

function drawNightfall(progress) {
  if (progress <= 0) return;

  push();
  noStroke();
  fill(8, 13, 52, 240 * progress);
  rect(0, 0, width, height);

  fill(255, 244, 183, 220 * progress);
  const stars = [[58, 66], [182, 104], [286, 54], [515, 92], [628, 48], [742, 118], [92, 205], [691, 222]];
  for (let i = 0; i < stars.length; i += 1) {
    const twinkle = audioReducedMotion ? 1 : 0.75 + sin(i * 1.7 + frameCount * 0.025) * 0.25;
    circle(stars[i][0], stars[i][1], (3 + i % 3) * twinkle);
  }
  pop();
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
  starGatherStartedAt = 0;
  audioDanceStartedAt = 0;

  if (audioButton) {
    audioButton.removeAttribute('disabled');
    audioButton.html('Enable microphone');
  }
  if (audioStatus) audioStatus.html('Audio is off');
}
