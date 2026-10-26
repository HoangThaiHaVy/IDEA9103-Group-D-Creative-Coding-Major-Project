
console.log("VY FILE IS LOADED");


function setupUserInput() {
  console.log("SETUP USER INPUT RUNNING");
  character1 = new Figure(-70, GROUND_Y, '#e7352d');
  character2 = new Figure(870, GROUND_Y, '#1598c5');
  character2.visible = false;
  candy = new Candy();

  statusText = createP(
    'Click 1: help the first person walk into the picture.'
  );

  statusText.style('font-size', '15px');
  statusText.style('font-family', 'Trebuchet MS, sans-serif');
  statusText.style('margin', '10px 0 4px');

  restartButton = createButton('Start again');
  restartButton.mousePressed(resetAllMechanics);
}
 // ========================================
// INITIALISE FIVE CHARACTERS
// ========================================

function setupCollectiveScene() {

  collectiveFigures = [
    new Figure(285, GROUND_Y, '#e7352d'), // Red
    new Figure(405, GROUND_Y, '#1598c5'), // Blue
    new Figure(525, GROUND_Y, '#ffdb4d'), // Yellow
    new Figure(650, GROUND_Y, '#a66cff'), // Purple
    new Figure(750, GROUND_Y, '#ff8c42')  // Orange
  ];

  // All figures face towards the centre.
  collectiveFigures.forEach((figure, index) => {
    figure.pose = 'standing';
    figure.visible = false;
    figure.hasCandy = false;
  });
}
function updateUserInput() {
  character1.update();
  character2.update();
  candy.update();

  // Move all figures first, then check whether the circle is complete.
  // This lets click 8 unlock on the same frame the last figure arrives.
  collectiveFigures.forEach(figure => figure.update());
  if (collectiveStarted && !collectiveComplete) {
    updateCollectiveSequence();
  }
}
function drawUserInput() {
  // Rain and clouds appear during the first character's lonely seated beat.
  if (storyStep === 2) drawSadWeather();

  // A field of gently bobbing stars fills the sky during clicks 4 and 5.
  if (storyStep === 4 || storyStep === 5) drawFloatingStarSky();

  // Keep the second character off-screen until story beat 3.
  if (storyStep < 3) character2.visible = false;
  character1.draw();
  character2.draw();
  // Sparkles appear during the approach and candy-offer beats only.
  if ((storyStep === 4 || storyStep === 5) && character2.visible) {
    const sparkleX = storyStep === 5 && candy.visible
      ? (character2.x + candy.x) / 2
      : character2.x;
    const sparkleY = storyStep === 5 && candy.visible
      ? candy.y - 28
      : character2.y - 137;
    drawManyFloatingStars(sparkleX, sparkleY, storyStep === 5 ? 12 : 8);
  }
  candy.draw();
}



function drawFloatingStarSky() {
  // Fixed positions keep the stars stable while each one drifts gently.
  const stars = [
    [0.07, 72, 10], [0.15, 145, 14], [0.23, 48, 9], [0.31, 112, 12],
    [0.39, 66, 15], [0.47, 155, 10], [0.55, 43, 11], [0.63, 118, 15],
    [0.71, 70, 10], [0.79, 150, 13], [0.87, 55, 15], [0.95, 112, 9],
    [0.11, 205, 9], [0.35, 190, 8], [0.68, 202, 9], [0.9, 190, 8]
  ];

  stars.forEach(([xRatio, baseY, size], index) => {
    const bob = sin(frameCount * 0.045 + index * 1.7) * 7;
    const twinkle = 0.75 + 0.25 * sin(frameCount * 0.08 + index);
    drawFloatingStar(
      width * xRatio,
      baseY + bob,
      size * twinkle,
      sin(frameCount * 0.025 + index) * 0.18
    );
  });
}

function drawFloatingStars(x, y) {
  const bob = sin(frameCount * 0.08) * 5;
  drawFloatingStar(x - 64, y + bob, 17, frameCount * 0.015);
  drawFloatingStar(x + 64, y - bob, 14, -frameCount * 0.018);
}

