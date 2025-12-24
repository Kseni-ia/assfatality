/**
 * Audio Configuration
 * 
 * Adjust volume (0-100) and delay (ms) for each sound effect.
 * default: { volume: 50, delay: 0 }
 */
export const AUDIO_CONFIG = {
    // Frank (Player)
    jump: {
        volume: 50,
        delay: 0
    },
    duck: {
        volume: 50,
        delay: 0
    },
    frankAttack: {
        volume: 50,
        delay: 0
    },
    frankDamage: {
        volume: 50,
        delay: 0
    },

    // Enemies
    lukasAttack: {
        volume: 50,
        delay: 0
    },
    lukasHit: {
        volume: 50,
        delay: 0
    },

    ducaAttack: {
        volume: 60,  // Example: Duca might be quieter, so boost it? (User can edit)
        delay: 0
    },
    ducaHit: {
        volume: 50,
        delay: 0
    },

    leaderAttack: {
        volume: 50,
        delay: 0
    },
    leaderHit: {
        volume: 50,
        delay: 0
    },

    enemyDeath: {
        volume: 70, // Make death impactful
        delay: 100 // Slight delay to sync with animation if needed
    },

    // Announcer
    fight: {
        volume: 80,
        delay: 0
    },
    perfect: {
        volume: 80,
        delay: 0
    },
    win: {
        volume: 80,
        delay: 500 // Wait a moment before celebrating
    },
    lose: {
        volume: 80,
        delay: 0
    },

    // Music / Special
    fatality: {
        volume: 90,
        delay: 0
    }
}
