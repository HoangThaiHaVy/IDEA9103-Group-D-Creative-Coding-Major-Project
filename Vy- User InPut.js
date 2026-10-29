// User input and character/kite drawing.
// Story states are controlled by sketch.js:
// intro -> ready -> holding -> released -> walking -> arrival -> walking -> finished
// ========================================
// So sad.png as the next image after sad-rain face.png is clicked.
// The soSad story state keeps heavy rain running and draws the new image.
// Search for "[EDITED]" below to jump to every changed section.
// ========================================
let standingImage;
let surprisedImage;
let walkImage;
let walk1Image;
let walk2Image;
let sadnessImage;
let sadRainImage;
// Image shown after the user clicks the sad-rain face.
let soSadImage;
let sadnessImageReady = false;
let sadRainImageReady = false;
// Declare the load flag used by the So sad.png callback.
let soSadImageReady = false;
// Track loading so So sad.png is drawn only after it is ready.
let walkImageReady = false;
let walk1ImageReady = false;
let walk2ImageReady = false;
let standingImageReady = false;
let surprisedImageReady = false;
let walkImagesReady = false;
let standingImageFailed = false;
let surprisedImageFailed = false;
let walkImageFailed = false;
let sadnessStartedAt = 0;



function updateAndDrawVy(time, dt) {
  // Character and kite visuals follow the current story stage.
  
  const walking = storyStage === 'walking';
  // Updated: keep the kite's escape animation active throughout the sad scenes.
  const released = storyStage === 'released' || walking || storyStage === 'arrival' || ['finished', 'lostKite', 'rainStorm', 'rainFace'].includes(storyStage);
  const finishedElapsed = finishedAt > 0 ? max(0, time - finishedAt) : 0;
  // Updated: let the kite finish flying away before the sad-story clicks begin.
  const kiteEscaped = ['finished', 'lostKite', 'rainStorm', 'rainFace'].includes(storyStage) && finishedElapsed >= 0.8;
  const kiteRise = arrivalAt > 0 ? min(120, max(0, time - arrivalAt) * 35) : 0;
  // The wind begins to pick up while character is walking, near the edge of the screen.
  const windStartsNearEnd =
    walking && characterX >= width - 220;

  if (windStartsNearEnd) {
    drawWind(time);
  }
  const sadnessElapsed = sadnessStartedAt > 0
    ? time - sadnessStartedAt
    : 0;
// Include soSad in the rain states and force heavy rain.
  if (
    ['lostKite', 'rainStorm', 'soSad', 'rainFace'].includes(storyStage) &&
    sadnessElapsed >= 1.5
  ) {
    drawRain(time, storyStage !== 'lostKite');
  }
    // The cave grows out of the existing lawn, over the rain and behind character.
  if (storyStage === 'rainFace') {
    const caveProgress = constrain((time - sadRainStartedAt - 2.4) / 2.2, 0, 1);
    if (caveProgress > 0) drawCave(caveProgress);
  }

  drawCharacterAndKite(characterX, GROUND_Y, time, {
    walking,
    released,
    surprised: storyStage === 'finished',
    sadness: storyStage === 'lostKite' || storyStage === 'rainStorm',
    // Updated: the first click after the kite escapes uses stand-sadness.png.
    sadRain: storyStage === 'rainFace',
    sadRainProgress: storyStage === 'rainFace' ? min(1, max(0, (time - sadRainStartedAt) / 1.2)) : 0,
    // [EDITED]: the final click replaces the sad-rain face with So sad.png.
    soSad: storyStage === 'soSad',
    // Do not draw the kite in the So sad scene.
    hideKite: storyStage === 'soSad',
    kiteEscaped,
    escapeTime: kiteEscaped ? finishedElapsed - 0.8 : 0,
    kiteRise,
    fade: characterFade,
    
  });
 
  if (storyStage === 'holding') drawCharacterHint('Let the kite take flight (click figure). ');
  if (storyStage === 'released') drawCharacterHint('One click, lets go fly a kite together!');
  if (storyStage === 'arrival') drawCharacterHint('Click character to continue story');
  if (storyStage === 'finished') drawCharacterHint('Windy~the kite floats higher');
  if (storyStage === 'lostKite') drawCharacterHint('Oh no! My kite is gone!');
  // [EDITED] The rain is getting heavier...
  if (storyStage === 'rainStorm') drawCharacterHint('The rain is getting heavier...');
  // [EDITED] So sad.png keeps the “Still raining...” caption.
   if (storyStage === 'soSad') drawCharacterHint('Still raining...');
  // [EDITED] The next click advances to the sad-rain face.
   if (storyStage === 'rainFace') drawCharacterHint('Still raining...');

   // Removed the duplicate drawKite() call here.
  // kiteX, kiteY, handX, and handY exist only inside drawCharacterAndKite(),
  // which already draws the kite; calling them here caused a ReferenceError.
}


