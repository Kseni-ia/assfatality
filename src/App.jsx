import { useState, useEffect } from 'react'
import { useGameStore, GAME_STATES } from './store/gameStore'
import MainMenu from './components/MainMenu'
import InstallPrompt from './components/InstallPrompt'
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

// iPhone 16 Pro Max landscape dimensions (baseline for mobile design)
const BASELINE_HEIGHT = 430

export default function App() {
  const { gameState, setMobile, screenShake, slowMotion, isMobile } = useGameStore()
  const [isPortrait, setIsPortrait] = useState(false)
  const [mobileScale, setMobileScale] = useState(1)
  const [isInstalled, setIsInstalled] = useState(() => {
    // Check if already running as standalone PWA
    if (typeof window !== 'undefined') {
      return window.navigator.standalone === true ||
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches
    }
    return false
  })

  useEffect(() => {
    let wasPortrait = window.innerHeight > window.innerWidth

    const handleResize = () => {
      const isMobileDevice = window.innerWidth <= 960 || 'ontouchstart' in window
      const portrait = window.innerHeight > window.innerWidth

      setMobile(isMobileDevice)
      // Only show warning if it's a mobile device and in portrait
      setIsPortrait(isMobileDevice && portrait)

      // Calculate scale for smaller mobile screens in landscape
      // If viewport height < baseline (430px), scale down proportionally
      if (isMobileDevice && !portrait && window.innerHeight < BASELINE_HEIGHT) {
        const scale = window.innerHeight / BASELINE_HEIGHT
        setMobileScale(scale)
      } else {
        setMobileScale(1)
      }

      // Detect orientation change via resize (works on all browsers)
      if (isMobileDevice && wasPortrait && !portrait) {
        // Just changed from portrait to landscape - hide toolbar
        scrollToHideToolbar()
        setTimeout(scrollToHideToolbar, 100)
        setTimeout(scrollToHideToolbar, 300)
        setTimeout(scrollToHideToolbar, 500)
      }

      // Extra aggressive scroll attempts for smaller screens in landscape
      // These devices often need more help hiding the address bar
      if (isMobileDevice && !portrait && window.innerHeight < 450) {
        scrollToHideToolbar()
        setTimeout(scrollToHideToolbar, 100)
        setTimeout(scrollToHideToolbar, 200)
        setTimeout(scrollToHideToolbar, 400)
        setTimeout(scrollToHideToolbar, 800)
        setTimeout(scrollToHideToolbar, 1200)
      }

      wasPortrait = portrait
    }

    // Scroll to hide address bar - Safari-specific techniques for iOS
    const scrollToHideToolbar = () => {
      // Method 1: Standard scroll (works on most browsers)
      window.scrollTo({ top: 1, left: 0, behavior: 'instant' })

      // Method 2: Direct property assignment (Chrome/Safari fallback)
      document.body.scrollTop = 1
      document.documentElement.scrollTop = 1

      // Method 3: scrollIntoView on a positioned element (better Safari support)
      const root = document.getElementById('root')
      if (root) {
        root.scrollIntoView({ block: 'start', behavior: 'instant' })
      }

      // Method 4: requestAnimationFrame for Safari timing issues
      requestAnimationFrame(() => {
        window.scrollTo(0, 1)
        document.body.scrollTop = 1
        document.documentElement.scrollTop = 1
      })
    }

    // More aggressive Safari scroll - simulates user scroll gesture
    const aggressiveSafariScroll = () => {
      // Scroll down by the full overflow amount, then back up
      const scrollAmount = 100 // Matches our body min-height overflow

      // Method 1: window.scrollTo with smooth behavior
      window.scrollTo({ top: scrollAmount, left: 0, behavior: 'smooth' })

      // Method 2: Direct assignment
      document.body.scrollTop = scrollAmount
      document.documentElement.scrollTop = scrollAmount

      setTimeout(() => {
        window.scrollTo({ top: 1, left: 0, behavior: 'smooth' })
        document.body.scrollTop = 1
        document.documentElement.scrollTop = 1
      }, 200)

      setTimeout(() => {
        // Settle at position 0 or 1
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        document.body.scrollTop = 0
        document.documentElement.scrollTop = 0

        // Final attempt using scrollBy
        window.scrollBy(0, 1)
        window.scrollBy(0, -1)
      }, 500)
    }

    // Request fullscreen via API (requires user gesture) - works on Chrome/Android
    const requestFullscreen = async () => {
      const element = document.documentElement
      try {
        // Standard API (Chrome, Firefox)
        if (element.requestFullscreen) {
          await element.requestFullscreen({ navigationUI: 'hide' })
        }
        // Webkit (Safari)
        else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen()
        }
        // Mozilla older
        else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen()
        }
        // MS Edge/IE
        else if (element.msRequestFullscreen) {
          element.msRequestFullscreen()
        }

        // Try to lock orientation to landscape (Chrome/Android)
        if (screen.orientation && screen.orientation.lock) {
          try {
            await screen.orientation.lock('landscape')
          } catch (e) {
            // Silently fail - not supported on all browsers
          }
        }
      } catch (err) {
        // Fullscreen may fail on some browsers - that's ok, scroll will work
      }
    }

    // Request fullscreen on first touch (user gesture requirement)
    let hasRequestedFullscreen = false
    const handleFirstTouch = () => {
      if (!hasRequestedFullscreen) {
        hasRequestedFullscreen = true
        requestFullscreen()
        // Use aggressive Safari scroll on first touch
        aggressiveSafariScroll()
        // Also do regular scrolls
        scrollToHideToolbar()
        setTimeout(scrollToHideToolbar, 100)
        setTimeout(scrollToHideToolbar, 300)
        setTimeout(aggressiveSafariScroll, 500)
      }
    }

    // Handle orientationchange event (Safari, some mobile browsers)
    const handleOrientationChange = () => {
      setTimeout(() => {
        const isLandscape = window.innerWidth > window.innerHeight
        handleResize()

        if (isLandscape) {
          // Use aggressive Safari scroll for orientation changes
          aggressiveSafariScroll()
          scrollToHideToolbar()
          setTimeout(scrollToHideToolbar, 100)
          setTimeout(scrollToHideToolbar, 300)
          setTimeout(scrollToHideToolbar, 500)
          setTimeout(aggressiveSafariScroll, 700)
          setTimeout(scrollToHideToolbar, 1000)
        }
      }, 50)
    }

    // Handle screen.orientation change API (Chrome, Firefox)
    const handleScreenOrientationChange = () => {
      const isLandscape = screen.orientation.type.includes('landscape')
      if (isLandscape) {
        aggressiveSafariScroll()
        setTimeout(scrollToHideToolbar, 50)
        setTimeout(scrollToHideToolbar, 200)
        setTimeout(scrollToHideToolbar, 500)
        setTimeout(aggressiveSafariScroll, 800)
      }
    }

    // Initial setup
    handleResize()
    // Multiple attempts to hide toolbar on initial load
    scrollToHideToolbar()
    setTimeout(scrollToHideToolbar, 100)
    setTimeout(scrollToHideToolbar, 300)
    setTimeout(aggressiveSafariScroll, 500)
    setTimeout(scrollToHideToolbar, 800)

    // Event listeners for all browsers
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('touchstart', handleFirstTouch, { once: true })
    window.addEventListener('load', () => {
      scrollToHideToolbar()
      aggressiveSafariScroll()
      setTimeout(scrollToHideToolbar, 200)
    })

    // Modern orientation API (Chrome, Firefox)
    if (screen.orientation) {
      screen.orientation.addEventListener('change', handleScreenOrientationChange)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('touchstart', handleFirstTouch)
      window.removeEventListener('load', scrollToHideToolbar)
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', handleScreenOrientationChange)
      }
    }
  }, [setMobile])

  return (
    <div
      className={`game-container ${slowMotion ? 'transition-all duration-300' : ''}`}
      style={{
        filter: slowMotion ? 'saturate(1.5) contrast(1.1)' : 'none',
        // Apply proportional scaling for smaller mobile screens
        // Scale down the entire view while expanding dimensions to fill viewport
        ...(mobileScale < 1 && isMobile ? {
          transform: `scale(${mobileScale})`,
          transformOrigin: 'top left',
          width: `${100 / mobileScale}%`,
          height: `${100 / mobileScale}dvh`,
        } : {})
      }}
    >
      <div className={`w-full h-full ${screenShake ? 'animate-shake' : ''}`}>
        {/* Dev menu - only in development */}
        {isDev && <DevMenu />}

        {/* PWA Install Prompt - blocks game until installed (mobile only) */}
        {isMobile && !isInstalled && <InstallPrompt onInstalled={() => setIsInstalled(true)} />}

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
    </div>
  )
}
