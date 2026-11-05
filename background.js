// SHARED DAYTIME SKY — Emery / Xinran Xu
// AI acknowledgement: the cloud-motion helpers below were generated and revised
// with the help of OpenAI Codex. They calculate automatic drift from elapsed
// seconds, wrap clouds at the canvas edges and draw the shared daytime sky.
// The cloud PNG reuses the team's existing AI-assisted image. Sun assets and
// sound-response data come from Zicen's audio module; this file does not change
// that mapping. Clouds do not depend on microphone input.
let sharedCloudImage;
let sharedCloudReady = false;
const SHARED_CLOUDS = [
  { startX: 230, y: 88, width: 164, height: 82, speed: 11 },
  { startX: 620, y: 132, width: 126, height: 63, speed: 7 }
];
// Reuse the team's AI-assisted cream-cloud PNG; ready flags select the image
// or the existing simple cloud drawing. The image source is credited in README.
function preloadBackgroundAssets() {
  sharedCloudImage = loadImage('assets/time-based/cloud-cream.png',
    () => { sharedCloudReady = true; },
    () => { sharedCloudReady = false; });
}
// AI-assisted automatic drift: x = starting position + seconds * speed.
// % wraps the centre across a range wider than the canvas, so a cloud fully
// exits before re-entering. sin() adds only a 1.5-pixel vertical drift.
// Neither speed nor position reads microphone data.
// Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
function sharedCloudPose(cloud, time, index = 0) {
  const half = cloud.width / 2;
  return {
    x: ((cloud.startX + time * cloud.speed + half) % (width + cloud.width)) - half,
    y: cloud.y + sin(time * 0.4 + index) * 1.5
  };
}
// Called once from sketch.js drawBackground(). Reuse the existing sun response
// while giving clouds their own time-only motion. The audio scene owns the finale.
function drawSharedSky(time) {
  // Zicen's audio scene owns the night finale. Do not draw this daytime layer there.
  if (isAudioFinaleStage()) return;
  push();
  imageMode(CENTER);
  // Keep the existing sun appearance and response; only clouds are decoupled.
  const pulse = 1 + audioData.intensity * 0.28 + audioData.bass * 0.14;
  const sunY = 78 - audioData.bass * 10;
  if (audioSunReady) image(audioSunImage, 98, sunY, 86 * pulse, 86 * pulse);
  else drawSun(98, sunY, 43 * pulse);
  for (let i = 0; i < SHARED_CLOUDS.length; i++) {
    const cloud = SHARED_CLOUDS[i], point = sharedCloudPose(cloud, time, i);
    if (sharedCloudReady) image(sharedCloudImage, point.x, point.y, cloud.width, cloud.height);
    else drawCloud(point.x, point.y, cloud.width / 164);
  }
  pop();
}
