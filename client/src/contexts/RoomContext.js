import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";

const RoomContext = createContext();

const useRoom = () => useContext(RoomContext);

const RoomProvider = ({ room, children }) => {
  const socket = useSocket();
  const [creatorId, setCreatorId] = useState("");
  const isCreator = socket.id === creatorId;

  useEffect(() => {
    socket.on("receive_creator", (creatorId) => {
      setCreatorId(creatorId);
    });
  }, [socket]);

  const value = { room, creatorId, isCreator };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};

export { RoomProvider, useRoom };
