/**
 * Custom hook for managing CSS animations
 * Injects custom keyframe animations into the document head
 */

import { useEffect } from "react";

export const useGameAnimations = () => {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes drawLine {
        from {
          stroke-dashoffset: 500;
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
      @keyframes floatReaction {
        0% {
          opacity: 0;
          transform: translateY(12px) scale(0.5) rotate(-6deg);
        }
        15% {
          opacity: 1;
          transform: translateY(-5px) scale(1.35) rotate(4deg);
        }
        35% {
          transform: translateY(-25px) scale(1.15) rotate(-3deg);
        }
        70% {
          opacity: 0.95;
          transform: translateY(-65px) scale(1.05) rotate(3deg);
        }
        100% {
          opacity: 0;
          transform: translateY(-105px) scale(0.8) rotate(0deg);
        }
      }
      @keyframes popPicker {
        0% {
          opacity: 0;
          transform: scale(0.85) translateY(8px);
        }
        100% {
          opacity: 1;
          transform: scale(1) translateY(0);
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
      .animate-reaction-float {
        animation: floatReaction 1.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
      }
      .animate-pop-picker {
        animation: popPicker 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
};

