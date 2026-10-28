// User input and character/kite drawing.
// Story states are controlled by sketch.js:
// intro -> ready -> holding -> released -> walking -> arrival -> walking -> finished

let standingImage;
let surprisedImage;
let walkImage;
let walkImageReady = false;
let walk1Image;
let walk2Image;
let standingImageReady = false;
let surprisedImageReady = false;
let walkImagesReady = false;
let standingImageFailed = false;
let surprisedImageFailed = false;
let walkImageFailed = false;


function updateAndDrawVy(time, dt) {
  // Update walking movement.
  if (storyStage === 'walking') {
    characterX = min(width - 85, characterX + dt * 48);
  
    if (characterX >= width - 85) {
      // Stop in the standing pose and wait for the next click.
      storyStage = 'arrival';
      storyStage = 'finished';
      walkFinished = true;
      finishedAt = time;
    }
  }
  // Determine the character and kite states.
  
  const walking = storyStage === 'walking';
  const released = storyStage === 'released' || walking || storyStage === 'arrival' || storyStage === 'finished';
  const finishedElapsed = storyStage === 'finished' ? max(0, time - finishedAt) : 0;
  const kiteEscaped = storyStage === 'finished' && finishedElapsed >= 0.8;
  const kiteRise = arrivalAt > 0 ? min(120, max(0, time - arrivalAt) * 35) : 0;
  drawCharacterAndKite(characterX, GROUND_Y, time, {
    walking,
    released,
    surprised: storyStage === 'finished',
    kiteEscaped,
    escapeTime: kiteEscaped ? finishedElapsed - 0.8 : 0,
    kiteRise,
    fade: characterFade
  });

  if (storyStage === 'holding') drawCharacterHint('Let the kite take flight (click figure). ');
  if (storyStage === 'released') drawCharacterHint('One click, lets go fly a kite together!');
  if (storyStage === 'arrival') drawCharacterHint('Click character to continue story');
  if (storyStage === 'finished') drawCharacterHint('Windy~the kite floats higher');
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
  push();
  translate(width / 2, height / 2 - 10);
  stroke('#252525');
  strokeWeight(5);
  line(0, -30, 0, 24);
  line(0, 24, -15, 8);
  line(0, 24, 15, 8);
  noStroke();
  fill('#252525');
  textAlign(CENTER, TOP);
  textSize(17);
  text('Click anywhere', 0, 43);
  pop();
}

function drawStartPrompt() {
  noStroke();
  fill('#252525');
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(34);
  text('Move together to', width / 2, 205);
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
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(13);

  const isStoryHint = [
    'Let the kite take flight (click figure). ',
    'Click character to continue story',
    'One click, lets go fly a kite together!',
    'Windy~the kite floats higher'
  ].includes(label);
  

  if (isStoryHint) {
    fill('#ffffff');
    textStyle(BOLD);
  } else {
    fill('#252525');
    textStyle(NORMAL);
  }

  text(label, characterX, GROUND_Y + 70
  );
  textStyle(NORMAL);


  
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
    walkImage = loadImage(
    'walk.png',
    () => {
      walkImageReady = true;
    },
    () => {
      walkImageFailed = true;
      imageLoadFailed('walk.png');
    }
  );
}

function imageLoadFailed(filename) {
  console.warn(`Could not load ${filename}. Check that the filename and folder match exactly.`);
}

function drawCharacterAndKite(x, groundY, time, options = {}) {
  const {
    walking = false,
    released = false,
    surprised = false,
    kiteEscaped = false,
    escapeTime = 0,
    kiteRise = 0,
    fade = 1
  } = options;
  const bob = walking ? sin(time * 9) * 2 : 0;
  const characterY = groundY - 48 + bob;
  const handX = x + 19;
  const handY = groundY - 74 + bob;
  
  // The kite drifts beside Vy after release, but its string stays in her hand
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
  if (surprised && surprisedImageReady && !surprisedImageFailed) {
    imageToDraw = surprisedImage;
  } else if (walking && walkImageReady && !walkImageFailed) {
    imageToDraw = walkImage;
  } else if (standingImageReady && !standingImageFailed) {
    imageToDraw = standingImage;
  }

  push();
  // Change this value to recolour the character image.
  const characterTint = color('rgb(83, 245, 110)');
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
  } else {
    drawFallbackCharacter(x, characterY, fade);
  }
  pop();

  // The released kite remains tethered through the "walk together" prompt.
  // In the finished scene the string is gone and the kite flies out of view.
  if (!kiteEscaped || kiteY > -100) {
    drawKite(kiteX, kiteY, time, handX, handY, !kiteEscaped, released ? 1.5 : 1);
  }
}

function drawKite(x, y, time, handX, handY, tethered, kiteScale = 1) {
  const sway = sin(time * 2.2) * (tethered ? 4 : 7);
  const kx = x + sway;
  const ky = y;
  stroke('#292b35');
  strokeWeight(1.5);
  noFill();
  if (tethered) {
    bezier(handX, handY, handX + 20, handY - 45, kx - 15 * kiteScale, ky + 55 * kiteScale, kx, ky + 18 * kiteScale);
  } else {
    bezier(kx, ky + 18, kx - 15, ky + 53, x + 9, y + 47, x - 1, y + 91);
  }

  push();
  translate(kx, ky);
  scale(kiteScale);
  rotate(PI / 4);
  noStroke();
  fill('#ed5364');
  quad(0, -20, 15, 0, 0, 20, -15, 0);
  stroke('#fff7e7');
  strokeWeight(1.5);
  line(0, -20, 0, 20);
  line(-15, 0, 15, 0);
  noStroke();
  fill('#f5c84b');
  triangle(-7, 27, 7, 27, 0, 37);
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