function mousePressed() {
  if (storyStage === 'intro') {
    storyStage = 'ready';
  } else if (storyStage === 'ready') {
    const overStart = abs(mouseX - width / 2) < 85 && abs(mouseY - 275) < 35;
    if (overStart) {
      storyStage = 'fadeIn';
      characterX = 105;
      characterFade = 0;
      arrivalAt = 0;
      midpointReached = false;
      walkFinished = false;
    }
  } else if (storyStage === 'holding' && clickOnCharacter()) {
    storyStage = 'released';
  } else if (storyStage === 'released' && clickOnCharacter()) {
    storyStage = 'walking';
    } else if (storyStage === 'arrival' && clickOnCharacter()) {
    // Continue walking from the midpoint to the end of the path.
    midpointReached = true;
    storyStage = 'walking';
    // Updated: clicks on character advance the three post-escape emotional beats.
    } else if (storyStage === 'finished' &&
             millis() / 1000 - finishedAt >= 1.8 &&
             clickOnCharacter()) {
    storyStage = 'lostKite';
    sadnessStartedAt = millis() / 1000;
    
    } else if (storyStage === 'lostKite' && clickOnCharacter()) {
    storyStage = 'rainStorm';
  // [EDITED] First click after “The rain is getting heavier...” shows So sad.png.
    } else if (storyStage === 'rainStorm' && clickOnCharacter()) {
    storyStage = 'soSad';
  // [EDITED] Second click shows sad-rain face; its caption is “Still raining...”.
    } else if (storyStage === 'soSad' && clickOnCharacter()) {
    storyStage = 'rainFace';
    sadRainStartedAt = millis() / 1000;
  }
  
  return false;
}


function clickOnCharacter() {
  const clickedCharacter =
    abs(mouseX - characterX) < 55 &&
    mouseY > GROUND_Y - 160 &&
    mouseY < GROUND_Y + 25;
  const clickedHint =
    abs(mouseX - characterX) < 155 &&
    mouseY >= GROUND_Y + 42 &&
    mouseY <= GROUND_Y + 78;
  return clickedCharacter || clickedHint;
}



