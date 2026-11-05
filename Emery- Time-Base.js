// TIME-BASED MECHANIC — Emery / Xinran Xu
// AI acknowledgement: this module was generated and revised with the help of
// OpenAI Codex. It turns elapsed time into character poses, schedules five
// dance phrases and music fades, and signals timeCircleReady for the audio scene.
// Emery specified the narrative sequence and iterated the visual behaviour.
// All functions below are within this AI-assisted scope; helper comments explain
// the calculations and identify technical references where relevant.
// Read: startTimeBased() -> updateTimeBased() -> drawTimeBased().
// Shared globals used by the main sketch and audio handoff.
// timeStartedAt is captured once; timeElapsed and poses change on each frame.
let timeFigures = [];
let timeStartedAt = 0;
let timeElapsed = 0;
let timeStartX = [640, 520];
let timeCircleReady = false;
const GROUP_MUSIC_START = 14;
// The supplied piano track is tagged 125 BPM. Eight beats make one phrase;
// five phrases provide 19.2 seconds of group dancing, followed by the old circle path.
const MUSIC_BPM = 125;
const MUSIC_BEAT_SECONDS = 60 / MUSIC_BPM;
const GROUP_PHRASE_SECONDS = MUSIC_BEAT_SECONDS * 8;
// AI-assisted call-and-response choreography: the two original figures teach
// one four-beat gesture; each companion repeats it two musical beats later.
// These intervals stay inside the existing 19.2-second middle section.
const RELAY_START = GROUP_MUSIC_START + MUSIC_BEAT_SECONDS * 4; // 15.92 s
const RELAY_DELAY = MUSIC_BEAT_SECONDS * 2; // 0.96 s between companions
const RELAY_GESTURE_DURATION = MUSIC_BEAT_SECONDS * 4; // 1.92 s per gesture
const RELAY_END = RELAY_START + RELAY_DELAY * 3 + RELAY_GESTURE_DURATION; // 20.72 s
const UNISON_START = GROUP_MUSIC_START + GROUP_PHRASE_SECONDS * 2; // 21.68 s
const GROUP_DANCE_END = GROUP_MUSIC_START + GROUP_PHRASE_SECONDS * 5; // 33.2s
const DANCE_EXTENSION = GROUP_DANCE_END - 23; // Only the middle is extended.
const TIME_END = 32 + DANCE_EXTENSION; // 42.2s, same circle-ready interface.
let groupDanceMusic;
let groupMusicStarted = false;
const GROUP_MUSIC_VOLUME = 0.32;

