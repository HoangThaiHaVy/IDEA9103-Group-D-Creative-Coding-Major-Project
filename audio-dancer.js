// Zicen's reusable character class for the audio mechanic.
// Developed with OpenAI Codex assistance. Zicen designed the mapping:
// loudness -> jump, sustained sound -> Perlin-noise travel,
// short transient -> pose change.
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

    this.sway = 0;
    this.jump = 0;
    this.bounce = 0;
    this.rotation = 0;
    this.soundScale = 1;
    this.poseBlend = 1;
    this.poseTransition = 0;
    this.poseIndex = 0;
    this.previousPoseIndex = 0;
    this.dancePhase = (options.phase / TWO_PI) % 1;
    this.lastUpdateTime = null;
    this.previousClap = false;
  }

  setEntranceOrigin(x, y) {
    this.entranceX = x;
    this.entranceY = y;
  }

  update(time, sound, reducedMotion = false) {
    if (reducedMotion) {
      this.sway = 0;
      this.jump = 0;
      this.bounce = 0;
      this.rotation = 0;
      this.soundScale = 1;
      this.poseBlend = 1;
      this.poseTransition = 0;
      this.currentX = this.baseX;
      this.targetX = this.baseX;
      this.lastUpdateTime = time;
      return;
    }

    const deltaSeconds = this.lastUpdateTime === null
      ? 0
      : constrain(time - this.lastUpdateTime, 0, 0.05);
    this.lastUpdateTime = time;

    const intensity = sound.intensity || 0;
    const spread = constrain(sound.spread || 0.92, 0.72, 1);
    const laneAnchor = width / 2 + (this.baseX - width / 2) * spread;

    // A sustained sound opens a continuous Perlin-noise path. Unlike random
    // target jumps, neighbouring noise samples remain close to one another.
    // Each character stays inside its own lane, preventing overlap.
    if (sound.longSound) {
      const noisePosition = noise(time * 0.2 + this.phase * 4.7);
      const laneTravel = 5 + spread * 7;
      this.targetX = laneAnchor + map(noisePosition, 0, 1, -laneTravel, laneTravel);
    } else {
      this.targetX = lerp(this.targetX, laneAnchor, 0.035);
    }
    const travelEase = 1 - pow(0.04, deltaSeconds);
    this.currentX = lerp(this.currentX, this.targetX, travelEase);

    // Loudness controls the height of a repeated jump rather than making the
    // whole sticker hover continuously.
    const cyclesPerSecond = 0.7 + intensity * 1.15;
    this.dancePhase = (this.dancePhase + deltaSeconds * cyclesPerSecond) % 1;

    // Only the leading edge of a short transient changes the drawing.
    if (sound.shortSound && !this.previousClap) {
      this.previousPoseIndex = this.poseIndex;
      this.poseIndex = (this.poseIndex + 1) % this.poseImages.length;
      this.poseBlend = 0;
    }
    this.previousClap = Boolean(sound.shortSound);

    const jumpBeat = pow(max(0, sin(TWO_PI * this.dancePhase)), 2);
    const jumpTarget = jumpBeat * pow(intensity, 0.62) *
      this.jumpStrength * 1.55;
    const gentleTilt = sin(TWO_PI * this.dancePhase + this.phase) *
      intensity * 0.035;
    const volumeScale = 1 + intensity * 0.06;

    this.sway = lerp(this.sway, 0, 0.2);
    this.jump = lerp(this.jump, jumpTarget, 0.24);
    this.bounce = 0;
    this.rotation = lerp(this.rotation, gentleTilt, 0.18);
    this.soundScale = lerp(this.soundScale, volumeScale, 0.18);
    this.poseBlend = lerp(this.poseBlend, 1, 0.3);
    this.poseTransition = 4 * this.poseBlend * (1 - this.poseBlend);
  }

  display(entrance, backgroundProgress) {
    if (this.poseImages.length === 0 || entrance <= 0 || backgroundProgress < 0.12) return;

    const entranceScale = 0.95 + entrance * 0.05;

    push();
    const stagedX = lerp(this.entranceX, this.currentX, entrance);
    const stagedY = lerp(this.entranceY, this.baseY - this.jump, entrance);
    translate(stagedX + this.sway * entrance, stagedY - this.bounce);
    rotate(this.rotation);
    scale(entranceScale * this.soundScale * (1 - this.poseTransition * 0.05));
    imageMode(CENTER);
    const overallAlpha = entrance * backgroundProgress;
    this.drawPose(
      this.poseImages[this.previousPoseIndex],
      1 - this.poseBlend,
      overallAlpha
    );
    this.drawPose(
      this.poseImages[this.poseIndex],
      this.poseBlend,
      overallAlpha
    );
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
