import { useState } from 'react'
import { useGameStore, GAME_STATES } from '../store/gameStore'

export default function DevMenu() {
  const { gameState, devJumpTo, devJumpToObstacle, setGameState } = useGameStore()
  const [isOpen, setIsOpen] = useState(false)

  const jumpTo = (action, param) => {
    switch (action) {
      case 'menu':
        setGameState(GAME_STATES.MENU)
        break
      case 'obstacle':
        devJumpToObstacle(param)
        break
      case 'fight':
        devJumpTo(param)
        break
      case 'victory':
        setGameState(GAME_STATES.VICTORY)
        break
      case 'gameover':
        setGameState(GAME_STATES.GAME_OVER)
        break
    }
    setIsOpen(false)
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
        className="fixed top-2 right-2 z-[200] bg-black/90 p-3 rounded-lg border border-purple-500 shadow-lg min-w-[200px]"
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

        <div className="flex flex-col gap-2">
          <button
            onClick={() => jumpTo('menu')}
            className="w-full px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
          >
            Main Menu
          </button>

          {/* Level 1: Lukas */}
          <div className="flex gap-1">
            <button
              onClick={() => jumpTo('obstacle', 0)}
              className="flex-1 px-1 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded text-[8px] text-center"
            >
              Obs 1
            </button>
            <button
              onClick={() => jumpTo('fight', 0)}
              className="flex-1 px-1 py-1 bg-green-700 hover:bg-green-600 text-white rounded text-[8px] text-center"
            >
              Fight: Lukas
            </button>
          </div>

          {/* Level 2: Duca */}
          <div className="flex gap-1">
            <button
              onClick={() => jumpTo('obstacle', 1)}
              className="flex-1 px-1 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded text-[8px] text-center"
            >
              Obs 2
            </button>
            <button
              onClick={() => jumpTo('fight', 1)}
              className="flex-1 px-1 py-1 bg-yellow-700 hover:bg-yellow-600 text-white rounded text-[8px] text-center"
            >
              Fight: Duca
            </button>
          </div>

          {/* Level 3: Leader */}
          <div className="flex gap-1">
            <button
              onClick={() => jumpTo('obstacle', 2)}
              className="flex-1 px-1 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded text-[8px] text-center"
            >
              Obs 3
            </button>
            <button
              onClick={() => jumpTo('fight', 2)}
              className="flex-1 px-1 py-1 bg-red-700 hover:bg-red-600 text-white rounded text-[8px] text-center"
            >
              Fight: Leader
            </button>
          </div>

          {/* Level 4: Boss */}
          <div className="flex gap-1">
            <button
              onClick={() => jumpTo('obstacle', 3)}
              className="flex-1 px-1 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded text-[8px] text-center"
            >
              Obs 4
            </button>
            <button
              onClick={() => jumpTo('fight', 3)}
              className="flex-1 px-1 py-1 bg-purple-900 hover:bg-purple-800 text-white rounded text-[8px] text-center"
            >
              Fight: Boss
            </button>
          </div>

          <div className="flex gap-1 mt-1">
            <button
              onClick={() => jumpTo('victory')}
              className="flex-1 px-1 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded text-[8px]"
            >
              Victory
            </button>
            <button
              onClick={() => jumpTo('gameover')}
              className="flex-1 px-1 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-[8px]"
            >
              Game Over
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
