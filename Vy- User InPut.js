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
let sadRainStartedAt = 0;
let pointingForwardImage;
let pointingForwardImageReady = false;
let rainDropsPromptVisible = false;
let wetImage;
let wetImageReady = false;
let wetStartedAt = 0;
let pinkDotStartedAt = null;
let character2PinkImage;
let character2PinkImageReady = false;
let character2PinkRevealStartedAt = null;
let character2PointingImage;
let character2PointingImageReady = false;
let character2Pointing = false;
let character2Walk1Image;
let character2Walk2Image;
let character2Walk1Ready = false;
let character2Walk2Ready = false;

let character2Walking = false;
let character2X = 0;
let character2WalkStartedAt = 0;
let character2WalkStartX = 0;
let character2WalkTargetX = 0;
let character2GiveImage;
let character2GiveImageReady = false;
let character2Giving = false;


const rainDropCount = 5;
let rainDrops = Array.from({ length: rainDropCount }, () => ({
  clicked: false,
  clickedAt: 0
}));


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
  const windyCaptionVisible = storyStage === 'finished';
  const sadnessElapsed = sadnessStartedAt > 0
  ? time - sadnessStartedAt
  : 0;

  if (windStartsNearEnd || windyCaptionVisible) {
    drawWind(time, windyCaptionVisible);
  }

// Include soSad in the rain states and force heavy rain.
// keep the heavy rain running after the character points toward the cave.
if (
  ['lostKite', 'rainStorm', 'soSad', 'rainFace', 'caveEntered', 'wet', 'pinkReveal']
    .includes(storyStage) &&
  sadnessElapsed >= 1.5
) {
  drawRain(time, storyStage !== 'lostKite');
}
  if ([
  'holding', 'released', 'walking', 'arrival', 'finished',
  'lostKite', 'rainStorm', 'soSad', 'rainFace', 'caveEntered', 'wet'
].includes(storyStage)) {
  drawCharacterGlow(characterX, GROUND_Y, time, characterFade, storyStage);
}

  // [EDITED] Magical glow makes the character stand out as clickable.
  if (['holding', 'released', 'walking', 'arrival', 'finished', 'lostKite', 'rainStorm', 'soSad', 'rainFace', 'caveEntered'].includes(storyStage)) {
   drawCharacterGlow(characterX, GROUND_Y, time, characterFade, storyStage);
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

    // Hide the kite while the character points forward toward the cave.
    hideKite: storyStage === 'soSad' || storyStage === 'caveEntered' || storyStage === 'wet' || storyStage === 'pinkReveal',
    kiteEscaped,
    escapeTime: kiteEscaped ? finishedElapsed - 0.8 : 0,
    kiteRise,
    fade: characterFade,
    pointingForward: storyStage === 'caveEntered',
    wet: storyStage === 'wet' || storyStage === 'pinkReveal'
  });
  
  if (storyStage === 'holding') drawCharacterHint('Let the kite take flight (click figure). ');
  if (storyStage === 'released') drawCharacterHint("One click, Let's take this kite up to the sky!");
  if (storyStage === 'arrival') drawCharacterHint('Click character to continue flying kites');
  if (storyStage === 'finished') drawCharacterHint('Windy~the kite floats higher');
  if (storyStage === 'lostKite') drawCharacterHint('Oh no! My kite is gone!');
  // [EDITED] The rain is getting heavier...
  if (storyStage === 'rainStorm') drawCharacterHint('The rain is getting heavier...');
  // [EDITED] So sad.png keeps the “Still raining...” caption.
   if (storyStage === 'soSad') drawCharacterHint('Still raining...');
  // [EDITED] The next click advances to the sad-rain face.
  // Keep the "sad-rain" image and the prompt on the screen until the next click.
  if (storyStage === 'rainFace') {
  const allRainDropsClicked = rainDrops.every(drop => drop.clicked);
  

  drawCharacterHint(
    allRainDropsClicked
      ? 'Now, click on the figure to see how the story unfolds!'
      : rainDropsPromptVisible
        ? 'Click each blue circle to discover what the rain brings'
        : 'Slowly reaching out a hand to catch the raindrops'
  );

  drawRainDropsAndPuddles(time);
}
  // Lightning begins when a current flow emerges。“Slowly reaching out...”
  if (storyStage === 'rainFace') {
  drawLightning(time);
}

  if (storyStage === 'caveEntered') {
    drawCharacterHint('Click to gather everyone around the light');
  }
