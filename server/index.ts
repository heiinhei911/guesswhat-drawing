import express, { Request, Response } from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import * as dotenv from "dotenv";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "./config/interfaces";
import connectSocket from "./config/socket";
import connectDB from "./config/db";
import router from "./routes/words";
const app = express();
app.use(cors());
const server = http.createServer(app);
dotenv.config();
const port = process.env.PORT || 3001;

app.get("/", (req: Request, res: Response) => res.send("Hello world"));

app.use("/api/words", router);

server.listen(port, () => {
  console.log(`Server running on ${port}`);
});

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: "*",
    // process.env.ENV === "PRODUCTION"
    //   ? "https://guesswhat-drawing.herokuapp.com/*"
    //   : "http://100.65.192.240:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
    // credentials: true,
  },
});

connectDB();
connectSocket(io);
