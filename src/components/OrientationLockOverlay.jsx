import { useState, useEffect } from 'react'

/**
 * OrientationLockOverlay - Shows warning when screen is in portrait mode
 * Forces users to rotate their phone AND unlock screen rotation to play
 */
export default function OrientationLockOverlay() {
    const [showWarning, setShowWarning] = useState(false)

    useEffect(() => {
        // Only run on mobile devices
        const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent.toLowerCase())
        if (!isMobile) return

        // Check if screen is in portrait mode
        const checkOrientation = () => {
            const isPortrait = window.innerHeight > window.innerWidth
            setShowWarning(isPortrait)
        }

        // Check immediately
        checkOrientation()

        // Listen for resize (orientation changes)
        window.addEventListener('resize', checkOrientation)

        // Also listen for orientationchange event
        window.addEventListener('orientationchange', () => {
            // Delay check slightly as dimensions may not update immediately
            setTimeout(checkOrientation, 100)
            setTimeout(checkOrientation, 300)
        })

        return () => {
            window.removeEventListener('resize', checkOrientation)
            window.removeEventListener('orientationchange', checkOrientation)
        }
    }, [])

    if (!showWarning) return null

    return (
        <div
            className="fixed inset-0 z-[99999] bg-[#05000a] font-pixel overflow-hidden flex items-center justify-center"
            style={{ height: '100dvh' }}
        >
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a0033] via-[#0a0015] to-black" />
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vh] bg-[radial-gradient(circle,rgba(255,0,255,0.15),transparent_70%)] blur-3xl pointer-events-none" />

            {/* Scanlines */}
            <style>{`
                @keyframes rotate-icon {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(90deg); }
                    50% { transform: rotate(90deg); }
                    75% { transform: rotate(0deg); }
                }
                .rotate-phone-icon {
                    animation: rotate-icon 2s ease-in-out infinite;
                }
            `}</style>

            <div className="relative z-10 text-center p-8">
                {/* Phone rotation icon */}
                <div className="mb-8 flex justify-center">
                    <div className="rotate-phone-icon">
                        <svg
                            width="80"
                            height="80"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#ff00ff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            {/* Phone body */}
                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                            {/* Screen */}
                            <rect x="7" y="4" width="10" height="14" fill="rgba(255,0,255,0.2)" />
                            {/* Home button */}
                            <circle cx="12" cy="20" r="1" fill="#ff00ff" />
                        </svg>
                    </div>
                </div>

                {/* Main message */}
                <h1
                    className="text-lg md:text-2xl font-black text-white mb-4 tracking-wider"
                    style={{ textShadow: '2px 2px 0px #ff00ff, -2px -2px 0px #00ffff' }}
                >
                    ROTATE YOUR PHONE
                </h1>

                <p className="text-gray-400 text-[10px] md:text-sm mb-4 max-w-xs mx-auto">
                    Turn your phone sideways to play
                </p>

                <div className="text-[#ff00ff] text-[8px] md:text-xs mt-6 px-4 py-2 rounded bg-black/30 inline-block">
                    <span className="text-[#00ffff]">TIP:</span> Unlock screen rotation in your settings
                </div>

            </div>
        </div>
    )
}
