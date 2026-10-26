// Zicen's audio-driven mechanic.
// The shared scene can read audioData.intensity, audioData.bass and
// audioData.treble to animate its existing figures and environment.

let audioMechanic;
let audioData = { intensity: 0, bass: 0, treble: 0 };
let audioButton;
let audioStatus;

function setupAudio() {
  audioMechanic = new AudioMechanic();

  audioButton = createButton('Enable microphone');
  audioButton.mousePressed(enableAudioInput);

  audioStatus = createP('Audio is off');
  audioStatus.style('font-family', 'Trebuchet MS, sans-serif');
  audioStatus.style('font-size', '13px');
  audioStatus.style('margin', '4px 0');
}

function enableAudioInput() {
  if (audioMechanic.started) return;

  audioStatus.html('Waiting for microphone permission...');
  audioMechanic.startAudio(
    () => {
      audioButton.html('Microphone active');
      audioButton.attribute('disabled', '');
      audioStatus.html('Speak, clap, or play music to move the scene.');
    },
    () => {
      audioStatus.html('Microphone unavailable.');
    }
  );
}

function updateAudio() {
  audioData = audioMechanic
    ? audioMechanic.getSoundData()
    : { intensity: 0, bass: 0, treble: 0 };
}

function drawAudio() {
  if (!audioMechanic || !audioMechanic.started) return;

  push();
  noFill();
  stroke(255, 212, 71, 80 + audioData.treble * 175);
  strokeWeight(3);
  circle(
    width / 2,
    height / 2,
    60 + audioData.intensity * 130 + audioData.bass * 45
  );
  pop();
}

function resetAudio() {
  if (audioMechanic) audioMechanic.stopAudio();
  audioData = { intensity: 0, bass: 0, treble: 0 };

  if (audioButton) {
    audioButton.removeAttribute('disabled');
    audioButton.html('Enable microphone');
  }
  if (audioStatus) audioStatus.html('Audio is off');
}
