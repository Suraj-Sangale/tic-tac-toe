/**
 * Game Cell Component
 * Individual cell in the tic-tac-toe board
 */

import { Player } from "./types";
import { RenderX } from "./RenderX";
import { RenderO } from "./RenderO";

interface GameCellProps {
  cell: Player;
  index: number;
  isAnimated: boolean;
  isWinning: boolean;
  isDisabled: boolean;
  onClick: () => void;
  showHoverIndicator: boolean;
}

export const GameCell = ({
  cell,
  index,
  isAnimated,
  isWinning,
  isDisabled,
  onClick,
  showHoverIndicator,
}: GameCellProps) => {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`aspect-square bg-white/20 backdrop-blur-lg rounded-lg sm:rounded-xl border-2 border-white/30 text-white transition-all duration-300 hover:bg-white/30 hover:scale-105 active:scale-95 disabled:cursor-not-allowed shadow-lg hover:shadow-xl relative overflow-hidden group ${
        isWinning
          ? "bg-gradient-to-br from-green-400/50 to-emerald-500/50 border-green-300/70 shadow-green-500/50 "
          : "hover:border-white/50"
      } ${isAnimated ? "cell-pop" : ""} ${
        showHoverIndicator ? "hover:ring-2 hover:ring-white/30" : ""
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
            {showHoverIndicator && (
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-white/20 group-hover:bg-white/40 transition-colors"></div>
            )}
          </div>
        )}
      </div>
    </button>
  );
};

