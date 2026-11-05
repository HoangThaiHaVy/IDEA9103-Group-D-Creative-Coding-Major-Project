# IDEA9103-Group-D-Creative-Coding-Major-Project
Move Together Story

# Project Inspiration: Keith Haring’s "Untitled (Dance)" (1987)
Move Together draws inspiration from Keith Haring’s *Untitled (Dance)* (1987), a work that captures the energy of dance through simplified human figures, dynamic poses and expressive movement. Haring’s distinctive visual language transforms the human body into a powerful symbol of movement, interaction and connection. Rather than relying on realistic details or facial expressions, he uses bold outlines, exaggerated gestures and rhythmic compositions to communicate emotion and energy. The relationships between the figures are particularly significant, as their movements appear interconnected, creating a sense of collective rhythm and shared experience.

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

03. Collective Movement: Audio (Zichen)

Connecting with the audio's storyline: After the five characters form a circle, they hold hands and extend them forward, creating a changing light around them that shifts color according to the rhythm of the music. Then, the characters move together in a slow, circular motion; a small star slowly appears in the center. At this point, the circle gradually narrows, and the star hovers above the characters. Then all five characters raise their hands to the sky as if cradling the small star. This connection creates a large source of light, the star becomes brighter and rises into the air (the five characters below look up). The star grows larger. And a breathtaking scene unfolds, the characters...


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

## USER INPUT – Vy

### Overview
Developed the opening interaction and story progression for the *Move Together* project using p5.js. This section introduces a character flying a kite and allows the user to trigger the character's movement and kite release through mouse clicks.

# Story Progression:
Opening Scene: The screen displays a landscape featuring a grassy field, mountain ranges, the sun, and clouds. A cursor icon in the shape of a hand appears; the user must click on this icon to begin the story.

Second Scene: Once the user clicks "Start" (located below the text "Move Together Story"), a character gradually appears, and the narrative commences. (The story is introduced by a caption below the scene: "Let the kite take flight.")
-> This caption helps the user identify where the story begins and serves as a narrative guide.

Third Scene: The caption below the scene reads: "One click—let’s take the kite up to the sky!" The character begins to move, and a kite starts to soar in the sky.

Scene 4: The character stops in the middle of the scene, but the kite continues to fly. The caption below changes to “Click the character to continue flying the kite,” at which point the kite soars even higher, and the wind begins to pick up.

Scene 5: The caption updates to “Windy~ the kite floats higher,” and the character’s expression shifts to one of surprise (marking a turning point in the story).

Scene 6: The character now looks sad, and the caption changes to “Oh no! My kite is gone!” Upon clicking the character, they bow their head, and a light rain begins to fall.

Scene 6 (continued): After clicking the character again, the caption below changes to “The rain is getting heavier…”

Scene 7: Clicking the character once more causes them to turn to the left with an even sadder expression, while the rain continues to fall.

Scene 8: When the character is clicked, they reach out a hand to catch the raindrops as the rain intensifies; the narrative progresses to: “Slowly reaching out a hand to catch the raindrops.”

Scene 9: The user clicks on each blue circle, which transforms into a puddle on the grass—illustrating how the heavy rain has pooled on the ground.

Scene 10: Once the user has clicked on all the blue circles, the next part of the story is revealed: “Now, click on the character to see how the story unfolds!” Scene 11: Click on the character again; the character’s state changes to a slumped, sitting position, completely drenched. The caption updates to: “...hoping the rain stops soon so I can go home…”

Scene 12: After a few seconds, the on-screen caption changes to: “Look to the left and click the pink dot.” The user clicks the pink dot that appears on the left side of the screen, at which point a second character enters, carrying an umbrella.

Scene 13: The caption then reads: “Another person appeared, holding a white umbrella… (click the pink figure).” The user clicks on the second character, whose pose shifts so that their right arm points toward the first character, who is still sitting.

Scene 14: The caption changes to: “Who is sitting over there in the rain? (Click on the green character).”

Scene 15: When the user clicks on the first character, the second character walks over, and the caption displays: “Character approaches Character 1 (click the pink figure to continue).”

Scene 16: The user clicks on the second character, who then hands the umbrella to the first character.

At this point, the sequence transitions into a time-based mechanic to connect the two characters.

I placed the light behind the character to express their emotional energy and help users recognise that they need to click on the character to continue the story. The lighting effect disappears once the second character appears, as the focus then shifts to the interaction between the two characters.


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


## AUDIO – Zicen

Zicen developed the microphone-driven mechanic. The **Enable microphone**
button starts `p5.AudioIn`; `p5.Amplitude` measures overall intensity and
`p5.FFT` extracts bass and treble energy. These values control the red sun's
scale and vertical pulse, the cream clouds' speed and bobbing, and a small
sound-level indicator. The analysis is isolated in `audio-mechanic.js`, while
`Alice-Audio.js` connects the data to the shared scene.

The final audio scene begins inside a dark violet cave with a central campfire.
Clicking the fire reveals a psychedelic cave background over 2.5 seconds, then
five dancers enter with a short stagger. Overall volume changes their scale and
bounce, bass controls their jump height and the fire pulse, and treble controls
their sway and rotation. The scene respects the operating system's reduced
motion preference.

### Interaction instructions

1. Open the project through a local web server.
2. Select **Enable microphone** and allow microphone access.
3. Speak, clap, or play music. Louder sound enlarges the sun, bass lifts it,
   and high frequencies increase the clouds' movement.
4. Continue clicking the character and scene prompts to experience the story.
5. After entering the cave, click the campfire to reveal the audio-controlled
   dance. For direct testing, open the project with `?audioTest=1`.

### AI acknowledgement

OpenAI Codex was used to assist with debugging, modular integration, audio-data
mapping, and the generation of the transparent red-sun and cream-cloud image
assets. The team reviewed and adapted the resulting code. The audio code uses
`p5.AudioIn`, `p5.Amplitude`, and `p5.FFT`; comments in `audio-mechanic.js` and
`Alice-Audio.js` identify the assisted sections and explain their purpose.
