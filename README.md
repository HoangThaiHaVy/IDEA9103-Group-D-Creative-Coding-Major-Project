# IDEA9103-Group-D-Creative-Coding-Major-Project
Move Together Story

# Project Inspiration: Keith Haring’s "Untitled (Dance)" (1987)
Move Together draws inspiration from Keith Haring’s "Untitled (Dance)" (1987), a work that captures the energy of dance through simplified human figures, dynamic poses and expressive movement. Haring’s distinctive visual language transforms the human body into a powerful symbol of movement, interaction and connection. Rather than relying on realistic details or facial expressions, he uses bold outlines, exaggerated gestures and rhythmic compositions to communicate emotion and energy. The relationships between the figures are particularly significant, as their movements appear interconnected, creating a sense of collective rhythm and shared experience.

These visual and conceptual qualities directly informed the design approach of Move Together. The project adopts Haring’s simplified figures and expressive movement as its visual foundation, translating the static composition of the original artwork into an interactive digital choreography. The use of individual characters, dynamic poses and movement-based interactions reflects Haring’s ability to communicate through the body and its relationship with others.

However, "Move Together" expands upon the original work; our team sought to evolve it from a static piece into one featuring a diverse range of scenes. Building on the original, we crafted a narrative centered on the connections between the characters. As the characters interact, their movements begin to influence one another, forging bonds that evolve into a synchronized, collective dance. This transition—from individual movement to a collective rhythm—reflects the spirit of unity and cohesion inherent in Haring’s work.

Through this reinterpretation, "Move Together" explores how individual actions can contribute to a shared experience, transforming Haring’s visual language of collective motion into an interactive expression of togetherness (Essie King, 2026; Mariaelena Gherardi, n.d.).

Rather than merely replicating the original, this project reinterprets the spirit of movement and connection through interactive dance. Inspired by how Haring’s characters embody energy and interconnectedness, "Move Together" examines how individual actions can impact others and grow into a collective experience. We have maintained a colour palette and character design closely aligned with the original work, ensuring that its distinctive, signature style remains intact.

# Move Together – Story Narrative
01. Approach: User Input (Vy)

The story begins with a character flying a kite in a peaceful landscape, surrounded by open grassland and distant mountains. As the character enjoys flying the kite, a sudden strong gust of wind sweeps across the field, carrying the kite away. Losing the kite leaves the character feeling increasingly sad, and the weather soon takes a dramatic turn as raindrops begin to fall. The rain continues relentlessly, gradually gathering on the grass and forming large puddles across the landscape. With no shelter nearby, surrounded only by vast open grassland and mountains in the distance, the character has nowhere to escape the storm. Eventually, feeling helpless and overwhelmed, the character crouches down, lowers their head and becomes completely soaked by the rain.

Just when everything seems at its worst, a soft pink glow appears in the distance, like a small light of hope breaking through the gloomy atmosphere. A second character emerges, carrying a white umbrella. Noticing the first character sitting alone in the rain, the newcomer slowly approaches, hoping to offer shelter by sharing their umbrella. 

02. Synchronization: Time-based (Emery)

Connecting with the user input's storyline: Character one agrees to share an umbrella with character two. Character two slowly helps character one stand up, and they both use the umbrella as the rain stops. The two characters dance together, sharing happy smiles (this scene shows the beginning of their friendship). Then, the two characters walk forward, encountering a group of three friends approaching. All five then hold hands and line up horizontally. Next, the characters place their hands on each other's shoulders (representing their friendship). Finally, all five dance together, gradually forming a circle.

03. Collective Movement: Audio (Zicen)

Connecting with the audio's storyline: when the five friends close their circle, a small star appears between their joined hands. Together they lift the light into the sky, and night falls over the same landscape. Under the star the friends let go, step into a row and turn into Haring-style dancers around a campfire. A song starts, and every beat, bass line and bright cymbal changes how each dancer jumps, glows and poses. When the song ends, the visitor is invited to take over with their own music, claps, humming or singing — the audience becomes the last member of the group, and the story ends with everyone moving together.


# Technologies
- p5.js
- HTML
- CSS
- JavaScript

# Project Structure

