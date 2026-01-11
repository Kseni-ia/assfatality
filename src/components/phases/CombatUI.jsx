import { COMBAT_SCALE } from '../../config/settings'
import { GAME_STATES } from '../../store/gameStore'

export function EnemyHealthBar({ currentEnemyType, enemyX, enemyHealth, groundY, enemySpriteSize }) {
  if (!currentEnemyType) return null

  // Adjusted top position to be closer to the character's actual head
  // The sprite frame has empty space at the top, so we push the bar down significantly
  const barTop = groundY - enemySpriteSize * 0.9

  return (
    <div className="absolute pointer-events-none" style={{ left: enemyX + enemySpriteSize * 0.2, top: barTop, width: enemySpriteSize * 0.6 }}>
      <div className="text-center text-white text-[8px] mb-0.5 opacity-90 shadow-sm" style={{ fontFamily: '"Press Start 2P", cursive' }}>
        {currentEnemyType.name}
      </div>
      <div className="bg-gray-800 h-1.5 lg:h-3 rounded overflow-hidden border border-gray-600">
        <div className="h-full bg-red-500 transition-all duration-200" style={{ width: `${(enemyHealth / currentEnemyType.health) * 100}%` }} />
      </div>
    </div>
  )
}

export function Announcements({ showLeaderAnnouncement, showBossAnnouncement, showFightText }) {
  if (showLeaderAnnouncement) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 100 }}>
        <div className="text-6xl font-bold text-yellow-400 animate-bounce" style={{ fontFamily: '"Press Start 2P", cursive', textShadow: '0 0 20px #ff8800' }}>
          LEADER!
        </div>
      </div>
    )
  }
  if (showBossAnnouncement) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 100 }}>
        <div className="text-6xl font-bold text-purple-500 animate-bounce" style={{ fontFamily: '"Press Start 2P", cursive', textShadow: '0 0 20px #8b00ff, 0 0 40px #ff00ff' }}>
          BOSS!
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

