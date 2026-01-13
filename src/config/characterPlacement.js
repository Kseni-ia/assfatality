// This file determines where characters stand and how big they are.
// You can adjust values for Mobile (Phone) and Desktop (Computer) separately.

export const PLACEMENT_CONFIG = {
    // Screen width threshold for mobile layout (pixels)
    // Screens smaller than this width will use 'mobile' settings
    mobileBreakpoint: 1000,

    mobile: {
        // Character Sizes (Multiplier of original size)
        scale: {
            frank: 2.0,
            frankBoss: 2.0, // Separate scale for Boss fight (Mobile)
            lukas: 1.9,
            duca: 2.3,
            leader: 2.3,
            boss: 1.7,
        },
        // Vertical Alignment (Higher number = character moves DOWN)
        // Adjust this if characters look like they are floating or buried
        verticalOffset: {
            frank: 20, // Reduced from 80 to move further up
            frankBoss: 60, // Separate placement for Boss fight (Mobile)
            lukas: 115,
            duca: 130,
            leader: 130,
            boss: -10, // Reduced from 20 to move further up
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
            frank: 3.4,
            frankBoss: 3.4, // Separate scale for Boss fight (Desktop)
            lukas: 2.6, // Reduced from 3.2
            duca: 3.2, // Reduced from 4.0
            leader: 3.2, // Reduced from 4.0
            boss: 2.2,
        },
        // Vertical Alignment
        verticalOffset: {
            frank: 95, // Moved lower to align with tracks
            frankBoss: 50, // Separate placement for Boss fight (Desktop)
            lukas: 60,
            duca: 90,
            leader: 90,
            boss: -80, // Reduced from -60
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
