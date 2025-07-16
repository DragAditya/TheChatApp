'use client';

import { useGameStore } from '@/store';
import { X } from 'lucide-react';
import { TicTacToe } from './TicTacToe';
import { RockPaperScissors } from './RockPaperScissors';

export function GameModal() {
  const { activeGame, setActiveGame } = useGameStore();

  if (!activeGame) {
    return null;
  }

  const handleClose = () => {
    setActiveGame(null);
  };

  const renderGame = () => {
    switch (activeGame.type) {
      case 'tic_tac_toe':
        return <TicTacToe game={activeGame} />;
      case 'rock_paper_scissors':
        return <RockPaperScissors game={activeGame} />;
      default:
        return <div>Game not implemented</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {activeGame.type === 'tic_tac_toe' && 'Tic Tac Toe'}
            {activeGame.type === 'rock_paper_scissors' && 'Rock Paper Scissors'}
            {activeGame.type === 'quiz' && 'Quiz Game'}
          </h3>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="game-canvas">
          {renderGame()}
        </div>
      </div>
    </div>
  );
}