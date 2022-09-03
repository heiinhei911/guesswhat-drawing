import { useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import { nanoid } from "nanoid";
import styles from "./PlayerList.module.scss";
import { useRoom } from "../contexts/RoomContext";
import { useRounds } from "../contexts/RoundContext";

const PlayerList = ({ type }) => {
  const socket = useSocket();
  const { endScreen } = useRounds();
  const { room, creatorId } = useRoom();
  const [playerCount, setPlayerCount] = useState(0);
  const [players, setPlayers] = useState([]);
  const [highest, setHighest] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socket.emit("get_players", room);
  }, []);

  useEffect(() => {
    const updatePlayerList = (clientsData) => {
      setPlayerCount(clientsData.total);
      setPlayers(clientsData.clients);

      // if (clientsData.clients[0].score) {
      //   clientsData.clients.forEach((client) => {
      //     setLoading(true);
      //     if (highest.length === 0 || client.score > highest[0].score) {
      //       setHighest([client]);
      //     } else if (client.score === highest[0].score) {
      //       let found = false;
      //       for (const player of highest) {
      //         if (player.id === client.id) {
      //           found = true;
      //           break;
      //         }
      //       }
      //       if (!found) setHighest((prevHighest) => [...prevHighest, client]);
      //     }
      //     setLoading(false);
      //   });
      // }
    };

    socket.on("get_room_clients", (clientsData) => {
      updatePlayerList(clientsData);
    });

    socket.on("receive_calculate_score", (highestData) => {
      setLoading(true);
      setHighest(highestData);
      setLoading(false);
    });

    // socket.on("leave_room", (id) => {
    //   console.log(`${id} left the room`);
    // });
  }, [socket]);

  const PlayerList = players.map((player) => (
    <li key={nanoid()}>
      <span className={styles.player}>
        <span>
          {player.username} {player.id === creatorId && "(creator)"}
        </span>
        {type !== "player" && <span>{player.score}</span>}
      </span>
    </li>
  ));

  return (
    <>
      {endScreen && !loading && (
        <h3 className={styles.winner}>
          {highest.length > 1
            ? "It's a tie!"
            : `The winner is ${highest[0].username}!`}
        </h3>
      )}
      <div className={styles.PlayerList}>
        <div className={styles.header}>
          <span>{type !== "player" ? "Scoreboard" : "Player List"}</span>
          <span>{type !== "player" ? "" : playerCount}</span>
        </div>
        <ul className={styles.list}>{PlayerList}</ul>
      </div>
    </>
  );
};
export default PlayerList;
