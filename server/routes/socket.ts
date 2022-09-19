import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
dotenv.config();
import { io, Socket } from "socket.io-client";
const socketRouter = express.Router();

const socket: Socket = io(
  process.env.ENV === "PRODUCTION"
    ? "https://guesswhat-drawing.herokuapp.com"
    : "http://192.168.68.112:3001"
);
const testUser = "Test User";

// @route GET api/words
// @description Get all words
// @access Public
socketRouter.get("/join", (req: Request, res: Response) => {
  const roomId = req.query.roomid;
  socket.emit("join_room", { room: roomId, user: testUser });
  res.sendStatus(200);
});

socketRouter.get("/send_message", (req: Request, res: Response) => {
  const roomId = req.query.roomid;
  socket.emit("send_chat", {
    room: roomId,
    author: testUser,
    message: "Test Message",
    time: "12:00:00AM",
    type: "chat",
  });
  res.sendStatus(200);
});

export default socketRouter;
