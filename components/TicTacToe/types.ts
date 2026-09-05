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
  emoji: string;
  senderId: string;
  senderSymbol?: Player;
  isSelf: boolean;
  timestamp: number;
}