// Called from p5 preload(), so images and the group song are ready before setup.
// The MP3 is an external asset, not AI-generated music or a team composition.
function preloadTimeBasedAssets() {
  preloadCharacterHeads();
  // Happy Commercial (Piano) — MaxKoMusic, supplied by Emery.
  // Source/credit: https://www.chosic.com/download-audio/27305/
  groupDanceMusic = loadSound('assets/time-based/group-dance.mp3');
}
// Stop the SoundFile only when it is playing; used at reset and at the handoff.
function stopGroupMusic() {
  if (groupDanceMusic && groupDanceMusic.isPlaying()) groupDanceMusic.stop();
}
// Start the song once at the five-person dance, then update only its volume.
// A short fade-in and fade-out avoid abrupt sound changes or overlap with the finale.
function updateGroupMusic(elapsed) {
  // Local export flag only: the MP4 renderer mixes this recording afterwards.
  // On the ordinary website the flag is absent and SoundFile playback runs normally.
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
// AI-assisted timeline helper: keep the opening unchanged and insert extra time
// before the original circle transition. During the inserted interval this old
// choreography clock stays at 23 s; groupDanceValues() still uses real elapsed time.
// After 33.2 s subtract the extension, so the old circle path runs unchanged.
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

// Create five instances of one class. map() builds an array of Character objects;
// each object keeps its own position, scale, movement properties and calculated pose.
function setupTimeBased() {
  prepareCharacterHeads();
  timeFigures = TIME_COLOURS.map((c, i) => new Character(i, 0, GROUND_Y + 12, c));
}

// Entry point called by Vy after the umbrella offer is accepted. Capture the
// current positions instead of restarting both figures at hard-coded locations.
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

// Convert seconds within [start, end] into a 0–1 completion ratio.
// constrain() holds the value at 0 before the interval and at 1 after it.
// Reference: https://p5js.org/reference/p5/constrain/
function timeProgress(t, start, end) {
  return constrain((t - start) / (end - start), 0, 1);
}

// AI-assisted implementation of cubic smoothstep: p*p*(3-2*p) changes slowly
// near 0 and 1, avoiding an abrupt start/stop when lerp() moves a figure.
// Mathematical reference (formula only; this is ordinary JavaScript, not GLSL):
// https://registry.khronos.org/OpenGL-Refpages/gl4/html/smoothstep.xhtml
function timeEase(t, start, end) {
  // A cubic easing curve makes parameter changes start and finish gradually.
  // p is an interval's 0–1 completion ratio; no animation library is used.
  const p = timeProgress(t, start, end);
  return p * p * (3 - 2 * p);
}

// Multiply an entry fade by an exit fade: the result rises from 0, stays near 1,
// then returns to 0. This lets walking, swaying and hand contact overlap smoothly.
function timeWindow(t, start, fadeIn, fadeOut, end) {
  return timeEase(t, start, fadeIn) * (1 - timeEase(t, fadeOut, end));
}

// AI-assisted per-frame controller. It reads the clock, calculates interval
// progress and cyclic motion, updates each Character, then adjusts shared hands.
// It changes data; drawTimeBased() and Character.display() perform the drawing.
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
    // Five evenly spaced angles on an ellipse: 190 px horizontal radius,
    // 60 px vertical radius. lerp() moves each figure from line to circle.
    // Trigonometry references: https://p5js.org/reference/p5/sin/ and /p5/cos/
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

// Interpolate both coordinates of a point; used for gentle hand-contact changes.
function timeBlendPoint(a, b, amount) {
  return {
    x: lerp(a.x, b.x, amount),
    y: lerp(a.y, b.y, amount)
  };
}

// Blend neighbouring hands toward one shared point so contact is visible.
// These links are derived from the current poses and preserve circle neighbour order.
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

// Crossfade the opening PNG poses into the code-drawn figures over 0.75 seconds,
// then draw the umbrella and the current Character poses.
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
  // Spread copies the drawing list before sort() changes its order. Draw figures
  // with larger y last for depth, while preserving the original identity/index order.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
  for (const person of [...timeFigures].sort((a, b) => a.y - b.y)) person.display(reveal);
}

// AI-assisted throw: interpolate to the release pose, then move left with a
// quadratic vertical path (initial upward motion plus a downward t*t term).
// The grip point uses sin/cos to follow the handle as the umbrella rotates.
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

// Use local translate/rotate/scale to draw the umbrella around its own origin.
// push()/pop() restore drawing settings and opacity before the next character.
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

