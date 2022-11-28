import { createContext, FC, ReactNode, useContext } from "react";
import { io, Socket } from "socket.io-client";
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@backend/interfaces";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  process.env.REACT_APP_ENV === "PRODUCTION"
    ? "https://guesswhat-drawing.onrender.com"
    : "http://192.168.68.112:3001",
  {
    // withCredentials: true,
    // extraHeaders: {
    //   "my-custom-header": "abcd",
    // },
  }
);

const SocketContext =
  createContext<Socket<ServerToClientEvents, ClientToServerEvents>>(socket);

const useSocket = () => useContext(SocketContext);

const SocketProvider: FC<{ children: ReactNode }> = ({ children }) => (
  <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
);
export { SocketProvider, useSocket };