function drawClickArrow() {
  const handBob = sin(frameCount * 0.04) * 4;
  push();
  translate(width / 2, height / 2 - 15 + handBob);
  scale(0.50);

  // Sparkles around the fingertip
  stroke('#e85b79');
  strokeWeight(8);
  strokeCap(ROUND);
  line(-57, -73, -77, -81);
  line(-20, -91, -25, -113);
  line(14, -91, 22, -111);
  line(48, -73, 68, -81);
  line(-73, -43, -94, -39);

  // Outer edge of the hand
  fill('#ff91a7');
  stroke('#e85b79');
  strokeWeight(9);
  beginShape();
  vertex(-15, 80);                 
  // left wrist
  bezierVertex(-35, 68, -67, 48, -82, 34); 
  // Thumb
  bezierVertex(-97, 20, -84, 1, -66, 8);
  vertex(-43, 20);
  vertex(-68, -66);                
  // Index finger
  bezierVertex(-74, -87, -54, -96, -45, -78);
  vertex(-23, -20);
  vertex(-19, -35);                
  // The space between the index finger and the middle finger
  bezierVertex(-16, -48, -1, -51, 7, -42);
  bezierVertex(17, -51, 31, -46, 37, -37);
  bezierVertex(51, -43, 64, -34, 69, -21);
  bezierVertex(82, 12, 87, 43, 70, 67);
  bezierVertex(51, 91, 16, 96, -15, 80);
  endShape(CLOSE);

  // Finger-like folds
  noFill();
  stroke('#e85b79');
  strokeWeight(7);
  strokeCap(ROUND);
  bezier(-23, -20, -16, -7, -11, 7, -7, 20);
  bezier(8, -33, 13, -22, 17, -11, 20, 0);
  bezier(39, -29, 43, -19, 47, -9, 49, 1);

  
// ... the part depicting the hand remains unchanged ...

  pop();
  // Instructional text
  noStroke();
  fill('#000000');
  textAlign(CENTER, TOP);
  textFont('Georgia');
  textStyle(BOLD);
  textSize(21);
  text('Click to start story', width / 2, height / 2 + 40);



  textStyle(NORMAL);
  
}
 

function drawStartPrompt() {
  noStroke();
  fill('#252525');
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(34);
  text('"Move Together" Story', width / 2, 205);
  textStyle(NORMAL);
  fill('#ffffff');
  rectMode(CENTER);
  rect(width / 2, 275, 150, 54, 14);
  noFill();
  stroke('#252525');
  strokeWeight(2);
  rect(width / 2, 275, 150, 54, 14);
  noStroke();
  fill('#252525');
  textSize(23);
  text('start', width / 2, 275);
  rectMode(CORNER);
  
}

function drawCharacterHint(label) {
  push();
  textFont('Georgia');
  textStyle(BOLD);
  textSize(12);
  textAlign(CENTER, CENTER);


  const isStoryHint = [
    'Let the kite take flight (click figure). ',
    'Click character to continue story',
    'One click, lets go fly a kite together!',
    'Windy~the kite floats higher'
  ].includes(label);
  const boxWidth = min(width - 32, textWidth(label) + 18);
  const boxHeight = 32;
  const boxX = width / 2;
  const boxY = height - 28;

  rectMode(CENTER);
  fill('#ffffff');
  stroke('#000000');
  strokeWeight(1);
  rect(boxX, boxY, boxWidth, boxHeight, 8);

  noStroke();
  fill('#000000');
  text(label, boxX, boxY, boxWidth - 12, boxHeight - 4);

  // Soft shadow
  drawingContext.shadowColor = 'rgba(80, 35, 45, 0.18)';
  drawingContext.shadowBlur = 12;
  drawingContext.shadowOffsetY = 4;


  pop();
}


function preloadCharacterImages() {
  standingImage = loadImage(
    'stand.png',
    (img) => {
      // Crop away the black margin only when the source has the expected size.
      // Smaller source images are drawn whole instead of producing an empty crop.
      if (img.width >= 585 && img.height >= 1090) {
        standingImage = img.get(195, 190, 390, 900);
      } else {
        standingImage = img;
      }
      standingImageReady = true;
    },
    () => {
      standingImageFailed = true;
      imageLoadFailed('stand.png');
    }
    
  );


surprisedImage = loadImage(
    'stand-suprise 1.png',
    (img) => {
      surprisedImage = img;
      surprisedImageReady = true;
    },
    () => {
      surprisedImageFailed = true;
      imageLoadFailed('stand-suprise 1.png');
    }
  );

  let loadedWalkImages = 0;
  const onWalkImageLoaded = () => {
    loadedWalkImages++;
    if (loadedWalkImages === 2) walkImagesReady = true;
  };

  const onWalkImageFailed = (filename) => {
    walkImageFailed = true;
    imageLoadFailed(filename);
  };
  

    walk1Image = loadImage(
    'walk.png',
    () => { walk1ImageReady = true; },
    () => imageLoadFailed('walk.png')
   );

   walk2Image = loadImage(
   'walk2.png',
   () => { walk2ImageReady = true; },
   () => imageLoadFailed('walk2.png')
  );
   //  Updated: load the three requested emotional poses.
   sadnessImage = loadImage('stand-sadness.png', () => { sadnessImageReady = true; }, () => imageLoadFailed('stand-sadness.png'));
   sadRainImage = loadImage('sad-rain face.png', () => { sadRainImageReady = true; }, () => imageLoadFailed('sad-rain face.png'));
  // [EDITED]: preload the final image used after clicking sad-rain face.
   soSadImage = loadImage('So sad.png', () => { soSadImageReady = true; }, () => imageLoadFailed('So sad.png'));
}


