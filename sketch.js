// ========================================
// MOVE TOGETHER
// MAIN SKETCH
//
// Vy     → User Input
// Emery  → Time-based
// Zicen  → Audio
// ========================================

// AI acknowledgement — Emery's shared integration additions:
// OpenAI Codex assisted with the time-based preload/setup/update hooks and the
// timeCircleReady -> startStarGather handoff. These connect Emery's module to
// the shared controller; this is not an authorship claim over teammates' code.
// Main controller for the staged kite story.
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const GROUND_Y = 369;
const PAPER = '#FFDF2B';
const GRASS = '#BCEB35';
const WALK_END_X = 640;

let storyStage = 'intro';
let characterX = 105;
let characterFade = 0;
let finishedAt = 0;
let arrivalAt = 0;
let midpointReached = false;
let lastStoryTime = 0;
let walkFinished = false;
let rainMusic;
let rainMusicPlaying = false;
const RAIN_STAGES = [
  'rainStorm', 'soSad', 'rainFace', 'wet', 'pinkReveal'
];

function preload() {
  preloadCharacterImages();
  preloadAudioAssets();
  preloadBackgroundAssets();
  preloadTimeBasedAssets();
  rainMusic = loadSound('assets/user input/rainsound/rainsound.mp3');
}

function setup() {
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  canvas.parent('sketch-holder');
  strokeCap(ROUND);
  strokeJoin(ROUND);
  textFont('Arial, sans-serif');
  setupTimeBased();
  setupAudio();
  setupAudioTestMode();
  // Optional direct preview; the normal page starts with Vy's opening.
  if (new URLSearchParams(location.search).has('timeDemo')) {
    characterX = 640;
    character2X = 520;
    characterFade = 1;
    character2Giving = true;
    startTimeBased();
  }
}

function draw() {
  const time = millis() / 1000;
  const dt = min(0.05, max(0, time - lastStoryTime));
  lastStoryTime = time;
  updateAudio();

  const inRainScene = RAIN_STAGES.includes(storyStage) ||
    (storyStage === 'timeBased' && time - timeStartedAt < 1.2);
  if (inRainScene && rainMusic?.isLoaded() && !rainMusicPlaying) {
    rainMusic.setLoop(true);
    rainMusic.setVolume(0.15);
    rainMusic.play();
    rainMusicPlaying = true;
  } else if (!inRainScene && rainMusicPlaying) {
    rainMusic.stop();
    rainMusicPlaying = false;
  }

  // Emery owns this section until the five characters complete their circle.
  // The finished circle is then handed directly to Zicen's rising-star scene.
  if (storyStage === 'timeBased') {
    drawBackground(time, false);
    updateTimeBased(time);
    if (timeElapsed < 1.2) {
      const rainAmount = 1 - timeProgress(timeElapsed, 0, 1.2);
      if (rainMusicPlaying) rainMusic.setVolume(0.15 * rainAmount);
      push();
      drawingContext.globalAlpha *= rainAmount;
      drawRain(time, true);
      pop();
    }
    drawTimeBased();
    drawAudio();
    if (timeCircleReady && !new URLSearchParams(location.search).has('hold')) {
      startStarGather();
    }
    return;
  }

  // The final audio scene owns the whole canvas after the character enters
  // the cave, so the outdoor story is intentionally skipped in these states.
  if (isAudioFinaleStage()) {
    drawAudioFinale(time);
    drawAudio();
    return;
  }

  // Wind stops after the kite escapes; rain starts on the next click.
  drawBackground(time, storyStage === 'finished');
  // Keep heavy rain visible after the final sad image appears.
  if (['rainStorm', 'rainFace', 'soSad'].includes(storyStage)) drawRain(time, true);

  if (storyStage === 'intro') {
    drawClickArrow();
    drawAudio();
    return;
  }
  if (storyStage === 'ready') {
    drawStartPrompt();
    drawAudio();
    return;
  }

  if (storyStage === 'fadeIn') {
    characterFade = min(1, characterFade + dt / 1.8);
    if (characterFade >= 1) storyStage = 'holding';
    
  }
  if (storyStage === 'walking') {
    const walkTargetX = midpointReached ? WALK_END_X : width / 2;
    characterX = min(walkTargetX, characterX + dt * 48);
    if (characterX >= walkTargetX) {
      if (!midpointReached) {
        // Pause at the midpoint while the tethered kite keeps rising.
        storyStage = 'arrival';
        arrivalAt = time;
      } else {
        // Finish the story only after Vy completes the second walk.
        storyStage = 'finished';
        walkFinished = true;
        finishedAt = time;
      }
    }
  }
  updateAndDrawVy(time, dt);
  drawAudio();
}

