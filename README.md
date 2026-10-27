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

- `Alice- Audio.js`: Alice's Audio interaction component.
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