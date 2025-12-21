import { COMBAT_SCALE } from '../../config/settings'
import { GAME_STATES } from '../../store/gameStore'

export function EnemyHealthBar({ currentEnemyType, enemyX, enemyHealth, groundY, enemySpriteSize }) {
  if (!currentEnemyType) return null

  // Adjusted top position to be closer to the character's actual head
  // The sprite frame has empty space at the top, so we push the bar down significantly
  const barTop = groundY - enemySpriteSize * 0.9

  return (
    <div className="absolute pointer-events-none" style={{ left: enemyX + enemySpriteSize * 0.2, top: barTop, width: enemySpriteSize * 0.6 }}>
      <div className="text-center text-white text-[10px] mb-1 opacity-90 shadow-sm" style={{ fontFamily: '"Press Start 2P", cursive' }}>
        {currentEnemyType.name}
      </div>
      <div className="bg-gray-800 h-2 md:h-3 rounded overflow-hidden border border-gray-600">
        <div className="h-full bg-red-500 transition-all duration-200" style={{ width: `${(enemyHealth / currentEnemyType.health) * 100}%` }} />
      </div>
    </div>
  )
}

export function Announcements({ showLeaderAnnouncement, showFightText }) {
  if (showLeaderAnnouncement) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 100 }}>
        <div className="text-6xl font-bold text-yellow-400 animate-bounce" style={{ fontFamily: '"Press Start 2P", cursive', textShadow: '0 0 20px #ff8800' }}>
          LEADER!
        </div>
      </div>
    )
  }
  if (showFightText) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 100 }}>
        <div className="text-6xl font-bold text-red-500 animate-pulse" style={{ fontFamily: '"Press Start 2P", cursive', textShadow: '0 0 20px #ff0000' }}>
          FIGHT!
        </div>
      </div>
    )
  }
  return null
}

export function AttackLoadingBar({ attackWarning, attackActive, gameState, enemyX, groundY, enemySpriteSize, windupProgress, currentEnemyType }) {
  if (!attackWarning || attackActive || gameState !== GAME_STATES.COMBAT_PHASE) return null

  // Positioned lower to avoid the top HUD
  const barTop = groundY - enemySpriteSize * 0.8

  // For Leader, hide the prompt until the bar is halfway full
  const showPrompt = currentEnemyType?.id !== 'leader' || windupProgress > 0.5

  return (
    <div className="absolute pointer-events-none" style={{ left: enemyX + enemySpriteSize * 0.2, top: barTop, width: enemySpriteSize * 0.6, zIndex: 60 }}>
      <div className={`text-lg font-bold text-center mb-1 transition-opacity duration-200 ${showPrompt ? 'opacity-100' : 'opacity-0'}`} style={{ fontFamily: '"Press Start 2P", cursive', color: '#ffff00', textShadow: '0 0 5px #ffff00' }}>
        {attackWarning.type === 'HIGH' ? '⬇️ DUCK!' : '⬆️ JUMP!'}
      </div>
      <div className="relative h-3 md:h-4 rounded overflow-hidden" style={{ background: 'rgba(0,0,0,0.8)', border: '2px solid #ffff00' }}>
        <div className="h-full" style={{
          width: `${windupProgress * 100}%`,
          background: windupProgress < 0.6 ? 'linear-gradient(90deg, #00ff00, #88ff00)' : windupProgress < 0.85 ? 'linear-gradient(90deg, #ffff00, #ffaa00)' : 'linear-gradient(90deg, #ff6600, #ff0000)',
          transition: 'width 0.05s linear',
        }} />
      </div>
      <div className="text-center mt-0.5 text-[10px]" style={{ fontFamily: '"Press Start 2P", cursive', color: windupProgress > 0.85 ? '#ff0000' : '#fff' }}>
        {Math.round(windupProgress * 100)}%
      </div>
    </div>
  )
}

