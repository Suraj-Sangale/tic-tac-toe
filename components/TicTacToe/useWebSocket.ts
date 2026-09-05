/**
 * WebSocket Hook for Online Multiplayer
 * Manages socket.io connection and game room events
 */

import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { RoomData, Player } from "./types";

interface UseWebSocketReturn {
  socket: Socket | null;
  roomData: RoomData | null;
  isConnected: boolean;
  createRoom: () => Promise<RoomData | null>;
  joinRoom: (roomId: string) => Promise<RoomData | null>;
  makeMove: (index: number, player: Player, roomId?: string) => void;
  resetGame: (roomId?: string) => void;
  startGame: (roomId: string) => void;
  sendReaction: (emoji: string, roomId?: string) => void;
  error: string | null;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
        ? "http://localhost:3000"
        : "https://tic-tac-toe-production-0b09.up.railway.app");
    console.log("Initializing socket connection to:", socketUrl);

    const socketInstance = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socketInstance.on("connect", () => {
      console.log("✅ Connected to server", {
        socketId: socketInstance.id,
        connected: socketInstance.connected,
        url: socketUrl,
      });
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Disconnected from server", { reason });
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("❌ Connection error:", err);
      setError("Failed to connect to server");
    });

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log("🔄 Reconnected to server", { attemptNumber });
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on("reconnect_error", (err) => {
      console.error("❌ Reconnection error:", err);
    });

    socketInstance.on("reconnect_failed", () => {
      console.error("❌ Reconnection failed");
      setError("Failed to reconnect to server");
    });

    // Test event listener to verify socket is working
    socketInstance.onAny((eventName, ...args) => {
      console.log("📨 Socket received event:", eventName, args);
    });

    setSocket(socketInstance);

    return () => {
      console.log("Cleaning up socket connection");
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
        socket.emit(
          "join-room",
          roomId,
          (response: RoomData | { error: string }) => {
            if ("error" in response) {
              setError(response.error);
              resolve(null);
            } else {
              setRoomData(response);
              setError(null);
              resolve(response);
            }
          },
        );
      });
    },
    [socket, isConnected],
  );

  const makeMove = useCallback(
    (index: number, player: Player, roomId?: string) => {
      if (!socket) {
        console.error("Cannot make move: socket is null");
        return;
      }
      const targetRoomId = roomId || roomData?.roomId;
      if (!targetRoomId) {
        console.error("Cannot make move: roomId is missing", {
          roomId,
          roomData,
        });
        return;
      }
      console.log("Emitting make-move", {
        roomId: targetRoomId,
        index,
        player,
        socketId: socket.id,
      });
      socket.emit("make-move", {
        roomId: targetRoomId,
        index,
        player,
      });
    },
    [socket, roomData],
  );

  const resetGame = useCallback(
    (roomId?: string) => {
      if (!socket) return;
      const targetRoomId = roomId || roomData?.roomId;
      if (!targetRoomId) return;
      socket.emit("reset-game", { roomId: targetRoomId });
    },
    [socket, roomData],
  );

  const startGame = useCallback(
    (roomId: string) => {
      console.log("🚀 startGame called", {
        hasSocket: !!socket,
        roomId,
        socketConnected: socket?.connected,
        socketId: socket?.id,
        socketDisconnected: socket?.disconnected,
      });
      if (!socket) {
        console.error("❌ Cannot start game: socket is null");
        return;
      }
      if (!socket.connected) {
        console.error(
          "❌ Cannot start game: socket is not connected. Socket state:",
          {
            connected: socket.connected,
            disconnected: socket.disconnected,
            id: socket.id,
          },
        );
        return;
      }
      if (!roomId) {
        console.error("❌ Cannot start game: roomId is missing");
        return;
      }
      console.log("📤 Emitting start-game event with roomId:", roomId);
      try {
        // Emit with acknowledgment to verify it reaches server
        socket.emit("start-game", { roomId }, (response: unknown) => {
          console.log("📥 Server acknowledgment for start-game:", response);
        });
        console.log("✅ start-game event emitted successfully");

        // Also log after a short delay to see if anything happens
        setTimeout(() => {
          console.log(
            "⏱️ 2 seconds after emit - checking if event was processed",
          );
        }, 2000);
      } catch (error) {
        console.error("❌ Error emitting start-game event:", error);
      }
    },
    [socket],
  );

  const sendReaction = useCallback(
    (emoji: string, roomId?: string) => {
      if (!socket) {
        console.error("Cannot send reaction: socket is null");
        return;
      }
      const targetRoomId = roomId || roomData?.roomId;
      if (!targetRoomId) {
        console.error("Cannot send reaction: roomId is missing");
        return;
      }
      socket.emit("game:reaction", {
        roomId: targetRoomId,
        emoji,
        senderId: socket.id,
      });
    },
    [socket, roomData],
  );

  return {
    socket,
    roomData,
    isConnected,
    createRoom,
    joinRoom,
    makeMove,
    resetGame,
    startGame,
    sendReaction,
    error,
  };
};