if (storyStage === 'wet' && pinkDotStartedAt === null) {
  pinkDotStartedAt = time;
}

if (storyStage === 'wet' || storyStage === 'pinkReveal') {
  drawRainDropsAndPuddles(time);
}
if (storyStage === 'wet') {
  drawPinkSparkleDot(time);

  if (time - pinkDotStartedAt < 5) {
    drawCharacterHint('... hoping the rain stops soon so I can go home ...');
  } else {
    drawCharacterHint(
      'Look to the left and click the pink dot (a hint for what happens next)'
    );
    if (character2Giving && character2GiveImageReady) {
  drawCharacterHint(
    'Character 2 wants to give the umbrella to Character 1.'
  );
} else if (character2Pointing && character2PointingImageReady) {
  }
}
}

if (storyStage === 'pinkReveal') {
  drawPinkCharacterReveal();

  if (character2Giving && character2GiveImageReady) {
    drawCharacterHint(
      'Character 2 wants to give the umbrella to Character 1.'
    );
  } else if (character2WalkStartedAt > 0 && !character2Walking) {
    drawCharacterHint(
      'Character 2 is near Character 1 (click the pink figure to continue)'
    );
  } else if (character2Pointing && character2PointingImageReady) {
    drawCharacterHint(
      'Who is sitting over there in the rain? (click on the green character)'
    );
  } else {
    drawCharacterHint(
      'Another person appeared, holding a white umbrella...(CLICK Pink Figure)'
    );
  }
}

if (character2Walking) {
  const duration = 2.5;
  const progress = constrain(
    (time - character2WalkStartedAt) / duration,
    0,
    1
  );

  character2X = lerp(
    character2WalkStartX,
    character2WalkTargetX,
    progress
  );

  if (progress >= 1) {
  character2X = character2WalkTargetX;
  character2Walking = false;
  character2Pointing = false;
}

}
   // Removed the duplicate drawKite() call here.
  // kiteX, kiteY, handX, and handY exist only inside drawCharacterAndKite(),
  // which already draws the kite; calling them here caused a ReferenceError.
}