// New component for hit feedback
export function DamageOverlay({ isInvincible }) {
  if (!isInvincible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{
      background: 'rgba(255, 0, 0, 0.5)', // Strong red flash
      zIndex: 60,
      animation: 'flash-red 0.1s ease-in-out infinite alternate',
    }}>
      <style jsx>{`
        @keyframes flash-red {
          from { opacity: 0.3; }
          to { opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}

export function AttackDangerZone({ attackActive, gameState, attackWarning, playerX, enemyX, groundY, frankSpriteSize, isDucking, isJumping, currentEnemyType }) {
  if (!attackActive || gameState !== GAME_STATES.COMBAT_PHASE) return null

  // Determine if player is successfully avoiding the attack
  const isSafe = (attackWarning?.type === 'HIGH' && isDucking) ||
    (attackWarning?.type === 'LOW' && isJumping)

  // Colors based on safety
  // Green if safe, Red if unsafe (vulnerable)
  const backgroundOverlay = isSafe ? 'rgba(0, 255, 0, 0.25)' : 'rgba(255, 0, 0, 0.35)' // Increased red opacity

  // Check if Duca is attacking for special visual
  const isDuca = currentEnemyType?.id === 'duca';

  return (
    <>
      {/* Full screen tint - ONLY this remains as requested */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: backgroundOverlay,
        zIndex: 30,
        transition: 'background 0.2s',
      }} />

      {/* Duca's Chain Whip Effect */}
      {isDuca && (
        <div className="absolute pointer-events-none" style={{
          left: 0,
          top: groundY - 260,
          width: '100%',
          height: 40,
          overflow: 'hidden',
          zIndex: 50,
        }}>
          {/* Animated chain that moves from Enemy to Frank and beyond */}
          <div style={{
            position: 'absolute',
            left: enemyX,
            top: 0,
            width: '1000px',
            height: '14px',
            background: 'repeating-linear-gradient(90deg, #b0c4de, #b0c4de 15px, #4a5568 15px, #4a5568 20px)',
            border: '2px solid #e2e8f0',
            boxShadow: '0 0 10px #a0aec0, inset 0 0 5px #2d3748',
            transformOrigin: 'left center',
            animation: 'chain-whip 0.4s cubic-bezier(0.1, 0.7, 1.0, 0.1) infinite',
          }} />
          <style jsx>{`
                @keyframes chain-whip {
                    0% { transform: translateX(0) scaleX(0.1); opacity: 0.5; }
                    20% { opacity: 1; }
                    100% { transform: translateX(-1500px) scaleX(1); opacity: 0; }
                }
             `}</style>
        </div>
      )}

      {/* Lukas's Machete Slash Effect OR Leader's Low Attack */}
      {(currentEnemyType?.id === 'lukas' || (currentEnemyType?.id === 'leader' && attackWarning?.type === 'LOW')) && (
        <div className="absolute pointer-events-none" style={{
          left: playerX + 210, // Centered on Frank's body (Sprite is 512px, center is ~256, minus half width 50 = ~210)
          top: groundY - 40, // At ground/feet level
          width: 100, // Even smaller (Requested)
          height: 100,
          zIndex: 200, // Boost Z-index just in case
        }}>
          {/* Primary White Slash - Extremely Bright and Thick */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            borderTop: '30px solid #ffffff', // Very thick
            borderRight: '15px solid transparent',
            filter: 'drop-shadow(0 0 25px rgba(255,255,255,1)) drop-shadow(0 0 10px rgba(255,255,255,1))', // Double glow
            opacity: 0,
            transform: 'rotate(-45deg) scale(0.5)',
            animation: 'machete-slash-white 0.12s ease-out infinite',
          }} />

          {/* Secondary Red Trail */}
          <div style={{
            position: 'absolute',
            inset: 5,
            borderRadius: '50%',
            borderTop: '20px solid #ff0000', // Very thick red
            borderRight: '15px solid transparent',
            opacity: 0,
            transform: 'rotate(-50deg) scale(0.4)',
            animation: 'machete-slash-red 0.12s ease-out infinite 0.04s',
          }} />

          <style jsx>{`
              @keyframes machete-slash-white {
                  0% { opacity: 0.5; transform: rotate(-60deg) scale(0.5); } 
                  50% { opacity: 1; transform: rotate(0deg) scale(1); }
                  100% { opacity: 0; transform: rotate(45deg) scale(1.3); }
              }
              @keyframes machete-slash-red {
                  0% { opacity: 0; transform: rotate(-60deg) scale(0.4); }
                  50% { opacity: 1; transform: rotate(-5deg) scale(0.9); }
                  100% { opacity: 0; transform: rotate(40deg) scale(1.1); }
              }
           `}</style>
        </div>
      )}
    </>
  )
}

// Much smaller scale for attack projectile - compact and highly visible
const ASS_TOOL_SCALE = 2.0

export function AssToolProjectiles({ projectiles, groundY }) {
  return projectiles.map((proj) => (
    <div key={proj.id} className="absolute pointer-events-none" style={{
      left: proj.x,
      top: groundY + proj.y - 20, // Middle of Frank (proj.y is -250, so total -270)
      width: 128 * ASS_TOOL_SCALE, // Corrected frame width (half of 256)
      height: 128 * ASS_TOOL_SCALE,
      backgroundImage: 'url(/sprites/tool/assTool.png)',
      backgroundPosition: `-${Math.floor(proj.frame) * 128 * ASS_TOOL_SCALE}px 0`,
      backgroundSize: `${256 * ASS_TOOL_SCALE}px ${128 * ASS_TOOL_SCALE}px`,
      backgroundRepeat: 'no-repeat',
      imageRendering: 'pixelated',
      zIndex: 100,
      // Very bright glow for maximum visibility
      filter: 'drop-shadow(0 0 10px #ff00ff) drop-shadow(0 0 15px #00ffff) drop-shadow(0 0 20px #ffffff) brightness(1.3)',
      // Fade out effect after hitting (piercing) the enemy
      opacity: proj.hit ? 0 : 1,
      transition: 'opacity 0.4s ease-in', // Start fading when hit, disappear over ~400px distance
    }} />
  ))
}
