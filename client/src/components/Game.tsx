import { useEffect } from "react";
import { useSocket } from "../contexts/SocketContext";
import { CanvasProvider } from "../contexts/CanvasProperties";
import { useRounds } from "../contexts/RoundContext";
import Canvas from "./Canvas";
import CanvasToolbar from "./CanvasToolbar";
import Chat from "./Chat";
import Timer from "./Timer";
import styles from "./Game.module.scss";
import PlayerList from "./PlayerList";
import { IRoundEnd } from "../contexts/RoundContext";
import { ChatTypes, PlayerListTypes } from "../enums";

const Game = () => {
  const socket = useSocket();
  const {
    totalRounds,
    currentRound,
    roundEnd,
    setRoundEnd,
    word,
    turn,
    isTurn,
    beginGame,
  } = useRounds();

  useEffect(() => {
    socket.on("end_of_round", (roundEndData) => {
      if (beginGame && currentRound > 0) {
        console.log("end of round");
        const roundEndObj: IRoundEnd = {
          type: roundEndData.type,
          user: roundEndData.user,
        };
        setRoundEnd(roundEndObj);
        if (roundEndData.type === "guessed") {
          console.log(`${roundEndData.user} guessed the word "${word.word}"`);
        } else if (
          roundEndData.type === "left" ||
          roundEndData.type === "last"
        ) {
          console.log(`${roundEndData.user} left the room`);
        } else {
          console.log(`${roundEndData.user} timed out`);
        }
      }
    });
  }, [socket, word, beginGame]);

  // useEffect(() => {
  //   console.log("currentround: ", currentRound);
  // }, [currentRound]);

  // useEffect(() => {
  //   console.log("word: ", word.word);
  // }, [word]);

  // useEffect(() => {
  //   console.log("turn: ", turn);
  // }, [turn]);

  return (
    <CanvasProvider>
      <div className={styles.game}>
        <div className={styles.container}>
          <div className={`${styles.columns} ${styles.head}`}>
            <span>
              Round {currentRound} of {totalRounds}
            </span>
            {isTurn ? (
              <div data-testid="turn">
                Your word: <span className={styles.word}>{word.word}</span>
              </div>
            ) : (
              <div data-testid="turn">
                <span className={styles.word}>{turn.username}</span>'s turn
              </div>
            )}
            <Timer />
          </div>
          <div className={styles.columns}>
            <div className={styles.content}>
              <div className={styles["canvas-with-toolbar"]}>
                <Canvas />
                {isTurn && <CanvasToolbar />}
              </div>
            </div>
            <PlayerList type={PlayerListTypes.score} />
          </div>
          <div className={styles.chats}>
            <Chat check={true} type={ChatTypes.guesses} />
            <Chat type={ChatTypes.chat} />
          </div>
        </div>
      </div>
      {roundEnd && typeof roundEnd !== "boolean" && (
        <div className={styles.overlay}>
          <h2>
            {roundEnd.type === "guessed"
              ? "Round's Over!"
              : roundEnd.type === "left" || roundEnd.type === "last"
              ? `${roundEnd.user} left the room.`
              : "Time's Up!"}
          </h2>
          <p>
            {roundEnd.type === "guessed"
              ? `${roundEnd.user} guessed the word "${word.word}"`
              : roundEnd.type === "last"
              ? "You are the only person in the room. Game Over!"
              : roundEnd.type === "left" && "Skipping to the next person"}
          </p>
        </div>
      )}
    </CanvasProvider>
  );
};
export default Game;