function drawManyFloatingStars(x, y, count) {
  for (let i = 0; i < count; i++) {
    const angle = TWO_PI * i / count + frameCount * 0.012;
    const orbitX = 54 + (i % 3) * 12;
    const orbitY = 27 + (i % 2) * 13;
    const bob = sin(frameCount * 0.08 + i * 1.7) * 5;
    const size = 9 + (i % 4) * 3;
    drawFloatingStar(
      x + cos(angle) * orbitX,
      y + sin(angle) * orbitY + bob,
      size,
      frameCount * 0.012 + i * 0.45
    );
  }
}

function drawFloatingStar(x, y, radius, rotation) {
  push();
  translate(x, y);
  rotate(rotation);
  fill('#ffd447');
  noStroke();
  beginShape();
  for (let i = 0; i < 10; i++) {
    const angle = -HALF_PI + i * PI / 5;
    const pointRadius = i % 2 === 0 ? radius : radius * 0.46;
    vertex(cos(angle) * pointRadius, sin(angle) * pointRadius);
  }
  endShape(CLOSE);
  pop();
}

function drawSadWeather() {
  // Gray clouds sit behind the characters.
  stroke('#59636d');
  strokeWeight(3);
  fill('#aeb6bf');
  for (const cloud of [
    { x: 205, y: 84, s: 1 },
    { x: 505, y: 105, s: 0.82 }
  ]) {
    push();
    translate(cloud.x, cloud.y);
    scale(cloud.s);
    ellipse(-27, 5, 55, 34);
    ellipse(0, -8, 58, 52);
    ellipse(31, 4, 54, 36);
    rectMode(CENTER);
    rect(2, 10, 64, 26, 12);
    pop();
  }

  // Repeating rain lines animate without adding random flicker.
  stroke('#4f9bbd');
  strokeWeight(3);
  strokeCap(ROUND);
  const drift = (frameCount * 2.4) % 22;
  for (const cloudX of [205, 505]) {
    const spread = cloudX === 205 ? 78 : 64;
    for (let i = 0; i < 7; i++) {
      const x = cloudX - spread / 2 + i * (spread / 6);
      const y = 128 + ((i * 19 + drift) % 115);
      line(x, y, x - 7, y + 15);
    }
  }
}


// EVENTS: each click advances one story beat, in order.

function handleUserInput() {

  // Clicks 8 and 9 trigger two high-five moments after the group forms.
  if (collectiveStarted) {
    if (isAnimating || !collectiveGathered || collectiveComplete) return;

    if (storyStep < 10) {
      storyStep++;
      if (storyStep === 8 || storyStep === 9) {
        const pairIndex = storyStep - 8;
        startHighFive(pairIndex);
        statusText.html(
          storyStep === 8
            ? 'Click 8: the first pair high-fives! Click again for another pair.'
            : 'Click 9: the next pair high-fives! Click again for the group high-five.'
        );
      } else {
        startGroupHighFive();
        statusText.html('Click 10: all five members high-five together!');
      }
    }
    return;
  }

  // Click 7 starts the collective scene and reveals the first member.
  if (storyStep === 6) {
    storyStep = 7;
    isAnimating = false;
    statusText.html('Click 7: everyone moves into a circle.');
    startCollectiveScene();
    return;
  }


  // ----------------------------------------
  // BLOCK EXTRA CLICKS DURING ANIMATION
  // ----------------------------------------

  if (isAnimating) return;


  // ----------------------------------------
  // NORMAL STORY CLICKS 1–6
  // ----------------------------------------

  storyStep += 1;

  isAnimating = true;


  if (storyStep === 1) {

    statusText.html(
      'Click 1: the first person walks to a place in the picture.'
    );

    character1.walkTo(285);

  }


  else if (storyStep === 2) {

    statusText.html(
      'Click 2: the first person sits down, feeling sad.'
    );

    character1.sitDown();

  }


  else if (storyStep === 3) {

    statusText.html(
      'Click 3: another person enters the picture.'
    );

    character2.visible = true;
    character2.walkTo(690);

  }


  else if (storyStep === 4) {

    statusText.html(
      'Click 4: the second person walks closer.'
    );

    character2.walkTo(450);

  }


  else if (storyStep === 5) {

    statusText.html(
      'Click 5: the second person reaches out with a candy.'
    );

    character2.offerCandy(candy);

  }

  else if (storyStep === 6) {

    statusText.html(
      'Click 6: the first person accepts the candy and stands up.'
    );

    character1.standUpWithCandy(candy);

  }
}


