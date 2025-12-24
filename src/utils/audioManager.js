import { AUDIO_CONFIG } from '../config/audioConfig';

class AudioManager {
    constructor() {
        this.sounds = {};
        this.muted = false;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        // Config for all sounds
        const soundFiles = {
            // Frank
            jump: '/frank_jump.mp3',
            duck: '/frank_duck.mp3',
            frankAttack: '/frank_attack.mp3',
            frankDamage: '/frank_damage.mp3',

            // Enemies
            lukasAttack: '/lukas_attack.mp3',
            lukasHit: '/lukas_attack_hit.mp3',

            ducaAttack: '/duca_attack.mp3',
            ducaHit: '/duca_attack_hit.mp3',

            leaderAttack: '/leader_attack.mp3',
            leaderHit: '/leader_attack_hit.mp3',

            enemyDeath: '/enemy_death.mp3',

            // Announcer
            fight: '/announcer_fight.mp3',
            perfect: '/announcer_perfect.mp3',
            win: '/announcer_youWin.mp3',
            lose: '/announcer_youLose.mp3',

            // Music/Other
            fatality: '/ass fatality raw.mp3'
        };

        // Preload sounds
        Object.entries(soundFiles).forEach(([key, path]) => {
            this.sounds[key] = new Audio(path);
            this.sounds[key].load();
        });

        this.initialized = true;
    }

    play(key, overrideVolume = null) {
        if (!this.initialized) this.init();
        if (this.muted || !this.sounds[key]) return;

        // Get config or default
        const config = AUDIO_CONFIG[key] || { volume: 50, delay: 0 };

        // Calculate volume (0.0 - 1.0)
        // If overrideVolume provided, usage it (assumed 0-1), otherwise use config (0-100)
        let volume = overrideVolume !== null ? overrideVolume : (config.volume / 100);
        volume = Math.max(0, Math.min(1, volume)); // Clamp

        const playSound = () => {
            try {
                // Clone so we can play overlapping sounds
                const sound = this.sounds[key].cloneNode();
                sound.volume = volume;
                sound.play().catch(e => {
                    console.warn(`Could not play sound: ${key}`, e);
                });
            } catch (e) {
                console.error(`Error playing sound: ${key}`, e);
            }
        };

        if (config.delay > 0) {
            setTimeout(playSound, config.delay);
        } else {
            playSound();
        }
    }

    mute(isMuted) {
        this.muted = isMuted;
    }
}

export const audioManager = new AudioManager();
