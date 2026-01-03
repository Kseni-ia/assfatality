// Game settings configuration
// Separate scale factors for different phases

// Obstacle phase - original smaller scale
export const OBSTACLE_SCALE = 2.0

// Combat phase - larger scale for close-up fighting
export const COMBAT_SCALE = 4.0

// INDIVIDUAL CHARACTER SCALES (Adjust these manually as needed)
export const ENEMY_SCALES = {
  lukas: 3.2,  // Smaller
  duca: 4.0,   // Standard
  leader: 4.5, // Reduced from 5.8 (Much Bigger)
  boss: 2.5,   // Final boss - smaller
}

// Native sprite sizes
export const FRANK_FRAME_SIZE = 128

// Obstacle phase sizes
export const OBSTACLE_PLAYER_SIZE = FRANK_FRAME_SIZE * OBSTACLE_SCALE
export const OBSTACLE_GROUND_Y_OFFSET = 180
export const OBSTACLE_GROUND_Y_OFFSET_MOBILE = 80 // Smaller offset = lower on screen for mobile

// Combat phase sizes
export const COMBAT_PLAYER_SIZE = FRANK_FRAME_SIZE * COMBAT_SCALE
export const COMBAT_ENEMY_SIZE = 128 * COMBAT_SCALE
export const COMBAT_GROUND_Y_OFFSET = 120

// Player hitbox (smaller than sprite for forgiving collision)
export const PLAYER_HITBOX = {
  width: 40,
  height: 80,
  duckingHeight: 40,
}

// Obstacle visual sizes (what you see) - using obstacle scale
export const OBSTACLE_VISUAL = {
  barrel: { width: 40 * OBSTACLE_SCALE, height: 50 * OBSTACLE_SCALE },
  box: { width: 50 * OBSTACLE_SCALE, height: 50 * OBSTACLE_SCALE },
  pipe: { width: 60 * OBSTACLE_SCALE, height: 30 * OBSTACLE_SCALE },
}

// Obstacle hitboxes (smaller than visual for forgiving collision)
export const OBSTACLE_SIZES = {
  barrel: { width: 30, height: 40 },
  box: { width: 35, height: 40 },
  pipe: { width: 40, height: 20 },
}
