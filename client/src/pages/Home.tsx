import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { useName } from "../contexts/NameContext";
import { joinRoom, leaveRoom } from "../helpers/socket_functions";
import { isEmpty, copyToClipboard } from "../helpers/miscellaneous";
import { LOBBY } from "../styles/_constants";
import Name from "../components/Name";
import styles from "./Home.module.scss";
import { nanoid } from "nanoid";

const Home = () => {
  const socket = useSocket();
  const { user } = useName();
  const navigate = useNavigate();
  const [room, setRoom] = useState<string>("");
  const [roomError, setRoomError] = useState<boolean>(false);
  const [userEmpty, setUserEmpty] = useState<boolean>(true);
  const [homeUserError, setHomeUserError] = useState<boolean>(false);

  useEffect(() => {
    joinRoom(socket, LOBBY);
  }, []);

  useEffect(() => {
    socket.on("room_exists", (roomExists) => {
      if (roomExists && !isEmpty(room)) {
        leaveRoom(socket, LOBBY);
        joinRoom(socket, room, user);
        navigate(room, { state: { fromHome: true } });
      } else {
        console.log("Home - room doesnt exists");
      }
    });
  }, [socket, room]);

  const createNewRoom = () => {
    if (!userEmpty) {
      // Create a random 10-digit room ID
      const newRoomId = nanoid(10);

      leaveRoom(socket, LOBBY);
      joinRoom(socket, newRoomId, user);
      copyToClipboard(newRoomId)
        .then(() => console.log("copied Room ID to clipboard"))
        .catch((err) => {
          console.log(err);
        });
      navigate(newRoomId, { state: { fromHome: true } });

      // socket.emit("send_creator", room);
    } else {
      setHomeUserError(true);
    }
  };

  const joinExistingRoom = () => {
    if (room.length !== 10) {
      return setRoomError(true);
    }

    if (!isEmpty(room) && !userEmpty) {
      socket.emit("join_room_check", room);
    } else {
      setHomeUserError(true);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.home}>
        <h1 className={styles.title}>Guess What</h1>
        <span className={styles.description}>Multiplayer Drawing Game</span>
        <p>
          To start playing, please enter your name below and you can either
          create or join a room.
        </p>
        <p>
          To create a room, simply click the "Create" button without entering a
          room ID.
        </p>
        <p>To Join a room, enter the ID of the room and click "Join".</p>
        <div className={styles.main}>
          <div>
            <label>
              Enter a room ID:
              <input
                type="text"
                className={styles.input}
                placeholder="Room ID..."
                onChange={(e) => {
                  setRoom(e.target.value);
                  setRoomError(false);
                }}
              />
            </label>
            {roomError && <p className={styles.error}>Invalid Room ID</p>}
          </div>
          <hr className={styles.separator} />
          <div>
            <Name
              isEmpty={(name) => {
                setUserEmpty(isEmpty(name));
              }}
              homeUserError={homeUserError}
              setHomeUserError={setHomeUserError}
            />
          </div>
        </div>
        <div className={styles.actions}>
          {/* {createRoom && (
            <button
              className={styles.button}
              onClick={() => setCreateRoom(false)}
              style={{ backgroundColor: "red" }}
            >
              Back
            </button>
          )} */}
          <button
            className={styles.button}
            onClick={createNewRoom}
            disabled={!isEmpty(room)}
          >
            Create
          </button>
          <button
            className={styles.button}
            onClick={joinExistingRoom}
            disabled={isEmpty(room)}
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};
export default Home;
