import { useEffect, useState, useCallback, useRef } from 'react'
import { useGameStore } from '../store/gameStore'

export default function AssFatalityMinigame() {
  const { 
    fatalityTargets, 
    fatalityScore, 
    hitFatalityTarget, 
    completeFatality,
    blondesCount 
  } = useGameStore()
  
  const [targets, setTargets] = useState([])
  const [phase, setPhase] = useState('intro') // intro, rhythm, blondes, projectiles
  const [hitZoneActive, setHitZoneActive] = useState(false)
  const animationRef = useRef(null)
  const startTimeRef = useRef(null)

  // Initialize rhythm game
  useEffect(() => {
    if (phase !== 'intro') return
    
    const timer = setTimeout(() => {
      setPhase('rhythm')
      startTimeRef.current = Date.now()
    }, 2000)

    return () => clearTimeout(timer)
  }, [phase])

  // Animate targets
  useEffect(() => {
    if (phase !== 'rhythm') return

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current
      
      const updatedTargets = fatalityTargets.map((target, i) => {
        const targetElapsed = elapsed - target.delay
        if (targetElapsed < 0) return { ...target, x: -100, visible: false }
        
        const progress = targetElapsed / 2000 // 2 seconds to cross
        const x = progress * 800 - 100

        return {
          ...target,
          x,
          visible: progress >= 0 && progress <= 1,
          inZone: x >= 300 && x <= 400,
        }
      })

      setTargets(updatedTargets)

      // Check if all targets have passed
      const allPassed = updatedTargets.every(t => t.x > 500 || t.hit)
      if (allPassed && elapsed > 4000) {
        setPhase('blondes')
        return
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [phase, fatalityTargets])

  // Blondes phase
  useEffect(() => {
    if (phase !== 'blondes') return

    const timer = setTimeout(() => {
      setPhase('projectiles')
    }, 2000)

    return () => clearTimeout(timer)
  }, [phase])

  // Projectiles phase
  useEffect(() => {
    if (phase !== 'projectiles') return

    const timer = setTimeout(() => {
      completeFatality()
    }, 2000)

    return () => clearTimeout(timer)
  }, [phase, completeFatality])

  const handleTap = useCallback(() => {
    if (phase !== 'rhythm') return

    setHitZoneActive(true)
    setTimeout(() => setHitZoneActive(false), 100)

    // Find target in hit zone
    const hitTarget = targets.find(t => t.inZone && !t.hit)
    if (hitTarget) {
      const centerDist = Math.abs(hitTarget.x - 350)
      const timing = centerDist < 20 ? 'perfect' : 'good'
      hitFatalityTarget(hitTarget.id, timing)
    }
  }, [phase, targets, hitFatalityTarget])

  // Keyboard support
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        handleTap()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleTap])

  const blondesArray = Array(Math.max(blondesCount, Math.ceil(fatalityScore / 3))).fill(null)

  return (
    <div 
      className="absolute inset-0 bg-game-bg/95 z-50 flex flex-col items-center justify-center"
      onClick={handleTap}
      onTouchStart={handleTap}
    >
      {/* Intro phase */}
      {phase === 'intro' && (
        <div className="text-center animate-pulse">
          <h1 className="text-4xl md:text-6xl font-pixel neon-text text-neon-pink mb-4">
            ASS FATALITY
          </h1>
          <p className="text-lg font-pixel text-neon-cyan animate-bounce">
            🍑 GET READY! 🍑
          </p>
          <div className="mt-8 text-6xl animate-glow">🍑</div>
        </div>
      )}

      {/* Rhythm phase */}
      {phase === 'rhythm' && (
        <div className="relative w-full h-full">
          {/* Background beat visualization */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="w-4 mx-1 bg-neon-pink rounded-full animate-pulse"
                style={{
                  height: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>

          {/* Hit zone */}
          <div 
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-4 rounded-full transition-all duration-100 ${
              hitZoneActive 
                ? 'border-neon-cyan bg-neon-cyan/30 scale-110' 
                : 'border-neon-pink'
            }`}
          >
            <div className="absolute inset-2 border-2 border-neon-pink rounded-full animate-pulse" />
          </div>

          {/* Targets */}
          {targets.map((target, i) => (
            target.visible && !target.hit && (
              <div
                key={target.id}
                className="absolute top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center"
                style={{ left: `${(target.x / 800) * 100}%` }}
              >
                <div className={`text-4xl ${target.inZone ? 'animate-bounce' : ''}`}>
                  🍑
                </div>
              </div>
            )
          ))}

          {/* Hit indicators */}
          {targets.map((target) => (
            target.hit && (
              <div
                key={`hit-${target.id}`}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 comic-text"
              >
                <span className={`text-2xl font-pixel ${
                  target.timing === 'perfect' ? 'neon-text-blue text-neon-cyan' : 'neon-text text-neon-pink'
                }`}>
                  {target.timing === 'perfect' ? 'PERFECT!' : 'GOOD!'}
                </span>
              </div>
            )
          ))}

          {/* Instructions */}
          <div className="absolute bottom-20 left-0 right-0 text-center">
            <p className="text-sm font-pixel text-neon-purple animate-pulse">
              TAP when 🍑 enters the zone!
            </p>
          </div>

          {/* Score */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2">
            <p className="text-xs font-pixel text-neon-purple">HITS</p>
            <p className="text-2xl font-pixel neon-text text-neon-pink text-center">
              {fatalityScore}/10
            </p>
          </div>
        </div>
      )}

      {/* Blondes phase */}
      {phase === 'blondes' && (
        <div className="text-center">
          <h2 className="text-2xl font-pixel neon-text text-neon-pink mb-8">
            TWERK SQUAD SUMMONED!
          </h2>
          <div className="flex gap-8 justify-center">
            {blondesArray.map((_, i) => (
              <div key={i} className="relative animate-bounce">
                {/* Blonde character */}
                <div className="relative">
                  {/* Body */}
                  <div className="w-16 h-24 bg-gradient-to-b from-hot-pink to-neon-pink rounded-t-full relative">
                    {/* Head */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                      <div className="w-12 h-12 bg-[#d4a574] rounded-full" />
                      {/* Blonde hair */}
                      <div className="absolute -top-2 left-0 right-0 h-8 bg-yellow-300 rounded-t-full" />
                    </div>
                    {/* Legs in pink leggings */}
                    <div className="absolute -bottom-12 left-2 w-5 h-16 bg-hot-pink rounded-b-full" />
                    <div className="absolute -bottom-12 right-2 w-5 h-16 bg-hot-pink rounded-b-full" />
                  </div>
                </div>
                {/* Twerk lines */}
                <div className="absolute -left-4 top-12 text-neon-pink animate-ping">~</div>
                <div className="absolute -right-4 top-12 text-neon-pink animate-ping">~</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projectiles phase */}
      {phase === 'projectiles' && (
        <div className="relative w-full h-full overflow-hidden">
          {/* Pink projectiles flying */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl"
              style={{
                left: `${-20 + (i * 3)}%`,
                top: `${20 + Math.sin(i) * 30}%`,
                animation: `projectile ${0.5 + i * 0.1}s ease-out forwards`,
              }}
            >
              💗
            </div>
          ))}
          
          {/* Explosion text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center comic-text">
              <h1 className="text-6xl font-pixel neon-text text-neon-pink mb-4">
                BOOM!
              </h1>
              <p className="text-xl font-pixel text-neon-cyan">
                ENEMIES DESTROYED!
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes projectile {
          0% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateX(150vw) scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
