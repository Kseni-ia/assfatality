import { useGameStore } from '../store/gameStore'

export default function VictoryScreen() {
  const { score, reset, startGame } = useGameStore()

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-game-bg via-dark-purple to-game-bg flex flex-col items-center justify-center z-50">
      {/* Victory particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          >
            {['🍑', '💗', '✨', '⭐'][Math.floor(Math.random() * 4)]}
          </div>
        ))}
      </div>

      {/* Victory text */}
      <div className="relative z-10 text-center">
        <h1 className="text-4xl md:text-6xl font-pixel neon-text text-neon-pink mb-4 animate-pulse">
          VICTORY!
        </h1>
        
        <div className="text-6xl mb-8 animate-bounce">
          🍑✨🍑
        </div>

        <p className="text-sm font-pixel text-neon-purple mb-2">FINAL SCORE</p>
        <p className="text-3xl md:text-5xl font-pixel neon-text-blue text-neon-cyan mb-8">
          {score.toString().padStart(6, '0')}
        </p>

        <p className="text-xs font-pixel text-hot-pink mb-12 max-w-xs mx-auto">
          The power of the ASS has prevailed! The kolejiště is safe once more.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={startGame}
            className="button-arcade px-8 py-4 rounded-lg font-pixel text-white text-sm hover:scale-105 transition-transform"
          >
            PLAY AGAIN
          </button>
          
          <button
            onClick={reset}
            className="px-8 py-3 rounded-lg font-pixel text-neon-purple text-xs border border-neon-purple hover:bg-neon-purple/20 transition-colors"
          >
            MAIN MENU
          </button>
        </div>
      </div>

      {/* Frank victory pose */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="relative">
          {/* Simple Frank sprite */}
          <div className="text-center">
            <div className="relative inline-block">
              {/* Staff raised */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2">
                <div className="text-4xl animate-glow">🍑</div>
              </div>
              {/* Frank body simplified */}
              <div className="w-12 h-20 bg-white rounded-t-lg mx-auto" />
              <div className="w-8 h-8 bg-[#d4a574] rounded-full mx-auto -mt-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
