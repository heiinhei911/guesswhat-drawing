import * as dotenv from "dotenv";
dotenv.config();

enum ChatTypes {
  chat,
  guesses,
}

interface IRoom {
  room: string;
}

interface IJoinRoomData extends IRoom {
  user: string;
}

interface IGameData extends IRoom {
  rounds: number;
  duration: number;
}

interface IMessageData extends IRoom {
  author: string;
  message: string;
  time: string;
  type: ChatTypes;
}

interface IMatchedWordData extends IRoom {
  user: string;
  turn: string;
  type: string;
}

interface IPlayerData extends IRoom {
  id: string;
  user: string;
  type: string;
}

interface IClientsList {
  id: string;
  username: string;
  score: number | null;
}

interface IOrderList {
  id: string;
  username: string;
  word?: string;
}

interface IWordList {
  id?: string;
  _id: string;
  word: string;
  category: string;
  username?: string;
}

interface ICanvasData extends IRoom {
  ctxRef: {
    strokeStyle: string | CanvasGradient | CanvasPattern;
    lineWidth: number;
    lineDash: string;
  };
  mode: string;
}

interface ICanvasDataClear extends IRoom {
  clear: boolean;
}

interface IGetClients {
  creator?: string;
}

interface IDrawingData extends IRoom {
  target: {
    offsetLeft: number;
    offsetTop: number;
  };
  nativeEvent: {
    offsetX?: number;
    offsetY?: number;
    changedTouches?: [{ pageX: number; pageY: number }];
  };
  scaleIndex: number;
}

interface IRoundData extends IRoom {
  order: (IOrderList | IWordList)[];
  words: (IOrderList | IWordList)[] | undefined;
}

interface ISkipTurnData extends IRoom, IPlayerData {
  isTurn: boolean;
}

interface ClientToServerEvents {
  join_room_check: (room: string) => void;
  join_room: (joinRoomData: IJoinRoomData) => void;
  leave_room: (room: string) => void;
  get_players: (room: string) => void;
  send_start_game: (gameData: IGameData) => void;
  send_stop_game: (room: string) => void;
  send_start_rounds: (startRoundData: {
    room: string;
    totalRounds: number;
  }) => void;
  matched_word: (matchedWordData: IMatchedWordData) => void;
  skip_player_turn: (skipPlayerData: ISkipTurnData) => void;
  send_calculate_score: (room: string) => void;
  send_startDrawing: (drawingData: IDrawingData) => void;
  send_drawing: (drawingData: IDrawingData) => void;
  send_finishDrawing: (drawingData: IDrawingData) => void;
  send_canvasRef: (canvasData: ICanvasData | ICanvasDataClear) => void;
  send_chat: (messageData: IMessageData) => void;
  send_guess: (messageData: IMessageData) => void;
  disconnecting: (reason: string) => void;
  disconnect: () => void;
}

interface ServerToClientEvents {
  get_room_clients: (clientsData: {
    total: number;
    clients: IClientsList[];
  }) => void;
  clean_words_turns: (id: string) => void;
  receive_creator: (creator: string) => void;
  room_exists: (exists: boolean) => void;
  update_player_count: (getClients: number | null) => void;
  left_room: () => void;
  receive_start_game: (gameData: IGameData) => void;
  receive_stop_game: () => void;
  receive_start_rounds: (roundData: IRoundData) => void;
  end_of_round: (roundEndData: IPlayerData | IMatchedWordData) => void;
  last_player_end_game: () => void;
  receive_calculate_score: (scoreData: IClientsList[]) => void;
  receive_startDrawing: (drawingData: IDrawingData) => void;
  receive_drawing: (drawingData: IDrawingData) => void;
  receive_finishDrawing: (drawingData: IDrawingData) => void;
  receive_canvasRef: (canvasData: ICanvasData & ICanvasDataClear) => void;
  receive_chat: (messageData: IMessageData) => void;
  receive_guess: (messageData: IMessageData) => void;
}

const getEnvVar = (name: string) => {
  const envVar: string = process.env[name] || "";

  if (envVar === "") {
    throw new Error(`ENV variable "${envVar}" is undefined`);
  }
  return envVar;
};

export {
  IJoinRoomData,
  IPlayerData,
  IGameData,
  IDrawingData,
  ICanvasData,
  ICanvasDataClear,
  IMessageData,
  IMatchedWordData,
  IClientsList,
  IOrderList,
  IWordList,
  IRoundData,
  ISkipTurnData,
  IGetClients,
  ClientToServerEvents,
  ServerToClientEvents,
  getEnvVar,
};
