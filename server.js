const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Store active game rooms
const rooms = new Map();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Debug: Log all incoming events
    const originalOnevent = socket.onevent;
    socket.onevent = function (packet) {
      const args = packet.data || [];
      console.log("Socket event received:", args[0], args.slice(1));
      originalOnevent.call(this, packet);
    };

    // Create a new room
    socket.on("create-room", (callback) => {
      const roomId = generateRoomId();
      rooms.set(roomId, {
        roomId,
        players: [{ id: socket.id, symbol: "X", isHost: true }],
        board: Array(9).fill(null),
        currentTurn: "X",
        winner: null,
        winningLine: [],
      });

      socket.join(roomId);
      socket.emit("room-created", {
        roomId,
        playerId: socket.id,
        playerSymbol: "X",
        isHost: true,
      });

      if (callback) callback({ roomId, playerId: socket.id, playerSymbol: "X", isHost: true });
      console.log(`Room created: ${roomId} by ${socket.id}`);
    });

    // Join an existing room
    socket.on("join-room", (roomId, callback) => {
      console.log('roomId', roomId)
      const room = rooms.get(roomId);

      if (!room) {
        if (callback) callback({ error: "Room not found" });
        return;
      }

      if (room.players.length >= 2) {
        if (callback) callback({ error: "Room is full" });
        return;
      }

      // Add second player
      const newPlayer = {
        id: socket.id,
        symbol: "O",
        isHost: false,
      };
      room.players.push(newPlayer);

      socket.join(roomId);
      socket.emit("room-joined", {
        roomId,
        playerId: socket.id,
        playerSymbol: "O",
        isHost: false,
      });

      // Notify all players that a player joined
      // When both players are ready, also send the game state
      const eventData = {
        roomId,
        players: room.players,
      };
      
      // If both players are now in the room, include game state
      if (room.players.length === 2) {
        eventData.gameState = {
          board: room.board,
          currentTurn: room.currentTurn,
          winner: room.winner,
          winningLine: room.winningLine,
        };
      }
      
      io.to(roomId).emit("player-joined", eventData);

      if (callback) callback({ roomId, playerId: socket.id, playerSymbol: "O", isHost: false });
      console.log(`Player ${socket.id} joined room: ${roomId}`);
    });

    // Handle game move
    socket.on("make-move", ({ roomId, index, player }) => {
      const room = rooms.get(roomId);

      if (!room) return;

      // Validate move
      if (room.board[index] !== null) return;
      if (room.currentTurn !== player) return;
      if (room.winner) return;

      // Check if it's the player's turn
      const playerData = room.players.find((p) => p.id === socket.id);
      if (!playerData || playerData.symbol !== player) return;

      // Update board
      room.board[index] = player;

      // Check for winner
      const result = checkWinner(room.board);
      if (result.winner) {
        room.winner = result.winner;
        room.winningLine = result.line;
      } else {
        // Switch turn
        room.currentTurn = room.currentTurn === "X" ? "O" : "X";
      }

      // Broadcast move to all players in room
      io.to(roomId).emit("move-made", {
        board: room.board,
        currentTurn: room.currentTurn,
        winner: room.winner,
        winningLine: room.winningLine,
        lastMove: { index, player },
      });
    });

    // Handle game reset
    socket.on("reset-game", ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      room.board = Array(9).fill(null);
      room.currentTurn = "X";
      room.winner = null;
      room.winningLine = [];

      io.to(roomId).emit("game-reset", {
        board: room.board,
        currentTurn: room.currentTurn,
      });
    });

    // Handle game start
    socket.on("start-game", ({ roomId }) => {
      console.log("Server received start-game event", { roomId, socketId: socket.id });
      const room = rooms.get(roomId);
      if (!room) {
        console.log("Room not found:", roomId);
        return;
      }

      // Verify the player is the host
      const playerData = room.players.find((p) => p.id === socket.id);
      console.log("Player data:", playerData, "Room players:", room.players);
      if (!playerData || !playerData.isHost) {
        console.log("Only host can start the game");
        return;
      }

      // Ensure both players are in the room
      if (room.players.length < 2) {
        console.log("Need both players to start the game. Current players:", room.players.length);
        return;
      }

      // Initialize fresh game state
      room.board = Array(9).fill(null);
      room.currentTurn = "X";
      room.winner = null;
      room.winningLine = [];

      // Notify all players that the game has started
      console.log(`Emitting game-started to room: ${roomId}`);
      io.to(roomId).emit("game-started", {
        board: room.board,
        currentTurn: room.currentTurn,
      });
      console.log(`Game started in room: ${roomId}`);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      // Remove player from rooms
      for (const [roomId, room] of rooms.entries()) {
        const playerIndex = room.players.findIndex((p) => p.id === socket.id);
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);
          
          // Notify other players
          socket.to(roomId).emit("player-left", {
            playerId: socket.id,
          });

          // Clean up empty rooms
          if (room.players.length === 0) {
            rooms.delete(roomId);
            console.log(`Room deleted: ${roomId}`);
          }
        }
      }
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

// Generate a random room ID
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Check for winner (same logic as client)
function checkWinner(board) {
  const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6], // diagonals
  ];

  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }

  if (board.every((cell) => cell !== null)) {
    return { winner: "Draw", line: [] };
  }

  return { winner: null, line: [] };
}

