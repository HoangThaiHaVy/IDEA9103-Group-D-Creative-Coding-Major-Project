# IDEA9103-Group-D-Creative-Coding-Major-Project
Move Together group 
# IDEA9103-Group-D-Creative-Coding-Major-Project
Move Together group 

# Move Together

# About
An interactive experience exploring how individual movements
can develop into a shared rhythm and collective choreography.

# Technologies
- p5.js
- HTML
- CSS
- JavaScript

# Project Structure

- `audio-mechanic.js`: Zicen's microphone, amplitude, and frequency analysis module.
- `Alice-Audio.js`: Zicen's audio setup, asset animation, drawing, and reset hooks.
- `Emery- Time-Base.js`: Emery's time-based interaction component.
- `LICENSE`: Project license and usage terms.
- `README.md`: Project overview, setup instructions, and documentation.
- `Vy- User InPut.js`: Vy's user input interaction component.
- `index.html`: Main HTML page that loads the project.
- `jsconfig.json`: JavaScript project configuration for the editor.
- `sketch.js`: Main p5.js sketch and interactive experience.
- `style.css`: CSS styling for the webpage.


# Development Notes
- Update this section when major features change.
- Record known bugs and future improvements.

## User Input – Vy

### Overview
Developed the opening interaction and story progression for the *Move Together* project using p5.js. This section introduces a character flying a kite and allows the user to trigger the character's movement and kite release through mouse clicks.

### Implemented Features

- **Canvas Setup:** Created an 800 × 500 canvas and configured rounded stroke caps, rounded joins, and Arial typography.
- **Background Design:** Designed a simple outdoor environment with an off-white sky, green grass, a yellow sun, and white clouds.
- **Story Stage Management:** Implemented a state-based system to control the story progression, including the introduction, start prompt, character fade-in, holding, release, walking, and finished stages.
- **Character Animation:** Controlled the character's horizontal movement using time-based updates and gradually increased the character's opacity during the fade-in transition.
- **Kite Interaction:** Prepared the interaction states for releasing the kite, allowing the character to walk, and triggering the kite's upward movement after the walking sequence finishes.
- **Wind Animation:** Added animated wind lines to create a sense of movement in the outdoor environment when the story reaches the finished stage.
- **Interaction Prompts:** Added contextual text prompts to guide users through the interaction and communicate the character's actions.
- **Image Preloading:** Integrated `preloadCharacterImages()` to load character assets before the animation begins.

### Technical Implementation

- Used `setup()` to initialise the canvas and drawing settings.
- Used `draw()` as the main animation loop to update
- I updated file html & update character illustrator image (Vy)

## Audio – Zicen

Zicen developed the microphone-driven mechanic. The **Enable microphone**
button starts `p5.AudioIn`; `p5.Amplitude` measures overall intensity and
`p5.FFT` extracts bass and treble energy. These values control the red sun's
scale and vertical pulse, the cream clouds' speed and bobbing, and a small
sound-level indicator. The analysis is isolated in `audio-mechanic.js`, while
`Alice-Audio.js` connects the data to the shared scene.

### Interaction instructions

1. Open the project through a local web server.
2. Select **Enable microphone** and allow microphone access.
3. Speak, clap, or play music. Louder sound enlarges the sun, bass lifts it,
   and high frequencies increase the clouds' movement.
4. Continue clicking the character and scene prompts to experience the story.

### AI acknowledgement

OpenAI Codex was used to assist with debugging, modular integration, audio-data
mapping, and the generation of the transparent red-sun and cream-cloud image
assets. The team reviewed and adapted the resulting code. The audio code uses
`p5.AudioIn`, `p5.Amplitude`, and `p5.FFT`; comments in `audio-mechanic.js` and
`Alice-Audio.js` identify the assisted sections and explain their purpose.
