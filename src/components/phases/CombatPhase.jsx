import { useEffect, useRef, useCallback, useState } from 'react'
import { useGameStore, GAME_STATES, PLAYER_STATES, ENEMY_STATES } from '../../store/gameStore'
import {
  COMBAT_SCALE,
  FRANK_FRAME_SIZE,
  COMBAT_PLAYER_SIZE,
  COMBAT_ENEMY_SIZE,
  COMBAT_GROUND_Y_OFFSET
} from '../../config/settings'
import { EnemyHealthBar, Announcements, AttackLoadingBar, AttackDangerZone, AssToolProjectiles } from './CombatUI'

const FRANK_FRAMES = 4
const LEADER_FRAMES = 5
const LEADER_FRAME_SIZE = 128

export default function CombatPhase() {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const bgImageRef = useRef(null)
  const [frankFrame, setFrankFrame] = useState(0)
  const [enemyFrame, setEnemyFrame] = useState(0)

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
  } = useGameStore()

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return
      if (e.key === 'ArrowUp' || e.key === ' ') { e.preventDefault(); jump() }
      if (e.key === 'ArrowDown') { e.preventDefault(); duck() }
      if (e.key === 'a' || e.key === 'A') { e.preventDefault(); shootAssTool() }
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

    // Draw background (static for combat)
    drawBackground(ctx, width, height, bgImageRef.current)
    drawGround(ctx, width, groundY)
    drawPlayerShadow(ctx, state.playerX, groundY)
    drawEnemyShadow(ctx, state.enemyX, groundY)

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
    const speed = enemyState === ENEMY_STATES.RUNNING ? 80 : 120
    const interval = setInterval(() => setEnemyFrame(prev => (prev + 1) % frameCount), speed)
    return () => clearInterval(interval)
  }, [enemyState, currentEnemyType])

  const groundY = typeof window !== 'undefined' ? window.innerHeight - COMBAT_GROUND_Y_OFFSET : 500
  const frankSpriteSize = COMBAT_PLAYER_SIZE
  const enemySpriteSize = COMBAT_ENEMY_SIZE

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
          left: playerX,
          top: groundY + playerY - frankSpriteSize + 60,
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
            left: enemyX,
            top: groundY - enemySpriteSize + 60,
            width: enemySpriteSize,
            height: enemySpriteSize,
            backgroundImage: `url(/sprites/${currentEnemyType.id}/${getEnemySprite()}.png)`,
            backgroundPosition: `-${enemyFrame * LEADER_FRAME_SIZE * COMBAT_SCALE}px 0`,
            backgroundSize: `${getEnemyFrameCount() * LEADER_FRAME_SIZE * COMBAT_SCALE}px ${enemySpriteSize}px`,
            backgroundRepeat: 'no-repeat',
            imageRendering: 'pixelated',
            transition: 'transform 0.5s ease-in, opacity 0.5s ease-in 1s',
            transform: enemyHealth <= 0 ? 'rotate(90deg) translateY(50px)' : 'none',
            opacity: enemyHealth <= 0 ? 0 : 1,
            transformOrigin: 'bottom center',
            filter: enemyHealth <= 0 ? 'grayscale(100%)' : 'none',
          }}
        />
      )}

      <EnemyHealthBar
        currentEnemyType={currentEnemyType}
        enemyX={enemyX}
        enemyHealth={enemyHealth}
        groundY={groundY}
        enemySpriteSize={enemySpriteSize}
      />
      <Announcements showLeaderAnnouncement={showLeaderAnnouncement} showFightText={showFightText} />
      <AttackLoadingBar
        attackWarning={attackWarning}
        attackActive={attackActive}
        gameState={gameState}
        enemyX={enemyX}
        groundY={groundY}
        enemySpriteSize={enemySpriteSize}
        windupProgress={windupProgress}
      />
      <AttackDangerZone
        attackActive={attackActive}
        gameState={gameState}
        attackWarning={attackWarning}
        playerX={playerX}
        enemyX={enemyX}
        groundY={groundY}
        frankSpriteSize={frankSpriteSize}
      />
      <AssToolProjectiles projectiles={assToolProjectiles} groundY={groundY} />
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

function drawEnemyShadow(ctx, enemyX, groundY) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.beginPath()
  ctx.ellipse(enemyX + COMBAT_ENEMY_SIZE / 2, groundY - 5, COMBAT_ENEMY_SIZE / 4, 20, 0, 0, Math.PI * 2)
  ctx.fill()
}