function mousePressed() {
  // Zicen's finale handles the cave and campfire clicks without adding more
  // audio-specific conditions to the user-input story controller.
  if (handleAudioSceneClick()) return false;

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
  // Click on the character during heavy rain to trigger a "so sad" scene.
} else if (storyStage === 'rainStorm' && clickOnCharacter()) {
  storyStage = 'soSad';

// Click on the character in the "So sad" scene to enter "rainFace."
} else if (storyStage === 'soSad' && clickOnCharacter()) {
  storyStage = 'rainFace';
  sadRainStartedAt = millis() / 1000;
  character2X = max(40, width * 0.08);
  character2Walking = false;
  rainDropsPromptVisible = false;
  rainDrops = Array.from({ length: rainDropCount }, () => ({
    clicked: false,
    clickedAt: 0
  }));

// Click on the character in the "rainFace" scene to interact with rain drops.
} else if (storyStage === 'rainFace') {
  if (!rainDropsPromptVisible) {
    rainDropsPromptVisible = true;
  } else if (clickRainDot()) {
    return false;
  } else if (rainDrops.every(drop => drop.clicked) && clickOnCharacter()) {
    storyStage = 'wet';
    wetStartedAt = millis() / 1000;
}
} else if (storyStage === 'wet') {
  const dotX = max(40, width * 0.08);
  const dotY = GROUND_Y - 120;

  // Only allow clicking once the annotation changes to “Look to the left...”
  const canClickPinkDot =
    pinkDotStartedAt !== null &&
    millis() / 1000 - pinkDotStartedAt >= 5;

  if (
    canClickPinkDot &&
    dist(mouseX, mouseY, dotX, dotY) < 40
  ) {
    storyStage = 'pinkReveal';
    character2PinkRevealStartedAt = millis() / 1000;
  }
} else if (storyStage === 'pinkReveal' && character2Giving) {
  // Giữ cảnh give sau khi ảnh đã xuất hiện.
} else if (
  storyStage === 'pinkReveal' &&
  character2WalkStartedAt > 0 &&
  !character2Walking &&
  clickOnCharacter2()
) {
  character2Giving = true;
} else if (
  storyStage === 'pinkReveal' &&
  character2Pointing &&
  clickOnCharacter()
) {
  character2Walking = true;
  character2WalkStartedAt = millis() / 1000;
  character2WalkStartX = character2X;
  character2WalkTargetX = characterX - 120;
} else if (storyStage === 'pinkReveal' && clickOnCharacter2()) {
  character2Pointing = true;
}
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
function clickOnCharacter2() {
  const characterHeight = 270;
  const characterWidth = character2PinkImageReady
    ? characterHeight * character2PinkImage.width / character2PinkImage.height
    : characterHeight;

  const characterX = character2X;
  const characterY = GROUND_Y - characterHeight / 2 + 30;

  return abs(mouseX - characterX) < characterWidth / 2 &&
    abs(mouseY - characterY) < characterHeight / 2;
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
   pointingForwardImage = loadImage('Pointing forward.png', () => { pointingForwardImageReady = true; }, () => imageLoadFailed('Pointing forward.png'));
   wetImage = loadImage('wet.png', () => { wetImageReady = true; }, () => imageLoadFailed('wet.png'));
  character2PinkImage = loadImage('character 2 pink.png', () => { character2PinkImageReady = true; }, () => imageLoadFailed('character 2 pink.png'));
  character2PointingImage = loadImage('hand pointed forward_C2.png', () => { character2PointingImageReady = true; }, () => imageLoadFailed('hand pointed forward_C2.png'));
  character2Walk1Image = loadImage('walk1 (character 2).png', () => { character2Walk1Ready = true; }, () => imageLoadFailed('walk1 (character 2).png'));
  character2Walk2Image = loadImage('walk2 (character 2).png', () => { character2Walk2Ready = true; }, () => imageLoadFailed('walk2 (character 2).png'));
  character2GiveImage = loadImage('character 2 give.png', () => { character2GiveImageReady = true; }, () => imageLoadFailed('character 2 give.png'));
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
  if (options.wet && wetImageReady) {
  imageToDraw = wetImage;
  } else if (options.pointingForward && pointingForwardImageReady) {
  imageToDraw = pointingForwardImage;
  } else if (options.soSad && soSadImageReady) {
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
  const imageHeight = imageToDraw === wetImage ? 195 : 220;
  const imageWidth = imageHeight * imageToDraw.width / imageToDraw.height;
  const wetOffset = imageToDraw === wetImage ? -25 : 0;

  image(imageToDraw,
    x,
    groundY - imageHeight / 2 + bob + 12 - wetOffset,
    imageWidth,
    imageHeight
  );
    //  Updated: fade sad-rain face in over stand-sadness during the third beat.
    if (sadRain && sadRainImageReady) {
      tint(255, 255 * sadRainProgress);
      const rainFaceWidth = imageHeight * sadRainImage.width / sadRainImage.height;
      image(sadRainImage, x, groundY - imageHeight / 2 + bob + 12, rainFaceWidth, imageHeight);
    
  }
  pop();
  // The released kite remains tethered through the "walk together" prompt.
  // In the finished scene the string is gone and the kite flies out of view.
  // Hide it for So sad; otherwise keep the escape animation.
  if (!hideKite && (!kiteEscaped || kiteY > -100)) {
    drawKite(kiteX, kiteY, time, handX, handY, !kiteEscaped, released ? 1.5 : 1);
  }
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

function drawWind(time, stronger = false) {
  push();
  noFill();
  strokeCap(ROUND);
  strokeJoin(ROUND);
  

  const flows = stronger ? 9 : 5;
  const windAreaTop = 85;
  const windAreaBottom = GROUND_Y - 55;
  const spacing = (windAreaBottom - windAreaTop) / (flows - 1);

  for (let i = 0; i < flows; i++) {
    const y = windAreaTop + i * spacing;
    const speed = (55 + (i % 3) * 18) * (stronger ? 1.65 : 1);
    const travel = (time * speed + i * 173) % (width + 100);
    const x = travel - 50;
    const size = (0.55 + (i % 2) * 0.12) * (stronger ? 1.3 : 1);
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

function clickOnCave() {
  const caveScale = min(width * 0.44 / 520, GROUND_Y * 0.70 / 360);

  return mouseX >= 0 &&
    mouseX <= 520 * caveScale &&
    mouseY >= GROUND_Y - 360 * caveScale &&
    mouseY <= GROUND_Y;
}

function drawLightning(time) {
// A flash of lightning appears briefly every few seconds
  const cycle = time % 4.5;
  if (cycle > 0.18) return;

  push();
  const flash = map(cycle, 0, 0.18, 180, 0);
  stroke(255, 255, 210, flash);
  strokeWeight(5);
  line(width * 0.72, 0, width * 0.68, height * 0.2);
  line(width * 0.68, height * 0.2, width * 0.73, height * 0.2);
  line(width * 0.73, height * 0.2, width * 0.65, height * 0.42);
  pop();
}


function drawCharacterGlow(x, y, time, fade = 1, stage = '') {

  const purpleGlow = [
    'lostKite', 'rainStorm', 'soSad', 'rainFace'
  ].includes(stage);

  const isWet = stage === 'wet';

  const outerColor = isWet ? color(65, 65, 65)
    : purpleGlow ? color(155, 95, 255) : color(255, 180, 45);

  const innerColor = isWet ? color(95, 95, 95)
    : purpleGlow ? color(205, 155, 255) : color(255, 225, 105);

  const sparkleColor = isWet ? color(145, 145, 145)
    : purpleGlow ? color(235, 210, 255) : color(255, 245, 185);

  push();

  // Lower the light intensity only while in the 'wet' state.
  translate(x, isWet ? y - 55 : y - 100);
  noStroke();

  if (isWet) {
    outerColor.setAlpha(65 * fade);
    fill(outerColor);
    ellipse(0, 0, 150, 190);

    innerColor.setAlpha(80 * fade);
    fill(innerColor);
    ellipse(0, 0, 112, 150);
  } else {
    const pulse = (sin(time * 2.8) + 1) / 2;

    outerColor.setAlpha((45 + pulse * 35) * fade);
    fill(outerColor);
    ellipse(0, 0, 145 + pulse * 18, 235 + pulse * 18);

    innerColor.setAlpha((55 + pulse * 45) * fade);
    fill(innerColor);
    ellipse(0, 0, 100 + pulse * 12, 195 + pulse * 12);
  }

  // Keep the highlights static; in the wet areas, place them around the highlights that have been toned down.
  for (let i = 0; i < 8; i++) {
    const angle = TWO_PI * i / 8;
    const radius = isWet ? 70 : 72;
    const sx = cos(angle) * radius;
    const sy = sin(angle) * radius * (isWet ? 1 : 1.25);

    sparkleColor.setAlpha((isWet ? 210 : 180) * fade);
    fill(sparkleColor);
    circle(sx, sy, 6);
  }

  pop();
}

function getRainPuddlePositions() {
  return [
    { x: width * 0.08, y: GROUND_Y - 10 },
    { x: width * 0.18, y: GROUND_Y - 10 },
    { x: width * 0.42, y: GROUND_Y - 10 },
    { x: width * 0.58, y: GROUND_Y - 10 },
    { x: width * 0.82, y: GROUND_Y - 10 }
  ];
}

function clickRainDot() {
  const positions = getRainPuddlePositions();

  for (let i = 0; i < rainDropCount; i++) {
    const { x, y } = positions[i];

    if (!rainDrops[i].clicked && dist(mouseX, mouseY, x, y) < 22) {
      rainDrops[i].clicked = true;
      rainDrops[i].clickedAt = millis() / 1000;
      return true;
    }
  }

  return false;
}

function drawRainDropsAndPuddles(time) {
  const positions = getRainPuddlePositions();

  push();

  for (let i = 0; i < rainDropCount; i++) {
    const { x, y } = positions[i];
    const puddleY = y + 5;
    const drop = rainDrops[i];

    noStroke();

    if (drop.clicked) {
      const growth = constrain((time - drop.clickedAt) / 1.1, 0, 1);
      const easedGrowth = 1 - pow(1 - growth, 3);
      const ripple = sin(time * 5 + i) * 1.5;
      

      // Dark green shadow and border
      fill(30, 111, 150, 55);
      ellipse(x, puddleY + 2, 24 + easedGrowth * 62, 9 + easedGrowth * 18);

      // Surface of the water
      fill(52, 164, 202, 155);
      ellipse(x, puddleY, 18 + easedGrowth * 58, 7 + easedGrowth * 15);

      // Bright edge
      noFill();
      stroke(191, 244, 255, 190);
      strokeWeight(2);
      arc(
        x, puddleY - 1,
        18 + easedGrowth * 52,
        7 + easedGrowth * 12,
        PI + 0.15, TWO_PI - 0.15
      );

      // Ripples the moment a puddle appears
      if (growth < 0.85) {
        stroke(218, 250, 255, 150 * (1 - growth));
        strokeWeight(1.5);
        ellipse(
          x, puddleY,
          24 + growth * 72 + ripple,
          10 + growth * 20
        );
      }

      // Reflected highlight
      noStroke();
      fill(230, 252, 255, 210);
      ellipse(x - 12 - easedGrowth * 5, puddleY - 2, 8, 2.5);
      ellipse(x + 10, puddleY + 1, 4, 2);
    } else {
      // A green dot for users to click on
      fill('#43B7DE');
      circle(x, y, 18);

      fill('#DDF8FF');
      circle(x - 3, y - 3, 5);
    }
    }
   pop();
  }

function drawPinkSparkleDot() {
  const x = max(40, width * 0.08);
  const y = GROUND_Y - 120;

  push();
  noStroke();

  fill(255, 105, 190, 55);
  circle(x, y, 70); 
  // Quầng sáng

  fill('#ea0088');
  circle(x, y, 26); 
  // Chấm hồng

  fill('#fff4fb');
  circle(x - 5, y - 5, 7); 
  // Điểm phản sáng

  stroke('#ffd5ef');
  strokeWeight(3);
  strokeCap(ROUND);

  const ray = 24;
  line(x - ray, y, x - ray + 7, y);
  line(x + ray - 7, y, x + ray, y);
  line(x, y - ray, x, y - ray + 7);
  line(x, y + ray - 7, x, y + ray);

  pop();
}

function drawPinkCharacterReveal(appear) {
  if (!character2PinkImageReady) return;
  let imageToDraw = character2PinkImage;

  if (character2Walking && character2Walk1Ready && character2Walk2Ready) {
  imageToDraw = floor(millis() / 180) % 2 === 0
    ? character2Walk1Image
    : character2Walk2Image;
 } else if (character2Pointing && character2PointingImageReady) {
  imageToDraw = character2PointingImage;
}
if (character2Giving && character2GiveImageReady) {
  imageToDraw = character2GiveImage;
}


  const alpha = 255;

  push();
  imageMode(CENTER);
  tint(255, alpha);

  const imageHeight = 270;
  const imageWidth =
  imageHeight * imageToDraw.width / imageToDraw.height;

  const characterX = max(40, width * 0.08);
  const characterY = GROUND_Y - imageHeight / 2 + 30;

// Use the same coordinates for the character and the tile.
// When moving, follow character2X; when not moving, remain at the initial position.
  const drawX = character2X;

// Draw the box just once, so that it no longer remains at the left edge.
 const umbrellaX = character2Giving
  ? drawX + imageWidth * 0.32
  : drawX - imageWidth * 0.18;

drawCharacter2Umbrella(
  umbrellaX,
  characterY - imageHeight * 0.43
);

// Draw the character at the same horizontal position as the cell.
image(
  imageToDraw,
  drawX,
  characterY,
  imageWidth,
  imageHeight
);

  function drawCharacter2Umbrella(x, y) {
  push();
  translate(x, y);
  scale(1.65);
// A white umbrella canopy, divided into segments as simple as those of a kite.
 noStroke();
 fill('#f7e5d2');
 beginShape();
 vertex(-78, 0);
 bezierVertex(-66, -42, -36, -62, 0, -62);
 bezierVertex(36, -62, 66, -42, 78, 0);
 bezierVertex(65, 10, 52, 10, 39, 0);
 bezierVertex(26, 10, 13, 10, 0, 0);
 bezierVertex(-13, 10, -26, 10, -39, 0);
 bezierVertex(-52, 10, -65, 10, -78, 0);
 endShape(CLOSE);

 // Outer border with a soft color.
 noFill();
 stroke('#b83d78');
 strokeWeight(2);
 strokeCap(ROUND);
 bezier(-78, 0, -66, -42, -36, -62, 0, -62);
 bezier(0, -62, 36, -62, 66, -42, 78, 0);
 bezier(-78, 0, -65, 10, -52, 10, -39, 0);
 bezier(-39, 0, -26, 10, -13, 10, 0, 0);
 bezier(0, 0, 13, 10, 26, 10, 39, 0);
 bezier(39, 0, 52, 10, 65, 10, 78, 0);

 // Radiating from the center, much like the struts of a kite.
 stroke('#b83d78');
 strokeWeight(1.5);
 line(0, -59, -39, 0);
 line(0, -59, 0, 0);
 line(0, -59, 39, 0);

 // White umbrella tip.
 noStroke();
 fill('#fffaf5');
 circle(0, -60, 7);

 // Cream-coloured umbrella tip.
 fill('#fff8ed');
 circle(0, -60, 7);

  // The bottom edge of the umbrella canopy.
  noFill();
  stroke('#b83d78');
  strokeWeight(2.5);
  strokeCap(ROUND);
  bezier(-78, 0, -65, 10, -52, 10, -39, 0);
  bezier(-39, 0, -26, 10, -13, 10, 0, 0);
  bezier(0, 0, 13, 10, 26, 10, 39, 0);
  bezier(39, 0, 52, 10, 65, 10, 78, 0);

  // Umbrella ribs extend from the top toward the edge.
  stroke('#b00046');
  strokeWeight(1.5);
  line(0, -58, -39, 0);
  line(0, -58, 0, 0);
  line(0, -58, 39, 0);

  // Umbrella handle and grip.
  stroke('#6f0a45');
  strokeWeight(5);
  line(0, -1, 0, 77);

 

  // The small tip at the top of the umbrella.
  noStroke();
  fill('#ffe6f0');
  circle(0, -60, 7);

  pop();
}
}