- `audio-mechanic.js`: Zicen's `AudioMechanic` class – soundtrack/microphone amplitude and FFT analysis.
- `audio-dancer.js`: Zicen's reusable `AudioDancer` class – how one dancer reacts to sound.
- `audio-scene.js`: Zicen's finale – star, nightfall, handoff from Emery's circle, soundtrack, microphone and easter egg.
- `audio-hud.js`: Zicen's `SoundHud` class – the live sound panel under the canvas.
- `flip-synth.js`: Zicen's `FlipSynth` class – live xylophone notes for each handstand and the "Ta-da!" chord.
- `standby-music.js`: Zicen's soft background song that fills quiet moments and gives way to each member's music.
- `assets/audio`: Zicen's dancer poses, handstand poses, human-tower image, campfire, sun/cloud images and finale soundtrack.
- `Emery- Time-Base.js`: Emery's time-based interaction component.
- `LICENSE`: Project license and usage terms.
- `README.md`: Project overview, setup instructions, and documentation.
- `Vy- User InPut.js`: Vy's user input interaction component.
- `index.html`: Main HTML page that loads the project.
- `jsconfig.json`: JavaScript project configuration for the editor.
- `sketch.js`: Main p5.js sketch and interactive experience.
- `style.css`: CSS styling for the webpage.
- `assets` folder: put image character and audio 


# Development Notes
- Update this section when major features change.
- Record known bugs and future improvements.

--------------------------------------------------------------------------------
|| MECHANIC 1 ||
## USER INPUT – Vy

# Overview
Developed the opening interaction and story progression for the *Move Together* project using p5.js. This section introduces a character flying a kite and allows the user to trigger the character's movement and kite release through mouse clicks.

# Story Progression:
**Opening Scene**: The screen displays a landscape featuring a grassy field, mountain ranges, the sun, and clouds. A cursor icon in the shape of a hand appears; the user must click on this icon to begin the story.
**Scene 2**: Once the user clicks "Start" (located below the text "Move Together Story"), a character gradually appears, and the narrative commences. (The story is introduced by a caption below the scene: "Let the kite take flight.")
-> This caption helps the user identify where the story begins and serves as a narrative guide.
**Scene 3**: The caption below the scene reads: "One click—let’s take the kite up to the sky!" The character begins to move, and a kite starts to soar in the sky.
**Scene 4**: The character stops in the middle of the scene, but the kite continues to fly. The caption below changes to “Click the character to continue flying the kite,” at which point the kite soars even higher, and the wind begins to pick up.
**Scene 5**: The caption updates to “Windy~ the kite floats higher,” and the character’s expression shifts to one of surprise (marking a turning point in the story).
**Scene 6**: The character now looks sad, and the caption changes to “Oh no! My kite is gone!” Upon clicking the character, they bow their head, and a light rain begins to fall.
**Scene 6 (continued)**: After clicking the character again, the caption below changes to “The rain is getting heavier…”
**Scene 7**: Clicking the character once more causes them to turn to the left with an even sadder expression, while the rain continues to fall.
**Scene 8**: When the character is clicked, they reach out a hand to catch the raindrops as the rain intensifies; the narrative progresses to: “Slowly reaching out a hand to catch the raindrops.”
**Scene 9**: The user clicks on each blue circle, which transforms into a puddle on the grass—illustrating how the heavy rain has pooled on the ground.
**Scene 10**: Once the user has clicked on all the blue circles, the next part of the story is revealed: “Now, click on the character to see how the story unfolds!” **Scene 11**: Click on the character again; the character’s state changes to a slumped, sitting position, completely drenched. The caption updates to: “...hoping the rain stops soon so I can go home…”
**Scene 12**: After a few seconds, the on-screen caption changes to: “Look to the left and click the pink dot.” The user clicks the pink dot that appears on the left side of the screen, at which point a second character enters, carrying an umbrella.
**Scene 13**: The caption then reads: “Another person appeared, holding a white umbrella… (click the pink figure).” The user clicks on the second character, whose pose shifts so that their right arm points toward the first character, who is still sitting.
**Scene 14**: The caption changes to: “Who is sitting over there in the rain? (Click on the green character).”
**Scene 15**: When the user clicks on the first character, the second character walks over, and the caption displays: “Character approaches Character 1 (click the pink figure to continue).”
**Scene 16**: The user clicks on the second character, who then hands the umbrella to the first character.

