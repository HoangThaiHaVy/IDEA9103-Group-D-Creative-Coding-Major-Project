// ========================================
// MOVE TOGETHER
// MAIN SKETCH
//
// Vy     → User Input
// Emery  → Time-based
// Zihen  → Audio
// ========================================

// Main controller for the staged kite story.
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const GROUND_Y = 369;
const PAPER = '#FFDF2B';
const GRASS = '#BCEB35';

let storyStage = 'intro';
let characterX = 105;
let characterFade = 0;
let finishedAt = 0;
let arrivalAt = 0;
let midpointReached = false;
let lastStoryTime = 0;
let walkFinished = false;

function preload() {
  preloadCharacterImages();
}

function setup() {
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  canvas.parent('sketch-holder');
  strokeCap(ROUND);
  strokeJoin(ROUND);
  textFont('Arial, sans-serif');
}

function draw() {
  const time = millis() / 1000;
  const dt = min(0.05, max(0, time - lastStoryTime));
  lastStoryTime = time;

  drawBackground(time, storyStage === 'finished');
  if (storyStage === 'intro') {
    drawClickArrow();
    return;
  }
  if (storyStage === 'ready') {
    drawStartPrompt();
    return;
  }

  if (storyStage === 'fadeIn') {
    characterFade = min(1, characterFade + dt / 1.8);
    if (characterFade >= 1) storyStage = 'holding';
    
  }
  if (storyStage === 'walking') {
    const walkTargetX = midpointReached ? width - 85 : width / 2;
    characterX = min(walkTargetX, characterX + dt * 48);
    if (characterX >= walkTargetX) {
      if (!midpointReached) {
        // Pause at the midpoint while the tethered kite keeps rising.
        storyStage = 'arrival';
        arrivalAt = time;
      } else 
        // Finish the story only after Vy completes the second walk.
        storyStage = 'finished';
        walkFinished = true;
        finishedAt = time;
      }
  }
  updateAndDrawVy(time, dt);
}

const LANDSCAPE_INK = '#10110E';
function drawBackground(time, windy = false) {
  // New static background.
  drawLandscape();

  // Keep the existing sun, cloud and wind behaviour for now.
  drawSun(99, 82, 34);
  drawCloud(324, 84, 1);
  drawCloud(630, 124, 0.78);

  if (windy) {
    drawWind(time);
  }
}


// ========================================
// STATIC LANDSCAPE
// ========================================

function drawLandscape() {
  push();

  rectMode(CORNER);
  ellipseMode(CENTER);
  strokeCap(ROUND);
  strokeJoin(ROUND);

  background(PAPER);

  // Mountains and shrubs are behind the walking surface.
  drawMountainBackdrop();

  // Keep the ground at exactly GROUND_Y = 369.
  noStroke();
  fill(GRASS);
  rect(0, GROUND_Y, width, height - GROUND_Y);

  // Straight horizontal ground boundary.
  stroke(LANDSCAPE_INK);
  strokeWeight(4);
  line(0, GROUND_Y, width, GROUND_Y);

  drawGrassDetails();
  drawCornerFoliage();

  // Rounded black frame.
  noFill();
  stroke(LANDSCAPE_INK);
  strokeWeight(5);
  rect(3, 3, width - 6, height - 6, 9);

  pop();
}


// ========================================
// MOUNTAINS AND LOW SHRUBS
// ========================================

function drawMountainBackdrop() {
  push();

  // All horizontal coordinates are based on an 800px canvas.
  scale(width / 800, 1);

  stroke(LANDSCAPE_INK);
  strokeWeight(4);

  // Large blue mountain on the left.
  fill('#20BDF0');

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
  fill('#FF747D');

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
  fill('#FFA323');

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
    0, GROUND_Y, 130, 102, '#FF747D'
  );

  drawLandscapeBush(
    0, GROUND_Y, 48, 25, '#008D68'
  );

  drawLandscapeBush(
    110, GROUND_Y, 34, 16, '#008D68'
  );

  drawLandscapeBush(
    634, GROUND_Y, 75, 37, '#008D68'
  );

  drawLandscapeBush(
    765, GROUND_Y, 40, 24, '#008D68'
  );

  // Small decorative black marks.
  stroke(LANDSCAPE_INK);
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
  x, y, bushWidth, bushHeight, colour
) {
  push();

  translate(x, y);
  scale(bushWidth / 120, bushHeight / 100);

  fill(colour);
  stroke(LANDSCAPE_INK);
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

function drawGrassDetails() {
  push();

  // Positions are measured from the ground boundary.
  translate(0, GROUND_Y);
  scale(
    width / 800,
    (height - GROUND_Y) / 131
  );

  stroke(LANDSCAPE_INK);
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
  fill(LANDSCAPE_INK);

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

function drawCornerFoliage() {
  push();

  // Anchor these plants to the bottom of the canvas.
  translate(0, height);
  scale(
    width / 800,
    (height - GROUND_Y) / 131
  );

  drawLeafFan(0, 0, 1);
  drawLeafFan(800, 0, -1);

  // Orange plant in front of the right-hand leaves.
  drawLandscapeBush(
    712, 0, 74, 60, '#FFA323'
  );

  pop();
}


// direction = 1 faces right; -1 mirrors the plant.

function drawLeafFan(x, y, direction) {
  push();

  translate(x, y);
  scale(direction, 1);

  fill('#008D68');
  stroke(LANDSCAPE_INK);
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

function drawSun(x, y, radius) {
  noStroke();
  fill('');
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

function drawWind(time) {
  push();
  noFill();
  strokeCap(ROUND);
  strokeJoin(ROUND);

  const flows = 7;
  const spacing = height / (flows + 1);

  for (let i = 0; i < flows; i++) {
    const y = spacing * (i + 1);
    const speed = 55 + (i % 3) * 18;
    const travel = (time * speed + i * 173) % (width + 240);
    const x = travel - 120;
    const length = 90 + (i % 4) * 24;
    const sway = 5 + (i % 3) * 2;

    stroke(138, 154, 160, 95 + (i % 3) * 20);
    strokeWeight(i % 3 === 0 ? 2.2 : 1.5);

    beginShape();
    curveVertex(x - 20, y);
    curveVertex(x, y);

    curveVertex(
      x + length * 0.3,
      y + sin(time * 2 + i) * sway
    );
    curveVertex(
      x + length * 0.65,
      y + sin(time * 2.5 + i * 1.7) * sway
    );
    curveVertex(
      x + length,
      y + sin(time * 2 + i * 0.8) * sway * 0.5
    );

    // The tail section tapers gently
    curveVertex(x + length + 18, y);
    curveVertex(x + length + 18, y);
    endShape();
  }

  pop();
}


drawLandscape()
drawMountainBackdrop()
drawLandscapeBush()
drawGrassDetails()
drawCornerFoliage()
drawLeafFan()

class Figure {
  constructor(x, y, colour) {
    this.x = x;
    this.y = y;
    this.targetX = x;

    this.colour = colour;
    this.pose = 'standing';
    this.facing = 1;
    this.hasCandy = false;

    // Shared movement properties
    this.sway = 0;
    this.walk = 0;
    this.open = 0;
    this.stand = 1;
  }
   draw() {
    this.drawBody();
    this.drawArms();
    this.drawLegs();
    this.drawHead();
  }
}
