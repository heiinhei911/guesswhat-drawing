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
  // const { user } = useName();
  // const { room } = useRoom();
  const {
    totalRounds,
    currentRound,
    roundEnd,
    setRoundEnd,
    word,
    turn,
    isTurn,
  } = useRounds();

  // useEffect(() => {
  //   socket.on("room_exists", (roomExists) => {
  //     if (roomExists) {
  //       console.log("game - exists");
  //       isNameEmpty(user);
  //     } else {
  //       console.log("game - room doesnt exists");
  //     }
  //     setLoading(false);
  //   });

  // }, [socket]);

  useEffect(() => {
    socket.on("end_of_round", (matchedWordData) => {
      console.log("end of round");
      const roundEndObj: IRoundEnd = {
        type: matchedWordData.type,
        user: matchedWordData.user,
      };
      setRoundEnd(roundEndObj);
      // setRoom(matchedWordData.room);
      if (matchedWordData.type === "guessed") {
        console.log(`${matchedWordData.user} guessed the word "${word.word}"`);
      } else if (matchedWordData.type === "left") {
        console.log(`${matchedWordData.user} left the room`);
      } else {
        console.log(`${matchedWordData.user} timed out`);
      }
    });
  }, [socket, word]);

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
          <div className={`${styles["game-columns"]} ${styles.head}`}>
            <span>
              Round {currentRound} of {totalRounds}
            </span>
            {isTurn ? (
              <div>
                Your word: <span className={styles.word}>{word.word}</span>
              </div>
            ) : (
              <div>
                <span className={styles.word}>{turn.username}</span>'s turn
              </div>
            )}
            <Timer />
          </div>
          <div className={styles["game-columns"]}>
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
              ? "Round Over!"
              : roundEnd.type === "left"
              ? "Player Left"
              : "Time Out!"}
          </h2>
          {roundEnd.type === "guessed" && (
            <p>
              {roundEnd.user} guessed the word "{word.word}"
            </p>
          )}
        </div>
      )}
    </CanvasProvider>
  );
  // return loading ? (
  //   <div className={styles["game-loading"]}>Loading</div>
  // ) : !roomExists ? (
  //   <div className="">Room Doesn't Exist</div>
  // ) : user ? (
  //   <CanvasProvider>
  //     <div>
  //       <h1>Game</h1>
  //       <button onClick={() => leaveRoom(socket, id)}>Leave Room</button>
  //       <div className={styles["canvas-with-toolbar"]}>
  //         <Canvas id={id} />
  //         <CanvasToolbar />
  //       </div>
  //       <div className={styles["game-chats"]}>
  //         <Chat room={id} user={uuid()} />
  //         {/* <Chat room={id} user={uuid()} /> */}
  //       </div>
  //     </div>
  //   </CanvasProvider>
  // ) : (
  //   <div className={styles["game-name-screen"]}>
  //     <h1>Live Drawing</h1>
  //     <Name
  //       isEmpty={(user) => isNameEmpty(user)}
  //       setGameUser={(user) => setUser(user)}
  //       btn={true}
  //     />
  //   </div>
  // );
};
export default Game;
