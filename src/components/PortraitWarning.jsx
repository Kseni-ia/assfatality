import React from 'react'

export default function PortraitWarning() {
    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 text-center">
            <div className="animate-pulse mb-8">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ff00ff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-spin-slow"
                >
                    <path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9" />
                    <path d="M12 7v5l3 3" />
                </svg>
            </div>

            <div className="relative mb-8">
                <div className="w-16 h-24 border-2 border-[#00d4ff] rounded-lg animate-[rotate-phone_2s_infinite_ease-in-out]">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#00d4ff/30] rounded-full"></div>
                </div>
            </div>

            <h2 className="text-2xl text-[#ff00ff] font-['Press_Start_2P'] mb-4 neon-text">
                PLEASE ROTATE
            </h2>
            <p className="text-[#00d4ff] font-['Press_Start_2P'] text-sm leading-relaxed max-w-md neon-text-blue">
                THIS GAME IS DESIGNED FOR LANDSCAPE MODE ONLY
            </p>

            <style jsx>{`
        @keyframes rotate-phone {
          0%, 10% { transform: rotate(0deg); }
          40%, 60% { transform: rotate(90deg); }
          90%, 100% { transform: rotate(0deg); }
        }
      `}</style>
        </div>
    )
}
