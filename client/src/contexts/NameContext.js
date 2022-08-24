import { createContext, useContext, useState } from "react";

const NameContext = createContext();

const useName = () => useContext(NameContext);

const NameProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(window.localStorage.getItem("user")) || ""
  );

  const value = { user, setUser };

  return <NameContext.Provider value={value}>{children}</NameContext.Provider>;
};

export { NameProvider, useName };
