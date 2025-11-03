"use client";

import { useState } from "react";

export default function TicTacToeHome() {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";

    setBoard(newBoard);
    setIsXNext(!isXNext);
    setWinner(calculateWinner(newBoard));
  };

  const calculateWinner = (squares: (string | null)[]): string | null => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }
    return null;
  };

  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsXNext(true);
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-10">
      <h1 className="text-2xl font-bold">Tic Tac Toe</h1>

      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className="w-20 h-20 text-2xl font-bold border-2 border-gray-600 flex items-center justify-center hover:bg-gray-200"
          >
            {cell}
          </button>
        ))}
      </div>

      {winner ? (
        <p className="text-lg font-semibold text-green-600">Winner: {winner}</p>
      ) : board.every(Boolean) ? (
        <p className="text-lg font-semibold text-blue-600">It's a draw!</p>
      ) : (
        <p className="text-lg font-semibold">
          Next player: {isXNext ? "X" : "O"}
        </p>
      )}

      <button
        onClick={handleReset}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Reset Game
      </button>
    </div>
  );
}
