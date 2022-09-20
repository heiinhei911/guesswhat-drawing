import { FC, useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import { nanoid } from "nanoid";
import styles from "./PlayerList.module.scss";
import { useRoom } from "../contexts/RoomContext";
import { useRounds } from "../contexts/RoundContext";
import { IClientsList } from "@backend/interfaces";
import { PlayerListTypes } from "../enums";

const PlayerList: FC<{ type: PlayerListTypes }> = ({ type }) => {
  const socket = useSocket();
  const { endScreen } = useRounds();
  const { room, creatorId } = useRoom();
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [players, setPlayers] = useState<IClientsList[]>([]);
  const [highest, setHighest] = useState<IClientsList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    socket.emit("get_players", room);
  }, []);

  useEffect(() => {
    socket.on("get_room_clients", (clientsData) => {
      setPlayerCount(clientsData.total);
      setPlayers(clientsData.clients);
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
        {type !== PlayerListTypes.player && <span>{player.score}</span>}
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
          <span>
            {type !== PlayerListTypes.player ? "Scoreboard" : "Player List"}
          </span>
          <span>{type !== PlayerListTypes.player ? "" : playerCount}</span>
        </div>
        <ul className={styles.list}>{PlayerList}</ul>
      </div>
    </>
  );
};
export default PlayerList;
