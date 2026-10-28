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
const PAPER = '#f8f6ed';
const GRASS = '#75bd68';

let storyStage = 'intro';
let characterX = 105;
let characterFade = 0;
let finishedAt = 0;
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
    characterX = min(width - 85, characterX + dt * 48);
    if (characterX >= width - 85) {
      storyStage = 'finished';
      walkFinished = true;
      finishedAt = time;
    }
  }
  updateAndDrawVy(time, dt);
}

function drawBackground(time, windy = false) {
  background(PAPER);
  noStroke();
  fill(GRASS);
  rect(0, GROUND_Y, width, height - GROUND_Y);
  drawSun(99, 82, 34);
  drawCloud(324, 84, 1);
  drawCloud(630, 124, 0.78);
  if (windy) drawWind(time);
}

function drawSun(x, y, radius) {
  noStroke();
  fill('#f5c84b');
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
  stroke('#8a9aa0');
  strokeWeight(2);
  strokeCap(ROUND);
  for (let i = 0; i < 6; i++) {
    const y = 120 + i * 38;
    const x = (time * 100 + i * 145) % (width + 120) - 60;
    line(x, y, x + 45, y);
    line(x + 45, y, x + 58, y - 6);
  }
  pop();
}


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