const LANDSCAPE_INK = '#10110E';
const DAY_LANDSCAPE = {
  sky: PAPER,
  ground: GRASS,
  ink: LANDSCAPE_INK,
  leftMountain: '#20BDF0',
  rightMountain: '#FF747D',
  smallMountain: '#FFA323',
  coralBush: '#FF747D',
  leaves: '#008D68',
  accentBush: '#FFA323'
};
const NIGHT_LANDSCAPE = {
  sky: '#11163F',
  ground: '#244F45',
  ink: '#090B20',
  leftMountain: '#233B78',
  rightMountain: '#52316F',
  smallMountain: '#8A466B',
  coralBush: '#442658',
  leaves: '#123E42',
  accentBush: '#6C385B',
  night: true
};
function drawBackground(time, windy = false) {
  // New static background.
  drawLandscape();

  // Shared outdoor sky: automatic clouds; Zicen retains the night palette.
  drawSharedSky(time);

  if (windy) {
    drawWind(time);
  }
}


// ========================================
// STATIC LANDSCAPE
// ========================================

// AI acknowledgement — Emery's original daytime landscape contribution:
// The base geometry in drawLandscape, drawMountainBackdrop, drawLandscapeBush,
// drawGrassDetails, drawCornerFoliage and drawLeafFan was generated/refined with
// OpenAI Codex. Basic p5 shapes and Bezier curves keep bold flat-colour outlines.
// Zicen added the day/night palette interface and night-specific sky functions.
// Keeping one ground level (GROUND_Y) lets both character mechanics share it.
function drawLandscape(palette = DAY_LANDSCAPE, time = 0) {
  push();

  rectMode(CORNER);
  ellipseMode(CENTER);
  strokeCap(ROUND);
  strokeJoin(ROUND);

  noStroke();
  fill(palette.sky);
  rect(0, 0, width, height);
  if (palette.night) drawNightSkyDetails(time, palette.ink);

  // Mountains and shrubs are behind the walking surface.
  drawMountainBackdrop(palette);

  // Keep the ground at exactly GROUND_Y = 369.
  noStroke();
  fill(palette.ground);
  rect(0, GROUND_Y, width, height - GROUND_Y);

  // Straight horizontal ground boundary.
  stroke(palette.ink);
  strokeWeight(4);
  line(0, GROUND_Y, width, GROUND_Y);

  drawGrassDetails(palette.ink);
  drawCornerFoliage(palette);

  // Rounded black frame.
  noFill();
  stroke(palette.ink);
  strokeWeight(5);
  rect(3, 3, width - 6, height - 6, 9);

  pop();
}


// ========================================
// MOUNTAINS AND LOW SHRUBS
// ========================================

