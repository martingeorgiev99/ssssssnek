# ssssssnek 🐍

A modern (yet oldschool) Snake game built with TypeScript, D3, and SVG.

## Gameplay

- Control the snake using WASD or Arrow keys
- Eat food to grow longer and score points
- Pause with Space, restart with R
- Game ends if the snake hits itself or the border

## Food Types

- 🍒 Cherry: 100 points
- 🍄 Mushroom: 350 points (inverts controls for 30 seconds 🤢, don't worry, you can turn it off)
- 🍕 Pizza: 400 points (snake moves faster temporarily)

## Feature Status

- [x] Live score effects
- [x] LocalStorage score save
- [x] Fancier game over screen
- [x] Retro mode
- [x] Score and effect HUD
- [x] Responsive controls
- [x] SVG rendering and animations
- [x] Unit tests
- [x] Sound (menu, gameplay, 8bit game over)
- [ ] Dynamic background (grass waves, snake pushes it around)
- [ ] Food spawning algorithm
- [ ] Fancier game over screen

## Getting Started

- Install dependencies:
  ```sh
  bun install
  ```
- Run the game locally:
  ```sh
  bun run dev
  ```
  Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Development

- TypeScript for all logic
- D3 for rendering and animation
- Tests in `src/tests/`

---

## Usage of AI

I used AI to brainstorm some ideas, generate some part of the README, as well as drawing a fancier-looking snake with some advanced math operations.
The AI snake version is in a separate branch named `SmootherSnake`.
AI was also used to build the foundation of the tests.
Copilot tab completion was enabled.

---

## Possible known bugs

`Firefox`: Occasionally, when the snake is one block away from a food item, the page may become unresponsive and require a restart.

---
