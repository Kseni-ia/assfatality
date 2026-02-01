import { useState, useEffect } from 'react'

/**
 * InstallPrompt - Forces users to add the app to home screen before playing
 * Detects if running as standalone PWA, otherwise shows installation instructions
 */
export default function InstallPrompt({ onInstalled }) {
    const [isStandalone, setIsStandalone] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [isAndroid, setIsAndroid] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [showInstructions, setShowInstructions] = useState(false)

    useEffect(() => {
        // Check if running as installed PWA (standalone mode)
        const checkStandalone = () => {
            // iOS standalone mode
            const isIOSStandalone = window.navigator.standalone === true
            // Other browsers (Chrome, Edge, etc.)
            const isOtherStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                window.matchMedia('(display-mode: fullscreen)').matches

            return isIOSStandalone || isOtherStandalone
        }

        // Detect platform
        const userAgent = navigator.userAgent.toLowerCase()
        const iOS = /iphone|ipad|ipod/.test(userAgent)
        const android = /android/.test(userAgent)

        setIsIOS(iOS)
        setIsAndroid(android)
        setIsStandalone(checkStandalone())

        // Listen for display-mode changes
        const mediaQuery = window.matchMedia('(display-mode: standalone)')
        const handleChange = (e) => {
            if (e.matches) {
                setIsStandalone(true)
                onInstalled?.()
            }
        }
        mediaQuery.addEventListener('change', handleChange)

        // Listen for beforeinstallprompt (Chrome/Android)
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
        }
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        // Listen for successful installation
        const handleAppInstalled = () => {
            setIsStandalone(true)
            setDeferredPrompt(null)
            onInstalled?.()
        }
        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            mediaQuery.removeEventListener('change', handleChange)
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [onInstalled])

    // Handle Chrome/Android install prompt
    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            if (outcome === 'accepted') {
                setIsStandalone(true)
                onInstalled?.()
            }
            setDeferredPrompt(null)
        } else {
            setShowInstructions(true)
        }
    }

    // If already installed, don't show the prompt
    if (isStandalone) {
        return null
    }

    return (
        <div
            className="fixed inset-0 z-[9999] bg-[#05000a] font-pixel overflow-hidden"
            style={{ height: '100dvh' }}
        >
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a0033] via-[#0a0015] to-black" />
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vh] bg-[radial-gradient(circle,rgba(255,0,255,0.15),transparent_70%)] blur-3xl pointer-events-none" />

            {/* Scanlines */}
            <style>{`
        @keyframes scanline {
          0% { background-position: 0 0; }
          100% { background-position: 0 100%; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 0, 255, 0.5), 0 0 40px rgba(255, 0, 255, 0.3); }
          50% { box-shadow: 0 0 30px rgba(255, 0, 255, 0.8), 0 0 60px rgba(255, 0, 255, 0.5); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .bg-scanlines-overlay {
          background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5) 51%);
          background-size: 100% 4px;
          animation: scanline 0.2s linear infinite; 
          pointer-events: none;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
            <div className="absolute inset-0 bg-scanlines-overlay opacity-10" />

            {/* Main Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 md:p-8">

                {/* App Icon / Logo */}
                <div className="animate-float mb-4 md:mb-8">
                    <img
                        src="/sprites/tool/mainAss.png"
                        alt="ASS FATALITY"
                        className="w-32 h-auto md:w-48 drop-shadow-[0_0_30px_rgba(255,0,255,0.5)]"
                    />
                </div>

                {/* Title */}
                <h1
                    className="text-xl md:text-4xl font-black text-white mb-2 md:mb-4 tracking-wider text-center"
                    style={{ textShadow: '2px 2px 0px #ff00ff, -2px -2px 0px #00ffff' }}
                >
                    INSTALL REQUIRED
                </h1>

                <p className="text-gray-400 text-[10px] md:text-sm text-center mb-6 md:mb-8 max-w-md px-4">
                    For the best experience, add this game to your home screen
                </p>

                {/* Platform-specific instructions */}
                {!showInstructions ? (
                    <button
                        onClick={handleInstallClick}
                        className="px-6 py-3 md:px-10 md:py-4 bg-gradient-to-r from-[#ff00ff] to-[#ff66ff] 
                       text-white font-bold text-sm md:text-lg tracking-wider rounded-lg
                       animate-pulse-glow hover:scale-105 transition-transform active:scale-95"
                    >
                        {deferredPrompt ? 'INSTALL APP' : 'HOW TO INSTALL'}
                    </button>
                ) : (
                    <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 md:p-6 max-w-sm md:max-w-md border border-[#ff00ff]/30">
                        {isIOS ? (
                            // iOS Instructions
                            <div className="text-center">
                                <h3 className="text-[#ff00ff] text-sm md:text-lg font-bold mb-4">Safari Instructions</h3>
                                <div className="space-y-3 text-left text-[10px] md:text-sm text-gray-300">
                                    <div className="flex items-start gap-3">
                                        <span className="text-[#00ffff] font-bold shrink-0">1.</span>
                                        <span>Tap the <strong className="text-white">Share</strong> button
                                            <span className="inline-block mx-1 text-[#00ffff]">⬆</span> at the bottom of Safari
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-[#00ffff] font-bold shrink-0">2.</span>
                                        <span>Scroll and tap <strong className="text-white">"Add to Home Screen"</strong></span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-[#00ffff] font-bold shrink-0">3.</span>
                                        <span>Tap <strong className="text-white">"Add"</strong> in the top right corner</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-[#00ffff] font-bold shrink-0">4.</span>
                                        <span>Open the app from your home screen</span>
                                    </div>
                                </div>
                            </div>
                        ) : isAndroid ? (
                            // Android Instructions
                            <div className="text-center">
                                <h3 className="text-[#ff00ff] text-sm md:text-lg font-bold mb-4">Chrome Instructions</h3>
                                <div className="space-y-3 text-left text-[10px] md:text-sm text-gray-300">
                                    <div className="flex items-start gap-3">
                                        <span className="text-[#00ffff] font-bold shrink-0">1.</span>
                                        <span>Tap the <strong className="text-white">Menu</strong> button
                                            <span className="inline-block mx-1 text-[#00ffff]">⋮</span> in Chrome
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-[#00ffff] font-bold shrink-0">2.</span>
                                        <span>Tap <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong></span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-[#00ffff] font-bold shrink-0">3.</span>
                                        <span>Confirm by tapping <strong className="text-white">"Install"</strong></span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-[#00ffff] font-bold shrink-0">4.</span>
                                        <span>Open the app from your home screen</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Desktop/Other Instructions  
                            <div className="text-center">
                                <h3 className="text-[#ff00ff] text-sm md:text-lg font-bold mb-4">Installation</h3>
                                <div className="space-y-3 text-left text-[10px] md:text-sm text-gray-300">
                                    <div className="flex items-start gap-3">
                                        <span className="text-[#00ffff] font-bold shrink-0">1.</span>
                                        <span>Look for the <strong className="text-white">Install</strong> icon in your browser's address bar</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-[#00ffff] font-bold shrink-0">2.</span>
                                        <span>Click <strong className="text-white">"Install"</strong> to add to your device</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-[#00ffff] font-bold shrink-0">3.</span>
                                        <span>Open the installed app to play</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setShowInstructions(false)}
                            className="mt-4 w-full py-2 text-[10px] md:text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            ← Back
                        </button>
                    </div>
                )}

                {/* Skip for dev purposes - only show in development */}
                {import.meta.env.DEV && (
                    <button
                        onClick={onInstalled}
                        className="mt-8 text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
                    >
                        [DEV] Skip installation check
                    </button>
                )}
            </div>
        </div>
    )
}