function finishBeatAfter(milliseconds) {
  setTimeout(() => { isAnimating = false; }, milliseconds);
}

function resetStory() {
  storyStep = 0;
  isAnimating = false;
  character1.reset(-70);
  character2.reset(870);
  character2.visible = false;
  candy.hide();
  statusText.html('Click 1: help the first person walk into the picture.');
  collectiveStarted = false;
  collectiveComplete = false;
  collectiveTextAlpha = 0;
  collectiveFigures = [];
  collectiveTargets = [];
  collectiveMovingIndex = 0;
  collectiveJoinedCount = 0;
  collectiveGathered = false;
  highFivePairIndex = -1;
  highFiveGroupActive = false;
  highFiveStartedAt = 0;

  character1.visible = true;
  character2.visible = false;

}


// OOP: reusable figure class; instances have their own state and behavior.
class Figure {
  constructor(x, groundY, color) {
    this.x = x;
    this.targetX = x;
    this.y = groundY;
    this.color = color;
    this.pose = 'standing';
    this.visible = true;
    this.hasCandy = false;
    this.facing = 1;
    this.targetY = groundY;
    this.displayScale = 0.72;
    this.motionPhase = random(TWO_PI);
  }

  walkTo(targetX) {
    this.targetX = targetX;
    this.facing = targetX >= this.x ? 1 : -1;
  }

  sitDown() {
    this.pose = 'sitting';
    // Lower the seated pose into the green grass area.
    this.targetY = GROUND_Y + 20;
    finishBeatAfter(650);
  }

  offerCandy(item) {
    item.x = this.x + this.facing * 92;
    item.y = this.y - 114;
    item.moveTo(this.x + this.facing * 92, this.y - 114);
    item.show();
    finishBeatAfter(650);
  }

  standUpWithCandy(item) {
    this.pose = 'standing';
    this.targetY = GROUND_Y;
    this.hasCandy = true;
    item.moveTo(this.x + this.facing * 92, this.targetY - 114);
    finishBeatAfter(500);
  }
   update() {

  // Move horizontally.
  this.x = lerp(
    this.x,
    this.targetX,
    MOVE_EASING
  );

  // Move vertically.
  this.y = lerp(
    this.y,
    this.targetY,
    MOVE_EASING
  );

  // Check arrival.
  const arrivedX =
    abs(this.x - this.targetX) < ARRIVAL_DISTANCE;

  const arrivedY =
    abs(this.y - this.targetY) < ARRIVAL_DISTANCE;

  if (arrivedX && arrivedY) {

    this.x = this.targetX;
    this.y = this.targetY;

    // Unlock the original story steps.
    if (
      isAnimating &&
      storyStep !== 2 &&
      storyStep !== 5 &&
      storyStep !== 6 &&
      storyStep !== 7
    ) {
      isAnimating = false;
    }

    // Click 6: allow the next click after accepting the candy.
    if (storyStep === 6 && this.hasCandy) {
      isAnimating = false;
    }
  }
}

