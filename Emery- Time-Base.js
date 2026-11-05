// Emery's time-based movement, developed with OpenAI Codex assistance.
// Read: startTimeBased -> updateTimeBased -> drawTimeBased.
// One continuous clock and shared beat avoid resets at scene transitions.
let timeFigures = [];
let timeStartedAt = 0;
let timeElapsed = 0;
let timeStartX = [640, 520];
let timeCircleReady = false;
const GROUP_MUSIC_START = 14;
const MUSIC_BPM = 125;
const MUSIC_BEAT_SECONDS = 60 / MUSIC_BPM;
const GROUP_PHRASE_SECONDS = MUSIC_BEAT_SECONDS * 8;
const GROUP_DANCE_END = GROUP_MUSIC_START + GROUP_PHRASE_SECONDS * 5; // 33.2s
const DANCE_EXTENSION = GROUP_DANCE_END - 23; // Only the middle is extended.
const TIME_END = 32 + DANCE_EXTENSION; // 42.2s, same circle-ready interface.
let groupDanceMusic;
let groupMusicStarted = false;
const GROUP_MUSIC_VOLUME = 0.32;

function preloadTimeBasedAssets() {
  preloadCharacterHeads();
  // Happy Commercial (Piano) — MaxKoMusic, supplied by Emery.
  // Source/credit: https://www.chosic.com/download-audio/27305/
  groupDanceMusic = loadSound('assets/time-based/group-dance.mp3');
}
function stopGroupMusic() {
  if (groupDanceMusic && groupDanceMusic.isPlaying()) groupDanceMusic.stop();
}
function updateGroupMusic(elapsed) {
  // Offline video recording mixes this same track afterwards.
  if (window.__exportMode || !groupDanceMusic || !groupDanceMusic.isLoaded()) return;
  if (elapsed >= GROUP_MUSIC_START && elapsed < TIME_END) {
    if (!groupMusicStarted) {
      groupDanceMusic.setVolume(0);
      groupDanceMusic.play();
      groupMusicStarted = true;
    }
    const volume = GROUP_MUSIC_VOLUME * timeEase(elapsed, 14, 14.5) *
      (1 - timeEase(elapsed, TIME_END - 1.2, TIME_END));
    groupDanceMusic.setVolume(volume);
  } else if (elapsed >= TIME_END) {
    stopGroupMusic();
  }
}
function choreographyTime(elapsed) {
  // The original opening and complete line-to-circle sequence are reused.
  if (elapsed <= 23) return elapsed;
  if (elapsed < GROUP_DANCE_END) return 23;
  return elapsed - DANCE_EXTENSION;
}
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
  stopGroupMusic();
  groupMusicStarted = false;
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
  const t = choreographyTime(timeElapsed);
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
    let values = {
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
      facing: pair ? cos(PI * timeWindow(t, 8, 8.8, 13.4, 14.2)) : 1,
      stride: 0,
      armBend: 0
    };
    const danceWeight = groupDanceWeight(timeElapsed);
    if (danceWeight > 0) {
      const dance = groupDanceValues(i, timeElapsed);
      for (const key of Object.keys(dance)) values[key] = lerp(values[key], dance[key], danceWeight);
    }
    timeFigures[i].update(values);
  }
  connectTimeFigures(t);
  applyGroupHandPoses(timeElapsed);
  timeCircleReady = timeElapsed >= TIME_END;
  updateGroupMusic(timeElapsed);
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

function groupDanceWeight(elapsed) {
  return timeEase(elapsed, 14, 14.8) *
    (1 - timeEase(elapsed, GROUP_DANCE_END - 0.8, GROUP_DANCE_END));
}
function groupDanceValues(index, elapsed) {
  const beat = (elapsed - GROUP_MUSIC_START) / MUSIC_BEAT_SECONDS;
  const step = sin(PI * beat); // Alternating feet: one step per musical beat.
  const sway = sin(PI * beat / 2);
  const pulse = max(0, sin(PI * beat));
  const common = {
    x: TIME_LINE_X[index] + sway * 6, y: TIME_BASE_Y[index], stand: 1,
    scale: TIME_BASE_SCALES[index], facing: 1, armBend: 0.6
  };
  const phrases = [
    { sway: sway * 0.65, step, knee: 10, bounce: abs(step) * 2, open: 0.12, reach: 0, stride: 0 },
    { sway: sway * 0.55, step, knee: 32, bounce: abs(step) * 3, open: 0.23, reach: 10, stride: 2 },
    { sway: sway * 0.8, step, knee: 22, bounce: pulse * 3, open: 0.23, reach: 8, stride: 8 },
    { sway: sway * 0.45, step, knee: 14, bounce: abs(step) * 4, open: 0.55, reach: 0, stride: 5 },
    { sway: sway * 0.55, step, knee: 18, bounce: abs(step) * 3, open: 0.62, reach: 0, stride: 2 }
  ];
  let pose = { ...phrases[0] };
  for (let phrase = 1; phrase < phrases.length; phrase++) {
    const change = GROUP_MUSIC_START + GROUP_PHRASE_SECONDS * phrase;
    const blend = timeEase(elapsed, change - 0.3, change + 0.3);
    for (const key of Object.keys(pose)) pose[key] = lerp(pose[key], phrases[phrase][key], blend);
  }
  return { ...common, ...pose };
}
function applyGroupHandPoses(elapsed) {
  const amount = groupDanceWeight(elapsed);
  if (amount <= 0) return;
  const beat = (elapsed - GROUP_MUSIC_START) / MUSIC_BEAT_SECONDS;
  const clapStart = GROUP_MUSIC_START + GROUP_PHRASE_SECONDS * 3;
  const waveStart = GROUP_MUSIC_START + GROUP_PHRASE_SECONDS * 4;
  const clapping = timeEase(elapsed, clapStart - 0.3, clapStart + 0.3) *
    (1 - timeEase(elapsed, waveStart - 0.3, waveStart + 0.3)) * amount;
  const waving = timeEase(elapsed, waveStart - 0.3, waveStart + 0.3) * amount;
  const clap = pow(max(0, cos(PI * (beat - 1))), 4);
  for (const person of timeFigures) {
    const p = person.pose, s = person.scale;
    if (clapping > 0) {
      const halfGap = (1 - clap) * 36 * s;
      p.leftHand = timeBlendPoint(p.leftHand, {x:p.shoulder.x-halfGap,y:p.shoulder.y+42*s}, clapping);
      p.rightHand = timeBlendPoint(p.rightHand, {x:p.shoulder.x+halfGap,y:p.shoulder.y+42*s}, clapping);
    }
    if (waving > 0) {
      const order = TIME_ROW_ORDER.indexOf(person.index);
      const wave = sin(PI * beat / 2 - order * 0.45);
      // Original flowing wave: broad, rounded arms rather than angular elbows.
      p.leftHand = timeBlendPoint(p.leftHand, {x:p.shoulder.x-55*s,y:p.shoulder.y-10*s+wave*28*s}, waving);
      p.rightHand = timeBlendPoint(p.rightHand, {x:p.shoulder.x+55*s,y:p.shoulder.y-10*s-wave*28*s}, waving);
    }
  }
}

function resetTimeBased() {
  stopGroupMusic();
  groupMusicStarted = false;
  timeStartedAt = 0;
  timeElapsed = 0;
  timeCircleReady = false;
}
