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
  FaLink,
} from "react-icons/fa";

import {
  GameMode,
  Board,
  Player,
  GameScores,
  ScoreAnimation,
  RoomData,
} from "./types";
import { checkWinner, makeComputerMove } from "./gameLogic";
import { useGameAnimations } from "./useGameAnimations";
import { MenuScreen } from "./MenuScreen";
import { InviteScreen } from "./InviteScreen";
import { GameBoard } from "./GameBoard";
import { ScoreBoard } from "./ScoreBoard";
import { ResultModal } from "./ResultModal";
import { AnimatedBackground } from "./AnimatedBackground";
import { useWebSocket } from "./useWebSocket";

export const TicTacToeHome = () => {
  // Initialize animations
  useGameAnimations();

  // WebSocket for online mode
  const {
    socket,
    roomData,
    makeMove: wsMakeMove,
    resetGame: wsResetGame,
  } = useWebSocket();

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
  const [onlineRoomData, setOnlineRoomData] = useState<RoomData | null>(null);
  const [showInviteScreen, setShowInviteScreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Processes a move on the board
  // @param index - The cell index (0-8) where the move is being made
  //  * @param player - The player making the move ("X" or "O")
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

  // Computer Move Effect
  // Only runs in computer mode when it's O's turn and game hasn't ended

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

  // Handles cell click events
  //  * @param index - The clicked cell index (0-8)

  console.log("onlineRoomData", onlineRoomData);
  const handleCellClick = (index: number) => {
    if (gameMode === "online") {
      // Online mode: send move via WebSocket
      if (!onlineRoomData) return;
      const player = onlineRoomData.playerSymbol;
      // Only allow moves if it's the player's turn
      if (board[index] || winner) return;
      wsMakeMove(index, player);
    } else {
      // Local mode: process move locally
      const player = isXNext ? "X" : "O";
      processMove(index, player);
    }
  };

  // Resets the game board and state for a new game

  const resetGame = () => {
    if (gameMode === "online" && onlineRoomData) {
      // Online mode: send reset via WebSocket
      wsResetGame();
    } else {
      // Local mode: reset locally
      setBoard(Array(9).fill(null));
      setIsXNext(true);
      setWinner(null);
      setShowResult(false);
      setWinningLine([]);
      setAnimatedCells(new Set());
    }
  };

  // Returns to the main menu

  const backToMenu = () => {
    setGameMode(null);
    resetGame();
    setScores({ X: 0, O: 0, draws: 0 });
    setScoreAnimation({ type: null });
    setOnlineRoomData(null);
    setShowInviteScreen(false);
  };

  // Handles online mode selection
  const handleOnlineMode = () => {
    setGameMode("online");
    setShowInviteScreen(true);
  };

  // Called when room is ready (created or joined)
  const handleRoomReady = (roomData: RoomData) => {
    setOnlineRoomData(roomData);
    // Don't hide invite screen - let it show the "Room Created/Joined" UI
    // The invite screen will stay visible to show room info
  };

  // WebSocket event handlers for online mode
  useEffect(() => {
    if (!socket || gameMode !== "online") return;

    const handleMoveMade = (data: {
      board: Board;
      currentTurn: Player;
      winner: Player | "Draw" | null;
      winningLine: number[];
      lastMove: { index: number; player: Player };
    }) => {
      setBoard(data.board);
      setIsXNext(data.currentTurn === "X");

      // Trigger animation for the last move
      setAnimatedCells((prev) => new Set(prev).add(data.lastMove.index));
      setTimeout(() => {
        setAnimatedCells((prev) => {
          const next = new Set(prev);
          next.delete(data.lastMove.index);
          return next;
        });
      }, 500);

      if (data.winner) {
        setTimeout(() => {
          setWinner(data.winner);
          setWinningLine(data.winningLine);
          setShowResult(true);
        }, 600);

        // Trigger score animation
        if (data.winner === "X") {
          setScoreAnimation({ type: "X" });
        } else if (data.winner === "O") {
          setScoreAnimation({ type: "O" });
        } else {
          setScoreAnimation({ type: "draws" });
        }

        setTimeout(() => setScoreAnimation({ type: null }), 600);

        // Update scores
        setScores((prev) => ({
          ...prev,
          X: data.winner === "X" ? prev.X + 1 : prev.X,
          O: data.winner === "O" ? prev.O + 1 : prev.O,
          draws: data.winner === "Draw" ? prev.draws + 1 : prev.draws,
        }));
      }
    };

    const handleGameReset = (data: { board: Board; currentTurn: Player }) => {
      setBoard(data.board);
      setIsXNext(data.currentTurn === "X");
      setWinner(null);
      setShowResult(false);
      setWinningLine([]);
      setAnimatedCells(new Set());
    };

    const handlePlayerJoined = (data?: { 
      players?: Array<{ id: string }>;
      gameState?: {
        board: Board;
        currentTurn: Player;
        winner: Player | "Draw" | null;
        winningLine: number[];
      };
    }) => {
      // Player joined notification (could show a toast)
      console.log("Player joined the room", data);
      // Auto-proceed to game when both players are ready
      if (data?.players && data.players.length >= 2 && onlineRoomData) {
        // Clear any previous errors
        setError(null);
        
        // Both players are in the room, sync game state if provided
        if (data.gameState) {
          setBoard(data.gameState.board);
          setIsXNext(data.gameState.currentTurn === "X");
          setWinner(data.gameState.winner);
          setWinningLine(data.gameState.winningLine || []);
          setAnimatedCells(new Set());
          if (data.gameState.winner) {
            setShowResult(true);
          }
        } else {
          // If no game state provided, initialize fresh game
          setBoard(Array(9).fill(null));
          setIsXNext(true);
          setWinner(null);
          setWinningLine([]);
          setAnimatedCells(new Set());
        }
        
        // Hide invite screen to proceed to game
        setShowInviteScreen(false);
      }
    };

    const handlePlayerLeft = () => {
      // Player left notification
      console.log("Player left the room");
      setError("Opponent disconnected");
    };

    socket.on("move-made", handleMoveMade);
    socket.on("game-reset", handleGameReset);
    socket.on("player-joined", handlePlayerJoined);
    socket.on("player-left", handlePlayerLeft);

    return () => {
      socket.off("move-made", handleMoveMade);
      socket.off("game-reset", handleGameReset);
      socket.off("player-joined", handlePlayerJoined);
      socket.off("player-left", handlePlayerLeft);
    };
  }, [socket, gameMode, onlineRoomData]);

  // Render main menu when no game mode is selected
  if (gameMode === null) {
    return (
      <MenuScreen
        onSelectMode={(mode) => {
          if (mode === "online") {
            handleOnlineMode();
          } else {
            setGameMode(mode);
          }
        }}
      />
    );
  }

  // Render invite screen for online mode
  // Show it when user selects online mode OR when they haven't started playing yet
  if (gameMode === "online" && (showInviteScreen || !onlineRoomData)) {
    return (
      <InviteScreen
        onBack={backToMenu}
        onRoomReady={handleRoomReady}
      />
    );
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
                ) : gameMode === "online" ? (
                  <FaLink className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                ) : (
                  <FaGamepad className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                )}
              </span>
              <span className="whitespace-nowrap text-sm sm:text-base">
                {gameMode === "computer"
                  ? "vs Computer"
                  : gameMode === "online"
                  ? "Online Multiplayer"
                  : "vs Player"}
              </span>
            </h2>
          </div>

          {/* Error message for online mode */}
          {error && gameMode === "online" && (
            <div className="mb-2 p-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-100 text-xs sm:text-sm text-center">
              {error}
            </div>
          )}

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
              onlineRoomData={onlineRoomData}
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
                    {gameMode === "online" && onlineRoomData && (
                      <span className="text-xs ml-1 opacity-70">
                        (
                        {onlineRoomData.playerSymbol === (isXNext ? "X" : "O")
                          ? "You"
                          : "Opponent"}
                        )
                      </span>
                    )}
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
