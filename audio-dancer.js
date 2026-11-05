// ========================================
// AUDIO MECHANIC – AudioDancer CLASS (Zicen)
// ========================================
// One reusable class for each of the five finale dancers. Each instance keeps
// its own position, image poses, colour, movement phase and current reaction,
// so the five dancers share one behaviour but never move in perfect unison.
//
// Sound → visual mapping (designed by Zicen, refined after tutor feedback that
// asked for more detailed and visually appealing character reactions):
//   intensity (overall volume) → dance tempo and jump height (quiet ≈ still, loud ≈ high)
//   bass                       → squash on landing + darker ground shadow
//   treble                     → coloured glow halo and extra tilt
//   long sound (hum / held note)→ smooth Perlin-noise travel inside a lane
//   short sound (clap / drum hit)→ pose change + a short burst of rays
//   spectral brightness        → spacing of the row (see audio-mechanic.js)
//   soundtrack beat             → a random dancer flips into a quick handstand
//   triple clap (easter egg)    → handstand wave, started by audio-scene.js
// Every reaction is smoothed with lerp() and limited with constrain(), so loud
// or noisy input never makes the drawings shake, overlap badly or leave the
// canvas.
//
// AI acknowledgement: developed with help from OpenAI Codex (first version of
// the class) and Claude (glow, squash, shadow and burst reaction layers).

const BURST_DURATION = 0.45; // seconds a pose-change burst stays visible
const HANDSTAND_FLIP = 0.55; // seconds to flip over (and back)
const HANDSTAND_HOLD = 2.2; // seconds spent upside down
const HANDSTAND_TOTAL = HANDSTAND_FLIP * 2 + HANDSTAND_HOLD;

class AudioDancer {
  constructor(imageAsset, alternateImageAssets, options) {
    this.poseImages = [imageAsset, ...(alternateImageAssets || [])]
      .filter(Boolean);
    this.baseX = options.x;
    this.currentX = options.x;
    this.targetX = options.x;
    this.baseY = options.y;
    this.entranceX = options.x;
    this.entranceY = options.y;
    this.targetHeight = options.height;
    this.phase = options.phase;
    this.jumpStrength = options.jumpStrength;
    this.colour = options.colour;
    // Hand-drawn handstand artwork; without it the pose image is simply flipped.
    this.handstandImage = options.handstandImage || null;

    // Current (smoothed) reaction values.
    this.jump = 0;
    this.rotation = 0;
    this.soundScale = 1;
    this.squash = 0;
    this.glow = 0;
    this.poseBlend = 1;
    this.poseTransition = 0;
    this.poseIndex = 0;
    this.previousPoseIndex = 0;
    this.burstStartedAt = -Infinity;
    this.handstandStartedAt = -Infinity;
    this.handstandHold = HANDSTAND_HOLD;
    this.dancePhase = (options.phase / TWO_PI) % 1;
    this.lastUpdateTime = null;
    this.previousShortSound = false;
  }

  // Easter egg: the scene gives each dancer a slightly later start time, so
  // the five flips travel along the row like a wave.
  // holdSeconds: how long to stay upside down (short for a solo beat flip).
  startHandstand(startTime, holdSeconds = HANDSTAND_HOLD) {
    if (this.isInHandstand(startTime)) return;
    this.handstandStartedAt = startTime;
    this.handstandHold = holdSeconds;
  }

  isInHandstand(time) {
    const elapsed = time - this.handstandStartedAt;
    return elapsed >= 0 && elapsed < HANDSTAND_FLIP * 2 + this.handstandHold;
  }

  // 0 = on the feet, 1 = fully upside down; eased flips at both ends.
  handstandAmount(time) {
    const elapsed = time - this.handstandStartedAt;
    if (elapsed < 0 || elapsed >= HANDSTAND_FLIP * 2 + this.handstandHold) return 0;
    if (elapsed < HANDSTAND_FLIP) return strongEaseInOut(elapsed / HANDSTAND_FLIP);
    if (elapsed < HANDSTAND_FLIP + this.handstandHold) return 1;
    return 1 - strongEaseInOut((elapsed - HANDSTAND_FLIP - this.handstandHold) / HANDSTAND_FLIP);
  }

  setEntranceOrigin(x, y) {
    this.entranceX = x;
    this.entranceY = y;
  }

