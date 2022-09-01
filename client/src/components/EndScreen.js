import styles from "./EndScreen.module.scss";
import PlayerList from "./PlayerList";

const EndScreen = ({ returnHome }) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Game Over!</h2>
      <div className={styles.scoreboard}>
        <PlayerList type="finalscore" />
      </div>
      <div className={styles.actions}>
        <button
          className={styles.button}
          onClick={returnHome}
          style={{ backgroundColor: "red" }}
        >
          Return to Lobby
        </button>
      </div>
    </div>
  );
};
export default EndScreen;
