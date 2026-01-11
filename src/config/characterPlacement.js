// This file determines where characters stand and how big they are.
// You can adjust values for Mobile (Phone) and Desktop (Computer) separately.

export const PLACEMENT_CONFIG = {
    // Screen width threshold for mobile layout (pixels)
    // Screens smaller than this width will use 'mobile' settings
    mobileBreakpoint: 1000,

    mobile: {
        // Character Sizes (Multiplier of original size)
        scale: {
            frank: 2.4,
            lukas: 1.9,
            duca: 2.3,
            leader: 2.3,
            boss: 2,
        },
        // Vertical Alignment (Higher number = character moves DOWN)
        // Adjust this if characters look like they are floating or buried
        verticalOffset: {
            frank: 135,
            lukas: 115,
            duca: 130,
            leader: 130,
            boss: 90,
        },
        // Combat Distances (Distance from center of screen)
        position: {
            playerOffset: 200,      // How far Left Frank stands from center
            enemyOffsetClose: 5,   // How far Right Lukas/Duca/Leader stand from center
            enemyOffsetFar: 140,    // How far Right Boss stands from center
        }
    },

    desktop: {
        // Character Sizes
        scale: {
            frank: 4.0,
            lukas: 3.2,
            duca: 4.0,
            leader: 4.0,
            boss: 2.6,
        },
        // Vertical Alignment
        verticalOffset: {
            frank: 90,
            lukas: 60,
            duca: 90,
            leader: 90,
            boss: 0,
        },
        // Combat Distances (Note: These are wider for desktop screens)
        position: {
            playerOffset: 400,
            enemyOffsetClose: 0,    // 0 means exactly at center
            enemyOffsetFar: 300,
        }
    }
}

/**
 * Helper to get the correct config based on screen width
 * @param {number} width - Current screen width
 * @returns {object} The configuration object (mobile or desktop)
 */
export const getPlacementConfig = (width) => {
    return width < PLACEMENT_CONFIG.mobileBreakpoint ? PLACEMENT_CONFIG.mobile : PLACEMENT_CONFIG.desktop
}
