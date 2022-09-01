import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { io } from "socket.io-client";
import Home from "./pages/Home";
import styles from "./App.module.scss";
import { SocketProvider } from "./contexts/SocketContext";
import { NameProvider } from "./contexts/NameContext";
import { RoundsProvider } from "./contexts/RoundContext";
import WaitRoom from "./pages/WaitRoom";
import { RoomProvider } from "./contexts/RoomContext";

console.log(process.env.REACT_APP_ENV);

const socket = io(
  process.env.REACT_APP_ENV === "PRODUCTION"
    ? "https://guesswhat-drawing.herokuapp.com"
    : "http://192.168.68.107:3001",
  {
    // withCredentials: true,
    // extraHeaders: {
    //   "my-custom-header": "abcd",
    // },
  }
);

const App = () => {
  // const [mousePosX, setMousePosX] = useState(null);
  // const [mousePosY, setMousePosY] = useState(null);
  const [height, setHeight] = useState(window.innerHeight);
  const [id, setId] = useState("");

  useEffect(() => {
    window.addEventListener("resize", (e) => setHeight(e.target.innerHeight));
    return () =>
      window.removeEventListener("resize", (e) =>
        setHeight(e.target.innerHeight)
      );
  }, []);

  return (
    <SocketProvider socket={socket}>
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
