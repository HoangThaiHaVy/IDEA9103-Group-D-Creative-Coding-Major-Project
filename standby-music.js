// ========================================
// STANDBY MUSIC (Zicen, audio mechanic)
// ========================================
// A soft looping song fills the quiet moments of the whole story. It always
// gives way to the team's own music:
//   • Emery's group-dance song or Zicen's finale song playing → fade out;
//   • when that music stops → fade back in and continue where it paused;
//   • Vy's rain and wind are sound effects, so they keep playing on top.
// It stays off during the final dance, because the microphone is listening
// to the visitor there and background music would confuse the analysis.
// Called from preloadAudioAssets() and updateAudio() in audio-scene.js, so
// no other file needs to change.
//
// Music: "Child Play – Happy Kids School Background Music" by SunnyVibesAudio,
// Pixabay Content License (https://pixabay.com/service/license-summary/).
// Re-encoded to 128 kbps to keep the repository small.
// AI acknowledgement: written with help from Claude; Zicen chose the track,
// the volume and when it should give way.

const STANDBY_MUSIC_PATH = 'assets/audio/background-ambient.mp3';
const STANDBY_MUSIC_VOLUME = 0.12; // soft enough to sit under the rain (0.15)
const STANDBY_FADE_PER_SECOND = 0.1; // full fade takes a little over 1 second

let standbyMusic;
let standbyMusicLevel = 0;

function preloadStandbyMusic() {
  standbyMusic = loadSound(STANDBY_MUSIC_PATH);
}

// True while any team member's own music is audible.
function isTeamMusicPlaying() {
  const emerySongPlaying = typeof groupDanceMusic !== 'undefined' &&
    groupDanceMusic && groupDanceMusic.isPlaying();
  const zicenSongPlaying = finaleSoundtrack && finaleSoundtrack.isPlaying();
  return Boolean(emerySongPlaying || zicenSongPlaying);
}

function updateStandbyMusic(deltaSeconds) {
  if (!standbyMusic || !standbyMusic.isLoaded()) return;
  // Browsers only allow sound after the visitor's first click.
  if (getAudioContext().state !== 'running') return;

  const shouldPlay = storyStage !== 'audioDance' && !isTeamMusicPlaying();
  const targetLevel = shouldPlay ? STANDBY_MUSIC_VOLUME : 0;
  const step = STANDBY_FADE_PER_SECOND * deltaSeconds;
  standbyMusicLevel = targetLevel > standbyMusicLevel
    ? min(standbyMusicLevel + step, targetLevel)
    : max(standbyMusicLevel - step, targetLevel);

  if (standbyMusicLevel > 0) {
    if (!standbyMusic.isPlaying()) standbyMusic.loop();
    standbyMusic.setVolume(standbyMusicLevel);
  } else if (standbyMusic.isPlaying()) {
    // pause() keeps the position, so the song resumes rather than restarts.
    standbyMusic.pause();
  }
}
