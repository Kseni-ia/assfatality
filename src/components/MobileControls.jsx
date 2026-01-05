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
    triggerAssFatality,
    shootAssTool,
    gameState
  } = useGameStore()

  const jumpIntervalRef = useRef(null)
  const isFatalityReady = assMeter >= 100 && gameState === GAME_STATES.COMBAT_PHASE

  const handleJumpStart = useCallback((e) => {
    e.preventDefault()
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
          className="w-24 h-24 active:scale-95 transition-transform opacity-70 active:opacity-100"
          onTouchStart={handleDuckStart}
          onTouchEnd={handleDuckEnd}
          onMouseDown={handleDuckStart}
          onMouseUp={handleDuckEnd}
          onMouseLeave={handleDuckEnd}
        >
          {/* Outer Ring Glow */}
          <div className="absolute inset-[-10px] rounded-full bg-purple-500/20 blur-xl opacity-0 active:opacity-100 transition-opacity" />
          <img
            src="/sprites/tool/duckP.svg"
            alt="Duck"
            className="w-full h-full drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] filter brightness-110 active:brightness-125"
          />
        </button>
      </div>

      {/* Right side - JUMP & ATTACK BUTTONS */}
      <div className="absolute bottom-24 right-8 pointer-events-auto flex items-end gap-6">

        {/* ATTACK Button (Inner) */}
        <button
          className="w-20 h-20 mb-2 active:scale-95 transition-transform opacity-70 active:opacity-100"
          onTouchStart={handleAttack}
          onMouseDown={handleAttack}
        >
          {/* Outer Ring Glow */}
          <div className="absolute inset-[-10px] rounded-full bg-pink-500/20 blur-xl opacity-0 active:opacity-100 transition-opacity" />
          <img
            src="/sprites/tool/attackP.svg"
            alt="Attack"
            className="w-full h-full drop-shadow-[0_0_15px_rgba(236,72,153,0.8)] filter brightness-110 active:brightness-125"
          />
        </button>

        {/* JUMP Button (Outer/Corner) */}
        <button
          className="w-24 h-24 active:scale-95 transition-transform opacity-70 active:opacity-100"
          onTouchStart={handleJumpStart}
          onTouchEnd={handleJumpEnd}
          onMouseDown={handleJumpStart}
          onMouseUp={handleJumpEnd}
          onMouseLeave={handleJumpEnd}
        >
          {/* Outer Ring Glow */}
          <div className="absolute inset-[-10px] rounded-full bg-cyan-500/20 blur-xl opacity-0 active:opacity-100 transition-opacity" />
          <img
            src="/sprites/tool/jumpP.svg"
            alt="Jump"
            className="w-full h-full drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] filter brightness-110 active:brightness-125"
          />
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
