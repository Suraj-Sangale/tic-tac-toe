import React, { useState, useEffect } from "react";

type Player = "X" | "O" | null;
type GameMode = "computer" | "player" | null;
type Board = Player[];

const TicTacToe = () => {
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [winner, setWinner] = useState<Player | "Draw" | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [winningLine, setWinningLine] = useState<number[]>([]);

  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  const checkWinner = (
    currentBoard: Board
  ): { winner: Player | "Draw" | null; line: number[] } => {
    for (const [a, b, c] of winningCombinations) {
      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        return { winner: currentBoard[a], line: [a, b, c] };
      }
    }
    if (currentBoard.every((cell) => cell !== null)) {
      return { winner: "Draw", line: [] };
    }
    return { winner: null, line: [] };
  };

  const makeComputerMove = (currentBoard: Board) => {
    const emptyCells = currentBoard
      .map((cell, idx) => (cell === null ? idx : null))
      .filter((idx) => idx !== null) as number[];

    // Try to win
    for (const idx of emptyCells) {
      const testBoard = [...currentBoard];
      testBoard[idx] = "O";
      if (checkWinner(testBoard).winner === "O") return idx;
    }

    // Block player
    for (const idx of emptyCells) {
      const testBoard = [...currentBoard];
      testBoard[idx] = "X";
      if (checkWinner(testBoard).winner === "X") return idx;
    }

    // Take center
    if (emptyCells.includes(4)) return 4;

    // Take corner
    const corners = [0, 2, 6, 8].filter((idx) => emptyCells.includes(idx));
    if (corners.length > 0)
      return corners[Math.floor(Math.random() * corners.length)];

    // Take any
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  };

  useEffect(() => {
    if (gameMode === "computer" && !isXNext && !winner) {
      const timer = setTimeout(() => {
        const move = makeComputerMove(board);
        handleCellClick(move);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isXNext, gameMode, board, winner]);

  const handleCellClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinningLine(result.line);
      setShowResult(true);

      setScores((prev) => ({
        ...prev,
        X: result.winner === "X" ? prev.X + 1 : prev.X,
        O: result.winner === "O" ? prev.O + 1 : prev.O,
        draws: result.winner === "Draw" ? prev.draws + 1 : prev.draws,
      }));
    } else {
      setIsXNext(!isXNext);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setShowResult(false);
    setWinningLine([]);
  };

  const backToMenu = () => {
    setGameMode(null);
    resetGame();
    setScores({ X: 0, O: 0, draws: 0 });
  };

  if (gameMode === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-0 top-0 w-1/2 h-full flex flex-wrap content-start">
            <div className="text-white text-[30rem] font-bold p-4 right-72 absolute -top-4">
              ❌
            </div>
          </div>
          <div className="absolute right-0 top-0 w-1/2 h-full flex flex-wrap content-start">
            <div className="text-white text-[30rem] font-bold p-4 left-72 absolute -top-4">
              ⭕
            </div>
          </div>
        </div>
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-12 shadow-2xl border border-white/20 max-w-md w-full relative z-10">
          <h1 className="text-6xl font-bold text-white text-center mb-4 drop-shadow-lg">
            TicTacToe
          </h1>
          <p className="text-white/90 text-center mb-12 text-lg">
            Choose your game mode
          </p>

          <div className="space-y-4">
            <button
              onClick={() => setGameMode("player")}
              className="w-full py-5 px-8 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-2xl text-white font-semibold text-xl transition-all duration-300 border border-white/30 hover:scale-105 active:scale-95 shadow-lg"
            >
              🎮 Play vs Player
            </button>
            <button
              onClick={() => setGameMode("computer")}
              className="w-full py-5 px-8 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-2xl text-white font-semibold text-xl transition-all duration-300 border border-white/30 hover:scale-105 active:scale-95 shadow-lg"
            >
              🤖 Play vs Computer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-500 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute -left-1/4 top-1/2 -translate-y-1/2 text-white font-bold"
          style={{ fontSize: "50vw" }}
        >
          ❌
        </div>
        <div
          className="absolute -right-1/4 top-1/2 -translate-y-1/2 text-white font-bold"
          style={{ fontSize: "50vw" }}
        >
          ⭕
        </div>
      </div>
      <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20 max-w-2xl w-full relative z-10">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={backToMenu}
            className="px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-xl text-white font-medium transition-all duration-300 border border-white/30"
          >
            ← Menu
          </button>
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">
            {gameMode === "computer" ? "🤖 vs Computer" : "🎮 vs Player"}
          </h2>
          <div className="w-24"></div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8 backdrop-blur-lg bg-white/5 p-4 rounded-2xl border border-white/20">
          <div className="text-center p-4 bg-white/10 rounded-xl border border-white/20">
            <div className="text-4xl mb-2">❌</div>
            <div className="text-white text-2xl font-bold">{scores.X}</div>
            <div className="text-white/80 text-sm">Player X</div>
          </div>
          <div className="text-center p-4 bg-white/10 rounded-xl border border-white/20">
            <div className="text-4xl mb-2">🤝</div>
            <div className="text-white text-2xl font-bold">{scores.draws}</div>
            <div className="text-white/80 text-sm">Draws</div>
          </div>
          <div className="text-center p-4 bg-white/10 rounded-xl border border-white/20">
            <div className="text-4xl mb-2">⭕</div>
            <div className="text-white text-2xl font-bold">{scores.O}</div>
            <div className="text-white/80 text-sm">
              {gameMode === "computer" ? "Computer" : "Player O"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={!!cell || !!winner}
              className={`aspect-square bg-white/20 backdrop-blur-lg rounded-2xl border-2 border-white/30 text-6xl font-bold text-white transition-all duration-300 hover:bg-white/30 hover:scale-105 active:scale-95 disabled:cursor-not-allowed shadow-lg ${
                winningLine.includes(index)
                  ? "bg-green-400/40 border-green-300/50"
                  : ""
              }`}
            >
              {cell === "X" ? "❌" : cell === "O" ? "⭕" : ""}
            </button>
          ))}
        </div>

        <div className="text-center">
          <p className="text-white text-xl mb-4">
            {winner
              ? "Game Over!"
              : `Current Turn: ${isXNext ? "❌ X" : "⭕ O"}`}
          </p>
          <button
            onClick={resetGame}
            className="px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-xl text-white font-semibold text-lg transition-all duration-300 border border-white/30 hover:scale-105 active:scale-95"
          >
            New Game
          </button>
        </div>
      </div>

      {showResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-xl bg-white/20 rounded-3xl p-8 shadow-2xl border-2 border-white/30 max-w-md w-full animate-in">
            <div className="text-center">
              <div className="text-8xl mb-4">
                {winner === "X" ? "❌" : winner === "O" ? "⭕" : "🤝"}
              </div>
              <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
                {winner === "Draw" ? "It's a Draw!" : `${winner} Wins!`}
              </h2>
              <p className="text-white/90 text-xl mb-8">
                {winner === "Draw" ? "Well played both!" : "Congratulations!"}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowResult(false)}
                  className="flex-1 py-3 px-6 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-xl text-white font-semibold transition-all duration-300 border border-white/30 hover:scale-105"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    resetGame();
                    setShowResult(false);
                  }}
                  className="flex-1 py-3 px-6 bg-white/30 hover:bg-white/40 backdrop-blur-lg rounded-xl text-white font-semibold transition-all duration-300 border border-white/30 hover:scale-105"
                >
                  Play Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicTacToe;
