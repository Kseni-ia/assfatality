import { useState, useEffect } from 'react'
import { useGameStore, GAME_STATES } from './store/gameStore'
import MainMenu from './components/MainMenu'
import HUD from './components/HUD'
import MobileControls from './components/MobileControls'
import AssFatalityMinigame from './components/AssFatalityMinigame'
import VictoryScreen from './components/VictoryScreen'
import GameOverScreen from './components/GameOverScreen'
import DevMenu from './components/DevMenu'
import PortraitWarning from './components/PortraitWarning'

// Phase components
import ObstaclePhase from './components/phases/ObstaclePhase'
import CombatPhase from './components/phases/CombatPhase'
import CombatEffects from './components/phases/CombatEffects'

// Show dev menu in development
const isDev = import.meta.env.DEV

export default function App() {
  const { gameState, setMobile, screenShake, slowMotion } = useGameStore()
  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const isMobileDevice = window.innerWidth <= 960 || 'ontouchstart' in window
      const portrait = window.innerHeight > window.innerWidth

      setMobile(isMobileDevice)
      // Only show warning if it's a mobile device and in portrait
      setIsPortrait(isMobileDevice && portrait)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
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

      {/* Portrait Warning Overlay */}
      {isPortrait && <PortraitWarning />}

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