function imageLoadFailed(filename) {
  console.warn(`Could not load ${filename}. Check that the filename and folder match exactly.`);
}

function drawCharacterAndKite(x, groundY, time, options = {}) {
 const {
    walking = false,
    released = false,
    surprised = false,
    sadness = false,
    sadRain = false,
    sadRainProgress = 0,
      // Passed from the soSad story state.
    hideKite = false,
    kiteEscaped = false,
    escapeTime = 0,
    kiteRise = 0,
    fade = 1
  } = options;
  const bob = walking ? sin(time * 9) * 2 : 0;
  const characterY = groundY - 48 + bob;
  const handX = x + 19;
  const handY = groundY - 74 + bob;
  
  // The kite drifts beside character after release, but its string stays in her hand
  // until the finished scene starts the escape animation.
  const kiteX = kiteEscaped
    ? x + 120 + escapeTime * 120 + sin(time * 1.4) * 18
    : released
      ? x + 120 + sin(time * 1.4) * 18
      : x + 27;
  const kiteY = kiteEscaped
    ? groundY - 165 - escapeTime * 100 + sin(time * 2.2) * 13
    : released
      ? groundY - 165 - kiteRise + sin(time * 2.2) * 13
      : groundY - 90 + sin(time * 1.2) * 2;


  let imageToDraw = null;
// show So sad.png only in the soSad stage, after the face is clicked.
  if (options.soSad && soSadImageReady) {
    imageToDraw = soSadImage;
  } else if (sadRain && sadRainImageReady) {
    imageToDraw = sadRainImage;
  } else if (sadness && sadnessImageReady) {
    imageToDraw = sadnessImage;
  
  } else if (surprised && surprisedImageReady && !surprisedImageFailed) {
    imageToDraw = surprisedImage;
  } else if (walking) {
    const useWalk1 = floor(time / 0.18) % 2 === 0;
    if (useWalk1 && walk1ImageReady) {
      imageToDraw = walk1Image;
    } else if (!useWalk1 && walk2ImageReady) {
      imageToDraw = walk2Image;
    } else if (walk1ImageReady) {
      imageToDraw = walk1Image;
    } else if (walk2ImageReady) {
      imageToDraw = walk2Image;
    }
  } else if (standingImageReady && !standingImageFailed) {
    imageToDraw = standingImage;
  }

  push();
  // Change this value to recolour the character image.
  const characterTint = color('rgb(92, 255, 119)');
  if (imageToDraw === surprisedImage) {
    noTint(); // The 'surprised' image retains its original colors
  } else {
    tint(red(characterTint), green(characterTint), blue(characterTint), 300 * fade);
  }
  if (imageToDraw) {
    imageMode(CENTER);
    const imageHeight = 220;
    const imageWidth = imageHeight * imageToDraw.width / imageToDraw.height;
    image(imageToDraw, x, groundY - imageHeight / 2 + bob + 12, imageWidth, imageHeight);
    //  Updated: fade sad-rain face in over stand-sadness during the third beat.
    if (sadRain && sadRainImageReady) {
      tint(255, 255 * sadRainProgress);
      const rainFaceWidth = imageHeight * sadRainImage.width / sadRainImage.height;
      image(sadRainImage, x, groundY - imageHeight / 2 + bob + 12, rainFaceWidth, imageHeight);
    }
  } else {
    drawFallbackCharacter(x, characterY, fade);
  }
  pop();
  // The released kite remains tethered through the "walk together" prompt.
  // In the finished scene the string is gone and the kite flies out of view.
  // Hide it for So sad; otherwise keep the escape animation.
  if (!hideKite && (!kiteEscaped || kiteY > -100)) {
    drawKite(kiteX, kiteY, time, handX, handY, !kiteEscaped, released ? 1.5 : 1);
  }
 }


