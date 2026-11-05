// Shared Character class — Emery, developed with OpenAI Codex assistance.
// Heads are cropped from Vy's original PNGs; curved limbs match their outline
// and proportions. An array stores five instances of this reusable class.
let characterHeads = [];

function prepareCharacterHeads() {
  // RGBA pixel preparation, explained in README:
  // https://p5js.org/reference/p5.Image/loadPixels/
  const sources = [standingImage.get(103, 88, 305, 310), character2PinkImage.get(430, 177, 308, 310)];
  const colours = ['#20CD0A', '#F00085', '#FA4945', '#18A9EE', '#FFD02E'];
  characterHeads = colours.map((c, i) => {
    const head = sources[i === 1 ? 1 : 0].get();
    head.loadPixels();
    const target = color(c);
    for (let j = 0; j < head.pixels.length; j += 4) {
      const x = (j / 4) % head.width,
        y = Math.floor(j / 4 / head.width);
      // Remove neighbouring arm/neck pixels from the rectangular crop.
      const nx = (x - head.width / 2) / (head.width / 2);
      const ny = (y - head.height / 2) / (head.height / 2);
      if (nx * nx + ny * ny > 1) head.pixels[j + 3] = 0;
      const r = head.pixels[j],
        g = head.pixels[j + 1],
        b = head.pixels[j + 2];
      // Recolour the fill only; retain the original black outline and face.
      if (max(r, g, b) - min(r, g, b) > 45 && max(r, g, b) > 80) {
        head.pixels[j] = red(target);
        head.pixels[j + 1] = green(target);
        head.pixels[j + 2] = blue(target);
      }
    }
    head.updatePixels();
    return head;
  });
}
class Character {
  constructor(index, x, y, colour) {
    // Copy named initial properties onto this instance (standard JavaScript).
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
    Object.assign(this, {
      index,
      x,
      y,
      colour,
      stand: 1,
      sway: 0,
      step: 0,
      knee: 0,
      bounce: 0,
      open: 0,
      reach: 0,
      scale: 1,
      facing: 1,
      pose: null
    });
  }
  update(values) {
    // The timeline supplies values; this class supplies the reusable rendering.
    Object.assign(this, values);
    this.calculatePose();
  }
  calculatePose() {
    const point = (x, y) => ({
      x: this.x + x * this.scale,
      y: this.y + y * this.scale
    });
    const hipY = lerp(-27, -80, this.stand) - this.bounce;
    const lean = this.sway * 9,
      shoulderY = hipY - 57,
      step = this.step;
    this.pose = {
      hip: point(0, hipY),
      shoulder: point(lean, shoulderY),
      head: point(lean * 1.2, shoulderY - 34),
      leftShoulder: point(lean - 15, shoulderY + 5),
      rightShoulder: point(lean + 15, shoulderY + 5),
      leftKnee: point(lerp(-23, -14, this.stand) + step * 5, lerp(-10, -40, this.stand) - max(0, step) * this.knee),
      rightKnee: point(lerp(19, 14, this.stand) - step * 5, lerp(-10, -40, this.stand) - max(0, -step) * this.knee),
      leftFoot: point(lerp(-28, -18, this.stand) + step * 12, -max(0, step) * this.knee),
      rightFoot: point(lerp(28, 18, this.stand) - step * 12, -max(0, -step) * this.knee),
      leftHand: point(lean - lerp(29, 71, this.open), shoulderY + lerp(66, -29, this.open) - max(0, -step) * this.reach),
      rightHand: point(lean + lerp(29, 71, this.open), shoulderY + lerp(66, -29, this.open) - max(0, step) * this.reach)
    };
  }
  display(opacity = 1) {
    if (opacity <= 0 || this.x < -150 || this.x > width + 150) return;
    const p = this.pose,
      s = this.scale;
    push();
    drawingContext.globalAlpha *= opacity;
    // Canvas opacity is local to the surrounding push/pop pair.
    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalAlpha
    for (let layer = 0; layer < 2; layer++) {
      const outline = layer === 0,
        extra = outline ? 6 * s : 0,
        c = outline ? '#10110E' : this.colour;
      characterLimb(p.hip, p.leftKnee, p.leftFoot, c, 14 * s + extra);
      characterLimb(p.hip, p.rightKnee, p.rightFoot, c, 14 * s + extra);
      characterArm(p.leftShoulder, p.leftHand, c, 10 * s + extra, -1);
      characterArm(p.rightShoulder, p.rightHand, c, 10 * s + extra, 1);
      noStroke();
      fill(c);
      ellipse(p.leftFoot.x - 2 * s, p.leftFoot.y - 2 * s, 26 * s + extra, 13 * s + extra);
      ellipse(p.rightFoot.x + 5 * s, p.rightFoot.y - 2 * s, 28 * s + extra, 13 * s + extra);
      circle(p.leftHand.x, p.leftHand.y, 13 * s + extra);
      circle(p.rightHand.x, p.rightHand.y, 13 * s + extra);
      const w = (outline ? 20 : 17) * s;
      beginShape();
      vertex(p.shoulder.x - w, p.shoulder.y + 3 * s);
      bezierVertex(p.shoulder.x - w - 4 * s, p.shoulder.y + 19 * s, p.hip.x - w, p.hip.y - 16 * s, p.hip.x - w, p.hip.y + 7 * s);
      bezierVertex(p.hip.x - w, p.hip.y + 16 * s, p.hip.x + w, p.hip.y + 16 * s, p.hip.x + w, p.hip.y + 7 * s);
      bezierVertex(p.hip.x + w, p.hip.y - 16 * s, p.shoulder.x + w + 4 * s, p.shoulder.y + 19 * s, p.shoulder.x + w, p.shoulder.y + 3 * s);
      bezierVertex(p.shoulder.x + 8 * s, p.shoulder.y - 12 * s, p.shoulder.x - 8 * s, p.shoulder.y - 12 * s, p.shoulder.x - w, p.shoulder.y + 3 * s);
      endShape(CLOSE);
      stroke(c);
      strokeWeight(16 * s + extra);
      line(p.shoulder.x, p.shoulder.y, p.head.x, p.head.y + 20 * s);
    }
    push();
    translate(p.head.x, p.head.y);
    rotate(this.sway * 0.045);
    scale(this.facing, 1);
    imageMode(CENTER);
    image(characterHeads[this.index], 0, 0, 56 * s, 57 * s);
    pop();
    pop();
  }
}

function characterLimb(a, j, b, c, w) {
  noFill();
  stroke(c);
  strokeWeight(w);
  bezier(a.x, a.y, lerp(a.x, j.x, 0.8), lerp(a.y, j.y, 0.8), lerp(b.x, j.x, 0.8), lerp(b.y, j.y, 0.8), b.x, b.y);
}

function characterArm(a, b, c, w, side) {
  noFill();
  stroke(c);
  strokeWeight(w);
  bezier(a.x, a.y, a.x + side * 8, lerp(a.y, b.y, 0.3), b.x + side * 6, lerp(a.y, b.y, 0.7), b.x, b.y);
}
