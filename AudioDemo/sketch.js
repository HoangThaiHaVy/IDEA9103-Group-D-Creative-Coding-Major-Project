// Audio mechanic pilot demo.
// The main sketch combines the AudioMechanic and Dancer modules.
// Mouse movement provides a fallback test before microphone access is enabled.

let audioMechanic;
let dancerImages = [];
let dancers = [];
let audioButton;
let statusText;

function preload() {
  dancerImages = [
    loadImage("assets/dancer-red.png"),
    loadImage("assets/dancer-yellow.png"),
    loadImage("assets/dancer-green.png"),
    loadImage("assets/dancer-blue.png"),
    loadImage("assets/dancer-pink.png")
  ];
}

function setup() {
  createCanvas(min(windowWidth, 1000), min(windowHeight, 700));
  imageMode(CENTER);
  angleMode(RADIANS);

  audioMechanic = new AudioMechanic();

  audioButton = createButton("Enable microphone");
  audioButton.parent("app");
  audioButton.mousePressed(enableMicrophone);
  audioButton.addClass("audio-button");

  statusText = createP("Mouse fallback is active");
  statusText.parent("app");
  statusText.addClass("audio-status");

  for (let i = 0; i < dancerImages.length; i += 1) {
    dancers.push(
      new Dancer(
        dancerImages[i],
        TWO_PI * i / dancerImages.length
      )
    );
  }
}

function draw() {
  background("#fff9e8");

  const sound = getCurrentSoundData();
  drawLight(sound.intensity, sound.treble);
  drawDancers(sound.intensity, sound.bass, sound.treble);
  drawCentralStar(sound.intensity);
  drawInstructions(sound.intensity);
}

function getCurrentSoundData() {
  if (audioMechanic.started) return audioMechanic.getSoundData();

  // Mouse fallback: move left and right to test the choreography.
  const intensity = constrain(map(mouseX, 0, width, 0, 1), 0, 1);
  return {
    intensity,
    bass: intensity * 0.7,
    treble: intensity * 0.4
  };
}

function enableMicrophone() {
  if (audioMechanic.started) return;

  statusText.html("Waiting for microphone permission...");
  audioMechanic.startAudio(
    () => {
      audioButton.hide();
      statusText.html("Microphone active");
    },
    () => {
      statusText.html("Microphone unavailable. Mouse fallback is active.");
    }
  );
}

function drawDancers(intensity, bass, treble) {
  const centreX = width / 2;
  const centreY = height / 2;
  const circleRadius = min(width, height) * 0.24;
  const imageSize = min(width, height) * 0.22;

  for (const dancer of dancers) {
    dancer.updateAndDraw(
      intensity,
      bass,
      treble,
      centreX,
      centreY,
      circleRadius,
      imageSize
    );
  }
}

function drawLight(intensity, treble) {
  push();
  noStroke();
  drawingContext.shadowBlur = 25 + treble * 70;
  drawingContext.shadowColor = "#ffd447";
  fill(255, 210, 60, 22 + intensity * 55);
  circle(width / 2, height / 2, 260 + intensity * 240);
  drawingContext.shadowBlur = 0;
  pop();
}

function drawCentralStar(intensity) {
  push();
  translate(width / 2, height / 2);
  fill("#ffd447");
  stroke("#111111");
  strokeWeight(3);
  drawStar(0, 0, 10 + intensity * 16, 22 + intensity * 42, 5);
  pop();
}

function drawStar(x, y, innerRadius, outerRadius, points) {
  beginShape();
  for (let i = 0; i < points * 2; i += 1) {
    const angle = -HALF_PI + i * PI / points;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    vertex(x + cos(angle) * radius, y + sin(angle) * radius);
  }
  endShape(CLOSE);
}

function drawInstructions(intensity) {
  noStroke();
  fill("#222222");
  textAlign(CENTER);
  textSize(15);
  const message = audioMechanic.started
    ? "Microphone active: speak, clap, or play music"
    : audioMechanic.error
      ? "Microphone unavailable: use the mouse fallback"
      : "Move the mouse to test, then click to enable the microphone";
  text(message, width / 2, height - 24);
  textSize(12);
  text(`movement intensity: ${intensity.toFixed(2)}`, width / 2, height - 8);
}

function windowResized() {
  resizeCanvas(min(windowWidth, 1000), min(windowHeight, 700));
}
