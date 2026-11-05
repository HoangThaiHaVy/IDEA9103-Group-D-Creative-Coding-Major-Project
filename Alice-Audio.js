// Zicen's audio-driven mechanic for the shared scene.
// Developed with assistance from OpenAI Codex. The assistance was used to
// connect p5.sound microphone analysis to the independently drawn sun and
// cloud assets. Zicen selected the mapping and visual behaviour.

let audioMechanic;
let audioData = {
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
let audioButton;
let audioStatus;
let audioValuesPanel;
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

const AUDIO_DANCER_LAYOUT = [
  { x: 64, y: 458, height: 152, phase: 0, jumpStrength: 36 },
  { x: 230, y: 458, height: 146, phase: 0.65, jumpStrength: 39 },
  { x: 400, y: 458, height: 150, phase: 1.3, jumpStrength: 42 },
  { x: 570, y: 458, height: 146, phase: 1.95, jumpStrength: 45 },
  { x: 736, y: 458, height: 152, phase: 2.6, jumpStrength: 48 }
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
}

function setupAudio() {
  audioMechanic = new AudioMechanic();
  audioReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  audioDancers = audioDancerImages.map((imageAsset, index) =>
    new AudioDancer(
      imageAsset,
      audioDancerPoseImages[index],
      AUDIO_DANCER_LAYOUT[index]
    )
  );

  audioButton = createButton('Enable microphone');
  audioButton.parent(document.querySelector('main'));
  audioButton.mousePressed(enableAudioInput);

  audioStatus = createP('Audio is off');
  audioStatus.parent(document.querySelector('main'));
  audioStatus.style('font-family', 'Arial, sans-serif');
  audioStatus.style('font-size', '13px');
  audioStatus.style('margin', '4px 0 0');

  audioValuesPanel = createDiv('Live sound values will appear after enabling the microphone.');
  audioValuesPanel.parent(document.querySelector('main'));
  audioValuesPanel.style('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace');
  audioValuesPanel.style('font-size', '12px');
  audioValuesPanel.style('line-height', '1.55');
  audioValuesPanel.style('margin-top', '8px');
  audioValuesPanel.style('padding', '9px 12px');
  audioValuesPanel.style('max-width', '776px');
  audioValuesPanel.style('box-sizing', 'border-box');
  audioValuesPanel.style('border', '2px solid #171722');
  audioValuesPanel.style('border-radius', '8px');
  audioValuesPanel.style('background', '#f4f0df');
  audioValuesPanel.style('color', '#171722');
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
        ? 'Loudness makes them jump; hold a sound to move; use a short sound to change pose.'
        : 'Microphone active. Continue to the final dance scene.');
    },
    () => {
      audioStatus.html('Microphone unavailable. Check browser permission.');
    }
  );
}

function setupAudioTestMode() {
  const params = new URLSearchParams(window.location.search);
  const testMode = params.get('audioTest');
  if (testMode === 'time') startTimeBased();
  else if (testMode === 'timeHandoff') {
    startTimeBased();
    timeStartedAt -= 31.5;
  }
  else if (testMode === 'entry' || testMode === 'star' || testMode === '1') startStarGather();
  else if (testMode === 'dance') startAudioDance();
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
    const figureOrderForImages = [2, 4, 0, 3, 1];
    audioDancers.forEach((dancer, index) => {
      const figure = timeFigures[figureOrderForImages[index]];
      dancer.setEntranceOrigin(figure.x, figure.y);
    });
  }
  storyStage = 'audioDance';
  audioDanceStartedAt = millis() / 1000;
  if (audioStatus) {
    audioStatus.html(audioMechanic && audioMechanic.started
      ? 'Your sound now controls the dancers.'
      : 'Enable the microphone, then make some sound to control the dancers.');
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
    : {
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
  if (storyStage === 'starGather') {
    drawStarGathering(time);
    return;
  }

  const elapsed = audioDanceStartedAt > 0 ? time - audioDanceStartedAt : 0;
  const rowStart = audioReducedMotion ? 0 : 0.35;
  const rowDuration = audioReducedMotion ? 0.2 : 4.0;
  const peopleTransition = strongEaseInOut(constrain(
    (elapsed - rowStart) / rowDuration,
    0,
    1
  ));
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
  drawGatheredCharacters(time, 1 - peopleTransition);
  drawRisingStar(time, width / 2, 82, 1 - peopleTransition, 1);
  drawAudioDancers(time, peopleTransition, 1);
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
  scale(soundPulse * flicker);
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
    dancer.display(entrance, backgroundProgress);
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

  const mode = audioData.shortSound
    ? 'SHORT'
    : audioData.longSound
      ? 'HOLD'
      : audioData.intensity > 0.07
        ? 'JUMP'
        : 'LISTEN';
  const spacing = audioData.spread < 0.84 ? 'GATHER' : 'SPREAD';
  if (audioValuesPanel) {
    audioValuesPanel.html(
      `<strong>MODE: ${mode}</strong> &nbsp; <strong>SPACING: ${spacing}</strong><br>` +
      `VOLUME ${audioData.intensity.toFixed(2)} &nbsp; ` +
      `BASS ${audioData.bass.toFixed(2)} &nbsp; ` +
      `MID ${audioData.mid.toFixed(2)} &nbsp; ` +
      `TREBLE ${audioData.treble.toFixed(2)}<br>` +
      `SUSTAIN ${audioData.sustain.toFixed(2)} &nbsp; ` +
      `SPREAD ${audioData.spread.toFixed(2)}`
    );
  }

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
  fill(255, 235);
  textAlign(RIGHT, BOTTOM);
  textSize(10);
  textStyle(BOLD);
  text(mode, width - 18, meterBottom - 39);
  textSize(9);
  text(spacing, width - 18, meterBottom - 27);
  textStyle(NORMAL);
  pop();
}

function resetAudio() {
  if (audioMechanic) audioMechanic.stopAudio();
  audioData = {
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
  audioCloudOffset = 0;
  starGatherStartedAt = 0;
  audioDanceStartedAt = 0;
  audioStartsFromTimeCircle = false;

  if (audioButton) {
    audioButton.removeAttribute('disabled');
    audioButton.html('Enable microphone');
  }
  if (audioStatus) audioStatus.html('Audio is off');
  if (audioValuesPanel) {
    audioValuesPanel.html('Live sound values will appear after enabling the microphone.');
  }
}