function drawKite(x, y, time, handX, handY, tethered, kiteScale = 1) {
  const sway = sin(time * 2.2) * (tethered ? 4 : 7);
  const kx = x + sway;
  const ky = y;

  // The kite's string
  stroke('#51465f');
  strokeWeight(2);
  noFill();

  if (tethered) {
    bezier(
      handX, handY,
      handX + 20, handY - 45,
      kx - 15 * kiteScale, ky + 55 * kiteScale,
      kx, ky + 18 * kiteScale
    );
  } else {
    bezier(
      kx, ky + 18 * kiteScale,
      kx - 15 * kiteScale, ky + 53 * kiteScale,
      kx + 9 * kiteScale, ky + 47 * kiteScale,
      kx - 1 * kiteScale, ky + 91 * kiteScale
    );
  }

  push();
  translate(kx, ky);
  scale(kiteScale);
  rotate(PI / 4);

  // A faint shadow behind the kite
  noStroke();
  fill(40, 35, 60, 35);
  quad(2, -21, 18, 0, 2, 21, -14, 0);

  // The body of the kite with four colored panels
  stroke('#fff8ed');
  strokeWeight(2);
  fill('#f05b78');
  quad(0, 0, 0, -27, 19, 0, 0, 0);

  fill('#ffc857');
  quad(0, 0, 19, 0, 0, 27, 0, 0);

  fill('#63c7c2');
  quad(0, 0, 0, 27, -19, 0, 0, 0);

  fill('#7b78d2');
  quad(0, 0, -19, 0, 0, -27, 0, 0);

  // The frame and decorative points in the center
  stroke('#fff8ed');
  strokeWeight(2);
  line(0, -27, 0, 27);
  line(-19, 0, 19, 0);

  noStroke();
  fill('#fff8ed');
  circle(0, 0, 5);

  // The tail of the kite, gently curved, with a bow
  noFill();
  stroke('#f05b78');
  strokeWeight(2);
  bezier(0, 27, 9, 38, -8, 47, 1, 59);

  noStroke();
  fill('#ffc857');
  triangle(-7, 37, 1, 42, 8, 36);
  fill('#63c7c2');
  triangle(-6, 49, 1, 54, 8, 48);
  fill('#7b78d2');
  triangle(-5, 60, 1, 65, 7, 59);

  pop();
}

function drawFallbackCharacter(x, y, fade = 1) {
  push();
  translate(x, y);
  scale(fade);
  noStroke();
  fill('#f2c7a5');
  ellipse(0, -42, 23, 27);
  fill('#292b35');
  arc(0, -48, 25, 24, PI, TWO_PI);
  fill('#ed5364');
  rectMode(CENTER);
  rect(0, -14, 28, 32, 8);
  stroke('#292b35');
  strokeWeight(4);
  line(-7, 0, -9, 22);
  line(7, 0, 9, 22);
  pop();
}

function drawWind(time) {
  push();
  noFill();
  strokeCap(ROUND);
  strokeJoin(ROUND);

  const flows = 5;
  const windAreaTop = 85;
  const windAreaBottom = GROUND_Y - 55;
  const spacing = (windAreaBottom - windAreaTop) / (flows - 1);

  for (let i = 0; i < flows; i++) {
    const y = windAreaTop + i * spacing;
    const speed = 55 + (i % 3) * 18;
    const travel = (time * speed + i * 173) % (width + 100);
    const x = travel - 50;
    const size = 0.55 + (i % 2) * 0.12;
    const bob = sin(time * 2 + i) * 6;

    drawWindGust(x, y + bob, size);
  }

  pop();
}