At this point, the sequence transitions into a time-based mechanic to connect the two characters.
I placed the light behind the character to express their emotional energy and help users recognise that they need to click on the character to continue the story. The lighting effect disappears once the second character appears, as the focus then shifts to the interaction between the two characters.

### Implemented Features

- Canvas Setup: Created an 800 × 500 canvas and configured rounded stroke caps, rounded joins, and Arial typography.
- Background Design: Designed a simple outdoor environment with an off-white sky, green grass, a yellow sun, and white clouds.
- Story Stage Management: Implemented a state-based system to control the story progression, including the introduction, start prompt, character fade-in, holding, release, walking, and finished stages.
- Character Animation: Controlled the character's horizontal movement using time-based updates and gradually increased the character's opacity during the fade-in transition.
- Kite Interaction: Prepared the interaction states for releasing the kite, allowing the character to walk, and triggering the kite's upward movement after the walking sequence finishes.
- Wind Animation: Added animated wind lines to create a sense of movement in the outdoor environment when the story reaches the finished stage.
- Interaction Prompts: Added contextual text prompts to guide users through the interaction and communicate the character's actions.
- Image Preloading: Integrated `preloadCharacterImages()` to load character assets before the animation begins.

### Technical Implementation
1. Overview: 
The main components of the code include:
* Loading character images and tracking their loading status.
* Rendering the character, kite, wind, rain, light, lightning, and puddles.
* Detecting the coordinates of user mouse clicks.
* Transitioning the narrative from one scene to another.
* Displaying a second character, along with animations for walking, pointing, or offering an umbrella.
The user input code handles mouse interactions for the Vy-User Input file. It reads storyStage and updates it when the user clicks the start button, a character, or a rain or pink dot. It also updates related state, such as characterX, characterFade, rainDrops, and the second character’s position and animation.

Some values it uses are declared in sketch.js, including storyStage, characterX, characterFade, GROUND_Y, finishedAt, and arrivalAt. The p5.js library provides width, height, mouseX, mouseY, frameCount, millis(), and drawing functions. Additionally, in the preload() function, I have added the audio for the rain sequence corresponding to the RAIN_STAGES: ['rainStorm', 'soSad', 'rainFace', 'wet', 'pinkReveal'].

2. How the story transitions between scenes

The narrative is controlled by the `storyStage` variable. Each time the user clicks the mouse, the `mousePressed()` function checks the current stage and determines the next action.

The `storyStage` variable represents the current scene. The `mousePressed()` function checks the current scene and the click location to handle interactions; other scene transitions are time-based and managed within `sketch.js`.

Main sequence:
`intro`: click → `ready`: click "start" button → `fadeIn` → `holding`:click character → `released`:click character → `walking` → `arrival`:click character → `walking` → `finished`:wait, then click character→ `lostKite`:click character → `rainStorm`:click character → `soSad`:click character → `rainFace`:click all raindrops, then click character → `wet`:wait 5 seconds, then click the pink dot → `pinkReveal`.

In the `rainFace` scene, the user must click the blue dots before clicking the character to proceed. In `pinkReveal`, subsequent clicks control a second character: clicking the blue character causes them to walk toward the main character, and clicking this second character triggers a pose where they offer an umbrella. Clicking the character holding the umbrella calls `startTimeBased()` and transitions the story into its time dependent phase.

3. State variables and images
3.1. Image of the main character
let standingImage;
let surprisedImage;
let walkImage;
let walk1Image;
let walk2Image;
let sadnessImage;
let sadRainImage;
let soSadImage;
let pointingForwardImage;
let wetImage;
These variables store images used to represent various poses:
* standingImage: the character standing normally.
* surprisedImage: the character looking surprised.
* walk1Image, walk2Image: two frames of a walking animation, alternated to create movement.
* sadnessImage: a sad pose.
* sadRainImage: a sad expression in the rain.
* soSadImage: an image used for the "so sad" scene.
* pointingForwardImage: the character pointing forward or toward the cave.
* wetImage: the character appearing wet.

3.2. Second character photo
let character2PinkImage;
let character2PointingImage;
let character2Walk1Image;
let character2Walk2Image;
let character2GiveImage;
These images depict the actions of the second character:
* character2PinkImage: initial pose, with the character holding an umbrella.
* character2PointingImage: the character pointing toward the main character.
* character2Walk1Image, character2Walk2Image: two frames showing the character walking.
* character2GiveImage: a pose in which the character is handing over the umbrella.

