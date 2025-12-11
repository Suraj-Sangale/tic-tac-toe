/**
 * Score Board Component
 * Displays scores for X, O, and draws
 */

import { FaTimes, FaCircle, FaHandshake } from "react-icons/fa";
import { GameMode, GameScores, ScoreAnimation } from "./types";

interface ScoreBoardProps {
  scores: GameScores;
  gameMode: GameMode;
  scoreAnimation: ScoreAnimation;
}

export const ScoreBoard = ({
  scores,
  gameMode,
  scoreAnimation,
}: ScoreBoardProps) => {
  return (
    <div className="w-1/2 lg:w-40 xl:w-44 backdrop-blur-lg bg-white/10 p-2 sm:p-2.5 rounded-xl border-2 border-white/20 flex flex-col gap-1.5 sm:gap-2 shadow-xl overflow-x-auto lg:overflow-x-visible">
      {/* Player X Score */}
      <div

        className={`inner-shadow text-center p-1.5 sm:p-2 bg-white/10 rounded-lg border-2 border-white/20 transition-all duration-300 flex-1 min-w-[80px] sm:min-w-[90px] lg:min-w-0 ${scoreAnimation.type === "X"
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

      {/* Draws Score */}
      <div
        className={`inner-shadow text-center p-1.5 sm:p-2 bg-white/10 rounded-lg border-2 border-white/20 transition-all duration-300 flex-1 min-w-[80px] sm:min-w-[90px] lg:min-w-0 ${scoreAnimation.type === "draws"
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

      {/* Player O / Computer Score */}
      <div
        className={`inner-shadow text-center p-1.5 sm:p-2 bg-white/10 rounded-lg border-2 border-white/20 transition-all duration-300 flex-1 min-w-[80px] sm:min-w-[90px] lg:min-w-0 ${scoreAnimation.type === "O"
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
  );
};

