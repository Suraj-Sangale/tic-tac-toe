/**
 * Game Logic Utilities
 * Contains all game logic functions for tic-tac-toe
 */

import { Board, Player, WinnerResult } from "./types";

// All possible winning combinations in a 3x3 grid
// Format: [cell1, cell2, cell3] where cells are indices 0-8
export const WINNING_COMBINATIONS = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Main diagonal (top-left to bottom-right)
  [2, 4, 6], // Anti-diagonal (top-right to bottom-left)
];

/**
 * Checks if there's a winner on the current board
 * @param currentBoard - The current game board state
 * @returns Object containing the winner (X, O, Draw, or null) and the winning line indices
 */
export const checkWinner = (currentBoard: Board): WinnerResult => {
  // Check all winning combinations
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (
      currentBoard[a] &&
      currentBoard[a] === currentBoard[b] &&
      currentBoard[a] === currentBoard[c]
    ) {
      return { winner: currentBoard[a], line: [a, b, c] };
    }
  }
  // Check for draw (all cells filled, no winner)
  if (currentBoard.every((cell) => cell !== null)) {
    return { winner: "Draw", line: [] };
  }
  return { winner: null, line: [] };
};

/**
 * AI Computer Move Logic
 * Implements a simple but effective AI strategy:
 * 1. Try to win if possible
 * 2. Block player from winning
 * 3. Take center if available
 * 4. Take a corner if available
 * 5. Take any available cell
 * @param currentBoard - The current game board state
 * @returns The index where the computer should place its move
 */
export const makeComputerMove = (currentBoard: Board): number => {
  // Get all empty cell indices
  const emptyCells = currentBoard
    .map((cell, idx) => (cell === null ? idx : null))
    .filter((idx) => idx !== null) as number[];

  // Strategy 1: Try to win if possible
  for (const idx of emptyCells) {
    const testBoard = [...currentBoard];
    testBoard[idx] = "O";
    if (checkWinner(testBoard).winner === "O") return idx;
  }

  // Strategy 2: Block player from winning
  for (const idx of emptyCells) {
    const testBoard = [...currentBoard];
    testBoard[idx] = "X";
    if (checkWinner(testBoard).winner === "X") return idx;
  }

  // Strategy 3: Take center if available (best strategic position)
  if (emptyCells.includes(4)) return 4;

  // Strategy 4: Take a corner if available
  const corners = [0, 2, 6, 8].filter((idx) => emptyCells.includes(idx));
  if (corners.length > 0)
    return corners[Math.floor(Math.random() * corners.length)];

  // Strategy 5: Take any available cell
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};