3.3. Image loading flag
Example: 
let standingImageReady = false;
let standingImageFailed = false;
The "...Ready" variables indicate whether an image has loaded successfully and is ready to be drawn. The "...Failed" variables are used to track instances where an image failed to load.Checking these flags before drawing prevents the code from attempting to use an image that hasn't finished loading. If an image is not ready, the drawing function can either skip it or use a different image as a fallback.

3.4. Timer and coordinates
Some variables save scene start time or character position:
* sadStartedAt: the moment the story begins in the sad part.
* sadRainStartedAt: starting time of sad face in the rain scene.
* wetStartedAt: the time the character gets wet in the scene.
* pinkDotStartedAt: time to start counting time before allowing the pink dot to be pressed.
* character2X: horizontal coordinates of the second character.
* character2WalkStartedAt: the time the second character starts walking.
* character2WalkStartX, character2WalkTargetX: start and destination of movement.
* character2PinkRevealStartedAt: starting time for the second character to appear.

3.5. Five raindrops that can be pressed
const rainDropCount = 5;
let rainDrops = Array.from({ length: rainDropCount }, () => ({
clicked: false,
clickedAt: 0
}));
Each drop has two properties:
* clicked: whether the user has clicked on this drop.
* clickedAt: the timestamp of when the drop was clicked, used to trigger the puddle animation. This array is recreated whenever the user enters the 'rainFace' scene, which resets the state of the five drops.

4. Main update and draw function: updateAndDrawVy(time, dt)
4.1. Defining the conditions of the scene
This function updates certain states over time and calls the corresponding drawing functions. I designed it to be called repeatedly from the main drawing loop.
const walking = storyStage === 'walking';
'walking' indicates whether the character is currently walking.

The const `released` variable tracks whether the kite has been released, a state that persists through subsequent scenes. It influences the kite's position, altitude, and the kite string.

const finishedElapsed =
finishedAt > 0 ? max(0, time - finishedAt) : 0;
`finishedElapsed` represents the number of seconds that have passed since the `finishedAt` timestamp. If the completion time has not been set, the value is 0.
const kiteEscaped =
['finished', 'lostKite', 'rainStorm', 'rainFace'].includes(storyStage) &&
finishedElapsed >= 0.8;

This flag is activated only when the program has reached one of the post-completion scenes and at least 0.8 seconds have elapsed. It is passed to the rendering function to trigger the kite’s departure from the character.
const kiteRise =
arrivalAt > 0 ? min(120, max(0, time - arrivalAt) * 35) : 0;
`kiteRise` causes the kite to gradually ascend once the arrival scene begins. The maximum altitude is 120 units.

4.2. Drawing the wind effect
const windStartsNearEnd = walking && characterX >= width - 220;
const windyCaptionVisible = storyStage === 'finished';
The wind begins to appear when the character walks near the right edge of the screen. In the 'finished' stage, the wind is rendered with greater intensity, and a corresponding caption is displayed.
if (windStartsNearEnd || windyCaptionVisible) {
drawWind(time, windyCaptionVisible);
}
The `drawWind()` function uses the `time` parameter to animate the movement of the wind streaks. The second parameter determines the intensity of the wind.

4.3. Drawing the rain
const sadnessElapsed =
sadnessStartedAt > 0 ? time - sadnessStartedAt : 0;
This variable calculates the time elapsed since the beginning of the sad segment of the story.
Rain is rendered during states such as `lostKite`, `rainStorm`, `soSad`, `rainFace`, `caveEntered`, `wet`, and `pinkReveal`, provided that at least 1.5 seconds have passed since the onset of the sad sequence.
drawRain(time, storyStage !== 'lostKite');
The second parameter determines the intensity of the rain. The rain is lighter during the `lostKite` stage, while the other states feature heavier rain.

4.4. Drawing the glow around the character
The `drawCharacterGlow()` function is called to render a glowing area around the character across various scenes. The color varies based on the current state:
* A yellow glow during standard scenes.
* A purple glow during sad or rainy scenes.
* A soft gray glow during the `wet` scene.
In the current codebase, there are two conditional blocks that call `drawCharacterGlow()` for largely overlapping lists of scenes. Consequently, for scenes included in both lists, the glow effect may be rendered twice.