  update(time, sound, reducedMotion = false) {
    if (reducedMotion) {
      this.resetReaction(time);
      return;
    }

    const deltaSeconds = this.lastUpdateTime === null
      ? 0
      : constrain(time - this.lastUpdateTime, 0, 0.05);
    this.lastUpdateTime = time;

    const intensity = sound.intensity || 0;
    const bass = sound.bass || 0;
    const treble = sound.treble || 0;

    this.updateTravel(time, sound, deltaSeconds);

    // Louder sound → faster dance cycle (0.7–1.85 jumps per second).
    const cyclesPerSecond = 0.7 + intensity * 1.15;
    this.dancePhase = (this.dancePhase + deltaSeconds * cyclesPerSecond) % 1;

    // Only the first frame of a short sound changes the drawing and starts a
    // burst, so one clap equals exactly one new pose.
    if (sound.shortSound && !this.previousShortSound) {
      this.previousPoseIndex = this.poseIndex;
      this.poseIndex = (this.poseIndex + 1) % this.poseImages.length;
      this.poseBlend = 0;
      this.burstStartedAt = time;
    }
    this.previousShortSound = Boolean(sound.shortSound);

    // Jump: squared positive half of a sine wave gives a quick take-off and a
    // soft landing. pow(intensity, 0.62) makes quiet sounds still visible.
    const jumpBeat = pow(max(0, sin(TWO_PI * this.dancePhase)), 2);
    // pow(intensity, 1.3) widens the contrast: quiet sound barely lifts the
    // feet, loud sound sends the dancer up to ~2.6 × jumpStrength (≤ 125 px).
    const jumpTarget = min(jumpBeat * pow(intensity, 1.3) * this.jumpStrength * 2.6, 125);

    // Squash: strongest when the dancer is close to the ground and the bass
    // is heavy, like knees bending on the beat. Limited to 9%.
    const nearGround = 1 - constrain(this.jump / 14, 0, 1);
    const squashTarget = constrain(bass * nearGround * intensity * 0.14, 0, 0.09);

    // Tilt grows a little with treble but never passes about 4 degrees.
    const tiltTarget = sin(TWO_PI * this.dancePhase + this.phase) *
      constrain(intensity * 0.035 + treble * 0.03, 0, 0.07);

    this.jump = lerp(this.jump, jumpTarget, 0.38);
    this.squash = lerp(this.squash, squashTarget, 0.3);
    this.rotation = lerp(this.rotation, tiltTarget, 0.18);
    this.soundScale = lerp(this.soundScale, 1 + intensity * 0.06, 0.18);
    this.glow = lerp(this.glow, constrain(treble * 1.3 + intensity * 0.25, 0, 1), 0.12);
    this.poseBlend = lerp(this.poseBlend, 1, 0.3);
    // 4·b·(1−b) peaks halfway through a pose crossfade (used for a tiny dip).
    this.poseTransition = 4 * this.poseBlend * (1 - this.poseBlend);
  }

  // A sustained sound opens a continuous Perlin-noise path. Neighbouring noise
  // samples stay close together, so the travel is smooth rather than jumpy,
  // and each dancer stays inside its own lane to avoid collisions.
  updateTravel(time, sound, deltaSeconds) {
    const spread = constrain(sound.spread || SILENT_SOUND_DATA.spread, MIN_SPREAD, MAX_SPREAD);
    const laneAnchor = width / 2 + (this.baseX - width / 2) * spread;

    if (sound.longSound) {
      const noisePosition = noise(time * 0.2 + this.phase * 4.7);
      const laneTravel = 10 + spread * 14;
      this.targetX = laneAnchor + map(noisePosition, 0, 1, -laneTravel, laneTravel);
    } else {
      this.targetX = lerp(this.targetX, laneAnchor, 0.035);
    }
    // Frame-rate independent easing towards the target.
    const travelEase = 1 - pow(0.04, deltaSeconds);
    this.currentX = lerp(this.currentX, this.targetX, travelEase);
  }

  resetReaction(time) {
    this.jump = 0;
    this.rotation = 0;
    this.soundScale = 1;
    this.squash = 0;
    this.glow = 0;
    this.poseBlend = 1;
    this.poseTransition = 0;
    this.currentX = this.baseX;
    this.targetX = this.baseX;
    this.lastUpdateTime = time;
  }

