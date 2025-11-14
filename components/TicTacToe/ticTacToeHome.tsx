/**
 * Main TicTacToe Game Component
 * Orchestrates game state, logic, and UI components
 * Supports both player vs player and player vs computer modes
 */

import React, { useState, useEffect, useCallback } from "react";
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

import { GameMode, Board, Player, GameScores, ScoreAnimation } from "./types";
import { checkWinner, makeComputerMove } from "./gameLogic";
import { useGameAnimations } from "./useGameAnimations";
import { MenuScreen } from "./MenuScreen";
import { GameBoard } from "./GameBoard";
import { ScoreBoard } from "./ScoreBoard";
import { ResultModal } from "./ResultModal";
import { AnimatedBackground } from "./AnimatedBackground";

export const TicTacToeHome = () => {
  // Initialize animations
  useGameAnimations();

  // Game state management
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [scores, setScores] = useState<GameScores>({ X: 0, O: 0, draws: 0 });
  const [winner, setWinner] = useState<Player | "Draw" | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [animatedCells, setAnimatedCells] = useState<Set<number>>(new Set());
  const [scoreAnimation, setScoreAnimation] = useState<ScoreAnimation>({
    type: null,
  });

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
    return <MenuScreen onSelectMode={setGameMode} />;
  }

  return (
    <div className="min-h-screen h-screen bg-gradient-to-br from-indigo-950 via-purple-500 to-pink-500 bg-animated flex items-center justify-center p-1.5 sm:p-2 md:p-3 relative overflow-hidden">
      <AnimatedBackground />

      <div className="backdrop-blur-xl bg-white/10 rounded-2xl sm:rounded-3xl p-2 sm:p-3 md:p-4 shadow-2xl border-2 border-white/30 w-4/5 relative z-10 flex flex-col lg:flex-row gap-2 sm:gap-3 md:gap-4 board-entrance mx-auto">
        <div className="flex-1 flex flex-col justify-around">
          {/* Header with back button and game mode indicator */}
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

          {/* Game Board and Score Board */}
          <div className="flex flex-row justify-evenly">
            <GameBoard
              board={board}
              winningLine={winningLine}
              animatedCells={animatedCells}
              winner={winner}
              gameMode={gameMode}
              isXNext={isXNext}
              onCellClick={handleCellClick}
            />
            <ScoreBoard
              scores={scores}
              gameMode={gameMode}
              scoreAnimation={scoreAnimation}
            />
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

      {/* Result Modal */}
      <ResultModal
        winner={winner}
        onClose={() => setShowResult(false)}
        onPlayAgain={() => {
          resetGame();
          setShowResult(false);
        }}
      />
    </div>
  );
};
