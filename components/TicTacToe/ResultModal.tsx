/**
 * Result Modal Component
 * Displays winner/draw when game ends
 */

import { FaTimes, FaCircle, FaHandshake, FaTrophy } from "react-icons/fa";
import { Player } from "./types";
import Image from "next/image";

interface ResultModalProps {
  winner: Player | "Draw" | null;
  onClose: () => void;
  onPlayAgain: () => void;
  showResult: boolean;
  /**
   * The symbol of the local player ("X" or "O") when applicable.
   * Used to show personalized win/lose messages in vs-computer / online modes.
   */
  localPlayerSymbol?: Player | null;
}

export const ResultModal = ({
  winner,
  onClose,
  onPlayAgain,
  showResult,
  localPlayerSymbol,
}: ResultModalProps) => {
  if (!winner || !showResult) return null;

  const isDraw = winner === "Draw";
  const isUserKnown = !!localPlayerSymbol && !isDraw;
  const isUserWinner = isUserKnown && winner === localPlayerSymbol;
  const isUserLoser = isUserKnown && winner !== localPlayerSymbol;

  const titleText = isDraw
    ? "It's a Draw!"
    : isUserWinner
      ? "You Win!"
      : isUserLoser
        ? "You Lose!"
        : `${winner} Wins!`;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto"
      style={{
        animation: "fadeIn 0.3s ease-out forwards",
      }}
      onClick={onClose}
    >
      <div
        className="backdrop-blur-xl bg-white/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border-2 border-white/40 max-w-md w-full relative overflow-hidden my-auto"
        style={{
          animation: "fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow effect */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at center, ${winner === "X"
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
            {titleText}
          </h2>
          <p
            className="text-white/90 text-base sm:text-lg md:text-xl mb-6 sm:mb-8 md:mb-10 font-medium px-2 flex items-center justify-center gap-2"
            style={{
              animation: "fadeInUp 0.6s ease-out 0.4s both",
            }}
          >
            {isDraw ? (
              "Well played both!"
            ) : isUserWinner ? (
              <>
                <Image
                  src="/images/trophy.png"
                  width={40}
                  height={40}
                  alt="Trophy"
                  className="w-8 h-8 sm:w-10 sm:h-10"
                />
                <span className="text-2xl">Congratulations, you won!</span>
                {/* <FaTrophy className="w-5 h-5 sm:w-6 sm:h-6" /> */}
                <Image
                  src="/images/trophy.png"
                  width={40}
                  height={40}
                  alt="Trophy"
                  className="w-8 h-8 sm:w-10 sm:h-10"
                />
              </>
            ) : isUserLoser ? (
              <span className="text-xl sm:text-2xl">
                Tough luck! Your opponent won this round. Try again!
              </span>
            ) : (
              <>
                <Image
                  src="/images/trophy.png"
                  width={40}
                  height={40}
                  alt="Trophy"
                  className="w-8 h-8 sm:w-10 sm:h-10"
                />
                <span className="text-2xl">Congratulations!</span>
                {/* <FaTrophy className="w-5 h-5 sm:w-6 sm:h-6" /> */}
                <Image
                  src="/images/trophy.png"
                  width={40}
                  height={40}
                  alt="Trophy"
                  className="w-8 h-8 sm:w-10 sm:h-10"
                />
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
              onClick={onClose}
              className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-lg sm:rounded-xl text-white font-semibold text-sm sm:text-base transition-all duration-300 border-2 border-white/30 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              Close
            </button>
            <button
              onClick={onPlayAgain}
              className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-white/30 hover:bg-white/40 backdrop-blur-lg rounded-lg sm:rounded-xl text-white font-semibold text-sm sm:text-base transition-all duration-300 border-2 border-white/30 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
