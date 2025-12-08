import { useEffect } from 'react'
import { useGameStore, GAME_STATES } from './store/gameStore'
import MainMenu from './components/MainMenu'
import HUD from './components/HUD'
import MobileControls from './components/MobileControls'
import AssFatalityMinigame from './components/AssFatalityMinigame'
import VictoryScreen from './components/VictoryScreen'
import GameOverScreen from './components/GameOverScreen'
import DevMenu from './components/DevMenu'

// Phase components
import ObstaclePhase from './components/phases/ObstaclePhase'
import CombatPhase from './components/phases/CombatPhase'
import CombatEffects from './components/phases/CombatEffects'

// Show dev menu in development
const isDev = import.meta.env.DEV

export default function App() {
  const { gameState, setMobile, screenShake, slowMotion } = useGameStore()

  useEffect(() => {
    const checkMobile = () => {
      setMobile(window.innerWidth <= 768 || 'ontouchstart' in window)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [setMobile])

  return (
    <div
      className={`game-container ${screenShake ? 'animate-shake' : ''} ${slowMotion ? 'transition-all duration-300' : ''}`}
      style={{
        filter: slowMotion ? 'saturate(1.5) contrast(1.1)' : 'none',
      }}
    >
      {/* Dev menu - only in development */}
      {isDev && <DevMenu />}

      {/* Scanlines overlay */}
      <div className="absolute inset-0 scanlines z-50 pointer-events-none" />

      {/* Main game content */}
      {gameState === GAME_STATES.MENU && <MainMenu />}

      {/* Obstacle Phase - original smaller scale */}
      {gameState === GAME_STATES.OBSTACLE_PHASE && (
        <>
          <ObstaclePhase />
          <HUD />
          <MobileControls />
        </>
      )}

      {/* Combat Phase - larger scale for fighting */}
      {(gameState === GAME_STATES.COMBAT_INTRO || gameState === GAME_STATES.COMBAT_PHASE) && (
        <>
          <CombatPhase />
          <HUD />
          <MobileControls />
          <CombatEffects />
        </>
      )}

      {gameState === GAME_STATES.ASS_FATALITY && <AssFatalityMinigame />}

      {gameState === GAME_STATES.VICTORY && <VictoryScreen />}

      {gameState === GAME_STATES.GAME_OVER && <GameOverScreen />}
    </div>
  )
}