function drawWindGust(x, y, size) {
  push();
  translate(x, y);
  scale(size);
  noFill();
  strokeCap(ROUND);
  strokeJoin(ROUND);

  // Main swirl: thick pastel-green line
  stroke('#9BD9E8');
  strokeWeight(10);
  bezier(-42, 0, -12, -28, 25, -23, 44, -7);
  bezier(44, -7, 65, 11, 45, 30, 26, 19);
  bezier(26, 19, 13, 12, 22, 1, 34, 6);

  // Inner light rays creating a soft and translucent effect
  stroke('#E8FAFC');
  strokeWeight(3);
  bezier(-39, -2, -10, -25, 22, -21, 41, -7);
  bezier(42, -5, 59, 10, 43, 25, 27, 17);

  // Additional wind streaks
  stroke('#B8E8F0');
  strokeWeight(7);
  bezier(-27, -24, 2, -42, 35, -34, 52, -15);
  bezier(-32, 12, -7, 31, 20, 39, 43, 31);

  // Small bright spot creating a shimmering effect
  noStroke();
  fill('#DDF5F8');
  circle(-17, -12, 4);
  circle(3, 27, 3);

  pop();
}

 // Updated: rain continues in both later sadness stages; no wind is drawn there.
function drawRain(time, heavy = true) {
  push();
  stroke('#77B9D1');
  strokeWeight(heavy ? 2 : 1.4);
  strokeCap(ROUND);
  const count = heavy ? 105 : 55;
  for (let i = 0; i < count; i++) {
    const x = (i * 97 + 37) % width;
    const y = (i * 53 + time * (heavy ? 310 : 220)) % (height + 28) - 14;
    line(x, y, x - (heavy ? 5 : 3), y + (heavy ? 14 : 10));
  }
  pop();
}

