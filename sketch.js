// ========================================
// MOVE TOGETHER
// SHARED MAIN CONTROLLER
//
// Vy     -> User input
// Emery  -> Time-based
// Zicen  -> Audio
// ========================================

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const GROUND_Y = 380;

const INK = '#171717';
const PAPER = '#fff4d4';
const GROUND = '#8bdc3f';

const MOVE_EASING = 0.075;
const ARRIVAL_DISTANCE = 2;
const PREFERS_REDUCED_MOTION = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// Shared story state. Individual mechanic files read and update these values.
let storyStep = 0;
let isAnimating = false;
let character1;
let character2;
let candy;
let statusText;
let restartButton;

let collectiveStarted = false;
let collectiveComplete = false;
let collectiveTextAlpha = 0;
let collectiveFigures = [];
let collectiveTargets = [];
let collectiveMovingIndex = 0;
let collectiveJoinedCount = 0;
let collectiveGathered = false;
let highFivePairIndex = -1;
let highFiveGroupActive = false;
let highFiveStartedAt = 0;

function setup() {
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  canvas.mousePressed(handleUserInput);

  setupUserInput();
  setupTimeBased();
  setupAudio();
}

function draw() {
  background(PAPER);

  // Shared environment.
  noStroke();
  fill(GROUND);
  rect(0, GROUND_Y, width, height - GROUND_Y);

  updateUserInput();
  updateTimeBased();
  updateAudio();

  drawTimeBased();
  drawAudio();
  drawUserInput();
  drawCollectiveScene();
}

function resetAllMechanics() {
  resetStory();
  resetTimeBased();
  resetAudio();
}
