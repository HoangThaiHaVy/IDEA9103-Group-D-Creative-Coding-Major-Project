// Emery's time-based movement, developed with OpenAI Codex assistance.
// Read: startTimeBased -> updateTimeBased -> drawTimeBased.
// One continuous clock and shared beat avoid resets at scene transitions.
let timeFigures = [];
let timeStartedAt = 0;
let timeElapsed = 0;
let timeStartX = [640, 520];
let timeCircleReady = false;
const TIME_END = 32;
const DANCE_PERIOD = 1.8;
const TIME_LINE_X = [580, 485, 390, 295, 200];
const TIME_COLOURS = ['#20CD0A', '#F00085', '#FA4945', '#18A9EE', '#FFD02E'];
// Match the visible PNG bodies, not the images' transparent margins.
// Vy's standing bodies measure 196.19px (green) and 217.12px (pink).
const TIME_BASE_SCALES = [196.192733 / 209.5, 217.117517 / 209, 196.192733 / 209.5, 196.192733 / 209.5, 196.192733 / 209.5];
const TIME_BASE_Y = [372.658768 - 10 * TIME_BASE_SCALES[0], 382.237251 - 10 * TIME_BASE_SCALES[1], 372.658768 - 10 * TIME_BASE_SCALES[2], 372.658768 - 10 * TIME_BASE_SCALES[3], 372.658768 - 10 * TIME_BASE_SCALES[4]];
const TIME_ROW_ORDER = [4, 3, 2, 1, 0];
const UMBRELLA_RELEASE = 1.8;

function setupTimeBased() {
  prepareCharacterHeads();
  timeFigures = TIME_COLOURS.map((c, i) => new Character(i, 0, GROUND_Y + 12, c));
}

function startTimeBased(now = millis() / 1000) {
  timeStartedAt = now;
  timeElapsed = 0;
  timeCircleReady = false;
  timeStartX = [characterX, character2X];
  storyStage = 'timeBased';
  if (audioStatus) audioStatus.html('A small kindness becomes a shared rhythm.');
  updateTimeBased(now);
}

function timeProgress(t, start, end) {
  return constrain((t - start) / (end - start), 0, 1);
}

function timeEase(t, start, end) {
  // A cubic easing curve makes parameter changes start and finish gradually.
  // p is an interval's 0–1 completion ratio; no animation library is used.
  const p = timeProgress(t, start, end);
  return p * p * (3 - 2 * p);
}

function timeWindow(t, start, fadeIn, fadeOut, end) {
  return timeEase(t, start, fadeIn) * (1 - timeEase(t, fadeOut, end));
}

function updateTimeBased(now = millis() / 1000) {
  // p5 time/interpolation references:
  // https://p5js.org/reference/p5/millis/ and https://p5js.org/reference/p5/lerp/
  timeElapsed = max(0, now - timeStartedAt);
  const t = timeElapsed;
  const rise = timeEase(t, 0.8, 4);
  const sync = timeEase(t, 4, 6.2);
  const joining = timeEase(t, 8.5, 14);
  const circle = timeEase(t, 23, 30);
  const phase = TWO_PI * (t - 4) / DANCE_PERIOD;
  const pairDance = timeWindow(t, 3.7, 4.5, 8, 9);
  const walking = timeWindow(t, 8.5, 9.2, 13.3, 14);
  const groupDance = timeEase(t, 14, 15);
  const highKnees = timeEase(t, 18, 19);
  const circleWalking = timeWindow(t, 23, 24, 29, 30);
  for (let i = 0; i < timeFigures.length; i++) {
    const pair = i < 2;
    // Companions travel rightwards together from outside the left edge.
    const startX = pair ? timeStartX[i] - (i === 0 ? 35 : 15) * rise : -90 - (i - 2) * 95;
    const lineX = lerp(startX, TIME_LINE_X[i], joining);
    const angle = PI + (4 - i) * TWO_PI / 5;
    const orbit = (t - 30) * 0.055 * timeEase(t, 30, 32);
    const circleX = 400 + cos(angle + orbit) * 190;
    const circleY = GROUND_Y + 59 + sin(angle + orbit) * 60;
    // Character One's half-beat delay shrinks to zero; both then use one phase.
    const delay = i === 0 ? PI * (1 - sync) : 0;
    const sharedStep = sin(phase + delay);
    const dancing = (pair ? pairDance : 0) + groupDance;
    const march = sin(TWO_PI * (t - 8.5) / 0.75);
    timeFigures[i].update({
      x: lerp(lineX, circleX, circle) + sharedStep * 6 * dancing * (1 - circle),
      y: lerp(TIME_BASE_Y[i], circleY, circle),
      stand: i === 0 ? rise : 1,
      sway: sharedStep * dancing * 0.85,
      step: sharedStep * dancing + march * walking + sin(phase) * circleWalking * 0.4,
      knee: lerp(9, 37, highKnees) * dancing + 11 * walking + 8 * circleWalking,
      bounce: (1 - cos(phase * 2)) * lerp(1.5, 3, highKnees) * dancing,
      open: lerp(0.12, 0.62, timeEase(t, 20.5, 23)) * groupDance + pairDance * 0.13,
      reach: 78 * highKnees * (1 - timeEase(t, 23, 25)),
      scale: lerp(1, 0.9, circle) * TIME_BASE_SCALES[i],
      // Brief profile turn: look left while travelling, then face the audience.
      facing: pair ? cos(PI * timeWindow(t, 8, 8.8, 13.4, 14.2)) : 1
    });
  }
  connectTimeFigures(t);
  timeCircleReady = t >= TIME_END;
}

