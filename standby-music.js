// ========================================
// STANDBY MUSIC (Zicen, audio mechanic)
// ========================================
// A soft looping song fills the quiet moments of the whole story. It never
// plays over the team's own sounds:
//   • Vy's rain (sketch.js), Emery's group-dance song or Zicen's finale song
//     starts → quick fade-out (0.3 s), then pause;
//   • when they stop → slow fade back in, continuing where it paused.
// It stays off for the whole audio chapter (rising star and final dance):
// the gap after Emery's song is short, and in the dance the microphone is
// listening to the visitor, so background music would confuse the analysis.
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
const STANDBY_FADE_OUT_PER_SECOND = 0.4; // out in 0.3 s – team sound comes first
const STANDBY_FADE_IN_PER_SECOND = 0.08; // back in over 1.5 s

let standbyMusic;
let standbyMusicLevel = 0;

function preloadStandbyMusic() {
  standbyMusic = loadSound(STANDBY_MUSIC_PATH);
}

// True while any team member's own sound is audible. These are the only
// sounds in the project: rainMusic (Vy, sketch.js), groupDanceMusic (Emery)
// and finaleSoundtrack (Zicen).
function isTeamMusicPlaying() {
  const isOn = (sound) => Boolean(sound && sound.isPlaying());
  const vyRain = typeof rainMusic !== 'undefined' &&
    (isOn(rainMusic) || (typeof rainMusicPlaying !== 'undefined' && rainMusicPlaying));
  const emerySong = typeof groupDanceMusic !== 'undefined' && isOn(groupDanceMusic);
  const zicenSong = isOn(finaleSoundtrack);
  return vyRain || emerySong || zicenSong;
}

function updateStandbyMusic(deltaSeconds) {
  if (!standbyMusic || !standbyMusic.isLoaded()) return;
  // Browsers only allow sound after the visitor's first click.
  if (getAudioContext().state !== 'running') return;

  const shouldPlay = !isAudioFinaleStage() && !isTeamMusicPlaying();
  const targetLevel = shouldPlay ? STANDBY_MUSIC_VOLUME : 0;
  standbyMusicLevel = targetLevel > standbyMusicLevel
    ? min(standbyMusicLevel + STANDBY_FADE_IN_PER_SECOND * deltaSeconds, targetLevel)
    : max(standbyMusicLevel - STANDBY_FADE_OUT_PER_SECOND * deltaSeconds, targetLevel);

  if (standbyMusicLevel > 0) {
    if (!standbyMusic.isPlaying()) standbyMusic.loop();
    standbyMusic.setVolume(standbyMusicLevel);
  } else if (standbyMusic.isPlaying()) {
    // pause() keeps the position, so the song resumes rather than restarts.
    standbyMusic.pause();
  }
}
