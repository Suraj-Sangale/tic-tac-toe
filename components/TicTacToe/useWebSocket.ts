/**
 * WebSocket Hook for Online Multiplayer
 * Manages socket.io connection and game room events
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { RoomData, Board, Player, WinnerResult } from "./types";

interface UseWebSocketReturn {
  socket: Socket | null;
  roomData: RoomData | null;
  isConnected: boolean;
  createRoom: () => Promise<RoomData | null>;
  joinRoom: (roomId: string) => Promise<RoomData | null>;
  makeMove: (index: number, player: Player) => void;
  resetGame: () => void;
  startGame: (roomId: string) => void;
  error: string | null;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setError("Failed to connect to server");
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const createRoom = useCallback(async (): Promise<RoomData | null> => {
    if (!socket || !isConnected) {
      setError("Not connected to server");
      return null;
    }

    return new Promise((resolve) => {
      socket.emit("create-room", (response: RoomData | { error: string }) => {
        if ("error" in response) {
          setError(response.error);
          resolve(null);
        } else {
          setRoomData(response);
          setError(null);
          resolve(response);
        }
      });
    });
  }, [socket, isConnected]);

  const joinRoom = useCallback(
    async (roomId: string): Promise<RoomData | null> => {
      if (!socket || !isConnected) {
        setError("Not connected to server");
        return null;
      }

      return new Promise((resolve) => {
        socket.emit("join-room", roomId, (response: RoomData | { error: string }) => {
          if ("error" in response) {
            setError(response.error);
            resolve(null);
          } else {
            setRoomData(response);
            setError(null);
            resolve(response);
          }
        });
      });
    },
    [socket, isConnected]
  );

  const makeMove = useCallback(
    (index: number, player: Player) => {
      if (!socket || !roomData) return;
      socket.emit("make-move", {
        roomId: roomData.roomId,
        index,
        player,
      });
    },
    [socket, roomData]
  );

  const resetGame = useCallback(() => {
    if (!socket || !roomData) return;
    socket.emit("reset-game", { roomId: roomData.roomId });
  }, [socket, roomData]);

  const startGame = useCallback((roomId: string) => {
    console.log("startGame called", { 
      hasSocket: !!socket, 
      roomId, 
      socketConnected: socket?.connected,
      socketId: socket?.id 
    });
    if (!socket) {
      console.error("Cannot start game: socket is null");
      return;
    }
    if (!socket.connected) {
      console.error("Cannot start game: socket is not connected");
      return;
    }
    if (!roomId) {
      console.error("Cannot start game: roomId is missing");
      return;
    }
    console.log("Emitting start-game event with roomId:", roomId);
    try {
      socket.emit("start-game", { roomId });
      console.log("start-game event emitted successfully");
    } catch (error) {
      console.error("Error emitting start-game event:", error);
    }
  }, [socket]);

  return {
    socket,
    roomData,
    isConnected,
    createRoom,
    joinRoom,
    makeMove,
    resetGame,
    startGame,
    error,
  };
};

