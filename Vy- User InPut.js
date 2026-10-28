// User input and character/kite drawing.
// Story states are controlled by sketch.js:
// intro -> ready -> holding -> released -> walking -> finished

let standingImage;
let surprisedImage;
let walk1Image;
let walk2Image;
let standingImageReady = false;
let surprisedImageReady = false;
let walkImagesReady = false;
let standingImageFailed = false;
let surprisedImageFailed = false;
let walkImageFailed = false;

function mousePressed() {
  if (storyStage === 'intro') {
    storyStage = 'ready';
  } else if (storyStage === 'ready') {
    const overStart = abs(mouseX - width / 2) < 85 && abs(mouseY - 275) < 35;
    if (overStart) {
      storyStage = 'fadeIn';
      characterX = 105;
      characterFade = 0;
      walkFinished = false;
    }
  } else if (storyStage === 'holding' && clickOnCharacter()) {
    storyStage = 'released';
  } else if (storyStage === 'released' && clickOnCharacter()) {
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


