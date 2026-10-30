// Zicen's audio-driven mechanic for the shared scene.
// Developed with assistance from OpenAI Codex. The assistance was used to
// connect p5.sound microphone analysis to the independently drawn sun and
// cloud assets. Zicen selected the mapping and visual behaviour.

let audioMechanic;
let audioData = { intensity: 0, bass: 0, treble: 0 };
let audioButton;
let audioStatus;
let audioSunImage;
let audioCloudImage;
let audioSunReady = false;
let audioCloudReady = false;
let audioCloudOffset = 0;

function preloadAudioAssets() {
  audioSunImage = loadImage(
    'assets/audio/sun-red.png',
    () => { audioSunReady = true; },
    () => { audioSunReady = false; }
  );
  audioCloudImage = loadImage(
    'assets/audio/cloud-cream.png',
    () => { audioCloudReady = true; },
    () => { audioCloudReady = false; }
  );
}

function setupAudio() {
  audioMechanic = new AudioMechanic();

  audioButton = createButton('Enable microphone');
  audioButton.parent(document.querySelector('main'));
  audioButton.mousePressed(enableAudioInput);

  audioStatus = createP('Audio is off');
  audioStatus.parent(document.querySelector('main'));
  audioStatus.style('font-family', 'Arial, sans-serif');
  audioStatus.style('font-size', '13px');
  audioStatus.style('margin', '4px 0 0');
}

function enableAudioInput() {
  if (audioMechanic.started) return;

  audioStatus.html('Waiting for microphone permission...');
  audioMechanic.startAudio(
    () => {
      audioButton.html('Microphone active');
      audioButton.attribute('disabled', '');
      audioStatus.html('Speak, clap, or play music to move the sky.');
    },
    () => {
      audioStatus.html('Microphone unavailable. Check browser permission.');
    }
  );
}

function updateAudio() {
  audioData = audioMechanic
    ? audioMechanic.getSoundData()
    : { intensity: 0, bass: 0, treble: 0 };

  const seconds = min(deltaTime, 50) / 1000;
  const cloudSpeed = 10 + audioData.intensity * 65 + audioData.treble * 45;
  audioCloudOffset = (audioCloudOffset + cloudSpeed * seconds) % (width + 220);
}

function drawAudioSky(time) {
  const sunPulse = 1 + audioData.intensity * 0.28 + audioData.bass * 0.14;
  const sunSize = 86 * sunPulse;
  const sunY = 78 - audioData.bass * 10;

  push();
  imageMode(CENTER);
  if (audioSunReady) {
    image(audioSunImage, 98, sunY, sunSize, sunSize);
  } else {
    drawSun(98, sunY, sunSize / 2);
  }

  const driftRange = width + 220;
  const cloudX = ((255 + audioCloudOffset) % driftRange) - 110;
  const secondCloudX = ((610 + audioCloudOffset * 0.72) % driftRange) - 110;
  const cloudBob = sin(time * 1.3) * (2 + audioData.treble * 8);

  if (audioCloudReady) {
    image(audioCloudImage, cloudX, 91 + cloudBob, 164, 82);
    image(audioCloudImage, secondCloudX, 132 - cloudBob * 0.5, 126, 63);
  } else {
    drawCloud(cloudX, 91 + cloudBob, 1);
    drawCloud(secondCloudX, 132 - cloudBob * 0.5, 0.78);
  }
  pop();
}

function drawAudio() {
  if (!audioMechanic || !audioMechanic.started) return;

  // A compact level meter makes the sound response legible without covering
  // the story. Bass raises the bars; treble changes their colour intensity.
  push();
  noStroke();
  const meterX = width - 68;
  const meterBottom = height - 18;
  for (let i = 0; i < 4; i += 1) {
    const barHeight = 5 + audioData.intensity * (10 + i * 7) + audioData.bass * 8;
    fill(220 + audioData.treble * 35, 48, 45, 190);
    rect(meterX + i * 11, meterBottom - barHeight, 7, barHeight, 3);
  }
  pop();
}

function resetAudio() {
  if (audioMechanic) audioMechanic.stopAudio();
  audioData = { intensity: 0, bass: 0, treble: 0 };
  audioCloudOffset = 0;

  if (audioButton) {
    audioButton.removeAttribute('disabled');
    audioButton.html('Enable microphone');
  }
  if (audioStatus) audioStatus.html('Audio is off');
}
