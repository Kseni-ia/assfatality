import { useGameStore } from '../../store/gameStore'

export default function CombatEffects() {
    const { effects } = useGameStore()

    return (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            {effects.map((effect) => {
                const isCombo = effect.text.includes('COMBO') || effect.text.includes('AWESOME')
                const isBad = effect.text.includes('HIT')

                return (
                    <div
                        key={effect.id}
                        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-black italic tracking-tighter text-center
                        ${isCombo
                                ? 'text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-500 to-red-600 drop-shadow-[0_4px_0_#000]'
                                : isBad
                                    ? 'text-5xl text-red-600 drop-shadow-[0_2px_0_#000]'
                                    : 'text-4xl text-emerald-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]'
                            }
                        `}
                        style={{
                            fontFamily: '"Press Start 2P", cursive',
                            animation: isCombo ? 'combo-pop 1s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards' : 'float-up 0.8s ease-out forwards',
                            zIndex: isCombo ? 60 : 50,
                            textShadow: isCombo ? '0 0 20px rgba(251, 146, 60, 0.5)' : 'none'
                        }}
                    >
                        {effect.text}
                    </div>
                )
            })}
            <style>{`
        @keyframes combo-pop {
          0% { transform: translate(-50%, -50%) scale(0) rotate(-10deg); opacity: 0; }
          20% { transform: translate(-50%, -50%) scale(1.5) rotate(0deg); opacity: 1; }
          40% { transform: translate(-50%, -50%) scale(1); rotate(0deg); opacity: 1; }
          80% { transform: translate(-50%, -100%) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, -150%) scale(1.2); opacity: 0; }
        }
        @keyframes float-up {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          20% { transform: translate(-50%, -80%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -150%) scale(1); opacity: 0; }
        }
      `}</style>
        </div>
    )
}
