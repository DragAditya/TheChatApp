'use client';

import { useState } from 'react';
import { GameSession } from '@/types';

interface RockPaperScissorsProps {
  game: GameSession;
}

type Choice = 'rock' | 'paper' | 'scissors';

export function RockPaperScissors({ game }: RockPaperScissorsProps) {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<string>('');

  const choices: Choice[] = ['rock', 'paper', 'scissors'];

  const getEmoji = (choice: Choice) => {
    switch (choice) {
      case 'rock': return '🪨';
      case 'paper': return '📄';
      case 'scissors': return '✂️';
    }
  };

  const playGame = (choice: Choice) => {
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];
    setPlayerChoice(choice);
    setComputerChoice(computerChoice);

    if (choice === computerChoice) {
      setResult("It's a tie!");
    } else if (
      (choice === 'rock' && computerChoice === 'scissors') ||
      (choice === 'paper' && computerChoice === 'rock') ||
      (choice === 'scissors' && computerChoice === 'paper')
    ) {
      setResult('You win!');
    } else {
      setResult('Computer wins!');
    }
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult('');
  };

  return (
    <div className="p-4 text-center">
      <h3 className="text-lg font-semibold mb-4">Rock Paper Scissors</h3>

      {!playerChoice ? (
        <div>
          <p className="mb-4">Choose your weapon:</p>
          <div className="flex justify-center space-x-4">
            {choices.map((choice) => (
              <button
                key={choice}
                onClick={() => playGame(choice)}
                className="w-16 h-16 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {getEmoji(choice)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-center items-center space-x-8 mb-4">
            <div className="text-center">
              <div className="text-4xl mb-2">{getEmoji(playerChoice)}</div>
              <p className="text-sm">You</p>
            </div>
            <div className="text-2xl">VS</div>
            <div className="text-center">
              <div className="text-4xl mb-2">{getEmoji(computerChoice!)}</div>
              <p className="text-sm">Computer</p>
            </div>
          </div>

          <p className="text-lg font-semibold mb-4">{result}</p>

          <button
            onClick={resetGame}
            className="px-4 py-2 bg-chat-primary text-white rounded-lg hover:bg-chat-secondary transition-colors"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}