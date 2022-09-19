import { useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useRoom } from "../contexts/RoomContext";
import { useRounds } from "../contexts/RoundContext";
import styles from "./SetRound.module.scss";

const SetRound = () => {
  const socket = useSocket();
  const { room, isCreator } = useRoom();
  const { updateRoundsInfo, setBeginGame } = useRounds();
  const [rounds, setRounds] = useState<number>(1);
  const [minRounds, setMinRounds] = useState<number | null>(1);
  const [duration, setDuration] = useState<number>(1);
  const [error, setError] = useState<string>("");
  const [beginGameDelay, setBeginGameDelay] = useState<boolean>(false);
  const [startGameSeconds, setStartGameSeconds] = useState<number>(5);

  useEffect(() => {
    socket.on("update_player_count", (playerCount) => {
      setMinRounds(playerCount);
    });

    socket.on("receive_stop_game", () => {
      setBeginGameDelay(false);
      // // clearTimeout(startGameDelay);
      // setBeginGame(false);
    });

    socket.on("receive_start_game", (gameData) => {
      updateRoundsInfo(gameData.rounds, gameData.duration);
      setBeginGameDelay(true);
    });
  }, [socket]);

  useEffect(() => {
    if (minRounds) {
      if (rounds < minRounds) {
        setRounds(minRounds);
      }
    }
  }, [minRounds]);

  useEffect(() => {
    let startGameDelay: ReturnType<typeof setTimeout> | null = null;
    let startGameTimer: ReturnType<typeof setInterval> | null = null;
    if (beginGameDelay) {
      startGameTimer = setInterval(() => {
        setStartGameSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
      startGameDelay = setTimeout(() => {
        setBeginGame(true);
      }, 5000);
    } else {
      if (startGameDelay && startGameTimer) {
        clearTimeout(startGameDelay);
        clearInterval(startGameTimer);
        setStartGameSeconds(5);
      }
    }
    return () => {
      if (startGameDelay && startGameTimer) {
        clearTimeout(startGameDelay);
        clearInterval(startGameTimer);
        setStartGameSeconds(5);
      }
    };
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

  const validateRoundInputs = (value: number, type: string) => {
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
              min={minRounds ? minRounds : 1}
              max={10}
              value={rounds}
              disabled={!isCreator || beginGameDelay}
              onChange={(e) =>
                validateRoundInputs(parseInt(e.target.value), "rounds")
              }
              data-testid="no-rounds"
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
              onChange={(e) =>
                validateRoundInputs(parseInt(e.target.value), "duration")
              }
              data-testid="duration-rounds"
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
        ? `Game is starting in ${startGameSeconds} second${
            startGameSeconds > 1 ? "s" : ""
          }`
        : !isCreator &&
          !beginGameDelay &&
          "Waiting for the creator to start the game..."}

      {isCreator && (
        <div className={styles.actions}>
          <button
            className={styles.button}
            onClick={beginGameDelay ? cancelGame : startGame}
            disabled={minRounds ? minRounds < 2 : false}
          >
            {beginGameDelay ? "Cancel" : "Start Game"}
          </button>
        </div>
      )}
      {isCreator && minRounds && minRounds < 2 && (
        <div>
          <span>The Room ID has been copied to your clipboard</span>
          <br></br>
          <span>Invite one more player to start the game!</span>
        </div>
      )}
    </div>
  );
};
export default SetRound;
