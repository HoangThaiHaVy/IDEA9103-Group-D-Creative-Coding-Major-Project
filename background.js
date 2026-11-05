// Shared outdoor sky — Emery, developed with OpenAI Codex assistance.
// Clouds depend only on elapsed seconds, never microphone data.
let sharedCloudImage;
let sharedCloudReady = false;
const SHARED_CLOUDS = [
  { startX: 230, y: 88, width: 164, height: 82, speed: 11 },
  { startX: 620, y: 132, width: 126, height: 63, speed: 7 }
];
function preloadBackgroundAssets() {
  sharedCloudImage = loadImage('assets/time-based/cloud-cream.png',
    () => { sharedCloudReady = true; },
    () => { sharedCloudReady = false; });
}
function sharedCloudPose(cloud, time, index = 0) {
  const half = cloud.width / 2;
  return {
    x: ((cloud.startX + time * cloud.speed + half) % (width + cloud.width)) - half,
    y: cloud.y + sin(time * 0.4 + index) * 1.5
  };
}
function drawSharedSky(time) {
  // Zicen's audio scene owns the night finale. Its star/audio stages do not draw outdoor clouds.
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
