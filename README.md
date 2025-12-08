# 🍑 ASS FATALITY

A 2D side-scrolling action game built with React + Vite featuring pixel art aesthetics and neon retro styling.

## 🎮 Gameplay

You play as **Frank Wild**, a young sensei with brown spiky hair, wielding a staff with a mystical pink peach artifact. Navigate through a railway environment, dodge obstacles, and defeat enemies using the legendary **ASS FATALITY** technique!

### Controls

**Desktop:**
- `A` / `←` - DUCK (avoid HIGH attacks)
- `D` / `→` - JUMP (avoid LOW attacks, hold for higher jump)
- `SPACE` - Trigger ASS FATALITY (when meter is full)

**Mobile:**
- Left half of screen - TAP to DUCK
- Right half of screen - TAP to JUMP (hold for higher)
- Center button - ASS FATALITY (appears when ready)

### Mechanics

- **ASS METER**: Fills by successfully dodging attacks
  - +15% normal dodge
  - +25% perfect dodge (last-moment timing)
  - +5% passive per second
  - -15% when hit
  
- **Enemies** (in order):
  1. Fat guy with chain (HIGH attacks) - Fast
  2. Tall guy with machete (LOW attacks) - Slow
  3. Boss with nunchaku (MIXED attacks) - Fastest, combos

- **ASS FATALITY**: Rhythm mini-game that summons twerking blondes who shoot pink projectiles!

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎨 Replacing Sprites

The game is designed to accept GIF sprites. To add your custom sprites:

1. Place your GIF files in `/public/sprites/`
2. Update the sprite references in the game components
3. GIF format is fully supported for animated sprites

## 🛠 Tech Stack

- React 18
- Vite
- Tailwind CSS
- Zustand (state management)
- Canvas API (game rendering)

## 📱 Features

- Responsive design (mobile + desktop)
- Touch controls for mobile
- Neon retro aesthetic
- Particle effects
- Screen shake effects
- Slow-motion on perfect dodges
- Combo system

## 🎯 Future Enhancements

- Firebase Firestore leaderboard
- Additional levels
- More enemy types
- Sound effects and music
- Save progress
