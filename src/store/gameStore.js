import { create } from 'zustand'
import { PLAYER_HITBOX, OBSTACLE_SIZES } from '../config/settings'

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
  LUKAS: { id: 'lukas', name: 'Lukas', attackType: 'LOW', speed: 1.0, health: 5, isLeader: false },
  DUCA: { id: 'duca', name: 'Duca', attackType: 'HIGH', speed: 1.0, health: 5, isLeader: false },
  LEADER: { id: 'leader', name: 'Leader', attackType: 'MIXED', speed: 1.0, health: 6, isLeader: true },
}

// Enemy sequence order
export const ENEMY_SEQUENCE = ['LUKAS', 'DUCA', 'LEADER']

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

  // Attack state
  attackActive: false,
  currentAttackType: null,
  windupProgress: 0, // 0 to 1 loading bar
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

  setMobile: (isMobile) => set({ isMobile }),

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
      playerVelocityY: -22,
      jumpHoldTime: Date.now(),
    })
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

    const gravity = 0.8
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
      combatTimer: 0,
      introPhase: enemyType.isLeader ? 'leader_announcement' : 'running',
      lastAttackCycle: -1,
      // Reset mana for new fight
      mana: 0,
      lastManaRegen: Date.now(),
      assToolProjectiles: [],
    })
  },

  // Dev function to jump to a specific enemy fight with proper game state
  // Sets up state as if player naturally progressed to this point
  devJumpTo: (enemyIndex) => {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000
    const enemyKey = ENEMY_SEQUENCE[enemyIndex]
    const enemyType = ENEMY_TYPES[enemyKey]

    if (!enemyType) return

    // Set up state as if player progressed naturally
    // Full HP, some score based on progress, proper enemy sequence index
    set({
      gameState: GAME_STATES.COMBAT_INTRO,
      playerState: PLAYER_STATES.RUNNING,
      hp: 3, // Full health
      score: enemyIndex * 1000, // Score based on progress
      assMeter: 50, // Some ass meter built up
      enemies: [{ ...enemyType, isAttacking: false, attackTimer: 2000, animFrame: 0 }],
      currentEnemyIndex: 0,
      currentEnemyType: enemyType,
      enemyHealth: enemyType.health,
      enemySequenceIndex: enemyIndex, // This ensures next enemy is correct after defeating this one
      defeatedEnemies: enemyIndex, // Track how many defeated before this
      playerX: -100,
      enemyX: screenWidth + 100,
      enemyState: ENEMY_STATES.RUNNING,
      showFightText: false,
      showLeaderAnnouncement: enemyType.isLeader,
      combatTimer: 0,
      introPhase: enemyType.isLeader ? 'leader_announcement' : 'running',
      lastAttackCycle: -1,
      mana: 0,
      lastManaRegen: Date.now(),
      assToolProjectiles: [],
      obstacles: [],
      obstaclesPassed: 0,
      isInvincible: false,
      isBlinking: false,
      attackWarning: null,
      attackActive: false,
      windupProgress: 0,
    })
  },

  updateCombatIntro: () => {
    const { enemyX, playerX, introPhase } = get()
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000
    const centerX = screenWidth / 2

    // Target positions - meet in center with characters closer together for combat
    // With larger sprites (4x scale = 512px), position them so they face each other
    const playerTargetX = centerX - 350

    // Lukas fights closer with his machete
    const { currentEnemyType } = get()
    const enemyOffset = currentEnemyType?.id === 'leader' ? -150 : 50
    const enemyTargetX = centerX + enemyOffset

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
      }

      // Continuously check if player gets hit during the ENTIRE active window
      // This ensures landing from a jump during the active window still counts as a hit
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

      if (playerHit && !isInvincible) {
        const newHp = hp - 1
        set({
          hp: newHp,
          screenShake: true,
          isInvincible: true,
        })
        setTimeout(() => set({ screenShake: false, isInvincible: false }), 500)

        if (newHp <= 0) {
          set({ gameState: GAME_STATES.GAME_OVER })
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
      // Enemy defeated, move to next enemy
      const nextIndex = enemySequenceIndex + 1
      if (nextIndex >= ENEMY_SEQUENCE.length) {
        // All enemies defeated
        set({ gameState: GAME_STATES.VICTORY })
      } else {
        // Short delay then start next enemy
        set({ enemyHealth: 0 })
        setTimeout(() => {
          get().startCombatIntro(nextIndex)
        }, 1500)
      }
    } else {
      set({ enemyHealth: newHealth })
    }
  },

  startCombatPhase: () => {
    get().startCombatIntro(0) // Start with first enemy (Lukas)
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

      const meterGain = perfect ? 25 : 15
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
      }
    }
  },

  setAttackWarning: (warning) => set({ attackWarning: warning }),

  defeatEnemy: () => {
    const { defeatedEnemies, currentEnemyIndex, enemies } = get()
    const newDefeated = defeatedEnemies + 1

    if (newDefeated >= 3) {
      set({ defeatedEnemies: newDefeated, gameState: GAME_STATES.VICTORY })
    } else {
      set({
        defeatedEnemies: newDefeated,
        currentEnemyIndex: currentEnemyIndex + 1,
      })
    }
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

  hitFatalityTarget: (targetId, timing) => {
    const { fatalityTargets, fatalityScore } = get()
    const target = fatalityTargets.find(t => t.id === targetId)
    if (!target || target.hit) return

    const isHit = timing === 'perfect' || timing === 'good'
    const points = timing === 'perfect' ? 2 : 1

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

  // Passive meter gain
  tickAssMeter: () => {
    const { assMeter, gameState } = get()
    if (gameState !== GAME_STATES.COMBAT_PHASE) return

    set({ assMeter: Math.min(100, assMeter + 0.1) })
  },

  // Mana regeneration (called every frame during combat)
  tickMana: () => {
    const { mana, maxMana, gameState, lastManaRegen } = get()
    if (gameState !== GAME_STATES.COMBAT_PHASE) return

    const now = Date.now()
    const deltaSeconds = (now - lastManaRegen) / 1000

    if (deltaSeconds > 0.05) { // Update every 50ms
      const manaGain = 0.5 * deltaSeconds // 0.5 mana per second (1 heart every 2 secs)
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
      const newHealth = Math.max(0, enemyHealth - (damageDealt * 0.5))

      if (newHealth <= 0) {
        // Enemy defeated
        const { enemySequenceIndex } = get()
        const nextIndex = enemySequenceIndex + 1
        if (nextIndex >= ENEMY_SEQUENCE.length) {
          set({ enemyHealth: 0, gameState: GAME_STATES.VICTORY })
        } else {
          set({ enemyHealth: 0, attackActive: false, attackWarning: null })
          setTimeout(() => {
            get().startCombatIntro(nextIndex)
          }, 1500)
        }
      } else {
        set({ enemyHealth: newHealth, screenShake: true, enemyHitTimestamp: Date.now() })
        setTimeout(() => set({ screenShake: false }), 200)
      }
    }
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

    if (collision && !get().isInvincible) {
      const newHp = hp - 1
      set({
        hp: newHp,
        screenShake: true,
        isInvincible: true,
        lastHitHeart: newHp, // Mark which heart was just lost (0-indexed from right)
      })
      setTimeout(() => set({ screenShake: false }), 300)

      if (newHp <= 0) {
        set({ gameState: GAME_STATES.GAME_OVER })
      } else {
        // Restart level with remaining lives after short delay
        setTimeout(() => {
          get().restartLevel()
        }, 800)
      }
      return // Stop processing obstacles after collision
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
    { type: 'barrel', ...OBSTACLE_SIZES.barrel },
    { type: 'box', ...OBSTACLE_SIZES.box },
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
    x += 350 + Math.random() * 150
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
