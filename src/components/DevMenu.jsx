import { useState } from 'react'
import { useGameStore, GAME_STATES } from '../store/gameStore'

export default function DevMenu() {
  const { gameState, startGame, devJumpTo, setGameState } = useGameStore()
  const [isOpen, setIsOpen] = useState(false)

  const jumpTo = (phase) => {
    switch (phase) {
      case 'menu':
        setGameState(GAME_STATES.MENU)
        break
      case 'obstacles':
        startGame()
        break
      case 'lukas':
        devJumpTo(0) // Lukas is index 0
        break
      case 'duca':
        devJumpTo(1) // Duca is index 1
        break
      case 'leader':
        devJumpTo(2) // Leader is index 2
        break
      case 'victory':
        setGameState(GAME_STATES.VICTORY)
        break
      case 'gameover':
        setGameState(GAME_STATES.GAME_OVER)
        break
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-2 right-2 z-[200] bg-gray-900/80 text-purple-400 border border-purple-500 rounded p-1 text-[10px] hover:bg-gray-800 transition-colors"
        style={{ fontFamily: '"Press Start 2P", cursive' }}
      >
        DEV
      </button>
    )
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[199]"
        onClick={() => setIsOpen(false)}
      />
      <div
        className="fixed top-2 right-2 z-[200] bg-black/90 p-3 rounded-lg border border-purple-500 shadow-lg"
        style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '8px' }}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="text-purple-400">DEV MENU</div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-red-400 hover:text-red-300"
          >
            X
          </button>
        </div>
        <div className="text-gray-400 mb-2 text-xs">Current: {gameState}</div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => jumpTo('menu')}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
          >
            Menu
          </button>
          <button
            onClick={() => jumpTo('obstacles')}
            className="px-2 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded text-xs"
          >
            Obstacles
          </button>
          <button
            onClick={() => jumpTo('lukas')}
            className="px-2 py-1 bg-green-700 hover:bg-green-600 text-white rounded text-xs"
          >
            Fight: Lukas
          </button>
          <button
            onClick={() => jumpTo('duca')}
            className="px-2 py-1 bg-yellow-700 hover:bg-yellow-600 text-white rounded text-xs"
          >
            Fight: Duca
          </button>
          <button
            onClick={() => jumpTo('leader')}
            className="px-2 py-1 bg-red-700 hover:bg-red-600 text-white rounded text-xs"
          >
            Fight: Leader
          </button>
          <button
            onClick={() => jumpTo('victory')}
            className="px-2 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded text-xs"
          >
            Victory
          </button>
          <button
            onClick={() => jumpTo('gameover')}
            className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs"
          >
            Game Over
          </button>
        </div>
      </div>
    </>
  )
}
