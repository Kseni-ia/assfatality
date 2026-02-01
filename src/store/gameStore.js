import { create } from 'zustand'
import { PLAYER_HITBOX, OBSTACLE_SIZES } from '../config/settings'
import { getPlacementConfig } from '../config/characterPlacement'
import { ENEMY_HEALTH, DAMAGE_VALUES } from '../config/gameConfig'
import { audioManager } from '../utils/audioManager'

export const GAME_STATES = {
  MENU: 'menu',
  OBSTACLE_PHASE: 'obstacle_phase',
  COMBAT_INTRO: 'combat_intro',
  COMBAT_PHASE: 'combat_phase',
  ASS_FATALITY: 'ass_fatality',
  VICTORY: 'victory',
  GAME_OVER: 'game_over',
}

export const ENEMY_STATES = {
  RUNNING: 'running',
  IDLE: 'idle',
  ATTACK_HIGH: 'attack_high',
  ATTACK_LOW: 'attack_low',
}

export const PLAYER_STATES = {
  IDLE: 'idle',
  RUNNING: 'running',
  JUMPING: 'jumping',
  DUCKING: 'ducking',
  HIT: 'hit',
  FATALITY: 'fatality',
}

export const ENEMY_TYPES = {
  LUKAS: { id: 'lukas', name: 'Lukas', attackType: 'LOW', speed: 1.0, health: ENEMY_HEALTH.LUKAS, isLeader: false },
  DUCA: { id: 'duca', name: 'Duca', attackType: 'HIGH', speed: 1.0, health: ENEMY_HEALTH.DUCA, isLeader: false },
  LEADER: { id: 'leader', name: 'Leader', attackType: 'MIXED', speed: 1.0, health: ENEMY_HEALTH.LEADER, isLeader: true },
  BOSS: { id: 'boss', name: 'Boss', attackType: 'MIXED', speed: 1.0, health: ENEMY_HEALTH.BOSS, isLeader: false, isBoss: true },
}

// Enemy sequence order
export const ENEMY_SEQUENCE = ['LUKAS', 'DUCA', 'LEADER', 'BOSS']

const INITIAL_STATE = {
  gameState: GAME_STATES.MENU,
  playerState: PLAYER_STATES.IDLE,
  playerX: 100,
  playerY: 0,
  playerVelocityY: 0,
  isJumping: false,
  isDucking: false,
  jumpHoldTime: 0,

  hp: 3,
  score: 0,
  assMeter: 0,

  enemies: [],
  currentEnemyIndex: 0,
  defeatedEnemies: 0,

  obstacles: [],
  obstaclesPassed: 0,

  attackWarning: null,
  enemyHitTimestamp: 0,
  perfectDodge: false,
  comboCount: 0,

  fatalityTargets: [],
  fatalityScore: 0,
  blondesCount: 0,

  // Mana system for assTool
  mana: 0,
  maxMana: 6, // 6 hearts
  assToolProjectiles: [],
  lastManaRegen: 0,

  // Boss projectiles (travellSmoke for HIGH attacks, attackBossBot for LOW attacks)
  bossProjectiles: [],
  bossBotProjectiles: [], // LOW attack projectiles

  effects: [],
  particles: [],

  isMobile: false,
  screenShake: false,
  slowMotion: false,
  isInvincible: false,
  isBlinking: false,
  lastHitHeart: -1,

  // Combat intro
  enemyX: 900,
  enemyState: 'idle',
  showFightText: false,
  combatTimer: 0,
  introPhase: 'running',
  lastAttackCycle: -1,

  // Enemy combat
  currentEnemyType: null,
  enemyHealth: 0,
  enemySequenceIndex: 0,
  showLeaderAnnouncement: false,
  showBossAnnouncement: false, // New: for Boss intro
  bossAnnouncementStarted: false, // Prevent multiple setTimeout calls

  // Boss appearance animation state
  bossAppearing: false, // Whether boss is in appear animation
  bossAppearFrame: 0, // Current frame of appearance animation (0-3)
  bossAppearStartTime: 0, // Timestamp when appearance started
  showBossAppearEffect: false, // Show particle/glow effects

  // Attack state
  attackActive: false,
  currentAttackType: null,
  windupProgress: 0, // 0 to 1 loading bar
  dodgeProcessed: false, // Track if current attack was dodged

  // Ultimate Cinematic State
  ultimatePhase: 'none', // 'none', 'shake', 'grow', 'crash', 'impact'
  startUltimateTime: 0,
  ultimatePos: { x: 0, y: 0 },
  ultimateScale: 1,

  // Dev Pause
  isPaused: false,
}