// A compact, storybook cave grows from the lawn in the lower-left corner, with its mouth facing right.
function drawCave(progress = 1) {
  push();
  const caveScale = min(width * 0.50 / 520, GROUND_Y * 0.70 / 360);
  translate(width * 0.025, GROUND_Y - 360 * caveScale);
  scale(caveScale);
  translate(520, 0);
  scale(-1, 1);
  drawingContext.save();
  drawingContext.globalAlpha = progress;
  drawingContext.filter = `blur(${(1 - progress) * 7}px)`;
  strokeJoin(ROUND);

  // Rounded rocky hill, open toward the right side after the horizontal flip.
  stroke('#17191c'); strokeWeight(5); fill('#858b8c');
  beginShape();
  vertex(24, 356); bezierVertex(20, 305, 32, 260, 37, 214);
  bezierVertex(40, 162, 69, 120, 119, 105);
  bezierVertex(164, 46, 248, 40, 303, 59);
  bezierVertex(384, 51, 456, 91, 481, 155);
  bezierVertex(507, 211, 497, 291, 510, 356);
  vertex(24, 356); endShape(CLOSE);

  // Faceted planes catch a little cool daylight across the rounded rock.
  noStroke(); fill('rgba(220, 226, 222, 0.22)');
  beginShape();
  vertex(135, 105); bezierVertex(169, 60, 227, 48, 270, 58);
  bezierVertex(240, 78, 214, 91, 183, 94); endShape(CLOSE);
  fill('rgba(57, 64, 68, 0.20)');
  beginShape();
  vertex(306, 75); bezierVertex(376, 61, 438, 98, 466, 146);
  bezierVertex(419, 125, 377, 117, 337, 124); endShape(CLOSE);
  fill('rgba(223, 226, 218, 0.15)');
  beginShape();
  vertex(39, 270); bezierVertex(78, 281, 121, 273, 151, 286);
  vertex(151, 303); bezierVertex(105, 292, 70, 303, 36, 293); endShape(CLOSE);

  // Layered stone bands make the rock read as a rounded cave mound.
  noFill(); stroke('#454b4e'); strokeWeight(4);
  bezier(47, 167, 132, 187, 193, 161, 260, 171);
  bezier(260, 171, 345, 181, 411, 150, 486, 177);
  bezier(34, 247, 115, 267, 193, 232, 247, 250);
  bezier(360, 247, 414, 232, 463, 255, 502, 239);
  bezier(27, 310, 105, 329, 168, 299, 223, 316);
  bezier(390, 317, 439, 302, 472, 323, 507, 309);

  // Fine pale seams and cool shadows give the stone more dimension.
  stroke('#b1b6b2'); strokeWeight(2.5);
  bezier(145, 82, 206, 58, 266, 69, 302, 87);
  bezier(325, 105, 376, 90, 418, 112, 443, 145);
  stroke('#60686a'); strokeWeight(3);
  bezier(74, 194, 92, 210, 77, 232, 63, 245);
  bezier(280, 189, 266, 210, 285, 224, 302, 231);
  bezier(436, 270, 421, 285, 438, 296, 451, 302);

  // Thick stone rim around the arched entrance.
  stroke('#272b2d'); strokeWeight(7); fill('#747c7e');
  beginShape();
  vertex(34, 355); vertex(34, 224);
  bezierVertex(34, 151, 72, 109, 128, 108);
  bezierVertex(188, 109, 222, 153, 222, 224);
  vertex(222, 355); endShape(CLOSE);
  noStroke(); fill('#25292c');
  beginShape();
  vertex(67, 355); vertex(67, 225);
  bezierVertex(67, 175, 88, 144, 128, 141);
  bezierVertex(166, 143, 188, 176, 188, 225);
  vertex(188, 355); endShape(CLOSE);
  // A soft amber glimmer gives the deep entrance a little warmth.
  noStroke(); fill('rgba(207, 132, 72, 0.20)'); ellipse(142, 257, 45, 105);
  fill('rgba(232, 171, 104, 0.16)'); ellipse(151, 279, 24, 62);
  // Narrow side highlight gives the entrance depth.
  noFill(); stroke('#9ba0a0'); strokeWeight(5);
  bezier(172, 159, 201, 205, 194, 280, 194, 340);

  // Layered teal and leaf-green bushes frame the cave without filling the scene background.
  noStroke();

  fill('#087c70'); ellipse(236, 316, 145, 86); ellipse(412, 302, 132, 100);
  fill('#168f7c'); ellipse(306, 291, 118, 84); ellipse(460, 339, 114, 86);
  fill('#558b16'); ellipse(267, 318, 106, 74); ellipse(402, 325, 104, 76);
  fill('#71a91e'); ellipse(343, 337, 98, 65);
  // Scalloped leaf crowns and a few bright leaf tips.
  fill('#0b8878');
  for (let i = 0; i < 7; i++) ellipse(205 + i * 18, 283 - (i % 2) * 9, 34, 34);
  for (let i = 0; i < 6; i++) ellipse(377 + i * 17, 279 - (i % 2) * 8, 32, 32);
  fill('#8dc62d');
  ellipse(238, 291, 16, 12); ellipse(335, 303, 14, 11); ellipse(421, 294, 15, 12);

  // Small stones and grass tufts sit directly on the existing lawn.
  stroke('#17191c'); strokeWeight(4); fill('#b4a089');
  beginShape(); vertex(194, 347); bezierVertex(205, 333, 230, 335, 246, 348);
  vertex(255, 356); vertex(188, 356); endShape(CLOSE);
  fill('#e9ad45');
  beginShape(); vertex(206, 346); bezierVertex(215, 331, 232, 334, 242, 349);
  vertex(206, 346); endShape(CLOSE);
  stroke('#91c832'); strokeWeight(7); strokeCap(ROUND);
  line(271, 350, 264, 326); line(278, 350, 286, 319); line(283, 350, 300, 331);
  line(451, 348, 446, 323); line(458, 348, 467, 316); line(464, 348, 481, 328);
  noStroke(); fill('#fa7769'); ellipse(495, 349, 34, 17);
  fill('#ffcf64'); ellipse(82, 349, 28, 15); ellipse(357, 352, 22, 12);

  drawingContext.restore();
  pop();
}