4.5. Drawing the character and the kite
The drawCharacterAndKite() function takes a position and an options object.

4.6. Displaying prompts (narrative annotations)
Conditions such as:
if (storyStage === 'rainStorm') {
drawCharacterHint('The rain is getting heavier...');
}
display a prompt appropriate for the current scene. In the 'rainStorm' stage, the content of the prompt further depends on whether or not the user has already interacted with the raindrops:
* No interaction yet: a prompt reading “Slowly reaching out...”.
* Character clicked to begin interaction: a prompt instructing the user to click on each blue dot.
* All five dots clicked: a prompt instructing the user to click on the character to continue the story.

5. Second Character

The drawPinkCharacterReveal() function manages the appearance and animation of the second character. The character is revealed after the user interacts with the pink sparkle. Its animations include pointing, walking towards the main character, and offering an umbrella.

The character2X variable controls horizontal movement, while drawCharacter2Umbrella() creates the umbrella using custom Bézier shapes.Time-based interpolation creates a smooth walking animation, allowing the second character to approach the main character before offering support.

6. Visual Effects and Environment

The project uses custom drawing functions to create animated environmental effects and enhance the storytelling experience.
Function:
drawKite() : Draws the kite, including its colourful body, frame, string, and decorative elements.

drawWind(): Creates moving wind effects using animated curves and sine-based motion.

drawRain(): Generates animated rain with different intensities.

drawLightning():Creates brief lightning flashes during the rain scene.

drawCharacterGlow(): Adds atmospheric lighting around the character based on the current story stage.

drawRainDropsAndPuddles(): Animates rain droplets transforming into expanding puddles after interaction.

drawPinkSparkleDot(): Creates the glowing pink sparkle that introduces the second character.
These effects use mathematical functions, transparency, and layered shapes to create a dynamic visual environment.

5. Interaction Detection

The project uses custom hit-detection functions to identify user interactions with visual elements.

clickOnCharacter() detects clicks on the main character and its interaction area.

clickOnCharacter2() detects clicks on the second character.

clickRainDot() identifies interactions with individual rain droplets.

clickOnCave() checks whether the user clicks within the cave area.

These functions ensure that interactive elements respond appropriately to user input.

6. Asset Management

The preloadCharacterImages() function loads the visual assets required for the experience, including character poses, walking animations, emotional expressions, and the second character.

Image loading callbacks track whether assets have loaded successfully. The imageLoadFailed() function provides console warnings when an image cannot be loaded, helping identify incorrect filenames or asset paths.

The project also includes drawFallbackCharacter(), a function that creates a simplified character using basic shapes as an alternative visual representation.

7. Technical Implementation

The User Input Mechanic combines several key p5.js techniques:
Conditional statements: Control story progression and interaction logic.
Time-based animation: Synchronise character movement and visual effects with elapsed time.
Interpolation: Create smooth movement between positions using lerp() and constrain().
Mathematical animation: Use sin() and cos() to generate natural movement and visual effects.
Custom drawing: Construct visual elements using shapes, Bézier curves, and layered graphics.
Asset management: Load and organise character images and visual resources.
Together, these mechanics and techniques transform individual user interactions into a continuous interactive narrative, supporting the project's central concept: Where individual movements become a shared rhythm.

The code integrates a story-state controller with p5.js drawing functions. The `mousePressed()` function handles user interaction and scene transitions; `updateAndDrawVy()` determines which effects and content to render; and functions such as `drawCharacterAndKite()`, `drawRain()`, and `drawPinkCharacterReveal()` generate the visuals for each specific scene.
Regarding the narrative flow design, I have organized the program into distinct, modular sections to maintain overall control and facilitate integration with other mechanics, specifically state management, interaction handling, asset loading, and visual rendering. This structure allows for the addition of new scenes simply by defining a new state, specifying the corresponding transition conditions, and implementing the associated drawing logic.

-------------------------------------------------------------------------------

|| MECHANIC 2 ||
## TIME-BASE – Emery







-------------------------------------------------------------------------------

|| MECHANIC 3 ||
## AUDIO – Zicen

