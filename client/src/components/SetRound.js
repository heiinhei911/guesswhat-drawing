import { useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useRoom } from "../contexts/RoomContext";
import { useRounds } from "../contexts/RoundContext";
// import { leaveRoom } from "../helpers/socket_functions";
import styles from "./SetRound.module.scss";

const SetRound = () => {
  const socket = useSocket();
  const { room, isCreator } = useRoom();
  const { updateRoundsInfo, setBeginGame } = useRounds();
  // const navigate = useNavigate();
  const [rounds, setRounds] = useState(1);
  const [minRounds, setMinRounds] = useState(1);
  const [duration, setDuration] = useState(1);
  const [error, setError] = useState("");
  const [beginGameDelay, setBeginGameDelay] = useState(false);

  useEffect(() => {
    socket.on("update_player_count", (playerCount) => {
      setMinRounds(playerCount);
    });

    socket.on("receive_stop_game", () => {
      setBeginGameDelay(false);
      // // clearTimeout(startGameTimer);
      // setBeginGame(false);
    });

    socket.on("receive_start_game", (gameData) => {
      updateRoundsInfo(gameData.rounds, gameData.duration);
      setBeginGameDelay(true);
    });
  }, [socket]);

  useEffect(() => {
    if (rounds < minRounds) {
      setRounds(minRounds);
    }
  }, [minRounds]);

  useEffect(() => {
    let startGameTimer = null;
    if (beginGameDelay) {
      startGameTimer = setTimeout(() => {
        setBeginGame(true);
      }, 5000);
    } else {
      clearTimeout(startGameTimer);
    }
    return () => clearTimeout(startGameTimer);
  }, [beginGameDelay]);

  const startGame = () => {
    updateRoundsInfo(rounds, duration);
    socket.emit("send_start_game", { room, rounds, duration });
    setBeginGameDelay(true);
  };

  const cancelGame = () => {
    socket.emit("send_stop_game", room);
    setBeginGameDelay(false);
  };

  // const exitRoom = () => {
  //   leaveRoom(socket, room);
  //   navigate("/");
  // };

  const validateRoundInputs = (value, type) => {
    if (type === "rounds") {
      if (value >= 1 && value <= 10) {
        setRounds(value);
      } else {
        setError(type);
      }
      //   setTotalRounds(value);
    } else {
      if (value >= 1 && value <= 5) {
        setDuration(value);
      } else {
        setError(type);
      }
      //   setRoundDuration(value);
    }
  };

  return (
    <div className={styles.rounds}>
      {isCreator && (
        <div className={styles.settings}>
          <span>Game Settings:</span>
          <div className={styles.round}>
            <span>Number of round(s):</span>
            <input
              type="number"
              min={minRounds}
              max={10}
              value={rounds}
              disabled={!isCreator || beginGameDelay}
              onChange={(e) => validateRoundInputs(e.target.value, "rounds")}
            />
            {error === "rounds" && (
              <span className={styles.error}>
                Rounds must be between 1 and 10
              </span>
            )}
          </div>
          <div className={styles.duration}>
            <span>Duration of each round (in minute):</span>
            <input
              type="number"
              min={1}
              max={5}
              value={duration}
              disabled={!isCreator || beginGameDelay}
              onChange={(e) => validateRoundInputs(e.target.value, "duration")}
            />
            {error === "duration" && (
              <span className={styles.error}>
                Duration must be between 1 and 5 minutes
              </span>
            )}
          </div>
        </div>
      )}

      {beginGameDelay
        ? "Game is starting in 5 secs"
        : !isCreator &&
          !beginGameDelay &&
          "Waiting for the creator to start the game..."}

      {isCreator && (
        <div className={styles.actions}>
          <button
            className={styles.button}
            onClick={beginGameDelay ? cancelGame : startGame}
            disabled={minRounds < 2}
          >
            {beginGameDelay ? "Cancel" : "Start Game"}
          </button>
        </div>
      )}
      {isCreator && minRounds < 2 && (
        <span>Invite one more person to start the game!</span>
      )}
    </div>
  );
};
export default SetRound;