  display(entrance, backgroundProgress, time) {
    if (this.poseImages.length === 0 || entrance <= 0 || backgroundProgress < 0.12) return;

    const overallAlpha = entrance * backgroundProgress;
    const flip = this.handstandAmount(time);
    const stagedX = lerp(this.entranceX, this.currentX, entrance);
    const groundY = lerp(this.entranceY, this.baseY, entrance);
    // While flipping, the dancer follows a small arc; jumps pause upside down.
    const flipArc = sin(PI * flip) * 46;
    const stagedY = groundY - this.jump * entrance * (1 - flip) - flipArc;

    this.drawShadow(stagedX, groundY, overallAlpha);
    this.drawGlow(stagedX, stagedY, overallAlpha);
    this.drawBurst(stagedX, stagedY, time, overallAlpha);

    const entranceScale = 0.95 + entrance * 0.05;
    const bodyScale = entranceScale * this.soundScale * (1 - this.poseTransition * 0.05);

    // Upside down the legs keep kicking gently to the music.
    const kick = flip > 0.95 ? sin(time * 9 + this.phase) * 0.07 : 0;
    // Near the end of the flip, the rotated sticker cross-fades into the real
    // hands-on-the-ground handstand drawing (and back again on the way out).
    const handstandArt = this.handstandImage
      ? constrain((flip - 0.55) / 0.35, 0, 1)
      : 0;
    const stickerAlpha = overallAlpha * (1 - handstandArt);

    push();
    translate(stagedX, stagedY);
    // Rotate around the middle of the body so the handstand stays in place.
    translate(0, -this.targetHeight / 2);
    rotate(this.rotation + PI * flip + kick);
    translate(0, this.targetHeight / 2);
    // Squash and stretch keep the area roughly constant: wider when shorter.
    scale(bodyScale * (1 + this.squash * 0.6), bodyScale * (1 - this.squash));
    imageMode(CENTER);
    this.drawPose(this.poseImages[this.previousPoseIndex], 1 - this.poseBlend, stickerAlpha);
    this.drawPose(this.poseImages[this.poseIndex], this.poseBlend, stickerAlpha);
    pop();

    if (handstandArt > 0) {
      // The handstand drawing is already upside down, so it is not rotated
      // by PI – only the small kick, around the middle of the body.
      push();
      translate(stagedX, stagedY);
      translate(0, -this.targetHeight / 2);
      rotate(kick * 0.6);
      translate(0, this.targetHeight / 2);
      scale(bodyScale);
      imageMode(CENTER);
      this.drawPose(this.handstandImage, handstandArt, overallAlpha);
      pop();
    }
  }

  // The shadow stays on the ground: it shrinks and fades while the dancer is
  // in the air, which makes the height of each jump easy to read.
  drawShadow(x, groundY, alpha) {
    const lift = constrain(this.jump / (this.jumpStrength * 2.6), 0, 1);
    push();
    noStroke();
    fill(4, 6, 24, 120 * alpha * (1 - lift * 0.6));
    ellipse(x, groundY - 3, this.targetHeight * 0.5 * (1 - lift * 0.35), 12);
    pop();
  }

  // Soft halo in the dancer's own colour; brighter high frequencies make it
  // larger and stronger. ADD blending lightens the night sky like real light,
  // and two layered circles read as a glow without a slow blur filter.
  // Reference: https://p5js.org/reference/p5/blendMode/
  drawGlow(x, y, alpha) {
    if (this.glow <= 0.02 || !this.colour) return;
    const glowColour = color(this.colour);
    const centreY = y - this.targetHeight * 0.55;
    const diameter = this.targetHeight * (0.5 + this.glow * 0.3);
    push();
    blendMode(ADD);
    noStroke();
    glowColour.setAlpha(32 * this.glow * alpha);
    fill(glowColour);
    circle(x, centreY, diameter * 1.35);
    glowColour.setAlpha(55 * this.glow * alpha);
    fill(glowColour);
    circle(x, centreY, diameter);
    blendMode(BLEND);
    pop();
  }

  // Eight short rays that spread out and fade after each pose change.
  drawBurst(x, y, time, alpha) {
    const age = (time - this.burstStartedAt) / BURST_DURATION;
    if (age < 0 || age >= 1) return;
    const centreY = y - this.targetHeight * 0.62;
    const inner = this.targetHeight * (0.42 + age * 0.2);
    const outer = inner + 16 * (1 - age);
    push();
    stroke(255, 246, 190, 230 * (1 - age) * alpha);
    strokeWeight(4);
    for (let ray = 0; ray < 8; ray += 1) {
      const angle = this.phase + ray * QUARTER_PI;
      line(x + cos(angle) * inner, centreY + sin(angle) * inner,
        x + cos(angle) * outer, centreY + sin(angle) * outer);
    }
    pop();
  }

  drawPose(imageAsset, poseOpacity, overallAlpha) {
    if (!imageAsset || poseOpacity <= 0.01) return;
    const targetWidth = this.targetHeight * imageAsset.width / imageAsset.height;
    tint(255, 255 * poseOpacity * overallAlpha);
    image(imageAsset, 0, -this.targetHeight / 2, targetWidth, this.targetHeight);
    noTint();
  }
}
