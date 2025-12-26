import { useGameStore } from '../store/gameStore'

export default function GameOverScreen() {
  const { score, reset, startGame, isMobile } = useGameStore()

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

      {/* Game Over text - compact for mobile, positioned lower */}
      <div className={`relative z-10 text-center px-4 ${isMobile ? 'mb-safe' : ''}`}>
        <h1
          className={`font-pixel text-red-500 ${isMobile ? 'text-2xl mb-1' : 'text-4xl md:text-6xl mb-4'}`}
          style={{
            textShadow: '0 0 10px #ff0000, 0 0 20px #ff0000, 0 0 40px #ff0000',
          }}
        >
          GAME OVER
        </h1>

        <div className={`opacity-50 ${isMobile ? 'text-3xl mb-2' : 'text-6xl mb-8'}`}>
          💀
        </div>

        <p className={`font-pixel text-red-400 ${isMobile ? 'text-[10px] mb-0.5' : 'text-sm mb-2'}`}>SCORE</p>
        <p
          className={`font-pixel text-red-300 ${isMobile ? 'text-xl mb-2' : 'text-3xl md:text-5xl mb-8'}`}
          style={{ textShadow: '0 0 10px #ff6666' }}
        >
          {score.toString().padStart(6, '0')}
        </p>

        <p className={`font-pixel text-red-400/70 max-w-xs mx-auto ${isMobile ? 'text-[9px] mb-3 leading-tight' : 'text-xs mb-12'}`}>
          The ASS has been defeated... But legends never truly die.
        </p>

        {/* Buttons - more compact on mobile */}
        <div className={`flex flex-col ${isMobile ? 'gap-1.5' : 'gap-4'}`}>
          <button
            onClick={startGame}
            className={`rounded-lg font-pixel text-white hover:scale-105 transition-transform ${isMobile ? 'px-6 py-2.5 text-[11px]' : 'px-8 py-4 text-sm'}`}
            style={{
              background: 'linear-gradient(180deg, #ff4444 0%, #cc0000 100%)',
              boxShadow: '0 4px 0 #660000, 0 6px 20px rgba(255, 0, 0, 0.5)',
            }}
          >
            TRY AGAIN
          </button>

          <button
            onClick={reset}
            className={`rounded-lg font-pixel text-red-400 border border-red-400/50 hover:bg-red-500/20 transition-colors ${isMobile ? 'px-6 py-1.5 text-[9px]' : 'px-8 py-3 text-xs'}`}
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
