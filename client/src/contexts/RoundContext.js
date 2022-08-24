import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRoom } from "./RoomContext";
import { useSocket } from "./SocketContext";
import { joinRoom, leaveRoom } from "../helpers/socket_functions";
import { LOBBY } from "../styles/_constants";

const RoundsContext = createContext();

const useRounds = () => useContext(RoundsContext);

const RoundsProvider = ({ children }) => {
  const socket = useSocket();
  const { room, isCreator, user } = useRoom();
  const navigate = useNavigate();
  const [totalRounds, setTotalRounds] = useState(0);
  const [roundDuration, setRoundDuration] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [beginGame, setBeginGame] = useState(false);
  const [roundEnd, setRoundEnd] = useState(false);

  const [wordsList, setWordsList] = useState([]);
  const [turnOrder, setTurnOrder] = useState([]);
  const [word, setWord] = useState({});
  const [turn, setTurn] = useState("");
  const isTurn = turn === socket.id;

  useEffect(() => {
    socket.on("receive_start_rounds", (roundWordData) => {
      setWordsList(roundWordData.words);
      setTurnOrder(roundWordData.order);
      // setUsedWords(roundWordData.usedWords);
    });

    // socket.on("update_player_count", () => {
    //   if (currentRound > 0 && isTurn) {
    //     socket.emit("player_left", { room, user, type: "left" });
    //   }
    // });
  }, [socket]);

  useEffect(() => {
    if (roundEnd) {
      if (currentRound < totalRounds) {
        setTimeout(() => {
          setRoundEnd(false);
          setCurrentRound((prevRound) => prevRound + 1);
        }, 5000);
      } else {
        // Game Ends
        setTimeout(() => {
          setRoundEnd(true);
          setBeginGame(false);
          leaveRoom(socket, room);
          joinRoom(socket, LOBBY);
          navigate("/");
        }, 5000);
      }
    }
  }, [roundEnd]);

  // Start first round
  useEffect(() => {
    if (Object.keys(word).length === 0 && beginGame) {
      if (isCreator) socket.emit("send_start_rounds", { room, totalRounds });
      setCurrentRound((prevRound) => prevRound + 1);
    }
  }, [word, beginGame]);

  // Next Round
  useEffect(() => {
    if (currentRound >= 1 && wordsList.length > 0 && turnOrder.length > 0) {
      // socket.emit("send_start_rounds", { room, usedWords });
      setWord(wordsList[currentRound - 1]);
      setTurn(turnOrder[currentRound - 1]);
      console.log("word:", word);
      console.log("turn:", turn);
    }
  }, [currentRound, wordsList, turnOrder]);

  const updateRoundsInfo = (rounds, duration) => {
    setTotalRounds(rounds);
    setRoundDuration(duration);
  };

  const value = {
    totalRounds,
    setTotalRounds,
    roundDuration,
    setRoundDuration,
    currentRound,
    setCurrentRound,
    beginGame,
    setBeginGame,
    roundEnd,
    setRoundEnd,
    updateRoundsInfo,
    word,
    turn,
    isTurn,
  };
  return (
    <RoundsContext.Provider value={value}>{children}</RoundsContext.Provider>
  );
};

export { RoundsProvider, useRounds };
