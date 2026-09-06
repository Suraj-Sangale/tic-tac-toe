/**
 * Quick Reaction Picker Component
 * Provides a compact, modern popover for sending emoji reactions with spam cooldown
 */

import React, { useState, useEffect, useRef } from "react";
import { FaSmile } from "react-icons/fa";
import { ALLOWED_EMOJIS, AllowedEmoji, EMOJI_DATA } from "./types";

interface QuickReactionPickerProps {
  onSelectEmoji: (emoji: AllowedEmoji) => void;
  cooldownMs?: number;
  disabled?: boolean;
}

export const QuickReactionPicker: React.FC<QuickReactionPickerProps> = ({
  onSelectEmoji,
  cooldownMs = 7000,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  const handleEmojiClick = (emoji: AllowedEmoji) => {
    if (cooldownRemaining > 0 || disabled) return;

    // Trigger reaction
    onSelectEmoji(emoji);
    setIsOpen(false);

    // Start cooldown
    setCooldownRemaining(cooldownMs);
    const intervalTime = 50;
    const interval = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= intervalTime) {
          clearInterval(interval);
          return 0;
        }
        return prev - intervalTime;
      });
    }, intervalTime);
    cooldownTimerRef.current = interval;
  };

  const isCoolingDown = cooldownRemaining > 0;

interface EmojiMeta {
  name?: string;
  imageUrl?: string;
}

interface EmojiButtonProps {
  emoji: AllowedEmoji;
  parentClassName?: String;
  meta?: EmojiMeta;
  onClick: (emoji: AllowedEmoji) => void;
}

const EmojiButton: React.FC<EmojiButtonProps> = ({
  emoji,
  meta,
  onClick,
  parentClassName="w-8 h-8 sm:w-9 sm:h-9",
}) => {
  return (
    <button
      type="button"
      onClick={() => onClick(emoji)}
      className={`${parentClassName} flex items-center justify-center p-1 rounded-xl hover:bg-white/20 active:scale-125 hover:scale-125 transition-transform duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50`}
      title={meta?.name || emoji}
    >
      {meta?.imageUrl ? (
        <img
          src={meta.imageUrl}
          alt={meta.name || emoji}
          className="w-full h-full object-contain pointer-events-none drop-shadow-md"
          loading="eager"
        />
      ) : (
        <span className="text-xl drop-shadow-md">{emoji}</span>
      )}
    </button>
  );
};


  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Reaction Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && !isCoolingDown && setIsOpen((prev) => !prev)}
        disabled={disabled}
        title={isCoolingDown ? "Cooldown..." : "Send Reaction"}
        className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-white font-semibold text-xs sm:text-sm backdrop-blur-lg border transition-all duration-200 flex items-center gap-1.5 shadow-lg active:scale-95 ${
          isOpen
            ? "bg-white/35 border-white/60 ring-2 ring-white/40 scale-105"
            : isCoolingDown
            ? "bg-white/10 border-white/15 opacity-60 cursor-not-allowed"
            : "bg-white/20 hover:bg-white/30 border-white/30 hover:scale-105 hover:border-white/50"
        }`}
      >
        {/* <span className="text-base sm:text-lg">
          <FaSmile className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-yellow-300" />
        </span> */}
        {ALLOWED_EMOJIS.slice(0,1).map((emoji) => {
            const meta = EMOJI_DATA[emoji];
            return (
              <EmojiButton
      key={emoji}
      emoji={emoji}
      meta={meta}
      onClick={handleEmojiClick}
      parentClassName="w-4 h-4  sm:w-7 sm:h-7"
    />
            );  
          })}
        <span className="font-medium">React</span>
        {/* {isCoolingDown && (
          <span className="text-[10px] sm:text-xs text-white/80 font-mono">
            {(cooldownRemaining / 1000).toFixed(1)}s
          </span>
        )} */}
      </button>

      {/* Emoji Popup Menu */}
      {isOpen && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 p-2 sm:p-2.5 backdrop-blur-2xl bg-black/85 border-2 border-white/30 rounded-2xl shadow-2xl animate-pop-picker flex items-center gap-1 sm:gap-2 select-none"
          role="dialog"
          aria-label="Quick Emoji Reactions"
        >
          {ALLOWED_EMOJIS.map((emoji) => {
            const meta = EMOJI_DATA[emoji];
            return (
              <EmojiButton
      key={emoji}
      emoji={emoji}
      meta={meta}
      onClick={handleEmojiClick}
    />
            );  
          })}
          {/* Arrow indicator */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-black/85"></div>
        </div>
      )}
    </div>
  );
};
