import { useState, useEffect, FC, Dispatch, SetStateAction } from "react";
import { useRounds } from "../contexts/RoundContext";
import { useSocket } from "../contexts/SocketContext";
import { useName } from "../contexts/NameContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { joinRoom, leaveRoom } from "../helpers/socket_functions";
import PlayerList from "../components/PlayerList";
import Game from "../components/Game";
import Name from "../components/Name";
import Chat from "../components/Chat";
import SetRound from "../components/SetRound";
import styles from "./WaitRoom.module.scss";
import { LOBBY } from "../styles/_constants";
import EndScreen from "../components/EndScreen";
import { ChatTypes, PlayerListTypes } from "../enums";

interface ILocationState {
  fromHome: boolean;
}

const WaitRoom: FC<{ setId: Dispatch<SetStateAction<string>> }> = ({
  setId,
}) => {
  const socket = useSocket();
  const { id } = useParams();
  const { user } = useName();
  const navigate = useNavigate();
  const location = useLocation();
  const { beginGame, endScreen } = useRounds();
  const fromHome: boolean =
    (location.state as ILocationState)?.fromHome || false;
  const [roomChecked, setRoomChecked] = useState<boolean | null>(null);

  useEffect(() => {
    if (id) {
      setId(id);

      if (fromHome) {
        setRoomChecked(true);
        joinRoom(socket, id, user); // Double join
      } else {
        socket.emit("join_room_check", id);
      }
      // return () => leaveRoom(socket, id);
    }
  }, []);

  useEffect(() => {
    if (!fromHome && user && roomChecked && id) {
      joinRoom(socket, id, user);
    }
  }, [user, roomChecked]);

  useEffect(() => {
    socket.on("room_exists", (roomExists) => {
      if (roomExists) {
        setRoomChecked(true);
      } else {
        console.log("Waitroom - room doesnt exist");
      }
    });
  }, [socket]);

  const returnHome = () => {
    if (id) {
      leaveRoom(socket, id);
      joinRoom(socket, LOBBY);
      navigate("/");
    }
  };

  return (
    <>
      <div className={styles.header}>
        <div className={styles.container}>
          <h1 className={styles.title}>Guess What</h1>
          <div>
            <h2>WaitRoom</h2>
            <button
              className={styles.button}
              onClick={returnHome}
              style={{ backgroundColor: "red" }}
            >
              Leave Room
            </button>
          </div>
        </div>
      </div>
      {endScreen ? (
        <EndScreen returnHome={returnHome} />
      ) : beginGame ? (
        <Game />
      ) : !roomChecked ? (
        <div className={styles["not-exist"]}>
          <div className={styles.container}>
            The room ID {id} doesn't exist!
            <button onClick={returnHome} className={styles.button}>
              Back Home
            </button>
          </div>
        </div>
      ) : user === "" ? (
        <Name btn={true} />
      ) : (
        <div className={styles.waitroom}>
          <div className={styles.container}>
            <div className={styles.content}>
              <Chat type={ChatTypes.chat} />
              <SetRound />
            </div>
            <PlayerList type={PlayerListTypes.player} />
          </div>
        </div>
      )}
    </>
  );
};
export default WaitRoom;