export function AttackLoadingBar({ attackWarning, attackActive, gameState, enemyX, groundY, enemySpriteSize, windupProgress, currentEnemyType, isMobile }) {
  if (!attackWarning || attackActive || gameState !== GAME_STATES.COMBAT_PHASE) return null

  // Positioned lower to avoid the top HUD
  // Lower it even more on mobile to be closer to characters
  const barTop = groundY - enemySpriteSize * (isMobile ? 0.6 : 0.85)

  // For Leader, hide the prompt until the bar is halfway full
  const showPrompt = currentEnemyType?.id !== 'leader' || windupProgress > 0.5

  return (
    <div className="absolute pointer-events-none" style={{ left: enemyX + enemySpriteSize * 0.2, top: barTop, width: enemySpriteSize * 0.6, zIndex: 60 }}>
      <div className={`text-lg font-bold text-center mb-1 transition-opacity duration-200 ${showPrompt ? 'opacity-100' : 'opacity-0'}`} style={{ fontFamily: '"Press Start 2P", cursive', color: '#ffff00', textShadow: '0 0 5px #ffff00' }}>
        {attackWarning.type === 'HIGH' ? 'DUCK!' : 'JUMP!'}
      </div>
      <div className="relative h-3 lg:h-4 rounded overflow-hidden" style={{ background: 'rgba(0,0,0,0.8)', border: '2px solid #ffff00' }}>
        <div className="h-full" style={{

          width: `${windupProgress * 100}%`,
          background: windupProgress < 0.6 ? 'linear-gradient(90deg, #00ff00, #88ff00)' : windupProgress < 0.85 ? 'linear-gradient(90deg, #ffff00, #ffaa00)' : 'linear-gradient(90deg, #ff6600, #ff0000)',
          transition: 'width 0.05s linear',
        }} />
      </div>
      <div className="text-center mt-0.5 text-[10px]" style={{ fontFamily: '"Press Start 2P", cursive', color: windupProgress > 0.85 ? '#ff0000' : '#000000ff' }}>
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
          top: groundY - 285,
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

      {(currentEnemyType?.id === 'lukas' || (currentEnemyType?.id === 'leader' && attackWarning?.type === 'LOW')) && (
        <div className="absolute pointer-events-none" style={{
          left: 0,
          top: groundY - 110, // Lifted UP significantly to be "under Frank" (lower body) but NOT "in the earth"
          width: '100%',
          height: 100,
          zIndex: 200,
        }}>
          {/* Flying Crescent Slash - Primary (SVG for Sharpness/Elegance) */}
          <div style={{
            position: 'absolute',
            left: enemyX,
            top: -50,
            width: 250, // Slightly larger container for the swoosh
            height: 150,
            filter: 'drop-shadow(0 0 10px #ffffff) drop-shadow(0 0 20px #00ffff) drop-shadow(0 0 40px #0000ff)', // Intense Glow
            transform: 'rotate(50deg)', // Initial angle - adjusted for horizontal look
            opacity: 0,
            animation: 'flying-slash 0.3s cubic-bezier(0.1, 0.7, 1.0, 0.1) forwards',
          }}>
            <svg viewBox="0 0 100 100" width="100%" height="100%" overflow="visible">
              <defs>
                <linearGradient id="bladeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#e0ffff" />
                  <stop offset="100%" stopColor="#00ffff" />
                </linearGradient>
              </defs>
              {/* Elegant Sharp Swoosh Path */}
              {/* Starts thin, curves out, sharp tip */}
              <path d="M0,100 Q40,40 100,10 Q60,50 0,100 Z" fill="url(#bladeGradient)" stroke="white" strokeWidth="2" />
              {/* Inner Detail Line */}
              <path d="M10,95 Q45,50 85,25" fill="none" stroke="#00ffff" strokeWidth="2" opacity="0.8" />
            </svg>
          </div>

          <style jsx>{`
              @keyframes flying-slash {
                  0% { transform: translateX(0) rotate(40deg) scale(0.5, 0.8) skewX(30deg); opacity: 0; }
                  20% { opacity: 1; transform: translateX(0) rotate(50deg) scale(1, 1) skewX(0deg); }
                  50% { transform: translateX(${(playerX - enemyX) * 0.5}px) rotate(55deg) scale(1.3, 0.8) skewX(-20deg); } /* Mid-flight "whip" flex */
                  90% { opacity: 1; transform: translateX(${playerX - enemyX}px) rotate(65deg) scale(1.2, 1) skewX(0deg); }
                  100% { opacity: 0; transform: translateX(${playerX - enemyX - 50}px) rotate(80deg) scale(1.3, 1); } 
              }
              @keyframes slash-impact {
                  0% { opacity: 0; transform: scaleX(0); }
                  20% { opacity: 1; transform: scaleX(1.2); }
                  100% { opacity: 0; transform: scaleX(1.5); }
              }
           `}</style>

          {/* Diagonal Cut Impact at Player Position */}
          <div style={{
            position: 'absolute',
            left: playerX,
            top: 40, // Centered on Frank
            width: 140,
            height: 8,
            background: 'linear-gradient(90deg, transparent, #fff, #fff, transparent)',
            boxShadow: '0 0 15px #fff',
            transformOrigin: 'center',
            transform: 'rotate(-25deg)',
            opacity: 0,
            animation: 'slash-impact 0.2s ease-out 0.25s forwards',
          }} />
        </div>
      )}
    </>
  )
}

// Much smaller scale for attack projectile - compact and highly visible
const ASS_TOOL_SCALE = 2.0

