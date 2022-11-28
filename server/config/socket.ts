import { Socket, Server } from "socket.io";
import axios from "axios";
import * as dotenv from "dotenv";
import * as interfaces from "./interfaces";
dotenv.config();

const connectSocket = (
  io: Server<interfaces.ClientToServerEvents, interfaces.ServerToClientEvents>
) => {
  io.on("connection", (socket: Socket) => {
    const getClients = (room: string) => io.sockets.adapter.rooms.get(room);

    const removeRoomScoreFromPlayer = (room: string) => {
      delete socket.data[room];
    };

    const cleanWordTurnList = (room: string, id: string) => {
      io.in(room).emit("clean_words_turns", id);
    };

    const randomNumberArray = async (
      size: number,
      push: (interfaces.IOrderList | interfaces.IWordList)[],
      type: string
    ) => {
      const array: (interfaces.IOrderList | interfaces.IWordList)[] = [];
      while (array.length < size) {
        let r = Math.floor(
          Math.random() * (type === "turn" ? size : push.length)
        );
        const value: interfaces.IOrderList | interfaces.IWordList = push[r];

        if (array.indexOf(value) === -1) {
          array.push(value);
        }
      }

      return array;
    };

    const getTurnsOrder = async (room: string, rounds: number) => {
      const clientsList: interfaces.IOrderList[] = [];
      const sockets = await io.in(room).fetchSockets();

      for (const clientSocket of sockets) {
        const clientObj: interfaces.IOrderList = {
          id: clientSocket.id,
          username: clientSocket.data.username,
        };
        clientsList.push(clientObj);
      }

      let randomizedClientsList = await randomNumberArray(
        clientsList.length,
        clientsList,
        "turn"
      );

      while (Math.abs(rounds - randomizedClientsList.length) > 0) {
        let additionalClient =
          clientsList[Math.floor(Math.random() * clientsList.length)];

        while (
          additionalClient ===
          randomizedClientsList[randomizedClientsList.length - 1]
        ) {
          additionalClient =
            clientsList[Math.floor(Math.random() * clientsList.length)];
        }
        randomizedClientsList = [...randomizedClientsList, additionalClient];
      }
      return randomizedClientsList;
    };

    const getRoundWords = async (rounds: number) => {
      try {
        const res = await axios.get(
          process.env.ENV === "PRODUCTION"
            ? "https://guesswhat-drawing.onrender.com/api/words"
            : "http://192.168.68.112:3001/api/words"
        );
        const allWords = res.data;

        return await randomNumberArray(rounds, allWords, "words");
      } catch (err) {
        console.log(err);
      }
    };

    const updatePlayerList = async (room: string, removeSelf = false) => {
      const clients = getClients(room);
      const clientsList: interfaces.IClientsList[] = [];
      const sockets = await io.in(room).fetchSockets();

      for (const clientSocket of sockets) {
        const clientObj: interfaces.IClientsList = {
          id: clientSocket.id,
          username: clientSocket.data.username,
          score:
            typeof clientSocket.data[room] === "number"
              ? clientSocket.data[room]
              : null,
        };

        if (removeSelf) {
          if (clientSocket.id !== socket.id) {
            clientsList.push(clientObj);
          }
        } else {
          clientsList.push(clientObj);
        }
      }

      // if (emit) {
      io.in(room).emit("get_room_clients", {
        total: clients?.size || 0,
        clients: clientsList,
      });
      // } else {
      //   io.in(room).emit("get_clients", clientsList);
      // }
    };

    const setCreator = (room: string) => {
      const roomData: any = getClients(room);
      if (roomData) {
        if (roomData.creator) {
          socket.emit("receive_creator", roomData.creator);
        } else {
          roomData.creator = socket.id;
        }
      }
    };

    console.log("connected ", socket.id);

    // Join/Leave Rooms ---------------------------
    socket.on("join_room_check", (room: string) => {
      socket.emit(
        "room_exists",
        io.sockets.adapter.rooms.has(room)
        // socket.rooms.has(user)
      );
    });

    socket.on("join_room", async (joinRoomData: interfaces.IJoinRoomData) => {
      // const sockets = await io.fetchSockets();

      socket.join(joinRoomData.room);
      updatePlayerList(joinRoomData.room);

      if (joinRoomData.room !== "lobby") {
        const clients = getClients(joinRoomData.room);
        setCreator(joinRoomData.room);

        if (clients) {
          io.in(joinRoomData.room).emit("update_player_count", clients.size);
        }

        if (!socket.data.username) {
          socket.data.username = joinRoomData.user;
        }
      }

      console.log(`User ${socket.id} joined ${joinRoomData.room}`);
    });

    socket.on("leave_room", (room: string) => {
      if (room !== "lobby") {
        updatePlayerList(room, true);
        const clients = getClients(room);
        if (clients) {
          socket.emit("update_player_count", clients.size);
        }

        removeRoomScoreFromPlayer(room);
      }
      socket.leave(room);
      console.log(`User ${socket.id} left ${room}`);
    });

    // Game Logic ---------------------------------
    socket.on("get_players", (room: string) => {
      updatePlayerList(room);
    });

    socket.on("send_start_game", (gameData: interfaces.IGameData) => {
      socket.to(gameData.room).emit("receive_start_game", gameData);
    });

    socket.on("send_stop_game", (room: string) => {
      socket.to(room).emit("receive_stop_game");
    });

    socket.on(
      "send_start_rounds",
      async (startRoundsData: { room: string; totalRounds: number }) => {
        // Get turnsOrder and roundWords
        const order = await getTurnsOrder(
          startRoundsData.room,
          startRoundsData.totalRounds
        );
        const words = await getRoundWords(startRoundsData.totalRounds);

        console.log(order);
        console.log(words);

        // Create score variable in room
        const sockets = await io.in(startRoundsData.room).fetchSockets();

        for (const clientSocket of sockets) {
          clientSocket.data[startRoundsData.room] = 0;
        }

        io.in(startRoundsData.room).emit("receive_start_rounds", {
          room: startRoundsData.room,
          order,
          words,
        });
      }
    );

    // End of Round Types --------------------------
    socket.on(
      "matched_word",
      (matchedWordData: interfaces.IMatchedWordData) => {
        const updatePlayersScore = async () => {
          const sockets = await io.in(matchedWordData.room).fetchSockets();
          const drawerPoint = interfaces.getEnvVar("DRAWER_POINT");
          const guessPoint = interfaces.getEnvVar("GUESSER_POINT");

          for (const clientSocket of sockets) {
            let score = clientSocket.data[matchedWordData.room];
            if (clientSocket.id === matchedWordData.turn) {
              score = score + parseInt(drawerPoint);
            } else if (clientSocket.id === socket.id) {
              score = score + parseInt(guessPoint);
            }
            clientSocket.data[matchedWordData.room] = score;
          }
        };
        updatePlayersScore();
        updatePlayerList(matchedWordData.room);

        io.in(matchedWordData.room).emit("end_of_round", matchedWordData);
      }
    );

    socket.on(
      "skip_player_turn",
      (skipPlayerData: interfaces.ISkipTurnData) => {
        const clients = getClients(skipPlayerData.room);
        const { isTurn, ...playerData } = skipPlayerData;
        if (clients || skipPlayerData.type === "test") {
          if (clients && clients.size <= 1) {
            // Last player in the room
            console.log("last player in the room, ending the game");
            io.in(skipPlayerData.room).emit("last_player_end_game");
            io.in(skipPlayerData.room).emit("end_of_round", {
              ...playerData,
              type: "last",
            });
          } else {
            if (isTurn) {
              // Skip the current turn
              console.log(
                `skipped a turn because player ${skipPlayerData.id} left`
              );
              io.in(skipPlayerData.room).emit("end_of_round", playerData);
            }
            cleanWordTurnList(skipPlayerData.room, skipPlayerData.id);
          }
        }
      }
    );

    socket.on("send_calculate_score", async (room: string) => {
      const calculatePlayerScore = async () => {
        const sockets = await io.in(room).fetchSockets();
        let highest = [{ id: "", username: "", score: 0 }];

        for (const clientSocket of sockets) {
          const clientScore = clientSocket.data[room];
          const clientObj = {
            id: clientSocket.id,
            username: clientSocket.data.username,
            score: clientScore,
          };
          if (clientScore > highest[0].score) {
            highest = [clientObj];
          } else if (clientScore === highest[0].score) {
            let found = false;
            for (let i = 1; i < highest.length; i++) {
              if (highest[i].id === clientSocket.id) {
                found = true;
                break;
              }
            }
            if (!found) {
              highest.push(clientObj);
            }
          }
        }
        return highest;
      };

      io.in(room).emit("receive_calculate_score", await calculatePlayerScore());
    });

    // Canvas Drawing -------------------------------
    socket.on("send_startDrawing", (drawingData: interfaces.IDrawingData) => {
      socket.to(drawingData.room).emit("receive_startDrawing", drawingData);
    });

    socket.on("send_drawing", (drawingData: interfaces.IDrawingData) => {
      socket.to(drawingData.room).emit("receive_drawing", drawingData);
    });

    socket.on("send_finishDrawing", (drawingData: interfaces.IDrawingData) => {
      socket.to(drawingData.room).emit("receive_finishDrawing", drawingData);
    });

    socket.on(
      "send_canvasRef",
      (canvasData: interfaces.ICanvasData | interfaces.ICanvasDataClear) => {
        socket.to(canvasData.room).emit("receive_canvasRef", canvasData);
      }
    );

    // Chat -----------------------------------------
    socket.on("send_chat", (messageData: interfaces.IMessageData) => {
      socket.to(messageData.room).emit("receive_chat", messageData);
    });

    socket.on("send_guess", (messageData: interfaces.IMessageData) => {
      socket.to(messageData.room).emit("receive_guess", messageData);
    });

    // Disconnecting ---------------------------------
    socket.on("disconnecting", (reason: string) => {
      for (const room of socket.rooms) {
        const clients = getClients(room);
        updatePlayerList(room, true);

        if (clients) {
          socket.emit("update_player_count", clients.size - 1);
        }

        removeRoomScoreFromPlayer(room);
      }

      console.log(`${socket.id} is disconnecting. Reason: `, reason);
    });

    socket.on("disconnect", () => {
      console.log("disconnected ", socket.id);
    });
  });
};

export default connectSocket;
