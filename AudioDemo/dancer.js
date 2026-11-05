// Dancer object module.
// Each dancer stores its image, position, angle, scale, and movement phase.

class Dancer {
  constructor(image, angle) {
    this.image = image;
    this.angle = angle;
    this.phase = random(TWO_PI);
  }

  updateAndDraw(intensity, bass, treble, centreX, centreY, circleRadius, imageSize) {
    const x = centreX + cos(this.angle) * circleRadius;
    const y = centreY + sin(this.angle) * circleRadius;
    const idleMotion = sin(frameCount * 0.03 + this.phase) * 3;
    const soundMotion = sin(frameCount * 0.12 + this.phase) * (bass * 22 + intensity * 30);
    const rotation = sin(frameCount * 0.08 + this.phase) * (0.03 + treble * 0.2);

    push();
    translate(x, y + idleMotion + soundMotion);
    rotate(rotation);
    image(this.image, 0, 0, imageSize, imageSize);
    pop();
  }
}
