import { useCallback, useRef } from 'react'
import { useGameStore, GAME_STATES } from '../store/gameStore'

export default function MobileControls() {
  const {
    isMobile,
    jump,
    holdJump,
    releaseJump,
    duck,
    stopDuck,
    assMeter,
    mana,
    triggerAssFatality,
    shootAssTool,
    gameState
  } = useGameStore()

  const jumpIntervalRef = useRef(null)
  const isFatalityReady = assMeter >= 100 && gameState === GAME_STATES.COMBAT_PHASE
  const canAttack = mana >= 1

  const handleJumpStart = useCallback((e) => {
    e.preventDefault()
    // Prevent multiple simultaneous jumps (race condition on touch devices)
    if (jumpIntervalRef.current) return
    jump()
    jumpIntervalRef.current = setInterval(() => {
      holdJump()
    }, 16)
  }, [jump, holdJump])

  const handleJumpEnd = useCallback((e) => {
    e.preventDefault()
    releaseJump()
    if (jumpIntervalRef.current) {
      clearInterval(jumpIntervalRef.current)
      jumpIntervalRef.current = null
    }
  }, [releaseJump])

  const handleDuckStart = useCallback((e) => {
    e.preventDefault()
    duck()
  }, [duck])

  const handleDuckEnd = useCallback((e) => {
    e.preventDefault()
    stopDuck()
  }, [stopDuck])

  const handleAttack = useCallback((e) => {
    e.preventDefault()
    shootAssTool()
  }, [shootAssTool])

  const handleFatality = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    triggerAssFatality()
  }, [triggerAssFatality])

  if (!isMobile) return null

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      {/* Left side - DUCK BUTTON */}
      <div className="absolute bottom-24 left-8 pointer-events-auto">
        <button
          className="cursor-pointer select-none bg-gray-800/90 px-4 py-4 rounded-xl text-white tracking-wider shadow-xl 
                     hover:bg-gray-700 active:scale-95 transition-all border-2 border-purple-500/50
                     drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]"
          onTouchStart={handleDuckStart}
          onTouchEnd={handleDuckEnd}
          onMouseDown={handleDuckStart}
          onMouseUp={handleDuckEnd}
          onMouseLeave={handleDuckEnd}
        >
          <svg
            className="w-12 h-12"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
              strokeLinejoin="round"
              strokeLinecap="round"
            ></path>
          </svg>
          <span className="text-xs font-bold mt-1 block">DUCK</span>
        </button>
      </div>

      {/* Right side - JUMP & ATTACK BUTTONS */}
      <div className="absolute bottom-24 right-8 pointer-events-auto flex items-end gap-8">

        {/* ATTACK Button (Inner) */}
        <button
          className={`cursor-pointer select-none px-3 py-3 rounded-xl tracking-wider shadow-xl 
                     active:scale-95 transition-all border-2
                     ${canAttack
              ? 'bg-gray-800/90 text-white border-pink-500/50 drop-shadow-[0_0_15px_rgba(236,72,153,0.6)] hover:bg-gray-700'
              : 'bg-gray-600/50 text-gray-400 border-gray-500/30'}`}
          onTouchStart={handleAttack}
          onMouseDown={handleAttack}
          disabled={!canAttack}
        >
          <svg
            className="w-10 h-10"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 10V3L4 14h7v7l9-11h-7z"
              strokeLinejoin="round"
              strokeLinecap="round"
            ></path>
          </svg>
          <span className="text-xs font-bold mt-1 block">ATK</span>
        </button>

        {/* JUMP Button (Outer/Corner) */}
        <button
          className="cursor-pointer select-none bg-gray-800/90 px-4 py-4 rounded-xl text-white tracking-wider shadow-xl 
                     hover:bg-gray-700 active:scale-95 transition-all 
                     border-2 border-cyan-500/50 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]"
          onTouchStart={handleJumpStart}
          onTouchEnd={handleJumpEnd}
          onMouseDown={handleJumpStart}
          onMouseUp={handleJumpEnd}
          onMouseLeave={handleJumpEnd}
        >
          <svg
            className="w-12 h-12"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
              strokeLinejoin="round"
              strokeLinecap="round"
            ></path>
          </svg>
          <span className="text-xs font-bold mt-1 block">JUMP</span>
        </button>
      </div>

      {/* Center - ASS FATALITY button */}
      {isFatalityReady && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
          <button
            onClick={handleFatality}
            onTouchStart={handleFatality}
            className="w-32 h-32 rounded-full button-arcade flex flex-col items-center justify-center animate-pulse-neon"
          >
            <span className="text-4xl mb-1">🍑</span>
            <span className="text-xs font-pixel text-white">FATALITY!</span>
          </button>
        </div>
      )}
    </div>
  )
}