function drawMountainBackdrop(palette = DAY_LANDSCAPE) {
  push();

  // All horizontal coordinates are based on an 800px canvas.
  scale(width / 800, 1);

  stroke(palette.ink);
  strokeWeight(4);

  // Large blue mountain on the left.
  fill(palette.leftMountain);

  beginShape();
  vertex(0, GROUND_Y);
  vertex(0, GROUND_Y - 205);

  bezierVertex(
    34, GROUND_Y - 218,
    53, GROUND_Y - 183,
    72, GROUND_Y - 155
  );

  bezierVertex(
    90, GROUND_Y - 126,
    118, GROUND_Y - 153,
    154, GROUND_Y - 137
  );

  bezierVertex(
    191, GROUND_Y - 121,
    199, GROUND_Y - 73,
    221, GROUND_Y - 66
  );

  bezierVertex(
    264, GROUND_Y - 59,
    304, GROUND_Y - 46,
    320, GROUND_Y
  );

  endShape(CLOSE);

  // Large coral mountain on the right.
  fill(palette.rightMountain);

  beginShape();
  vertex(516, GROUND_Y);

  bezierVertex(
    543, GROUND_Y - 65,
    615, GROUND_Y - 121,
    679, GROUND_Y - 130
  );

  bezierVertex(
    716, GROUND_Y - 135,
    715, GROUND_Y - 155,
    744, GROUND_Y - 183
  );

  bezierVertex(
    763, GROUND_Y - 201,
    784, GROUND_Y - 208,
    800, GROUND_Y - 204
  );

  vertex(800, GROUND_Y);
  endShape(CLOSE);

  // Smaller orange mountain on the left.
  fill(palette.smallMountain);

  beginShape();
  vertex(56, GROUND_Y);

  bezierVertex(
    62, GROUND_Y - 48,
    104, GROUND_Y - 85,
    133, GROUND_Y - 79
  );

  bezierVertex(
    170, GROUND_Y - 73,
    185, GROUND_Y - 35,
    195, GROUND_Y
  );

  endShape(CLOSE);

  // Smaller orange mountain on the right.
  beginShape();
  vertex(700, GROUND_Y);

  bezierVertex(
    715, GROUND_Y - 46,
    763, GROUND_Y - 102,
    800, GROUND_Y - 105
  );

  vertex(800, GROUND_Y);
  endShape(CLOSE);

  // Shrubs at the feet of the mountains.
  drawLandscapeBush(
    0, GROUND_Y, 130, 102, palette.coralBush, palette.ink
  );

  drawLandscapeBush(
    0, GROUND_Y, 48, 25, palette.leaves, palette.ink
  );

  drawLandscapeBush(
    110, GROUND_Y, 34, 16, palette.leaves, palette.ink
  );

  drawLandscapeBush(
    634, GROUND_Y, 75, 37, palette.leaves, palette.ink
  );

  drawLandscapeBush(
    765, GROUND_Y, 40, 24, palette.leaves, palette.ink
  );

  // Small decorative black marks.
  stroke(palette.ink);
  strokeWeight(3);

  line(83, GROUND_Y - 168, 81, GROUND_Y - 186);
  line(98, GROUND_Y - 168, 108, GROUND_Y - 180);

  line(692, GROUND_Y - 167, 685, GROUND_Y - 185);
  line(709, GROUND_Y - 174, 710, GROUND_Y - 192);

  pop();
}


// Reusable shrub.
// x and y indicate its lower-left position.

function drawLandscapeBush(
  x, y, bushWidth, bushHeight, colour, ink = LANDSCAPE_INK
) {
  push();

  translate(x, y);
  scale(bushWidth / 120, bushHeight / 100);

  fill(colour);
  stroke(ink);
  strokeWeight(4);

  beginShape();
  vertex(0, 0);
  vertex(0, -66);

  bezierVertex(3, -106, 33, -111, 42, -72);
  bezierVertex(56, -99, 83, -81, 79, -53);
  bezierVertex(99, -72, 119, -49, 104, -27);
  bezierVertex(121, -32, 128, -10, 120, 0);

  endShape(CLOSE);

  pop();
}


// ========================================
// GRASS MARKS AND DOTS
// ========================================

function drawGrassDetails(ink = LANDSCAPE_INK) {
  push();

  // Positions are measured from the ground boundary.
  translate(0, GROUND_Y);
  scale(
    width / 800,
    (height - GROUND_Y) / 131
  );

  stroke(ink);
  strokeWeight(3);

  // Fixed positions keep the background stable.
  const tufts = [
    [166, 26],
    [235, 100],
    [513, 25],
    [565, 95],
    [691, 29],
    [773, 36],
    [55, 77],
    [106, 55]
  ];

  for (const tuft of tufts) {
    const x = tuft[0];
    const y = tuft[1];

    line(x - 8, y, x - 12, y - 7);
    line(x, y - 2, x, y - 11);
    line(x + 8, y, x + 12, y - 7);
  }

  const dotClusters = [
    [291, 42],
    [625, 46],
    [390, 103]
  ];

  noStroke();
  fill(ink);

  for (const cluster of dotClusters) {
    const x = cluster[0];
    const y = cluster[1];

    circle(x, y, 4);
    circle(x + 10, y + 5, 4);
    circle(x + 4, y - 7, 4);
  }

  pop();
}


