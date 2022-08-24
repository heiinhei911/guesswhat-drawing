import { createContext, useContext } from "react";

const SocketContext = createContext();

const useSocket = () => useContext(SocketContext);

const SocketProvider = ({ socket, children }) => {
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export { SocketProvider, useSocket };
