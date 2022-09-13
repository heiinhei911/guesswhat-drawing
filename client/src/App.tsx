import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import styles from "./App.module.scss";
import { SocketProvider } from "./contexts/SocketContext";
import { NameProvider } from "./contexts/NameContext";
import { RoundsProvider } from "./contexts/RoundContext";
import WaitRoom from "./pages/WaitRoom";
import { RoomProvider } from "./contexts/RoomContext";

console.log(process.env.REACT_APP_ENV);

const App = () => {
  // const [mousePosX, setMousePosX] = useState(null);
  // const [mousePosY, setMousePosY] = useState(null);
  const [height, setHeight] = useState<number>(window.innerHeight);
  const [id, setId] = useState<string>("");

  useEffect(() => {
    window.addEventListener("resize", (e) =>
      setHeight((e.target as Window).innerHeight)
    );
    return () =>
      window.removeEventListener("resize", (e) =>
        setHeight((e.target as Window).innerHeight)
      );
  }, []);

  return (
    <SocketProvider>
      <NameProvider>
        <div className={styles.App} style={{ height: height }}>
          <Router>
            <Routes>
              <Route path="/">
                <Route path="/" element={<Home />} />

                <Route
                  path=":id"
                  element={
                    <RoomProvider room={id}>
                      <RoundsProvider>
                        <WaitRoom setId={(id) => setId(id)} />
                      </RoundsProvider>
                    </RoomProvider>
                  }
                />
              </Route>
            </Routes>
          </Router>
        </div>
      </NameProvider>
    </SocketProvider>
  );
};

export default App;