// Blend the extra phrases in and out, returning to the original circle pose
// before the handoff. The middle phrase clock does not alter the readiness API.
function groupDanceWeight(elapsed) {
  return timeEase(elapsed, 14, 14.8) *
    (1 - timeEase(elapsed, GROUP_DANCE_END - 0.8, GROUP_DANCE_END));
}
// AI-assisted gesture envelope: sin(PI * progress)^2 rises from zero, peaks
// halfway, and returns smoothly to zero. Only the start time changes, so the
// audience sees the same gesture copied rather than several unrelated moves.
function relayGesture(index, elapsed) {
  const order = index < 2 ? 0 : index - 1; // green/pink together, then red/blue/yellow
  const start = RELAY_START + order * RELAY_DELAY;
  const progress = timeProgress(elapsed, start, start + RELAY_GESTURE_DURATION);
  return pow(sin(PI * progress), 2);
}
// Return two independent blends. Demonstration uses per-person start times;
// the repeated motif uses one clock for everyone, making the final unity visible.
function groupResponseTiming(elapsed) {
  const relay = timeEase(elapsed, 14.8, 15.6) *
    (1 - timeEase(elapsed, RELAY_END, UNISON_START));
  const united = timeWindow(elapsed, UNISON_START - 0.3, UNISON_START + 0.3,
    UNISON_START + GROUP_PHRASE_SECONDS - 0.3, UNISON_START + GROUP_PHRASE_SECONDS + 0.3);
  const sharedPulse = pow(sin(PI * (elapsed - UNISON_START) / RELAY_GESTURE_DURATION), 2);
  return { relay, united, sharedPulse };
}
// AI-assisted choreography helper. One musical beat lasts 60/BPM seconds;
// the early phrases pass a motif from the pair to three companions; subsequent
// phrases repeat it in unison, clap, and finish with a shared wave/open stance.
// Short lerp() blends between poses avoid sudden switches.
// This is a fixed beat clock, not live audio/FFT analysis.
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
  // Object spread copies a phrase; Object.keys() lists the numeric properties
  // so one loop can interpolate each property instead of repeating the same code.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
  let pose = { ...phrases[0] };
  for (let phrase = 1; phrase < phrases.length; phrase++) {
    const change = GROUP_MUSIC_START + GROUP_PHRASE_SECONDS * phrase;
    const blend = timeEase(elapsed, change - 0.3, change + 0.3);
    for (const key of Object.keys(pose)) pose[key] = lerp(pose[key], phrases[phrase][key], blend);
  }
  const response = groupResponseTiming(elapsed);
  // Waiting companions make only a small sway. The teaching gesture and its
  // later group repetition use identical knee/step values and differ in timing.
  const motif = (pulse) => ({ sway: pulse * 0.3, step: pulse, knee: 18,
    bounce: pulse * 2, open: 0.12, reach: 0, stride: 2 });
  // Each two-item array below contains [blend amount, gesture strength].
  // The for...of destructuring reads those two numbers for one blend at a time.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring
  for (const [weight, pulse] of [[response.relay, relayGesture(index, elapsed)],
      [response.united, response.sharedPulse]]) {
    const target = motif(pulse);
    for (const key of Object.keys(pose)) pose[key] = lerp(pose[key], target[key], weight);
  }
  // One clearly readable closing stance before the unchanged line-to-circle
  // transition. groupDanceWeight() fades this pose out before 33.2 seconds.
  const closing = timeEase(elapsed, GROUP_DANCE_END - 1.9, GROUP_DANCE_END - 1.3);
  for (const key of ['sway', 'step', 'bounce']) pose[key] *= 1 - closing;
  return { ...common, ...pose };
}
// AI-assisted hand choreography, applied after the general pose and shared
// contact updates: demonstrate -> copy -> repeat together -> clap -> united wave.
// Hands follow continuous Bezier arms in Character.display(), without angular elbows.
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
  const response = groupResponseTiming(elapsed);
  for (const person of timeFigures) {
    const p = person.pose, s = person.scale;
    // A raised left hand plus a small foot tap is the motif. The right hand
    // opens lower for balance. Waiting figures keep relaxed, visible-length arms.
    for (const [weight, pulse] of [[response.relay, relayGesture(person.index, elapsed)],
        [response.united, response.sharedPulse]]) {
      p.leftHand = timeBlendPoint(p.leftHand,
        {x:p.shoulder.x-55*s,y:p.shoulder.y+(48-100*pulse)*s}, weight*amount);
      p.rightHand = timeBlendPoint(p.rightHand,
        {x:p.shoulder.x+52*s,y:p.shoulder.y+(48-22*pulse)*s}, weight*amount);
    }
    if (clapping > 0) {
      const halfGap = (1 - clap) * 36 * s;
      p.leftHand = timeBlendPoint(p.leftHand, {x:p.shoulder.x-halfGap,y:p.shoulder.y+42*s}, clapping);
      p.rightHand = timeBlendPoint(p.rightHand, {x:p.shoulder.x+halfGap,y:p.shoulder.y+42*s}, clapping);
    }
    if (waving > 0) {
      // Everyone now shares the same phase: the earlier delay has resolved
      // into a group rhythm. Retain the original broad, rounded arm silhouette.
      const closing = timeEase(elapsed, GROUP_DANCE_END - 1.9, GROUP_DANCE_END - 1.3);
      const wave = sin(PI * beat / 2) * (1 - closing);
      p.leftHand = timeBlendPoint(p.leftHand, {x:p.shoulder.x-55*s,y:p.shoulder.y-10*s+wave*28*s}, waving);
      p.rightHand = timeBlendPoint(p.rightHand, {x:p.shoulder.x+55*s,y:p.shoulder.y-10*s-wave*28*s}, waving);
    }
  }
}

// Clear this mechanic's clock/readiness and stop its music for a fresh activation.
function resetTimeBased() {
  stopGroupMusic();
  groupMusicStarted = false;
  timeStartedAt = 0;
  timeElapsed = 0;
  timeCircleReady = false;
}