// ========================================
// FOREGROUND CORNER PLANTS
// ========================================

function drawCornerFoliage(palette = DAY_LANDSCAPE) {
  push();

  // Anchor these plants to the bottom of the canvas.
  translate(0, height);
  scale(
    width / 800,
    (height - GROUND_Y) / 131
  );

  drawLeafFan(0, 0, 1, palette.leaves, palette.ink);
  drawLeafFan(800, 0, -1, palette.leaves, palette.ink);

  // Orange plant in front of the right-hand leaves.
  drawLandscapeBush(
    712, 0, 74, 60, palette.accentBush, palette.ink
  );

  pop();
}


// direction = 1 faces right; -1 mirrors the plant.

function drawLeafFan(x, y, direction, colour = '#008D68', ink = LANDSCAPE_INK) {
  push();

  translate(x, y);
  scale(direction, 1);

  fill(colour);
  stroke(ink);
  strokeWeight(4);

  beginShape();
  vertex(0, 0);
  vertex(0, -67);

  bezierVertex(3, -97, 28, -95, 28, -61);
  bezierVertex(51, -108, 74, -86, 47, -49);
  bezierVertex(85, -87, 106, -59, 70, -30);
  bezierVertex(115, -60, 137, -33, 100, -8);
  bezierVertex(126, -31, 145, -10, 130, 0);

  endShape(CLOSE);

  pop();
}

function drawNightSkyDetails(time, ink) {
  push();
  noStroke();
  const stars = [
    [55, 58, 4], [142, 105, 3], [226, 53, 5], [318, 124, 3],
    [402, 65, 4], [504, 112, 5], [607, 51, 3], [731, 96, 4]
  ];
  for (let i = 0; i < stars.length; i += 1) {
    const twinkle = 0.75 + sin(time * 2 + i * 1.8) * 0.25;
    fill(255, 239, 157, 210);
    circle(stars[i][0], stars[i][1], stars[i][2] * twinkle);
  }
  const moonX = 676;
  const moonY = 92;
  const moonPulse = 1 + sin(time * 1.15) * 0.025;

  // Soft concentric light stays behind the outlined hand-drawn moon.
  noStroke();
  fill(255, 232, 126, 24);
  circle(moonX, moonY, 112 * moonPulse);
  fill(255, 236, 150, 42);
  circle(moonX, moonY, 82 * moonPulse);

  stroke(ink);
  strokeWeight(4);
  fill('#F6E7A2');
  circle(moonX, moonY, 62);

  // Simple crater marks retain the crayon-like graphic language.
  noStroke();
  fill(201, 174, 104, 105);
  circle(moonX - 14, moonY - 10, 9);
  circle(moonX + 13, moonY - 14, 6);
  circle(moonX + 16, moonY + 9, 11);
  circle(moonX - 8, moonY + 16, 6);
  circle(moonX - 19, moonY + 7, 4);
  pop();
}

function drawNightLandscape(time, opacityAmount = 1) {
  if (opacityAmount <= 0) return;
  push();
  drawingContext.globalAlpha *= opacityAmount;
  drawLandscape(NIGHT_LANDSCAPE, time);
  pop();
}

function drawSun(x, y, radius) {
  noStroke();
  fill('#F43F3F');
  circle(x, y, radius * 2);
}

function drawCloud(x, y, cloudScale) {
  push();
  translate(x, y);
  scale(cloudScale);
  noStroke();
  fill('#ffffff');
  ellipse(0, 12, 76, 28);
  circle(-18, 3, 28);
  circle(0, -5, 36);
  circle(21, 4, 27);
  pop();
}
