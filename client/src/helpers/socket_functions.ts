import { Socket } from "socket.io-client";
import { LOBBY } from "../styles/_constants";
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@backend/interfaces";

const joinRoom = (
  socket: Socket<ServerToClientEvents, ClientToServerEvents>,
  room: string,
  user = ""
) => {
  if ((user !== "" && room !== "") || room === LOBBY) {
    socket.emit("join_room", { room, user });
  }
  // if (user === "") console.log("no user name");
};

const leaveRoom = (
  socket: Socket<ServerToClientEvents, ClientToServerEvents>,
  room: string
) => {
  socket.emit("leave_room", room);
};

export { joinRoom, leaveRoom };
