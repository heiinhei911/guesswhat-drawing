import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

interface INameContext {
  user: string;
  setUser: (name: string) => void | Dispatch<SetStateAction<string>>;
}

const NameContext = createContext<INameContext>({
  user: "",
  setUser: (name: string) => {},
});

const useName = () => useContext(NameContext);

const NameProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const userStorage = window.localStorage.getItem("user");
  const [user, setUser] = useState<string>(
    userStorage ? JSON.parse(userStorage) : ""
  );

  return (
    <NameContext.Provider value={{ user, setUser }}>
      {children}
    </NameContext.Provider>
  );
};

export { NameProvider, useName };
