import { useGameStore } from '../store/gameStore'

export default function MainMenu() {
  const { startGame } = useGameStore()

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-game-bg via-dark-purple to-game-bg">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-neon-pink rounded-full animate-float opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <div className="relative mb-12">
        <h1 className="text-4xl md:text-6xl lg:text-8xl font-pixel neon-text text-neon-pink tracking-wider">
          ASS
        </h1>
        <h2 className="text-3xl md:text-5xl lg:text-7xl font-pixel neon-text-blue text-neon-cyan mt-2">
          FATALITY
        </h2>
        
        {/* Peach artifact decoration */}
        <div className="absolute -right-8 -top-8 text-6xl animate-glow">
          🍑
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-xs md:text-sm font-pixel text-hot-pink mb-12 text-center px-4 opacity-80">
        Master the art of dodge. Unleash the power.
      </p>

      {/* Start button */}
      <button
        onClick={startGame}
        className="button-arcade px-8 py-4 md:px-12 md:py-6 rounded-lg font-pixel text-white text-sm md:text-lg hover:scale-105 transition-transform"
      >
        START GAME
      </button>

      {/* Controls hint */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-xs font-pixel text-neon-purple opacity-60 mb-2">
          DESKTOP: A/← DUCK • D/→ JUMP • SPACE FATALITY
        </p>
        <p className="text-xs font-pixel text-neon-purple opacity-60">
          MOBILE: LEFT TAP = DUCK • RIGHT TAP = JUMP
        </p>
      </div>

      {/* Version */}
      <div className="absolute bottom-2 right-4">
        <span className="text-xs font-pixel text-neon-purple opacity-40">v1.0</span>
      </div>
    </div>
  )
}