function timeBlendPoint(a, b, amount) {
  return {
    x: lerp(a.x, b.x, amount),
    y: lerp(a.y, b.y, amount)
  };
}

function connectTimeFigures(t) {
  const first = timeFigures[0].pose,
    second = timeFigures[1].pose;
  const holding = timeEase(t, 0.3, 1.2) * (1 - timeEase(t, 14, 15));
  const hand = {
    x: (first.shoulder.x + second.shoulder.x) / 2,
    y: (first.shoulder.y + second.shoulder.y) / 2 + 42
  };
  first.leftHand = timeBlendPoint(first.leftHand, hand, holding);
  second.rightHand = timeBlendPoint(second.rightHand, hand, holding);
  // Shoulder-linked step-touch, then release for a high-knee phrase.
  const shoulderLink = timeWindow(t, 14, 15.2, 17.7, 18.7);
  const row = TIME_ROW_ORDER;
  for (let n = 0; n < row.length - 1; n++) {
    const left = timeFigures[row[n]].pose,
      right = timeFigures[row[n + 1]].pose;
    left.rightHand = timeBlendPoint(left.rightHand, right.leftShoulder, shoulderLink);
  }
  // The circle preserves neighbour order; each linked hand is a shared point.
  const circleLink = timeEase(t, 26, 30);
  for (let n = 0; n < row.length; n++) {
    const a = timeFigures[row[n]].pose,
      b = timeFigures[row[(n + 1) % row.length]].pose;
    const hand = {
      x: (a.shoulder.x + b.shoulder.x) / 2,
      y: (a.shoulder.y + b.shoulder.y) / 2 + 31
    };
    a.rightHand = timeBlendPoint(a.rightHand, hand, circleLink);
    b.leftHand = timeBlendPoint(b.leftHand, hand, circleLink);
  }
  // The free left hand visibly holds, swings and releases the umbrella.
  const umbrella = getTimeUmbrellaPose(t);
  const throwing = timeEase(t, 0, 0.6) * (1 - timeEase(t, 2.2, 3.1));
  const released = getTimeUmbrellaPose(UMBRELLA_RELEASE);
  const grip = t <= UMBRELLA_RELEASE ? umbrella.grip : timeBlendPoint(released.grip, {
    x: second.shoulder.x - 95,
    y: second.shoulder.y - 75
  }, timeEase(t, UMBRELLA_RELEASE, 2.15));
  second.leftHand = timeBlendPoint(second.leftHand, grip, throwing);
}

function drawTimeBased() {
  const t = timeElapsed,
    reveal = timeEase(t, 0, 0.75);
  if (reveal < 1) {
    push();
    drawingContext.globalAlpha *= 1 - reveal;
    drawCharacterAndKite(timeStartX[0], GROUND_Y, timeStartedAt + t, {
      wet: true,
      hideKite: true,
      fade: 1
    });
    drawPinkCharacterReveal();
    pop();
  }
  if (reveal > 0) drawTimeUmbrella(t, reveal);
  for (const person of [...timeFigures].sort((a, b) => a.y - b.y)) person.display(reveal);
}

function getTimeUmbrellaPose(t) {
  // Start in the same position as the umbrella in Vy's final PNG scene.
  const imageWidth = 270 * character2GiveImage.width / character2GiveImage.height;
  const initialX = timeStartX[1] + imageWidth * 0.32;
  const initialY = GROUND_Y - 270 / 2 + 30 - 270 * 0.43;
  const releaseX = timeStartX[1] - 15 * timeEase(UMBRELLA_RELEASE, 0.8, 4) - 68;
  const releaseY = TIME_BASE_Y[1] - 238;
  const windup = timeEase(t, 0.65, UMBRELLA_RELEASE);
  let x = lerp(initialX, releaseX, windup);
  let y = lerp(initialY, releaseY, windup);
  let angle = -0.35 * windup;
  if (t > UMBRELLA_RELEASE) {
    const flight = t - UMBRELLA_RELEASE;
    x = releaseX - 320 * flight;
    y = releaseY - 105 * flight + 70 * flight * flight;
    angle = -0.35 - 1.5 * flight;
  }
  return {
    x,
    y,
    angle,
    grip: {
      x: x - sin(angle) * 77,
      y: y + cos(angle) * 77
    }
  };
}

function drawTimeUmbrella(t, opacity) {
  const umbrella = getTimeUmbrellaPose(t);
  // Stop drawing only once the entire umbrella is outside the frame.
  if (umbrella.x < -220) return;
  push();
  drawingContext.globalAlpha *= opacity;
  translate(umbrella.x, umbrella.y);
  rotate(umbrella.angle);
  scale(1.65);
  fill('#F7E5D2');
  stroke('#B83D78');
  strokeWeight(2);
  beginShape();
  vertex(-78, 0);
  bezierVertex(-66, -42, -36, -62, 0, -62);
  bezierVertex(36, -62, 66, -42, 78, 0);
  for (let x = 78; x > -78; x -= 39) {
    bezierVertex(x - 13, 10, x - 26, 10, x - 39, 0);
  }
  endShape(CLOSE);
  strokeWeight(1.5);
  line(0, -59, -39, 0);
  line(0, -59, 0, 0);
  line(0, -59, 39, 0);
  stroke('#6F0A45');
  strokeWeight(5);
  line(0, 0, 0, 77);
  noFill();
  arc(6, 77, 12, 12, 0, PI);
  pop();
}

function resetTimeBased() {
  timeStartedAt = 0;
  timeElapsed = 0;
  timeCircleReady = false;
}
