// Zicen's reusable character class for the audio mechanic.
// Developed with OpenAI Codex assistance. Zicen designed the mapping:
// volume -> bounce/scale, bass -> jump, treble -> sway/rotation.
class AudioDancer {
  constructor(imageAsset, options) {
    this.imageAsset = imageAsset;
    this.baseX = options.x;
    this.baseY = options.y;
    this.targetHeight = options.height;
    this.phase = options.phase;
    this.jumpStrength = options.jumpStrength;

    this.sway = 0;
    this.jump = 0;
    this.bounce = 0;
    this.rotation = 0;
    this.soundScale = 1;
  }

  update(time, sound, reducedMotion = false) {
    if (reducedMotion) {
      this.sway = 0;
      this.jump = 0;
      this.bounce = 0;
      this.rotation = 0;
      this.soundScale = 1;
      return;
    }

    // Each frequency range has a separate, legible visual result. Lerp
    // prevents sudden microphone spikes from making the image flicker.
    const idleSway = sin(time * 2.1 + this.phase) * 3;
    const trebleSway = sin(time * (3.2 + sound.treble * 4) + this.phase) *
      sound.treble * 16;
    const bassJump = sound.bass * this.jumpStrength;
    const volumeBounce = abs(sin(time * 3.4 + this.phase)) *
      sound.intensity * 18;
    const trebleRotation = sin(time * 2.7 + this.phase) *
      sound.treble * 0.16;
    const volumeScale = 1 + sound.intensity * 0.16;

    this.sway = lerp(this.sway, idleSway + trebleSway, 0.18);
    this.jump = lerp(this.jump, bassJump, 0.2);
    this.bounce = lerp(this.bounce, volumeBounce, 0.2);
    this.rotation = lerp(this.rotation, trebleRotation, 0.16);
    this.soundScale = lerp(this.soundScale, volumeScale, 0.18);
  }

  display(entrance, backgroundProgress) {
    if (!this.imageAsset || entrance <= 0 || backgroundProgress < 0.12) return;

    const targetWidth = this.targetHeight *
      this.imageAsset.width / this.imageAsset.height;
    const entranceScale = 0.95 + entrance * 0.05;

    push();
    translate(this.baseX + this.sway, this.baseY - this.jump - this.bounce);
    rotate(this.rotation);
    scale(entranceScale * this.soundScale);
    imageMode(CENTER);
    tint(255, 255 * entrance * backgroundProgress);
    image(this.imageAsset, 0, -this.targetHeight / 2, targetWidth, this.targetHeight);
    noTint();
    pop();
  }
}
