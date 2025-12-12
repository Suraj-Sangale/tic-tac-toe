import React, { useState, useEffect } from "react";

const Custom404 = () => {
  const [floating, setFloating] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFloating((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className=" h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900
 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background X and O */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-full flex flex-wrap content-start">
          <div
            className="text-white text-[30rem] font-bold p-4 right-72 absolute transition-transform duration-1000"
            style={{
              transform: `translateY(-50%) rotate(${floating * 0.5}deg)`,
            }}
          >
            ❌
          </div>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full flex flex-wrap content-start">
          <div
            className="text-white text-[30rem] font-bold p-4 left-72 absolute transition-transform duration-1000"
            style={{
              transform: `translateY(-50%) rotate(${-floating * 0.5}deg)`,
            }}
          >
            ⭕
          </div>
        </div>
      </div>

      {/* Floating particles */}
      {/* {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white/30 rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))} */}

      {/* 404 Content */}
      <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 shadow-2xl border-2 border-white/30 max-w-2xl w-full relative z-10 text-center animate-in zoom-in duration-500">
        <div className="mb-8">
          {/* 404 with Animated TicTacToe Grid */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div
              className="text-9xl font-bold text-white drop-shadow-2xl"
              style={{
                animation: "bounce 2s infinite",
                textShadow: "0 0 40px rgba(255,255,255,0.5)",
              }}
            >
              4
            </div>

            <div className="relative">
              <div className="grid grid-cols-3 gap-1.5 w-28 h-28 animate-pulse">
                {["❌", "⭕", "❌", "⭕", "❌", "⭕", "❌", "⭕", "❌"].map(
                  (symbol, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-lg rounded-lg border-2 border-white/50 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform duration-300"
                      style={{
                        animation: `pulse 2s infinite ${i * 0.1}s`,
                        boxShadow: "0 0 20px rgba(255,255,255,0.3)",
                      }}
                    >
                      {symbol}
                    </div>
                  )
                )}
              </div>

              {/* Glowing effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-xl animate-pulse -z-10"></div>
            </div>

            <div
              className="text-9xl font-bold text-white drop-shadow-2xl"
              style={{
                animation: "bounce 2s infinite 0.2s",
                textShadow: "0 0 40px rgba(255,255,255,0.5)",
              }}
            >
              4
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          <h1 className="text-3xl font-bold text-white mb-4 drop-shadow-lg animate-in slide-in-from-top duration-700">
            Oops!
          </h1>
          <div className="text-white/90 text-xl mb-4 leading-relaxed animate-in slide-in-from-bottom duration-700">
            Page Not Found
          </div>
          <p className="text-white/80 text-lg leading-relaxed animate-in fade-in duration-1000">
            This page doesn't exist in our game.
            <br />
            Let's reset and start a new round! 🔄
          </p>
        </div>

        <div className="flex flex-row space-x-4 animate-in slide-in-from-bottom duration-1000">
          <button
            onClick={() => window.history.back()}
            className="group w-full py-4 px-8 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-2xl text-white font-semibold text-lg transition-all duration-300 border border-white/40 hover:scale-105 active:scale-95 shadow-lg relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              ← Previous Page
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
          </button>{" "}
          <button
            onClick={() => (window.location.href = "/")}
            className="group w-full py-3 px-8 bg-gradient-to-r from-pink-500/40 to-purple-500/40 hover:from-pink-500/60 hover:to-purple-500/60 backdrop-blur-lg rounded-2xl text-white font-bold text-lg transition-all duration-300 border-2 border-white/50 hover:scale-105 active:scale-95 shadow-2xl hover:shadow-pink-500/50 relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              🏠 Back to Game
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
          </button>
        </div>

        {/* <div className="mt-10 pt-6 border-t border-white/20">
          <div className="flex items-center justify-center gap-4 text-white/60 text-sm">
            <span className="flex items-center gap-2">
              <span className="animate-pulse">⚡</span>
              Powered by Next.js
            </span>
            <span>•</span>
            <span className="flex items-center gap-2">
              <span className="animate-spin">⭕</span>
              TicTacToe Game
            </span>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Custom404;
