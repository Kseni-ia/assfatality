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
      state.updateBossProjectiles()
      state.updateBossBotProjectiles()
    }
    if (state.gameState === GAME_STATES.ASS_FATALITY) {
      state.updateUltimate()
    }

    // Draw background (static for combat)
    drawBackground(ctx, width, height, bgImageRef.current)
    drawGround(ctx, width, groundY)
    // Draw Shadow
    // Use config scale for shadow size
    const config = state.isMobile ? PLACEMENT_CONFIG.mobile : PLACEMENT_CONFIG.desktop

    const frankScale = config.scale.frank
    const frankSize = FRANK_FRAME_SIZE * frankScale
    drawPlayerShadow(ctx, state.playerX, groundY, frankSize)

    // Draw Enemy Shadow
    const currentScale = (state.currentEnemyType && config.scale[state.currentEnemyType.id]) || COMBAT_SCALE
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
      setMobile(window.innerWidth < PLACEMENT_CONFIG.mobileBreakpoint)
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
  // Determine configuration based on mode
  const config = isMobile ? PLACEMENT_CONFIG.mobile : PLACEMENT_CONFIG.desktop

  // Frank scale logic
  const frankScale = config.scale.frank
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
          zIndex: 10,
          left: playerX,
          top: groundY + playerY - frankSpriteSize + config.verticalOffset.frank + (isDucking ? 60 : 0),
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
          {/* Boss Appearance Effect - particles and glow */}
          {currentEnemyType.id === 'boss' && showBossAppearEffect && (
            <div
              className="absolute pointer-events-none"
              style={{
                zIndex: 15,
                left: enemyX - 50,
                top: groundY - enemySpriteSize - 100,
                width: enemySpriteSize + 100,
                height: enemySpriteSize + 200,
              }}
            >
              {/* 1. Ground Vortex (Portal) - Darker & Deeper */}
              <div style={{
                position: 'absolute',
                left: '50%',
                bottom: 40,
                transform: 'translate(-50%, 50%) rotateX(75deg)',
                width: 220,
                height: 220,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #000000 30%, #4b0082 60%, transparent 80%)',
                boxShadow: '0 0 30px #8b00ff inset',
                opacity: 0.9,
                animation: 'portal-pulse 2s ease-in-out infinite',
              }} />

              {/* 2. Rotating Rune/Magic Circles */}
              <div style={{
                position: 'absolute',
                left: '50%',
                bottom: 50,
                transform: 'translate(-50%, 50%) rotateX(75deg)',
                width: 200,
                height: 200,
                border: '2px cubic-bezier(0.4, 0, 0.6, 1) #ff00ff',
                borderStyle: 'dashed',
                borderRadius: '50%',
                boxShadow: '0 0 10px #ff00ff, 0 0 20px #8b00ff',
                animation: 'rune-spin 4s linear infinite',
                opacity: 0.7,
              }} />
              <div style={{
                position: 'absolute',
                left: '50%',
                bottom: 50,
                transform: 'translate(-50%, 50%) rotateX(75deg)',
                width: 160,
                height: 160,
                border: '2px solid #00ffff',
                borderStyle: 'dotted',
                borderRadius: '50%',
                boxShadow: '0 0 10px #00ffff',
                animation: 'rune-spin-reverse 3s linear infinite',
                opacity: 0.6,
              }} />

              {/* 3. Intense Central Beam */}
              <div style={{
                position: 'absolute',
                left: '50%',
                bottom: 60,
                transform: 'translateX(-50%)',
                width: 140,
                height: '140%', // Taller
                background: 'linear-gradient(to top, white 0%, #d8b4fe 10%, rgba(139, 0, 255, 0.4) 40%, transparent 80%)',
                filter: 'blur(8px)',
                mixBlendMode: 'screen',
                animation: 'beam-intensify 0.2s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate',
              }} />

              {/* 4. Rising Particles (Fast & Energetic) */}
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${20 + Math.random() * 60}%`,
                    bottom: 60,
                    width: 3 + Math.random() * 6,
                    height: 10 + Math.random() * 30, // Stretch them vertically for speed look
                    background: i % 3 === 0 ? '#ff00ff' : i % 3 === 1 ? '#00ffff' : '#ffffff',
                    boxShadow: '0 0 10px currentColor',
                    animation: `rise-streak ${0.5 + Math.random() * 0.5}s linear infinite`,
                    animationDelay: `${Math.random()}s`,
                    opacity: 0,
                  }}
                />
              ))}

              {/* 5. Lightning Arcs (SVG Overlay) */}
              <div style={{ position: 'absolute', inset: -50, pointerEvents: 'none', filter: 'drop-shadow(0 0 5px #fff) drop-shadow(0 0 10px #bf00ff)' }}>
                <svg width="100%" height="100%" viewBox="0 0 200 300" preserveAspectRatio="none">
                  <path d="M100,50 L80,100 L120,150 L90,200 L110,250" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" style={{ opacity: 0, animation: 'lightning-1 0.4s infinite' }} />
                  <path d="M100,50 L130,120 L90,160 L110,220 L90,280" fill="none" stroke="#e0b0ff" strokeWidth="3" strokeLinecap="round" style={{ opacity: 0, animation: 'lightning-2 0.3s infinite 0.1s' }} />
                  <path d="M100,280 L70,220 L110,160 L80,100 L110,40" fill="none" stroke="#fff" strokeWidth="1" strokeLinecap="round" style={{ opacity: 0, animation: 'lightning-3 0.5s infinite 0.2s' }} />
                </svg>
              </div>

              {/* 6. Expanding Shockwaves */}
              <div style={{
                position: 'absolute',
                left: '50%',
                top: '60%', // Centered on boss body center
                width: 10,
                height: 10,
                border: '4px solid white',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%) scale(1)',
                opacity: 0,
                animation: 'shockwave 2s ease-out infinite',
              }} />
              <div style={{
                position: 'absolute',
                left: '50%',
                top: '60%',
                width: 10,
                height: 10,
                border: '2px solid #ff00ff',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%) scale(1)',
                opacity: 0,
                animation: 'shockwave 2s ease-out infinite 0.7s',
              }} />

              <style jsx>{`
                @keyframes portal-pulse {
                  0%, 100% { transform: translate(-50%, 50%) rotateX(75deg) scale(1); opacity: 0.9; }
                  50% { transform: translate(-50%, 50%) rotateX(75deg) scale(1.1); opacity: 1; }
                }
                @keyframes rune-spin { from { transform: translate(-50%, 50%) rotateX(75deg) rotate(0deg); } to { transform: translate(-50%, 50%) rotateX(75deg) rotate(360deg); } }
                @keyframes rune-spin-reverse { from { transform: translate(-50%, 50%) rotateX(75deg) rotate(360deg); } to { transform: translate(-50%, 50%) rotateX(75deg) rotate(0deg); } }
                @keyframes beam-intensify {
                  from { opacity: 0.8; height: 140%; transform: translateX(-50%) scaleX(1); }
                  to { opacity: 1; height: 150%; transform: translateX(-50%) scaleX(1.2); }
                }
                @keyframes rise-streak {
                  0% { transform: translateY(0) scaleY(1); opacity: 0; }
                  20% { opacity: 1; }
                  100% { transform: translateY(-400px) scaleY(2); opacity: 0; }
                }
                @keyframes lightning-1 { 0%, 100% { opacity: 0; } 5%, 15% { opacity: 1; } 20% { opacity: 0; } }
                @keyframes lightning-2 { 0%, 100% { opacity: 0; } 30%, 40% { opacity: 1; } 45% { opacity: 0; } }
                @keyframes lightning-3 { 0%, 100% { opacity: 0; } 60%, 70% { opacity: 1; } 75% { opacity: 0; } }
                @keyframes shockwave {
                  0% { transform: translate(-50%, -50%) scale(0.1); opacity: 0; border-width: 10px; }
                  10% { opacity: 1; }
                  100% { transform: translate(-50%, -50%) scale(20); opacity: 0; border-width: 0px; }
                }
              `}</style>
            </div>
          )}

          {/* Boss appearance sprite - shown during boss_appear phase */}
          {currentEnemyType.id === 'boss' && bossAppearing ? (
            <div
              className="absolute pointer-events-none"
              style={{
                zIndex: 20,
                left: enemyX,
                top: groundY - enemySpriteSize + 0, // Boss alignment
                width: enemySpriteSize,
                height: enemySpriteSize,
                backgroundImage: `url(/sprites/tool/appearBoss.png)`,
                backgroundPosition: `-${bossAppearFrame * LEADER_FRAME_SIZE * currentEnemyScale}px 0`,
                backgroundSize: `${3 * LEADER_FRAME_SIZE * currentEnemyScale}px ${enemySpriteSize}px`,
                backgroundRepeat: 'no-repeat',
                imageRendering: 'pixelated',
                // Dramatic glow effect during appearance
                filter: `drop-shadow(0 0 30px #8b00ff) drop-shadow(0 0 60px #ff00ff) brightness(1.2)`,
                animation: 'boss-materialize 2.5s ease-out forwards',
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
            <style jsx>{`
              @keyframes boss-materialize {
                0% { opacity: 0; transform: scale(0.5) translateY(50px); filter: brightness(4) blur(10px) contrast(200%); }
                10% { opacity: 1; transform: scale(0.8) translateY(20px); filter: brightness(3) blur(5px) contrast(150%); }
                40% { transform: scale(1.1) translateY(-10px); filter: brightness(1.5) blur(0) contrast(120%); }
                60% { transform: scale(0.98) translateY(0); filter: brightness(1.2) contrast(110%); }
                100% { opacity: 1; transform: scale(1) translateY(0); filter: brightness(1) contrast(100%); }
              }
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
      <BossProjectiles projectiles={bossProjectiles} groundY={groundY} />
      <BossBotProjectiles projectiles={bossBotProjectiles} groundY={groundY} />
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

function drawPlayerShadow(ctx, playerX, groundY, size) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  const safeSize = size || COMBAT_PLAYER_SIZE
  ctx.beginPath()
  ctx.ellipse(playerX + safeSize / 2, groundY - 5, safeSize / 4, 20, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawEnemyShadow(ctx, enemyX, groundY, size) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  const safeSize = size || 128 * COMBAT_SCALE
  ctx.beginPath()
  ctx.ellipse(enemyX + safeSize / 2, groundY - 5, safeSize / 4, 20, 0, 0, Math.PI * 2)
  ctx.fill()
}
