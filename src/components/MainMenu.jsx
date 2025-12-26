import { useGameStore } from '../store/gameStore'
import { useEffect } from 'react'


export default function MainMenu() {
  const { startGame, isMobile } = useGameStore()

  const handleStart = async () => {
    // Request fullscreen FIRST, before anything else
    // This must happen in direct response to user gesture
    try {
      const element = document.documentElement

      // Standard Fullscreen API
      if (element.requestFullscreen) {
        await element.requestFullscreen({ navigationUI: 'hide' })
        console.log('Fullscreen activated via requestFullscreen')
      }
      // Webkit (Safari, older Chrome)
      else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen()
        console.log('Fullscreen activated via webkitRequestFullscreen')
      }
      // MS Edge/IE
      else if (element.msRequestFullscreen) {
        element.msRequestFullscreen()
        console.log('Fullscreen activated via msRequestFullscreen')
      }
      // Mozilla
      else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen()
        console.log('Fullscreen activated via mozRequestFullScreen')
      }
      else {
        console.log('Fullscreen API not supported')
      }

      // Lock orientation to landscape after fullscreen
      if (screen.orientation && screen.orientation.lock) {
        try {
          await screen.orientation.lock('landscape')
          console.log('Orientation locked to landscape')
        } catch (e) {
          console.log('Orientation lock not supported:', e.message)
        }
      }
    } catch (err) {
      console.log('Fullscreen request failed:', err.message)
    }

    // Start the game after fullscreen attempt
    startGame()
  }

  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.key === 'x' || e.key === 'X' || e.key === 'Enter') && !e.repeat) {
        handleStart()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [startGame])

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-[#05000a] font-pixel selection:bg-neon-pink selection:text-white"
      style={{ height: '100dvh' }}
    >

      {/* --- Animations --- */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.02); }
        }
        @keyframes scanline {
          0% { background-position: 0 0; }
          100% { background-position: 0 100%; }
        }
        @keyframes pulse-smooth {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes slide-in-left {
          0% { transform: translateX(-100px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-in-right {
          0% { transform: translateX(100px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-pulse-smooth { animation: pulse-smooth 2s ease-in-out infinite; }
        .animate-slide-in { animation: slide-in-left 1s ease-out forwards; }
        .animate-slide-in-right { animation: slide-in-right 1s ease-out forwards; }
        .animate-breathe { animation: breathe 4s ease-in-out infinite; }
        .bg-scanlines {
          background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5) 51%);
          background-size: 100% 4px;
          animation: scanline 0.2s linear infinite; 
          pointer-events: none;
        }
      `}</style>

      {/* --- Background Layers --- */}

      {/* 1. Deep Space Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0033] via-[#0a0015] to-black" />

      {/* 2. Spotlight (Top Center) */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vh] bg-[radial-gradient(circle,rgba(255,0,255,0.15),transparent_70%)] blur-3xl pointer-events-none" />

      {/* 3. Floor Grid (Perspective) */}
      <div className="absolute bottom-0 left-0 w-full h-[35vh] overflow-hidden perspective-container">
        <div className="absolute inset-0 bg-gradient-to-t from-[#ff00ff]/10 to-transparent z-10" />
        <div className="retro-grid w-[200%] h-[200%] -ml-[50%] origin-bottom transform rotate-x-60 opacity-30" />
      </div>

      {/* 4. CRT Scanlines Overlay */}
      <div className="absolute inset-0 bg-scanlines opacity-10 z-0" />


      {/* --- Main Content --- */}
      {/* Using flex-1 and safe-area-aware layout for all screen sizes */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{
          height: '100dvh',
          paddingTop: 'max(env(safe-area-inset-top), 0.5rem)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)'
        }}
      >

        {/* Frank Character (Left - Background) - positioned relative to full screen */}
        <img
          src="/sprites/tool/mainFrank.png"
          alt="Frank"
          className={`absolute bottom-[10%] h-[80%] object-contain rotate-6 z-0 animate-slide-in opacity-50 drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]`}
          style={{
            animationDelay: '0s',
            transformOrigin: 'bottom left',
            left: isMobile ? '4%' : '5%'
          }}
        />

        {/* Boss Character (Right - Background) - positioned relative to full screen */}
        <img
          src="/sprites/tool/mainBoss.png"
          alt="Boss"
          className={`absolute bottom-[10%] h-[80%] object-contain -rotate-6 z-0 animate-slide-in-right opacity-50 drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]`}
          style={{
            animationDelay: '0s',
            transformOrigin: 'bottom right',
            right: isMobile ? '10%' : '10%'
          }}
        />

        {/* Logo Container - takes available space */}
        <div className={`flex-1 relative flex justify-center items-center w-full min-h-0 z-10 ${isMobile ? 'mt-[10%]' : ''}`}>

          {/* Glow behind logo */}
          <div className="absolute inset-0 bg-[#ff00ff] blur-[100px] opacity-20 transform scale-75 animate-pulse" />

          {/* Main Logo - responsive to container, bigger on mobile */}
          <img
            src="/sprites/tool/mainAss.png"
            alt="Ass Fatality Main Logo"
            className={`animate-float-slow relative z-10 w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.7)] ${isMobile ? 'max-h-[165%]' : 'max-h-[70%]'}`}
          />
        </div>

        {/* Start Prompt - fixed height at bottom */}
        <div className="shrink-0 py-2 md:py-6 animate-pulse-smooth relative z-40">
          <button
            onClick={handleStart}
            className="group relative px-4 py-1 md:px-10 md:py-4"
          >
            {/* Glitchy Text Effect - responsive text size */}
            <span
              className="text-[clamp(1rem,4vw,3rem)] font-black text-white tracking-[0.15em] md:tracking-[0.2em] italic relative block whitespace-nowrap"
              style={{ textShadow: '2px 2px 0px #ff00ff, -2px -2px 0px #00ffff' }}
            >
              {isMobile ? (
                <>CLICK TO <span className="text-neon-pink">START</span></>
              ) : (
                <>PRESS <span className="text-neon-pink">X</span> TO START</>
              )}
            </span>
          </button>
        </div>

      </div>


      {/* --- Footer (Controls & Info) --- Desktop only */}
      {!isMobile && (
        <div
          className="absolute bottom-0 w-full bg-black/80 border-t border-white/10 backdrop-blur-md z-50"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="max-w-[1920px] mx-auto px-2 md:px-6 py-1.5 md:py-3 flex flex-row justify-between items-center text-[8px] md:text-xs text-gray-400 font-mono tracking-wider">

            {/* Left: Controls */}
            <div className="flex items-center gap-2 md:gap-12 uppercase">
              <div className="flex items-center gap-1">
                <div className="px-1.5 py-0.5 md:px-2 md:py-1 border border-white/20 rounded bg-white/5 text-white text-[8px] md:text-xs">A</div>
                <div className="px-1.5 py-0.5 md:px-2 md:py-1 border border-white/20 rounded bg-white/5 text-white text-[8px] md:text-xs">D</div>
                <span>MOVE</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="px-1.5 py-0.5 md:px-2 md:py-1 border border-white/20 rounded bg-white/5 text-white text-[8px] md:text-xs">S</div>
                <span>DUCK</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="px-1.5 py-0.5 md:px-2 md:py-1 border border-white/20 rounded bg-white/5 text-neon-pink border-neon-pink/50 text-[8px] md:text-xs">X</div>
                <span className="text-neon-pink">START GAME</span>
              </div>
            </div>

            {/* Right: Version */}
            <div className="hidden md:block opacity-50">
              ASS FATALITY v2.1.0 // READY
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
