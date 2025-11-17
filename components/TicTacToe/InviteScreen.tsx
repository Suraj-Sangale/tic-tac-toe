/**
 * Invite Screen Component
 * Shows room creation/joining UI with shareable link
 */

import { useState, useEffect, useCallback } from "react";
import {
  FaLink,
  FaCopy,
  FaCheck,
  FaArrowLeft,
  FaUsers,
  FaPlay,
} from "react-icons/fa";
import { AnimatedBackground } from "./AnimatedBackground";
import { useWebSocket } from "./useWebSocket";
import { RoomData } from "./types";

interface InviteScreenProps {
  onBack: () => void;
  onRoomReady: (roomData: RoomData) => void;
  onStartGame?: () => void;
}

export const InviteScreen = ({
  onBack,
  onRoomReady,
  onStartGame,
}: InviteScreenProps) => {
  const {
    createRoom,
    joinRoom,
    isConnected,
    error: socketError,
    socket,
  } = useWebSocket();
  const [roomId, setRoomId] = useState<string>("");
  const [inputRoomId, setInputRoomId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [playersCount, setPlayersCount] = useState<number>(1);

  const handleCreateRoom = useCallback(async () => {
    setIsCreating(true);
    setError(null);

    const data = await createRoom();
    if (data) {
      setRoomData(data);
      setRoomId(data.roomId);
    } else {
      setError("Failed to create room. Please try again.");
    }
    setIsCreating(false);
  }, [createRoom]);

  const handleJoinRoom = useCallback(async () => {
    if (!inputRoomId.trim()) {
      setError("Please enter a room ID");
      return;
    }

    setIsJoining(true);
    setError(null);

    const data = await joinRoom(inputRoomId.trim().toUpperCase());
    if (data) {
      setRoomData(data);
      setRoomId(data.roomId);
    } else {
      setError(socketError || "Failed to join room. Please check the room ID.");
    }
    setIsJoining(false);
  }, [inputRoomId, joinRoom, socketError]);

  // Check for room ID in URL first (for joining) - this should run before auto-create
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get("room");
    console.log(
      "room condition=================",
      roomParam &&
        !roomId &&
        !isCreating &&
        !isJoining &&
        isConnected &&
        !roomData
    );
    if (
      roomParam &&
      !roomId &&
      !isCreating &&
      !isJoining &&
      isConnected &&
      !roomData
    ) {
      setInputRoomId(roomParam.toUpperCase());
      // Use the room param directly for joining
      const joinByUrl = async () => {
        setIsJoining(true);
        setError(null);
        const data = await joinRoom(roomParam.toUpperCase());
        if (data) {
          setRoomData(data);
          setRoomId(data.roomId);
        } else {
          setError(
            socketError || "Failed to join room. Please check the room ID."
          );
        }
        setIsJoining(false);
      };
      joinByUrl();
    }
  }, [
    isConnected,
    roomId,
    isCreating,
    isJoining,
    roomData,
    joinRoom,
    socketError,
  ]);

  // Auto-create room when component mounts and socket is connected
  // Only if there's no room ID in the URL (to avoid race condition)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get("room");

    // Only auto-create if:
    // 1. Connected to socket
    // 2. No room data yet
    // 3. Not currently joining
    // 4. No room ID in URL (if there is one, the join effect above should handle it)
    if (isConnected && !roomData && !isJoining && !roomParam) {
      handleCreateRoom();
    }
  }, [isConnected, roomData, isJoining, handleCreateRoom]);

  const copyToClipboard = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    if (navigator.share) {
      navigator.share({
        title: "Join my TicTacToe game!",
        text: "Let's play TicTacToe together!",
        url: url,
      });
    } else {
      copyToClipboard();
    }
  };

  // Notify parent when room is ready
  useEffect(() => {
    if (roomData) {
      // Small delay to ensure UI updates
      setTimeout(() => {
        onRoomReady(roomData);
      }, 100);
    }
  }, [roomData, onRoomReady]);

  // Listen for player-joined events to show when both players are ready
  useEffect(() => {
    if (!socket || !roomData) return;

    const handlePlayerJoined = (data: {
      roomId?: string;
      players?: Array<{ id: string }>;
    }) => {
      if (data.roomId === roomData.roomId && data.players) {
        setPlayersCount(data.players.length);
      }
    };

    socket.on("player-joined", handlePlayerJoined);

    return () => {
      socket.off("player-joined", handlePlayerJoined);
    };
  }, [socket, roomData]);

  if (roomData) {
    return (
      <div className="min-h-screen h-screen bg-gradient-to-br from-indigo-950 via-purple-500 to-pink-500 bg-animated flex items-center justify-center p-3 sm:p-4 md:p-6 relative overflow-hidden">
        <AnimatedBackground />
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-2xl border-2 border-white/30 max-w-md w-full relative z-10 menu-entrance mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 drop-shadow-2xl">
              {roomData.isHost ? "Room Created!" : "Room Joined!"}
            </h2>
            {roomData.isHost && (
              <>
                <p className="text-white/90 text-sm sm:text-base mb-4">
                  Share this link with your friend:
                </p>
                <div className="bg-white/10 rounded-lg p-3 mb-4 flex items-center justify-between gap-2">
                  <code className="text-white text-xs sm:text-sm font-mono flex-1 text-left truncate">
                    {roomId}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-300 flex items-center gap-2 text-white text-sm"
                  >
                    {copied ? (
                      <>
                        <FaCheck className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <FaCopy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="w-full py-3 px-6 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-xl text-white font-semibold text-base transition-all duration-300 border-2 border-white/30 hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center gap-2 mb-4"
                >
                  <FaCopy className="w-4 h-4" />
                  <span>Copy Link</span>
                </button>
                <button
                  onClick={shareLink}
                  className="w-full py-3 px-6 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-xl text-white font-semibold text-base transition-all duration-300 border-2 border-white/30 hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center gap-2 mb-4"
                >
                  <FaLink className="w-5 h-5" />
                  <span>Share Link</span>
                </button>
              </>
            )}
            {!roomData.isHost && (
              <p className="text-white/90 text-sm sm:text-base mb-4">
                Waiting for host to start the game...
              </p>
            )}
            <div className="flex items-center justify-center gap-2 text-white/80 text-sm mb-4">
              <FaUsers className="w-4 h-4" />
              <span>Players: {playersCount}/2</span>
            </div>
            {playersCount >= 2 && (
              <>
                <p className="text-green-300 text-sm font-semibold mb-4">
                  Both players ready!{" "}
                  {roomData.isHost
                    ? "Click to start the game"
                    : "Waiting for host to start..."}
                </p>
                {roomData.isHost && onStartGame && (
                  <button
                    onClick={onStartGame}
                    className="w-full py-4 px-6 bg-green-500/80 hover:bg-green-500 backdrop-blur-lg rounded-xl text-white font-semibold text-lg transition-all duration-300 border-2 border-green-400/50 hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center gap-2"
                  >
                    <FaPlay className="w-5 h-5" />
                    <span>Start Game</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen bg-gradient-to-br from-indigo-950 via-purple-500 to-pink-500 bg-animated flex items-center justify-center p-3 sm:p-4 md:p-6 relative overflow-hidden">
      <AnimatedBackground />

      <div className="backdrop-blur-xl bg-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-2xl border-2 border-white/30 max-w-md w-full relative z-10 menu-entrance mx-auto">
        <button
          onClick={onBack}
          className="mb-4 px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-lg text-white font-medium transition-all duration-300 border-2 border-white/30 text-sm hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 drop-shadow-2xl">
            Invite a Friend
          </h2>
          <p className="text-white/90 text-sm sm:text-base mb-6">
            {isConnected
              ? "Create a room or join an existing one"
              : "Connecting to server..."}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-100 text-sm">
            {error}
          </div>
        )}

        {socketError && (
          <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-100 text-sm">
            {socketError}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleCreateRoom}
            disabled={!isConnected || isCreating}
            className="w-full py-4 px-6 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-xl text-white font-semibold text-lg transition-all duration-300 border-2 border-white/30 hover:scale-105 active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FaLink className="w-5 h-5" />
            <span>{isCreating ? "Creating Room..." : "Create Room"}</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-white/70">OR</span>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
              placeholder="Enter Room ID"
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg rounded-xl text-white placeholder-white/50 border-2 border-white/30 focus:border-white/50 focus:outline-none text-center text-lg font-mono"
              maxLength={6}
            />
            <button
              onClick={handleJoinRoom}
              disabled={!isConnected || isJoining || !inputRoomId.trim()}
              className="w-full py-4 px-6 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-xl text-white font-semibold text-lg transition-all duration-300 border-2 border-white/30 hover:scale-105 active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isJoining ? "Joining..." : "Join Room"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