  draw() {
    if (!this.visible) return;
    push();
    // Zicen's shared sound drives a staggered wave like the earlier image demo.
    // A unique phase keeps the group coordinated without moving as one rigid block.
    const motionAmount = PREFERS_REDUCED_MOTION ? 0 : 1;
    const idleLift = collectiveStarted
      ? sin(frameCount * 0.035 + this.motionPhase) * 2.5 * motionAmount
      : 0;
    const audioLift = sin(frameCount * 0.12 + this.motionPhase) *
      (audioData.intensity * 22 + audioData.bass * 16) * motionAmount;
    const audioTurn = sin(frameCount * 0.08 + this.motionPhase) *
      audioData.treble * 0.14 * motionAmount;
    translate(this.x, this.y + idleLift + audioLift);
    rotate(audioTurn);
    scale(this.facing * this.displayScale, this.displayScale);
    stroke(INK);
    strokeWeight(5);
    strokeCap(ROUND);
    strokeJoin(ROUND);
    fill(this.color);
    if (this.pose === 'sitting') {
      // Folded legs sit on the grass, with thick rounded outlines matching
      // the standing character's soft silhouette.
      noFill();
      stroke(INK);
      strokeWeight(34);
      bezier(-18, -14, -37, -10, -58, -2, -78, -5);
      bezier(18, -14, 38, -12, 58, -2, 78, -5);
      stroke(this.color);
      strokeWeight(25);
      bezier(-18, -14, -37, -10, -58, -2, -78, -5);
      bezier(18, -14, 38, -12, 58, -2, 78, -5);

      // Long rounded torso lowers the hips close to the grass.
      fill(this.color);
      stroke(INK);
      strokeWeight(5);
      beginShape();
      vertex(-24, -149);
      bezierVertex(-41, -124, -35, -78, -32, -35);
      bezierVertex(-31, -17, -25, -7, -13, -7);
      bezierVertex(9, -7, 25, -9, 31, -25);
      bezierVertex(38, -57, 33, -119, 23, -149);
      bezierVertex(10, -159, -11, -159, -24, -149);
      endShape(CLOSE);

      // Arms curve inward toward the lap.
      noFill();
      stroke(INK);
      strokeWeight(19);
      bezier(-23, -132, -39, -105, -22, -77, -4, -57);
      bezier(23, -132, 39, -105, 22, -77, 4, -57);
      stroke(this.color);
      strokeWeight(11);
      bezier(-23, -132, -39, -105, -22, -77, -4, -57);
      bezier(23, -132, 39, -105, 22, -77, 4, -57);
    } else {
      beginShape();
      vertex(-14, -154);
      bezierVertex(-43, -176, -72, -151, -96, -143);
      bezierVertex(-116, -136, -124, -153, -119, -171);
      bezierVertex(-115, -188, -135, -190, -141, -174);
      bezierVertex(-155, -139, -137, -113, -106, -116);
      bezierVertex(-79, -119, -59, -128, -48, -106);
      bezierVertex(-38, -84, -45, -42, -62, -15);
      bezierVertex(-78, 10, -98, 30, -87, 43);
      bezierVertex(-71, 62, -53, 44, -39, 24);
      bezierVertex(-24, 2, -12, -8, 1, 4);
      bezierVertex(18, 19, 30, 49, 46, 43);
      bezierVertex(68, 36, 52, 18, 39, -2);
      bezierVertex(22, -27, 16, -72, 25, -101);
      bezierVertex(33, -127, 54, -122, 77, -117);
      bezierVertex(109, -110, 131, -127, 128, -158);
      bezierVertex(126, -176, 119, -190, 107, -184);
      bezierVertex(96, -179, 108, -162, 101, -147);
      bezierVertex(94, -132, 76, -140, 55, -149);
      bezierVertex(32, -160, 16, -173, -14, -154);
      endShape(CLOSE);
    }
    // Restore the fill after the seated arm strokes so the head is fully colored.
    fill(this.color);
    stroke(INK);
    strokeWeight(5);
    ellipse(0, -183, 102, 102);
    noFill();
    stroke(INK);
    strokeWeight(3);
    if (this.pose === 'sitting' && !this.hasCandy) {
      arc(-20, -187, 19, 13, 0, PI);
      arc(20, -187, 19, 13, 0, PI);
      arc(0, -161, 22, 14, PI, TWO_PI);
    } else {
      arc(-20, -186, 21, 15, 0, PI);
      arc(20, -186, 21, 15, 0, PI);
      arc(0, -166, 26, 19, 0, PI);
    }
    noStroke();
    fill(255, 255, 255, 58);
    ellipse(-27, -210, 20, 11);
    ellipse(25, -228, 14, 8);
    ellipse(-60, -96, 15, 9);
    ellipse(51, -78, 13, 22);
    ellipse(-23, -42, 12, 24);
    fill(0, 0, 0, 20);
    ellipse(58, -178, 11, 20);
    ellipse(-42, -134, 12, 19);
    ellipse(9, -118, 10, 18);
    pop();
  }

