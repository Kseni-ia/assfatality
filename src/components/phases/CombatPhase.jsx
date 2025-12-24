import { useEffect, useRef, useCallback, useState } from 'react'
import { useGameStore, GAME_STATES, PLAYER_STATES, ENEMY_STATES } from '../../store/gameStore'
import {
  COMBAT_SCALE,
  FRANK_FRAME_SIZE,
  COMBAT_PLAYER_SIZE,
  COMBAT_GROUND_Y_OFFSET,
  ENEMY_SCALES // Import new scales
} from '../../config/settings'
import { Announcements, AttackLoadingBar, AttackDangerZone, AssToolProjectiles, DamageOverlay } from './CombatUI'

const FRANK_FRAMES = 4
const LEADER_FRAMES = 5
const LEADER_FRAME_SIZE = 128

export default function CombatPhase() {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const bgImageRef = useRef(null)
  const [frankFrame, setFrankFrame] = useState(0)
  const [enemyFrame, setEnemyFrame] = useState(0)
  const [isEnemyHit, setIsEnemyHit] = useState(false)

  // Load background image
  useEffect(() => {
    const img = new Image()
    img.src = '/sprites/bg/sceneBackground320x128.png'
    img.onload = () => { bgImageRef.current = img }
  }, [])

  const {
    gameState,
    playerState,
    playerX,
    playerY,
    isDucking,
    isJumping,
    enemyX,
    enemyState,
    currentEnemyType,
    enemyHealth,
    attackWarning,
    attackActive,
    windupProgress,
    showFightText,
    showLeaderAnnouncement,
    assToolProjectiles,
    jump,
    releaseJump,
    duck,
    stopDuck,
    shootAssTool,
    updatePlayer,
    updateCombatIntro,
    updateCombat,
    tickAssMeter,
    tickMana,
    updateAssToolProjectiles,
    isInvincible,
    enemyHitTimestamp,
    ultimatePhase,
    ultimatePos,
    ultimateScale,
    triggerCinematicUltimate,
    updateUltimate,
  } = useGameStore()

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return
      if (e.key === 'ArrowUp' || e.key === ' ') { e.preventDefault(); jump() }
      if (e.key === 'ArrowDown') { e.preventDefault(); duck() }
      if (e.key === 'a' || e.key === 'A') { e.preventDefault(); shootAssTool() }
      if (e.key === 'r' || e.key === 'R') { e.preventDefault(); triggerCinematicUltimate() }
    }
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowUp' || e.key === ' ') releaseJump()
      if (e.key === 'ArrowDown') stopDuck()
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [jump, releaseJump, duck, stopDuck, shootAssTool])

  // Game loop
  const gameLoop = useCallback((timestamp) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const { width, height } = canvas
    const state = useGameStore.getState()
    const groundY = height - COMBAT_GROUND_Y_OFFSET

    ctx.fillStyle = '#0a0015'
    ctx.fillRect(0, 0, width, height)

    state.updatePlayer(0)

    if (state.gameState === GAME_STATES.COMBAT_INTRO) {
      state.updateCombatIntro()
    }
    if (state.gameState === GAME_STATES.COMBAT_PHASE) {
      state.updateCombat()
      state.tickAssMeter()
      state.tickMana()
      state.updateAssToolProjectiles()
    }
    if (state.gameState === GAME_STATES.ASS_FATALITY) {
      state.updateUltimate()
    }

    // Draw background (static for combat)
    drawBackground(ctx, width, height, bgImageRef.current)
    drawGround(ctx, width, groundY)
    drawPlayerShadow(ctx, state.playerX, groundY)

    // Draw Enemy Shadow (Requires scale consideration if we want it perfect, but standard size is likely fine for shadow)
    // Actually, let's use the dynamic size for shadow too
    const currentScale = (state.currentEnemyType && ENEMY_SCALES[state.currentEnemyType.id]) || COMBAT_SCALE
    const currentEnemySize = 128 * currentScale
    drawEnemyShadow(ctx, state.enemyX, groundY, currentEnemySize)

    animationRef.current = requestAnimationFrame(gameLoop)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    animationRef.current = requestAnimationFrame(gameLoop)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [gameLoop])

  // Animate Frank sprite
  useEffect(() => {
    let speed = 100
    if (isJumping) speed = 80
    if (isDucking) speed = 120
    const interval = setInterval(() => setFrankFrame(prev => (prev + 1) % FRANK_FRAMES), speed)
    return () => clearInterval(interval)
  }, [isJumping, isDucking, playerState])

  // Animate enemy sprite
  useEffect(() => {
    if (!currentEnemyType) return
    let frameCount = 4
    if (currentEnemyType.id === 'duca' && (enemyState === ENEMY_STATES.ATTACK_HIGH || enemyState === ENEMY_STATES.ATTACK_LOW)) {
      frameCount = 11
    } else if (currentEnemyType.id === 'leader') {
      frameCount = LEADER_FRAMES
    }
    const speed = (enemyState === ENEMY_STATES.ATTACK_HIGH || enemyState === ENEMY_STATES.ATTACK_LOW) ? 60 :
      enemyState === ENEMY_STATES.RUNNING ? 80 : 120
    const interval = setInterval(() => setEnemyFrame(prev => (prev + 1) % frameCount), speed)
    return () => clearInterval(interval)
  }, [enemyState, currentEnemyType])

  // Reset frame when state changes to prevent index overflow (e.g. from 11 frames attack to 4 frames idle)
  useEffect(() => {
    setEnemyFrame(0)
  }, [enemyState])

  // Trigger hit effect when timestamp changes
  useEffect(() => {
    if (enemyHitTimestamp > 0) {
      setIsEnemyHit(true)
      const timer = setTimeout(() => setIsEnemyHit(false), 200) // 200ms flash
      return () => clearTimeout(timer)
    }
  }, [enemyHitTimestamp])

  const groundY = typeof window !== 'undefined' ? window.innerHeight - COMBAT_GROUND_Y_OFFSET : 500
  const frankSpriteSize = COMBAT_PLAYER_SIZE

  // Calculate specific scale for current enemy
  const currentEnemyScale = (currentEnemyType && ENEMY_SCALES[currentEnemyType.id]) || COMBAT_SCALE
  const enemySpriteSize = 128 * currentEnemyScale

  const getFrankSprite = () => {
    if (playerState === PLAYER_STATES.RUNNING) return 'runningEast'
    if (isDucking) return 'crouchingEast'
    if (isJumping) return 'jumpingEast'
    return 'IdleEast'
  }

  const getEnemySprite = () => {
    if (!currentEnemyType) return ''
    if (currentEnemyType.id === 'lukas') {
      return enemyState === ENEMY_STATES.RUNNING ? 'running' :
        (enemyState === ENEMY_STATES.ATTACK_HIGH || enemyState === ENEMY_STATES.ATTACK_LOW) ? 'attackWest' : 'idleWest'
    } else if (currentEnemyType.id === 'duca') {
      return enemyState === ENEMY_STATES.RUNNING ? 'runningWest' :
        (enemyState === ENEMY_STATES.ATTACK_HIGH || enemyState === ENEMY_STATES.ATTACK_LOW) ? 'attackWest' : 'IdleWest'
    } else {
      return enemyState === ENEMY_STATES.RUNNING ? 'running_west' :
        enemyState === ENEMY_STATES.ATTACK_HIGH ? 'attack_west' :
          enemyState === ENEMY_STATES.ATTACK_LOW ? 'attack_ground_west' : 'idle'
    }
  }

  const getEnemyFrameCount = () => {
    if (!currentEnemyType) return 4
    if (currentEnemyType.id === 'duca' && (enemyState === ENEMY_STATES.ATTACK_HIGH || enemyState === ENEMY_STATES.ATTACK_LOW)) return 11
    if (currentEnemyType.id === 'leader') return LEADER_FRAMES
    return 4
  }

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="game-canvas pixel-perfect" />

      {/* Frank sprite */}
      <div
        className="absolute pointer-events-none"
        style={{
          zIndex: 10,
          left: playerX,
          top: groundY + playerY - frankSpriteSize + 90 + (isDucking ? 60 : 0),
          width: frankSpriteSize,
          height: frankSpriteSize,
          backgroundImage: `url(/sprites/frank/${getFrankSprite()}.png)`,
          backgroundPosition: `-${frankFrame * FRANK_FRAME_SIZE * COMBAT_SCALE}px 0`,
          backgroundSize: `${FRANK_FRAMES * FRANK_FRAME_SIZE * COMBAT_SCALE}px ${frankSpriteSize}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
        }}
      />

      {/* Enemy sprite */}
      {currentEnemyType && (
        <div
          className="absolute pointer-events-none"
          style={{
            zIndex: 20,
            left: enemyX,
            // Align enemy ground level with Frank
            // Lukas needs 60, others (Duca, Leader) need 90 to match Frank's new position
            top: groundY - enemySpriteSize + (currentEnemyType.id === 'lukas' ? 60 : 90),
            width: enemySpriteSize,
            height: enemySpriteSize,
            backgroundImage: `url(/sprites/${currentEnemyType.id}/${getEnemySprite()}.png)`,
            backgroundPosition: `-${enemyFrame * LEADER_FRAME_SIZE * currentEnemyScale}px 0`,
            backgroundSize: `${getEnemyFrameCount() * LEADER_FRAME_SIZE * currentEnemyScale}px ${enemySpriteSize}px`,
            backgroundRepeat: 'no-repeat',
            imageRendering: 'pixelated',
            transition: 'transform 0.1s, opacity 0.5s ease-in 1s', // Faster transform for pop effect
            transform: enemyHealth <= 0 ? 'rotate(90deg) translateY(50px)' : isEnemyHit ? 'scale(1.1)' : 'none',
            opacity: enemyHealth <= 0 ? 0 : 1,
            transformOrigin: 'bottom center',
            // Blink red/white brightness when hit
            filter: enemyHealth <= 0 ? 'grayscale(100%)' : isEnemyHit ? 'brightness(3) sepia(1) hue-rotate(-50deg) saturate(5) drop-shadow(0 0 15px red)' : 'none',
          }}
        />
      )}

      <Announcements
        showLeaderAnnouncement={showLeaderAnnouncement}
        showFightText={showFightText}
      />
      <AttackLoadingBar
        attackWarning={attackWarning}
        attackActive={attackActive}
        gameState={gameState}
        enemyX={enemyX}
        groundY={groundY}
        enemySpriteSize={enemySpriteSize}
        windupProgress={windupProgress}
        currentEnemyType={currentEnemyType}
      />
      <AttackDangerZone
        attackActive={attackActive}
        gameState={gameState}
        attackWarning={attackWarning}
        playerX={playerX}
        enemyX={enemyX}
        groundY={groundY}
        frankSpriteSize={frankSpriteSize}
        isDucking={isDucking}
        isJumping={isJumping}
        currentEnemyType={currentEnemyType}
      />
      <AssToolProjectiles projectiles={assToolProjectiles} groundY={groundY} />
      <DamageOverlay isInvincible={isInvincible} />

      {/* Cinematic Ultimate Layer */}
      {ultimatePhase !== 'none' && (
        <>
          {/* Gray Overlay */}
          <div className="absolute inset-0 bg-black/50 z-40 pointer-events-none transition-opacity duration-500" />

          {/* Flying Tool */}
          <img
            src="/sprites/tool/ultimateTool.png"
            alt="Ultimate Attack"
            className="absolute z-50 drop-shadow-[0_0_50px_rgba(232,121,249,0.8)]"
            style={{
              left: ultimatePos.x,
              top: ultimatePos.y,
              transform: `translate(-50%, -50%) scale(${ultimateScale})`,
              width: 150, // Base size
              height: 150,
              filter: 'brightness(1.5) saturate(1.5)',
            }}
          />
        </>
      )}
    </div>
  )
}

function drawBackground(ctx, width, height, bgImage) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#1a0033')
  gradient.addColorStop(0.5, '#2d0066')
  gradient.addColorStop(1, '#0a0015')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  if (bgImage) {
    const bgHeight = height
    const bgWidth = (bgImage.width / bgImage.height) * bgHeight
    ctx.imageSmoothingEnabled = false
    for (let x = 0; x < width; x += bgWidth) {
      ctx.drawImage(bgImage, x, 0, bgWidth, bgHeight)
    }
  }
}

function drawGround(ctx, width, groundY) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.fillRect(0, groundY, width, 5)
}

function drawPlayerShadow(ctx, playerX, groundY) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.beginPath()
  ctx.ellipse(playerX + COMBAT_PLAYER_SIZE / 2, groundY - 5, COMBAT_PLAYER_SIZE / 4, 20, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawEnemyShadow(ctx, enemyX, groundY, size) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  const safeSize = size || 128 * COMBAT_SCALE
  ctx.beginPath()
  ctx.ellipse(enemyX + safeSize / 2, groundY - 5, safeSize / 4, 20, 0, 0, Math.PI * 2)
  ctx.fill()
}
