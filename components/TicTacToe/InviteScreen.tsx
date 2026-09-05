/**
 * Invite Screen Component
 * Manages room creation, joining, lobby state, link sharing, and match countdown
 */

import { useState, useEffect, useCallback } from "react";
import {
  FaLink,
  FaCopy,
  FaCheck,
  FaArrowLeft,
  FaUsers,
  FaPlay,
  FaShareAlt,
  FaTimes,
  FaCircle,
  FaSpinner,
  FaCrown,
  FaUserCheck,
} from "react-icons/fa";
import { AnimatedBackground } from "./AnimatedBackground";
import { RoomData } from "./types";
import { Socket } from "socket.io-client";

interface InviteScreenProps {
  onBack: () => void;
  onRoomReady: (roomData: RoomData) => void;
  onStartGame?: () => void;
  createRoom: () => Promise<RoomData | null>;
  joinRoom: (roomId: string) => Promise<RoomData | null>;
  isConnected: boolean;
  socketError: string | null;
  socket: Socket | null;
  initialRoomId?: string;
}

export const InviteScreen = ({
  onBack,
  onRoomReady,
  onStartGame,
  createRoom,
  joinRoom,
  isConnected,
  socketError,
  socket,
  initialRoomId = "",
}: InviteScreenProps) => {
  const [roomId, setRoomId] = useState<string>("");
  const [inputRoomId, setInputRoomId] = useState<string>(initialRoomId);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [playersCount, setPlayersCount] = useState<number>(1);
  const [hasAttemptedAutoJoin, setHasAttemptedAutoJoin] = useState(false);

  // Handle Room Creation
  const handleCreateRoom = useCallback(async () => {
    if (!isConnected) {
      setError("Connecting to server, please wait...");
      return;
    }
    setIsCreating(true);
    setError(null);

    const data = await createRoom();
    if (data) {
      setRoomData(data);
      setRoomId(data.roomId);
      setPlayersCount(1);
      onRoomReady(data);
    } else {
      setError("Failed to create room. Please try again.");
    }
    setIsCreating(false);
  }, [createRoom, isConnected, onRoomReady]);

  // Handle Joining Room
  const handleJoinRoom = useCallback(
    async (codeToJoin?: string) => {
      const targetCode = (codeToJoin || inputRoomId).trim().toUpperCase();
      if (!targetCode) {
        setError("Please enter a room code");
        return;
      }
      if (!isConnected) {
        setError("Connecting to server, please wait...");
        return;
      }

      setIsJoining(true);
      setError(null);

      const data = await joinRoom(targetCode);
      if (data) {
        setRoomData(data);
        setRoomId(data.roomId);
        setPlayersCount(2);
        onRoomReady(data);
      } else {
        setError(socketError || "Room not found or already full. Please check the code.");
      }
      setIsJoining(false);
    },
    [inputRoomId, isConnected, joinRoom, socketError, onRoomReady]
  );

  // Auto-join if initialRoomId or URL ?room= query param is provided
  useEffect(() => {
    if (hasAttemptedAutoJoin || !isConnected) return;

    let targetRoom = initialRoomId?.trim().toUpperCase();
    if (!targetRoom && typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get("room");
      if (roomParam) {
        targetRoom = roomParam.trim().toUpperCase();
      }
    }

    if (targetRoom && !roomData && !isJoining) {
      setInputRoomId(targetRoom);
      setHasAttemptedAutoJoin(true);
      handleJoinRoom(targetRoom);
    }
  }, [isConnected, initialRoomId, hasAttemptedAutoJoin, roomData, isJoining, handleJoinRoom]);

  // Copy Room Code
  const copyCode = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Copy Full Invite Link
  const copyLink = () => {
    if (!roomId || typeof window === "undefined") return;
    const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Share via Web Share API
  const shareInvite = async () => {
    if (!roomId || typeof window === "undefined") return;
    const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Play TicTacToe Online!",
          text: `Join my TicTacToe game! Room Code: ${roomId}`,
          url: url,
        });
      } catch (err) {
        // User dismissed share dialog or error
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  // Listen for player-joined events to update player count in real-time
  useEffect(() => {
    if (!socket || !roomData) return;

    const handlePlayerJoined = (data: {
      roomId?: string;
      players?: Array<{ id: string; symbol: string; isHost: boolean }>;
    }) => {
      if (data.roomId === roomData.roomId && data.players) {
        setPlayersCount(data.players.length);
      }
    };

    const handlePlayerLeft = () => {
      setPlayersCount(1);
    };

    socket.on("player-joined", handlePlayerJoined);
    socket.on("player-left", handlePlayerLeft);

    return () => {
      socket.off("player-joined", handlePlayerJoined);
      socket.off("player-left", handlePlayerLeft);
    };
  }, [socket, roomData]);

  // ==========================================
  // VIEW 1: LOBBY STATE (Room Created / Joined)
  // ==========================================
  if (roomData) {
    const isHost = roomData.isHost;

    return (
      <div className="min-h-screen h-screen bg-gradient-to-br from-indigo-950 via-purple-500 to-pink-500 bg-animated flex items-center justify-center p-3 sm:p-4 md:p-4 relative overflow-hidden">
        <AnimatedBackground />

        <div className="backdrop-blur-xl bg-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-6 shadow-2xl border-2 border-white/30 max-w-md w-full relative z-10 menu-entrance mx-auto flex flex-col justify-between max-h-[92vh] overflow-y-auto">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onBack}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-lg text-white font-medium transition-all duration-300 border border-white/30 text-xs sm:text-sm hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                <FaArrowLeft className="w-3.5 h-3.5" />
                <span>Leave</span>
              </button>

              <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs text-white">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span>{playersCount}/2 Players</span>
              </div>
            </div>

            <div className="text-center mb-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 drop-shadow-lg">
                {isHost ? "Game Lobby" : "Joined Lobby"}
              </h2>
              <p className="text-white/80 text-xs sm:text-sm">
                {isHost
                  ? "Share the code or link with your friend to play!"
                  : "Connected to room. Waiting for host to start!"}
              </p>
            </div>

            {/* Room Code Card */}
            <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/20 mb-4 text-center">
              <span className="text-xs uppercase tracking-widest text-white/70 block mb-1 font-semibold">
                Room Code
              </span>
              <div className="flex items-center justify-center gap-3 my-1">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-widest text-yellow-300 font-mono drop-shadow-md">
                  {roomId}
                </span>
                <button
                  onClick={copyCode}
                  title="Copy Room Code"
                  className="p-2.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-all active:scale-90 border border-white/30 shadow-md"
                >
                  {copiedCode ? (
                    <FaCheck className="w-4 h-4 text-green-300" />
                  ) : (
                    <FaCopy className="w-4 h-4" />
                  )}
                </button>
              </div>
              {copiedCode && (
                <span className="text-xs text-green-300 font-medium animate-fadeIn">
                  Code copied to clipboard!
                </span>
              )}
            </div>

            {/* Share Actions (Host only) */}
            {isHost && (
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <button
                  onClick={copyLink}
                  className="py-2.5 px-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-white font-medium text-xs sm:text-sm transition-all duration-200 border border-white/30 hover:scale-[1.02] active:scale-95 shadow-md flex items-center justify-center gap-2"
                >
                  {copiedLink ? (
                    <>
                      <FaCheck className="w-4 h-4 text-green-300" />
                      <span>Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <FaLink className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <button
                  onClick={shareInvite}
                  className="py-2.5 px-3 bg-purple-600/50 hover:bg-purple-600/70 backdrop-blur-md rounded-xl text-white font-medium text-xs sm:text-sm transition-all duration-200 border border-purple-400/40 hover:scale-[1.02] active:scale-95 shadow-md flex items-center justify-center gap-2"
                >
                  <FaShareAlt className="w-3.5 h-3.5" />
                  <span>Share Invite</span>
                </button>
              </div>
            )}

            {/* Players Status List */}
            <div className="space-y-2.5 mb-3">
              <div className="text-xs font-semibold text-white/70 uppercase tracking-wider px-1">
                Players
              </div>

              {/* Player 1 (Host - X) */}
              <div className="bg-white/10 rounded-xl p-3 border border-white/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/30 border border-red-400/50 flex items-center justify-center text-red-400 font-bold">
                    <FaTimes className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{isHost ? "You" : "Host"}</span>
                      <FaCrown className="w-3.5 h-3.5 text-yellow-400" />
                    </div>
                    <span className="text-xs text-white/70">Plays as X</span>
                  </div>
                </div>
                <span className="text-xs bg-green-500/20 text-green-300 border border-green-500/40 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <FaUserCheck className="w-3 h-3" />
                  <span>Ready</span>
                </span>
              </div>

              {/* Player 2 (Guest - O) */}
              <div
                className={`rounded-xl p-3 border transition-all ${
                  playersCount >= 2
                    ? "bg-white/10 border-white/20"
                    : "bg-white/5 border-dashed border-white/20"
                } flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                      playersCount >= 2
                        ? "bg-blue-500/30 border border-blue-400/50 text-blue-400"
                        : "bg-white/10 text-white/40"
                    }`}
                  >
                    <FaCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {playersCount >= 2
                        ? !isHost
                          ? "You"
                          : "Friend"
                        : "Waiting for Friend..."}
                    </div>
                    <span className="text-xs text-white/70">Plays as O</span>
                  </div>
                </div>

                {playersCount >= 2 ? (
                  <span className="text-xs bg-green-500/20 text-green-300 border border-green-500/40 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <FaUserCheck className="w-3 h-3" />
                    <span>Connected</span>
                  </span>
                ) : (
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5 animate-pulse">
                    <FaSpinner className="w-2.5 h-2.5 animate-spin" />
                    <span>Waiting...</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Action / Status */}
          <div className="pt-2">
            {playersCount >= 2 ? (
              isHost ? (
                <button
                  onClick={onStartGame}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-base sm:text-lg rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 border border-green-300/40 flex items-center justify-center gap-2 animate-bounce"
                >
                  <FaPlay className="w-4 h-4" />
                  <span>Start Game Now</span>
                </button>
              ) : (
                <div className="text-center p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white text-sm flex items-center justify-center gap-2">
                  <FaSpinner className="w-4 h-4 animate-spin text-green-300" />
                  <span>Waiting for host to start the game...</span>
                </div>
              )
            ) : (
              <div className="text-center p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-white/80 text-xs sm:text-sm flex items-center justify-center gap-2">
                <FaSpinner className="w-3.5 h-3.5 animate-spin text-yellow-300" />
                <span>Waiting for your friend to join using code or link...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: INITIAL SCREEN (Create or Join)
  // ==========================================
  return (
    <div className="min-h-screen h-screen bg-gradient-to-br from-indigo-950 via-purple-500 to-pink-500 bg-animated flex items-center justify-center p-3 sm:p-4 md:p-4 relative overflow-hidden">
      <AnimatedBackground />

      <div className="backdrop-blur-xl bg-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-4 shadow-2xl border-2 border-white/30 max-w-md w-full relative z-10 menu-entrance mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-lg text-white font-medium transition-all duration-300 border border-white/30 text-xs sm:text-sm hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <FaArrowLeft className="w-3.5 h-3.5" />
            <span>Menu</span>
          </button>

          {/* Connection Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              isConnected
                ? "bg-green-500/20 text-green-300 border-green-500/30"
                : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-400" : "bg-yellow-400 animate-ping"
              }`}
            ></span>
            <span>{isConnected ? "Server Ready" : "Connecting..."}</span>
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <FaUsers className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 drop-shadow-lg">
            Play with a Friend
          </h2>
          <p className="text-white/80 text-xs sm:text-sm">
            Host a new match or join your friend's game room
          </p>
        </div>

        {/* Error Banners */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-100 text-xs sm:text-sm text-center">
            {error}
          </div>
        )}
        {/* {socketError && (
          <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-xl text-yellow-100 text-xs sm:text-sm text-center">
            {socketError}
          </div>
        )} */}

        <div className="space-y-4">
          {/* Option 1: Create Room */}
          <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-400"></span>
              <span>Host a Game</span>
            </h3>
            <p className="text-xs text-white/70 mb-3">
              Create a private room and get an invite link to send.
            </p>
            <button
              onClick={handleCreateRoom}
              disabled={!isConnected || isCreating || isJoining}
              className="w-4/6 mx-auto py-1 px-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-sm sm:text-base rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 border border-pink-300/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  <span>Creating Room...</span>
                </>
              ) : (
                <>
                  <FaLink className="w-4 h-4" />
                  <span>Create Room (Host)</span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/20 w-full"></div>
            <span className="bg-transparent px-3 text-xs font-semibold text-white/60 uppercase tracking-widest">
              OR
            </span>
            <div className="border-t border-white/20 w-full"></div>
          </div>

          {/* Option 2: Join Room */}
          <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>Join Friend's Room</span>
            </h3>
            <p className="text-xs text-white/70 mb-3">
              Enter the 6-character room code from your friend.
            </p>

            <div className="space-y-2  flex mx-auto justify-center flex-col">
              <input
                type="text"
                value={inputRoomId}
                onChange={(e) =>
                  setInputRoomId(e.target.value.toUpperCase().slice(0, 6))
                }
                placeholder="ROOM CODE (e.g. A1B2C3)"
                className="w-4/6 mx-auto py-1 px-2 bg-black/20 backdrop-blur-md rounded-xl text-white placeholder-white/40 border border-white/30 focus:border-white/70 focus:outline-none text-center text-sm sm:text-base font-mono tracking-widest font-bold uppercase transition-all"
                maxLength={6}
                disabled={isJoining || isCreating}
              />
              <button
                onClick={() => handleJoinRoom()}
                disabled={
                  !isConnected ||
                  isJoining ||
                  isCreating ||
                  inputRoomId.trim().length < 4
                }
                className="w-4/6 mx-auto py-1 px-2 bg-white/20 hover:bg-white/30 text-white font-bold text-sm sm:text-base rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isJoining ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    <span>Joining Room...</span>
                  </>
                ) : (
                  <>
                    <FaPlay className="w-3.5 h-3.5" />
                    <span>Join Game</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

