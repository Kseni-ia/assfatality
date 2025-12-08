import { useGameStore } from '../store/gameStore'

export default function GameOverScreen() {
  const { score, reset, startGame } = useGameStore()

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#1a0000] via-[#330000] to-[#1a0000] flex flex-col items-center justify-center z-50">
      {/* Glitch effect particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-1 bg-red-500"
            style={{
              top: `${Math.random() * 100}%`,
              animation: `glitch ${0.5 + Math.random()}s ease-in-out infinite`,
              animationDelay: `${Math.random()}s`,
            }}
          />
        ))}
      </div>

      {/* Game Over text */}
      <div className="relative z-10 text-center">
        <h1 
          className="text-4xl md:text-6xl font-pixel text-red-500 mb-4"
          style={{
            textShadow: '0 0 10px #ff0000, 0 0 20px #ff0000, 0 0 40px #ff0000',
          }}
        >
          GAME OVER
        </h1>
        
        <div className="text-6xl mb-8 opacity-50">
          💀
        </div>

        <p className="text-sm font-pixel text-red-400 mb-2">SCORE</p>
        <p 
          className="text-3xl md:text-5xl font-pixel text-red-300 mb-8"
          style={{ textShadow: '0 0 10px #ff6666' }}
        >
          {score.toString().padStart(6, '0')}
        </p>

        <p className="text-xs font-pixel text-red-400/70 mb-12 max-w-xs mx-auto">
          The ASS has been defeated... But legends never truly die.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={startGame}
            className="px-8 py-4 rounded-lg font-pixel text-white text-sm hover:scale-105 transition-transform"
            style={{
              background: 'linear-gradient(180deg, #ff4444 0%, #cc0000 100%)',
              boxShadow: '0 4px 0 #660000, 0 6px 20px rgba(255, 0, 0, 0.5)',
            }}
          >
            TRY AGAIN
          </button>
          
          <button
            onClick={reset}
            className="px-8 py-3 rounded-lg font-pixel text-red-400 text-xs border border-red-400/50 hover:bg-red-500/20 transition-colors"
          >
            MAIN MENU
          </button>
        </div>
      </div>

      <style>{`
        @keyframes glitch {
          0%, 100% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            transform: translateX(100%);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}
