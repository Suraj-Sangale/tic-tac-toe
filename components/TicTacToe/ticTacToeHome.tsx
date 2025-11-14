import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaTimes,
  FaCircle,
  FaGamepad,
  FaRobot,
  FaHandshake,
  FaTrophy,
  FaRedo,
  FaArrowLeft,
} from "react-icons/fa";

// Type definitions for game state
type Player = "X" | "O" | null;
type GameMode = "computer" | "player" | null;
type Board = Player[];
type CellAnimation = { index: number; timestamp: number };

/**
 * Main TicTacToe Game Component
 * Handles game logic, UI rendering, and animations for a tic-tac-toe game
 * Supports both player vs player and player vs computer modes
 */
export const TicTacToeHome = () => {
  // Game state management
  const [gameMode, setGameMode] = useState<GameMode>(null); // Current game mode: null = menu, "player" = 2 players, "computer" = vs AI
  const [board, setBoard] = useState<Board>(Array(9).fill(null)); // 3x3 board represented as a 9-element array
  const [isXNext, setIsXNext] = useState(true); // Tracks whose turn it is (true = X, false = O)
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 }); // Score tracking for the session
  const [winner, setWinner] = useState<Player | "Draw" | null>(null); // Current game winner
  const [showResult, setShowResult] = useState(false); // Controls visibility of result modal
  const [winningLine, setWinningLine] = useState<number[]>([]); // Indices of cells in the winning line
  const [animatedCells, setAnimatedCells] = useState<Set<number>>(new Set()); // Tracks which cells are currently animating
  const [scoreAnimation, setScoreAnimation] = useState<{
    type: "X" | "O" | "draws" | null;
  }>({ type: null }); // Controls score animation when a game ends
  const cellRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({}); // Refs to board cell elements

  // All possible winning combinations in a 3x3 grid
  // Format: [cell1, cell2, cell3] where cells are indices 0-8
  const winningCombinations = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Main diagonal (top-left to bottom-right)
    [2, 4, 6], // Anti-diagonal (top-right to bottom-left)
  ];

  /**
   * CSS Animations Setup
   * Injects custom keyframe animations into the document head
   * These animations are used throughout the component for visual effects
   */
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
        /* Use opacity-only animation to prevent layout shifts */
        animation: fadeIn 0.6s ease-out forwards;
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

  /**
   * Checks if there's a winner on the current board
   * @param currentBoard - The current game board state
   * @returns Object containing the winner (X, O, Draw, or null) and the winning line indices
   */
  const checkWinner = (
    currentBoard: Board
  ): { winner: Player | "Draw" | null; line: number[] } => {
    // Check all winning combinations
    for (const [a, b, c] of winningCombinations) {
      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        return { winner: currentBoard[a], line: [a, b, c] };
      }
    }
    // Check for draw (all cells filled, no winner)
    if (currentBoard.every((cell) => cell !== null)) {
      return { winner: "Draw", line: [] };
    }
    return { winner: null, line: [] };
  };

  /**
   * AI Computer Move Logic
   * Implements a simple but effective AI strategy:
   * 1. Try to win if possible
   * 2. Block player from winning
   * 3. Take center if available
   * 4. Take a corner if available
   * 5. Take any available cell
   * @param currentBoard - The current game board state
   * @returns The index where the computer should place its move
   */
  const makeComputerMove = (currentBoard: Board) => {
    // Get all empty cell indices
    const emptyCells = currentBoard
      .map((cell, idx) => (cell === null ? idx : null))
      .filter((idx) => idx !== null) as number[];

    // Strategy 1: Try to win if possible
    for (const idx of emptyCells) {
      const testBoard = [...currentBoard];
      testBoard[idx] = "O";
      if (checkWinner(testBoard).winner === "O") return idx;
    }

    // Strategy 2: Block player from winning
    for (const idx of emptyCells) {
      const testBoard = [...currentBoard];
      testBoard[idx] = "X";
      if (checkWinner(testBoard).winner === "X") return idx;
    }

    // Strategy 3: Take center if available (best strategic position)
    if (emptyCells.includes(4)) return 4;

    // Strategy 4: Take a corner if available
    const corners = [0, 2, 6, 8].filter((idx) => emptyCells.includes(idx));
    if (corners.length > 0)
      return corners[Math.floor(Math.random() * corners.length)];

    // Strategy 5: Take any available cell
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  };

  /**
   * Processes a move on the board
   * Handles cell placement, animation triggers, winner checking, and score updates
   * @param index - The cell index (0-8) where the move is being made
   * @param player - The player making the move ("X" or "O")
   */
  const processMove = useCallback(
    (index: number, player: Player) => {
      // Prevent moves on occupied cells or after game ends
      if (board[index] || winner) return;

      // Trigger cell animation
      setAnimatedCells((prev) => new Set(prev).add(index));

      // Update board state
      const newBoard = [...board];
      newBoard[index] = player;
      setBoard(newBoard);

      // Clean up animation state after animation completes
      setTimeout(() => {
        setAnimatedCells((prev) => {
          const next = new Set(prev);
          next.delete(index);
          return next;
        });
      }, 500);

      // Check for winner or draw
      const result = checkWinner(newBoard);
      if (result.winner) {
        // Delay winner announcement for better UX
        setTimeout(() => {
          setWinner(result.winner);
          setWinningLine(result.line);
          setShowResult(true);
        }, 600);

        // Trigger score animation based on winner
        if (result.winner === "X") {
          setScoreAnimation({ type: "X" });
        } else if (result.winner === "O") {
          setScoreAnimation({ type: "O" });
        } else {
          setScoreAnimation({ type: "draws" });
        }

        // Reset score animation after it completes
        setTimeout(() => setScoreAnimation({ type: null }), 600);

        // Update scores
        setScores((prev) => ({
          ...prev,
          X: result.winner === "X" ? prev.X + 1 : prev.X,
          O: result.winner === "O" ? prev.O + 1 : prev.O,
          draws: result.winner === "Draw" ? prev.draws + 1 : prev.draws,
        }));
      } else {
        // Switch turns if game continues
        setIsXNext(!isXNext);
      }
    },
    [board, winner, isXNext]
  );

  /**
   * Computer Move Effect
   * Automatically triggers computer move when it's the computer's turn
   * Only runs in computer mode when it's O's turn and game hasn't ended
   */
  useEffect(() => {
    if (gameMode === "computer" && !isXNext && !winner) {
      // Add delay for better UX (makes AI feel more natural)
      const timer = setTimeout(() => {
        const move = makeComputerMove(board);
        processMove(move, "O");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isXNext, gameMode, board, winner, processMove]);

  /**
   * Handles cell click events
   * Determines which player is making the move and processes it
   * @param index - The clicked cell index (0-8)
   */
  const handleCellClick = (index: number) => {
    const player = isXNext ? "X" : "O";
    processMove(index, player);
  };

  /**
   * Renders an animated X symbol
   * Uses SVG with stroke-dasharray animation for drawing effect
   * @param animate - Whether to animate the drawing (default: true)
   */
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

  /**
   * Renders an animated O symbol
   * Uses SVG circle with stroke-dasharray animation for drawing effect
   * @param animate - Whether to animate the drawing (default: true)
   */
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

  /**
   * Resets the game board and state for a new game
   * Clears the board, resets turn to X, clears winner, and resets animations
   */
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setShowResult(false);
    setWinningLine([]);
    setAnimatedCells(new Set());
  };

  /**
   * Returns to the main menu
   * Resets game state and clears all scores
   */
  const backToMenu = () => {
    setGameMode(null);
    resetGame();
    setScores({ X: 0, O: 0, draws: 0 });
    setScoreAnimation({ type: null });
  };

  // Render main menu when no game mode is selected
  if (gameMode === null) {
    return (
      <div className="min-h-screen h-screen bg-gradient-to-br from-purple-600 via-blue-400 to-orange-400 bg-animated flex items-center justify-center p-3 sm:p-4 md:p-6 relative overflow-hidden">
        {/* Animated background elements - Hidden on very small screens, smaller on mobile */}
        <div className="absolute inset-0 opacity-10 sm:opacity-15 overflow-hidden">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-full flex items-center justify-center">
            <div
              className="text-white select-none pointer-events-none"
              style={{ animation: "float 6s ease-in-out infinite" }}
            >
              <FaTimes className="w-[8rem] h-[8rem] sm:w-[15rem] sm:h-[15rem] md:w-[20rem] md:h-[20rem] lg:w-[25rem] lg:h-[25rem]" />
            </div>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full flex items-center justify-center">
            <div
              className="text-white select-none pointer-events-none"
              style={{
                animation: "float 8s ease-in-out infinite",
                animationDelay: "1s",
              }}
            >
              <FaCircle className="w-[8rem] h-[8rem] sm:w-[15rem] sm:h-[15rem] md:w-[20rem] md:h-[20rem] lg:w-[25rem] lg:h-[25rem]" />
            </div>
          </div>
        </div>

        {/* Menu Card */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-2xl border-2 border-white/30 max-w-md w-full relative z-10 menu-entrance mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3 sm:mb-4 drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-pink-100">
              TicTacToe
            </h1>
            <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-3 sm:mb-4"></div>
            <p className="text-white/90 text-center text-base sm:text-lg font-medium px-2">
              Choose your game mode
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <button
              onClick={() => setGameMode("player")}
              className="w-full py-4 sm:py-5 md:py-6 px-6 sm:px-8 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-xl sm:rounded-2xl text-white font-semibold text-lg sm:text-xl transition-all duration-300 border-2 border-white/30 hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl hover:border-white/50 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                <span className="group-hover:scale-110 transition-transform duration-300">
                  <FaGamepad className="w-6 h-6 sm:w-7 sm:h-7" />
                </span>
                <span className="whitespace-nowrap">Play vs Player</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
            <button
              onClick={() => setGameMode("computer")}
              className="w-full py-4 sm:py-5 md:py-6 px-6 sm:px-8 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-xl sm:rounded-2xl text-white font-semibold text-lg sm:text-xl transition-all duration-300 border-2 border-white/30 hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl hover:border-white/50 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                <span className="group-hover:scale-110 transition-transform duration-300">
                  <FaRobot className="w-6 h-6 sm:w-7 sm:h-7" />
                </span>
                <span className="whitespace-nowrap">Play vs Computer</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen bg-gradient-to-br from-blue-600 via-purple-500 to-pink-500 bg-animated flex items-center justify-center p-1.5 sm:p-2 md:p-3 relative overflow-hidden">
      {/* Animated background elements - Responsive sizing */}
      <div className="absolute inset-0 opacity-10 sm:opacity-15 overflow-hidden">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-full flex items-center justify-center">
          <div
            className="text-white select-none pointer-events-none"
            style={{ animation: "float 6s ease-in-out infinite" }}
          >
            <FaTimes className="w-[8rem] h-[8rem] sm:w-[15rem] sm:h-[15rem] md:w-[20rem] md:h-[20rem] lg:w-[25rem] lg:h-[25rem]" />
          </div>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full flex items-center justify-center">
          <div
            className="text-white select-none pointer-events-none"
            style={{
              animation: "float 8s ease-in-out infinite",
              animationDelay: "1s",
            }}
          >
            <FaCircle className="w-[8rem] h-[8rem] sm:w-[15rem] sm:h-[15rem] md:w-[20rem] md:h-[20rem] lg:w-[25rem] lg:h-[25rem]" />
          </div>
        </div>
      </div>

      <div className="backdrop-blur-xl bg-white/10 rounded-2xl sm:rounded-3xl p-2 sm:p-3 md:p-4 shadow-2xl border-2 border-white/30 w-4/5  relative z-10 flex flex-col lg:flex-row gap-2 sm:gap-3 md:gap-4 board-entrance mx-auto">
        <div className="flex-1 flex flex-col justify-around">
          <div className="flex justify-between items-center mb-2 sm:mb-3 flex-wrap gap-2">
            <button
              onClick={backToMenu}
              className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-lg text-white font-medium transition-all duration-300 border-2 border-white/30 text-xs sm:text-sm hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl group"
            >
              <span className="flex items-center gap-1">
                <span className="group-hover:-translate-x-1 transition-transform">
                  <FaArrowLeft className="w-4 h-4" />
                </span>
                <span>Menu</span>
              </span>
            </button>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white drop-shadow-lg flex items-center gap-2">
              <span>
                {gameMode === "computer" ? (
                  <FaRobot className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                ) : (
                  <FaGamepad className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                )}
              </span>
              <span className="whitespace-nowrap text-sm sm:text-base">
                {gameMode === "computer" ? "vs Computer" : "vs Player"}
              </span>
            </h2>
          </div>

          <div className="flex flex-row justify-evenly ">
            {/* Game Board - Fixed dimensions to prevent resizing on load */}
            <div className="grid grid-cols-3 gap-1 sm:gap-1.5 mb-2 sm:mb-3 relative p-1 w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[360px] md:h-[360px] mx-auto lg:mx-0 flex-shrink-0">
              {/* Render 9 cells (3x3 grid) for the game board */}
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
                      !!cell ||
                      !!winner ||
                      (gameMode === "computer" && !isXNext)
                    }
                    className={`aspect-square bg-white/20 backdrop-blur-lg rounded-lg sm:rounded-xl border-2 border-white/30 text-white transition-all duration-300 hover:bg-white/30 hover:scale-105 active:scale-95 disabled:cursor-not-allowed shadow-lg hover:shadow-xl relative overflow-hidden group ${
                      isWinning
                        ? "bg-gradient-to-br from-green-400/50 to-emerald-500/50 border-green-300/70 shadow-green-500/50 "
                        : "hover:border-white/50"
                    } ${isAnimated ? "cell-pop" : ""} ${
                      !cell && !winner && !(gameMode === "computer" && !isXNext)
                        ? "hover:ring-2 hover:ring-white/30"
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
                        className="absolute inset-0 rounded-lg sm:rounded-xl bg-white/30"
                        style={{
                          animation: "cellRipple 0.6s ease-out",
                          transformOrigin: "center",
                        }}
                      ></div>
                    )}

                    {/* Cell content */}
                    <div className="relative z-10 flex items-center justify-center p-1 sm:p-1.5">
                      {cell === "X" ? (
                        <div className="text-red-400 w-full h-full">
                          <RenderX animate={isAnimated} />
                        </div>
                      ) : cell === "O" ? (
                        <div className="text-blue-400 w-full h-full">
                          <RenderO animate={isAnimated} />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          {!winner &&
                            !cell &&
                            !(gameMode === "computer" && !isXNext) && (
                              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-white/20 group-hover:bg-white/40 transition-colors"></div>
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
                  style={{ width: "100%", height: "100%", padding: "4px" }}
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
                    strokeWidth="6"
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
            {/* Score Board - Stacks on mobile, side panel on desktop */}
            <div className="w-full lg:w-40 xl:w-44 backdrop-blur-lg bg-white/10 p-2 sm:p-2.5 rounded-xl border-2 border-white/20 flex flex-row lg:flex-col gap-1.5 sm:gap-2 shadow-xl overflow-x-auto lg:overflow-x-visible">
              <div
                className={`text-center p-1.5 sm:p-2 bg-white/10 rounded-lg border-2 border-white/20 transition-all duration-300 flex-1 min-w-[80px] sm:min-w-[90px] lg:min-w-0 ${
                  scoreAnimation.type === "X"
                    ? "score-bump bg-red-400/30 border-red-300/50 shadow-lg shadow-red-500/50"
                    : "score-entrance-1"
                }`}
              >
                <div className="flex justify-center mb-0.5 sm:mb-1 text-red-400">
                  <FaTimes className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                </div>
                <div className="text-white text-base sm:text-lg md:text-xl font-bold drop-shadow-lg">
                  {scores.X}
                </div>
                <div className="text-white/90 text-[10px] sm:text-xs font-medium mt-0.5">
                  Player X
                </div>
              </div>
              <div
                className={`text-center p-1.5 sm:p-2 bg-white/10 rounded-lg border-2 border-white/20 transition-all duration-300 flex-1 min-w-[80px] sm:min-w-[90px] lg:min-w-0 ${
                  scoreAnimation.type === "draws"
                    ? "score-bump bg-yellow-400/30 border-yellow-300/50 shadow-lg shadow-yellow-500/50"
                    : "score-entrance-2"
                }`}
              >
                <div className="flex justify-center mb-0.5 sm:mb-1 text-yellow-400">
                  <FaHandshake className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                </div>
                <div className="text-white text-base sm:text-lg md:text-xl font-bold drop-shadow-lg">
                  {scores.draws}
                </div>
                <div className="text-white/90 text-[10px] sm:text-xs font-medium mt-0.5">
                  Draws
                </div>
              </div>
              <div
                className={`text-center p-1.5 sm:p-2 bg-white/10 rounded-lg border-2 border-white/20 transition-all duration-300 flex-1 min-w-[80px] sm:min-w-[90px] lg:min-w-0 ${
                  scoreAnimation.type === "O"
                    ? "score-bump bg-blue-400/30 border-blue-300/50 shadow-lg shadow-blue-500/50"
                    : "score-entrance-3"
                }`}
              >
                <div className="flex justify-center mb-0.5 sm:mb-1 text-blue-400">
                  <FaCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                </div>
                <div className="text-white text-base sm:text-lg md:text-xl font-bold drop-shadow-lg">
                  {scores.O}
                </div>
                <div className="text-white/90 text-[10px] sm:text-xs font-medium mt-0.5">
                  {gameMode === "computer" ? "Computer" : "Player O"}
                </div>
              </div>
            </div>
          </div>
          {/* Game Status */}
          <div className="text-center">
            <p className="text-white text-xs sm:text-sm md:text-base mb-1.5 sm:mb-2 font-semibold drop-shadow-lg">
              {winner ? (
                <span className="text-base sm:text-lg md:text-xl flex items-center justify-center gap-2 block">
                  {winner === "Draw" ? (
                    <>
                      <FaHandshake className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span>It's a Draw!</span>
                    </>
                  ) : (
                    <>
                      <FaTrophy className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span>Game Over!</span>
                    </>
                  )}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm">Current Turn:</span>
                  <span className="flex items-center">
                    {isXNext ? (
                      <FaTimes className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                    ) : (
                      <FaCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    )}
                  </span>
                  <span className="text-sm sm:text-base">
                    {isXNext ? "X" : "O"}
                  </span>
                </span>
              )}
            </p>
            <button
              onClick={resetGame}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-lg text-white font-semibold text-xs sm:text-sm transition-all duration-300 border-2 border-white/30 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mx-auto"
            >
              <FaRedo className="w-4 h-4" />
              <span>New Game</span>
            </button>
          </div>
        </div>
      </div>

      {/* Result Modal - Shows winner/draw when game ends */}
      {showResult && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto"
          style={{
            animation: "fadeIn 0.3s ease-out forwards",
          }}
          onClick={() => setShowResult(false)}
        >
          <div
            className="backdrop-blur-xl bg-white/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border-2 border-white/40 max-w-md w-full relative overflow-hidden my-auto"
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
                className="mb-4 sm:mb-5 md:mb-6 inline-block"
                style={{
                  animation:
                    "cellPopIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, float 3s ease-in-out 1s infinite",
                  filter: "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))",
                }}
              >
                {winner === "X" ? (
                  <FaTimes className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 text-red-400" />
                ) : winner === "O" ? (
                  <FaCircle className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 text-blue-400" />
                ) : (
                  <FaHandshake className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 text-yellow-400" />
                )}
              </div>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 drop-shadow-2xl px-2"
                style={{
                  animation: "fadeInUp 0.6s ease-out 0.2s both",
                }}
              >
                {winner === "Draw" ? "It's a Draw!" : `${winner} Wins!`}
              </h2>
              <p
                className="text-white/90 text-base sm:text-lg md:text-xl mb-6 sm:mb-8 md:mb-10 font-medium px-2 flex items-center justify-center gap-2"
                style={{
                  animation: "fadeInUp 0.6s ease-out 0.4s both",
                }}
              >
                {winner === "Draw" ? (
                  "Well played both!"
                ) : (
                  <>
                    <span>Congratulations!</span>
                    <FaTrophy className="w-5 h-5 sm:w-6 sm:h-6" />
                  </>
                )}
              </p>
              <div
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                style={{
                  animation: "fadeInUp 0.6s ease-out 0.6s both",
                }}
              >
                <button
                  onClick={() => setShowResult(false)}
                  className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-lg sm:rounded-xl text-white font-semibold text-sm sm:text-base transition-all duration-300 border-2 border-white/30 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    resetGame();
                    setShowResult(false);
                  }}
                  className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-white/30 hover:bg-white/40 backdrop-blur-lg rounded-lg sm:rounded-xl text-white font-semibold text-sm sm:text-base transition-all duration-300 border-2 border-white/30 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
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
