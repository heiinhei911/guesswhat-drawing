import {
  createContext,
  useContext,
  useState,
  useEffect,
  FC,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { IWordList, IOrderList } from "@backend/interfaces";
import { useRoom } from "./RoomContext";
import { useSocket } from "./SocketContext";
import { useName } from "./NameContext";

type RoundEndType = boolean | IRoundEnd;

export interface IRoundEnd {
  type: string;
  user?: string;
  username?: string;
}

interface IRoundContext {
  totalRounds: number;
  setTotalRounds: (round: number) => void | Dispatch<SetStateAction<number>>;
  roundDuration: number;
  setRoundDuration: (
    duration: number
  ) => void | Dispatch<SetStateAction<number>>;
  currentRound: number;
  setCurrentRound: (round: number) => void | Dispatch<SetStateAction<number>>;
  beginGame: boolean;
  setBeginGame: (
    beginGame: boolean
  ) => void | Dispatch<SetStateAction<boolean>>;
  roundEnd: RoundEndType;
  setRoundEnd: (
    roundEnd: RoundEndType
  ) => void | Dispatch<SetStateAction<RoundEndType>>;
  endScreen: boolean;
  setEndScreen: (
    endScreen: boolean
  ) => void | Dispatch<SetStateAction<boolean>>;
  updateRoundsInfo: (rounds: number, duration: number) => void;
  word: IOrderList | IWordList;
  turn: IOrderList | IWordList;
  isTurn: boolean;
}

const RoundsContext = createContext<IRoundContext>({
  totalRounds: 0,
  setTotalRounds: (round: number) => {},
  roundDuration: 0,
  setRoundDuration: (duration: number) => {},
  currentRound: 0,
  setCurrentRound: (round: number) => {},
  beginGame: false,
  setBeginGame: (beginGame: boolean) => {},
  roundEnd: false,
  setRoundEnd: (roundEnd: RoundEndType) => {},
  endScreen: false,
  setEndScreen: (endScreen: boolean) => {},
  updateRoundsInfo: (rounds: number, duration: number) => {},
  word: { _id: "", word: "", category: "" },
  turn: { id: "", username: "" },
  isTurn: false,
});

const useRounds = () => useContext(RoundsContext);

const RoundsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const socket = useSocket();
  const { room, isCreator } = useRoom();
  const { user } = useName();
  const [totalRounds, setTotalRounds] = useState<number>(0);
  const [roundDuration, setRoundDuration] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [beginGame, setBeginGame] = useState<boolean>(false);
  const [roundEnd, setRoundEnd] = useState<RoundEndType>(false);
  const [endScreen, setEndScreen] = useState<boolean>(false);

  const [wordsList, setWordsList] = useState<
    (IOrderList | IWordList)[] | undefined
  >([]);
  const [turnOrder, setTurnOrder] = useState<(IOrderList | IWordList)[]>([]);
  const [word, setWord] = useState<IOrderList | IWordList>({
    _id: "",
    word: "",
    category: "",
  });
  const [turn, setTurn] = useState<IOrderList | IWordList>({
    id: "",
    username: "",
  });
  const isTurn = turn.id === socket.id;

  useEffect(() => {
    socket.on("receive_start_rounds", (roundWordData) => {
      setWordsList(roundWordData.words);
      setTurnOrder(roundWordData.order);
    });

    socket.on("update_player_count", () => {
      if (currentRound > 0 && beginGame && turn.id && turn.username) {
        socket.emit("skip_player_turn", {
          room,
          user: isTurn ? turn.username : user,
          id: isTurn ? turn.id : socket.id,
          type: "left",
          isTurn,
        });
      }
    });

    socket.on("last_player_end_game", () => {
      if (beginGame) {
        setCurrentRound(totalRounds);
      }
    });

    socket.on("clean_words_turns", (id: string) => {
      if (wordsList && turnOrder) {
        for (let i = currentRound; i < turnOrder.length; i++) {
          if (turnOrder[i].id === id) {
            wordsList.splice(i, 1);
            turnOrder.splice(i, 1);
          }
        }
        setTotalRounds(turnOrder.length);
      }
    });
  }, [socket, currentRound, isTurn, beginGame, turn, totalRounds]);

  useEffect(() => {
    if (roundEnd) {
      if (currentRound < totalRounds) {
        setTimeout(() => {
          setRoundEnd(false);
          setCurrentRound((prevRound) => prevRound + 1);
        }, 5000);
      } else {
        // Game Ends
        socket.emit("send_calculate_score", room);
        setTimeout(() => {
          setRoundEnd(true);
          setBeginGame(false);
          setEndScreen(true);
          setCurrentRound(0);
        }, 5000);
      }
    }
  }, [roundEnd]);

  // Start first round
  useEffect(() => {
    if (word.word === "" && beginGame) {
      if (isCreator) socket.emit("send_start_rounds", { room, totalRounds });
      setCurrentRound((prevRound) => prevRound + 1);
    }
  }, [word, beginGame]);

  // Set the word and turn for the next Round
  useEffect(() => {
    if (
      currentRound >= 1 &&
      wordsList &&
      wordsList.length > 0 &&
      turnOrder.length > 0
    ) {
      setWord(wordsList[currentRound - 1]);
      setTurn(turnOrder[currentRound - 1]);
    }
  }, [currentRound, wordsList, turnOrder]);

  const updateRoundsInfo = (rounds: number, duration: number) => {
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
    endScreen,
    setEndScreen,
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