  reset(startX) {
    this.x = startX;
    this.targetX = startX;
    this.y = GROUND_Y;
    this.targetY = GROUND_Y;
    this.pose = 'standing';
    this.visible = true;
    this.hasCandy = false;
  }
}

class Candy {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.visible = false;
  }

  show() { this.visible = true; }
  hide() { this.visible = false; this.x = 0; this.y = 0; this.targetX = 0; this.targetY = 0; }

  moveTo(x, y) {
    this.targetX = x;
    this.targetY = y;
  }

  update() {

  this.x = lerp(
    this.x,
    this.targetX,
    MOVE_EASING
  );

  this.y = lerp(
    this.y,
    this.targetY,
    MOVE_EASING
  );

  if (
    abs(this.x - this.targetX) < ARRIVAL_DISTANCE &&
    abs(this.y - this.targetY) < ARRIVAL_DISTANCE
  ) {
    this.x = this.targetX;
    this.y = this.targetY;
  }
}

  draw() {
    if (!this.visible) return;
    push();
    translate(this.x, this.y + sin(frameCount * 0.08) * 2);
    rotate(sin(frameCount * 0.08) * 0.08);
    stroke(INK);
    strokeWeight(3);
    fill('#f5cc36');
    triangle(-7, 0, -18, -8, -18, 8);
    triangle(7, 0, 18, -8, 18, 8);
    ellipse(0, 0, 19, 15);
    pop();
  }
}

// ========================================
// COLLECTIVE CIRCLE POSITIONS
// ========================================

function arrangeCollectiveCircle() {
  const centerX = width / 2;
  const centerY = height / 2 + 35;
  const radiusX = min(width * 0.32, 255);
  const radiusY = min(height * 0.25, 125);
  const total = collectiveFigures.length;

  collectiveTargets = collectiveFigures.map((figure, i) => {
    const angle = -HALF_PI + TWO_PI * i / total;
    const x = centerX + cos(angle) * radiusX;
    const y = centerY + sin(angle) * radiusY;
    const depth = constrain(
      map(y, centerY - radiusY, centerY + radiusY, 0, 1),
      0,
      1
    );

    figure.facing = x < centerX ? 1 : -1;
    figure.displayScale = lerp(0.48, 0.58, depth);
    figure.motionPhase = i * TWO_PI / total;
    return { x, y, angle, depth };
  });
}

// All five members move to their circle positions together. Hand links are
// added separately, one per click, after the group has formed.
function updateCollectiveSequence() {
  if (!collectiveStarted || collectiveGathered) return;

  const allArrived = collectiveFigures.every((figure, index) => {
    const target = collectiveTargets[index];
    return (
      abs(figure.x - target.x) < ARRIVAL_DISTANCE &&
      abs(figure.y - target.y) < ARRIVAL_DISTANCE
    );
  });

  if (allArrived) {
    collectiveFigures.forEach((figure, index) => {
      figure.x = figure.targetX = collectiveTargets[index].x;
      figure.y = figure.targetY = collectiveTargets[index].y;
    });
    collectiveGathered = true;
    isAnimating = false;
    statusText.html('The group is in a circle. Click 8 to start the first high-five.');
  }
}

// ========================================
// CLICK 7 — FINAL COLLECTIVE IMAGE
// ========================================

