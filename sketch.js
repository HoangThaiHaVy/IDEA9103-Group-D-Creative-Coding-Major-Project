// ========================================
// MOVE TOGETHER
// MAIN SKETCH
//
// Vy     → User Input
// Emery  → Time-based
// Zihen  → Audio
// ========================================

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const GROUND_Y = 380;

const INK = '#171717';
const PAPER = '#fff4d4';
const GROUND = '#8bdc3f';

const MOVE_EASING = 0.075;
const ARRIVAL_DISTANCE = 2;

let groundDots = [];
let isAnimating = false;
let storyStep = 0;

let character1;
let character2;
let candy;

let statusText;
let restartButton;
// ========================================
// CLICK 7 — FINAL COLLECTIVE IMAGE
// ========================================

let collectiveFigures = [];
let collectiveStarted = false;
let collectiveComplete = false;
let collectiveTextAlpha = 0;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  textFont('Trebuchet MS');

  // Start each mechanic
  setupUserInput();
  setupTimeBased();
  setupAudio();

  // Create grass texture
  for (let row = 0; row < 3; row++) {
    for (let column = 0; column < 34; column++) {
      groundDots.push({
        x: 12 + column * 24 + random(-5, 5),
        y: 420 + row * 24 + random(-5, 5),
        size: random(2, 5)
      });
    }
  }
}


function draw() {
  background(PAPER);
  drawFrameAndGround();

  // ========================================
  // CLICKS 1–6: ORIGINAL STORY
  // ========================================
  if (!collectiveStarted) {
    updateUserInput();
    drawUserInput();

    updateTimeBased();
    drawTimeBased();

    updateAudio();
    drawAudio();
  }

  // ========================================
  // CLICKS 7–9: COLLECTIVE SCENE
  // ========================================
  else {
    // Update all five figures.
    collectiveFigures.forEach(figure => {
      figure.update();
    });

    // Check whether all five figures have arrived.
    const allArrived =
      collectiveFigures.length === 5 &&
      collectiveFigures.every(figure =>
        abs(figure.x - figure.targetX) < ARRIVAL_DISTANCE &&
        abs(figure.y - figure.targetY) < ARRIVAL_DISTANCE
      );

    // Unlock Click 8 only after the circle has formed.
    if (allArrived && !collectiveGathered) {
      collectiveFigures.forEach(figure => {
        figure.x = figure.targetX;
        figure.y = figure.targetY;
      });

      collectiveGathered = true;
      isAnimating = false;

      statusText.html(
        'The group is in a circle. Click 8 to start the first high-five.'
      );

      console.log("CIRCLE COMPLETE — CLICK 8 UNLOCKED");
    }

    // Draw the collective scene only once per frame.
    drawCollectiveScene();
  }
}




// ========================================
// BACKGROUND
// ========================================

function drawFrameAndGround() {

  // Green grass
  noStroke();
  fill(GROUND);

  beginShape();

  vertex(0, 390);

  bezierVertex( 55, 380, 105, 365, 165, 375);
  bezierVertex( 225, 385, 250, 400, 315, 385);

  bezierVertex( 375, 370, 420, 370, 480, 385);

  bezierVertex( 545, 400, 575, 395, 635, 380);

  bezierVertex( 700, 365, 740, 365, 780, 375);

  bezierVertex( 795, 380, 800, 390, 800, 398);

  vertex(width, height);
  vertex(0, height);

  endShape(CLOSE);


  // Grass outline
  noFill();
  stroke(INK);
  strokeWeight(6);

  beginShape();

  vertex(0, 390);

  bezierVertex( 55, 380, 105, 365, 165, 375);

  bezierVertex( 225, 385, 250, 400, 315, 385);

  bezierVertex( 375, 370, 420, 370, 480, 385);

  bezierVertex( 545, 400, 575, 395, 635, 380);

  bezierVertex(700, 365,740, 365,780, 375);

  bezierVertex(795, 380, 800, 390, 800, 398);

  endShape();
  // Khung đen bao quanh toàn canvas
  noFill();
  rectMode(CORNER);
  rect(3, 3, width - 6, height - 6);

  // Grass texture
  noStroke();
  fill(INK);

  for (const dot of groundDots) {
    rect(
      dot.x,
      dot.y,
      dot.size * 2.5,
      dot.size
    );
  }


  // Frame
  noFill();
  stroke(INK);
  strokeWeight(5);

  rect(3, 3, width - 6, height - 6);
}

// ========================================
// MOUSE
// ========================================

function mousePressed() {
  handleUserInput();
}


// ========================================
// RESET
// ========================================

function resetStory() {

  resetUserInput();
  resetTimeBased();
  resetAudio();
}
