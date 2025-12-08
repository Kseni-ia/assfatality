import { useEffect, useRef, useCallback, useState } from 'react'
import { useGameStore, GAME_STATES, PLAYER_STATES } from '../../store/gameStore'
import { 
  OBSTACLE_SCALE, 
  FRANK_FRAME_SIZE, 
  OBSTACLE_PLAYER_SIZE,
  OBSTACLE_GROUND_Y_OFFSET,
  OBSTACLE_VISUAL 
} from '../../config/settings'

const FRANK_FRAMES = 4

export default function ObstaclePhase() {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const lastTimeRef = useRef(0)
  const bgImageRef = useRef(null)
  const bgScrollRef = useRef(0)
  const [frankFrame, setFrankFrame] = useState(0)

  // Load background image
  useEffect(() => {
    const img = new Image()
    img.src = '/sprites/bg/sceneBackground320x128.png'
    img.onload = () => { bgImageRef.current = img }
  }, [])

  const {
    playerY,
    isDucking,
    isJumping,
    isBlinking,
    obstacles,
    jump,
    releaseJump,
    duck,
    stopDuck,
    updatePlayer,
    updateObstacles,
  } = useGameStore()

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return
      if (e.key === 'ArrowUp' || e.key === ' ') { e.preventDefault(); jump() }
      if (e.key === 'ArrowDown') { e.preventDefault(); duck() }
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
  }, [jump, releaseJump, duck, stopDuck])

  // Game loop
  const gameLoop = useCallback((timestamp) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const { width, height } = canvas
    const state = useGameStore.getState()
    const groundY = height - OBSTACLE_GROUND_Y_OFFSET
    const scrollSpeed = 5

    // Clear and draw background
    ctx.fillStyle = '#0a0015'
    ctx.fillRect(0, 0, width, height)

    state.updatePlayer(timestamp - lastTimeRef.current)
    state.updateObstacles(scrollSpeed)
    lastTimeRef.current = timestamp

    // Update background scroll
    bgScrollRef.current += scrollSpeed

    // Draw background
    drawBackground(ctx, width, height, timestamp, bgImageRef.current, bgScrollRef.current, groundY)
    drawGround(ctx, width, groundY)
    drawPlayerShadow(ctx, groundY)
    drawObstacles(ctx, state.obstacles, groundY)

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
  }, [isJumping, isDucking])

  const groundY = typeof window !== 'undefined' ? window.innerHeight - OBSTACLE_GROUND_Y_OFFSET : 500
  const playerX = 120
  const frankSpriteSize = OBSTACLE_PLAYER_SIZE

  const getFrankSprite = () => {
    if (isDucking) return 'crouchingEast'
    if (isJumping) return 'runningJumpingEast'
    return 'runningEast'
  }

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="game-canvas pixel-perfect" />
      {/* Frank sprite */}
      <div
        className={`absolute pointer-events-none ${isBlinking ? 'respawn-blink' : ''}`}
        style={{
          left: playerX,
          top: groundY + playerY - frankSpriteSize + 35,
          width: frankSpriteSize,
          height: frankSpriteSize,
          backgroundImage: `url(/sprites/frank/${getFrankSprite()}.png)`,
          backgroundPosition: `-${frankFrame * FRANK_FRAME_SIZE * OBSTACLE_SCALE}px 0`,
          backgroundSize: `${FRANK_FRAMES * FRANK_FRAME_SIZE * OBSTACLE_SCALE}px ${frankSpriteSize}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  )
}

// Drawing functions
function drawBackground(ctx, width, height, timestamp, bgImage, scrollX, groundY) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#1a0033')
  gradient.addColorStop(0.5, '#2d0066')
  gradient.addColorStop(1, '#0a0015')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  if (bgImage) {
    const bgHeight = height
    const bgWidth = (bgImage.width / bgImage.height) * bgHeight
    const scrollOffset = scrollX % bgWidth
    ctx.imageSmoothingEnabled = false
    for (let x = -scrollOffset; x < width + bgWidth; x += bgWidth) {
      ctx.drawImage(bgImage, x, 0, bgWidth, bgHeight)
    }
  }
}

function drawGround(ctx, width, groundY) {
  ctx.fillStyle = '#1a0a2e'
  ctx.fillRect(0, groundY, width, 10)
}

function drawPlayerShadow(ctx, groundY) {
  const playerX = 120
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.beginPath()
  ctx.ellipse(playerX + OBSTACLE_PLAYER_SIZE / 2, groundY - 5, 35 * OBSTACLE_SCALE, 12 * OBSTACLE_SCALE, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawObstacles(ctx, obstacles, groundY) {
  obstacles.forEach(obs => {
    const visual = OBSTACLE_VISUAL[obs.type] || { width: obs.width, height: obs.height }
    const vw = visual.width
    const vh = visual.height

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(obs.x + 5, groundY - 5, vw, 10)

    const gradient = ctx.createLinearGradient(obs.x, groundY - vh, obs.x, groundY)

    if (obs.type === 'barrel') {
      gradient.addColorStop(0, '#8b4513')
      gradient.addColorStop(1, '#5a2d0a')
      ctx.fillStyle = gradient
      ctx.fillRect(obs.x, groundY - vh, vw, vh)
      ctx.fillStyle = '#333'
      ctx.fillRect(obs.x, groundY - vh + 10, vw, 5)
      ctx.fillRect(obs.x, groundY - 15, vw, 5)
    } else if (obs.type === 'box') {
      gradient.addColorStop(0, '#666')
      gradient.addColorStop(1, '#333')
      ctx.fillStyle = gradient
      ctx.fillRect(obs.x, groundY - vh, vw, vh)
      ctx.strokeStyle = '#ff6600'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(obs.x + 5, groundY - vh + 5)
      ctx.lineTo(obs.x + vw - 5, groundY - 5)
      ctx.moveTo(obs.x + vw - 5, groundY - vh + 5)
      ctx.lineTo(obs.x + 5, groundY - 5)
      ctx.stroke()
    } else if (obs.type === 'pipe') {
      gradient.addColorStop(0, '#4a4a4a')
      gradient.addColorStop(1, '#2a2a2a')
      ctx.fillStyle = gradient
      ctx.fillRect(obs.x, groundY - vh, vw, vh)
      ctx.fillStyle = '#6a6a6a'
      ctx.fillRect(obs.x, groundY - vh, vw, 5)
    }
  })
}