function startCollectiveScene() {

  console.log("================================");
  console.log("CLICK 7 STARTED");
  console.log("================================");


  // ----------------------------------------
  // START FINAL SCENE
  // ----------------------------------------

  collectiveStarted = true;
  collectiveComplete = false;
  collectiveTextAlpha = 0;


  // ----------------------------------------
  // CREATE FIVE CHARACTERS
  // ----------------------------------------

  setupCollectiveScene();

  console.log(
    "FIVE CHARACTERS CREATED:",
    collectiveFigures.length
  );


  // ----------------------------------------
  // HIDE ORIGINAL STORY CHARACTERS
  // ----------------------------------------

  character1.visible = false;
  character2.visible = false;

  candy.hide();


  // ----------------------------------------
  // SET FINAL POSITIONS
  // ----------------------------------------

  arrangeCollectiveCircle();
  collectiveMovingIndex = 0;
  collectiveJoinedCount = 0;
  collectiveGathered = false;
  highFivePairIndex = -1;
  highFiveGroupActive = false;
  highFiveStartedAt = 0;
  collectiveFigures.forEach((figure, index) => {
    figure.visible = true;
    figure.targetX = collectiveTargets[index].x;
    figure.targetY = collectiveTargets[index].y;
  });
  isAnimating = true;

  // ----------------------------------------
  // IMPORTANT:
  // SHOW ALL FIVE
  // ----------------------------------------

  collectiveFigures.forEach((figure, index) => {

    console.log(
      "Character",
      index + 1,
      "position:",
      figure.x,
      figure.y,
      "target:",
      figure.targetX,
      figure.targetY
    );

  });


  isAnimating = true;
}
// ========================================
// DRAW FINAL COLLECTIVE SCENE
// ========================================
function drawCollectiveScene() {

  if (!collectiveStarted) return;


  // ----------------------------------------
  // CONNECTIONS BEHIND THE FIGURES
  // ----------------------------------------

  drawCollectiveConnections();

  // Draw back-to-front so the lower figures naturally overlap the upper row.
  const figuresByDepth = [...collectiveFigures]
    .sort((a, b) => a.y - b.y);
  figuresByDepth.forEach(figure => figure.draw());

  // ----------------------------------------
  // HIGH-FIVE EFFECTS ABOVE THE FIGURES
  // ----------------------------------------

  drawHighFiveInteraction();


  // On-canvas instruction makes the extra interaction clicks visible.
  push();
  textAlign(CENTER, CENTER);
  textSize(17);
  textStyle(BOLD);
  noStroke();
  fill(23, 23, 23);

  if (!collectiveGathered) {
    text('Forming the circle…', width / 2, 28);
  } else if (storyStep < 8) {
    text('CLICK 8  ·  First high-five', width / 2, 28);
  } else if (storyStep < 9) {
    text('CLICK 9  ·  Next high-five', width / 2, 28);
  } else if (storyStep < 10) {
    text('CLICK 10  ·  All five high-five together!', width / 2, 28);
  } else if (!collectiveComplete) {
    text('ALL FIVE HIGH-FIVE!', width / 2, 28);
  } else {
    collectiveTextAlpha = min(collectiveTextAlpha + 5, 255);
    fill(23, 23, 23, collectiveTextAlpha);
    text('FINAL COLLECTIVE IMAGE', width / 2, 28);
  }
  pop();
}


// Start a short high-five animation for the selected neighboring pair.
function startHighFive(pairIndex) {
  highFivePairIndex = pairIndex;
  highFiveGroupActive = false;
  highFiveStartedAt = millis();
  isAnimating = true;
}

function startGroupHighFive() {
  highFivePairIndex = -1;
  highFiveGroupActive = true;
  highFiveStartedAt = millis();
  isAnimating = true;
}

function getHighFiveOrigin(figure, targetX) {
  const direction = targetX >= figure.x ? 1 : -1;
  return {
    x: figure.x + direction * 78 * figure.displayScale,
    y: figure.y - 142 * figure.displayScale
  };
}

function drawHighFiveArm(origin, target, color, scaleAmount) {
  strokeCap(ROUND);
  stroke(INK);
  strokeWeight(14 * scaleAmount);
  line(origin.x, origin.y, target.x, target.y);
  stroke(color);
  strokeWeight(8 * scaleAmount);
  line(origin.x, origin.y, target.x, target.y);
}

function drawGroupHighFive(progress) {
  const pulse = sin(constrain(progress, 0, 1) * PI);
  const handX = width / 2;
  const handY = height / 2 - 42 - 18 * pulse;
  push();
  for (const figure of collectiveFigures) {
    const origin = getHighFiveOrigin(figure, handX);
    const reach = 0.58 + pulse * 0.42;
    const target = {
      x: lerp(origin.x, handX, reach),
      y: lerp(origin.y, handY, reach)
    };
    drawHighFiveArm(origin, target, figure.color, figure.displayScale / 0.52);
  }
  noStroke();
  fill('#f4c7a1');
  circle(handX, handY, 28 + pulse * 10);
  if (pulse > 0.45) {
    fill('#ffd447');
    for (let i = 0; i < 10; i++) {
      const angle = TWO_PI * i / 10;
      const radius = 30 + pulse * 16;
      circle(handX + cos(angle) * radius, handY + sin(angle) * radius, 7);
    }
  }
  pop();
}

