/**
 * Animated Background Component
 * Displays floating X and O icons in the background
 */

import { FaTimes, FaCircle } from "react-icons/fa";

export const AnimatedBackground = () => {
  return (
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
  );
};

