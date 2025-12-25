import { useGameStore } from '../store/gameStore'
import { useEffect } from 'react'


export default function MainMenu() {
  const { startGame } = useGameStore()

  const handleStart = () => {
    // Attempt to force full screen on mobile/all devices
    const element = document.documentElement
    if (element.requestFullscreen) {
      element.requestFullscreen().catch((err) => {
        console.log('Full screen request failed:', err)
      })
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen()
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen()
    }

    // Hack to try and scroll away address bar on mobile
    window.scrollTo(0, 1)

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
    <div className="relative h-screen w-screen overflow-hidden bg-[#05000a] font-pixel selection:bg-neon-pink selection:text-white">

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
      <div className="relative z-10 h-full flex flex-col items-center justify-center pt-12 md:pt-16 pb-24">

        {/* Massive Logo & Characters */}
        <div className="relative flex justify-center items-center">

          {/* Frank Character (Left - Background) */}
          <img
            src="/sprites/tool/mainFrank.png"
            alt="Frank"
            className="absolute left-[-70%] md:left-[-65%] bottom-[-45vh] h-[100vh] md:h-[110vh] object-cover md:object-contain rotate-6 z-0 animate-slide-in opacity-60 drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]"
            style={{ animationDelay: '0s', transformOrigin: 'bottom left' }}
          />

          {/* Boss Character (Right - Background) */}
          <img
            src="/sprites/tool/mainBoss.png"
            alt="Boss"
            className="absolute right-[-50%] md:right-[-45%] bottom-[-45vh] h-[100vh] md:h-[110vh] object-cover md:object-contain -rotate-6 z-0 animate-slide-in-right opacity-60 drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]"
            style={{ animationDelay: '0s', transformOrigin: 'bottom right' }}
          />

          {/* Glow behind logo */}
          <div className="absolute inset-0 bg-[#ff00ff] blur-[100px] opacity-20 transform scale-75 animate-pulse" />

          {/* Main Logo */}
          <img
            src="/sprites/tool/mainAss.png"
            alt="Ass Fatality Main Logo"
            className="animate-float-slow relative z-10 w-auto h-[45vh] md:h-[55vh] lg:h-[65vh] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
          />
        </div>

        {/* Start Prompt */}
        <div className="mt-12 md:mt-20 animate-pulse-smooth relative z-40">
          <button
            onClick={handleStart}
            className="group relative px-6 py-2 md:px-10 md:py-4"
          >
            {/* Glitchy Text Effect */}
            <span className="text-3xl md:text-5xl font-black text-white tracking-[0.2em] italic relative block"
              style={{ textShadow: '2px 2px 0px #ff00ff, -2px -2px 0px #00ffff' }}>
              PRESS <span className="text-neon-pink">X</span> TO START
            </span>
          </button>
        </div>

      </div>


      {/* --- Footer (Controls & Info) --- */}
      <div className="absolute bottom-0 w-full bg-black/80 border-t border-white/10 backdrop-blur-md z-50">
        <div className="max-w-[1920px] mx-auto px-6 py-3 flex flex-col md:flex-row justify-between items-center text-[10px] md:text-xs text-gray-400 font-mono tracking-wider">

          {/* Left: Controls */}
          <div className="flex items-center gap-6 md:gap-12 uppercase">
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 border border-white/20 rounded bg-white/5 text-white">A</div>
              <div className="px-2 py-1 border border-white/20 rounded bg-white/5 text-white">D</div>
              <span>MOVE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 border border-white/20 rounded bg-white/5 text-white">S</div>
              <span>DUCK</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 border border-white/20 rounded bg-white/5 text-neon-pink border-neon-pink/50">X</div>
              <span className="text-neon-pink">START GAME</span>
            </div>
          </div>

          {/* Right: Version */}
          <div className="hidden md:block opacity-50">
            ASS FATALITY v2.1.0 // READY
          </div>
        </div>
      </div>

    </div>
  )
}
