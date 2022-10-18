import express, { Request, Response } from "express";
import { io, Socket } from "socket.io-client";
const socketRouter = express.Router();

const socket: Socket = io("http://localhost:3001");
const testUser = "Test User";

// @route GET /join
// @description Join a room with a given room ID
// @access Public
socketRouter.get("/join", (req: Request, res: Response) => {
  const roomId = req.query.roomid;
  socket.emit("join_room", { room: roomId, user: testUser });
  res.sendStatus(200);
});

// @route GET /leave
// @description Leave the room that a user is currently in
// @access Public
socketRouter.get("/leave", (req: Request, res: Response) => {
  const roomId = req.query.roomid;
  socket.emit("leave_room", roomId);
  res.sendStatus(200);
});

// @route GET /send_message
// @description send a test message in a room
// @access Public
socketRouter.get("/send_message", (req: Request, res: Response) => {
  const roomId = req.query.roomid;
  const type = req.query.type;
  socket.emit("send_chat", {
    room: roomId,
    author: testUser,
    message: "Test Message",
    time: "12:00:00AM",
    type,
  });
  res.sendStatus(200);
});

// @route GET /start_game
// @description start a game in a room
// @access Public
socketRouter.get("/start_game", (req: Request, res: Response) => {
  const roomId = req.query.roomid;
  socket.emit("send_start_game", { room: roomId, rounds: 5, duration: 1 });
  res.sendStatus(200);
});

// @route GET /skip
// @description skip a turn in a room
// @access Public
socketRouter.get("/skip", (req: Request, res: Response) => {
  const roomId = req.query.roomid;
  socket.emit("skip_player_turn", {
    room: roomId,
    user: testUser,
    id: socket.id,
    type: "test",
    isTurn: true,
  });
  res.sendStatus(200);
});

export default socketRouter;
