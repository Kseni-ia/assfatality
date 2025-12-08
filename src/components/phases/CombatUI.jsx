import { COMBAT_SCALE } from '../../config/settings'
import { GAME_STATES } from '../../store/gameStore'

export function EnemyHealthBar({ currentEnemyType, enemyX, enemyHealth, groundY, enemySpriteSize }) {
  if (!currentEnemyType) return null

  // Adjusted top position to be closer to the character's actual head
  // The sprite frame has empty space at the top, so we push the bar down significantly
  const barTop = groundY - enemySpriteSize * 0.75

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

export function AttackLoadingBar({ attackWarning, attackActive, gameState, enemyX, groundY, enemySpriteSize, windupProgress }) {
  if (!attackWarning || attackActive || gameState !== GAME_STATES.COMBAT_PHASE) return null

  // Positioned well above the health bar to prevent overlap with the name
  const barTop = groundY - enemySpriteSize * 0.75 - 70

  return (
    <div className="absolute pointer-events-none" style={{ left: enemyX + enemySpriteSize * 0.2, top: barTop, width: enemySpriteSize * 0.6, zIndex: 60 }}>
      <div className="text-lg font-bold text-center mb-1" style={{ fontFamily: '"Press Start 2P", cursive', color: '#ffff00', textShadow: '0 0 5px #ffff00' }}>
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

export function AttackDangerZone({ attackActive, gameState, attackWarning, playerX, enemyX, groundY, frankSpriteSize }) {
  if (!attackActive || gameState !== GAME_STATES.COMBAT_PHASE) return null

  return (
    <>
      <div className="absolute pointer-events-none" style={{
        left: playerX + frankSpriteSize / 2,
        top: attackWarning?.type === 'HIGH' ? groundY - frankSpriteSize / 2 : groundY - 40,
        width: enemyX - playerX - frankSpriteSize / 2,
        height: 8,
        background: 'linear-gradient(90deg, #ff0000, #ff6600, #ffff00)',
        boxShadow: '0 0 20px #ff0000',
        zIndex: 45,
      }} />
      <div className="absolute pointer-events-none" style={{
        left: playerX - 20,
        top: attackWarning?.type === 'HIGH' ? groundY - frankSpriteSize - 50 : groundY - 80,
        width: frankSpriteSize + 100,
        height: attackWarning?.type === 'HIGH' ? frankSpriteSize : 100,
        background: 'rgba(255, 0, 0, 0.6)',
        border: '4px solid #ff0000',
        zIndex: 40,
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(255, 0, 0, 0.25)', zIndex: 30 }} />
    </>
  )
}

export function AssToolProjectiles({ projectiles, groundY }) {
  return projectiles.map((proj) => (
    <div key={proj.id} className="absolute pointer-events-none" style={{
      left: proj.x,
      top: groundY + proj.y,
      width: 64 * COMBAT_SCALE,
      height: 128 * COMBAT_SCALE,
      backgroundImage: 'url(/sprites/tool/assTool.png)',
      backgroundPosition: `-${Math.floor(proj.frame) * 64 * COMBAT_SCALE}px 0`,
      backgroundSize: `${256 * COMBAT_SCALE}px ${128 * COMBAT_SCALE}px`,
      backgroundRepeat: 'no-repeat',
      imageRendering: 'pixelated',
      zIndex: 50,
      filter: 'drop-shadow(0 0 10px #00ffff)',
    }} />
  ))
}
