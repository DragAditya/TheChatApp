'use client';

import { useState } from 'react';
import { GameSession } from '@/types';

interface TicTacToeProps {
  game: GameSession;
}

export function TicTacToe({ game }: TicTacToeProps) {
  const [board, setBoard] = useState<(string | null)[]>(
    game.game_state?.board || Array(9).fill(null)
  );
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');

  const handleClick = (index: number) => {
    if (board[index] || getWinner()) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  const getWinner = () => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const winner = getWinner();
  const isDraw = !winner && board.every(cell => cell !== null);

  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-2 w-48 h-48 mx-auto mb-4">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className="w-full h-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {cell}
          </button>
        ))}
      </div>

      <div className="text-center">
        {winner ? (
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
            Player {winner} wins!
          </p>
        ) : isDraw ? (
          <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
            It's a draw!
          </p>
        ) : (
          <p className="text-lg">
            Current player: <span className="font-semibold">{currentPlayer}</span>
          </p>
        )}
      </div>
    </div>
  );
}