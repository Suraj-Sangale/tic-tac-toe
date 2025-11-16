/**
 * Menu Screen Component
 * Initial screen where users choose game mode
 */

import { FaGamepad, FaRobot, FaLink } from "react-icons/fa";
import { GameMode } from "./types";
import { AnimatedBackground } from "./AnimatedBackground";

interface MenuScreenProps {
  onSelectMode: (mode: GameMode) => void;
}

export const MenuScreen = ({ onSelectMode }: MenuScreenProps) => {
  return (
    <div className="min-h-screen h-screen bg-gradient-to-br from-indigo-950 via-purple-500 to-pink-500 bg-animated flex items-center justify-center p-3 sm:p-4 md:p-6 relative overflow-hidden">
      <AnimatedBackground />

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
            onClick={() => onSelectMode("player")}
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
            onClick={() => onSelectMode("computer")}
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
          <button
            onClick={() => onSelectMode("online")}
            className="w-full py-4 sm:py-5 md:py-6 px-6 sm:px-8 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-xl sm:rounded-2xl text-white font-semibold text-lg sm:text-xl transition-all duration-300 border-2 border-white/30 hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl hover:border-white/50 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
              <span className="group-hover:scale-110 transition-transform duration-300">
                <FaLink className="w-6 h-6 sm:w-7 sm:h-7" />
              </span>
              <span className="whitespace-nowrap">Invite a Friend</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