export function AssToolProjectiles({ projectiles, groundY, isMobile }) {
  return projectiles.map((proj) => (
    <div key={proj.id} className="absolute pointer-events-none" style={{
      left: proj.x,
      // Adjust offset for mobile: Frank is smaller and lower, so we need to push the projectile down more
      top: groundY + proj.y - (128 * ASS_TOOL_SCALE / 2) + (isMobile ? 180 : 60),
      width: 128 * ASS_TOOL_SCALE, // Corrected frame width (half of 256)
      height: 128 * ASS_TOOL_SCALE,
      backgroundImage: `url(/sprites/tool/${proj.hit ? 'attackTool' : 'assTool'}.png)`,
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

// Boss projectiles - travellSmoke animation (4 frames, 128x128 each = 512x128 spritesheet)
const BOSS_PROJECTILE_SCALE = 3.0

export function BossProjectiles({ projectiles, groundY, isMobile }) {
  if (!projectiles || projectiles.length === 0) return null

  return projectiles.map((proj) => {
    const isHit = proj.hit
    // Mobile: much lower (120px offset) vs Desktop (260px offset)
    const topPosition = groundY - (128 * BOSS_PROJECTILE_SCALE / 2) - (isMobile ? 120 : 260)

    return (
      <div key={proj.id} className="absolute pointer-events-none" style={{
        left: proj.x,
        top: topPosition,
        width: 128 * BOSS_PROJECTILE_SCALE,
        height: 128 * BOSS_PROJECTILE_SCALE,
        backgroundImage: `url(/sprites/tool/${isHit ? 'smashSmoke' : 'travellSmoke'}.png)`,
        backgroundPosition: `-${Math.floor(proj.frame) * 128 * BOSS_PROJECTILE_SCALE}px 0`,
        backgroundSize: `${512 * BOSS_PROJECTILE_SCALE}px ${128 * BOSS_PROJECTILE_SCALE}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        zIndex: 90,
        // Purple smoke glow effect
        filter: 'drop-shadow(0 0 15px #8b00ff) drop-shadow(0 0 25px #ff00ff) brightness(1.2)',
        // Fade out effect after hitting (like attackTool)
        opacity: isHit ? 0 : 1,
        transition: 'opacity 0.4s ease-in',
      }} />
    )
  })
}

// Boss bot projectiles - LOW attacks using travellSmoke/smashSmoke at ground level
// Same sprites as HIGH attack but positioned lower (player must jump to avoid)
const BOSS_BOT_PROJECTILE_SCALE = 3.0

export function BossBotProjectiles({ projectiles, groundY, isMobile }) {
  if (!projectiles || projectiles.length === 0) return null

  return projectiles.map((proj) => {
    const isHit = proj.hit
    // Position at ground level but a bit higher
    // Mobile: much lower (20px offset) vs Desktop (120px offset)
    const topPosition = groundY - (128 * BOSS_BOT_PROJECTILE_SCALE / 2) - (isMobile ? 20 : 120)

    return (
      <div key={proj.id} className="absolute pointer-events-none" style={{
        left: proj.x,
        top: topPosition,
        width: 128 * BOSS_BOT_PROJECTILE_SCALE,
        height: 128 * BOSS_BOT_PROJECTILE_SCALE,
        // Use same sprites as HIGH attack - travellSmoke for travel, smashSmoke for hit
        backgroundImage: `url(/sprites/tool/${isHit ? 'smashSmoke' : 'travellSmoke'}.png)`,
        backgroundPosition: `-${Math.floor(proj.frame) * 128 * BOSS_BOT_PROJECTILE_SCALE}px 0`,
        backgroundSize: `${512 * BOSS_BOT_PROJECTILE_SCALE}px ${128 * BOSS_BOT_PROJECTILE_SCALE}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        zIndex: 90,
        // Same purple smoke glow as HIGH attack
        filter: 'drop-shadow(0 0 15px #8b00ff) drop-shadow(0 0 25px #ff00ff) brightness(1.2)',
        // Fade out effect after hitting
        opacity: isHit ? 0 : 1,
        transition: 'opacity 0.4s ease-in',
      }} />
    )
  })
}
