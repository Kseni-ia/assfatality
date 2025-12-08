import { useGameStore, GAME_STATES } from '../store/gameStore'

export default function HUD() {
  const { hp, score, assMeter, gameState, comboCount, defeatedEnemies, lastHitHeart, mana, maxMana } = useGameStore()
  const isFatalityReady = assMeter >= 100 && gameState === GAME_STATES.COMBAT_PHASE
  const isManaFull = mana >= maxMana
  const showManaBar = gameState === GAME_STATES.COMBAT_PHASE

  return (
    <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none z-40 h-full">
      {/* Top bar */}
      <div className="flex justify-between items-start w-full">
        {/* HP Hearts */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => {
              const isLost = i >= hp
              const isJustLost = i === lastHitHeart
              return (
                <div
                  key={i}
                  className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-2xl transition-all duration-500 ${isLost
                      ? 'scale-75 opacity-30 grayscale'
                      : 'scale-100 opacity-100'
                    } ${isJustLost ? 'animate-heart-break' : ''}`}
                >
                  <span className={!isLost ? 'animate-pulse' : ''}>❤️</span>
                </div>
              )
            })}
          </div>

          {/* Mana Bar - only during combat */}
          {showManaBar && (
            <div className="w-32 md:w-40 mt-1">
              <p className="text-xs font-pixel text-cyan-400 mb-1 text-shadow-sm">MANA</p>
              <div className="relative h-4 md:h-5 bg-gray-800 rounded overflow-hidden border-2 border-cyan-600">
                {/* Mana fill */}
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-100 ${isManaFull ? 'animate-pulse' : ''
                    }`}
                  style={{
                    width: `${(mana / maxMana) * 100}%`,
                    background: isManaFull
                      ? 'linear-gradient(90deg, #00ffff, #0088ff, #00ffff)'
                      : 'linear-gradient(90deg, #0066cc, #0099ff)',
                    boxShadow: isManaFull ? '0 0 10px #00ffff, 0 0 20px #00ffff' : 'none',
                  }}
                />
              </div>
              {/* Press A indicator when mana is full */}
              {isManaFull && (
                <div className="mt-1 animate-bounce">
                  <p className="text-xs font-pixel text-cyan-400" style={{ textShadow: '0 0 10px #00ffff' }}>
                    Press A!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Score */}
        <div className="text-right pointer-events-auto">
          <p className="text-xs font-pixel text-neon-purple opacity-70">SCORE</p>
          <p className="text-lg md:text-2xl font-pixel neon-text text-neon-pink">
            {score.toString().padStart(6, '0')}
          </p>
        </div>
      </div>

      {/* Center Top Elements Container - Positioned absolutely relative to the screen width to avoid layout shifts */}

      {/* Enemy counter */}
      {gameState === GAME_STATES.COMBAT_PHASE && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <p className="text-[10px] md:text-xs font-pixel text-neon-purple text-center mb-1">ENEMIES</p>
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 md:w-4 md:h-4 rounded-full border-2 transition-all ${i < defeatedEnemies
                    ? 'bg-neon-pink border-neon-pink shadow-[0_0_5px_#ff00ff]'
                    : 'border-neon-purple bg-black/50'
                  }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ASS METER */}
      <div className="absolute top-12 md:top-14 left-1/2 -translate-x-1/2 w-64 md:w-80 flex flex-col items-center">
        <p className="text-[10px] md:text-xs font-pixel text-center text-neon-purple mb-1">
          ASS METER
        </p>

        <div className="relative w-full h-5 md:h-6 bg-dark-purple rounded-full overflow-hidden border-2 border-neon-purple shadow-[0_0_10px_rgba(139,0,255,0.3)]">
          {/* Meter fill */}
          <div
            className={`absolute inset-y-0 left-0 transition-all duration-200 ${isFatalityReady ? 'meter-glow animate-pulse-neon' : ''
              }`}
            style={{
              width: `${assMeter}%`,
              background: isFatalityReady
                ? 'linear-gradient(90deg, #ff00ff, #ff69b4, #ff00ff)'
                : 'linear-gradient(90deg, #8b00ff, #ff00ff)',
            }}
          />

          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="text-[10px] font-pixel text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {Math.floor(assMeter)}%
            </span>
          </div>
        </div>

        {/* Fatality ready indicator */}
        {isFatalityReady && (
          <div className="text-center mt-2 animate-bounce">
            <p className="text-[10px] md:text-xs font-pixel neon-text text-neon-pink whitespace-nowrap">
              🍑 PRESS SPACE / CENTER 🍑
            </p>
          </div>
        )}
      </div>

      {/* Combo counter - Moved lower to avoid overlap */}
      {comboCount > 1 && (
        <div className="absolute top-24 right-4 animate-pulse pointer-events-none">
          <p className="text-sm font-pixel neon-text-blue text-neon-cyan">
            {comboCount}x COMBO!
          </p>
        </div>
      )}
    </div>
  )
}
