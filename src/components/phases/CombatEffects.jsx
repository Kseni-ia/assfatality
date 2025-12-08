import { useGameStore } from '../../store/gameStore'

export default function CombatEffects() {
    const { effects } = useGameStore()

    return (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            {effects.map((effect) => (
                <div
                    key={effect.id}
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold animate-bounce ${effect.isPerfect || effect.text.includes('DODGE')
                            ? 'text-green-500 drop-shadow-[0_0_10px_#00ff00]'
                            : 'text-red-500 drop-shadow-[0_0_10px_#ff0000]'
                        }`}
                    style={{
                        fontFamily: '"Press Start 2P", cursive',
                        animation: 'float-up 0.8s ease-out forwards'
                    }}
                >
                    {effect.text}
                </div>
            ))}
            <style jsx>{`
        @keyframes float-up {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          20% { transform: translate(-50%, -80%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -150%) scale(1); opacity: 0; }
        }
      `}</style>
        </div>
    )
}
