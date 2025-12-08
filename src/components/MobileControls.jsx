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

  const handleFatality = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    triggerAssFatality()
  }, [triggerAssFatality])

  if (!isMobile) return null

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      {/* Left side - DUCK */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1/2 pointer-events-auto"
        onTouchStart={handleDuckStart}
        onTouchEnd={handleDuckEnd}
        onMouseDown={handleDuckStart}
        onMouseUp={handleDuckEnd}
        onMouseLeave={handleDuckEnd}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 to-transparent flex items-center justify-center">
          <div className="text-center opacity-50">
            <p className="text-4xl mb-2">👇</p>
            <p className="text-xs font-pixel text-neon-purple">DUCK</p>
          </div>
        </div>
      </div>

      {/* Right side - JUMP */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-auto"
        onTouchStart={handleJumpStart}
        onTouchEnd={handleJumpEnd}
        onMouseDown={handleJumpStart}
        onMouseUp={handleJumpEnd}
        onMouseLeave={handleJumpEnd}
      >
        <div className="absolute inset-0 bg-gradient-to-l from-neon-cyan/20 to-transparent flex items-center justify-center">
          <div className="text-center opacity-50">
            <p className="text-4xl mb-2">👆</p>
            <p className="text-xs font-pixel text-neon-cyan">JUMP</p>
          </div>
        </div>
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
