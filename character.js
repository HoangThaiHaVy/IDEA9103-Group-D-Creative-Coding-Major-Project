// REUSABLE CHARACTER RENDERER — Emery / Xinran Xu
// AI acknowledgement: this class and its drawing helpers were generated and
// revised with the help of OpenAI Codex. They turn movement properties into
// joint coordinates, then draw a rounded body and curved limbs with p5.js.
// Emery requested proportions matching Vy's figures and reviewed pose previews.
// Head PNGs were exported from the earlier crops/recolours of Vy's character
// images. Bodies and limbs remain code-drawn. All functions below fall within
// this AI-assisted scope; sources for JavaScript/Canvas helpers appear nearby.
let characterHeads = [];

let headAssets = [];
// Load the five exported head PNGs from the exact folder used on GitHub.
// map() returns an image array in the same colour order as timeFigures.
function preloadCharacterHeads() {
  const names = ['green', 'pink', 'red', 'blue', 'yellow'];
  headAssets = names.map(name => loadImage('assets/time-based/' + name + '.png'));
}
// Use the already-preloaded images; do not crop or recolour them on every frame.
function prepareCharacterHeads() {
  // These PNGs were exported from the previous prepareCharacterHeads() pixels.
  // Bodies, hands and feet are still drawn and articulated with code.
  characterHeads = headAssets;
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
      stride: 0,
      armBend: 0,
      pose: null
    });
  }
  // Object.assign(this, values) copies the latest property values onto this
  // existing instance. calculatePose() then recalculates its points; no drawing yet.
  update(values) {
    // The timeline supplies values; this class supplies the reusable rendering.
    Object.assign(this, values);
    this.calculatePose();
  }
  // AI-assisted pose calculation. point() converts local body coordinates into
  // canvas coordinates using this figure's position and scale. stand blends
  // seated/standing geometry; sway leans the upper body and step alternates feet.
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
      leftFoot: point(lerp(-28, -18, this.stand) + step * (12 + this.stride), -max(0, step) * this.knee),
      rightFoot: point(lerp(28, 18, this.stand) - step * (12 + this.stride), -max(0, -step) * this.knee),
      leftHand: point(lean - lerp(29, 71, this.open), shoulderY + lerp(66, -29, this.open) - max(0, -step) * this.reach),
      rightHand: point(lean + lerp(29, 71, this.open), shoulderY + lerp(66, -29, this.open) - max(0, step) * this.reach)
    };
  }
  // Render the calculated pose. Drawing a wider black layer, then a narrower
  // coloured layer, makes the continuous outline. A separate head PNG preserves
  // the face while body coordinates change. Local push/pop contains all transforms.
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
      characterArm(p.leftShoulder, p.leftHand, c, 10 * s + extra, -1, this.armBend);
      characterArm(p.rightShoulder, p.rightHand, c, 10 * s + extra, 1, this.armBend);
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
    // A direction flip preserves head width; scaling through zero squeezed it.
    scale(this.facing < 0 ? -1 : 1, 1);
    imageMode(CENTER);
    image(characterHeads[this.index], 0, 0, 56 * s, 57 * s);
    pop();
    pop();
  }
}

// Draw one smooth leg curve through the influence of its knee point.
// The same path is drawn first in black, then in the figure colour for an outline.
// Reference: https://p5js.org/reference/p5/bezier/
function characterLimb(a, j, b, c, w) {
  noFill();
  stroke(c);
  strokeWeight(w);
  bezier(a.x, a.y, lerp(a.x, j.x, 0.8), lerp(a.y, j.y, 0.8), lerp(b.x, j.x, 0.8), lerp(b.y, j.y, 0.8), b.x, b.y);
}

// AI-assisted continuous arm curve. Math.hypot(dx,dy) gives the shoulder-to-hand
// distance; its normalised perpendicular offsets the control points gently.
// The max(1,...) guard avoids division by zero. This is a soft drawn curve,
// not a fixed-length joint simulation.
// Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/hypot
function characterArm(a, b, c, w, side, bend = 0) {
  noFill();
  stroke(c);
  strokeWeight(w);
  const dx = b.x - a.x, dy = b.y - a.y;
  const distance = max(1, Math.hypot(dx, dy));
  const curveX = -dy / distance * 10 * side * bend;
  const curveY = dx / distance * 10 * side * bend;
  // Restore the original continuous, rounded arm silhouette (P2 reference).
  bezier(a.x, a.y, a.x + side * 8 + curveX, lerp(a.y, b.y, 0.3) + curveY,
    b.x + side * 6 + curveX, lerp(a.y, b.y, 0.7) + curveY, b.x, b.y);
}
