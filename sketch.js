// ========================================
// MOVE TOGETHER
// MAIN SKETCH
//
// Vy     → User Input
// Emery  → Time-based
// Zihen  → Audio
// ========================================

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const GROUND_Y = 380;

const INK = '#171717';
const PAPER = '#fff4d4';
const GROUND = '#8bdc3f';

const MOVE_EASING = 0.075;
const ARRIVAL_DISTANCE = 2;

class Figure {
  constructor(x, y, colour) {
    this.x = x;
    this.y = y;
    this.targetX = x;

    this.colour = colour;
    this.pose = 'standing';
    this.facing = 1;
    this.hasCandy = false;

    // Shared movement properties
    this.sway = 0;
    this.walk = 0;
    this.open = 0;
    this.stand = 1;
  }
   draw() {
    this.drawBody();
    this.drawArms();
    this.drawLegs();
    this.drawHead();
  }
}
