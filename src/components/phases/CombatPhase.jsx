import { useEffect, useRef, useCallback, useState } from 'react'
import { useGameStore, GAME_STATES, PLAYER_STATES, ENEMY_STATES } from '../../store/gameStore'
import {
  COMBAT_SCALE,
  FRANK_FRAME_SIZE,
  COMBAT_PLAYER_SIZE,
  COMBAT_GROUND_Y_OFFSET,
} from '../../config/settings'
import { PLACEMENT_CONFIG } from '../../config/characterPlacement'
import { Announcements, AttackLoadingBar, AttackDangerZone, AssToolProjectiles, DamageOverlay, BossProjectiles, BossBotProjectiles } from './CombatUI'

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
    currentAttackType,
    windupProgress,
    showFightText,
    showLeaderAnnouncement,
    showBossAnnouncement,
    assToolProjectiles,
    bossProjectiles,
    bossBotProjectiles,
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
    // Boss appearance animation
    bossAppearing,
    bossAppearFrame,
    showBossAppearEffect,
    introPhase,
    isMobile,
    setMobile,
  } = useGameStore()

  // Load background image
  useEffect(() => {
    // Clear previous background to prevent showing wrong one while loading
    bgImageRef.current = null

    const img = new Image()
    const isBoss = currentEnemyType?.id === 'boss'
    const src = isBoss ? '/sprites/bg/bgBoss.jpg' : '/sprites/bg/sceneBackground320x128.png'

    img.src = src
    img.onload = () => { bgImageRef.current = img }
    img.onerror = (e) => {
      console.error('Failed to load background:', src, e)
    }
  }, [currentEnemyType])

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

    // PAUSE LOGIC: If paused, skip state updates but continue rendering
    if (!state.isPaused) {
      state.updatePlayer(0)

      if (state.gameState === GAME_STATES.COMBAT_INTRO) {
        state.updateCombatIntro()
      }
      if (state.gameState === GAME_STATES.COMBAT_PHASE) {
        state.updateCombat()
        state.tickAssMeter()
        state.tickMana()
        state.updateAssToolProjectiles()
        state.updateBossProjectiles()
        state.updateBossBotProjectiles()
      }
      if (state.gameState === GAME_STATES.ASS_FATALITY) {
        state.updateUltimate()
      }
    }

    // Draw background (static for combat)
    drawBackground(ctx, width, height, bgImageRef.current, state.currentEnemyType?.id === 'boss')
    drawGround(ctx, width, groundY)
    // Draw Shadow
    // Use config scale for shadow size
    const config = state.isMobile ? PLACEMENT_CONFIG.mobile : PLACEMENT_CONFIG.desktop

    if (!state.isMobile) {
      // Shadows removed as per request
    }

    animationRef.current = requestAnimationFrame(gameLoop)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      // If valid landscape (width > height), use normally
      // If portrait (height > width), we are in "forced landscape" mode via CSS rotation
      // So effectively, the game width is the window height, and game height is window width
      const isPortrait = window.innerHeight > window.innerWidth

      canvas.width = isPortrait ? window.innerHeight : window.innerWidth
      canvas.height = isPortrait ? window.innerWidth : window.innerHeight

      setMobile(canvas.width < PLACEMENT_CONFIG.mobileBreakpoint)
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

  const isPortrait = typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : false
  const effectiveHeight = isPortrait ? window.innerWidth : window.innerHeight
  const groundY = effectiveHeight - COMBAT_GROUND_Y_OFFSET
  // Determine configuration based on mode
  const config = isMobile ? PLACEMENT_CONFIG.mobile : PLACEMENT_CONFIG.desktop

  // Frank scale logic
  const frankScale = (currentEnemyType?.id === 'boss' && config.scale.frankBoss) ? config.scale.frankBoss : config.scale.frank
  const frankSpriteSize = FRANK_FRAME_SIZE * frankScale

  // Enemy scale logic
  // Use config scale, fallback to COMBAT_SCALE if not found (safety)
  const currentEnemyScale = (currentEnemyType && config.scale[currentEnemyType.id]) || COMBAT_SCALE
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
    } else if (currentEnemyType.id === 'boss') {
      // Boss uses different sprites for HIGH vs LOW attacks
      if (enemyState === ENEMY_STATES.ATTACK_HIGH) {
        return 'attackBossTop' // HIGH attack animation
      } else if (enemyState === ENEMY_STATES.ATTACK_LOW) {
        return 'attackBossBot' // LOW attack animation
      }
      return 'idleBoss'
    } else {
      return enemyState === ENEMY_STATES.RUNNING ? 'running_west' :
        enemyState === ENEMY_STATES.ATTACK_HIGH ? 'attack_west' :
          enemyState === ENEMY_STATES.ATTACK_LOW ? 'attack_ground_west' : 'idle'
    }
  }

  // Get sprite folder path - boss uses /sprites/tool/ instead of /sprites/boss/
  const getEnemySpritePath = () => {
    if (!currentEnemyType) return ''
    if (currentEnemyType.id === 'boss') {
      return 'tool' // Boss sprites are in /sprites/tool/
    }
    return currentEnemyType.id
  }

  const getEnemyFrameCount = () => {
    if (!currentEnemyType) return 4
    if (currentEnemyType.id === 'duca' && (enemyState === ENEMY_STATES.ATTACK_HIGH || enemyState === ENEMY_STATES.ATTACK_LOW)) return 11
    if (currentEnemyType.id === 'leader') return LEADER_FRAMES
    if (currentEnemyType.id === 'boss') {
      // attackBossBot (LOW) has 5 frames, attackBossTop (HIGH) and idleBoss have 4 frames
      if (enemyState === ENEMY_STATES.ATTACK_LOW) return 5
      return 4
    }
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
          // Use 'frankBoss' offset if fighting boss, otherwise 'frank'
          top: groundY + playerY - frankSpriteSize + (currentEnemyType?.id === 'boss' ? config.verticalOffset.frankBoss : config.verticalOffset.frank) + (isDucking ? 60 : 0),
          width: frankSpriteSize,
          height: frankSpriteSize,
          backgroundImage: `url(/sprites/frank/${getFrankSprite()}.png)`,
          backgroundPosition: `-${frankFrame * FRANK_FRAME_SIZE * frankScale}px 0`,
          backgroundSize: `${FRANK_FRAMES * FRANK_FRAME_SIZE * frankScale}px ${frankSpriteSize}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
        }}
      />

      {/* Enemy sprite */}
      {currentEnemyType && (
        <>
          {/* Boss Appearance Effect - particles and glow REMOVED as per request to use sprite only */}
          {currentEnemyType.id === 'boss' && showBossAppearEffect && (
            <div
              className="absolute pointer-events-none"
              style={{
                zIndex: 15,
                left: enemyX - 50,
                top: groundY - enemySpriteSize - 50,
                width: enemySpriteSize + 100,
                height: enemySpriteSize + 100,
              }}
            >
              {/* Simple smoke/glow underlay if needed, or leave empty to rely on sprite */}
              <div style={{
                position: 'absolute',
                left: '50%',
                bottom: 40,
                transform: 'translateX(-50%)',
                width: 150,
                height: 20,
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 70%)',
                filter: 'blur(5px)',
                animation: 'fade-out 2s ease-out forwards',
              }} />
            </div>
          )}

          {/* Boss appearance sprite - shown during boss_appear phase */}
          {currentEnemyType.id === 'boss' && bossAppearing ? (
            <div
              className="absolute pointer-events-none"
              style={{
                zIndex: 20,
                left: enemyX,
                // Removed the -40 manual offset and reliance on translateY animation
                // We want it exactly where the idle sprite is.
                // If appearBoss.png has the same dimensions/center as idleBoss, this is correct.
                top: groundY - enemySpriteSize + (config.verticalOffset.boss || 0),
                width: enemySpriteSize,
                height: enemySpriteSize,
                backgroundImage: `url(/sprites/tool/appearBoss.png)`,
                backgroundPosition: `-${bossAppearFrame * LEADER_FRAME_SIZE * currentEnemyScale}px 0`,
                backgroundSize: `${3 * LEADER_FRAME_SIZE * currentEnemyScale}px ${enemySpriteSize}px`,
                backgroundRepeat: 'no-repeat',
                imageRendering: 'pixelated',
                // Inline filter removed to let animation control it fully
                animation: 'boss-materialize 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
              }}
            />
          ) : (
            /* Normal enemy sprite */
            <div
              className="absolute pointer-events-none"
              style={{
                zIndex: 20,
                left: enemyX,
                // Align enemy ground level with Frank
                // Align enemy ground level with Frank
                // Use centralized offset configuration
                top: groundY - enemySpriteSize + (currentEnemyType ? config.verticalOffset[currentEnemyType.id] : 0),
                width: enemySpriteSize,
                height: enemySpriteSize,
                backgroundImage: `url(/sprites/${getEnemySpritePath()}/${getEnemySprite()}.png)`,
                backgroundPosition: `-${enemyFrame * LEADER_FRAME_SIZE * currentEnemyScale}px 0`,
                backgroundSize: `${getEnemyFrameCount() * LEADER_FRAME_SIZE * currentEnemyScale}px ${enemySpriteSize}px`,
                backgroundRepeat: 'no-repeat',
                imageRendering: 'pixelated',
                transition: 'transform 0.1s, opacity 0.5s ease-in 1s',
                transform: enemyHealth <= 0 ? 'rotate(90deg) translateY(50px)' : isEnemyHit ? 'scale(1.1)' : 'none',
                // Hide boss during announcement phase (before appear animation)
                opacity: enemyHealth <= 0 ? 0 : (currentEnemyType.id === 'boss' && introPhase === 'boss_announcement') ? 0 : 1,
                transformOrigin: 'bottom center',
                // Normal hit/death effects
                filter: enemyHealth <= 0
                  ? 'grayscale(100%)'
                  : isEnemyHit
                    ? 'brightness(3) sepia(1) hue-rotate(-50deg) saturate(5) drop-shadow(0 0 15px red)'
                    : 'none',
                // Fade edges during LOW attack using mask - tight fade to hide cut corners
                ...(currentEnemyType.id === 'boss' && enemyState === ENEMY_STATES.ATTACK_LOW ? {
                  maskImage: 'radial-gradient(ellipse 70% 75% at 50% 55%, black 40%, transparent 85%)',
                  WebkitMaskImage: 'radial-gradient(ellipse 70% 75% at 50% 55%, black 40%, transparent 85%)',
                } : {}),
              }}
            />
          )}

          {/* Boss materialize animation */}
          {currentEnemyType.id === 'boss' && bossAppearing && (
            <style>{`
              @keyframes boss-materialize {
                0% { 
                  opacity: 0; 
                  transform: scale(0.9); 
                  filter: brightness(5) blur(20px) contrast(200%) drop-shadow(0 0 50px white); 
                }
                40% { 
                  opacity: 1; 
                  transform: scale(1.05); 
                  filter: brightness(2) blur(5px) contrast(150%) drop-shadow(0 0 30px #d8b4fe); 
                }
                100% { 
                  opacity: 1; 
                  transform: scale(1); 
                  filter: brightness(1) blur(0) contrast(100%) drop-shadow(0 0 20px #8b00ff); 
                }
              }
              @keyframes fade-out { to { opacity: 0; } }
            `}</style>
          )}
        </>
      )}

      <Announcements
        showLeaderAnnouncement={showLeaderAnnouncement}
        showBossAnnouncement={showBossAnnouncement}
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
        isMobile={isMobile}
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
      <AssToolProjectiles projectiles={assToolProjectiles} groundY={groundY} isMobile={isMobile} />
      <BossProjectiles projectiles={bossProjectiles} groundY={groundY} isMobile={isMobile} />
      <BossBotProjectiles projectiles={bossBotProjectiles} groundY={groundY} isMobile={isMobile} />
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

function drawBackground(ctx, width, height, bgImage, isBoss) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#1a0033')
  gradient.addColorStop(0.5, '#2d0066')
  gradient.addColorStop(1, '#0a0015')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  if (bgImage) {
    if (isBoss) {
      // Boss background: smooth scaling, stretch to cover entire screen (assumed 16:9 like screen)
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(bgImage, 0, 0, width, height)
    } else {
      // Pixel art background: preserve pixels, tile horizontally
      const bgHeight = height
      const bgWidth = (bgImage.width / bgImage.height) * bgHeight
      ctx.imageSmoothingEnabled = false
      for (let x = 0; x < width; x += bgWidth) {
        ctx.drawImage(bgImage, x, 0, bgWidth, bgHeight)
      }
    }
  }
}

function drawGround(ctx, width, groundY) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.fillRect(0, groundY, width, 5)
}


