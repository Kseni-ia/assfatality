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
    currentEnemyType
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
        <div className="flex flex-col w-[42%] max-w-[450px] relative group">
          {/* Info Text Row */}
          <div className="flex justify-between items-end mb-1 px-2 relative z-10">
            <span className="text-white font-black text-lg md:text-xl tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center gap-2">
              <span className="text-emerald-400 text-2xl">⚡</span> FRANK
            </span>
            <span className="text-xs font-bold text-gray-300 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">SCORE: {score.toLocaleString()}</span>
          </div>

          {/* Health Bar Frame */}
          <div className="relative h-6 md:h-8 bg-gray-900/80 backdrop-blur border border-gray-600 rounded-sm shadow-[0_4px_10px_rgba(0,0,0,0.5)] transform -skew-x-12 origin-top-left overflow-hidden ring-1 ring-white/10">
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

          {/* MANA BAR (Sub-bar) */}
          {showManaBar && (
            <div className="relative h-2 md:h-3 w-[75%] mt-1 ml-1 transform -skew-x-12 origin-top-left overflow-hidden rounded-sm shadow bg-gray-900/60 border border-cyan-500/50">
              <div
                className={`absolute inset-y-0 left-0 transition-all duration-200 ${isManaFull ? 'bg-gradient-to-r from-cyan-300 to-blue-400 shadow-[0_0_15px_rgba(34,211,238,1)] animate-pulse' : 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_8px_rgba(6,182,212,0.6)]'}`}
                style={{ width: `${(mana / maxMana) * 100}%` }}
              />
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
        <div className="flex flex-col w-[42%] max-w-[450px] items-end relative group">
          {showCombatHUD && currentEnemyType ? (
            <>
              <div className="flex justify-between items-end mb-1 px-2 w-full relative z-10 flex-row-reverse">
                <span className="text-white font-black text-lg md:text-xl tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-right flex items-center gap-2 flex-row-reverse">
                  <span className="text-rose-500">{currentEnemyType.name}</span> <span className="text-rose-600 text-2xl">💀</span>
                </span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Enemy</span>
              </div>

              {/* Health Bar Frame - Mirrored */}
              <div className="relative w-full h-6 md:h-8 bg-gray-900/80 backdrop-blur border border-gray-600 rounded-sm shadow-[0_4px_10px_rgba(0,0,0,0.5)] transform skew-x-12 origin-top-right overflow-hidden ring-1 ring-white/10">
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

      {/* ASS METER (Modernized) */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-64 md:w-80 flex flex-col items-center">
        {assMeter > 0 && (
          <div className={`relative w - full h - 2 rounded - full bg - gray - 900 / 80 backdrop - blur border border - purple - 500 / 30 overflow - hidden ${isFatalityReady ? 'shadow-[0_0_20px_#a855f7]' : ''} `}>
            <div
              className={`absolute inset - y - 0 left - 0 transition - all duration - 300 ${isFatalityReady ? 'bg-gradient-to-r from-purple-500 via-fuchsia-400 to-purple-500 animate-pulse' : 'bg-purple-800'} `}
              style={{ width: `${assMeter}% ` }}
            />
          </div>
        )}
        {/* Removed FATALITY READY text as per request */}
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
