/**
 * Type definitions for TicTacToe game
 */

export type Player = "X" | "O" | null;
export type GameMode = "computer" | "player" | "online" | null;
export type Board = Player[];

export interface GameScores {
  X: number;
  O: number;
  draws: number;
}

export interface WinnerResult {
  winner: Player | "Draw" | null;
  line: number[];
}

export interface ScoreAnimation {
  type: "X" | "O" | "draws" | null;
}

export interface RoomData {
  roomId: string;
  playerId: string;
  playerSymbol: Player;
  isHost: boolean;
}

export const ALLOWED_EMOJIS = [
  "😂",
  "❤️",
  "😮",
  "👏",
  "🔥",
  "😢",
  "😡",
  "🎉",
  "👍",
] as const;

export type AllowedEmoji = typeof ALLOWED_EMOJIS[number];

export interface EmojiReaction {
  id: string;
  emoji: AllowedEmoji | string;
  senderId: string;
  senderSymbol?: Player;
  isSelf: boolean;
  timestamp: number;
}

export interface EmojiMeta {
  id: string;
  name: string;
  char: AllowedEmoji;
  imageUrl: string;
}

export const EMOJI_DATA: Record<AllowedEmoji, EmojiMeta> = {
  "😂": {
    id: "joy",
    name: "Tears of Joy",
    char: "😂",
    imageUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f602/512.webp",
  },
  "❤️": {
    id: "heart",
    name: "Red Heart",
    char: "❤️",
    imageUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/2764_fe0f/512.webp",
  },
  "😮": {
    id: "surprised",
    name: "Surprised",
    char: "😮",
    imageUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f62e/512.webp",
  },
  "👏": {
    id: "clap",
    name: "Clapping Hands",
    char: "👏",
    imageUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f44f/512.webp",
  },
  "🔥": {
    id: "fire",
    name: "Fire",
    char: "🔥",
    imageUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/512.webp",
  },
  "😢": {
    id: "cry",
    name: "Crying Face",
    char: "😢",
    imageUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f622/512.webp",
  },
  "😡": {
    id: "angry",
    name: "Angry Face",
    char: "😡",
    imageUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f621/512.webp",
  },
  "🎉": {
    id: "party",
    name: "Party Popper",
    char: "🎉",
    imageUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f389/512.webp",
  },
  "👍": {
    id: "thumbsup",
    name: "Thumbs Up",
    char: "👍",
    imageUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f44d/512.webp",
  },
};

