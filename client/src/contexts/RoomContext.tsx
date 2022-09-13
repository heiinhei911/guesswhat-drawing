import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSocket } from "./SocketContext";

type IRoomContext = {
  room: string;
  creatorId: string;
  isCreator: boolean | null;
};

const RoomContext = createContext<IRoomContext>({
  room: "",
  creatorId: "",
  isCreator: null,
});

const useRoom = () => useContext(RoomContext);

const RoomProvider: FC<{ room: string; children: ReactNode }> = ({
  room,
  children,
}) => {
  const socket = useSocket();
  const [creatorId, setCreatorId] = useState<string>("");
  const isCreator = socket.id === creatorId;

  useEffect(() => {
    socket.on("receive_creator", (creatorId) => {
      setCreatorId(creatorId);
    });
  }, [socket]);

  return (
    <RoomContext.Provider value={{ room, creatorId, isCreator }}>
      {children}
    </RoomContext.Provider>
  );
};

export { RoomProvider, useRoom };