### Overview
Zicen directed the **audio** mechanic: the final chapter of *Move Together*,
where the level and frequency content of an audio track – and then the
visitor's own sound – drive five dancers. It is the payoff of the story: the
friendship built by Vy's clicks and Emery's timeline becomes a dance that the
audience can join.

### Story beats (`audio-scene.js`)
1. **Handoff** – `sketch.js` calls `startStarGather()` once Emery's
   `timeCircleReady` flag is true, so the finale always starts from Emery's
   real final frame (same `Character` objects, positions and joined hands).
2. **Rising star (6.8 s)** – a star rises from the circle; the day palette
   cross-fades to the night palette of the same landscape.
3. **Row and transformation (5.2 s)** – Emery's figures release hands, walk
   into a row, strike a dance pose and cross-fade into Zicen's image dancers
   of matching colours. A campfire then lights up behind them.
4. **Soundtrack dance** – *Funky Drums Bass And Claps* plays once and is
   analysed live, so the scene reacts to sound even before the microphone is on.
   The star stays in the sky above them and grows brighter with the music –
   the light the friends lifted together now answers their shared sound.
5. **Final bow** – when the song ends the group performs a *handstand wave*
   (each dancer flips onto their hands a moment after their neighbour – a nod
   to the upside-down figures in Haring's dance drawings). Each flip rings
   that dancer's xylophone note, so the wave plays a rising run (C D E G A),
   and a "Ta-da!" chord sounds when the whole row is upside down. Then the five climb
   into a human tower and the top dancer touches the star they lifted at the
   start of the chapter; the star flares with a sparkling chime and the
   caption reads *"Together, they reach the light"*. The tower artwork originally held a moon; the moon
   was removed so the climax reuses the story's own symbol instead of adding
   a second moon to the sky.
6. **Your turn** – a banner asks the visitor to play music, clap, hum or
   sing. With the microphone enabled, the dance continues for as long as the
   visitor keeps making sound.

### Sound → visual mapping (response to tutor feedback)
Our Week 9 feedback asked for *more detail on how the characters react to
sound, while still looking visually appealing, and for the work to connect to
the rest of the program through classes*. Instead of one volume-to-movement
rule, each sound feature now controls a different, readable property:

| Sound feature (`AudioMechanic`) | Dancer reaction (`AudioDancer`) | Limit that keeps it tidy |
| --- | --- | --- |
| Overall volume (`p5.Amplitude`) | Dance tempo and jump height – `pow(volume, 1.3)` makes quiet sound barely lift the feet and loud sound jump high; star size and halo | Jump ≤ 125 px, scale ≤ 6% |
| Bass (share of energy below 250 Hz) | Squash on landing, ground shadow, star rays, campfire pulse | Squash ≤ 9%, only near the ground |
| Mid (share of energy 250 Hz – 2 kHz) | Campfire flame grows taller | Flame ≤ 18% taller |
| Treble (spectral centroid, 250 Hz dark → 2 kHz bright) | Coloured glow halo in the dancer's own colour, extra tilt | Tilt ≤ ~4°, glow 0–1 |
| Short sound (clap / drum hit) | Switches to the next hand-drawn pose with a burst of rays | 320 ms cooldown (mic), 1 s (song) |
| Long sound (hum / held note) | Smooth Perlin-noise travel inside the dancer's own lane | ±24 px per lane, no collisions |
| Bright vs. dark sound, and brighter / darker than the last ~4 s | Row throws itself wide open or squeezes into a tight huddle | Spread 0.4–1 of the row width |
| Soundtrack drum hit | A random dancer flips into a quick handstand (`random()`, 85% chance per beat) and rings its own xylophone note | Beats ≥ 1 s apart, 0.9 s upside down, never the same dancer twice at once |
| **Easter egg:** three claps within 1.5 s | Handstand wave across the row | Only one wave at a time |
| **Hum** (microphone): one steady note, no beat | Builds the human tower level by level; 3 s completes it and the top dancer touches the star | Progress falls back when the hum stops |

**Why bass / mid / treble are measured as a balance.** p5.FFT returns
absolute, decibel-scaled energies. A microphone is about 20 dB quieter than a
music file, so with the raw `getEnergy('treble')` values almost every sound
read as "bass" and high-pitched songs barely registered. The mechanic now
uses the *spectral centroid* (where the energy is centred) and the *share* of
energy in each band, which do not change with volume. Measured: the funky
drum track ≈ 140 Hz, the standby song 225–805 Hz, a soprano note ≈ 1250 Hz, a
whistle ≈ 2500 Hz – and the whistle at one tenth of the volume still ≈ 2450 Hz.
In tests a whistle opens the row fully (spread 1.0) while a bass line
squeezes it to 0.4, and both songs swing between 0.4 and 1.0.

**Telling a hum apart from music.** Music is continuous too, so "a long
sound" alone would be triggered by any song. The hum detector therefore needs
three things at once: the loudest frequency (80 Hz–1 kHz) stays in the same
FFT bin for 0.25 s (*one steady pitch*), at least 90% of the energy sits in
the 12 strongest bins (*a voice's note and harmonics, not a band*), and no
percussive onset in the last 0.45 s (*no beat*). Measured on recordings, a
synthetic hum kept a steady pitch for over 1 s in 81% of frames; the standby
song and Emery's song in 0%; the funky drum track in 24% but always with
drum hits. Feeding the three songs into the detector never built a single
level, while the hum completed the tower.

All values are smoothed with `lerp()` and limited with `constrain()`, so a
loud or noisy microphone never makes the drawings shake, overlap badly or leave
the canvas. Each dancer has its own phase and jump strength, so the group feels
coordinated but not robotic. The OS *reduced motion* setting is respected.

### Code structure
- **`AudioMechanic` class** (`audio-mechanic.js`) – owns one
  `p5.Amplitude` + `p5.FFT` pair for the soundtrack and one for the
  microphone (p5.sound analysers keep every input they were ever given, so
  separate pairs avoid mixing the two). `getSoundData()` returns one plain
  object `{ intensity, bass, mid, treble, longSound, shortSound, sustain, spread }`;
  `createSilentSoundData()` returns the same shape when nothing is playing.
- **`AudioDancer` class** (`audio-dancer.js`) – each instance stores its
  position, size, pose images, colour, phase and current reaction values.
  `update(time, sound)` turns sound data into movement; `display()` draws the
  shadow, glow, burst and pose cross-fade.
- **`SoundHud` class** (`audio-hud.js`) – builds the sound panel once with
  p5 DOM functions, then each frame only changes bar widths and highlights
  the event that was just detected. It shows the audience *what* the
  mechanic listens to (volume, bass, mid, treble, claps, held notes, bright /
  deep sound) and *what* each one controls – replacing the earlier raw debug
  numbers. The secret chip reads `??? → clap 3 times fast` until the easter
  egg is found.
- **Standby music** (`standby-music.js`) – a soft looping song for the
  quiet parts of the story before the audio chapter (it stays off from the
  rising star onwards). It never plays over a teammate's sound:
  whenever Vy's rain, Emery's group-dance song or the finale song is playing
  it fades out in 0.3 s and pauses, then fades back in (resuming, not
  restarting) when they stop. It is off during the final dance so the microphone
  only hears the visitor. Hooked into `preloadAudioAssets()` /
  `updateAudio()`, so no teammate's file had to change.
- **Scene functions** (`audio-scene.js`) – `preloadAudioAssets()`,
  `setupAudio()`, `updateAudio()`, `drawAudioFinale()` and `drawAudio()` are
  the only calls `sketch.js` needs. The scene reuses Emery's `Character` class
  and `sketch.js`'s `drawLandscape()` with a night palette, so all mechanics
  share one visual world.

### Interaction instructions
1. Open `index.html` through a local web server (e.g. VS Code Live Server)
   and follow the story by clicking (Vy's and Emery's sections).
2. Turn your speakers on: after the circle, watch the star rise and the
   dancers react to the soundtrack.
3. Click **Enable microphone** under the canvas and allow access (you can do
   this at any time). When the song ends, play your favourite music, clap,
   hum or sing:
   - louder → higher, faster jumps; low/bass sounds → stronger knee squash;
   - whistling or bright sounds → brighter coloured glow and a wider row;
   - a sharp clap → every dancer changes pose with a small burst;
   - a long steady hum → the dancers drift smoothly left and right.
   - **easter egg:** clap three times quickly for a handstand wave;
   - **hum one steady note** (no music playing) – the friends climb into a
     human tower one level per second; keep humming for 3 s to touch the
     star. In class, everyone can hum together.
4. The **sound panel** under the canvas shows what is being listened to,
   four live meters (volume, bass, mid, treble) with what each one controls,
   and chips that light up when a clap, a held note, or a bright / deep sound
   is detected.
5. The page fits the browser window without scrolling on desktop: the canvas
   grows to the largest 16:10 size that fits above a compact sound strip
   (CSS container query units), on a dark "stage" background. The ⓘ button
   opens a pop-over listing what every sound controls. On phones the page
   stacks and scrolls. The canvas keeps its 800 × 500 drawing coordinates
   and p5 maps mouse positions back, so Vy's clicks still work at any size.
6. Testing shortcuts – add one to the page address to skip the earlier
   chapters (click once on the page so the browser allows audio):
   - `?audioTest=handoff` – last seconds of Emery's circle, then the handoff
   - `?audioTest=star` – the rising star and nightfall
   - `?audioTest=dance` – the soundtrack dance
   - `?audioTest=ending` – skips to the end of the song: handstand wave,
     human tower and the "your turn" prompt

### External references
- p5.sound `p5.AudioIn`, `p5.Amplitude`, `p5.FFT`, `userStartAudio()` –
  https://p5js.org/reference/#/libraries/p5.sound
- Easing curves `cubic-bezier(0.23, 1, 0.32, 1)` and `(0.77, 0, 0.175, 1)`
  evaluated with Newton's method in `strongEaseOut()` / `strongEaseInOut()` –
  https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function
- `blendMode(ADD)` for the glow halo and star – https://p5js.org/reference/p5/blendMode/
- p5 DOM (`createDiv`, `createSpan`, `addClass`, `style`) for the sound panel –
  https://p5js.org/reference/p5/createDiv/
- CSS container queries (`container-type`, `cqw` / `cqh`) for the
  responsive stage size –
  https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries
- Soundtrack: *Funky Drums Bass And Claps* by Emmraan, Pixabay Content
  License – https://pixabay.com/service/license-summary/
- Star chime (`star-chime.mp3`): an original sound synthesised for this
  project with Python/NumPy (bell partials with high shimmer), credited in the
  AI acknowledgement.
- Flip sounds (`flip-synth.js`): synthesised live in the browser with
  `p5.Oscillator` + `p5.Envelope` – https://p5js.org/reference/p5.sound/p5.Oscillator/
- Standby music: *Child Play – Happy Kids School Background Music* by
  SunnyVibesAudio, Pixabay Content License (re-encoded to 128 kbps)
- Spectral centroid as a measure of "brightness" –
  https://en.wikipedia.org/wiki/Spectral_centroid
- Converting p5.FFT's decibel-scaled values back to linear energy
  (`10^(dB/10)`) for the hum detector – https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData

---------------------------------------------------------------------------------

### AI acknowledgement

OpenAI Codex was used to assist with debugging, modular integration, audio-data
mapping, and the generation of the transparent red-sun and cream-cloud image
assets. The team reviewed and adapted the resulting code. The audio code uses
`p5.AudioIn`, `p5.Amplitude`, and `p5.FFT`; comments in `audio-mechanic.js`,
`audio-dancer.js` and `audio-scene.js` identify the assisted sections and
explain their purpose.

Claude (Anthropic) was used by Zicen for a final review of the audio mechanic
against the brief and the tutor feedback. It helped write: separate analysers
so the soundtrack and the microphone can each drive the dancers, the
end-of-song prompt, the glow / squash / shadow / burst reaction layers in
`AudioDancer`, the persistent sound-reactive star, the handstand-wave easter
egg and human-tower ending, the hum detector and level-by-level tower,
the standby music, the synthesised star chime, the live xylophone / "Ta-da" flip sounds, the `SoundHud` panel and its CSS, the responsive page layout in
`style.css`, and the rewritten audio section of this README. Zicen chose
which suggestions to keep, tuned the limits by testing in the browser, and the
header comment of each file states what was assisted.

The five handstand drawings and the human-tower drawing were generated by
Zicen with an AI image generator, using the existing dancer artwork as the
style reference. Claude then cropped them, removed the moon from the tower
image (so the top hand can hold the code-drawn star), split it into three
layers by colour so it can be built level by level, and resized them for
the web.
