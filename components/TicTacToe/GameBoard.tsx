/**
 * Game Board Component
 * Renders the 3x3 tic-tac-toe grid with cells and winning line
 */

import { Board, Player, RoomData } from "./types";
import { GameCell } from "./GameCell";

interface GameBoardProps {
  board: Board;
  winningLine: number[];
  animatedCells: Set<number>;
  winner: Player | "Draw" | null;
  gameMode: "computer" | "player" | "online" | null;
  isXNext: boolean;
  onCellClick: (index: number) => void;
  onlineRoomData?: RoomData | null;
}

export const GameBoard = ({
  board,
  winningLine,
  animatedCells,
  winner,
  gameMode,
  isXNext,
  onCellClick,
  onlineRoomData,
}: GameBoardProps) => {
  // Determine if it's the current player's turn in online mode
  const isMyTurn =
    gameMode === "online" && onlineRoomData
      ? (isXNext && onlineRoomData.playerSymbol === "X") ||
        (!isXNext && onlineRoomData.playerSymbol === "O")
      : true;

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-1.5 mb-2 sm:mb-3 relative p-1 w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[360px] md:h-[360px] mx-auto lg:mx-0 flex-shrink-0">
      {/* Render 9 cells (3x3 grid) for the game board */}
      {board.map((cell, index) => {
        const isAnimated = animatedCells.has(index);
        const isWinning = winningLine.includes(index);
        const isDisabled =
          !!cell ||
          !!winner ||
          (gameMode === "computer" && !isXNext) ||
          (gameMode === "online" && !isMyTurn);
        const showHoverIndicator =
          !winner && !cell && !(gameMode === "computer" && !isXNext) && (gameMode !== "online" || isMyTurn);

        return (
          <GameCell
            key={index}
            cell={cell}
            index={index}
            isAnimated={isAnimated}
            isWinning={isWinning}
            isDisabled={isDisabled}
            onClick={() => onCellClick(index)}
            showHoverIndicator={showHoverIndicator}
          />
        );
      })}

      {/* Winning line overlay */}
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
  );
};

