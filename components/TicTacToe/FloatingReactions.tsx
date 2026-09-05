/**
 * Floating Reactions Component
 * Renders animated floating emoji reactions over players or action areas
 */

import React from "react";
import { EmojiReaction, Player, EMOJI_DATA, AllowedEmoji } from "./types";

interface FloatingReactionsProps {
  reactions: EmojiReaction[];
  localPlayerSymbol?: Player;
}

export const FloatingReactions: React.FC<FloatingReactionsProps> = ({
  reactions,
}) => {
  if (reactions.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-visible">
      {reactions.map((reaction, index) => {
        // Calculate positioning based on who sent it
        // If sender is Player X -> left/top side of board or score card
        // If sender is Player O -> right/bottom side
        // If sender is self/opponent without symbols -> default positioning
        const isPlayerX = reaction.senderSymbol === "X";
        const isPlayerO = reaction.senderSymbol === "O";
        
        let positionClass = "left-1/2 bottom-16 -translate-x-1/2"; // fallback center
        
        if (isPlayerX) {
          positionClass = "left-4 sm:left-10 bottom-24 sm:bottom-28";
        } else if (isPlayerO) {
          positionClass = "right-4 sm:right-10 bottom-24 sm:bottom-28";
        } else if (reaction.isSelf) {
          positionClass = "right-6 bottom-20";
        } else {
          positionClass = "left-6 bottom-20";
        }

        // Add subtle horizontal drift based on index to separate multiple simultaneous emojis
        const horizontalOffset = ((index % 5) - 2) * 16;
        const emojiMeta = EMOJI_DATA[reaction.emoji as AllowedEmoji];

        return (
          <div
            key={reaction.id}
            className={`absolute ${positionClass} flex flex-col items-center animate-reaction-float`}
            style={{
              marginLeft: `${horizontalOffset}px`,
            }}
          >
            <div className="relative flex items-center justify-center p-2 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 shadow-xl shadow-purple-500/20">
              {emojiMeta?.imageUrl ? (
                <img
                  src={emojiMeta.imageUrl}
                  alt={emojiMeta.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain pointer-events-none drop-shadow-xl filter"
                  loading="eager"
                />
              ) : (
                <span className="text-3xl sm:text-4xl md:text-5xl filter drop-shadow-lg select-none">
                  {reaction.emoji}
                </span>
              )}
              {reaction.senderSymbol && (
                <span
                  className={`absolute -top-1.5 -right-1.5 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white shadow-md ${
                    reaction.senderSymbol === "X"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }`}
                >
                  {reaction.senderSymbol}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-white/90 drop-shadow mt-1 px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm">
              {reaction.isSelf ? "You" : reaction.senderSymbol ? `Player ${reaction.senderSymbol}` : "Opponent"}
            </span>
          </div>
        );
      })}
    </div>
  );
};
