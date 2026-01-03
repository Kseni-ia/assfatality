import { useGameStore, GAME_STATES } from '../store/gameStore'

export default function HUD() {
  const {
    hp,
    score,
    assMeter,
    gameState,
    comboCount,
    defeatedEnemies,
    mana,
    maxMana,
    enemyHealth,
    currentEnemyType,
    ultimatePhase
  } = useGameStore()

  const isFatalityReady = assMeter >= 100 && gameState === GAME_STATES.COMBAT_PHASE
  const isManaFull = mana >= maxMana
  const showManaBar = gameState === GAME_STATES.COMBAT_PHASE
  const showCombatHUD = gameState === GAME_STATES.COMBAT_PHASE || gameState === GAME_STATES.COMBAT_INTRO || gameState === GAME_STATES.ASS_FATALITY || gameState === GAME_STATES.VICTORY

  return (
    <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none z-40 h-full font-sans">

      {/* --- REIMAGINED TOP HUD (Modern Mortal Kombat Style) --- */}
      <div className="flex justify-between items-start w-full px-2 pt-2">

        {/* LEFT: FRANK (Player 1) */}
        <div className="flex flex-col w-[42%] max-w-[800px] relative group">
          {/* Info Text Row */}
          <div className="flex justify-between items-end mb-1 px-2 relative z-10">
            <span className="text-white font-black text-lg md:text-xl tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center gap-2">
              <span className="text-emerald-400 text-2xl">⚡</span> FRANK
            </span>
            <span className="text-xs font-bold text-gray-300 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">SCORE: {score.toLocaleString()}</span>
          </div>

          {/* Health Bar Frame */}
          <div className="relative h-6 md:h-8 bg-gray-900/60 backdrop-blur-xl rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)] transform -skew-x-12 origin-top-left overflow-hidden">
            {/* Dark Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMjIyIiAvPgo8cGF0aCBkPSJNMCA0TDQgMFY0SDBaIiBmaWxsPSIjMzMzIiAvPjwvc3ZnPg==')] opacity-50" />

            {/* Background Damage Red (Underlay) */}
            <div className="absolute inset-0 bg-red-900/40" />

            {/* ACTUAL HEALTH FILL - EMERALD GRADIENT */}
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-400 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              style={{ width: `${(hp / 3) * 100}% ` }}
            >
              {/* Inner Shine/Pulse */}
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>

            {/* Top Gloss Overlay */}
            <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
          </div>

          {/* MANA HEARTS (Replacement for Bar) */}
          {showManaBar && (
            <div className="flex absolute top-6 -left-16 z-30 pointer-events-none">
              {[...Array(6)].map((_, i) => {
                const fillAmount = Math.max(0, Math.min(1, mana - i))
                return (
                  <div
                    key={i}
                    className={`relative w-32 h-32 md:w-56 md:h-56 shrink-0 ${i > 0 ? '-ml-14 md:-ml-36' : ''}`}
                    style={{ zIndex: 6 - i }}
                  >
                    {/* Grey Background Heart */}
                    <img
                      src="/sprites/tool/barTool.png"
                      alt="mana slot"
                      className="absolute inset-0 w-full h-full object-contain filter grayscale opacity-50"
                    />
                    {/* Filling Colorful Heart */}
                    <img
                      src="/sprites/tool/barTool.png"
                      alt="mana fill"
                      className="absolute inset-0 w-full h-full object-contain"
                      style={{ clipPath: `inset(0 ${(1 - fillAmount) * 100}% 0 0)` }}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* CENTER: VS & TIMER */}
        <div className="flex flex-col items-center justify-start -mt-1 z-20">
          <div className="relative">
            <div className="text-amber-400 font-black text-3xl md:text-4xl italic tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]" style={{ textShadow: '0 0 20px rgba(251, 191, 36, 0.6)' }}>
              VS
            </div>
          </div>

          {/* Round Indicators (Modern Pills) */}
          <div className="flex gap-1 mt-2 p-1 bg-black/40 backdrop-blur rounded-full">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w - 2 h - 2 rounded - full transition - all duration - 300 ${i < defeatedEnemies
                  ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e] scale-110'
                  : 'bg-gray-600'
                  } `}
              />
            ))}
          </div>
        </div>

        {/* RIGHT: ENEMY (Player 2) */}
        <div className="flex flex-col w-[42%] max-w-[800px] items-end relative group">
          {showCombatHUD && currentEnemyType ? (
            <>
              <div className="flex justify-between items-end mb-1 px-2 w-full relative z-10 flex-row-reverse">
                <span className="text-white font-black text-lg md:text-xl tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-right flex items-center gap-2 flex-row-reverse">
                  <span className="text-rose-500">{currentEnemyType.name}</span> <span className="text-rose-600 text-2xl">💀</span>
                </span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Enemy</span>
              </div>

              {/* Health Bar Frame - Mirrored */}
              <div className="relative w-full h-6 md:h-8 bg-gray-900/60 backdrop-blur-xl rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)] transform skew-x-12 origin-top-right overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMjIyIiAvPgo8cGF0aCBkPSJNMCA0TDQgMFY0SDBaIiBmaWxsPSIjMzMzIiAvPjwvc3ZnPg==')] opacity-50" />

                <div className="absolute inset-0 bg-red-950/50" />

                {/* ENEMY HEALTH FILL - ROSE/RED GRADIENT (Right Anchor) */}
                <div
                  className="absolute inset-y-0 right-0 bg-gradient-to-l from-rose-600 via-rose-500 to-red-500 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                  style={{ width: `${(enemyHealth / currentEnemyType.health) * 100}% ` }}
                />

                {/* Top Gloss */}
                <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
              </div>
            </>
          ) : (
            <div className="text-gray-500 font-bold text-sm mt-4 bg-black/30 px-3 py-1 rounded backdrop-blur">WAITING FOR CHALLENGER...</div>
          )}
        </div>

      </div>

      {/* --- CENTER OVERLAYS --- */}

      {/* ULTIMATE ICON (Refined "Ultimate Tool" Design) */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center z-30 pointer-events-none">

        {/* VISIBILITY UPDATE: Now appears exactly when mana bars appear (Combat Intro & Phase) */}
        {showManaBar && ultimatePhase === 'none' && (
          <div className="relative flex items-center justify-center">

            {/* 1. Underlying "Portal" Ground Glow (Only when fully ready) */}
            {isFatalityReady && (
              <div className="absolute -bottom-8 w-40 h-12 bg-fuchsia-500/50 rounded-[100%] blur-[20px] animate-pulse" />
            )}

            {/* 2. God-Ray Aura (Only when fully ready) */}
            {isFatalityReady && (
              <div className="absolute w-40 h-40 bg-gradient-to-t from-purple-600 via-fuchsia-500 to-transparent opacity-30 rounded-full blur-xl animate-spin-slow" />
            )}

            {/* 3. The Icon Container - PUMPING ANIMATION on meter gain */}
            <div
              key={assMeter} // Triggers animation on change
              className={`relative w-28 h-28 md:w-36 md:h-36 transition-all duration-300 ${isFatalityReady ? 'scale-110 animate-pulse-neon' : assMeter > 0 ? 'animate-bounce-short' : ''}`}
            >

              {/* Electric Shockwaves (Only when ready) */}
              {isFatalityReady && (
                <>
                  <div className="absolute inset-[-10px] border-4 border-fuchsia-400/30 rounded-full blur-[2px] animate-ping" style={{ animationDuration: '2s' }} />
                  <div className="absolute inset-[-20px] border-2 border-purple-500/20 rounded-full blur-[4px] animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
                </>
              )}

              {/* Inactive Silhouette (Always visible background - GREY) */}
              <img
                src="/sprites/tool/ultimateTool.png"
                alt="Ultimate Frame"
                className="absolute inset-0 w-full h-full object-contain filter grayscale opacity-50 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
              />

              {/* Filling Active State (The Core - COLORED) */}
              {assMeter > 0 && (
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src="/sprites/tool/ultimateTool.png"
                    alt="Ultimate Fill"
                    className={`absolute inset-0 w-full h-full object-contain transition-all duration-200 ${isFatalityReady
                      ? 'filter brightness-125 saturate-150 drop-shadow-[0_0_15px_#d946ef] drop-shadow-[0_0_30px_#a855f7]'
                      : ''
                      }`}
                    style={{
                      clipPath: `inset(${(1 - (Math.min(assMeter, 100) / 100)) * 100}% 0 0 0)`,
                    }}
                  />
                </div>
              )}

              {/* Inner Energy Crackle (Overlay - Only when ready) */}
              {isFatalityReady && (
                <div className="absolute inset-0 w-full h-full mix-blend-overlay opacity-70">
                  <div className="w-full h-full bg-gradient-to-tr from-white/0 via-white/50 to-white/0 animate-pulse" style={{ transform: 'rotate(45deg)' }} />
                </div>
              )}

            </div>

            {/* 4. Floating Particles (Sparkles - Only when ready) */}
            {isFatalityReady && (
              <>
                <div className="absolute -top-4 -right-4 w-2 h-2 bg-fuchsia-300 rounded-full animate-bounce shadow-[0_0_10px_#f0abfc]" style={{ animationDuration: '1.5s' }} />
                <div className="absolute top-10 -left-6 w-1 h-1 bg-purple-300 rounded-full animate-pulse shadow-[0_0_5px_#d8b4fe]" style={{ animationDuration: '0.8s' }} />
                <div className="absolute -bottom-2 right-8 w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce shadow-[0_0_8px_#f472b6]" style={{ animationDuration: '2.2s', animationDelay: '0.5s' }} />
              </>
            )}

          </div>
        )}
      </div>

      {/* Combo counter */}
      {comboCount > 1 && (
        <div className="absolute top-40 right-4 animate-pulse pointer-events-none transform -rotate-6">
          <p className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_4px_0_rgba(0,0,0,1)]">
            {comboCount} HIT
          </p>
          <p className="text-sm font-bold text-yellow-400 tracking-widest text-right">COMBO!</p>
        </div>
      )}
    </div>
  )
}