function drawHighFiveInteraction() {
  if ((!highFiveGroupActive && highFivePairIndex < 0) || collectiveFigures.length < 2) return;

  const elapsed = millis() - highFiveStartedAt;
  const duration = 850;
  if (elapsed > duration) {
    highFivePairIndex = -1;
    if (highFiveGroupActive) {
      highFiveGroupActive = false;
      collectiveComplete = true;
      statusText.html('All five members high-fived together!');
    }
    isAnimating = false;
    return;
  }

  if (highFiveGroupActive) {
    drawGroupHighFive(elapsed / duration);
    return;
  }

  const a = collectiveFigures[highFivePairIndex % collectiveFigures.length];
  const b = collectiveFigures[(highFivePairIndex + 1) % collectiveFigures.length];
  const progress = constrain(elapsed / duration, 0, 1);
  const clap = sin(progress * PI);
  const handX = lerp(a.x, b.x, 0.5);
  const originA = getHighFiveOrigin(a, handX);
  const originB = getHighFiveOrigin(b, handX);
  const handY = lerp(originA.y, originB.y, 0.5) - 18 * clap;
  const separation = lerp(16, 5, clap);

  push();
  drawHighFiveArm(
    originA,
    { x: handX - separation, y: handY },
    a.color,
    a.displayScale / 0.52
  );
  drawHighFiveArm(
    originB,
    { x: handX + separation, y: handY },
    b.color,
    b.displayScale / 0.52
  );
  noStroke();
  fill('#f4c7a1');
  circle(handX - separation, handY, 14);
  circle(handX + separation, handY, 14);

  // A quick sparkle marks the moment the palms meet.
  if (progress > 0.28 && progress < 0.72) {
    fill('#ffd447');
    for (let i = 0; i < 4; i++) {
      const angle = -HALF_PI + i * HALF_PI;
      const sx = handX + cos(angle) * 24;
      const sy = handY + sin(angle) * 24;
      circle(sx, sy, 7);
    }
  }
  pop();
}

// ========================================
// CONNECT FIVE CHARACTERS
// ========================================

function drawCollectiveConnections() {

  if (!collectiveStarted) return;

  const total = collectiveFigures.length;

  stroke(INK);
  strokeWeight(7);
  strokeCap(ROUND);

  // Draw only the links that have formed so far. Lines end near each
  // character's outer shoulder/hand, so they read as joined arms.
  const linksToDraw = min(collectiveJoinedCount, total);
  for (let i = 1; i <= linksToDraw; i++) {
    const previous = collectiveFigures[i - 1];
    const current = collectiveFigures[i % total];
    const dx = current.x - previous.x;
    const dy = current.y - previous.y;
    const distance = max(1, sqrt(dx * dx + dy * dy));
    const ux = dx / distance;
    const uy = dy / distance;
    const shoulderY = -128;
    line(
      previous.x + ux * 38, previous.y + shoulderY + uy * 14,
      current.x - ux * 38, current.y + shoulderY - uy * 14
    );
    // Rounded endpoints make the joined hands visible.
    noStroke();
    fill('#f4c7a1');
    circle(previous.x + ux * 38, previous.y + shoulderY + uy * 14, 13);
    circle(current.x - ux * 38, current.y + shoulderY - uy * 14, 13);
    stroke(INK);
    strokeWeight(7);
    strokeCap(ROUND);
  }
}

function resetUserInput() {
  storyStep = 0;
  isAnimating = false;
  character1.reset(-70);
  character2.reset(870);
  candy.hide();
  statusText.html('Click 1: help the first person walk into the picture.');
  collectiveStarted = false;
  collectiveComplete = false;
  collectiveTextAlpha = 0;
  collectiveFigures = [];
  collectiveTargets = [];
  collectiveMovingIndex = 0;
  collectiveJoinedCount = 0;
  collectiveGathered = false;
  highFivePairIndex = -1;
  highFiveGroupActive = false;
  highFiveStartedAt = 0;
}
