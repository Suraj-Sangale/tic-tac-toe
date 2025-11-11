import React, { useState, useEffect, useRef, useCallback } from "react";

type Player = "X" | "O" | null;
type GameMode = "computer" | "player" | null;
type Board = Player[];
type CellAnimation = { index: number; timestamp: number };

const TicTacToe = () => {
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [winner, setWinner] = useState<Player | "Draw" | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [animatedCells, setAnimatedCells] = useState<Set<number>>(new Set());
  const [scoreAnimation, setScoreAnimation] = useState<{
    type: "X" | "O" | "draws" | null;
  }>({ type: null });
  const cellRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});

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

  // Enhanced CSS animations
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes drawLine {
        from {
          stroke-dashoffset: 1000;
        }
        to {
          stroke-dashoffset: 0;
        }
      }
      @keyframes drawXLine1 {
        from {
          stroke-dashoffset: 141.42;
        }
        to {
          stroke-dashoffset: 0;
        }
      }
      @keyframes drawXLine2 {
        from {
          stroke-dashoffset: 141.42;
        }
        to {
          stroke-dashoffset: 0;
        }
      }
      @keyframes drawOCircle {
        from {
          stroke-dashoffset: 283;
        }
        to {
          stroke-dashoffset: 0;
        }
      }
      @keyframes cellPopIn {
        0% {
          transform: scale(0) rotate(-180deg);
          opacity: 0;
        }
        50% {
          transform: scale(1.2) rotate(10deg);
        }
        100% {
          transform: scale(1) rotate(0deg);
          opacity: 1;
        }
      }
      @keyframes cellRipple {
        0% {
          transform: scale(0);
          opacity: 0.8;
        }
        100% {
          transform: scale(4);
          opacity: 0;
        }
      }
      @keyframes pulseGlow {
        0%, 100% {
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.3),
                      0 0 40px rgba(255, 255, 255, 0.2),
                      inset 0 0 20px rgba(255, 255, 255, 0.1);
        }
        50% {
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.5),
                      0 0 60px rgba(255, 255, 255, 0.3),
                      inset 0 0 30px rgba(255, 255, 255, 0.2);
        }
      }
      @keyframes scoreBump {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.3);
        }
      }
      @keyframes slideInFromLeft {
        from {
          transform: translateX(-100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideInFromRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes fadeInUp {
        from {
          transform: translateY(30px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-20px);
        }
      }
      @keyframes gradientShift {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
      .cell-pop {
        animation: cellPopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
      .score-bump {
        animation: scoreBump 0.6s ease-out;
      }
      .board-entrance {
        animation: fadeInUp 0.6s ease-out forwards;
      }
      .menu-entrance {
        animation: fadeInUp 0.8s ease-out forwards;
      }
      .score-entrance-1 {
        animation: slideInFromRight 0.6s ease-out 0.2s both;
      }
      .score-entrance-2 {
        animation: slideInFromRight 0.6s ease-out 0.4s both;
      }
      .score-entrance-3 {
        animation: slideInFromRight 0.6s ease-out 0.6s both;
      }
      .bg-animated {
        background-size: 200% 200%;
        animation: gradientShift 15s ease infinite;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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

  const processMove = useCallback(
    (index: number, player: Player) => {
      if (board[index] || winner) return;

      // Add animation trigger
      setAnimatedCells((prev) => new Set(prev).add(index));

      const newBoard = [...board];
      newBoard[index] = player;
      setBoard(newBoard);

      // Remove animation class after animation completes
      setTimeout(() => {
        setAnimatedCells((prev) => {
          const next = new Set(prev);
          next.delete(index);
          return next;
        });
      }, 500);

      const result = checkWinner(newBoard);
      if (result.winner) {
        setTimeout(() => {
          setWinner(result.winner);
          setWinningLine(result.line);
          setShowResult(true);
        }, 600);

        // Animate score update
        if (result.winner === "X") {
          setScoreAnimation({ type: "X" });
        } else if (result.winner === "O") {
          setScoreAnimation({ type: "O" });
        } else {
          setScoreAnimation({ type: "draws" });
        }

        setTimeout(() => setScoreAnimation({ type: null }), 600);

        setScores((prev) => ({
          ...prev,
          X: result.winner === "X" ? prev.X + 1 : prev.X,
          O: result.winner === "O" ? prev.O + 1 : prev.O,
          draws: result.winner === "Draw" ? prev.draws + 1 : prev.draws,
        }));
      } else {
        setIsXNext(!isXNext);
      }
    },
    [board, winner, isXNext]
  );

  useEffect(() => {
    if (gameMode === "computer" && !isXNext && !winner) {
      const timer = setTimeout(() => {
        const move = makeComputerMove(board);
        processMove(move, "O");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isXNext, gameMode, board, winner, processMove]);

  const handleCellClick = (index: number) => {
    const player = isXNext ? "X" : "O";
    processMove(index, player);
  };

  // Component to render X with animation
  const RenderX = ({ animate = true }: { animate?: boolean }) => (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      style={{ filter: "drop-shadow(0 0 8px rgba(255, 100, 100, 0.8))" }}
    >
      <line
        x1="20"
        y1="20"
        x2="80"
        y2="80"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        style={{
          strokeDasharray: "141.42",
          strokeDashoffset: animate ? "141.42" : "0",
          animation: animate ? "drawXLine1 0.4s ease-out forwards" : "none",
        }}
      />
      <line
        x1="80"
        y1="20"
        x2="20"
        y2="80"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        style={{
          strokeDasharray: "141.42",
          strokeDashoffset: animate ? "141.42" : "0",
          animation: animate
            ? "drawXLine2 0.4s ease-out 0.2s forwards"
            : "none",
        }}
      />
    </svg>
  );

  // Component to render O with animation
  const RenderO = ({ animate = true }: { animate?: boolean }) => (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      style={{ filter: "drop-shadow(0 0 8px rgba(100, 150, 255, 0.8))" }}
    >
      <circle
        cx="50"
        cy="50"
        r="30"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        style={{
          strokeDasharray: "283",
          strokeDashoffset: animate ? "283" : "0",
          animation: animate ? "drawOCircle 0.5s ease-out forwards" : "none",
        }}
      />
    </svg>
  );

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setShowResult(false);
    setWinningLine([]);
    setAnimatedCells(new Set());
  };

  const backToMenu = () => {
    setGameMode(null);
    resetGame();
    setScores({ X: 0, O: 0, draws: 0 });
    setScoreAnimation({ type: null });
  };

  if (gameMode === null) {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 bg-animated flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-full flex items-center justify-center">
            <div
              className="text-white text-[25rem] font-bold"
              style={{ animation: "float 6s ease-in-out infinite" }}
            >
              ❌
            </div>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full flex items-center justify-center">
            <div
              className="text-white text-[25rem] font-bold"
              style={{
                animation: "float 8s ease-in-out infinite",
                animationDelay: "1s",
              }}
            >
              ⭕
            </div>
          </div>
        </div>

        {/* Menu Card */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-12 shadow-2xl border-2 border-white/30 max-w-md w-full relative z-10 menu-entrance">
          <div className="text-center mb-8">
            <h1 className="text-7xl font-bold text-white mb-4 drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-pink-100">
              TicTacToe
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-4"></div>
            <p className="text-white/90 text-center text-lg font-medium">
              Choose your game mode
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setGameMode("player")}
              className="w-full py-6 px-8 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-2xl text-white font-semibold text-xl transition-all duration-300 border-2 border-white/30 hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl hover:border-white/50 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                  🎮
                </span>
                Play vs Player
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
            <button
              onClick={() => setGameMode("computer")}
              className="w-full py-6 px-8 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-2xl text-white font-semibold text-xl transition-all duration-300 border-2 border-white/30 hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl hover:border-white/50 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                  🤖
                </span>
                Play vs Computer
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-600 via-purple-500 to-pink-500 bg-animated flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-full flex items-center justify-center">
          <div
            className="text-white text-[25rem] font-bold"
            style={{ animation: "float 6s ease-in-out infinite" }}
          >
            ❌
          </div>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full flex items-center justify-center">
          <div
            className="text-white text-[25rem] font-bold"
            style={{
              animation: "float 8s ease-in-out infinite",
              animationDelay: "1s",
            }}
          >
            ⭕
          </div>
        </div>
      </div>

      <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 shadow-2xl border-2 border-white/30 max-w-4xl w-full relative z-10 flex gap-6 board-entrance">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={backToMenu}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-xl text-white font-medium transition-all duration-300 border-2 border-white/30 text-sm hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl group"
            >
              <span className="flex items-center gap-2">
                <span className="group-hover:-translate-x-1 transition-transform">
                  ←
                </span>
                Menu
              </span>
            </button>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg flex items-center gap-2">
              <span className="text-3xl">
                {gameMode === "computer" ? "🤖" : "🎮"}
              </span>
              {gameMode === "computer" ? "vs Computer" : "vs Player"}
            </h2>
          </div>

          {/* Game Board */}
          <div className="grid grid-cols-3 gap-3 mb-6 relative p-2">
            {board.map((cell, index) => {
              const isAnimated = animatedCells.has(index);
              const isWinning = winningLine.includes(index);
              return (
                <button
                  key={index}
                  ref={(el) => {
                    cellRefs.current[index] = el;
                  }}
                  onClick={() => handleCellClick(index)}
                  disabled={
                    !!cell || !!winner || (gameMode === "computer" && !isXNext)
                  }
                  className={`aspect-square bg-white/20 backdrop-blur-lg rounded-2xl border-2 border-white/30 text-white transition-all duration-300 hover:bg-white/30 hover:scale-105 active:scale-95 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl relative overflow-hidden group ${
                    isWinning
                      ? "bg-gradient-to-br from-green-400/50 to-emerald-500/50 border-green-300/70 shadow-green-500/50 animate-pulse"
                      : "hover:border-white/50"
                  } ${isAnimated ? "cell-pop" : ""} ${
                    !cell && !winner && !(gameMode === "computer" && !isXNext)
                      ? "hover:ring-4 hover:ring-white/30"
                      : ""
                  }`}
                  style={{
                    animation: isAnimated
                      ? "cellPopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
                      : undefined,
                  }}
                >
                  {/* Ripple effect on click */}
                  {isAnimated && (
                    <div
                      className="absolute inset-0 rounded-2xl bg-white/30"
                      style={{
                        animation: "cellRipple 0.6s ease-out",
                        transformOrigin: "center",
                      }}
                    ></div>
                  )}

                  {/* Cell content */}
                  <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
                    {cell === "X" ? (
                      <div className="text-red-400 w-full h-full">
                        <RenderX animate={isAnimated} />
                      </div>
                    ) : cell === "O" ? (
                      <div className="text-blue-400 w-full h-full">
                        <RenderO animate={isAnimated} />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {!winner &&
                          !cell &&
                          !(gameMode === "computer" && !isXNext) && (
                            <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-white/40 transition-colors"></div>
                          )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Winning line */}
            {winningLine.length > 0 && (
              <svg
                className="absolute inset-0 pointer-events-none z-20"
                style={{ width: "100%", height: "100%", padding: "8px" }}
              >
                <line
                  x1={`${((winningLine[0] % 3) * 100) / 3 + 100 / 6}%`}
                  y1={`${
                    (Math.floor(winningLine[0] / 3) * 100) / 3 + 100 / 6
                  }%`}
                  x2={`${((winningLine[2] % 3) * 100) / 3 + 100 / 6}%`}
                  y2={`${
                    (Math.floor(winningLine[2] / 3) * 100) / 3 + 100 / 6
                  }%`}
                  stroke="url(#winningGradient)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: "1000",
                    strokeDashoffset: "1000",
                    animation: "drawLine 0.8s ease-out forwards",
                    filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))",
                  }}
                />
                <defs>
                  <linearGradient
                    id="winningGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop
                      offset="0%"
                      stopColor="rgba(255, 255, 255, 0.9)"
                    />
                    <stop
                      offset="50%"
                      stopColor="rgba(255, 255, 255, 1)"
                    />
                    <stop
                      offset="100%"
                      stopColor="rgba(255, 255, 255, 0.9)"
                    />
                  </linearGradient>
                </defs>
              </svg>
            )}
          </div>

          {/* Game Status */}
          <div className="text-center">
            <p className="text-white text-lg mb-4 font-semibold drop-shadow-lg">
              {winner ? (
                <span className="text-2xl animate-pulse">
                  {winner === "Draw" ? "🤝 It's a Draw!" : "🎉 Game Over!"}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Current Turn:
                  <span className="text-2xl animate-pulse">
                    {isXNext ? "❌" : "⭕"}
                  </span>
                  <span className="text-xl">{isXNext ? "X" : "O"}</span>
                </span>
              )}
            </p>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-xl text-white font-semibold transition-all duration-300 border-2 border-white/30 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              🔄 New Game
            </button>
          </div>
        </div>

        {/* Score Board */}
        <div className="w-56 backdrop-blur-lg bg-white/10 p-4 rounded-2xl border-2 border-white/20 flex flex-col gap-4 shadow-xl">
          <div
            className={`text-center p-4 bg-white/10 rounded-xl border-2 border-white/20 transition-all duration-300 ${
              scoreAnimation.type === "X"
                ? "score-bump bg-red-400/30 border-red-300/50 shadow-lg shadow-red-500/50"
                : "score-entrance-1"
            }`}
          >
            <div className="text-4xl mb-2">❌</div>
            <div className="text-white text-3xl font-bold drop-shadow-lg">
              {scores.X}
            </div>
            <div className="text-white/90 text-sm font-medium mt-1">
              Player X
            </div>
          </div>
          <div
            className={`text-center p-4 bg-white/10 rounded-xl border-2 border-white/20 transition-all duration-300 ${
              scoreAnimation.type === "draws"
                ? "score-bump bg-yellow-400/30 border-yellow-300/50 shadow-lg shadow-yellow-500/50"
                : "score-entrance-2"
            }`}
          >
            <div className="text-4xl mb-2">🤝</div>
            <div className="text-white text-3xl font-bold drop-shadow-lg">
              {scores.draws}
            </div>
            <div className="text-white/90 text-sm font-medium mt-1">Draws</div>
          </div>
          <div
            className={`text-center p-4 bg-white/10 rounded-xl border-2 border-white/20 transition-all duration-300 ${
              scoreAnimation.type === "O"
                ? "score-bump bg-blue-400/30 border-blue-300/50 shadow-lg shadow-blue-500/50"
                : "score-entrance-3"
            }`}
          >
            <div className="text-4xl mb-2">⭕</div>
            <div className="text-white text-3xl font-bold drop-shadow-lg">
              {scores.O}
            </div>
            <div className="text-white/90 text-sm font-medium mt-1">
              {gameMode === "computer" ? "Computer" : "Player O"}
            </div>
          </div>
        </div>
      </div>

      {showResult && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
          style={{
            animation: "fadeIn 0.3s ease-out forwards",
          }}
          onClick={() => setShowResult(false)}
        >
          <div
            className="backdrop-blur-xl bg-white/20 rounded-3xl p-10 shadow-2xl border-2 border-white/40 max-w-md w-full relative overflow-hidden"
            style={{
              animation:
                "fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background glow effect */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `radial-gradient(circle at center, ${
                  winner === "X"
                    ? "rgba(239, 68, 68, 0.5)"
                    : winner === "O"
                    ? "rgba(59, 130, 246, 0.5)"
                    : "rgba(234, 179, 8, 0.5)"
                } 0%, transparent 70%)`,
                animation: "pulseGlow 2s ease-in-out infinite",
              }}
            ></div>

            <div className="text-center relative z-10">
              <div
                className="text-9xl mb-6 inline-block"
                style={{
                  animation:
                    "cellPopIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, float 3s ease-in-out 1s infinite",
                  filter: "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))",
                }}
              >
                {winner === "X" ? (
                  <span className="text-red-400">❌</span>
                ) : winner === "O" ? (
                  <span className="text-blue-400">⭕</span>
                ) : (
                  <span className="text-yellow-400">🤝</span>
                )}
              </div>
              <h2
                className="text-5xl font-bold text-white mb-4 drop-shadow-2xl"
                style={{
                  animation: "fadeInUp 0.6s ease-out 0.2s both",
                }}
              >
                {winner === "Draw" ? "It's a Draw!" : `${winner} Wins!`}
              </h2>
              <p
                className="text-white/90 text-xl mb-10 font-medium"
                style={{
                  animation: "fadeInUp 0.6s ease-out 0.4s both",
                }}
              >
                {winner === "Draw"
                  ? "Well played both!"
                  : "Congratulations! 🎉"}
              </p>
              <div
                className="flex gap-4"
                style={{
                  animation: "fadeInUp 0.6s ease-out 0.6s both",
                }}
              >
                <button
                  onClick={() => setShowResult(false)}
                  className="flex-1 py-4 px-6 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-xl text-white font-semibold transition-all duration-300 border-2 border-white/30 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    resetGame();
                    setShowResult(false);
                  }}
                  className="flex-1 py-4 px-6 bg-white/30 hover:bg-white/40 backdrop-blur-lg rounded-xl text-white font-semibold transition-all duration-300 border-2 border-white/30 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
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