export const useGameStore = create((set, get) => ({
  ...INITIAL_STATE,

  // Game flow
  startGame: () => {
    set({
      ...INITIAL_STATE,
      gameState: GAME_STATES.OBSTACLE_PHASE,
      playerState: PLAYER_STATES.RUNNING,
      isMobile: get().isMobile,
      obstacles: generateObstacles(),
      mana: 0,
      assToolProjectiles: [],
    })
  },

  setGameState: (gameState) => set({ gameState }),

  setPlayerX: (x) => set({ playerX: x }),

  setMobile: (isMobile) => set({ isMobile }),

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

  // Restart level after losing a heart (keeps hp and score)
  restartLevel: () => {
    set({
      playerState: PLAYER_STATES.RUNNING,
      playerX: 100,
      playerY: 0,
      playerVelocityY: 0,
      isJumping: false,
      isDucking: false,
      jumpHoldTime: 0,
      obstacles: generateObstacles(),
      obstaclesPassed: 0,
      screenShake: false,
      isBlinking: true,
      isInvincible: true,
    })
    // Blinking lasts 2 seconds, then player is vulnerable again
    setTimeout(() => {
      set({ isBlinking: false, isInvincible: false, lastHitHeart: -1 })
    }, 2000)
  },

  // Player actions
  jump: () => {
    const { playerState, isJumping, gameState } = get()
    if (gameState !== GAME_STATES.OBSTACLE_PHASE && gameState !== GAME_STATES.COMBAT_PHASE) return
    if (isJumping) return

    set({
      isJumping: true,
      playerState: PLAYER_STATES.JUMPING,
      playerVelocityY: -18, // Reduced further from -20 (very floaty)
      jumpHoldTime: Date.now(),
    })
    audioManager.play('jump')
  },

  holdJump: () => {
    const { isJumping, playerVelocityY, jumpHoldTime } = get()
    if (!isJumping || !jumpHoldTime) return

    const holdDuration = Date.now() - jumpHoldTime
    if (holdDuration < 200 && playerVelocityY < 0) {
      set({ playerVelocityY: playerVelocityY - 0.5 })
    }
  },

  releaseJump: () => {
    set({ jumpHoldTime: 0 })
  },

  duck: () => {
    const { isJumping, isDucking, gameState } = get()
    if (gameState !== GAME_STATES.OBSTACLE_PHASE && gameState !== GAME_STATES.COMBAT_PHASE) return
    if (isJumping || isDucking) return // Prevent restart if already ducking

    set({ isDucking: true, playerState: PLAYER_STATES.DUCKING })
    audioManager.play('duck')

    // Max duck time 1 second
    setTimeout(() => {
      const { isDucking } = get()
      if (isDucking) {
        get().stopDuck()
      }
    }, 1000)
  },

  stopDuck: () => {
    const { isDucking, isJumping } = get()
    if (isDucking && !isJumping) {
      set({ isDucking: false, playerState: PLAYER_STATES.IDLE })
    }
  },

  updatePlayer: (deltaTime) => {
    const { playerY, playerVelocityY, isJumping, gameState } = get()

    if (!isJumping) return

    const gravity = 0.4 // Reduced further from 0.5 to make jump super floaty
    const newVelocityY = playerVelocityY + gravity
    const newPlayerY = playerY + newVelocityY

    if (newPlayerY >= 0) {
      set({
        playerY: 0,
        playerVelocityY: 0,
        isJumping: false,
        playerState: gameState === GAME_STATES.OBSTACLE_PHASE ? PLAYER_STATES.RUNNING : PLAYER_STATES.IDLE,
      })
    } else {
      set({ playerY: newPlayerY, playerVelocityY: newVelocityY })
    }
  },

  // Combat
  startCombatIntro: (enemyIndex = null) => {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000
    const { enemySequenceIndex } = get()
    const index = enemyIndex !== null ? enemyIndex : enemySequenceIndex
    const enemyKey = ENEMY_SEQUENCE[index]
    const enemyType = ENEMY_TYPES[enemyKey]

    if (!enemyType) {
      // All enemies defeated
      set({ gameState: GAME_STATES.VICTORY })
      return
    }

    const centerX = screenWidth / 2

    // Get placement config (mobile/desktop)
    const config = getPlacementConfig(screenWidth)
    const { playerOffset, enemyOffsetClose, enemyOffsetFar } = config.position

    const playerTargetX = centerX - playerOffset

    // Boss positioned much further back, others closer
    const isBoss = enemyType.isBoss
    const enemyTargetOffset = isBoss ? enemyOffsetFar : enemyOffsetClose
    const enemyTargetX = centerX + enemyTargetOffset

    // Boss appears in place, no running intro
    if (enemyType.isBoss) {
      set({
        gameState: GAME_STATES.COMBAT_INTRO,
        playerState: PLAYER_STATES.IDLE,
        enemies: [{ ...enemyType, isAttacking: false, attackTimer: 2000, animFrame: 0 }],
        currentEnemyIndex: 0,
        currentEnemyType: enemyType,
        enemyHealth: enemyType.health,
        enemySequenceIndex: index,
        // Boss appears in position, player too
        playerX: playerTargetX,
        enemyX: enemyTargetX,
        enemyState: ENEMY_STATES.IDLE,
        showFightText: false,
        showLeaderAnnouncement: false,
        showBossAnnouncement: true, // Show "BOSS!" text
        combatTimer: 0,
        introPhase: 'boss_announcement',
        lastAttackCycle: -1,
        mana: 0,
        lastManaRegen: Date.now(),
        assToolProjectiles: [],
        bossProjectiles: [],
        bossBotProjectiles: [],
        // Boss appearance animation - starts invisible
        bossAppearing: false,
        bossAppearFrame: 0,
        bossAppearStartTime: 0,
        showBossAppearEffect: false,
      })
    } else {
      set({
        gameState: GAME_STATES.COMBAT_INTRO,
        playerState: PLAYER_STATES.RUNNING,
        enemies: [{ ...enemyType, isAttacking: false, attackTimer: 2000, animFrame: 0 }],
        currentEnemyIndex: 0,
        currentEnemyType: enemyType,
        enemyHealth: enemyType.health,
        enemySequenceIndex: index,
        // Both start from edges and run to center
        playerX: -100,
        enemyX: screenWidth + 100,
        enemyState: ENEMY_STATES.RUNNING,
        showFightText: false,
        showLeaderAnnouncement: enemyType.isLeader,
        showBossAnnouncement: false,
        combatTimer: 0,
        introPhase: enemyType.isLeader ? 'leader_announcement' : 'running',
        lastAttackCycle: -1,
        // Reset mana for new fight
        mana: 0,
        lastManaRegen: Date.now(),
        assToolProjectiles: [],
        bossProjectiles: [],
        bossBotProjectiles: [],
      })
    }
  },

  // Dev function to jump to a specific enemy fight with proper game state
  // Sets up state as if player naturally progressed to this point
  devJumpTo: (enemyIndex) => {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000
    const enemyKey = ENEMY_SEQUENCE[enemyIndex]
    const enemyType = ENEMY_TYPES[enemyKey]

    if (!enemyType) return

    const centerX = screenWidth / 2

    // Get placement config (mobile/desktop)
    const config = getPlacementConfig(screenWidth)
    const { playerOffset, enemyOffsetClose, enemyOffsetFar } = config.position

    const playerTargetX = centerX - playerOffset
    const isBoss = enemyType.isBoss
    const enemyTargetOffset = isBoss ? enemyOffsetFar : enemyOffsetClose
    const enemyTargetX = centerX + enemyTargetOffset

    // Set up state as if player progressed naturally
    // Full HP, some score based on progress, proper enemy sequence index
    const baseState = {
      gameState: GAME_STATES.COMBAT_INTRO,
      hp: 3, // Full health
      score: enemyIndex * 1000, // Score based on progress
      assMeter: 0, // Start empty
      enemies: [{ ...enemyType, isAttacking: false, attackTimer: 2000, animFrame: 0 }],
      currentEnemyIndex: 0,
      currentEnemyType: enemyType,
      enemyHealth: enemyType.health,
      enemySequenceIndex: enemyIndex, // This ensures next enemy is correct after defeating this one
      defeatedEnemies: enemyIndex, // Track how many defeated before this
      showFightText: false,
      lastAttackCycle: -1,
      mana: 0,
      lastManaRegen: Date.now(),
      assToolProjectiles: [],
      bossProjectiles: [],
      bossBotProjectiles: [],
      obstacles: [],
      obstaclesPassed: 0,
      isInvincible: false,
      isBlinking: false,
      attackWarning: null,
      attackActive: false,
      windupProgress: 0,
      dodgeProcessed: false,
    }

    // Boss appears in place, others run in
    if (enemyType.isBoss) {
      set({
        ...baseState,
        playerState: PLAYER_STATES.IDLE,
        playerX: playerTargetX,
        enemyX: enemyTargetX,
        enemyState: ENEMY_STATES.IDLE,
        showLeaderAnnouncement: false,
        showBossAnnouncement: true,
        combatTimer: 0,
        introPhase: 'boss_announcement',
      })
    } else {
      set({
        ...baseState,
        playerState: PLAYER_STATES.RUNNING,
        playerX: -100,
        enemyX: screenWidth + 100,
        enemyState: ENEMY_STATES.RUNNING,
        showLeaderAnnouncement: enemyType.isLeader,
        showBossAnnouncement: false,
        combatTimer: 0,
        introPhase: enemyType.isLeader ? 'leader_announcement' : 'running',
      })
    }
  },

  devJumpToObstacle: (enemyIndex) => {
    // Setup state for obstacle phase preceding the given enemy index
    set({
      ...INITIAL_STATE,
      gameState: GAME_STATES.OBSTACLE_PHASE,
      playerState: PLAYER_STATES.RUNNING,
      obstacles: generateObstacles(),
      obstaclesPassed: 0,
      enemySequenceIndex: enemyIndex,
      defeatedEnemies: enemyIndex,
      score: enemyIndex * 1000,
      mana: 0,
    })
  },

  updateCombatIntro: () => {
    const { enemyX, playerX, introPhase } = get()
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000
    const centerX = screenWidth / 2

    // Target positions - meet in center with characters closer together for combat
    // Get placement config (mobile/desktop)
    const config = getPlacementConfig(screenWidth)
    const { playerOffset, enemyOffsetClose, enemyOffsetFar } = config.position

    const playerTargetX = centerX - playerOffset

    // Lukas, Duca, Leader fight closer
    const { currentEnemyType } = get()
    const isBoss = currentEnemyType?.isBoss
    const enemyTargetOffset = isBoss ? enemyOffsetFar : enemyOffsetClose
    const enemyTargetX = centerX + enemyTargetOffset

    // Leader announcement phase
    if (introPhase === 'leader_announcement') {
      // Show "LEADER!" for 2 seconds then start running
      setTimeout(() => {
        set({
          showLeaderAnnouncement: false,
          introPhase: 'running',
        })
      }, 2000)
      return
    }

    // Boss announcement phase - show "BOSS!" then transition to appear animation
    if (introPhase === 'boss_announcement') {
      // Use a flag to prevent multiple setTimeout calls (since this runs every frame)
      const { bossAnnouncementStarted } = get()
      if (bossAnnouncementStarted) return

      set({ bossAnnouncementStarted: true })

      // Show "BOSS!" for 2 seconds then start appearance animation
      setTimeout(() => {
        set({
          showBossAnnouncement: false,
          introPhase: 'boss_appear',
          bossAppearing: true,
          bossAppearFrame: 0,
          bossAppearStartTime: Date.now(),
          showBossAppearEffect: true,
        })
      }, 2000)
      return
    }

    // Boss appearance animation phase - play appear animation with effects
    if (introPhase === 'boss_appear') {
      const { bossAppearStartTime, bossAppearFrame } = get()
      const elapsed = Date.now() - bossAppearStartTime
      const appearDuration = 2500 // 2.5 seconds for appearance
      const frameCount = 3
      const frameTime = appearDuration / frameCount // ~625ms per frame

      // Calculate current frame based on elapsed time
      const newFrame = Math.min(frameCount - 1, Math.floor(elapsed / frameTime))

      if (newFrame !== bossAppearFrame) {
        set({ bossAppearFrame: newFrame })
      }

      // Appearance complete - transition to fight text
      if (elapsed >= appearDuration) {
        set({
          bossAppearing: false,
          showBossAppearEffect: false,
          showFightText: true,
          introPhase: 'fight_text',
          bossAnnouncementStarted: false, // Reset for next time
        })
        audioManager.play('fight')

        // Start combat after "FIGHT!" text
        setTimeout(() => {
          set({
            gameState: GAME_STATES.COMBAT_PHASE,
            showFightText: false,
            enemyState: ENEMY_STATES.IDLE,
            combatTimer: Date.now(),
            introPhase: 'combat',
            mana: 0,
            lastManaRegen: Date.now(),
          })
        }, 1500)
      }
      return
    }

    if (introPhase === 'running') {
      // Move both towards center
      const newPlayerX = Math.min(playerX + 4, playerTargetX)
      const newEnemyX = Math.max(enemyX - 4, enemyTargetX)

      set({ playerX: newPlayerX, enemyX: newEnemyX })

      // Both reached their positions
      if (newPlayerX >= playerTargetX && newEnemyX <= enemyTargetX) {
        set({
          playerState: PLAYER_STATES.IDLE,
          enemyState: ENEMY_STATES.IDLE,
          showFightText: true,
          introPhase: 'fight_text',
        })
        audioManager.play('fight')
        // Start combat after "FIGHT!" text
        setTimeout(() => {
          set({
            gameState: GAME_STATES.COMBAT_PHASE,
            showFightText: false,
            enemyState: ENEMY_STATES.IDLE,
            combatTimer: Date.now(),
            introPhase: 'combat',
            mana: 0,
            lastManaRegen: Date.now(),
          })
        }, 1500)
      }
    }
  },

  updateCombat: () => {
    const { combatTimer, enemyState, lastAttackCycle, currentEnemyType, attackActive, isJumping, isDucking, hp, enemyHealth } = get()
    if (!combatTimer || !currentEnemyType || enemyHealth <= 0) return

    const elapsed = Date.now() - combatTimer
    const cycleDuration = 2500 // Faster! 2.5 seconds per cycle (was 4000)
    const windupTime = 1200 // Faster warning (was 2000)
    const activeTime = 500 // 0.5s active damage window
    const restTime = 800 // Less downtime (was 1500)

    const attackCycle = Math.floor(elapsed / cycleDuration)
    const timeInCycle = elapsed % cycleDuration

    // Determine attack type based on enemy
    let attackType
    if (currentEnemyType.attackType === 'LOW') {
      attackType = 'LOW' // Lukas only ground attacks
    } else if (currentEnemyType.attackType === 'HIGH') {
      attackType = 'HIGH' // Duca only high attacks
    } else {
      // Leader alternates randomly
      // Use pseudo-random based on cycle to be deterministic per cycle but unpredictable
      attackType = (Math.floor(Math.abs(Math.sin(attackCycle + 1) * 10000)) % 2 === 0) ? 'HIGH' : 'LOW'
    }

    const enemyAnimState = attackType === 'HIGH' ? ENEMY_STATES.ATTACK_HIGH : ENEMY_STATES.ATTACK_LOW

    // New attack cycle started - show warning, enemy stays IDLE
    if (attackCycle !== lastAttackCycle) {
      set({
        enemyState: ENEMY_STATES.IDLE, // Stay idle during windup
        lastAttackCycle: attackCycle,
        currentAttackType: attackType,
        attackActive: false,
        windupProgress: 0,
        dodgeProcessed: false,
      })
      get().setAttackWarning({ type: attackType })
    }

    // During windup phase - update progress bar every frame
    if (timeInCycle < windupTime) {
      const progress = timeInCycle / windupTime
      set({
        windupProgress: progress,
        enemyState: ENEMY_STATES.IDLE, // Keep idle during windup
        attackActive: false,
      })
    }

    // Attack becomes active ONLY when windup is complete (bar at 100%)
    if (timeInCycle >= windupTime && timeInCycle < windupTime + activeTime) {
      const { attackActive: wasActive } = get()
      if (!wasActive) {
        // Attack just became active - NOW play attack animation
        set({
          attackActive: true,
          enemyState: enemyAnimState, // Only now play attack animation
          windupProgress: 1,
        })
        const enemyId = get().currentEnemyType.id
        audioManager.play(enemyId === 'leader' ? 'leaderAttack' : enemyId + 'Attack')

        // Boss spawns a projectile attack - different projectile based on attack type
        if (currentEnemyType.isBoss) {
          const { enemyX, bossProjectiles, bossBotProjectiles } = get()
          const newProjectile = {
            id: Date.now(),
            x: enemyX - 100, // Start near boss
            frame: 0,
            speed: 20, // Speed toward Frank
            hit: false,
          }

          if (attackType === 'HIGH') {
            // HIGH attack - travellSmoke (player must duck)
            set({ bossProjectiles: [...bossProjectiles, newProjectile] })
          } else {
            // LOW attack - travellSmoke at ground level (player must jump)
            set({ bossBotProjectiles: [...bossBotProjectiles, newProjectile] })
          }
        }
      }

      // Continuously check if player gets hit during the ENTIRE active window
      // This ensures landing from a jump during the active window still counts as a hit
      // SKIP this for boss - boss uses projectile-based damage in updateBossProjectiles
      if (!currentEnemyType.isBoss) {
        const { isJumping, isDucking, hp, isInvincible } = get()
        let playerHit = false

        if (attackType === 'LOW') {
          // Ground attack hits if player is on ground (not jumping)
          if (!isJumping) {
            playerHit = true
          }
        } else if (attackType === 'HIGH') {
          // High attack hits if player is not ducking
          if (!isDucking) {
            playerHit = true
          }
        }

        // Dodge Reward Logic
        const { dodgeProcessed, assMeter, score, comboCount } = get()
        if (!playerHit && !dodgeProcessed) {
          // If we are in the active window and NOT hit, check if we are successfully dodging
          let successfulDodge = false
          if (attackType === 'LOW' && isJumping) successfulDodge = true
          if (attackType === 'HIGH' && isDucking) successfulDodge = true

          if (successfulDodge) {
            const meterGain = 5 // 20 dodges to fill (100 / 5)
            const newMeter = Math.min(100, assMeter + meterGain)
            const newCombo = comboCount + 1

            set({
              dodgeProcessed: true,
              assMeter: newMeter,
              score: score + 100 * newCombo,
              comboCount: newCombo,
            })

            let comboText = 'AWESOME!'
            if (newCombo > 1) {
              const praises = ['GREAT!', 'FANTASTIC!', 'SUPER!', 'WILD!', '', '']
              const praise = praises[Math.floor(Math.random() * praises.length)]
              comboText = praise ? `${newCombo}x COMBO! ${praise}` : `${newCombo}x COMBO!`
            }
            get().addEffect(comboText, true)
          }
        }

        if (playerHit && !isInvincible) {
          const newHp = hp - 1
          set({
            hp: newHp,
            assMeter: 0, // Reset meter on hit
            comboCount: 0, // Reset combo on hit
            screenShake: true,
            isInvincible: true,
          })
          setTimeout(() => set({ screenShake: false, isInvincible: false }), 500)

          if (newHp <= 0) {
            set({ gameState: GAME_STATES.GAME_OVER })
            audioManager.play('lose')
          } else {
            audioManager.play('frankDamage')
          }
        }
      }
    }

    // Attack ends, return to idle and clear warning (rest period)
    if (timeInCycle >= windupTime + activeTime) {
      set({
        enemyState: ENEMY_STATES.IDLE,
        attackActive: false,
        windupProgress: 0,
      })
      get().setAttackWarning(null)
    }
  },

  // Damage enemy when Frank successfully dodges
  damageEnemy: () => {
    const { enemyHealth, enemySequenceIndex } = get()
    const newHealth = enemyHealth - 1

    if (newHealth <= 0) {
      get().advanceToNextLevel()
    } else {
      set({ enemyHealth: newHealth })
      const enemyId = get().currentEnemyType.id
      audioManager.play(enemyId === 'leader' ? 'leaderHit' : enemyId + 'Hit')
    }
  },

  advanceToNextLevel: () => {
    const { enemySequenceIndex, defeatedEnemies } = get()
    const nextIndex = enemySequenceIndex + 1
    const newDefeated = defeatedEnemies + 1

    if (nextIndex >= ENEMY_SEQUENCE.length) {
      set({
        enemyHealth: 0,
        defeatedEnemies: newDefeated,
        gameState: GAME_STATES.VICTORY
      })
      audioManager.play('win')
    } else {
      // Enemy defeated - Play sound and clear combat state
      set({
        enemyHealth: 0,
        defeatedEnemies: newDefeated,
        attackActive: false,
        attackWarning: null
      })
      audioManager.play('enemyDeath')

      // Short delay then start next OBSTACLE PHASE
      setTimeout(() => {
        set({
          gameState: GAME_STATES.OBSTACLE_PHASE,
          enemySequenceIndex: nextIndex,
          obstacles: generateObstacles(),
          obstaclesPassed: 0,
          // Reset player for running
          playerState: PLAYER_STATES.RUNNING,
          playerX: 100,
          playerY: 0,
          playerVelocityY: 0,
          isJumping: false,
          isDucking: false,
          // Reset combat flags
          screenShake: false,
          isInvincible: false,
          mana: 0,
          assToolProjectiles: [],
          bossProjectiles: [],
          bossBotProjectiles: [],
        })
      }, 1500)
    }
  },

  startCombatPhase: () => {
    get().startCombatIntro() // Uses current enemySequenceIndex from state
  },

  processEnemyAttack: (attackType) => {
    const { isDucking, isJumping, assMeter, hp, score, comboCount } = get()

    let dodged = false
    let perfect = false

    if (attackType === 'HIGH' && isDucking) {
      dodged = true
    } else if (attackType === 'LOW' && isJumping) {
      dodged = true
    } else if (attackType === 'MIXED' && (isDucking || isJumping)) {
      dodged = true
    }

    if (dodged) {
      const timing = Math.random()
      perfect = timing > 0.7

      const meterGain = perfect ? 10 : 5 // ~20 hits to fill (100 / 5)
      const newMeter = Math.min(100, assMeter + meterGain)
      const newCombo = comboCount + 1
      const scoreGain = perfect ? 200 * newCombo : 100 * newCombo

      set({
        assMeter: newMeter,
        score: score + scoreGain,
        comboCount: newCombo,
        perfectDodge: perfect,
        attackWarning: null,
      })

      if (perfect) {
        set({ slowMotion: true })
        setTimeout(() => set({ slowMotion: false }), 300)
      }

      get().addEffect(perfect ? 'PERFECT!' : 'DODGE!', perfect)
      audioManager.play('frankAttack')
      if (perfect) audioManager.play('perfect')

      // Damage enemy on successful dodge
      get().damageEnemy()
    } else {
      const newHp = hp - 1
      set({
        hp: newHp,
        assMeter: Math.max(0, assMeter - 15),
        comboCount: 0,
        screenShake: true,
        attackWarning: null,
      })

      setTimeout(() => set({ screenShake: false }), 300)
      get().addEffect('HIT!', false)

      if (newHp <= 0) {
        set({ gameState: GAME_STATES.GAME_OVER })
        audioManager.play('lose')
      } else {
        audioManager.play('frankDamage')
      }
    }
  },

  setAttackWarning: (warning) => set({ attackWarning: warning }),

  defeatEnemy: () => {
    get().advanceToNextLevel()
  },

  // ASS FATALITY
  triggerAssFatality: () => {
    const { assMeter, gameState } = get()
    if (assMeter < 100 || gameState !== GAME_STATES.COMBAT_PHASE) return

    set({
      gameState: GAME_STATES.ASS_FATALITY,
      fatalityTargets: generateFatalityTargets(),
      fatalityScore: 0,
      slowMotion: true,
    })
  },

  triggerCinematicUltimate: () => {
    const { assMeter, gameState, enemies } = get()
    if (assMeter < 100 || gameState !== GAME_STATES.COMBAT_PHASE) return

    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000
    const startX = screenWidth / 2
    const startY = 150 // Approx top-20 location

    set({
      gameState: GAME_STATES.ASS_FATALITY, // This freezes the normal combat loop
      ultimatePhase: 'shake',
      ultimatePos: { x: startX, y: startY },
      ultimateScale: 1,
      startUltimateTime: Date.now(),
      // Freeze characters in Idle
      playerState: PLAYER_STATES.IDLE,
      enemyState: ENEMY_STATES.IDLE,
    })
    audioManager.play('fatality')
  },

  updateUltimate: () => {
    const { ultimatePhase, startUltimateTime, ultimatePos, enemyX, enemyHealth, currentEnemyType } = get()
    if (ultimatePhase === 'none') return

    const now = Date.now()
    const elapsed = now - startUltimateTime

    // Phase 1: Shake (0 - 1.5s)
    if (elapsed < 1500) {
      // Jitter
      const jitter = 5
      set({
        ultimatePhase: 'shake',
        ultimatePos: {
          x: (typeof window !== 'undefined' ? window.innerWidth / 2 : 500) + (Math.random() * jitter - jitter / 2),
          y: 150 + (Math.random() * jitter - jitter / 2)
        }
      })
    }
    // Phase 2: Grow (1.5s - 2.5s)
    else if (elapsed < 2500) {
      const growProgress = (elapsed - 1500) / 1000
      set({
        ultimatePhase: 'grow',
        ultimateScale: 1 + growProgress * 0.5, // Grow to 1.5x
        ultimatePos: { x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500, y: 150 } // Stabilize
      })
    }
    // Phase 3: Crash (Start moving towards enemy)
    else if (ultimatePhase !== 'impact') {
      // Move towards enemy
      // Target: Enemy center (approx)
      const targetX = enemyX + 50
      const targetY = 400 // Middle of screen height approx

      const dx = targetX - ultimatePos.x
      const dy = targetY - ultimatePos.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 50) {
        // IMPACT!
        // IMPACT!
        const maxHp = currentEnemyType ? currentEnemyType.health : 6
        const damage = maxHp * DAMAGE_VALUES.ULTIMATE_PERCENTAGE // 30% damage
        const newHealth = Math.max(0, enemyHealth - damage)

        set({
          ultimatePhase: 'impact',
          enemyHealth: newHealth,
          screenShake: true,
          assMeter: 0, // Consume meter
        })

        get().addEffect('FATALITY!', true)

        // Wait a bit then resume or victory
        setTimeout(() => {
          set({ screenShake: false, ultimatePhase: 'none', gameState: GAME_STATES.COMBAT_PHASE })
          if (newHealth <= 0) {
            get().defeatEnemy()
          }
        }, 1000)

      } else {
        // Move fast
        const speed = 40
        const angle = Math.atan2(dy, dx)
        set({
          ultimatePhase: 'crash',
          ultimatePos: {
            x: ultimatePos.x + Math.cos(angle) * speed,
            y: ultimatePos.y + Math.sin(angle) * speed
          }
        })
      }
    }
  },

  hitFatalityTarget: (targetId, timing) => {
    const { fatalityTargets, fatalityScore } = get()
    const target = fatalityTargets.find(t => t.id === targetId)
    if (!target || target.hit) return

    const isHit = timing === 'perfect' || timing === 'good'
    const points = timing === 'perfect' ? 2 : 1

    if (timing === 'perfect') {
      audioManager.play('perfect')
    } else if (isHit) {
      audioManager.play('frankAttack')
    }

    set({
      fatalityTargets: fatalityTargets.map(t =>
        t.id === targetId ? { ...t, hit: true, timing } : t
      ),
      fatalityScore: fatalityScore + (isHit ? points : 0),
    })
  },

  completeFatality: () => {
    const { fatalityScore, score, defeatedEnemies } = get()

    let blondes = 1
    if (fatalityScore >= 8) blondes = 3
    else if (fatalityScore >= 5) blondes = 2

    set({
      blondesCount: blondes,
      score: score + blondes * 500,
      assMeter: 0,
      slowMotion: false,
    })

    setTimeout(() => {
      const state = get()
      if (state.defeatedEnemies < 3) {
        set({ gameState: GAME_STATES.COMBAT_PHASE })
        get().defeatEnemy()
      } else {
        set({ gameState: GAME_STATES.VICTORY })
      }
    }, 3000)
  },

  // Effects
  addEffect: (text, isPerfect = false) => {
    const { effects } = get()
    const id = Date.now()
    set({
      effects: [...effects, { id, text, isPerfect, x: 300, y: 200 }]
    })
    setTimeout(() => {
      set({ effects: get().effects.filter(e => e.id !== id) })
    }, 800)
  },

  addParticle: (x, y, color) => {
    const { particles } = get()
    const id = Date.now() + Math.random()
    set({
      particles: [...particles, { id, x, y, color }]
    })
    setTimeout(() => {
      set({ particles: get().particles.filter(p => p.id !== id) })
    }, 1000)
  },

  // Passive meter gain - REMOVED per request (only fills on dodge)
  tickAssMeter: () => {
    // const { assMeter, gameState } = get()
    // if (gameState !== GAME_STATES.COMBAT_PHASE) return
    // set({ assMeter: Math.min(100, assMeter + 0.1) })
  },

  // Mana regeneration (called every frame during combat)
  tickMana: () => {
    const { mana, maxMana, gameState, lastManaRegen } = get()
    if (gameState !== GAME_STATES.COMBAT_PHASE) return

    const now = Date.now()
    const deltaSeconds = (now - lastManaRegen) / 1000

    if (deltaSeconds > 0.05) { // Update every 50ms
      const manaGain = 0.25 * deltaSeconds // 0.25 mana per second (1 heart every 4 secs)
      set({
        mana: Math.min(maxMana, mana + manaGain),
        lastManaRegen: now,
      })
    }
  },

  // Shoot assTool (requires > 0 mana)
  shootAssTool: () => {
    const { mana, maxMana, gameState, playerX, assToolProjectiles } = get()
    if (gameState !== GAME_STATES.COMBAT_PHASE) return false
    if (mana < 1) return false // Need at least 1 heart

    // Launch single projectile immediately
    const firstProjectile = {
      id: Date.now(),
      x: playerX + 20, // Spawn very close to Frank
      y: -250, // Adjusted to Middle Height (ground - 250px)
      speed: 18,
      frame: 0,
      hit: false,
    }

    set({
      mana: mana - 1, // Consume 1 heart
      assToolProjectiles: [...assToolProjectiles, firstProjectile],
    })
    audioManager.play('frankAttack')

    return true
  },

  // Update assTool projectiles
  updateAssToolProjectiles: () => {
    const { assToolProjectiles, enemyX, enemyHealth, currentEnemyType, gameState } = get()
    if (gameState !== GAME_STATES.COMBAT_PHASE) return
    if (assToolProjectiles.length === 0) return

    let damageDealt = 0

    const updatedProjectiles = assToolProjectiles.map(proj => {
      const newX = proj.x + proj.speed
      // Very slow animation: increment by ~0.008 so each frame shows for ~2 seconds (120 ticks)
      const newFrame = (proj.frame + 0.008) % 2 // 2 frame animation, very slow cycling

      // Only damage if it hasn't hit THIS enemy yet (we use 'hit' flag for this single combat instance)
      if (!proj.hit && newX >= enemyX && newX <= enemyX + 100) {
        damageDealt++
        return { ...proj, x: newX, frame: newFrame, hit: true } // Mark as hit but continue moving
      }

      return { ...proj, x: newX, frame: newFrame }
    }).filter(proj => proj.x < (typeof window !== 'undefined' ? window.innerWidth + 100 : 1200)) // Only remove when off-screen

    set({ assToolProjectiles: updatedProjectiles })

    // Apply damage to enemy
    if (damageDealt > 0 && currentEnemyType) {
      // REDUCED DAMAGE: Now using configured value (1)
      const newHealth = Math.max(0, enemyHealth - (damageDealt * DAMAGE_VALUES.ASS_TOOL))

      if (newHealth <= 0) {
        // Enemy defeated
        get().advanceToNextLevel()
      } else {
        set({ enemyHealth: newHealth, screenShake: true, enemyHitTimestamp: Date.now() })
        setTimeout(() => set({ screenShake: false }), 200)
        const enemyId = get().currentEnemyType.id
        audioManager.play(enemyId === 'leader' ? 'leaderHit' : enemyId + 'Hit')
      }
    }
  },

  // Update boss projectiles (travellSmoke attacks)
  updateBossProjectiles: () => {
    const { bossProjectiles, playerX, hp, isJumping, isDucking, gameState, isInvincible, currentEnemyType } = get()
    if (gameState !== GAME_STATES.COMBAT_PHASE) return
    if (bossProjectiles.length === 0) return
    if (!currentEnemyType?.isBoss) return

    // Hit zone at Frank's approximate center
    const hitZoneX = playerX + 200

    const updatedProjectiles = bossProjectiles.map(proj => {
      // Always calculate new position moving LEFT
      const newX = proj.x - (proj.hit ? 15 : proj.speed)
      const newFrame = proj.hit
        ? Math.min(proj.frame + 0.3, 3.9) // smashSmoke: don't loop
        : (proj.frame + 0.2) % 4 // travellSmoke: loop animation

      // If already hit or passed, just keep moving left
      if (proj.hit || proj.passed) {
        return { ...proj, x: newX, frame: newFrame }
      }

      // Check if projectile reached Frank's position
      if (proj.x <= hitZoneX && newX <= hitZoneX) {
        // Boss HIGH attack - ducking avoids damage
        if (!isDucking && !isInvincible) {
          // Player actually hit - takes damage!
          const newHp = hp - 1
          set({
            hp: newHp,
            assMeter: 0,
            comboCount: 0,
            screenShake: true,
            isInvincible: true,
          })
          setTimeout(() => set({ screenShake: false, isInvincible: false }), 500)

          if (newHp <= 0) {
            set({ gameState: GAME_STATES.GAME_OVER })
            audioManager.play('lose')
          } else {
            audioManager.play('frankDamage')
          }

          // Mark as hit - keep same x, start smashSmoke animation, continues left
          return { ...proj, x: newX, frame: 0, hit: true }
        }

        // Frank dodged - projectile passes through
        return { ...proj, x: newX, frame: newFrame, passed: true }
      }

      return { ...proj, x: newX, frame: newFrame }
    }).filter(proj => proj !== null && proj.x > -400) // Remove when off-screen left

    set({ bossProjectiles: updatedProjectiles })
  },

  // Update boss bot projectiles (attackBossBot LOW attacks - player must jump)
  updateBossBotProjectiles: () => {
    const { bossBotProjectiles, playerX, hp, isJumping, isDucking, gameState, isInvincible, currentEnemyType } = get()
    if (gameState !== GAME_STATES.COMBAT_PHASE) return
    if (bossBotProjectiles.length === 0) return
    if (!currentEnemyType?.isBoss) return

    // Hit zone at Frank's approximate center (same as HIGH attack)
    const hitZoneX = playerX + 200

    const updatedProjectiles = bossBotProjectiles.map(proj => {
      // Always calculate new position moving LEFT
      const newX = proj.x - (proj.hit ? 15 : proj.speed)
      // 4 frame animation for attackBossBot
      const newFrame = proj.hit
        ? Math.min(proj.frame + 0.3, 3.9) // Impact: don't loop
        : (proj.frame + 0.2) % 4 // Travel: loop animation

      // If already hit or passed, just keep moving left
      if (proj.hit || proj.passed) {
        return { ...proj, x: newX, frame: newFrame }
      }

      // Check if projectile reached Frank's position
      if (proj.x <= hitZoneX && newX <= hitZoneX) {
        // Boss LOW attack - jumping avoids damage
        if (!isJumping && !isInvincible) {
          // Player actually hit - takes damage!
          const newHp = hp - 1
          set({
            hp: newHp,
            assMeter: 0,
            comboCount: 0,
            screenShake: true,
            isInvincible: true,
          })
          setTimeout(() => set({ screenShake: false, isInvincible: false }), 500)

          if (newHp <= 0) {
            set({ gameState: GAME_STATES.GAME_OVER })
            audioManager.play('lose')
          } else {
            audioManager.play('frankDamage')
          }

          // Mark as hit - stays at impact position with hit animation
          return { ...proj, x: newX, frame: 0, hit: true }
        }

        // Frank jumped over - projectile passes through
        return { ...proj, x: newX, frame: newFrame, passed: true }
      }

      return { ...proj, x: newX, frame: newFrame }
    }).filter(proj => proj !== null && proj.x > -400) // Remove when off-screen left

    set({ bossBotProjectiles: updatedProjectiles })
  },

  // Obstacles
  updateObstacles: (speed) => {
    const { obstacles, playerX, playerY, isDucking, isJumping, hp, obstaclesPassed } = get()

    const updatedObstacles = obstacles.map(obs => ({
      ...obs,
      x: obs.x - speed
    })).filter(obs => obs.x > -100)

    // Collision detection
    const playerHitbox = {
      x: playerX,
      y: playerY,
      width: PLAYER_HITBOX.width,
      height: isDucking ? PLAYER_HITBOX.duckingHeight : PLAYER_HITBOX.height,
    }

    let collision = false
    updatedObstacles.forEach(obs => {
      if (obs.passed) return

      const obsHitbox = {
        x: obs.x,
        y: obs.y,
        width: obs.width,
        height: obs.height,
      }

      if (
        playerHitbox.x < obsHitbox.x + obsHitbox.width &&
        playerHitbox.x + playerHitbox.width > obsHitbox.x &&
        playerHitbox.y > -(obsHitbox.height) &&
        playerHitbox.y - playerHitbox.height < obsHitbox.y
      ) {
        collision = true
      }

      if (obs.x < playerX && !obs.passed) {
        obs.passed = true
      }
    })

    if (collision) {
      // Logic changed: Frank stops and is pushed back
      const { playerX } = get()

      // Push Frank back (left)
      set({
        playerX: Math.max(0, playerX - 50),
        playerState: PLAYER_STATES.HIT, // Enter hit state (stops scrolling in game loop)
        screenShake: true,
      })

      // Play sound
      audioManager.play('frankDamage')

      // Recover after a short delay
      setTimeout(() => {
        const { playerState } = get()
        if (playerState === PLAYER_STATES.HIT) {
          set({ playerState: PLAYER_STATES.RUNNING, screenShake: false })
        }
      }, 500)

      set({ obstacles: updatedObstacles })
      return
    }

    const newPassed = updatedObstacles.filter(o => o.passed).length

    // Transition to combat after all obstacles
    if (updatedObstacles.length === 0 || newPassed >= 5) {
      get().startCombatPhase()
    }

    set({ obstacles: updatedObstacles, obstaclesPassed: newPassed })
  },

  reset: () => set(INITIAL_STATE),
}))

function generateObstacles() {
  const types = [
    { type: 'barrel1', ...OBSTACLE_SIZES.barrel1 },
    { type: 'barrel2', ...OBSTACLE_SIZES.barrel2 },
    { type: 'pipe', ...OBSTACLE_SIZES.pipe },
  ]

  const obstacles = []
  let x = 600

  for (let i = 0; i < 5; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    obstacles.push({
      id: i,
      x,
      y: 0,
      ...type,
      passed: false,
    })
    x += 500 + Math.random() * 300 // Increased spacing for easier difficulty (was 350 + 150)
  }

  return obstacles
}

function generateFatalityTargets() {
  const targets = []
  for (let i = 0; i < 5; i++) {
    targets.push({
      id: i,
      startX: -50,
      targetX: 400,
      delay: i * 600,
      hit: false,
      timing: null,
    })
  }
  return targets
}
