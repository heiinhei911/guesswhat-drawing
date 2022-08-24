import { useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import { nanoid } from "nanoid";
import styles from "./PlayerList.module.scss";
import { useRoom } from "../contexts/RoomContext";

const PlayerList = () => {
  const socket = useSocket();
  const { room, creatorId } = useRoom();
  const [playerCount, setPlayerCount] = useState(0);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    socket.emit("get_players", room);
  }, []);

  useEffect(() => {
    const updatePlayerList = (clientsData) => {
      setPlayerCount(clientsData.total);
      setPlayers(clientsData.clients);
    };

    socket.on("get_room_clients", (clientsData) => {
      updatePlayerList(clientsData);
    });

    // socket.on("leave_room", (id) => {
    //   console.log(`${id} left the room`);
    // });
  }, [socket]);

  const playerList = players.map((player) => (
    <li key={nanoid()}>
      {player.username} {player.id === creatorId && "(creator)"}
    </li>
  ));

  return (
    <div className={styles.playerlist}>
      <div className={styles.header}>
        <span>Player List</span>
        <span>{playerCount}</span>
      </div>
      <ul className={styles.list}>{playerList}</ul>
    </div>
  );
};
export default PlayerList;
